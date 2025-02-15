import {Input, Scenes} from 'telegraf';

import {
    createMainMenuKeyboard,
    currencyInlineKeyboard,
    dateKeyboard,
    daysKeyboard,
    downloadFilterOptionKeyboard,
    downloadOptionKeyboard,
    inlineTypesKeyboard,
    inlineUsersKeyboard,
    monthsAndYearsKeyboard,
    monthsKeyboard,
} from '../keyboards.js';

import {getTransactionsBetween} from '../db/controllers/transactionController.js';
import {getUsers} from '../db/controllers/userController.js';
import {createTransactionsPDF} from '../utils/pdfManager.js';
import {getCurrentMondayDate, getFirstDayOfMonth} from '../utils/dateManager.js';
import startComposer from '../composers/start.composer.js';
import {getProjects} from '../db/controllers/projectsController.js';
import {handleError, handleMainMenu} from '../handlers.js';
import {createTransactionsXLSX} from '../utils/xlsxManager.js';
import {
    checkIfUserOperator,
    checkUserPermission,
    countProjectsWithPermissions,
    getUserProjectPermissions
} from "../utils/permissionManager.js";
import {permissionsEnum} from "../utils/permissionsEmum.js";
import {filter} from "../utils/filterCommandMessages.js";
import '../utils/extensions/stringExtension.js';

const LAUNCH_YEAR = +process.env.LAUNCH_YEAR;
const TRANSACTION_TYPES = {"in": "Приход", "out": "Расход"};

const reportScene = new Scenes.WizardScene("reportScene", async (ctx) => {
    try {
        ctx.session.sceneName = ctx.t("report-scene-name");
        await ctx.replyWithHTML(ctx.t("input-period"), dateKeyboard(ctx));
        return ctx.wizard.next();
    } catch (e) {
        await handleError(ctx, e);
    }
});

reportScene.use(startComposer);

reportScene.action(
    ["1 день", "3 дня", "7 дней", "30 дней", "Неделю", "Месяц"],
    async (ctx) => {
        try {
            ctx.wizard.state.period = ctx.match.input;
            ctx.wizard.state.year = (new Date()).getFullYear();
            ctx.wizard.state.next_year = ctx.wizard.state.year;

            await ctx.editMessageText(
                ctx.t("input-report-type"),
                downloadFilterOptionKeyboard(ctx, true)
            );

            await ctx.answerCbQuery('');

            return ctx.wizard.next();
        } catch (e) {
            await ctx.answerCbQuery('');

            await handleError(ctx, e);
        }
    }
);

