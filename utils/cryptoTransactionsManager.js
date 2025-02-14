import axios from 'axios';
import {readJsonFile} from "./jsonHelper.js";
import {fileURLToPath} from "url";

const configFilePath = fileURLToPath(new URL('../config.json', import.meta.url));
const config = readJsonFile(configFilePath);
const tronScanKeys = config.apiKeys.tronscan;
const etherScanKeys = config.apiKeys.etherscan;
const bscScanKeys = config.apiKeys.bscscan;

let tronScanKeyIndex = 0;
let etherScanKeyIndex = 0;
let bscScanKeyIndex = 0;

const MAX_TRANSACTIONS_COUNT = 200;
const DEFAULT_TOKEN_DECIMALS = 6;
const DEFAULT_ETHER_AND_BSC_DECIMALS = 18;
const DEFAULT_BTC_DECIMALS = 8;
const TETHER_ETHERSCAN_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const BSC_USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

const getNextTronscanKey = () => {
    const key = tronScanKeys[tronScanKeyIndex];
    tronScanKeyIndex = (tronScanKeyIndex + 1) % tronScanKeys.length;
    return key;
};

const getNextEtherscanKey = () => {
    const key = etherScanKeys[etherScanKeyIndex];
    etherScanKeyIndex = (etherScanKeyIndex + 1) % etherScanKeys.length;
    return key;
};

const getNextBscKey = () => {
    const key = bscScanKeys[bscScanKeyIndex];
    bscScanKeyIndex = (bscScanKeyIndex + 1) % bscScanKeys.length;
    return key;
};

const createRateLimiter = (maxCallsPerSecond, interval = 1500) => {
    let tokens = maxCallsPerSecond;
    const queue = [];

    setInterval(() => {
        tokens = maxCallsPerSecond;
        while (queue.length && tokens > 0) {
            const {resolve} = queue.shift();
            tokens--;
            resolve();
        }
    }, interval);

    return () => {
        if (tokens > 0) {
            tokens--;
            return Promise.resolve();
        }
        return new Promise(resolve => queue.push({resolve}));
    };
};

const limiter = createRateLimiter(4);

const makeTronscanRequest = async (path) => {
    const key = getNextTronscanKey();
    return axios.get(`${process.env.TRONSCAN_API_URL}${path}`, {
        headers: {
            'TRON-PRO-API-KEY': key
        }
    });
}

const makeEtherscanRequest = async (path) => {
    const key = getNextEtherscanKey();
    return axios.get(`${process.env.ETHERSCAN_API_URL}${path}&apikey=${key}`);
}

const makeBscRequest = async (path) => {
    const key = getNextBscKey();
    return axios.get(`${process.env.BSC_API_URL}${path}&apikey=${key}`);
}

const makeBTCRequest = async (path) => {
    return axios.get(`${process.env.BTC_API_URL}${path}`);
}

/**
 * Получить все токены по указанному кошельку.
 *
 * @param {string} walletAddress - Адрес кошелька.
 * @returns {Promise<object[]>} Массив токенов.
 */
export const getTokensByWallet = async (walletAddress) => {
    await limiter()
    const getTokensResponse = await makeTronscanRequest(`account/wallet?address=${walletAddress}&asset_type=0`)
        .catch(e => {
            console.error(`При попытке получить токены по кошельку ${walletAddress} возникла ошибка:`, e);
            return {data: {data: [null]}};
        });

    return getTokensResponse.data;
};

/**
 * Получить транзакции по кошельку и токену.
 *
 * @param {string} walletAddress - Адрес кошелька.
 * @param {object} token - Токен.
 * @returns {Promise<object[]|null>} Массив полученных транзакций.
 */
export const getTransactionsByTokenAndWallet = async (walletAddress, token) => {
    const tokenTypeQuery = token.type === 0 ? "trx" : token.type === 10 ? "token10" : "trc20";
    const tokenIdQuery = token.type === 0 ? "" : token.type === 10 ? `&trc10Id=${token.id}` : `&trc20Id=${token.id}`;

    let transactions = [];
    let start = 0;
    const transactionsPerPage = 20;

    let needToGetTransactions = true;
    while (needToGetTransactions) {
        await limiter()
        const nextTransactions =
            (makeTronscanRequest(`transfer/${tokenTypeQuery}?address=${walletAddress}${tokenIdQuery}&start=${start}&limit=${transactionsPerPage}&direction=0`)
            .catch(e => {
                console.error(`При попытке получить транзакции по кошельку ${walletAddress} возникла ошибка:`, e);
                return {data: {code: 400}};
            })).data;

        if (nextTransactions.code !== 200) {
            return null;
        }

        transactions.push(...nextTransactions.data);

        if (nextTransactions.page_size < transactionsPerPage || start + transactionsPerPage > MAX_TRANSACTIONS_COUNT) {
            needToGetTransactions = false;
        } else {
            start += transactionsPerPage;
        }
    }

    return transactions;
};

/**
 * Получить подробную информацию о транзакции по её хэшу.
 *
 * @param {string} hash - Хэш транзакции.
 * @param {string} type - Тип транзакции.
 * @returns {Promise<Object[]>} Подробная информация по транзакции.
 */
