import {get, getByUserId} from '../queries/permissionQueries.js';

/**
 * Получает разрешения по идентификатору пользователя и проекта.
 *
 * @param {string} userId - Идентификатор пользователя.
 * @param {string} projectId - Идентификатор проекта.
 * @return {Promise<Permission[]>} Полученные разрешения или [], если их не существует.
 */
export async function getPermissions(userId, projectId) {
    try {
        const permissionsFromDB = await get(userId, projectId);
        if (!permissionsFromDB) {
            throw `Прав доступа для пользователя #${userId} и проекта #${projectId} не существует`;
        }

        console.log(`Были получены права доступа для пользователя #${userId} и проекта #${projectId}`);
        return permissionsFromDB;
    } catch (error) {
        console.error(
            `Произошла ошибка при попытке получить права доступа пользователя #${userId} к проекту #${projectId}:`,
            error
        );
        return [];
    }
}

/**
 * Получает разрешения по идентификатору пользователя.
 *
 * @param {string} userId - Идентификатор пользователя.
 * @return {Promise<Permission[]>} Полученные разрешения или [], если их не существует.
 */
export async function getPermissionsOfUser(userId) {
    try {
        const permissionsFromDB = await getByUserId(userId);
        if (!permissionsFromDB) {
            throw `Прав доступа для пользователя #${userId} не существует`;
        }

        console.log(`Были получены права доступа для пользователя #${userId}`);
        return permissionsFromDB;
    } catch (error) {
        console.error(
            `Произошла ошибка при попытке получить права доступа пользователя #${userId}:`,
            error
        );
        return [];
    }
}