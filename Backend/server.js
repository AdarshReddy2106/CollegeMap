const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Excel Writing Logic ---
const excelFilePath = path.join(__dirname, 'bookings.xlsx');

const writeToExcel = (data) => {
    try {
        console.log('Attempting to write to Excel:', excelFilePath);
        let workbook;
        let worksheet;

        if (fs.existsSync(excelFilePath)) {
            console.log('Excel file exists, reading existing file...');
            workbook = xlsx.readFile(excelFilePath);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
        } else {
            console.log('Excel file does not exist, creating new file...');
            workbook = xlsx.utils.book_new();
            // MODIFIED: Added 'Preferred Date' to the Excel headers
            worksheet = xlsx.utils.aoa_to_sheet([
                ['Timestamp', 'Name', 'Email', 'Phone', 'Preferred Date', 'Preferred Time', 'Message']
            ]);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Bookings');
        }

        console.log('Appending data to worksheet...');
        // MODIFIED: Added data.preferredDate to the row being appended
        xlsx.utils.sheet_add_aoa(worksheet, [[
            data.timestamp,
            data.name,
            data.email,
            data.phone,
            data.preferredDate || 'N/A', // Added new field
            data.preferredTime || 'N/A',
            data.message || 'N/A'
        ]], { origin: -1 });

        console.log('Writing file to disk...');
        xlsx.writeFile(workbook, excelFilePath);
        console.log('Excel file written successfully!');
        
    } catch (error) {
        console.error('Error in writeToExcel:', error);
        throw error;
    }
};

// Test endpoint
app.get('/api/test-excel', (req, res) => {
    try {
        const testData = {
            timestamp: new Date().toLocaleString(),
            name: 'Test User',
            email: 'test@example.com',
            phone: '+91 98765 43210',
            preferredDate: '2025-08-10', // Test data for new field
            preferredTime: 'morning',
            message: 'This is a test entry'
        };
        
        writeToExcel(testData);
        res.status(200).json({ 
            message: 'Test Excel write successful!',
            filePath: excelFilePath,
            fileExists: fs.existsSync(excelFilePath)
        });
    } catch (error) {
        console.error('Test Excel write failed:', error);
        res.status(500).json({ 
            message: 'Test Excel write failed',
            error: error.message 
        });
    }
});

// API Endpoint to receive form data
app.post('/api/save-booking', (req, res) => {
    try {
        const data = req.body;
        console.log('Received booking data:', data);

        // MODIFIED: Updated validation to include required fields
        if (!data.name || !data.email || !data.phone || !data.preferredDate) {
            console.log('Validation failed: Name, Email, Phone, and Preferred Date are required');
            return res.status(400).json({ message: 'Name, Email, Phone, and Preferred Date are required.' });
        }

        writeToExcel(data);
        
        console.log('Booking saved successfully');
        res.status(200).json({ 
            message: 'Booking saved successfully!',
            filePath: excelFilePath 
        });

    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ 
            message: 'Failed to save booking.',
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        excelFileExists: fs.existsSync(excelFilePath),
        currentDirectory: __dirname
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Excel file will be saved to: ${excelFilePath}`);
});