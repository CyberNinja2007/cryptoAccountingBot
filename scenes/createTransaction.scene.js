import {Scenes} from 'telegraf';
import {confirmKeyboard} from '../keyboards.js';

import {
    handleAmountOptions,
    handleAskAmountOptions,
    handleAskComment,
    handleAskCrypto, handleAskCurrency,
    handleCommentOption,
    handleCryptoOption, handleCurrencyOption,
    handleError,
    handleMainMenu, handleNeedInAmountInput, handleNeedInCryptoInput,
} from '../handlers.js';

import {withCtx} from '../contextWrapper.js';
import {createTransaction} from '../db/controllers/transactionController.js';
import startComposer from '../composers/start.composer.js';

import {createEvent} from '../db/controllers/eventsController.js';
import {createControlPoint} from '../utils/eventCreator.js';
import {filter} from "../utils/filterCommandMessages.js";
import {pool} from "../db/db.js";
import {generateLinkForCryptoTransaction} from "../utils/cryptoTransactionsManager.js";
import {currenciesDictionary} from "../utils/currenciesDictionary.js";
import {transactionCategories} from "../utils/transactionCategories.js";

const COMMISSION_AMOUNT = 3;

const createTransactionScene = new Scenes.WizardScene(
    "createTransactionScene",
    async (ctx) => {
        try {
            ctx.session.sceneName = ctx.session.type === "in" ? ctx.t("income-scene-name") : ctx.t("outcome-scene-name");
            ctx.wizard.state.type = ctx.session.type;
            ctx.session.type = null;
            ctx.wizard.cursor++;
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        } catch (e) {
            await handleError(ctx, e);
        }
    },
    withCtx(handleNeedInAmountInput),
    withCtx(handleAskCurrency),
    withCtx(handleCurrencyOption),
    withCtx(handleAskAmountOptions),
    withCtx(handleAmountOptions),
    withCtx(handleNeedInCryptoInput),
    withCtx(handleAskCrypto),
    withCtx(handleCryptoOption),
    withCtx(handleAskComment),
    withCtx(handleCommentOption),
    async (ctx) => {
        try {
            const isCryptoProject = ctx.session.project.crypto_only;
            const type = ctx.wizard.state.type;
            const comment = ctx.wizard.state.comment;
            const cryptoTransaction = ctx.wizard.state.cryptoTransaction;

            const currency = isCryptoProject ? currenciesDictionary[cryptoTransaction.token] : ctx.wizard.state.currency.name;
            const amount = isCryptoProject ? cryptoTransaction.amount : ctx.wizard.state.amount;
            const amountString = amount.toLocaleString("de", {maximumFractionDigits: 2});

            const linkToInfo = isCryptoProject ? generateLinkForCryptoTransaction(cryptoTransaction.type, cryptoTransaction.hash) : "";
            const cryptoTransactionString = isCryptoProject ? (ctx.t("crypto-transactions") +
                `<a href="${linkToInfo}">${amount.toLocaleString("de", {maximumFractionDigits: 2})} ${cryptoTransaction.token}</a>\n\n`) : "";

            const confirmMessage = ctx.t("transaction-summary", {
                type,
                amountString,
                currency,
                cryptoTransactionString,
                comment
            });

            await ctx.replyWithHTML(confirmMessage, {
                reply_markup: confirmKeyboard(ctx, "income"),
            });

            return ctx.wizard.next();
        } catch (e) {
            await handleError(ctx, e);
        }
    }
);

createTransactionScene.use(startComposer);

createTransactionScene.action("confirm_income", async (ctx) => {
    const user_id = ctx.session.user.id;
    const account_id = ctx.session.account_id;
    const project_id = ctx.session.project.id;
    const isCryptoProject = ctx.session.project.crypto_only;
    const type = ctx.wizard.state.type;
    const comment = ctx.wizard.state.comment;
    const cryptoTransaction = ctx.wizard.state.cryptoTransaction;
    const hash = isCryptoProject ? cryptoTransaction.hash : '';
    const crypto_type = isCryptoProject ? cryptoTransaction.crypto_type : '';
    const currency = isCryptoProject ? currenciesDictionary[cryptoTransaction.token] : ctx.wizard.state.currency.name;
    const availableCurrency = ctx.session.availableCurrencies.find(c => c.name === currency);
    const amount = isCryptoProject ? cryptoTransaction.amount : ctx.wizard.state.amount;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const isControlPointCreated = await createControlPoint(client, project_id);

        if (!isControlPointCreated) {
            throw "Контрольная точка не была создана";
        }

        const transaction = await createTransaction(
            client,
            user_id,
            account_id,
            type,
            availableCurrency.id,
            comment,
            amount,
            project_id,
            hash,
            crypto_type
        );

        if (!transaction) {
            throw "Транзакция не была создана.";
        }

        const createTransactionEvent = await createEvent(
            client,
            "create",
            transaction.id,
            transaction,
            "transaction"
        );

        if (!createTransactionEvent) {
            throw "Не удалось создать событие создания транзакции";
        }

        if(type === "out" && isCryptoProject){
            const commissionText = `Оплата комиссии kwex для транзакции #${transaction.id}`

            const commission = await createTransaction(
                client,
                user_id,
                account_id,
                type,
                availableCurrency.id,
                commissionText,
                COMMISSION_AMOUNT,
                project_id,
                "",
                "",
                transactionCategories["commission"]
            );

            if (!commission) {
                throw "Транзакция не была создана.";
            }

            const createCommissionEvent = await createEvent(
                client,
                "create",
                commission.id,
                commission,
                "transaction"
            );

            if (!createCommissionEvent) {
                throw "Не удалось создать событие создания комиссии";
            }
        }

        await client.query('COMMIT');
        client.release();
    } catch (error) {
        await client.query('ROLLBACK');
        client.release();

        await ctx.answerCbQuery('');

        await handleError(ctx, error);

        return ctx.scene.leave();
    }

    await handleMainMenu(ctx, ctx.t("success"));

    await ctx.answerCbQuery('');

    return ctx.scene.leave();
});

createTransactionScene.action("exit", async (ctx) => {
    await ctx.answerCbQuery('');
    await goToMainMenu(ctx);
});

createTransactionScene.use(filter("exit-button", async (ctx) => goToMainMenu(ctx)));

const goToMainMenu = async (ctx) => {
    await handleMainMenu(ctx, ctx.t("main-menu"));

    return ctx.scene.leave();
}

export default createTransactionScene;
