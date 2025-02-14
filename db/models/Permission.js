export class Permission {
    constructor(
        user_id,
        project_id,
        permission_id,
        allowed
    ) {
        this.permission_id = permission_id;
        this.user_id = user_id;
        this.project_id = project_id;
        this.allowed = allowed;
    }
}