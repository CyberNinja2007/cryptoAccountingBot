/**
 * Возвращает текущую дату понедельника на текущей неделе.
 * @returns {Date} Дата понедельника.
 */
export const getCurrentMondayDate = () => {
    const currentDate = new Date();
    const currentWeekday = currentDate.getDay();

    const daysUntilMonday = currentWeekday === 0 ? 6 : currentWeekday - 1;

    const currentMondayDate = new Date(currentDate);
    currentMondayDate.setDate(currentDate.getDate() - daysUntilMonday);

    return currentMondayDate;
};

/**
 * Возвращает первый день указанного месяца (или текущего месяца, если month не указан).
 * @param {number} [month] - Номер месяца (0-11).
 * @returns {Date} Первый день месяца.
 */
export const getFirstDayOfMonth = (month) => {
    const currentDate = new Date();
    return new Date(currentDate.getFullYear(), (month ? month : currentDate.getMonth()), 1);
};

/**
 * Возвращает последний день указанного месяца (или текущего месяца, если month не указан).
 * @param {number} [month] - Номер месяца (0-11).
 * @returns {number} Последний день месяца (число дней в месяце).
 */
export const getLastDayOfMonth = (month) => {
    const currentDate = new Date();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), (month ? month : currentDate.getMonth()), 0);
    return lastDayOfMonth.getDate();
};

/**
 * Возвращает дату в зоне UCT.
 * @param {string} [dateString] - Изначальная строка с датой.
 * @returns {Date} Та же дата, но в зоне UTC.
 */
export const toUTC = (dateString) => {
    const date = new Date(dateString);

    const offset = date.getTimezoneOffset();

    const utcDate = new Date(date.getTime() + (offset * 60000));

    return utcDate;
}