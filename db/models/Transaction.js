export class Transaction {
    constructor(id, user_id, account_id, type, currency, amount, comment, created, project_id, hash, crypto_type) {
        this.id = id;
        this.user_id = user_id;
        this.account_id = account_id;
        this.type = type;
        this.currency = currency;
        this.amount = amount;
        this.comment = comment;
        this.created = created;
        this.project_id = project_id;
        this.hash = hash;
        this.crypto_type = crypto_type;
    }
}