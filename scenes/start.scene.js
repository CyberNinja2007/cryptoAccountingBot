import {Markup, Scenes} from 'telegraf';
import {startKeyboard} from '../keyboards.js';
import {getAccount} from '../db/controllers/accountController.js';
import {getUserById} from '../db/controllers/userController.js';
import {getProjectCurrencies, getProjects} from '../db/controllers/projectsController.js';
import {handleError, handleMainMenu} from '../handlers.js';
import {Project} from '../db/models/Project.js';
import {checkUserPermission} from "../utils/permissionManager.js";
import {permissionsEnum} from "../utils/permissionsEmum.js";

const startScene = new Scenes.WizardScene("startScene", async (ctx) => {
            try {
                ctx.session.sceneName = ctx.t("start-scene-name");
                const userAccount = await getAccount(ctx.chat.id);

                await ctx.replyWithHTML(
                    ctx.t("telegram-id", {
                        id: ctx.chat.id.toString()
                    }),
                    Markup.removeKeyboard()
                );

                if (userAccount) {
                    ctx.session.user = await getUserById(userAccount.user_id);

                    if (ctx.session.user.status === "off" || ctx.session.user.status === "operator") {
                        return;
                    }

                    ctx.session.account_id = userAccount.id;
                    ctx.session.applicationsOnPage = 10;

                    await ctx.i18n.setLocale(ctx.session.user.locale);

                    const projects = await getProjects();

                    const isAllowed = await Promise.all(projects.map(async project =>
                        await checkUserPermission(ctx.session.user.id, project.id, permissionsEnum["project"])));

                    const userProjects = ctx.session.user.status === "admin" ? [...projects, new Project(0, ctx.t("admin-project-name"), "admin")] :
                        projects.filter((project, index) => isAllowed[index]);

                    if (userProjects.length === 1){
                        ctx.session.project = userProjects[0];

                        ctx.session.availableCurrencies = await getProjectCurrencies(userProjects[0].id);

                        await handleMainMenu(ctx, ctx.t("input-action"));

                        await ctx.answerCbQuery(ctx.t("welcome-to-project", {
                            name: ctx.session.project.name
                        }));

                        return ctx.scene.leave();
                    }

                    if (userProjects.length > 0) {
                        ctx.session.userProjects = userProjects;

                        await ctx.replyWithHTML(
                            ctx.t("welcome"),
                            startKeyboard(ctx, userProjects)
                        );
                    }
                }
            } catch
                (e) {
                await handleError(ctx, e);
            }
        }
    );

startScene.action(/^openCart#[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/i, async (ctx) => {
    try {
        const project_id = ctx.match.input.split("#")[1];

        if (!ctx.session.userProjects || !ctx.session.user) {
            ctx.wizard.cursor = 0;
            return ctx.wizard.steps[ctx.wizard.cursor](ctx);
        }

        ctx.session.project = ctx.session.userProjects.find(
            (project) => project.id === project_id
        );

        ctx.session.availableCurrencies = await getProjectCurrencies(project_id);

        await handleMainMenu(ctx, ctx.t("input-action"));

        await ctx.answerCbQuery(ctx.t("welcome-to-project", {
            name: ctx.session.project.name
        }));

        return ctx.scene.leave();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

export default startScene;
