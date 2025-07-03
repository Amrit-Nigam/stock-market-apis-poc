/**
 * Main entry point for Stock Market APIs PoC
 * 
 * This file demonstrates both Marketstack and Polygon.io APIs
 * and provides comparative analysis
 */

require('dotenv').config();
const { MarketstackAPI } = require('./marketstack');
const { PolygonAPI } = require('./polygon');

/**
 * Compare both APIs with the same stock symbol
 */
async function compareAPIs(symbol = 'AMZN') {
    console.log('🔄 API Comparison Demo');
    console.log('=' .repeat(50));
    console.log(`Comparing data for: ${symbol}\n`);

    const marketstackKey = process.env.MARKETSTACK_API_KEY;
    const polygonKey = process.env.POLYGON_API_KEY;

    if (!marketstackKey || marketstackKey === 'your_marketstack_api_key_here') {
        console.log('⚠️  Marketstack API key not configured');
    }

    if (!polygonKey || polygonKey === 'your_polygon_api_key_here') {
        console.log('⚠️  Polygon.io API key not configured');
    }

    const results = {
        marketstack: null,
        polygon: null,
        comparison: {}
    };

    // Test Marketstack
    if (marketstackKey && marketstackKey !== 'your_marketstack_api_key_here') {
        console.log('🧪 Testing Marketstack API...');
        const marketstack = new MarketstackAPI(marketstackKey);
        
        try {
            const eodData = await marketstack.getEODData([symbol], 1);
            if (eodData.data && eodData.data.length > 0) {
                results.marketstack = eodData.data[0];
                console.log(`✅ Marketstack: $${results.marketstack.close} (${results.marketstack.date})`);
            }
        } catch (error) {
            console.log(`❌ Marketstack error: ${error.message}`);
        }
    }

    // Test Polygon.io
    if (polygonKey && polygonKey !== 'your_polygon_api_key_here') {
        console.log('\n🧪 Testing Polygon.io API...');
        const polygon = new PolygonAPI(polygonKey);
        
        try {
            const prevClose = await polygon.getPreviousClose(symbol);
            if (prevClose.results && prevClose.results.length > 0) {
                results.polygon = prevClose.results[0];
                console.log(`✅ Polygon.io: $${results.polygon.c} (${new Date(results.polygon.t).toDateString()})`);
            }
        } catch (error) {
            console.log(`❌ Polygon.io error: ${error.message}`);
        }
    }

    // Comparison
    console.log('\n📊 Comparison Summary:');
    console.log('=' .repeat(30));
    
    if (results.marketstack && results.polygon) {
        console.log(`📈 Marketstack Close: $${results.marketstack.close}`);
        console.log(`📈 Polygon.io Close: $${results.polygon.c}`);
        
        const priceDiff = Math.abs(results.marketstack.close - results.polygon.c);
        console.log(`💰 Price Difference: $${priceDiff.toFixed(2)}`);
        
        console.log(`📅 Marketstack Date: ${results.marketstack.date}`);
        console.log(`📅 Polygon.io Date: ${new Date(results.polygon.t).toDateString()}`);
    } else {
        console.log('⚠️  Cannot compare - missing data from one or both APIs');
    }

    return results;
}

/**
 * Run full demonstration of both APIs
 */
async function runFullDemo() {
    console.log('🚀 Stock Market APIs PoC - Full Demo');
    console.log('=' .repeat(60));
    
    const marketstackKey = process.env.MARKETSTACK_API_KEY;
    const polygonKey = process.env.POLYGON_API_KEY;

    // Check API keys
    if (!marketstackKey || marketstackKey === 'your_marketstack_api_key_here') {
        console.log('⚠️  Marketstack API key not found. Please add it to .env file');
        console.log('🔗 Get free key: https://marketstack.com/signup/free');
    }

    if (!polygonKey || polygonKey === 'your_polygon_api_key_here') {
        console.log('⚠️  Polygon.io API key not found. Please add it to .env file');
        console.log('🔗 Get free key: https://polygon.io/pricing');
    }

    console.log('\n');

    // Run individual demos
    if (marketstackKey && marketstackKey !== 'your_marketstack_api_key_here') {
        console.log('🔵 MARKETSTACK DEMO');
        console.log('-' .repeat(20));
        const marketstack = new MarketstackAPI(marketstackKey);
        
        try {
            await marketstack.testConnection();
            await marketstack.getEODData(['AMZN', 'GOOGL'], 3);
        } catch (error) {
            console.log(`❌ Marketstack demo failed: ${error.message}`);
        }
        
        console.log('\n');
    }

    if (polygonKey && polygonKey !== 'your_polygon_api_key_here') {
        console.log('🟢 POLYGON.IO DEMO');
        console.log('-' .repeat(20));
        const polygon = new PolygonAPI(polygonKey);
        
        try {
            await polygon.testConnection();
            await polygon.getPreviousClose('AMZN');
            await polygon.getTickerDetails('AMZN');
        } catch (error) {
            console.log(`❌ Polygon.io demo failed: ${error.message}`);
        }
        
        console.log('\n');
    }

    // Run comparison if both keys are available
    if (marketstackKey && polygonKey && 
        marketstackKey !== 'your_marketstack_api_key_here' && 
        polygonKey !== 'your_polygon_api_key_here') {
        await compareAPIs('AMZN');
    }

    console.log('\n✅ Full demo completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Add your API keys to .env file');
    console.log('2. Run individual demos: npm run marketstack or npm run polygon');
    console.log('3. Explore the code in marketstack.js and polygon.js');
    console.log('4. Check the README.md for detailed documentation');
}

// Export for testing
module.exports = { compareAPIs, runFullDemo };

// Run demo if this file is executed directly
if (require.main === module) {
    runFullDemo();
}
