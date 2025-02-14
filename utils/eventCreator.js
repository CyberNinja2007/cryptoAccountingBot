import {getTransactions} from '../db/controllers/transactionController.js';
import {calcBalance} from './kassBotMath/math.js';
import {createEvent} from '../db/controllers/eventsController.js';

/**
 * Создает контрольную точку с сохранением основных данных по проекту
 * @param {} client - Клиент БД
 * @param {string} project_id - Идентификатор проекта
 * @returns {Promise<object|null>} Полученные результаты
 */
export const createControlPoint = async (client, project_id) => {
    const transactions = await getTransactions(project_id);

    const balances = calcBalance(transactions);

    const createControlPointEvent = await createEvent(
        client,
        "create",
        project_id,
        balances,
        "controlPoint"
    );

    if (!createControlPointEvent) {
        return null;
    }

    return balances;
};