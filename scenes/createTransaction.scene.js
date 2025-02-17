import {Scenes} from 'telegraf';
import {confirmKeyboard} from '../keyboards.js';

import {
    handleAmountOptions,
    handleAskAmountOptions,
    handleAskComment,
    handleAskCrypto,
    handleAskCurrency,
    handleCommentOption,
    handleCryptoOption,
    handleCurrencyOption,
    handleError,
    handleMainMenu, handleMaxAmount,
} from '../handlers.js';

import {withCtx} from '../contextWrapper.js';
import {createTransaction} from '../db/controllers/transactionController.js';
import startComposer from '../composers/start.composer.js';

import {createEvent} from '../db/controllers/eventsController.js';
import {createControlPoint} from '../utils/eventCreator.js';
import {filter} from "../utils/filterCommandMessages.js";
import {pool} from "../db/db.js";
import {generateLinkForCryptoTransaction} from "../utils/cryptoTransactionsManager.js";
import {createCryptoTransaction} from "../db/controllers/CryptoTransactionController.js";

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
    withCtx(handleAskCurrency),
    withCtx(handleCurrencyOption),
    withCtx(handleMaxAmount),
    withCtx(handleAskAmountOptions),
    withCtx(handleAmountOptions),
    withCtx(handleAskComment),
    withCtx(handleCommentOption),
    withCtx(handleAskCrypto),
    withCtx(handleCryptoOption),
    async (ctx) => {
        try {
            const type = ctx.wizard.state.type;
            const currency = ctx.wizard.state.currency.name;
            const amount = ctx.wizard.state.amount;
            const amountString = amount.toLocaleString("de", {maximumFractionDigits: 2});
            const comment = ctx.wizard.state.comment;
            const cryptoTransactions = ctx.wizard.state.cryptoTransactions;

            let cryptoTransactionString = ctx.t("crypto-transactions");

            if (cryptoTransactions) {
                cryptoTransactions.forEach((cryptoTransaction, index) => {
                    const linkToInfo = generateLinkForCryptoTransaction(cryptoTransaction.type, cryptoTransaction.hash);
                    cryptoTransactionString += `${index + 1}. <a href="${linkToInfo}">${cryptoTransaction.amount.toLocaleString("de", {maximumFractionDigits: 2})} ${cryptoTransaction.token}</a>\n`
                })
                cryptoTransactionString += "\n";
            }

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
    const project_id = ctx.session.project.id
    const type = ctx.wizard.state.type;
    const currency = ctx.wizard.state.currency;
    const amount = ctx.wizard.state.amount;
    const comment = ctx.wizard.state.comment;
    const cryptoTransactions = ctx.wizard.state.cryptoTransactions;

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
            currency.id,
            comment,
            amount,
            project_id,
            cryptoTransactions[0].hash,
            cryptoTransactions[0].type
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

        for (const cryptoTransaction of cryptoTransactions) {
            const createdCryptoTransaction =
                await createCryptoTransaction(client, cryptoTransaction.amount, cryptoTransaction.token, cryptoTransaction.hash);

            if (!createdCryptoTransaction) {
                throw "Крипто-транзакция не была успешно создана";
            }

            const createCryptoTransactionEvent = await createEvent(
                client,
                "create",
                createdCryptoTransaction.id,
                createdCryptoTransaction,
                "cryptoTransaction"
            );

            if (!createCryptoTransactionEvent) {
                throw "Не удалось создать событие создания крипто-транзакции";
            }
        }

        if(type === "out"){
            const commissionText = `Оплата комиссии kwex для транзакции #${transaction.id}`

            const commission = await createTransaction(
                client,
                user_id,
                account_id,
                type,
                currency.id,
                commissionText,
                COMMISSION_AMOUNT,
                project_id,
                "",
                ""
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
