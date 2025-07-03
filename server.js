/**
 * Express server for Stock Market APIs
 * Serves API endpoints for React frontend
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PolygonAPI } = require('./polygon');
const { MarketstackAPI } = require('./marketstack');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize API clients
const polygonAPI = new PolygonAPI(process.env.POLYGON_API_KEY);
const marketstackAPI = new MarketstackAPI(process.env.MARKETSTACK_API_KEY);

// Helper function to format Polygon.io data
function formatPolygonData(data, symbol) {
  if (!data.results || data.results.length === 0) {
    return null;
  }
  
  const result = data.results[0];
  return {
    symbol: symbol.toUpperCase(),
    close: result.c,
    high: result.h,
    low: result.l,
    open: result.o,
    volume: result.v,
    date: new Date(result.t).toDateString(),
    source: 'Polygon.io'
  };
}

// Helper function to format Marketstack data
function formatMarketstackData(data, symbol) {
  if (!data.data || data.data.length === 0) {
    return null;
  }
  
  const result = data.data[0];
  return {
    symbol: symbol.toUpperCase(),
    close: result.close,
    high: result.high,
    low: result.low,
    open: result.open,
    volume: result.volume,
    date: result.date.split('T')[0],
    source: 'Marketstack'
  };
}

// Routes
app.get('/api/polygon/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`📊 Fetching Polygon.io data for ${symbol}`);
    
    const data = await polygonAPI.getPreviousClose(symbol);
    const formattedData = formatPolygonData(data, symbol);
    
    if (!formattedData) {
      return res.status(404).json({ error: 'No data found for symbol' });
    }
    
    res.json(formattedData);
  } catch (error) {
    console.error('❌ Polygon.io API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Polygon.io data', details: error.message });
  }
});

app.get('/api/marketstack/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`📈 Fetching Marketstack data for ${symbol}`);
    
    const data = await marketstackAPI.getEODData([symbol], 1);
    const formattedData = formatMarketstackData(data, symbol);
    
    if (!formattedData) {
      return res.status(404).json({ error: 'No data found for symbol' });
    }
    
    res.json(formattedData);
  } catch (error) {
    console.error('❌ Marketstack API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Marketstack data', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apis: {
      polygon: !!process.env.POLYGON_API_KEY,
      marketstack: !!process.env.MARKETSTACK_API_KEY
    }
  });
});

// Test both APIs endpoint
app.get('/api/test/:symbol', async (req, res) => {
  const { symbol } = req.params;
  console.log(`🧪 Testing both APIs for ${symbol}`);
  
  const results = {
    symbol: symbol.toUpperCase(),
    polygon: null,
    marketstack: null,
    errors: {}
  };
  
  // Test Polygon.io
  try {
    const polygonData = await polygonAPI.getPreviousClose(symbol);
    results.polygon = formatPolygonData(polygonData, symbol);
  } catch (error) {
    results.errors.polygon = error.message;
  }
  
  // Test Marketstack
  try {
    const marketstackData = await marketstackAPI.getEODData([symbol], 1);
    results.marketstack = formatMarketstackData(marketstackData, symbol);
  } catch (error) {
    results.errors.marketstack = error.message;
  }
  
  res.json(results);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stock Market API server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/polygon/:symbol`);
  console.log(`   GET /api/marketstack/:symbol`);
  console.log(`   GET /api/test/:symbol`);
  console.log(`   GET /api/health`);
  
  // Check API keys
  if (!process.env.POLYGON_API_KEY) {
    console.log('⚠️  Warning: POLYGON_API_KEY not found');
  }
  if (!process.env.MARKETSTACK_API_KEY) {
    console.log('⚠️  Warning: MARKETSTACK_API_KEY not found');
  }
});

module.exports = app;
