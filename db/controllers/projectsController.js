import {getAll, getCurrencies} from '../queries/projectQueires.js';

/**
 * Получить все проекты из базы данных.
 *
 * @returns {Promise<Project[] | null>} Массив полученных проектов, или null в случае ошибки.
 */
export async function getProjects() {
    try {
        const projects = await getAll();

        if (!projects || projects.length === 0) {
            console.log("Проектов в системе не существует");
            return [];
        }

        console.log(`Были получены все(${projects.length}) проекты`);
        return projects;
    } catch (error) {
        console.error("Произошла ошибка при попытке получить все проекты:", error);
        return null;
    }
}

/**
 * Получить валюту по указанному идентификатору проекта из базы данных.
 *
 * @param {string} id - Идентификатор проекта.
 * @returns {Promise<Array<Currency>>} Массив объектов проекта.
 */
export async function getProjectCurrencies(id) {
    try {
        const currencies = await getCurrencies(id);

        if (!currencies || currencies.length === 0) {
            throw `Валют для проекта #${id} не существует`;
        }

        console.log(`Были получены валюты для проекта #${id}`);

        return currencies;
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить валюты проекта #${id}:`, error);
        return null;
    }
}
