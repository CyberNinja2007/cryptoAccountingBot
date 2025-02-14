import {get, getAll} from '../queries/userQueries.js';
import {User} from '../models/User.js';

/**
 * Получает всех пользователей из базы данных.
 * @return {Promise<User[] | null>} Массив существующих пользователей или null, если произошла ошибка.
 */
export async function getUsers() {
    try {
        const users = await getAll();
        if (!users) {
            throw "Пользователей в системе не существует";
        }

        console.log(`Были получены все(${users.length}) пользователи`);
        return users;
    } catch (error) {
        console.error(
            "Произошла ошибка при попытке получить всех пользователей:",
            error
        );
        return null;
    }
}

/**
 * Получает пользователя по идентификатору.
 *
 * @param {string} userId - Идентификатор пользователя.
 * @return {User|null} Полученный пользователь или null, если пользователь не существует.
 */
export async function getUserById(userId) {
    try {
        const user = await get(userId);
        if (!user) {
            throw `Пользователя #${userId} не существует`;
        }

        console.log(`Был получен пользователь #${userId}`);
        return user;
    } catch (error) {
        console.error(
            `Произошла ошибка при попытке получить пользователя #${userId}:`,
            error
        );
        return null;
    }
}
