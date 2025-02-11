// config.ts
import { PublicKey } from '@solana/web3.js';

export const CONFIG = {
    // Network Configuration
    RPC_ENDPOINT: 'https://api.mainnet-beta.solana.com',
    WSS_ENDPOINT: 'wss://api.mainnet-beta.solana.com',
    BACKUP_RPC_ENDPOINTS: [
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana'
    ],
    
    // Strategy Parameters
    MIN_PROFIT_THRESHOLD: 0.05, // 5% minimum profit
    MAX_POSITION_SIZE: 1000, // In SOL
    GAS_BUFFER: 0.002, // SOL for gas
    MIN_LIQUIDITY_REQUIREMENT: 1000, // Minimum pool liquidity in SOL
    PRICE_IMPACT_LIMIT: 0.01, // Maximum allowable price impact
    SLIPPAGE_TOLERANCE: 0.005, // 0.5% slippage tolerance
    
    // Monitoring Configuration
    SCAN_INTERVAL: 1000, // ms
    PRICE_UPDATE_INTERVAL: 500, // ms
    MEMPOOL_BATCH_SIZE: 100,
    MAX_PENDING_TXS: 1000,
    BLOCK_TIME_BUFFER: 2, // seconds
    
    // Risk Management
    MAX_CONCURRENT_TRADES: 3,
    MAX_DAILY_LOSS: 10, // SOL
    STOP_LOSS_THRESHOLD: 0.02, // 2%
    MAX_DAILY_TRANSACTIONS: 1000,
    CAPITAL_UTILIZATION_LIMIT: 0.8, // 80% max capital utilization
    EMERGENCY_SHUTDOWN_LOSS: 20, // SOL - emergency stop if lost
    
    // Known DEX Programs and Pools
    KNOWN_DEXES: {
        ORCA: {
            PROGRAM_ID: new PublicKey('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1'),
            WHIRLPOOLS: new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'),
            POOLS: {
                // Add specific pool addresses
                'SOL/USDC': new PublicKey('HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ'),
                'SOL/USDT': new PublicKey('4GpUivr8jyRQKdCayistFHT3h4KvQKBHYKQhQG9q5Lqz'),
            }
        },
        RAYDIUM: {
            PROGRAM_ID: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
            AMM_ID: new PublicKey('EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q'),
            POOLS: {
                // Add specific pool addresses
                'SOL/USDC': new PublicKey('58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'),
                'SOL/USDT': new PublicKey('7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX'),
            }
        },
        JUPITER: {
            PROGRAM_ID: new PublicKey('JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB'),
        }
    },

    // Lending Protocols for Liquidation Monitoring
    LENDING_PROTOCOLS: {
        SOLEND: {
            PROGRAM_ID: new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'),
            POOLS: {
                MAIN: new PublicKey('4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY'),
            }
        },
        MANGO: {
            PROGRAM_ID: new PublicKey('mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68'),
        }
    },

    // Token Configuration
    TOKENS: {
        SOL: {
            MINT: new PublicKey('So11111111111111111111111111111111111111112'),
            DECIMALS: 9
        },
        USDC: {
            MINT: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
            DECIMALS: 6
        },
        USDT: {
            MINT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
            DECIMALS: 6
        }
    },

    // AI Model Parameters
    MODEL_CONFIG: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        layers: [64, 32, 16],
        dropout: 0.2,
        optimizer: 'adam',
        validationSplit: 0.2,
        earlyStoppingPatience: 10,
        maxQueueSize: 1000,
        featureScaling: true
    },

    // Network Architecture
    NETWORK_ARCHITECTURE: {
        inputFeatures: [
            'price_difference',
            'liquidity_depth',
            'historical_success_rate',
            'gas_estimate',
            'execution_time',
            'market_volatility',
            'volume_24h',
            'pool_utilization',
            'path_complexity'
        ],
        hiddenLayers: [
            { units: 64, activation: 'relu', dropout: 0.2 },
            { units: 32, activation: 'relu', dropout: 0.2 },
            { units: 16, activation: 'relu', dropout: 0.1 }
        ],
        outputLayer: { 
            units: 1, 
            activation: 'sigmoid'
        }
    },

    // Transaction Execution
    EXECUTION: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 500, // ms
        PRIORITY_FEE_LEVELS: {
            LOW: 1000, // microLamports
            MEDIUM: 10000,
            HIGH: 100000,
            URGENT: 1000000
        },
        COMPUTE_UNITS: {
            DEFAULT: 200000,
            MAX: 1400000
        }
    },

    // Performance Monitoring
    PERFORMANCE: {
        METRICS_INTERVAL: 60000, // ms
        LOG_LEVEL: 'info',
        ALERT_THRESHOLDS: {
            SUCCESS_RATE: 0.8,
            PROFIT_THRESHOLD: 0.01,
            RESPONSE_TIME: 1000
        }
    }
};

export default CONFIG;