export const getInfoAboutTransactionByHash = async (hash, type) => {
    let transactionData = [];
    await limiter()
    if (type === "tronscan") {
        const tronscanTransactionData = (await makeTronscanRequest(`transaction-info?hash=${hash}`).catch(e => {
            console.error(`При попытке получить подробную информацию по тронскан транзакции ${hash} возникла ошибка:`, e);
            return {data: {contractData: null}};
        })).data;

        if (tronscanTransactionData.contractData !== null)
            if (tronscanTransactionData.contractData.data) {
                for (const transferData of tronscanTransactionData.transfersAllList) {
                    transactionData.push({
                        hash,
                        type,
                        amount: (Number.parseFloat(transferData.amount_str) / Math.pow(10, transferData.decimals)),
                        token: transferData.symbol
                    });
                }
            } else
                transactionData.push({
                    hash,
                    type,
                    amount:
                        (Number.parseFloat(tronscanTransactionData.contractData.amount) /
                            Math.pow(10, (tronscanTransactionData.contractData.tokenInfo ?
                                tronscanTransactionData.contractData.tokenInfo.tokenDecimal : DEFAULT_TOKEN_DECIMALS))),
                    token: tronscanTransactionData.contractData.tokenInfo ? tronscanTransactionData.contractData.tokenInfo.tokenAbbr : "TRX"
                });
        else return [];
    } else if (type === "etherscan") {
        let transactionInfo = (await makeEtherscanRequest(
            `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}`)).data;

        if (transactionInfo.error) {
            console.log(`При попытке получить информацию по эзерскан транзакции ${hash} возникла ошибка:`, transactionInfo.message);
            return [];
        }

        if (transactionInfo.result.to.toLowerCase() === TETHER_ETHERSCAN_ADDRESS.toLowerCase()) {
            await limiter();
            const transactionReceipt = (await makeEtherscanRequest(
                `?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}`)).data;

            if (transactionReceipt.error) {
                console.log(`При попытке получить более подробную информацию по эзерскан транзакции ${hash} возникла ошибка:`, transactionInfo.message);
                return [];
            }

            if(transactionReceipt.result === null){
                console.log(`При попытке получить более подробную информацию по эзерскан транзакции ${hash} возникла ошибка: Информации нет!`);
                return [];
            }

            transactionReceipt.result.logs.forEach(log => {
                transactionData.push({
                    hash,
                    type,
                    amount:
                        (Number.parseInt(log.data) / Math.pow(10, DEFAULT_TOKEN_DECIMALS)),
                    token: "USDT"
                });
            })

        } else {
            transactionData.push({
                hash,
                type,
                amount:
                    (Number.parseInt(transactionInfo.result.value) / Math.pow(10, DEFAULT_ETHER_AND_BSC_DECIMALS)),
                token: "ETH"
            });
        }
    } else if (type === "bscscan") {
        let transactionInfo = (await makeBscRequest(
            `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}`)).data;

        if (transactionInfo.error) {
            console.log(`При попытке получить информацию по BEP-20 транзакции ${hash} возникла ошибка:`, transactionInfo.error.message);
            return [];
        }

        if(transactionInfo.result === null){
            console.log(`При попытке получить информацию по BEP-20 транзакции ${hash} возникла ошибка: Информации нет!`);
            return [];
        }

        if (transactionInfo.result.to.toLowerCase() === BSC_USDT_ADDRESS.toLowerCase()) {
            await limiter();
            const transactionReceipt = (await makeBscRequest(
                `?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}`)).data;

            if (transactionReceipt.status) {
                console.log(`При попытке получить более подробную информацию по BEP-20 транзакции ${hash} возникла ошибка:`, transactionInfo.message);
                return [];
            }

            if(transactionReceipt.result === null){
                console.log(`При попытке получить более подробную информацию по BEP-20 транзакции ${hash} возникла ошибка: Информации нет!`);
                return [];
            }

            transactionReceipt.result.logs.forEach(log => {
                transactionData.push({
                    hash,
                    type,
                    amount:
                        (Number.parseInt(log.data) / Math.pow(10, DEFAULT_ETHER_AND_BSC_DECIMALS)),
                    token: "BSC-USD"
                });
            })
        } else {
            transactionData.push({
                hash,
                type,
                amount:
                    (Number.parseInt(transactionInfo.result.value) / Math.pow(10, DEFAULT_ETHER_AND_BSC_DECIMALS)),
                token: "BNB"
            });
        }
    } else if (type === "blockchain") {
        let transactionInfo = (await makeBTCRequest(`/rawtx/${hash}`)).data;

        if (transactionInfo.error) {
            console.log(`При попытке получить информацию по BTC транзакции ${hash} возникла ошибка:`, transactionInfo.message);
            return [];
        }

        transactionData.push({
            hash,
            type,
            amount:
                ((transactionInfo.inputs.map(i => Number.parseInt(i.prev_out.value))
                        .reduce((partialSum, a) => partialSum + a, 0) - Number.parseInt(transactionInfo.fee))
                    / Math.pow(10, DEFAULT_BTC_DECIMALS)),
            token: "BTC"
        });
    }

    return transactionData;
}

export const generateLinkForCryptoTransaction = (type, hash) =>
    (type === "tronscan" ? "https://tronscan.org/#/transaction/" :
        type === "etherscan" ? "https://etherscan.io/tx/" :
            type === "bscscan" ? "https://bscscan.com/tx/" :
                "https://www.blockchain.com/explorer/transactions/btc/") + hash
