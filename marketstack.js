/**
 * Marketstack API PoC
 * 
 * This module demonstrates:
 * - Authentication with Marketstack API
 * - Fetching real-time and historical stock data
 * - Error handling and rate limiting considerations
 * 
 * Documentation: https://marketstack.com/documentation
 */

require('dotenv').config();
const axios = require('axios');

class MarketstackAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'http://api.marketstack.com/v1';
        this.httpsBaseURL = 'https://api.marketstack.com/v1'; // HTTPS requires paid plan
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Test API connection and authentication
     */
    async testConnection() {
        try {
            console.log('🔍 Testing Marketstack API connection...');
            
            const response = await this.client.get('/eod', {
                params: {
                    access_key: this.apiKey,
                    symbols: 'AMZN',
                    limit: 1
                }
            });

            console.log('✅ Marketstack API connection successful!');
            console.log(`📊 Rate limit: ${response.headers['x-ratelimit-limit'] || 'N/A'}`);
            console.log(`⏱️  Requests remaining: ${response.headers['x-ratelimit-remaining'] || 'N/A'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Marketstack API connection failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get End-of-Day (EOD) stock prices
     */
    async getEODData(symbols = ['AMZN', 'GOOGL', 'MSFT'], limit = 5) {
        try {
            console.log(`\n📈 Fetching EOD data for: ${symbols.join(', ')}`);
            
            const response = await this.client.get('/eod', {
                params: {
                    access_key: this.apiKey,
                    symbols: symbols.join(','),
                    limit: limit
                }
            });

            const data = response.data;
            console.log(`✅ Retrieved ${data.data.length} EOD records`);
            
            // Display sample data
            data.data.slice(0, 3).forEach(record => {
                console.log(`📊 ${record.symbol}: $${record.close} (${record.date})`);
            });

            return data;
        } catch (error) {
            console.error('❌ Error fetching EOD data:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get intraday stock prices (requires paid plan for real-time)
     */
    async getIntradayData(symbol = 'AMZN', interval = '1hour', limit = 10) {
        try {
            console.log(`\n⏰ Fetching intraday data for ${symbol} (${interval} intervals)`);
            
            const response = await this.client.get('/intraday', {
                params: {
                    access_key: this.apiKey,
                    symbols: symbol,
                    interval: interval,
                    limit: limit
                }
            });

            const data = response.data;
            console.log(`✅ Retrieved ${data.data.length} intraday records`);
            
            // Display sample data
            data.data.slice(0, 3).forEach(record => {
                console.log(`⏰ ${record.symbol}: $${record.close} at ${record.date}`);
            });

            return data;
        } catch (error) {
            console.error('❌ Error fetching intraday data:', error.response?.data || error.message);
            if (error.response?.status === 422) {
                console.log('💡 Note: Intraday data may require a paid Marketstack plan');
            }
            throw error;
        }
    }

    /**
     * Get stock tickers/symbols
     */
    async getTickers(exchange = 'NASDAQ', limit = 10) {
        try {
            console.log(`\n🏢 Fetching tickers for ${exchange} exchange`);
            
            const response = await this.client.get('/tickers', {
                params: {
                    access_key: this.apiKey,
                    exchange: exchange,
                    limit: limit
                }
            });

            const data = response.data;
            console.log(`✅ Retrieved ${data.data.length} tickers`);
            
            // Display sample tickers
            data.data.slice(0, 5).forEach(ticker => {
                console.log(`🎯 ${ticker.symbol}: ${ticker.name}`);
            });

            return data;
        } catch (error) {
            console.error('❌ Error fetching tickers:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get exchanges list
     */
    async getExchanges() {
        try {
            console.log(`\n🏛️  Fetching available exchanges`);
            
            const response = await this.client.get('/exchanges', {
                params: {
                    access_key: this.apiKey
                }
            });

            const data = response.data;
            console.log(`✅ Retrieved ${data.data.length} exchanges`);
            
            // Display sample exchanges
            data.data.slice(0, 5).forEach(exchange => {
                console.log(`🏛️  ${exchange.acronym}: ${exchange.name} (${exchange.country})`);
            });

            return data;
        } catch (error) {
            console.error('❌ Error fetching exchanges:', error.response?.data || error.message);
            throw error;
        }
    }
}

/**
 * Demo function to showcase Marketstack API capabilities
 */
async function runMarketstackDemo() {
    const apiKey = process.env.MARKETSTACK_API_KEY;
    
    if (!apiKey || apiKey === 'your_marketstack_api_key_here') {
        console.log('❌ Please set your MARKETSTACK_API_KEY in the .env file');
        console.log('🔗 Get your free API key from: https://marketstack.com/signup/free');
        return;
    }

    console.log('🚀 Starting Marketstack API PoC Demo');
    console.log('=' .repeat(50));

    const marketstack = new MarketstackAPI(apiKey);

    try {
        // Test connection
        const connected = await marketstack.testConnection();
        if (!connected) return;

        // Demo different endpoints
        await marketstack.getEODData(['AMZN', 'GOOGL', 'TSLA']);
        await marketstack.getTickers('NASDAQ', 5);
        await marketstack.getExchanges();
        
        // Try intraday (may fail on free plan)
        try {
            await marketstack.getIntradayData('AMZN', '1hour', 5);
        } catch (error) {
            console.log('💡 Intraday data requires paid plan - this is expected on free tier');
        }

        console.log('\n✅ Marketstack PoC completed successfully!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

// Export for use in other modules
module.exports = { MarketstackAPI };

// Run demo if this file is executed directly
if (require.main === module) {
    runMarketstackDemo();
}
