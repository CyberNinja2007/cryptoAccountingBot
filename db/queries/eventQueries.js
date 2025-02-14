const table = process.env.EVENTS_TABLE;

/**
 * Создать новое событие.
 *
 * @param {} client - Клиент БД
 * @param {string} event_type - Тип события.
 * @param {number | string} object_id - Идентификатор объекта.
 * @param {Object} object_data - Данные объекта в виде строки.
 * @param {string} object_type - Тип объекта в виде строки.
 * @returns {Promise<Event>} Объект созданного события.
 */
export async function create(client, event_type, object_id, object_data, object_type) {
    const query =
        `INSERT INTO ${table} (event_type, object_id, object_data, object_type) VALUES ($1, $2, $3, $4)` +
        `RETURNING event_id as id, event_type as type, created, object_id, object_data, object_type`;
    const values = [event_type, object_id, object_data, object_type];
    const {rows: [event]} = await client.query(query, values);
    return event;
}
