import {Markup} from 'telegraf';
import {getLastDayOfMonth} from './utils/dateManager.js';
import {permissionsEnum} from "./utils/permissionsEmum.js";

/**
 * Генерирует встроенную клавиатуру для начала работы.
 * @param {Array} projects Список проектов.
 * @return {Markup} Сгенерированная встроенная клавиатура.
 */
export const startKeyboard = (ctx, projects) => {
    let keyboard = [];

    if (projects.length > 1) {
        // Если есть несколько проектов, добавляет кнопки для каждого проекта
        for (let i = 0; i < projects.length; i++) {
            keyboard.push([
                Markup.button.callback(
                    // Отображает название и тип проекта на основе условий
                    ctx.t("project-button", {name: projects[i].name}),
                    `openCart#${projects[i].id}`
                ),
            ]);
        }
    } else {
        // Если есть только один проект, добавляет кнопку для этого проекта
        keyboard.push([
            Markup.button.callback(
                // Отображает тип и название проекта на основе условий
                `${ctx.t("open-project-button", {type: projects[0].type})}`,
                `openCart#${projects[0].id}`
            ),
        ]);
    }

    // Возвращает сгенерированную встроенную клавиатуру
    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру главного меню.
 * @param {boolean} allowedExit - Разрешен ли выход.
 * @param {boolean} projectType - Тип проекта.
 * @param {Permission[]} userRights - Права доступа пользователя к проекту
 * @returns {object} Созданная клавиатура.
 */
export const createMainMenuKeyboard = (ctx, allowedExit, projectType, userRights) => {
    // Создаем базовую клавиатуру с начальными кнопками
    let keyboard = [];

    // Добавляем дополнительные кнопки, если проект - касса
    switch (projectType) {
        case "wallet": {
            if (userRights.find(p => p.permission_id === permissionsEnum["balance"] && p.allowed)) {
                keyboard.push([Markup.button.text(ctx.t("balance-button"))]);
            }

            if (userRights.find(p => p.permission_id === permissionsEnum["income"] && p.allowed)) {
                keyboard.push([Markup.button.text(ctx.t("income-button"))]);
            }

            if (userRights.find(p => p.permission_id === permissionsEnum["outcome"] && p.allowed)) {
                keyboard.length > 1 ? keyboard[1].push(Markup.button.text(ctx.t("outcome-button"))) :
                    keyboard.push([Markup.button.text(ctx.t("outcome-button"))]);
            }

            if (userRights.find(p => p.permission_id === permissionsEnum["report"])) {
                keyboard.length > 2 && keyboard[2].length !== 2 ? keyboard[2].push(Markup.button.text(ctx.t("report-button"))) :
                    keyboard.push([Markup.button.text(ctx.t("report-button"))]);
            }
            break;
        }
    }

    // Добавляем кнопку выхода, если разрешено
    if (allowedExit) {
        keyboard.push([
            Markup.button.text(ctx.t("exit-button"))
        ]);
    }

    // Возвращаем созданную клавиатуру
    return Markup.keyboard(keyboard);
};

/**
 * Генерирует клавиатуру для выхода.
 *
 * @return {Markup} Сгенерированная клавиатура для выхода.
 */
export const exitKeyboard = (ctx) => {
    return Markup.inlineKeyboard([[Markup.button.callback(ctx.t("exit-button"), "exit")]]);
};

/**
 * Генерирует клавиатуру для подтверждения заданного действия.
 *
 * @param {string} action - Действие, которое требуется подтвердить.
 * @return {object} Сгенерированная клавиатура для подтверждения.
 */
export const confirmKeyboard = (ctx, action) => {
    return {
        inline_keyboard: [
            [
                Markup.button.callback(ctx.t("confirm-button"), `confirm_${action}`),
                Markup.button.callback(ctx.t("cancel-button"), "exit"),
            ],
        ],
    };
};

/**
 * Генерирует клавиатуру для выбора разных вариантов дат.
 *
 * @return {Markup} Сгенерированная клавиатура для выбора разных вариантов дат.
 */
export const dateKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(ctx.t("one-day-button"), "1 день"),
            Markup.button.callback(ctx.t("three-days-button"), "3 дня"),
        ],
        [
            Markup.button.callback(ctx.t("seven-days-button"), "7 дней"),
            Markup.button.callback(ctx.t("thirty-days-button"), "30 дней"),
        ],
        [
            Markup.button.callback(ctx.t("week-button"), "Неделю"),
            Markup.button.callback(ctx.t("month-button"), "Месяц"),
        ],
        [
            Markup.button.callback(ctx.t("custom-period-button"), "Custom"),
            Markup.button.callback(ctx.t("exit-button"), "exit"),
        ],
    ]);
};

