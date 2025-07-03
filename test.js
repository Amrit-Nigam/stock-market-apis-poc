/**
 * Test suite for Stock Market APIs PoC
 * 
 * Simple test cases to validate API functionality
 */

require('dotenv').config();
const { MarketstackAPI } = require('./marketstack');
const { PolygonAPI } = require('./polygon');

class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async runTests() {
        console.log('🧪 Running API Tests');
        console.log('=' .repeat(50));

        for (const test of this.tests) {
            try {
                console.log(`\n🔍 ${test.name}...`);
                await test.testFn();
                console.log(`✅ ${test.name} - PASSED`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${test.name} - FAILED: ${error.message}`);
                this.failed++;
            }
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 Test Summary');
        console.log('=' .repeat(30));
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📊 Total: ${this.tests.length}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n⚠️  Some tests failed - check API keys and connectivity');
        }
    }
}

async function runTests() {
    const runner = new TestRunner();
    const marketstackKey = process.env.MARKETSTACK_API_KEY;
    const polygonKey = process.env.POLYGON_API_KEY;

    // Marketstack Tests
    if (marketstackKey && marketstackKey !== 'your_marketstack_api_key_here') {
        const marketstack = new MarketstackAPI(marketstackKey);

        runner.addTest('Marketstack Connection', async () => {
            const connected = await marketstack.testConnection();
            if (!connected) throw new Error('Connection failed');
        });

        runner.addTest('Marketstack EOD Data', async () => {
            const data = await marketstack.getEODData(['AMZN'], 1);
            if (!data.data || data.data.length === 0) {
                throw new Error('No EOD data returned');
            }
        });

        runner.addTest('Marketstack Tickers', async () => {
            const data = await marketstack.getTickers('NASDAQ', 5);
            if (!data.data || data.data.length === 0) {
                throw new Error('No tickers returned');
            }
        });
    } else {
        console.log('⚠️  Skipping Marketstack tests - API key not configured');
    }

    // Polygon.io Tests
    if (polygonKey && polygonKey !== 'your_polygon_api_key_here') {
        const polygon = new PolygonAPI(polygonKey);

        runner.addTest('Polygon.io Connection', async () => {
            const connected = await polygon.testConnection();
            if (!connected) throw new Error('Connection failed');
        });

        runner.addTest('Polygon.io Market Status', async () => {
            const status = await polygon.getMarketStatus();
            if (!status.market) {
                throw new Error('No market status returned');
            }
        });

        runner.addTest('Polygon.io Previous Close', async () => {
            const data = await polygon.getPreviousClose('AMZN');
            if (!data.results || data.results.length === 0) {
                throw new Error('No previous close data returned');
            }
        });

        runner.addTest('Polygon.io Ticker Details', async () => {
            const data = await polygon.getTickerDetails('AMZN');
            if (!data.results) {
                throw new Error('No ticker details returned');
            }
        });
    } else {
        console.log('⚠️  Skipping Polygon.io tests - API key not configured');
    }

    // Run all tests
    await runner.runTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
