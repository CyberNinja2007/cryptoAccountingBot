import {pool} from '../db.js';

const CRYPTO_TRANSACTIONS_TABLE = process.env.CRYPTO_TRANSACTIONS_TABLE;

/**
 * Получить все транзакции для определенного проекта.
 * @returns {Promise<Array<CryptoTransaction>>} Крипто-транзакции.
 */
export async function getCryptoTransactionsByHash(hash) {
    const query =
        `SELECT crypto_transaction_id as id, hash, amount, token, created FROM ${CRYPTO_TRANSACTIONS_TABLE} ` +
        `WHERE hash = '${hash}'`;
    const result = await pool.query(query);
    return result.rows;
}

/**
 * Создать крипто-транзакцию.
 *
 * @param {} client - Клиент БД
 * @param {number} amount - Сумма.
 * @param {string} token - Токен.
 * @param {string} hash - Хэш транзакции.
 * @returns {Promise<CryptoTransaction>} - Новую крипто-транзакцию.
 */
export async function createCrypto(client, amount, token, hash) {
    const query =
        `INSERT INTO ${CRYPTO_TRANSACTIONS_TABLE} ` +
        '(hash, amount, token) ' +
        `VALUES ($1, $2, $3) ` +
        `RETURNING crypto_transaction_id as id, hash, amount, token, created;`;
    const values = [hash, amount, token];
    const {rows: [newTransaction]} = await client.query(query, values);
    return newTransaction;
}