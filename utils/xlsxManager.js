import excel from 'excel4node';
import fs from 'fs';
import {fileURLToPath} from 'url';
import './extensions/stringExtension.js'
import {generateLinkForCryptoTransaction} from "./cryptoTransactionsManager.js";

const FONT_FILE = fs.readFileSync(fileURLToPath(new URL('../fonts/XO_Oriel_Ni.ttf', import.meta.url)));

/**
 * Создает XLSX-документ с данными о транзакциях.
 * @param {Transaction[]} transactions - Список транзакций.
 * @param {Array<User>} users - Список пользователей.
 * @param {string} period - Период транзакций.
 * @param {Project[]} projects - Список всех проектов.
 * @returns {Buffer} XLSX-документ в формате ArrayBuffer.
 */
export const createTransactionsXLSX = async (transactions, users, period, projects, ctx) => {
    let baseTableHeader = [
        ctx.t("id-header"),
        ctx.t("comment-header"),
        ctx.t("date-header"),
        ctx.t("name-header"),
        ctx.t("type-header"),
        ctx.t("amount-header"),
        ctx.t("currency-header"),
        ctx.t("hash-header")
    ];

    let tableBody = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        const user = users.find((user) => user.id === transaction.user_id);
        const userName = user.name;
        const date = new Date(transaction.created);
        const transactionType = getTransactionType(transaction.type, ctx);

        const rowData = {
            id: +transaction.id,
            type: transactionType,
            userName: userName,
            currency: transaction.currency,
            amount: +transaction.amount,
            created: formatDate(date),
            comment: transaction.comment.removeControlCharacters(),
            hash: transaction.hash,
            crypto_type: transaction.crypto_type
        };

        tableBody.push(rowData);
    }

    const workbook = new excel.Workbook({dateFormat: 'd/mm/yyyy'});

    const nameStyle = createNamingStyle(workbook, FONT_FILE);

    const headingStyle = createHeadingStyle(workbook, FONT_FILE);

    const incomeBodyStyle = createBodyStyle(workbook, FONT_FILE, ctx.t("income-button"), ctx);

    const outcomeBodyStyle = createBodyStyle(workbook, FONT_FILE, ctx.t("outcome-button"), ctx);

    const bodyWithoutFillStyle = createBodyStyleWithoutFill(workbook, FONT_FILE);

    const allTransactionsList = workbook.addWorksheet(ctx.t("all-transactions-header"));
    fillWorksheetWithTransactions(allTransactionsList, baseTableHeader, period, nameStyle, headingStyle,
        tableBody, incomeBodyStyle, outcomeBodyStyle, bodyWithoutFillStyle, ctx);


    const incomeTransactions = tableBody.filter(t => t.type === ctx.t("income-button") && t.category !== "exchange-category");
    if (incomeTransactions.length > 0) {
        const incomeList = workbook.addWorksheet(ctx.t("incomes-list-header"));
        fillWorksheetWithTransactions(incomeList, baseTableHeader, period, nameStyle, headingStyle, incomeTransactions,
            incomeBodyStyle, outcomeBodyStyle, bodyWithoutFillStyle, ctx);
    }


    const outcomeTransactions = tableBody.filter(t => t.type === ctx.t("outcome-button") && t.category !== "exchange-category");
    if (outcomeTransactions.length > 0) {
        const outcomeList = workbook.addWorksheet(ctx.t("outcomes-list-header"));
        fillWorksheetWithTransactions(outcomeList, baseTableHeader, period, nameStyle, headingStyle, outcomeTransactions,
            incomeBodyStyle, outcomeBodyStyle, bodyWithoutFillStyle, ctx);
    }

    return await workbook.writeToBuffer();
};

/**
 * Возвращает строковое представление типа транзакции на русском языке.
 */
const getTransactionType = (type, ctx) => {
    return type === "in" ? ctx.t("income-button") : ctx.t("outcome-button");
};

/**
 * Форматирует дату для отображения в отчёте.
 *
 * @param {Date} date - Объект даты.
 * @returns {Date} Отформатированная строка с датой.
 */
const formatDate = (date) => {
    return new Date(date.toLocaleString("en", {timeZone: "EET"}));
};

/**
 * Вшивает шрифт в книгу как стиль для названий.
 *
 * @param {Workbook} workbook - Рабочая книга.
 * @param {Buffer} fontFile - Файл со шрифтом.
 * @returns {Style} Отформатированная строка с датой.
 */
