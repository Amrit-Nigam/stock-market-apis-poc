/**
 * Polygon.io API PoC
 * 
 * This module demonstrates:
 * - Authentication with Polygon.io API
 * - Fetching real-time and historical stock data
 * - Advanced features like technical indicators and market status
 * 
 * Documentation: https://polygon.io/docs/stocks/getting-started
 */

require('dotenv').config();
const axios = require('axios');

class PolygonAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.polygon.io';
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Test API connection and authentication
     */
    async testConnection() {
        try {
            console.log('🔍 Testing Polygon.io API connection...');
            
            const response = await this.client.get('/v1/marketstatus/now');

            console.log('✅ Polygon.io API connection successful!');
            console.log(`📊 Market Status: ${response.data.market}`);
            console.log(`🕐 Server Time: ${response.data.serverTime}`);
            
            return true;
        } catch (error) {
            console.error('❌ Polygon.io API connection failed:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Get market status
     */
    async getMarketStatus() {
        try {
            console.log('\n🏪 Fetching current market status...');
            
            const response = await this.client.get('/v1/marketstatus/now');
            const status = response.data;
            
            console.log(`📊 Market: ${status.market}`);
            console.log(`🕐 Server Time: ${status.serverTime}`);
            console.log(`🇺🇸 NYSE: ${status.exchanges.nyse}`);
            console.log(`📈 NASDAQ: ${status.exchanges.nasdaq}`);
            console.log(`🌐 OTC: ${status.exchanges.otc}`);

            return status;
        } catch (error) {
            console.error('❌ Error fetching market status:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get previous close for stocks
     */
    async getPreviousClose(ticker = 'AMZN') {
        try {
            console.log(`\n📊 Fetching previous close for ${ticker}...`);
            
            const response = await this.client.get(`/v2/aggs/ticker/${ticker}/prev`);
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                console.log(`✅ ${ticker} Previous Close:`);
                console.log(`💰 Close: $${result.c}`);
                console.log(`📈 High: $${result.h}`);
                console.log(`📉 Low: $${result.l}`);
                console.log(`🔓 Open: $${result.o}`);
                console.log(`📊 Volume: ${result.v.toLocaleString()}`);
                console.log(`📅 Date: ${new Date(result.t).toDateString()}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error fetching previous close:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get historical aggregated data (bars)
     */
    async getAggregates(ticker = 'AMZN', timespan = 'day', from = '2024-01-01', to = '2024-01-31') {
        try {
            console.log(`\n📈 Fetching aggregated data for ${ticker} (${timespan})...`);
            
            const response = await this.client.get(`/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`, {
                params: {
                    adjusted: true,
                    sort: 'desc',
                    limit: 10
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                console.log(`✅ Retrieved ${data.results.length} ${timespan} bars for ${ticker}`);
                
                // Display recent data
                data.results.slice(0, 5).forEach(bar => {
                    const date = new Date(bar.t).toDateString();
                    console.log(`📊 ${date}: Close $${bar.c}, Volume ${bar.v.toLocaleString()}`);
                });
            }

            return data;
        } catch (error) {
            console.error('❌ Error fetching aggregates:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get real-time quotes (may require paid plan)
     */
    async getRealTimeQuote(ticker = 'AMZN') {
        try {
            console.log(`\n⚡ Fetching real-time quote for ${ticker}...`);
            
            const response = await this.client.get(`/v2/last/nbbo/${ticker}`);
            const data = response.data;
            
            if (data.results) {
                const quote = data.results;
                console.log(`✅ Real-time quote for ${ticker}:`);
                console.log(`💰 Bid: $${quote.P} (Size: ${quote.S})`);
                console.log(`💰 Ask: $${quote.p} (Size: ${quote.s})`);
                console.log(`🕐 Quote Time: ${new Date(quote.t / 1000000).toLocaleString()}`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error fetching real-time quote:', error.response?.data || error.message);
            if (error.response?.status === 403) {
                console.log('💡 Note: Real-time quotes may require a paid Polygon.io plan');
            }
            throw error;
        }
    }

    /**
     * Get stock ticker details
     */
    async getTickerDetails(ticker = 'AMZN') {
        try {
            console.log(`\n🏢 Fetching details for ${ticker}...`);
            
            const response = await this.client.get(`/v3/reference/tickers/${ticker}`);
            const data = response.data;
            
            if (data.results) {
                const details = data.results;
                console.log(`✅ Ticker Details for ${ticker}:`);
                console.log(`🏢 Name: ${details.name}`);
                console.log(`🏛️  Exchange: ${details.primary_exchange}`);
                console.log(`💼 Market: ${details.market}`);
                console.log(`🌐 Homepage: ${details.homepage_url || 'N/A'}`);
                console.log(`📝 Description: ${(details.description || 'N/A').substring(0, 100)}...`);
            }

            return data;
        } catch (error) {
            console.error('❌ Error fetching ticker details:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Search for tickers
     */
    async searchTickers(query = 'apple', limit = 5) {
        try {
            console.log(`\n🔍 Searching tickers for: "${query}"...`);
            
            const response = await this.client.get('/v3/reference/tickers', {
                params: {
                    search: query,
                    limit: limit,
                    active: true
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                console.log(`✅ Found ${data.results.length} tickers:`);
                
                data.results.forEach(ticker => {
                    console.log(`🎯 ${ticker.ticker}: ${ticker.name}`);
                });
            }

            return data;
        } catch (error) {
            console.error('❌ Error searching tickers:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get news for a ticker
     */
    async getNews(ticker = 'AMZN', limit = 5) {
        try {
            console.log(`\n📰 Fetching news for ${ticker}...`);
            
            const response = await this.client.get('/v2/reference/news', {
                params: {
                    'ticker': ticker,
                    'limit': limit,
                    'order': 'desc'
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                console.log(`✅ Retrieved ${data.results.length} news articles:`);
                
                data.results.slice(0, 3).forEach(article => {
                    console.log(`📰 ${article.title}`);
                    console.log(`🔗 ${article.article_url}`);
                    console.log(`📅 ${new Date(article.published_utc).toDateString()}`);
                    console.log('---');
                });
            }

            return data;
        } catch (error) {
            console.error('❌ Error fetching news:', error.response?.data || error.message);
            throw error;
        }
    }
}

/**
 * Demo function to showcase Polygon.io API capabilities
 */
async function runPolygonDemo() {
    const apiKey = process.env.POLYGON_API_KEY;
    
    if (!apiKey || apiKey === 'your_polygon_api_key_here') {
        console.log('❌ Please set your POLYGON_API_KEY in the .env file');
        console.log('🔗 Get your free API key from: https://polygon.io/pricing');
        return;
    }

    console.log('🚀 Starting Polygon.io API PoC Demo');
    console.log('=' .repeat(50));

    const polygon = new PolygonAPI(apiKey);

    try {
        // Test connection
        const connected = await polygon.testConnection();
        if (!connected) return;

        // Demo different endpoints
        await polygon.getMarketStatus();
        await polygon.getPreviousClose('AMZN');
        await polygon.getTickerDetails('AMZN');
        await polygon.searchTickers('tesla', 3);
        
        // Historical data
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const fromDate = lastMonth.toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];
        
        await polygon.getAggregates('AMZN', 'day', fromDate, toDate);
        
        // Try real-time quote (may fail on free plan)
        try {
            await polygon.getRealTimeQuote('AMZN');
        } catch (error) {
            console.log('💡 Real-time quotes require paid plan - this is expected on free tier');
        }
        
        // News
        await polygon.getNews('AMZN', 3);

        console.log('\n✅ Polygon.io PoC completed successfully!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
    }
}

// Export for use in other modules
module.exports = { PolygonAPI };

// Run demo if this file is executed directly
if (require.main === module) {
    runPolygonDemo();
}
