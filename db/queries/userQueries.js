import {pool} from '../db.js';

const table = process.env.USERS_TABLE;

/**
 * Получить пользователя по его идентификатору.
 * @param {string} id - Идентификатор пользователя.
 * @returns {Promise<User>} Объект пользователя.
 */
export async function get(id) {
    const query = `SELECT user_id as id, user_name as name, user_status as status, user_locale as locale FROM ${table} WHERE user_id = $1`;
    const values = [id];
    const {rows: [user]} = await pool.query(query, values);
    return user;
}

/**
 * Получить всех пользователей.
 * @returns {Promise<Array<User>>} Массив объектов всех пользователей.
 */
export async function getAll() {
    const query = `SELECT user_id as id, user_name as name, user_status as status, user_locale as locale FROM ${table}`;
    const result = await pool.query(query);
    return result.rows;
}