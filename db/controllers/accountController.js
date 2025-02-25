import {get, getByUserId} from '../queries/accountQueries.js';
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
        console.error(`Произошла ошибка при попытке получить аккаунт с telegram_id ${telegramId}:`, error);
        return null;
    }
}

/**
 * Получить аккаунт по идентификатору пользователя.
 *
 * @param {number} userId - Идентификатор пользователя.
 * @returns {Promise<Account[]>} Список аккаунтов.
 */
export async function getAccountByUserId(userId) {
    try {
        const accounts = await getByUserId(userId);

        if (!accounts) {
            console.log(`Аккаунтов для пользователя с id ${userId} не существует`);
            return [];
        }

        console.log(`Были получены все (${accounts.length}) аккаунты для пользователя ${userId}`);

        return accounts;
    } catch (error) {
        console.error(`Произошла ошибка при попытке получить аккаунты для пользователя с id ${userId}:`, error);
        return [];
    }
}