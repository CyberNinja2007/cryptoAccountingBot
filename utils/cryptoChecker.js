import {getCryptoTransactions} from "../db/controllers/CryptoTransactionController.js";

const ACCEPTABLE_DIFFERENCE = 1;

export const checkCrypto = async (transaction) => {
    const cryptoTransactions = await getCryptoTransactions(transaction.hash);

    let cryptoTransactionsSum = 0;

    cryptoTransactions.forEach((cryptoTransaction) => {
        cryptoTransactionsSum += cryptoTransaction.amount;
    });

    const difference = Math.abs(cryptoTransactionsSum - transaction.amount);

    return difference <= ACCEPTABLE_DIFFERENCE;
}