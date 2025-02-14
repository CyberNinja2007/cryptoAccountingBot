import {Composer} from 'telegraf';
import {getAccount} from '../db/controllers/accountController.js';
import {handleError} from '../handlers.js';
import {permissionsEnum} from "../utils/permissionsEmum.js";
import {checkUserPermission} from "../utils/permissionManager.js";
import {filter} from "../utils/filterCommandMessages.js";

const composer = new Composer();

composer.use(filter("income-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);
        ctx.session.type = "in";
        await handleCommand(ctx, userAccount, "createTransactionScene", permissionsEnum["income"]);
    } catch (error) {
        await handleError(ctx, error);
    }
}));

composer.use(filter("outcome-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);
        ctx.session.type = "out";
        await handleCommand(ctx, userAccount, "createTransactionScene", permissionsEnum["outcome"]);
    } catch (error) {
        await handleError(ctx, error);
    }
}));

composer.use(filter("report-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);
        await handleCommand(ctx, userAccount, "reportScene", permissionsEnum["report"]);
    } catch (error) {
        await handleError(ctx, error);
    }
}));

composer.use(filter("exit-button", async (ctx) => {
    try {
        const userAccount = await getAccount(ctx.chat.id);
        if (!userAccount) {
            throw "Указанный аккаунт не существует в системе";
        }

        await ctx.scene.enter("startScene");
    } catch (error) {
        await handleError(ctx, error);
    }
}));

/**
 * Обрабатывает команду пользователя и входит в соответствующую сцену.
 *
 * @param {Object} ctx - Контекст чата.
 * @param {Object} userAccount - Аккаунт пользователя.
 * @param {string} sceneName - Название сцены.
 * @param {string} permissionId - Идентификатор права доступа для действия.
 */
async function handleCommand(ctx, userAccount, sceneName, permissionId) {
    if (!userAccount) {
        throw "Указанный аккаунт не существует в системе";
    }

    const projectId = ctx.session.project.id;
    const isAllowed = await checkUserPermission(ctx.session.user.id, projectId, permissionId);

    if (projectId !== 0 && !isAllowed) {
        await ctx.reply(ctx.t("not-enough-rights-error"));
    } else {
        await ctx.scene.enter(sceneName);
    }
}

export default composer;