/**
 * Генерирует клавиатуру для выбора месяца.
 *
 * @return {Markup} Сгенерированная клавиатура для выбора месяца.
 */
export const monthsKeyboard = (ctx) => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback(ctx.t("january-button"), "1 месяц"),
            Markup.button.callback(ctx.t("february-button"), "2 месяц"),
            Markup.button.callback(ctx.t("march-button"), "3 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("april-button"), "4 месяц"),
            Markup.button.callback(ctx.t("may-button"), "5 месяц"),
            Markup.button.callback(ctx.t("june-button"), "6 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("july-button"), "7 месяц"),
            Markup.button.callback(ctx.t("august-button"), "8 месяц"),
            Markup.button.callback(ctx.t("september-button"), "9 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("october-button"), "10 месяц"),
            Markup.button.callback(ctx.t("november-button"), "11 месяц"),
            Markup.button.callback(ctx.t("december-button"), "12 месяц"),
        ],
        [Markup.button.callback(ctx.t("cancel-button"), "exit")],
    ]);
};

/**
 * Генерирует клавиатуру для выбора месяца или года.
 *
 * @param {number[]} years Массив с нужными годами
 * @return {Markup} Сгенерированная клавиатура для выбора месяца или года.
 */
export const monthsAndYearsKeyboard = (ctx, years) => {
    let keyboard = [
        [
            Markup.button.callback(ctx.t("january-button"), "1 месяц"),
            Markup.button.callback(ctx.t("february-button"), "2 месяц"),
            Markup.button.callback(ctx.t("march-button"), "3 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("april-button"), "4 месяц"),
            Markup.button.callback(ctx.t("may-button"), "5 месяц"),
            Markup.button.callback(ctx.t("june-button"), "6 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("july-button"), "7 месяц"),
            Markup.button.callback(ctx.t("august-button"), "8 месяц"),
            Markup.button.callback(ctx.t("september-button"), "9 месяц"),
        ],
        [
            Markup.button.callback(ctx.t("october-button"), "10 месяц"),
            Markup.button.callback(ctx.t("november-button"), "11 месяц"),
            Markup.button.callback(ctx.t("december-button"), "12 месяц"),
        ],
        [Markup.button.callback(ctx.t("cancel-button"), "exit")],
    ];

    if (years.length < 3) {
        for (let i = 0; i < years.length; i++) {
            keyboard.splice(-1, 0,
                [Markup.button.callback(years[i].toString(), `pick_year_${years[i]}`)]);
        }
    } else {
        for (let i = 0; i < years.length; i++) {
            if (i + 2 < years.length) {
                keyboard.splice(-1, 0,
                    [Markup.button.callback(years[i].toString(), `pick_year_${years[i++]}`),
                        Markup.button.callback(years[i].toString(), `pick_year_${years[i++]}`),
                        Markup.button.callback(years[i].toString(), `pick_year_${years[i]}`)]);
            } else {
                keyboard.splice(-1, 0,
                    [Markup.button.callback(years[i].toString(), `pick_year_${years[i]}`)]);
            }
        }
    }

    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру с днями для указанного месяца.
 * @param {number} month - Месяц, для которого нужно сгенерировать клавиатуру.
 * @returns {Markup} Сгенерированная клавиатура с днями.
 */
export const daysKeyboard = (ctx, month) => {
    // Получаем последний день месяца
    const endDay = getLastDayOfMonth(month);

    const keyboard = [];

    // Перебираем дни и создаем строки с кнопками
    for (let i = 0; i < endDay; i += 6) {
        const row = [];

        // Перебираем каждый день в строке
        for (let j = 0; j < 6 && i + j < endDay; j++) {
            const day = i + j + 1;
            row.push(Markup.button.callback(ctx.t("day-button", {day}), `${day} число`));
        }

        keyboard.push(row);
    }

    keyboard.push([Markup.button.callback(ctx.t("cancel-button"), "exit")]);

    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру для выбора вариантов загрузки.
 */
export const downloadOptionKeyboard = (ctx, isPdfNeeded = true, isExcelNeeded = true) => {
    let keyboard = [[]];

    if (isPdfNeeded) {
        keyboard[0].push(Markup.button.callback(ctx.t("pdf-button"), "downloadPdf"));
    }

    if (isExcelNeeded) {
        keyboard[1] ?
            keyboard[1].push(Markup.button.callback(ctx.t("excel-button"), "downloadXlsx")) :
            keyboard.push([Markup.button.callback(ctx.t("excel-button"), "downloadXlsx")]);
    }

    keyboard.push([Markup.button.callback(ctx.t("cancel-button"), "exit")]);

    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру для выбора вариантов загрузки.
 */
export const downloadFilterOptionKeyboard = (ctx, typeFilterNeeded,
                                             isPdfNeeded = true, isExcelNeeded = true) => {
    let keyboard = [[]];

    if (isPdfNeeded) {
        keyboard[0].push(Markup.button.callback(ctx.t("pdf-button"), "downloadPdf"));
    }

    if (isExcelNeeded) {
        keyboard[1] ?
            keyboard[1].push(Markup.button.callback(ctx.t("excel-button"), "downloadXlsx")) :
            keyboard.push([Markup.button.callback(ctx.t("excel-button"), "downloadXlsx")]);
    }

    if (typeFilterNeeded) {
        keyboard.length > 2 ? keyboard.at(-1).push(Markup.button.callback(ctx.t("add-type-filter-button"), "applyTypeFilter"))
            : keyboard.push([Markup.button.callback(ctx.t("add-type-filter-button"), "applyTypeFilter")]);
    }

    keyboard.push([Markup.button.callback(ctx.t("cancel-button"), "exit")]);

    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру для списка пользователей с выбором проекта.
 *
 * @param {Array<User>} users - Пользователи.
 * @param {Array<Project>} projects - Проекты.
 * @return {object} Сгенерированная клавиатура.
 */
export const inlineUsersKeyboard = async (ctx, users, projects = []) => {
    let keyboard = [];

    for (let i = 0; i < users.length;) {
        if (users[i + 1]) {
            keyboard.push([
                Markup.button.callback(users[i].name, `user#${users[i].id}`),
                Markup.button.callback(users[i + 1].name, `user#${users[i + 1].id}`),
            ]);
            i += 2;
        } else {
            keyboard.push([Markup.button.callback(users[i].name, `user#${users[i].id}`)]);
            i++;
        }
    }

    if (projects.length > 0) {
        for (let i = 0; i < projects.length;) {
            if (projects[i + 1]) {
                keyboard.push([
                    Markup.button.callback(ctx.t("project-button", {
                        name: projects[i].name
                    }), `project#${projects[i].id}`),
                    Markup.button.callback(ctx.t("project-button", {
                        name: projects[i + 1].name
                    }), `project#${projects[i + 1].id}`),
                ]);
                i += 2;
            } else {
                keyboard.push([Markup.button.callback(ctx.t("project-button", {
                    name: projects[i].name
                }), `project#${projects[i].id}`)]);
                i++;
            }
        }
    }

    keyboard.push([Markup.button.callback(ctx.t("exit-button"), "exit")]);

    return Markup.inlineKeyboard(keyboard);
};

/**
 * Генерирует клавиатуру для списка типов.
 *
 * @param {Array<{string: string}>} types - Типы.
 * @return {object} Сгенерированная клавиатура.
 */
export const inlineTypesKeyboard = async (ctx, types) => {
    let keyboard = [];

    Object.keys(types).forEach(key => {
        keyboard.push([Markup.button.callback(types[key], `type_${key}`)]);
    });

    keyboard.push([Markup.button.callback(ctx.t("exit-button"), "exit")]);

    return Markup.inlineKeyboard(keyboard);
};