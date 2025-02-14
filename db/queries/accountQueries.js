import {pool} from '../db.js';

const accountsTable = process.env.ACCOUNTS_TABLE;

/**
 * Получить запись из таблицы по идентификатору Telegram.
 *
 * @param {number} telegramId - Идентификатор Telegram.
 * @returns {Promise<Account>} Объект, удовлетворяющий запросу.
 */
export async function get(telegramId) {
    const query = `SELECT account_id as id, fk_user_id as user_id, telegram_id FROM ${accountsTable} WHERE telegram_id = ${telegramId}`;
    const {rows: [account]} = await pool.query(query);
    return account;
}