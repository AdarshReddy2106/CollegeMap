require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { google } = require('googleapis');
const { scrapeNTAUpdates } = require('./scraper'); // Add this import
const { parseNTARSS } = require('./rssParser');

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
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Google Sheets Configuration
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = 'Bookings';
const ANALYTICS_SHEET_NAME = 'ResourceAnalytics';

// Initialize Google Sheets API
const initializeGoogleSheets = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
    return null;
  }
};

const sheets = initializeGoogleSheets();

// Google Sheets Helper Functions
const initializeSheet = async () => {
  try {
    if (!sheets) return false;

    // Check if sheet exists and has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${SHEET_NAME}!A1:G1`
    });

    // If no headers exist, add them
    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'Timestamp', 
        'Name', 
        'Email', 
        'Phone',
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `${SHEET_NAME}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });

      console.log('Headers added to Google Sheets');
    }

    return true;
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return false;
  }
};

const addBookingToSheet = async (bookingData) => {
  try {
    if (!sheets) {
      throw new Error('Google Sheets not initialized');
    }

    const row = [
      bookingData.timestamp,
      bookingData.name,
      bookingData.email,
      bookingData.phone,
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row]
      }
    });

    console.log('Booking added to Google Sheets:', response.data.updates.updatedCells);
    return response.data;
  } catch (error) {
    console.error('Error adding booking to sheet:', error);
    throw error;
  }
};

const getAllBookingsFromSheet = async () => {
  try {
    if (!sheets) return [];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${SHEET_NAME}!A2:G` // Skip header row
    });

    if (!response.data.values) return [];

    // Convert to booking objects
    const bookings = response.data.values.map((row, index) => ({
      id: index + 1,
      timestamp: row[0] || '',
      name: row[1] || '',
      email: row[2] || '',
      phone: row[3] || '',
    })).filter(booking => booking.name && booking.email); // Filter out empty rows

    return bookings;
  } catch (error) {
    console.error('Error getting bookings from sheet:', error);
    return [];
  }
};



