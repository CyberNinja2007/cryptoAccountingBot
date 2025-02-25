import 'dotenv/config'

import {Scenes, session, Telegraf} from 'telegraf';

// Дополнительные обработчики действий
import actionsComposer from './composers/actions.composer.js';
import balanceComposer from './composers/balance.composer.js';
import userBalanceComposer from "./composers/user-balance.composer.js";
import startComposer from './composers/start.composer.js';

// Сцены
import createTransactionScene from './scenes/createTransaction.scene.js';
import reportScene from './scenes/report.scene.js';
import startScene from './scenes/start.scene.js';

import {I18n} from "@grammyjs/i18n";
import {gracefulShutdown, scheduleJob} from "node-schedule";
import {fileURLToPath} from "url";
import {readJsonFile} from "./utils/jsonHelper.js";
import {createControlPoint} from "./utils/eventCreator.js";
import {createTransaction} from "./db/controllers/transactionController.js";
import {createEvent} from "./db/controllers/eventsController.js";
import {pool} from "./db/db.js";
import {getAccountByUserId} from "./db/controllers/accountController.js";
import {getUsers} from "./db/controllers/userController.js";
import {checkIfUserOperator} from "./utils/permissionManager.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());

const i18n = new I18n({
    defaultLocale: "ru",
    useSession: true,
    directory: "locales"
});
bot.use(i18n);

// Создание контейнера для сцен
const stage = new Scenes.Stage([
    createTransactionScene,
    reportScene,
    startScene,
]);
// Использование сцен
bot.use(stage.middleware());

// Проверка начального запуска
bot.use(async (ctx, next) => {
    if (!ctx.session.startedExampleScene) {
        ctx.session.startedExampleScene = true;

        return ctx.scene.enter("startScene");

    } else {
        await next();
    }
});

bot.use(balanceComposer);
bot.use(userBalanceComposer);
bot.use(actionsComposer);
bot.use(startComposer);

// Функция старта
bot.start(async (ctx) => {
    await ctx.scene.enter("startScene");
});

// Главная функция
(async () => {
    const configFilePath = fileURLToPath(new URL('config.json', import.meta.url));
    const config = readJsonFile(configFilePath);
    const serviceOutcomeParams = config.serviceOutcome;

    bot.launch();
    scheduleJob(serviceOutcomeParams.time, async () => {
        const client = await pool.connect();

        const users = await getUsers();
        const allowedUsers = await Promise.all(users.map(async u =>
            await checkIfUserOperator(u.id, serviceOutcomeParams.project_id)))
        const operators = users.filter(
            (user, index) => {
                return allowedUsers[index] && user.status !== "off"
            }
        );

        try {
            await client.query('BEGIN');

            for(let i = 0; i < operators.length; i++) {
                const user_id = operators[i].id;

                const accounts = await getAccountByUserId(user_id);

                const isControlPointCreated = await createControlPoint(client, serviceOutcomeParams.project_id);

                if (!isControlPointCreated) {
                    throw "Контрольная точка не была создана";
                }

                const serviceHash = "";
                const serviceCryptoType = "";

                const transaction = await createTransaction(
                    client,
                    user_id,
                    accounts[0].id,
                    "out",
                    serviceOutcomeParams.currency_id,
                    serviceOutcomeParams.comment,
                    serviceOutcomeParams.amount,
                    serviceOutcomeParams.project_id,
                    serviceHash,
                    serviceCryptoType
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
            }

            await client.query('COMMIT');
            client.release();
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();

            console.error("При создании сервисного расхода возникла ошибка: ", error);

            const adminAccounts = config.adminTelegramAccountIds;

            for(let i = 0; i < adminAccounts.length; i++) {
                await bot.telegram.sendMessage(adminAccounts, "Не удалось создать сервисный расход!");
            }

            await gracefulShutdown();
        }
    });

    console.log("Bot online....");
})();

// Плавная остановка бота
process.once("SIGINT", async () => {
    bot.stop("SIGINT");
    await gracefulShutdown();
});
process.once("SIGTERM", async () => {
    bot.stop("SIGTERM");
    await gracefulShutdown();
});
