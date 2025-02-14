import {create} from '../queries/eventQueries.js';
import {Event} from '../models/Event.js';

/**
 * Создать новое событие в базе данных.
 *
 * @param {} client - Клиент БД
 * @param {string} type - Тип события.
 * @param {number | string} objectId - Идентификатор объекта события.
 * @param {object} objectData - Данные объекта события.
 * @param {string} objectType - Тип объекта события.
 * @returns {Promise<Event | null>} Объект Event, представляющий созданное событие, или null в случае ошибки.
 */
export async function createEvent(client, type, objectId, objectData, objectType = "transaction") {
    try {
        const createdEvent = await create(client, type, objectId, objectData, objectType);
        if (!createdEvent) {
            throw `Не удалось создать ${type} событие для ${objectId} объекта #${objectId}`;
        }

        console.log(`Было создано новое ${type} событие для ${objectId} объекта #${objectId}`);

        return createdEvent;
    } catch (error) {
        console.error(`Произошла ошибка при попытке создать новое ${type} событие для ${objectId} объекта #${objectId}:`, error);
        return null;
    }
}