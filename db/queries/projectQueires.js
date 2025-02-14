import {pool} from '../db.js';

const projectsTable = process.env.PROJECTS_TABLE;
const projectCurrenciesTable = process.env.PROJECT_CURRENCIES_TABLE;
const currenciesTable = process.env.CURRENCIES_TABLE;

/**
 * Получить все проекты.
 * @returns {Promise<Array<Project>>} Массив объектов всех проектов.
 */
export async function getAll() {
    const query = `SELECT project_id as id, project_name as name, project_type as type FROM ${projectsTable} ORDER BY project_id`;
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Получить проект по идентификатору.
 * @param {string} id - Идентификатор проекта.
 * @returns {Promise<Array<Currency>>} Массив объектов проекта.
 */
export async function getCurrencies(id) {
    const query = `SELECT c.currency_id as id, c.currency_name as name ` +
        `FROM ${projectCurrenciesTable} pc JOIN ${currenciesTable} c ON pc.fk_currency_id = c.currency_id WHERE pc.fk_project_id = $1`;
    const values = [id];
    const {rows: currencies} = await pool.query(query, values);
    return currencies;
}