const createNamingStyle = (workbook, fontFile) => workbook.createStyle({
    font: {
        name: 'XO Oriel Bold',
        src: `url(data:font/truetype;base64,${fontFile.toString('base64')})`,
        size: 20,
        bold: true
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
    }
});

/**
 * Вшивает шрифт в книгу как стиль для заголовка.
 *
 * @param {Workbook} workbook - Рабочая книга.
 * @param {Buffer} fontFile - Файл со шрифтом.
 * @returns {Style} Отформатированная строка с датой.
 */
const createHeadingStyle = (workbook, fontFile) => workbook.createStyle({
    font: {
        name: 'XO Oriel Bold',
        src: `url(data:font/truetype;base64,${fontFile.toString('base64')})`,
        bold: true,
        size: 10
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
    }
});

/**
 * Вшивает шрифт в книгу как стиль для обычного текста.
 */
const createBodyStyle = (workbook, fontFile, type, ctx) => workbook.createStyle({
    font: {
        name: 'XO Oriel',
        src: `url(data:font/truetype;base64,${fontFile.toString('base64')})`,
        size: 10,
    },
    fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: type === ctx.t("income-button") ? '#e5ffcc' : '#ffcccc'
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
    }
});

/**
 * Вшивает шрифт в книгу как стиль для обычного текста.
 *
 * @param {Workbook} workbook - Рабочая книга.
 * @param {Buffer} fontFile - Файл со шрифтом.
 * @returns {Style} Отформатированная строка с датой.
 */
const createBodyStyleWithoutFill = (workbook, fontFile) => workbook.createStyle({
    font: {
        name: 'XO Oriel',
        src: `url(data:font/truetype;base64,${fontFile.toString('base64')})`,
        size: 10,
    },
    alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
    }
});

/**
 * Заполняет лист транзакциями.
 *
 * @param {Worksheet} worksheet - Рабочий лист.
 * @param {string[]} tableHeader - Данные для заголовка таблицы.
 * @param {string} period - Период за который получены транзакции.
 * @param {Style} nameStyle - Стиль для названия.
 * @param {Style} headingStyle - Стиль для заголовка таблицы.
 * @param {object[]} tableBody - Табличные данные.
 * @param {Style} incomeBodyStyle - Стиль для приходов.
 * @param {Style} outcomeBodyStyle - Стиль для расходов.
 * @param {Style} bodyWithoutFillStyle - Стиль без заполнения.
 */
const fillWorksheetWithTransactions = (worksheet, tableHeader, period, nameStyle, headingStyle,
                                       tableBody, incomeBodyStyle, outcomeBodyStyle,
                                       bodyWithoutFillStyle, ctx) => {
    let row = 1;

    worksheet.cell(row, 1, row, tableHeader.length, true).string(`${ctx.t("report-scene-name")} ${period}`).style(nameStyle);
    row++;

    let headerCellIndex = 0;
    tableHeader.forEach(((head) => {
        worksheet.cell(row, ++headerCellIndex).string(head).style(headingStyle);
    }));
    worksheet.row(row).freeze(tableHeader.length);
    row++;

    const bodyCommentStyle = bodyWithoutFillStyle.toObject();
    bodyCommentStyle.alignment.horizontal = 'left';

    tableBody.forEach((item, i, body) => {
        let column = 1;
        const bodyStyle = item.type === ctx.t("income-button") ? incomeBodyStyle : outcomeBodyStyle;

        worksheet.cell(row, column).number(item.id).style(bodyWithoutFillStyle);
        worksheet.cell(row, ++column).string(item.comment).style(bodyCommentStyle);
        worksheet.cell(row, ++column).date(item.created).style(bodyWithoutFillStyle);
        worksheet.cell(row, ++column).string(item.userName).style(bodyWithoutFillStyle);
        worksheet.cell(row, ++column).string(item.type).style(bodyStyle);
        worksheet.cell(row, ++column).number(item.amount).style(bodyWithoutFillStyle);
        worksheet.cell(row, ++column).string(item.currency).style(bodyWithoutFillStyle);
        worksheet.cell(row, ++column).link(generateLinkForCryptoTransaction(item.crypto_type, item.hash), item.hash).style(bodyWithoutFillStyle);

        row++;
    });

    let column = 1;
    worksheet.column(column).setWidth(10);
    worksheet.column(++column).setWidth(40);
    worksheet.column(++column).setWidth(12);
    worksheet.column(++column).setWidth(15);
    worksheet.column(++column).setWidth(15);
    worksheet.column(++column).setWidth(12);
    worksheet.column(++column).setWidth(10);
    worksheet.column(++column).setWidth(15);
};