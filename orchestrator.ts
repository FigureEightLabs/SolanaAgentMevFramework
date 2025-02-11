// orchestrator.ts
import { Keypair } from '@solana/web3.js';
import { MEVAgent, OpportunityEvaluator } from './aiAgent';
import { MempoolMonitor } from './mempoolMonitor';
import { TransactionExecutor } from './transactionExecutor';
import { CONFIG } from './config';

export class MEVOrchestrator {
    private agent: MEVAgent;
    private evaluator: OpportunityEvaluator;
    private monitor: MempoolMonitor;
    private executor: TransactionExecutor;
    private isRunning: boolean;
    private dailyStats: {
        trades: number;
        profit: number;
        losses: number;
        startTime: number;
    };

    constructor(wallet: Keypair) {
        this.agent = new MEVAgent();
        this.evaluator = new OpportunityEvaluator(this.agent);
        this.monitor = new MempoolMonitor();
        this.executor = new TransactionExecutor(wallet);
        this.isRunning = false;
        this.resetDailyStats();
    }

    public async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Initialize components
        await this.initializeComponents();

        // Set up event listeners
        this.setupEventListeners();

        // Start monitoring
        await this.monitor.start();

        console.log('MEV Bot started successfully');
    }

    private async initializeComponents() {
        // Initialize AI model
        await this.agent.initializeModel();

        // Set up monitoring and execution
        this.monitor.on('opportunity', async (opportunities) => {
            await this.handleOpportunities(opportunities);
        });

        this.executor.on('executionResult', async (result) => {
            await this.handleExecutionResult(result);
        });
    }

    private setupEventListeners() {
        // Monitor risk limits
        setInterval(() => this.checkRiskLimits(), 1000);

        // Reset daily stats
        setInterval(() => this.resetDailyStats(), 24 * 60 * 60 * 1000);
    }

    private async handleOpportunities(opportunities: any[]) {
        if (!this.isRunning) return;

        try {
            // Evaluate opportunities using AI
            const rankedOpps = await this.evaluator.evaluateAndRank(opportunities);

            // Execute best opportunities
            for (const opp of rankedOpps) {
                if (this.shouldExecute(opp)) {
                    await this.executor.executeOpportunity(opp);
                }
            }
        } catch (error) {
            console.error('Error handling opportunities:', error);
        }
    }

    private async handleExecutionResult(result: any) {
        // Update statistics
        if (result.success) {
            this.dailyStats.trades++;
            this.dailyStats.profit += result.profit;
        } else {
            this.dailyStats.losses++;
        }

        // Update AI model
        await this.agent.updateModel(result);

        // Log result
        console.log('Execution result:', {
            success: result.success,
            profit: result.profit,
            signature: result.signature
        });
    }

    private shouldExecute(opportunity: any): boolean {
        // Check risk parameters
        if (this.dailyStats.losses >= CONFIG.MAX_DAILY_LOSS) {
            return false;
        }

        // Check profit potential
        if (opportunity.profit < CONFIG.MIN_PROFIT_THRESHOLD) {
            return false;
        }

        // Check position size
        if (opportunity.size > CONFIG.MAX_POSITION_SIZE) {
            return false;
        }

        return true;
    }

    private checkRiskLimits() {
        if (this.dailyStats.losses >= CONFIG.MAX_DAILY_LOSS) {
            console.log('Daily loss limit reached, stopping trading');
            this.stop();
        }
    }

    private resetDailyStats() {
        this.dailyStats = {
            trades: 0,
            profit: 0,
            losses: 0,
            startTime: Date.now()
        };
    }

    public getStats() {
        return {
            ...this.dailyStats,
            runtime: Date.now() - this.dailyStats.startTime,
            isRunning: this.isRunning
        };
    }

    public stop() {
        this.isRunning = false;
        this.monitor.stop();
        console.log('MEV Bot stopped');
    }
}

// Usage example:
const startBot = async () => {
    // Load wallet (in production, use secure key management)
    const wallet = Keypair.generate(); // Replace with actual wallet

    const orchestrator = new MEVOrchestrator(wallet);
    await orchestrator.start();

    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        orchestrator.stop();
        process.exit(0);
    });
};