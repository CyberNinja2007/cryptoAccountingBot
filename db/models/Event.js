export class Event {
    constructor(
        id,
        type,
        created,
        object_id,
        object_data,
        object_type
    ) {
        this.id = id;
        this.type = type;
        this.created = created;
        this.object_id = object_id;
        this.object_data = object_data;
        this.object_type = object_type;
    }
}