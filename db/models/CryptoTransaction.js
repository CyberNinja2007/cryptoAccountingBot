export class CryptoTransaction {
    constructor(id, hash, amount, token, created) {
        this.id = id;
        this.hash = hash;
        this.amount = amount;
        this.token = token;
        this.created = created;
    }
}