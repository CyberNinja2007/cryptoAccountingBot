import {Composer} from 'telegraf';
import {getAccount} from '../db/controllers/accountController.js';
import {getTransactions} from '../db/controllers/transactionController.js';
import {getUsers} from '../db/controllers/userController.js';
import {createControlPoint} from '../utils/eventCreator.js';
import {checkIfUserOperator, checkUserPermission} from "../utils/permissionManager.js";
import {permissionsEnum} from "../utils/permissionsEmum.js";
import {filter} from "../utils/filterCommandMessages.js";
import {pool} from "../db/db.js";

const composer = new Composer();
const TELEGRAM_LETTER_LENGTH = 3;

composer.use(filter("main-balance-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);

        if (!userAccount) {
            throw "Указанный аккаунт не существует в системе";
        }

        let transactions = await getTransactions(ctx.session.project.id);
        const getAllDataAllowed = await checkUserPermission(ctx.session.user.id, ctx.session.project.id, permissionsEnum["getAllInfo"]);
        transactions = getAllDataAllowed ? transactions : transactions.filter(t => t.user_id === ctx.session.user.id);
        const currencies = ctx.session.availableCurrencies.map(c => c.name);

        let mainText = [`${ctx.t("balance")}:<b>\n`];

        let users = await getUsers();
        const allowedUsers = await Promise.all(users.map(async u =>
            await checkIfUserOperator(u.id, ctx.session.project.id)))
        users = users.filter(
            (user, index) => {
                return allowedUsers[index] && user.status !== "off"
            }
        );

        const usersNameMaxLength = Math.max(
            ...users.map((user) => user.name.length)
        );

        let balances = users.map(() =>
            currencies.reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {}));

        processTransactions(balances, users, transactions);

        if(!getAllDataAllowed){
            const userIndex = users.findIndex(u => u.id === ctx.session.user.id);
            const userBalance = balances[userIndex];
            balances = [userBalance];
            users = users.filter(user => user.id === ctx.session.user.id);
        }

        const calculatedBalances = calculateAndFormatBalances(balances, currencies);

        const calculatedBalancesLengths = Object.values(calculatedBalances).map(b => b.length);

        const balancesMaxLength = Math.max(...calculatedBalancesLengths);

        const kassBalance = Object.values(balances).reduce((mainSum, userBalance) => {
            const userBalanceValues = Object.values(userBalance);

            const userBalanceSum = userBalanceValues.reduce((balanceSum, balance) =>
                balanceSum += balance, 0);

            return mainSum += userBalanceSum;
        }, 0);

        if (kassBalance === 0) {
            mainText.splice(0, 1, `<b>${ctx.t("main-zero-balance")}`);
        } else {
            users.forEach((user, userIndex) => {
                const userText = [];
                const userNamePadLength = Math.max(usersNameMaxLength + TELEGRAM_LETTER_LENGTH + 2,
                    usersNameMaxLength + (usersNameMaxLength - user.name.length - 2) * TELEGRAM_LETTER_LENGTH);
                const userNameText = `${user.name}: `.padEnd(userNamePadLength);
                const balanceText = currencies.map(currency => getBalanceText(balances, userIndex, currency)).join("    ");

                if (!balanceText.trim()) {
                    userText.push(`${userNameText} ${ctx.t("main-zero-balance")}`);
                } else {
                    userText.push(`${userNameText} ${balanceText}`);
                }

                userText.splice(0, 0, " ");

                mainText.push(userText.join("\n"));
            });

            const maxLength = Math.max(...mainText.map((line) => line.length));
            const divider = "—".repeat(maxLength / 4);
            const indexOfDivider = mainText.findIndex((string) =>
                string.includes("—")
            );
            mainText.splice(indexOfDivider, 1, divider);
        }

        mainText[mainText.length - 1] += "</b>";

        await ctx.replyWithHTML(mainText.join("\n"));

        const client = await pool.connect();

        const isControlPointCreated = await createControlPoint(client, ctx.session.project.id);

        client.release();

        if (!isControlPointCreated) {
            throw "Контрольная точка не была создана";
        }
    } catch (e) {
        console.error("Во время получения общего баланса возникла ошибка:", e);
        await ctx.reply(
            ctx.t("main-balance-error")
        );
    }
}));

/**
 * Обрабатывает все транзакции и обновляет балансы.
 *
 * @param {object[]} balances - Объект с балансами по каждой валюте.
 * @param {User[]} users - Пользователи.
 * @param {Transaction[]} transactions - Транзакции.
 */
const processTransactions = (balances, users, transactions) => {
    for (const transaction of transactions) {
        processTransaction(balances, users, transaction);
    }
};

/**
 * Обрабатывает транзакцию и обновляет балансы.
 *
 * @param {object[]} balances - Объект с балансами по каждой валюте.
 * @param {User[]} users - Пользователи.
 * @param {Transaction} transaction - Транзакция.
 */
const processTransaction = (balances, users, transaction) => {
    const transaction_user_index = users.findIndex(user => user.id === transaction.user_id);

    balances[transaction_user_index][transaction.currency] += (transaction.type === 'in' ? 1 : -1) * transaction.amount;
};

/**
 * Формирует объект балансов с форматированными балансами по каждой валюте.
 *
 * @param {object[]} balances - Балансы по каждой валюте.
 * @param {Currency[]} currencies - Валюты.
 * @returns {object} Объект с отформатированными балансами по каждой валюте.
 */
const calculateAndFormatBalances = (balances, currencies) =>
    currencies.reduce((result, currency) => {
        result[currency] = formatBalanceText(calculateBalance(balances, currency), currency);
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
 * Считает общий баланс.
 *
 * @param {object[]} balances - Объект с балансами по каждой валюте.
 * @param {string} currency - Валюта.
 * @returns {number} Баланс.
 */
const calculateBalance = (balances, currency) =>
    balances.reduce((balance, userBalance) =>
        balance += userBalance[currency], 0);

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
 * @param {object[]} balances - Объект с балансами по каждой валюте и каждому пользователю.
 * @param {number} userIndex - Индекс пользователя.
 * @param {string} currency - Валюта.
 * @returns {string} Баланс по определенному пользователю и валюте.
 */
const getBalanceText = (balances, userIndex, currency) => {
    const mainBalance = userIndex !== -1 ?
        balances[userIndex][currency] :
        (Object.values(balances).reduce((mainSum, userBalance) =>
            mainSum += userBalance[currency], 0));

    return mainBalance !== 0 ?
        `${mainBalance.toLocaleString("de", {maximumFractionDigits: 2})} ` + `${extractCurrencySign(currency)}`
        : "";
};

export default composer;