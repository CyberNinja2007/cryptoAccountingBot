import {create, get, getAll, getBetween,} from '../queries/transactionQueries.js';
import {Transaction} from '../models/Transaction.js';

/**
 * Получить все транзакции для указанного пользователя и проекта или все транзакции для проекта, если не указан пользователь.
 *
 * @param {string} projectId - Идентификатор проекта.
 * @param {string} userId - Идентификатор пользователя.
 * @param {number} limit - Максимальное кол-во записей.
 * @param {number} offset - Смещение для получения записей.
 * @param {string} sorting - Вид сортировки для записей (DESC или ASC).
 * @returns {Promise<Transaction[]>} Массив полученных транзакций.
 */
export async function getTransactions(projectId, userId = undefined,
                                      limit = undefined, offset = undefined, sorting = "ASC") {
    try {
        const transactions = userId ?
            await get(userId, projectId, limit, offset, sorting) :
            await getAll(projectId, limit, offset, sorting);

        if (!transactions || transactions.length === 0) {
            console.log(`Транзакций не существует для пользователя #${userId} и/или проекта #${projectId}`);
            return [];
        }

        console.log(`Было получено ${transactions.length} транзакций для проекта #${projectId} и пользователя #${userId}`);
        return transactions;
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить транзакции для пользователя #${userId} и/или проекта #${projectId}:`, error);
        return [];
    }
}

/**
 * Получить транзакции между указанными датами для указанного проекта.
 *
 * @param {Date} start - Начальная дата в формате 'YYYY-MM-DD'.
 * @param {Date} end - Конечная дата в формате 'YYYY-MM-DD'.
 * @param {string} projectId - Идентификатор проекта.
 * @returns {Promise<Transaction[]>} Массив полученных транзакций.
 */
export async function getTransactionsBetween(start, end, projectId) {
    try {
        const transactions = await getBetween(start, end, projectId);

        if (!transactions || transactions.length === 0) {
            throw `Транзакций не существует в период с ${start} по ${end}`;
        }

        console.log(`Было получено ${transactions.length} транзакций в период с ${start} по ${end}`);
        return transactions;
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить транзакции в период с ${start} по ${end}:`, error);
        return [];
    }
}

/**
 * Создать новую транзакцию для указанного пользователя и проекта.
 *
 * @param {} client - Клиент БД
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} accountId - Идентификатор счета.
 * @param {string} type - Тип транзакции ('in' или 'out').
 * @param {string} currency - Валюта транзакции.
 * @param {string} comment - Комментарий к транзакции.
 * @param {number} amount - Сумма транзакции.
 * @param {string} projectId - Идентификатор проекта отправителя.
 * @param {string} hash - Хэш крипто-транзакции.
 * @param {string} cryptoType - Тип крипто-транзакции.
 * @param {string | null} category - Категория.
 * @returns {Promise<Transaction | null>} Созданная транзакция, или null в случае ошибки.
 */
export async function createTransaction(client, userId, accountId, type, currency,
                                        comment, amount, projectId, hash, cryptoType, category = null) {
    try {
        const transaction =
            await create(client, userId, accountId, type, currency, comment, amount, projectId, hash, cryptoType, category);

        if (!transaction) {
            throw `Транзакция на сумму ${amount} для пользователя ${userId} не была создана.`;
        }

        console.log(`Была создана новая транзакция #${transaction.id} пользователем #${userId} с аккаунта #${accountId}`);
        return transaction;
    } catch (error) {
        console.error(`Произошла ошибка при попытке создать транзакцию пользователем #${userId} с аккаунта #${accountId}:`, error);
        return null;
    }
}
