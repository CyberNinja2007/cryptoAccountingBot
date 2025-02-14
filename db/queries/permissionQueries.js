import {pool} from '../db.js';

const permissionsTable = process.env.PERMISSIONS_TABLE;

/**
 * Получить запись из таблицы по идентификатору пользователя и проекта.
 *
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} projectId - Идентификатор проекта.
 * @returns {Promise<Permission[]>} Массив объектов, удовлетворяющих запросу.
 */
export async function get(userId, projectId) {
    const query =
        `SELECT fk_user_id as user_id, fk_project_id as project_id, fk_permission_id as permission_id, allowed ` +
        `FROM ${permissionsTable} WHERE fk_user_id = $1 AND fk_project_id = $2 ORDER BY fk_permission_id`;
    const values = [userId, projectId];
    const result = await pool.query(query, values);
    return result.rows;
}

/**
 * Получить запись из таблицы по идентификатору пользователя.
 *
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<Permission[]>} Массив объектов, удовлетворяющих запросу.
 */
export async function getByUserId(userId) {
    const query =
        `SELECT fk_user_id as user_id, fk_project_id as project_id, fk_permission_id as permission_id, allowed ` +
        `FROM ${permissionsTable} WHERE fk_user_id = $1 ORDER BY fk_project_id,fk_permission_id`;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
}