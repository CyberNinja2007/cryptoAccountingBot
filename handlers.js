import {createMainMenuKeyboard, currencyKeyboard, exitKeyboard,} from './keyboards.js';
import {Markup} from 'telegraf';
import {getTransactions} from './db/controllers/transactionController.js';
import {calcBalance} from './utils/kassBotMath/math.js';
import {getInfoAboutTransactionByHash} from './utils/cryptoTransactionsManager.js';
import {countProjectsWithPermissions, getUserProjectPermissions} from "./utils/permissionManager.js";
import {getAccount} from "./db/controllers/accountController.js";

/**
 * Обрабатывает запрос на выбор валюты транзакции.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleAskCurrency = async (ctx) => {
    try {
        if(ctx.session.availableCurrencies.length > 1) {
            await ctx.replyWithHTML(ctx.t("input-currency"), currencyKeyboard(ctx, ctx.session.availableCurrencies));
            return ctx.wizard.next();
        } else {
            ctx.wizard.state.currency = ctx.session.availableCurrencies[0];
            ctx.wizard.cursor += 2;
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Обрабатывает выбор пользователя валюты транзакции.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleCurrencyOption = async (ctx) => {
    try {
        const currency = ctx.message.text;

        const currIndex = ctx.session.availableCurrencies.findIndex((curr) => curr.name === currency);

        if (currIndex === -1 || ctx.wizard.state.currency) {
            ctx.reply(ctx.t("input-error-currency"));
            ctx.wizard.state.currency = undefined;

            ctx.wizard.cursor--;
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }

        ctx.wizard.state.currency = ctx.session.availableCurrencies[currIndex];

        await ctx.replyWithHTML(ctx.t("picked-currency", {currency: ctx.wizard.state.currency.name}), Markup.removeKeyboard());

        ctx.wizard.cursor++;
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    } catch (e) {
        await handleError(ctx, e);
    }
};

export const handleMaxAmount = async (ctx) => {
    try{
        if (ctx.wizard.state.type !== "in") {
            const currency = ctx.wizard.state.currency.name;
            const transactions = await getTransactions(ctx.session.project.id, ctx.session.user.id);
            const balance = calcBalance(transactions);

            if (balance[currency] === undefined || balance[currency] === 0 || balance[currency] === null) {
                ctx.reply(ctx.t("currency-not-enough-money-error"));
                ctx.wizard.state.currency = undefined;

                ctx.wizard.cursor--;
                return ctx.wizard.steps[ctx.wizard.cursor](ctx);
            }

            ctx.wizard.state.availableBalance = balance[currency];
        }

        ctx.wizard.cursor++;
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    } catch (e) {
        await handleError(ctx, e);
    }
}

/**
 * Запрашивает у пользователя ввод суммы транзакции.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleAskAmountOptions = async (ctx) => {
    try {
        const type = ctx.wizard.state.type;
        await ctx.replyWithHTML(ctx.t("write-all-amount-data", {
            needMaxBalance: (type === "out").toString(),
            availableBalance: type === "out" ? ctx.wizard.state.availableBalance.toLocaleString("de", {maximumFractionDigits: 2}) : ""
        }), exitKeyboard(ctx));
        return ctx.wizard.next();
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Обрабатывает введенную пользователем параметры транзакции.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleAmountOptions = async (ctx) => {
    try {
        const amount = +ctx.message.text.trim();
        const type = ctx.wizard.state.type;

        if (isNaN(amount) || amount <= 0 || typeof amount !== "number" ||
            (type === "out" && amount > ctx.wizard.state.availableBalance)) {
            ctx.reply(ctx.t("input-error-amount"));
            ctx.wizard.cursor--;
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }

        ctx.wizard.state.amount = amount;

        ctx.wizard.cursor++;
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Запрашивает у пользователя о его криптотранзакциях.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleAskCrypto = async (ctx) => {
    try {
        await ctx.replyWithHTML(ctx.t("input-crypto"),
            exitKeyboard(ctx)
        );

        return ctx.wizard.next();
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Обрабатывает информацию пользователя о крипто-транзакциях.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleCryptoOption = async (ctx) => {
    try {
        const cryptoTransactionsHash = ctx.message.text.split("/").at(-1);
        const cryptoTransactionsType = ctx.message.text.includes("https") ?
            ctx.message.text.split('/').at(2).split('.').filter(l => l !== "www").at(0) :
            ctx.message.text.split(".").filter(l => l !== "www").at(0);

        const transactionData = await getInfoAboutTransactionByHash(cryptoTransactionsHash, cryptoTransactionsType);

        if (transactionData.length === 0)
            throw new Error(`Возникла ошибка при получении данных о транзакции ${hash}`);

        ctx.wizard.state.cryptoTransaction = transactionData[0];

        ctx.wizard.cursor++;
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Запрашивает у пользователя ввод комментария для транзакции (более 10 символов).
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleAskComment = async (ctx) => {
    try {
        await ctx.replyWithHTML(ctx.t("input-comment"), exitKeyboard(ctx));
        return ctx.wizard.next();
    } catch (e) {
        await handleError(ctx, e);
    }
};

/**
 * Обрабатывает введенный пользователем комментарий для транзакции.
 * @param {Object} ctx - Контекст Telegraf.
 */
export const handleCommentOption = async (ctx) => {
    try {
        ctx.wizard.state.comment = ctx.wizard.state.comment || ctx.message.text;

        ctx.wizard.cursor++;
        return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    } catch (e) {
        await handleError(ctx, e);
    }
};

export const handleMainMenu = async (ctx, message) => {
    const userProjectPermissions = await getUserProjectPermissions(ctx.session.user.id, ctx.session.project.id);
    const countOfProjects = await countProjectsWithPermissions(ctx.session.user.id);
    const canExit = countOfProjects > 1;

    await ctx.replyWithHTML(
        message,
        createMainMenuKeyboard(ctx,
            canExit,
            ctx.session.project.type,
            userProjectPermissions
        )
    );
}

/**
 * Обрабатывает ошибку у транзакции и завершает сцену.
 * @param {Object} ctx - Контекст Telegraf.
 * @param {Error} e - Ошибка.
 */
export const handleError = async (ctx, e) => {
    console.error(`Во время обработки действия в сцене "${ctx.session.sceneName}" возникла ошибка:`, e);

    if (ctx.session.project && ctx.session.user) {
        await handleMainMenu(ctx, ctx.t("error", {name: ctx.session.sceneName}));

        return ctx.scene.leave();
    } else {
        const userAccount = await getAccount(ctx.chat.id);

        if (!userAccount) return ctx.scene.leave();

        return ctx.replyWithHTML(ctx.t("error", {name: "none"}));
    }
};