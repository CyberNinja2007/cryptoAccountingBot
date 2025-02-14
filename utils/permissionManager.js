import {getPermissions, getPermissionsOfUser} from "../db/controllers/permissionController.js";
import {permissionsEnum} from "./permissionsEmum.js";
import {Permission} from "../db/models/Permission.js";

/**
 * Возвращает значение права доступа.
 *
 * @param {string} userId - Идентификатор пользователя
 * @param {string} projectId - Идентификатор проекта
 * @param {string} permissionId - Идентификатор разрешения
 * @return {Promise<boolean>} Дозволено или нет.
 */
export const checkUserPermission = async (userId, projectId, permissionId) => {
    const permissions = await getPermissions(userId, projectId);
    const permission = permissions.find((permission) => permission.permission_id === permissionId);
    return permission !== undefined && permission !== null ? permission.allowed : false;
}

/**
 * Возвращает значение права доступа.
 *
 * @param {string} userId - Идентификатор пользователя
 * @return {Promise<number>} Кол-во проектов.
 */
export const countProjectsWithPermissions = async (userId) => {
    const permissions = await getPermissionsOfUser(userId);
    const countOfProjects = permissions.length > 0 ? [...new Set(permissions.map((permission) => permission.project_id))].length : 0;

    return countOfProjects;
}

/**
 * Возвращает значение права доступа.
 *
 * @param {string} userId - Идентификатор пользователя
 * @param {string} projectId - Идентификатор проекта
 * @return {Promise<Permission[]>} Кол-во проектов.
 */
export const getUserProjectPermissions = async (userId, projectId) => {
    return await getPermissions(userId, projectId);
}

/**
 * Возвращает доступ пользователя к возможности перевода в проекте
 *
 * @param {string} userId - Идентификатор пользователя
 * @param {string} projectId - Идентификатор проекта
 * @return {Promise<boolean>} Значение доступа.
 */
export const checkIfUserOperator = async (userId, projectId) => {
    try {
        const permissions = await getPermissions(userId, projectId);

        return permissions.find(p => p.permission_id === permissionsEnum["project"] && p.allowed) &&
            (permissions.find(p => p.permission_id === permissionsEnum["income"] && p.allowed) ||
                permissions.find(p => p.permission_id === permissionsEnum["outcome"] && p.allowed));
    } catch (e) {
        console.log("При проверке доступа пользователя к возможности перевода в проекте возникла ошибка:", e);
        return false;
    }
}