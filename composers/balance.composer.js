import {Composer} from 'telegraf';
import {getAccount} from '../db/controllers/accountController.js';
import {getTransactions} from '../db/controllers/transactionController.js';
import {createControlPoint} from '../utils/eventCreator.js';
import {checkUserPermission} from "../utils/permissionManager.js";
import {permissionsEnum} from "../utils/permissionsEmum.js";
import {filter} from "../utils/filterCommandMessages.js";
import {pool} from "../db/db.js";

const composer = new Composer();
const TELEGRAM_LETTER_LENGTH = 3;

composer.use(filter("balance-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);

        if (!userAccount) {
            throw "Указанный аккаунт не существует в системе";
        }

        const currencies = ctx.session.availableCurrencies.map(c => c.name);

        let mainText = [`${ctx.t("balance")}:<b>\n`];

        const client = await pool.connect();

        const balances = await createControlPoint(client, ctx.session.project.id);

        client.release();

        if (!balances) {
            throw "Контрольная точка не была создана";
        }

        const mainBalance = Object.keys(balances).reduce((acc, cur) => {acc += balances[cur]; return acc; }, 0);

        if(mainBalance === 0) {
            mainText.splice(0, 1, `<b>${ctx.t("main-zero-balance")}`);
        } else {
            const calculatedBalances = calculateAndFormatBalances(balances, currencies);

            const calculatedBalancesLengths = Object.values(calculatedBalances).map(b => b.length);

            const balancesMaxLength = Math.max(...calculatedBalancesLengths);

            const kassBalance = Object.values(balances).reduce((mainSum, balance) => {
                return mainSum += balance;
            }, 0);

            for (let i = 0; i < currencies.length; i += 2) {
                if (i + 1 < currencies.length) {
                    if(mainText.length === 1)
                        mainText.push(`${calculatedBalances[currencies[i]]}\t${calculatedBalances[currencies[i + 1]]}`);
                    else
                        mainText.push(`${padTextIfNeeded(balancesMaxLength,
                            calculatedBalances[currencies[i]])}\t${calculatedBalances[currencies[i + 1]]}`);
                } else {
                    mainText.push(`${calculatedBalances[currencies[i]]}\n`);
                }
            }
        }

        mainText[mainText.length - 1] += "</b>";

        await ctx.replyWithHTML(mainText.join("\n"));
    } catch (e) {
        console.error("Во время получения общего баланса возникла ошибка:", e);
        await ctx.reply(
            ctx.t("main-balance-error")
        );
    }
}));

/**
 * Формирует объект балансов с форматированными балансами по каждой валюте.
 *
 * @param {object} balances - Объект с балансами по каждой валюте.
 * @param {string[]} currencies - Объект с каждой валютой.
 * @returns {object} Объект с отформатированными балансами по каждой валюте.
 */
const calculateAndFormatBalances = (balances, currencies) =>
    currencies.reduce((result, currency) => {
        result[currency] = formatBalanceText(balances[currency], currency);
        return result;
    }, {});

/**
 * Форматирует баланс в строку с валютой.
 *
 * @param {number} balance - Баланс.
 * @param {string} currency - Валюта.
 * @returns {string} Отформатированная строка с балансом и валютой.
 */
const formatBalanceText = (balance, currency) =>
    balance !== 0 ? balance.toLocaleString('de', {maximumFractionDigits: 2}) + ` ${extractCurrencySign(currency)}` : '';

/**
 * Извлекает валютный знак из строки с валютой.
 *
 * @param {string} currencyString - Строка валюты.
 * @returns {string} Валютный знак.
 */
const extractCurrencySign = (currencyString) => {
    const match = currencyString.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
};

/**
 * Дополняет строку необходимым кол-вом пробелов для соответствия максимальной длине.
 *
 * @param {number} balancesMaxLength - Максимальная длинна.
 * @param {string} text - Текст.
 * @returns {string} Дополненная строка.
 */
const padTextIfNeeded = (balancesMaxLength, text) => {
    return text !== "" ? text.padEnd((balancesMaxLength * TELEGRAM_LETTER_LENGTH) / 2) : "";
};

/**
 * Форматирует баланс по определенному пользователю и валюте.
 *
 * @param {object} balances - Объект с балансами по каждой валюте и каждому пользователю.
 * @param {number} userIndex - Индекс пользователя.
 * @param {string} currency - Валюта.
 * @returns {string} Баланс по определенному пользователю и валюте.
 */
const getBalanceText = (balances, userIndex, currency) => {
    const mainBalance = balances[currency];

    return mainBalance !== 0 ?
        `${mainBalance.toLocaleString("de", {maximumFractionDigits: 2})} ` + `${extractCurrencySign(currency)}`
        : "";
};

export default composer;