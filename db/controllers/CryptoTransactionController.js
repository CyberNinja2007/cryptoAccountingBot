import {createCrypto, getCryptoTransactionsByHash} from "../queries/cryptoTransactionQueries.js";

/**
 * Получить все крипто-транзакции по хешу.
 *
 * @param {string} hash - Хэш крипто-транзакции.
 * @returns {Promise<CryptoTransaction[]>} Массив полученных транзакций.
 */
export async function getCryptoTransactions(hash) {
    try {
        const transactions = await getCryptoTransactionsByHash(hash);

        if (!transactions || transactions.length === 0) {
            console.log(`Крипто-Транзакций не существует для хеша ${hash}`);
            return [];
        }

        console.log(`Было получено ${transactions.length} крипто-транзакций по хешу ${hash}`);
        return transactions.map((transaction) => {
            return {
                ...transaction,
                amount: parseFloat(transaction.amount)
            }
        });
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить крипто-транзакции по хешу ${hash}:`, error);
        return [];
    }
}

/**
 * Создать новую транзакцию для указанного пользователя и проекта.
 *
 * @param {} client - Клиент БД
 * @param {number} amount - Сумма транзакции.
 * @param {string} token - Токен.
 * @param {string} hash - Хэш крипто-транзакции.
 * @returns {Promise<CryptoTransaction | null>} Созданная транзакция, или null в случае ошибки.
 */
export async function createCryptoTransaction(client, amount, token, hash) {
    try {
        const transaction =
            await createCrypto(client, amount, token, hash);

        if (!transaction) {
            throw `Крипто-транзакция на сумму ${amount} ${token} для хеша ${hash} не была создана.`;
        }

        console.log(`Была создана новая крипто-транзакция #${transaction.id}`);
        return {
            ...transaction,
            amount: parseFloat(transaction.amount),
        };
    } catch (error) {
        console.error(`Произошла ошибка при попытке создать крипто-транзакцию на сумму ${amount} ${token} для хеша ${hash}:`, error);
        return null;
    }
}