const getBookingCount = async () => {
  try {
    if (!sheets) return 0;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${SHEET_NAME}!A:A`
    });

    return response.data.values ? response.data.values.length - 1 : 0; // Subtract header row
  } catch (error) {
    console.error('Error getting booking count:', error);
    return 0;
  }
};

// Initialize sheet on startup
(async () => {
  if (sheets) {
    await initializeSheet();
    const count = await getBookingCount();
    console.log(`📊 Google Sheets initialized with ${count} existing bookings`);
  }
})();

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
    message: 'CollegeMap Backend with Google Sheets Integration',
    version: '3.0.0',
    googleSheetsEnabled: !!sheets,
    sheetsId: GOOGLE_SHEETS_ID ? 'configured' : 'missing',
    endpoints: [
      'GET /api/health',
      'POST /api/save-booking',
      'GET /api/bookings',
      'GET /api/stats'
    ]
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const bookingCount = await getBookingCount();
  
  res.status(200).json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    totalBookings: bookingCount,
    googleSheetsStatus: sheets ? 'connected' : 'disconnected',
    sheetsUrl: GOOGLE_SHEETS_ID ? `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}` : 'not configured',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Save booking endpoint
app.post('/api/save-booking', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received booking data:', data);

    // Validation
    if (!data.name || !data.email) {
      return res.status(400).json({ 
        message: 'Name and Email are required.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Check for duplicate booking
    const existingBooking = await checkDuplicateBooking(data.email);
    if (existingBooking) {
      return res.status(409).json({ 
        message: 'A booking with this email already exists.',
        existingBooking: {
          name: existingBooking.name,
          timestamp: existingBooking.timestamp
        }
      });
    }

    // Create booking object
    const bookingData = {
      timestamp: new Date().toISOString(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
    };

    // Add to Google Sheets
    await addBookingToSheet(bookingData);
    
    console.log('Booking saved to Google Sheets successfully');
    
    res.status(200).json({ 
      message: 'Booking saved successfully!',
      timestamp: bookingData.timestamp,
      sheetsUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`
    });

  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ 
      message: 'Failed to save booking.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const allBookings = await getAllBookingsFromSheet();
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedBookings = allBookings.slice(startIndex, endIndex);
    
    res.status(200).json({ 
      bookings: paginatedBookings,
      pagination: {
        current: page,
        total: Math.ceil(allBookings.length / limit),
        count: paginatedBookings.length,
        totalBookings: allBookings.length
      },
      sheetsUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch bookings.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get booking statistics
app.get('/api/stats', async (req, res) => {
  try {
    const allBookings = await getAllBookingsFromSheet();
    
    // Calculate statistics
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayBookings = allBookings.filter(b => 
      b.timestamp.split('T')[0] === today
    ).length;
    
    const weeklyBookings = allBookings.filter(b => 
      new Date(b.timestamp) >= thisWeek
    ).length;
    
    // Remove the reference to timeSlotStats that doesn't exist
    res.status(200).json({
      total: allBookings.length,
      today: todayBookings,
      thisWeek: weeklyBookings,
      sheetsUrl: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      message: 'Failed to get statistics.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Search bookings
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const allBookings = await getAllBookingsFromSheet();
    const searchTerm = query.toLowerCase();
    
    const filteredBookings = allBookings.filter(booking => 
      booking.name.toLowerCase().includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchTerm) ||
      booking.phone.includes(searchTerm)
    );
    
    res.status(200).json({
      bookings: filteredBookings,
      total: filteredBookings.length,
      searchQuery: query
    });
    
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({
      message: 'Search failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Fix the checkDuplicateBooking function to work without preferredDate
const checkDuplicateBooking = async (email) => {
  try {
    const bookings = await getAllBookingsFromSheet();
    return bookings.find(
      booking => booking.email.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('Error checking duplicate booking:', error);
    return null;
  }
};

// MODIFIED: Initialize Analytics Sheet with aggregated structure
const initializeAnalyticsSheet = async () => {
  try {
    if (!sheets) return false;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${ANALYTICS_SHEET_NAME}!A1:G1`
    }).catch(() => ({ data: { values: [] } }));

    if (!response.data.values || response.data.values.length === 0) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEETS_ID,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: ANALYTICS_SHEET_NAME
                }
              }
            }]
          }
        });
        console.log(`✅ Created new sheet: ${ANALYTICS_SHEET_NAME}`);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`ℹ️ Sheet ${ANALYTICS_SHEET_NAME} already exists`);
        }
      }

      const headers = [
        'Resource ID',
        'Resource Title',
        'Subject',
        'Type',
        'Number of Views',
        'Number of Downloads',
        'Last Updated'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `${ANALYTICS_SHEET_NAME}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });

      console.log(`✅ Headers added to ${ANALYTICS_SHEET_NAME} sheet`);
    }

    return true;
  } catch (error) {
    console.error('Error initializing analytics sheet:', error);
    return false;
  }
};

// MODIFIED: Track resource event with aggregation
const trackResourceEvent = async (eventData) => {
  try {
    if (!sheets) {
      throw new Error('Google Sheets not initialized');
    }

    // Get all existing analytics
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${ANALYTICS_SHEET_NAME}!A2:G`
    });

    const existingData = response.data.values || [];
    let rowIndex = -1;
    let currentViews = 0;
    let currentDownloads = 0;

    // Find if resource already exists
    existingData.forEach((row, index) => {
      if (row[0] === String(eventData.resourceId)) {
        rowIndex = index + 2; // +2 because array is 0-indexed and we skip header
        currentViews = parseInt(row[4]) || 0;
        currentDownloads = parseInt(row[5]) || 0;
      }
    });

    // Update counts
    const newViews = eventData.actionType === 'view' ? currentViews + 1 : currentViews;
    const newDownloads = eventData.actionType === 'download' ? currentDownloads + 1 : currentDownloads;

    const row = [
      String(eventData.resourceId),
      eventData.resourceTitle,
      eventData.subject || 'N/A',
      eventData.type || 'N/A',
      newViews,
      newDownloads,
      new Date().toISOString()
    ];

    if (rowIndex > -1) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `${ANALYTICS_SHEET_NAME}!A${rowIndex}:G${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
      console.log(`📊 Updated ${eventData.actionType} count for: ${eventData.resourceTitle}`);
    } else {
      // Add new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `${ANALYTICS_SHEET_NAME}!A:G`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] }
      });
      console.log(`📊 Created new analytics row for: ${eventData.resourceTitle}`);
    }

    return true;
  } catch (error) {
    console.error('Error tracking resource event:', error);
    throw error;
  }
};

// MODIFIED: Get analytics for a specific resource
const getResourceAnalytics = async (resourceId) => {
  try {
    if (!sheets) return { views: 0, downloads: 0 };

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${ANALYTICS_SHEET_NAME}!A2:G`
    });

    if (!response.data.values) return { views: 0, downloads: 0 };

    const resourceRow = response.data.values.find(row => row[0] === String(resourceId));
    
    if (!resourceRow) return { views: 0, downloads: 0 };

    return {
      resourceId,
      resourceTitle: resourceRow[1],
      subject: resourceRow[2],
      type: resourceRow[3],
      views: parseInt(resourceRow[4]) || 0,
      downloads: parseInt(resourceRow[5]) || 0,
      lastUpdated: resourceRow[6]
    };
  } catch (error) {
    console.error('Error getting resource analytics:', error);
    return { views: 0, downloads: 0 };
  }
};

// MODIFIED: Get all resources analytics
const getAllResourcesAnalytics = async () => {
  try {
    if (!sheets) return [];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: `${ANALYTICS_SHEET_NAME}!A2:G`
    });

    if (!response.data.values) return [];

    return response.data.values.map(row => ({
      resourceId: row[0],
      resourceTitle: row[1],
      subject: row[2],
      type: row[3],
      views: parseInt(row[4]) || 0,
      downloads: parseInt(row[5]) || 0,
      lastUpdated: row[6]
    })).sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads));
  } catch (error) {
    console.error('Error getting all analytics:', error);
    return [];
  }
};

// MODIFIED: Track resource view/download endpoint
app.post('/api/track-resource', async (req, res) => {
  try {
    const { resourceId, resourceTitle, actionType, subject, type } = req.body;
    
    if (!resourceId || !actionType || !['view', 'download'].includes(actionType)) {
      return res.status(400).json({ message: 'Invalid tracking data' });
    }

    await trackResourceEvent({
      resourceId,
      resourceTitle,
      actionType,
      subject,
      type
    });

    res.status(200).json({ 
      message: 'Tracked successfully',
      actionType,
      resourceId
    });
  } catch (error) {
    console.error('Error tracking resource:', error);
    res.status(500).json({ message: 'Failed to track event' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /api/health', 
      'POST /api/save-booking',
      'GET /api/bookings',
      'GET /api/stats',
      'GET /api/search?query=...'
    ]
  });
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Google Sheets: ${sheets ? 'Connected' : 'Disconnected'}`);
    if (GOOGLE_SHEETS_ID) {
      console.log(`📋 Sheets URL: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`);
      const count = await getBookingCount();
      console.log(`📈 Total bookings: ${count}`);
    }
  });
}


// Add this after your server starts listening
(async function() {
    try {
        await initializeSheet();
        await initializeAnalyticsSheet(); // NEW: Initialize analytics sheet
        const count = await getBookingCount();
        console.log(`📊 Google Sheets initialized with ${count} existing bookings`);
        console.log(`📈 ResourceAnalytics sheet ready at: https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}`);
        
        // Fetch initial NTA updates on startup
        console.log('📰 Fetching initial NTA updates...');
        const rawUpdates = await scrapeNTAUpdates();
        cachedNTAUpdates = rawUpdates.map(update => ({
            ...update,
            category: categorizeUpdate(update.title),
            isNew: true
        }));
        lastNTAFetch = Date.now();
        console.log(`✅ Initial NTA fetch complete: ${cachedNTAUpdates.length} updates loaded`);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
})();