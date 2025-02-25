export class Project {
    constructor(id, name, type, crypto_only, fullReportOnly) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.crypto_only = crypto_only;
        this.full_report_only = fullReportOnly;
    }
}
