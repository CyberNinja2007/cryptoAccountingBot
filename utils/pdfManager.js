import fs from 'fs';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable'
import {fileURLToPath} from "url";

const FONT_SIZE = 14;
const TABLE_FONT_SIZE = 10;

/**
 * Создает PDF-документ с данными о транзакциях.
 */
export const createTransactionsPDF = async (transactions, users, period, projects, ctx) => {
    const pdf = new jsPDF("l", "mm", "a4");
    let yCord = setupPDF(pdf, period, ctx);

    let tableHeader = [{
        id: ctx.t("id-header"),
        creatorName: ctx.t("name-header"),
        type: ctx.t("type-header"),
        amount: ctx.t("amount-header"),
        currency: ctx.t("currency-header"),
        created: ctx.t("date-header"),
        comment: ctx.t("comment-header"),
        hash: ctx.t("hash-header")
    }];

    let tableBody = [];

    for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        const transactionId = "#" + transaction.id;
        const date = new Date(transaction.created);
        const user = users.find(u => u.id === transaction.user_id);
        const userName = user.name;

        tableBody.push([
            transactionId,
            userName,
            getTransactionType(transaction.type, ctx),
            formatAmount(transaction.amount),
            transaction.currency,
            formatDate(date),
            transaction.comment,
            transaction.hash
        ]);
    }

    pdf.autoTable({
        startY: yCord,
        head: tableHeader,
        body: tableBody,
        theme: "grid",
        margin: {top: 15, bottom: 15},
        styles: {font: "XO_Oriel", fontStyle: "normal", fontSize: TABLE_FONT_SIZE},
        columnStyles: {
            comment: {cellWidth: 60, overflow: "linebreak"},
            hash: {cellWidth: 30, overflow: "linebreak"},
        },
        rowPageBreak: "auto",
        bodyStyles: {
            valign: "top",
            cellPadding: {top: 3, left: 3, right: 3, bottom: 8},
        },
        willDrawCell: function (data) {
            if (data.section === "head") {
                pdf.setFont("XO_Oriel", "bold");
                pdf.setFillColor(102, 178, 255);
            } else {
                setCellFillColor(pdf, data.row.cells[2].raw, ctx);
            }
        }
    });

    pdf.setFontSize(TABLE_FONT_SIZE);
    pdf.setFont("XO_Oriel", "normal");

    return pdf.output("arraybuffer");
};

/**
 * Устанавливает настройки для PDF-документа и загружает шрифты.
 */
const setupPDF = (pdf, period, ctx) => {
    // Устанавливаем интервал между строками для улучшения читаемости
    pdf.setLineHeightFactor(1.5);
    let yCoord = 18;

    // Загружаем шрифты
    loadFont(
        pdf,
        fileURLToPath(new URL("../fonts/XO_Oriel_Nu.ttf", import.meta.url)),
        "XO_Oriel",
        "normal"
    );
    loadFont(
        pdf,
        fileURLToPath(new URL("../fonts/XO_Oriel_Bu.ttf", import.meta.url)),
        "XO_Oriel",
        "bold"
    );
    loadFont(
        pdf,
        fileURLToPath(new URL("../fonts/XO_Oriel_Ni.ttf", import.meta.url)),
        "XO_Oriel",
        "italic"
    );

    // Устанавливаем размер и стиль шрифта для заголовка
    pdf.setFontSize(FONT_SIZE);
    pdf.setFont("XO_Oriel", "bold");
    // Отображаем заголовок отчёта по центру страницы
    pdf.text(`${ctx.t("report-scene-name")} ${period}`, 105, yCoord, {
        align: "center",
        maxWidth: 150,
    });
    // Увеличиваем координату y на высоту текста и интервал
    yCoord += 5 + pdf.getLineHeight();

    // Возвращаем начальную координату y для отображения контента
    return yCoord;
};

/**
 * Загружает шрифт в PDF-документ из указанного пути.
 *
 * @param {Object} pdf - Объект PDF-документа.
 * @param {string} fontPath - Путь к файлу шрифта.
 * @param {string} fontName - Имя шрифта.
 * @param {string} fontStyle - Стиль шрифта (normal, bold, italic).
 */
const loadFont = (pdf, fontPath, fontName, fontStyle) => {
    const fontData = fs.readFileSync(fontPath, {encoding: "base64"});
    pdf.addFileToVFS(fontPath, fontData);
    pdf.addFont(fontPath, fontName, fontStyle);
};

/**
 * Возвращает строковое представление типа транзакции на русском языке.
 */
const getTransactionType = (type, ctx) => {
    return type === "in" ? ctx.t("income-button") : ctx.t("outcome-button") ;
};

/**
 * Форматирует сумму для отображения в отчёте.
 *
 * @param {number} amount - Сумма транзакции.
 * @returns {string} Отформатированная строка с суммой.
 */
const formatAmount = (amount) => {
    return amount.toLocaleString("de", {maximumFractionDigits: 2});
};

/**
 * Форматирует дату для отображения в отчёте.
 *
 * @param {Date} date - Объект даты.
 * @returns {string} Отформатированная строка с датой.
 */
const formatDate = (date) => {
    return date.toLocaleString("ru", {timeZone: "EET"}).slice(0, -3);
};

/**
 * Устанавливает цвет заливки ячейки таблицы в зависимости от типа транзакции.
 */
const setCellFillColor = (pdf, cellValue, ctx) => {
    if (cellValue === ctx.t("income-button")) {
        pdf.setFillColor(229, 255, 204);
    } else if (cellValue === ctx.t("outcome-button")) {
        pdf.setFillColor(255, 204, 204);
    }
};
