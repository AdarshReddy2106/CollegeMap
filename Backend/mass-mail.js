const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const path = require('path');

const excelFilePath = path.join(__dirname, 'bookings.xlsx');

// --- Step 1: Read emails from Excel ---
const getEmailsFromExcel = () => {
    const workbook = xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    return data.map(row => row.Email).filter(email => !!email);
};

// --- Step 2: Create Nodemailer transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adarshreddy2106@gmail.com', // your email
        pass: 'htjv yozw hirm knaw'    // app password, not your actual password
    }
});

// --- Step 3: Send to all emails ---
const sendBulkEmail = async (subject, message) => {
    const emails = getEmailsFromExcel();
    console.log(`Found ${emails.length} recipients.`);

    for (const email of emails) {
        try {
            await transporter.sendMail({
                from: '"CollegeMap" <youremail@gmail.com>',
                to: email,
                subject: subject,
                text: message,
                html: `<p>${message}</p>`
            });
            console.log(`✅ Sent to: ${email}`);
        } catch (err) {
            console.error(`❌ Failed for ${email}: ${err.message}`);
        }
    }
};

// --- Step 4: Run it ---
(async () => {
    await sendBulkEmail(
        'Your Upcoming IIT Guidance Session', // Email subject
        'Hello! This is a reminder about your booked IIT guidance session. See you soon!' // Email body
    );
})();
