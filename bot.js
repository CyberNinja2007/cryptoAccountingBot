import 'dotenv/config'

import {Scenes, session, Telegraf} from 'telegraf';

// Дополнительные обработчики действий
import actionsComposer from './composers/actions.composer.js';
import balanceComposer from './composers/balance.composer.js';
import startComposer from './composers/start.composer.js';

// Сцены
import createTransactionScene from './scenes/createTransaction.scene.js';
import reportScene from './scenes/report.scene.js';
import startScene from './scenes/start.scene.js';

import {I18n} from "@grammyjs/i18n";

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
bot.use(actionsComposer);
bot.use(startComposer);

// Функция старта
bot.start(async (ctx) => {
    await ctx.scene.enter("startScene");
});

// Главная функция
(async () => {
    bot.launch();
    console.log("Bot online....");
})();

// Плавная остановка бота
process.once("SIGINT", async () => {
    bot.stop("SIGINT");
});
process.once("SIGTERM", async () => {
    bot.stop("SIGTERM");
});