reportScene.action("Custom", async (ctx) => {
    try {
        ctx.wizard.state.period = "Свой";

        const currentYear = (new Date()).getFullYear();
        const previousYears = Array.from({length: (currentYear - LAUNCH_YEAR)}, (_, i) => i + LAUNCH_YEAR);

        ctx.editMessageText(ctx.t("input-beginning-date"), monthsAndYearsKeyboard(ctx, previousYears));

        await ctx.answerCbQuery('');

        return ctx.wizard.next();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(/pick_year_[0-9]+/, async (ctx) => {
    try {
        if (!ctx.wizard.state.year) {
            ctx.wizard.state.year = +ctx.match.input.split('_').at(-1);

            ctx.editMessageText(ctx.t("input-beginning-date"), monthsKeyboard(ctx));
        } else {
            ctx.wizard.state.next_year = +ctx.match.input.split('_').at(-1);

            ctx.editMessageText(ctx.t("input-end-date"), monthsKeyboard(ctx));
        }

        await ctx.answerCbQuery('');

        return ctx.wizard.next();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(/^[0-9]* число$/i, async (ctx) => {
    try {
        const pickedDay = +ctx.match.input.split(" ")[0];
        if (typeof ctx.wizard.state.startDay === "number") {
            ctx.wizard.state.endDay = pickedDay;

            await ctx.editMessageText(
                ctx.t("input-report-type"),
                downloadFilterOptionKeyboard(ctx, true)
            );
        } else {
            ctx.wizard.state.startDay = pickedDay;

            const currentYear = (new Date()).getFullYear();
            const prevYear = ctx.wizard.state.year ? ctx.wizard.state.year : currentYear;
            const nextYears = Array.from({length: (currentYear - prevYear)}, (_, i) => currentYear - i).reverse();

            ctx.wizard.state.next_year = prevYear;

            if (nextYears.length > 0)
                ctx.editMessageText(ctx.t("input-end-date"), monthsAndYearsKeyboard(ctx, nextYears));
            else
                ctx.editMessageText(ctx.t("input-end-date"), monthsKeyboard(ctx));
        }

        await ctx.answerCbQuery('');

        return ctx.wizard.next();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action("applyTypeFilter", async (ctx) => {
    try {
        ctx.editMessageText(ctx.t("input-types"), await inlineTypesKeyboard(ctx, TRANSACTION_TYPES));

        await ctx.answerCbQuery('');
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(/^type_[a-z]+$/i, async (ctx) => {
    try {
        const type = ctx.match.input.split("_")[1];
        ctx.wizard.state.type_filter = type;

        await ctx.editMessageText(
            ctx.t("input-report-type-with-filter", {
                type: TRANSACTION_TYPES[type]
            }),
            downloadFilterOptionKeyboard(ctx,  false)
        );

        await ctx.answerCbQuery('');
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(/^[0-9]* месяц$/i, async (ctx) => {
    try {
        const pickedMonth = +ctx.match.input.split(" ")[0];
        if (typeof ctx.wizard.state.startMonth === "number") {
            ctx.wizard.state.endMonth = pickedMonth - 1;
        } else {
            ctx.wizard.state.startMonth = pickedMonth - 1;
        }

        ctx.editMessageText(ctx.t("input-day"), daysKeyboard(ctx, pickedMonth));

        await ctx.answerCbQuery('');

        return ctx.wizard.next();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(["downloadPdf"], async (ctx) => {
    try {
        await ctx.answerCbQuery('');

        const type = ctx.wizard.state.type_filter;
        const [startDate, endDate] = formatDates(ctx);
        const startDateText = startDate.toLocaleDateString("ru");
        const endDateText = endDate.toLocaleDateString("ru");
        const period =
            ctx.t("period", {isEqual: (startDateText === endDateText).toString(), startDateText, endDateText});

        let transactionsInPeriod = await getTransactionsBetween(
            startDate,
            endDate,
            ctx.session.project.id
        );

        const isAllowed = await checkUserPermission(ctx.session.user.id, ctx.session.project.id, permissionsEnum["getAllInfo"]);

        if (!isAllowed) {
            transactionsInPeriod = transactionsInPeriod.filter(t => t.user_id === ctx.session.user.id);
        }

        if (type) {
            transactionsInPeriod = transactionsInPeriod.filter(t => t.type === type);
        }

        const users = await getUsers();
        const projects = await getProjects();

        const pdfFileBuffer = Buffer.from(
            createTransactionsPDF(transactionsInPeriod, users, period, projects, ctx)
        );

        const countOfProjects = await countProjectsWithPermissions(ctx.session.user.id);
        const userProjectPermissions = await getUserProjectPermissions(ctx.session.user.id, ctx.session.project.id);

        await ctx.sendDocument(
            Input.fromBuffer(pdfFileBuffer, ctx.t("report-name-pdf", {
                type: ctx.session.project.type,
                name: ctx.session.project.name,
                isEqual: (startDateText === endDateText).toString(),
                startDateText, endDateText
            })),
            createMainMenuKeyboard(ctx,
                countOfProjects > 1,
                ctx.session.project.type,
                userProjectPermissions
            )
        );

        return ctx.scene.leave();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action(["downloadXlsx"], async (ctx) => {
    try {
        await ctx.answerCbQuery('');

        const type = ctx.wizard.state.type_filter;
        const [startDate, endDate] = formatDates(ctx);
        const startDateText = startDate.toLocaleDateString("ru");
        const endDateText = endDate.toLocaleDateString("ru");
        const period = ctx.t("period", {
            isEqual: (startDateText === endDateText).toString(),
            startDateText,
            endDateText
        }).removeControlCharacters();

        const users = await getUsers();
        const projects = await getProjects();

        let periodTransactions = await getTransactionsBetween(
            startDate,
            endDate,
            ctx.session.project.id
        );

        const isAllowed = await checkUserPermission(ctx.session.user.id, ctx.session.project.id, permissionsEnum["getAllInfo"]);

        if (!isAllowed) {
            periodTransactions = periodTransactions.filter(t => t.user_id === ctx.session.user.id);
        }

        if (type) {
            periodTransactions = periodTransactions.filter(t => t.type === type);
        }

        const xlsxFileBuffer = await createTransactionsXLSX(periodTransactions, users, period, projects, ctx);

        const countOfProjects = await countProjectsWithPermissions(ctx.session.user.id);
        const userProjectPermissions = await getUserProjectPermissions(ctx.session.user.id, ctx.session.project.id);

        await ctx.sendDocument(
            Input.fromBuffer(xlsxFileBuffer, ctx.t("report-name-xlsx", {
                type: ctx.session.project.type,
                name: ctx.session.project.name,
                isEqual: (startDateText === endDateText).toString(),
                startDateText, endDateText
            })),
            createMainMenuKeyboard(ctx,
                countOfProjects > 1,
                ctx.session.project.type,
                userProjectPermissions
            )
        );

        return ctx.scene.leave();
    } catch (e) {
        await ctx.answerCbQuery('');

        await handleError(ctx, e);
    }
});

reportScene.action("exit", async (ctx) => {
    await ctx.answerCbQuery('');

    await goToMainMenu(ctx);
});

reportScene.use(filter("exit-button", async (ctx) => goToMainMenu(ctx)));

const goToMainMenu = async (ctx) => {
    await handleMainMenu(ctx, ctx.t("main-menu"));

    return ctx.scene.leave();
}

const formatDates = (ctx) => {
    const {period, year, next_year, endMonth, endDay, startMonth, startDay} = ctx.wizard.state;
    const endDate = typeof (endMonth) === "number"
        ? new Date(next_year, endMonth, endDay)
        : new Date();

    const periodMap = {
        "Неделю": getCurrentMondayDate(),
        "Месяц": getFirstDayOfMonth(),
        "Свой": new Date(year ? year : (new Date()).getFullYear(), startMonth, startDay),
    };

    let startDate;
    if (periodMap.hasOwnProperty(period)) {
        startDate = periodMap[period];
    } else {
        const periodNumber = Number(period.split(" ")[0]);
        startDate = new Date(
            endDate.getTime() - (periodNumber - 1) * 24 * 60 * 60 * 1000
        );
    }

    endDate.setHours(23, 59, 59);
    startDate.setHours(0, 0, 0);
    return [startDate, endDate];
}

export default reportScene;
