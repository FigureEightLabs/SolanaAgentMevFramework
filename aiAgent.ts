import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import * as tf from '@tensorflow/tfjs';
import { CONFIG, NETWORK_ARCHITECTURE } from './config';

export class MEVAgent {
    private model: tf.LayersModel;
    private connection: Connection;
    private opportunityQueue: any[];
    private isTraining: boolean;
    private historicalData: any[];

    constructor() {
        this.connection = new Connection(CONFIG.RPC_ENDPOINT);
        this.opportunityQueue = [];
        this.isTraining = false;
        this.historicalData = [];
        this.initializeModel();
    }

    private async initializeModel() {
        const model = tf.sequential();
        
        // Add input layer
        model.add(tf.layers.dense({
            units: NETWORK_ARCHITECTURE.hiddenLayers[0].units,
            activation: NETWORK_ARCHITECTURE.hiddenLayers[0].activation,
            inputShape: [NETWORK_ARCHITECTURE.inputFeatures.length]
        }));

        // Add hidden layers
        for (let i = 1; i < NETWORK_ARCHITECTURE.hiddenLayers.length; i++) {
            model.add(tf.layers.dense({
                units: NETWORK_ARCHITECTURE.hiddenLayers[i].units,
                activation: NETWORK_ARCHITECTURE.hiddenLayers[i].activation
            }));
            model.add(tf.layers.dropout({ rate: CONFIG.MODEL_CONFIG.dropout }));
        }

        // Add output layer
        model.add(tf.layers.dense({
            units: NETWORK_ARCHITECTURE.outputLayer.units,
            activation: NETWORK_ARCHITECTURE.outputLayer.activation
        }));

        model.compile({
            optimizer: tf.train.adam(CONFIG.MODEL_CONFIG.learningRate),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        this.model = model;
    }

    public async evaluateOpportunity(opportunity: any): Promise<number> {
        const features = this.extractFeatures(opportunity);
        const tensorFeatures = tf.tensor2d([features]);
        
        const prediction = await this.model.predict(tensorFeatures) as tf.Tensor;
        const score = (await prediction.data())[0];
        
        tensorFeatures.dispose();
        prediction.dispose();
        
        return score;
    }

    private extractFeatures(opportunity: any): number[] {
        return [
            opportunity.priceDifference,
            opportunity.liquidityDepth,
            opportunity.historicalSuccessRate,
            opportunity.gasEstimate,
            opportunity.executionTime,
            opportunity.marketVolatility
        ];
    }

    public async train(trainingData: any[]) {
        if (this.isTraining) return;
        this.isTraining = true;

        try {
            const features = trainingData.map(data => this.extractFeatures(data));
            const labels = trainingData.map(data => data.wasSuccessful ? 1 : 0);

            const tensorFeatures = tf.tensor2d(features);
            const tensorLabels = tf.tensor2d(labels, [labels.length, 1]);

            await this.model.fit(tensorFeatures, tensorLabels, {
                epochs: CONFIG.MODEL_CONFIG.epochs,
                batchSize: CONFIG.MODEL_CONFIG.batchSize,
                validationSplit: 0.2,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
                    }
                }
            });

            tensorFeatures.dispose();
            tensorLabels.dispose();
        } finally {
            this.isTraining = false;
        }
    }

    public async updateModel(executionResult: any) {
        this.historicalData.push(executionResult);
        
        if (this.historicalData.length >= CONFIG.MODEL_CONFIG.batchSize) {
            await this.train(this.historicalData);
            this.historicalData = [];
        }
    }
}

export class OpportunityEvaluator {
    private agent: MEVAgent;

    constructor(agent: MEVAgent) {
        this.agent = agent;
    }

    public async evaluateAndRank(opportunities: any[]): Promise<any[]> {
        const evaluatedOpps = await Promise.all(
            opportunities.map(async (opp) => ({
                ...opp,
                score: await this.agent.evaluateOpportunity(opp)
            }))
        );

        return evaluatedOpps
            .filter(opp => opp.score > CONFIG.MIN_PROFIT_THRESHOLD)
            .sort((a, b) => b.score - a.score);
    }
}