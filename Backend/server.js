require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { scrapeNTAUpdates } = require('./scraper'); 
const { parseNTARSS } = require('./rssParser');
const { registerBranchIntelRoutes } = require('./branchIntel');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'https://collegemapseminarpage.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://www.collegemap.in',
    'https://collegemap.in'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Profile']
}));

app.use(express.json({ limit: '10mb' }));

registerBranchIntelRoutes(app);

// NTA Updates Cache
let cachedNTAUpdates = [];
let lastNTAFetch = null;
const NTA_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Categorize NTA updates
const categorizeUpdate = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('result') || titleLower.includes('score')) return 'Result Updates';
    if (titleLower.includes('admit') || titleLower.includes('hall ticket')) return 'Admit Card';
    if (titleLower.includes('exam') || titleLower.includes('test')) return 'Exam Notifications';
    if (titleLower.includes('date') || titleLower.includes('schedule')) return 'Important Dates';
    return 'General';
};

// Add async function to fetch NTA updates with fallback
async function fetchNTAUpdatesWithFallback() {
    try {
        // Try RSS first
        console.log('📡 Trying RSS feeds first...');
        const rssUpdates = await parseNTARSS();
        
        if (rssUpdates.length > 0) {
            console.log(`✅ Got ${rssUpdates.length} updates from RSS`);
            return rssUpdates;
        }
        
        // Fallback to web scraping
        console.log('🔍 RSS failed, trying web scraping...');
        const scrapedUpdates = await scrapeNTAUpdates();
        return scrapedUpdates;
        
    } catch (error) {
        console.error('❌ All methods failed:', error.message);
        // Return mock data as last resort
        return scrapeNTAUpdates(); // This will return mock data internally
    }
}

// NTA Updates API Endpoint
app.get('/api/nta-updates', async (req, res) => {
    try {
        const now = Date.now();
        
        if (cachedNTAUpdates.length && lastNTAFetch && (now - lastNTAFetch) < NTA_CACHE_DURATION) {
            return res.json({ 
                success: true, 
                updates: cachedNTAUpdates,
                cached: true,
                lastUpdated: new Date(lastNTAFetch).toISOString()
            });
        }
        
        console.log('📰 Fetching fresh NTA updates...');
        const rawUpdates = await fetchNTAUpdatesWithFallback();
        
        const processedUpdates = rawUpdates.map((update) => ({
            ...update,
            category: categorizeUpdate(update.title),
            isNew: (Date.now() - new Date(update.scrapedAt).getTime()) < 24 * 60 * 60 * 1000
        }));
        
        cachedNTAUpdates = processedUpdates;
        lastNTAFetch = now;
        
        res.json({ 
            success: true, 
            updates: processedUpdates,
            cached: false,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching NTA updates:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch updates',
            updates: cachedNTAUpdates
        });
    }
});

// Schedule automatic NTA updates every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] 🔄 Running scheduled NTA update fetch...');
    try {
        const rawUpdates = await scrapeNTAUpdates();
        const processedUpdates = rawUpdates.map((update) => ({
            ...update,
            category: categorizeUpdate(update.title),
            isNew: (Date.now() - new Date(update.scrapedAt).getTime()) < 24 * 60 * 60 * 1000
        }));
        
        cachedNTAUpdates = processedUpdates;
        lastNTAFetch = Date.now();
        console.log(`[CRON] ✅ Successfully fetched ${processedUpdates.length} NTA updates`);
    } catch (error) {
        console.error('[CRON] ❌ Error during scheduled NTA fetch:', error);
    }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CollegeMap Backend API',
    version: '4.0.0',
    status: 'running',
    endpoints: [
      'GET /api/health',
      'GET /api/nta-updates',
      'GET /api/branch-intel/health',
      'GET /api/branch-intel/catalog',
      'GET /api/branch-intel/colleges',
      'GET /api/branch-intel/branches',
      'POST /api/branch-intel/compare'
    ]
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  console.log('404 - Endpoint not found:', req.method, req.path);
  res.status(404).json({
    message: 'Endpoint not found',
    requestedPath: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health', 
      'GET /api/nta-updates',
      'GET /api/branch-intel/health',
      'GET /api/branch-intel/catalog',
      'GET /api/branch-intel/colleges',
      'GET /api/branch-intel/branches',
      'POST /api/branch-intel/compare'
    ]
  });
});

// Export for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Initialize on startup
(async function() {
    try {
        // Fetch initial NTA updates
        console.log('📰 Fetching initial NTA updates...');
        const rawUpdates = await fetchNTAUpdatesWithFallback();
        cachedNTAUpdates = rawUpdates.map(update => ({
            ...update,
            category: categorizeUpdate(update.title),
            isNew: true
        }));
        lastNTAFetch = Date.now();
        console.log(`✅ Loaded ${cachedNTAUpdates.length} NTA updates`);
    } catch (error) {
        console.error('Initialization error:', error);
    }
})();
