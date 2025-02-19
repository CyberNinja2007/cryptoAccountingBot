import {pool} from '../db.js';

const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE;
const CURRENCIES_TABLE = process.env.CURRENCIES_TABLE;

/**
 * Получить транзакции для определенного пользователя и проекта.
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} projectId - Идентификатор проекта.
 * @param {number} limit - Максимальное кол-во записей.
 * @param {number} offset - Смещение для получения записей.
 * @param {string} sorting - Вид сортировки для записей (DESC или ASC).
 * @returns {Promise<Array<Transaction>>} Массив объектов транзакций.
 */
export async function get(userId, projectId, limit, offset, sorting) {
    const query =
        `SELECT t.transaction_id as id, t.fk_user_id as user_id, t.fk_account_id as account_id, t.type, ` +
        `c.currency_name as currency, t.amount, t.comment, t.created, t.fk_project_id as project_id, t.hash, t.crypto_type FROM ${TRANSACTIONS_TABLE} t ` +
        `JOIN ${CURRENCIES_TABLE} c ON t.fk_currency_id = c.currency_id ` +
        `WHERE t.fk_user_id = $1 AND t.fk_project_id = $2 ` +
        `ORDER BY t.transaction_id ${sorting} ` +
        `${limit ? "LIMIT " + limit : ""} ` +
        `${offset ? "OFFSET " + offset : ""} `;
    const result = await pool.query(query, [userId, projectId]);
    return result.rows.map(t => {
        return {
            ...t,
            id: +t.id,
            amount: parseFloat(t.amount),
            created: new Date(t.created)
        }
    });
}

/**
 * Получить все транзакции для определенного проекта.
 * @param {string} projectId - Идентификатор проекта.
 * @param {number} limit - Максимальное кол-во записей.
 * @param {number} offset - Смещение для получения записей.
 * @param {string} sorting - Вид сортировки для записей (DESC или ASC).
 * @returns {Promise<Array<Transaction>>} Массив объектов транзакций.
 */
export async function getAll(projectId, limit, offset, sorting) {
    const query =
        `SELECT t.transaction_id as id, t.fk_user_id as user_id, t.fk_account_id as account_id, t.type, ` +
        `c.currency_name as currency, t.amount, t.comment, t.created, t.fk_project_id as project_id, t.hash, t.crypto_type FROM ${TRANSACTIONS_TABLE} t ` +
        `JOIN ${CURRENCIES_TABLE} c ON t.fk_currency_id = c.currency_id ` +
        `WHERE t.fk_project_id = $1 ` +
        `ORDER BY t.transaction_id ${sorting} ` +
        `${limit ? "LIMIT " + limit : ""} ` +
        `${offset ? "OFFSET " + offset : ""} `;
    const result = await pool.query(query, [projectId]);
    return result.rows.map(t => {
        return {
            ...t,
            id: +t.id,
            amount: parseFloat(t.amount),
            created: new Date(t.created)
        }
    });
}

/**
 * Получить транзакции между определенными датами для определенного проекта.
 * @param {Date} startDate - Начальная дата.
 * @param {Date} endDate - Конечная дата.
 * @param {string} projectId - Идентификатор проекта.
 * @returns {Promise<Array<Transaction>>} Массив объектов транзакций.
 */
export async function getBetween(startDate, endDate, projectId) {
    const query =
        `SELECT t.transaction_id as id, t.fk_user_id as user_id, t.fk_account_id as account_id, t.type, ` +
        `c.currency_name as currency, t.amount, t.comment, t.created, t.fk_project_id as project_id, t.hash, t.crypto_type FROM ${TRANSACTIONS_TABLE} t ` +
        `JOIN ${CURRENCIES_TABLE} c ON t.fk_currency_id = c.currency_id ` +
        `WHERE t.created BETWEEN $1 AND $2 ` +
        `AND t.fk_project_id = $3 ` +
        `ORDER BY t.transaction_id ASC`;
    const result = await pool.query(query, [startDate, endDate, projectId]);
    return result.rows.map(t => {
        return {
            ...t,
            id: +t.id,
            amount: parseFloat(t.amount),
            created: new Date(t.created)
        }
    });
}

/**
 * Создать новую транзакцию.
 * @param {} client - Клиент БД
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} accountId - Идентификатор аккаунта.
 * @param {string} type - Тип транзакции ('in' или 'out').
 * @param {string} currency - Валюта транзакции.
 * @param {string} comment - Комментарий к транзакции.
 * @param {number} amount - Сумма транзакции.
 * @param {string} projectId - Идентификатор проекта отправителя.
 * @param {string} hash - Хэш крипто-транзакции.
 * @param {string} cryptoType - Тип крипто-транзакции.
 * @param {string} category - Категория.
 * @returns {Promise<Transaction>} Объект новой транзакции.
 */
export async function create(client, userId, accountId, type, currency,
                             comment, amount, projectId, hash, cryptoType, category) {
    const query =
        `WITH inserted_transaction AS (` +
        `INSERT INTO ${TRANSACTIONS_TABLE} ` +
        `(fk_user_id, fk_account_id, type, fk_currency_id, comment, amount, fk_project_id, hash, crypto_type, category) ` +
        `VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *) ` +
        `SELECT t.transaction_id as id, t.fk_user_id as user_id, t.fk_account_id as account_id, t.type, ` +
        `c.currency_name as currency, t.amount, t.comment, t.created, t.fk_project_id as project_id, t.hash, t.crypto_type, t.category FROM inserted_transaction t ` +
        `JOIN ${CURRENCIES_TABLE} c ON t.fk_currency_id = c.currency_id`;
    const values = [userId, accountId, type, currency, comment, amount, projectId, hash, cryptoType, category];
    const {rows: [newTransaction]} = await client.query(query, values);
    return {
        ...newTransaction,
        id: +newTransaction.id,
        amount: parseFloat(newTransaction.amount),
        created: new Date(newTransaction.created)
    };
}