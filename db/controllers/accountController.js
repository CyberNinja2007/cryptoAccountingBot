import {get} from '../queries/accountQueries.js';
import {Account} from '../models/Account.js';

/**
 * Получить аккаунт по идентификатору Telegram.
 *
 * @param {number} telegramId - Идентификатор Telegram аккаунта.
 * @returns {Promise<Account | null>} Аккаунт или null в случае ошибки.
 */
export async function getAccount(telegramId) {
    try {
        const account = await get(telegramId);

        if (!account) {
            console.log(`Аккаунта с telegram_id ${telegramId} не существует`);
            return null;
        }

        console.log(`Был получен аккаунт с telegram_id ${telegramId}`);

        return account;
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить аккаунт с telegram_id ${telegramId}`, error);
        return null;
    }
}