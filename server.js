// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 4001;

// Initialize the database
const db = new Datastore({ 
    filename: path.join(__dirname, 'data/submissions.db'), 
    autoload: true 
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many submissions from this IP, please try again later.'
    }
});

// Add this validation middleware
const validateSubmission = (req, res, next) => {
    const submission = req.body;
    
    // Check if all required fields exist
    const requiredFields = ['work_affected_story']; // add all your required fields
    for (const field of requiredFields) {
        if (!submission[field] || typeof submission[field] !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Missing or invalid required fields'
            });
        }
        
        // Check length
        if (submission[field].length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Submission too long'
            });
        }
        
        // Sanitize input
        submission[field] = submission[field]
            .trim()
            .replace(/<[^>]*>/g, ''); // Remove HTML tags
    }
    
    next();
};

// Endpoint to receive form data
app.post('/submit', limiter, validateSubmission, (req, res) => {
    const formData = req.body;
    // Enhanced validation function for better defense against spam
    const containsSpam = (text) => {
        const spamPatterns = [
            /http?:\/\//, // Matches URLs
            /javascript:/, // Matches JavaScript protocol
            /eval\(/, // Matches eval() function
            /unescape\(/, // Matches unescape() function
            /script/, // Matches script tag
            /<.*?>/ // Matches HTML tags
        ];
        return spamPatterns.some(pattern => pattern.test(text));
    };
    const containsRequiredWord = (text) => {
        const requiredWords = ['chip', 'shortage', 'supply', 'demand', 'rpi', 'pi', 'arduino', 'electronics', 'price', 'electronic', 'missing', 'art', 'artist', 'media art'];
        return requiredWords.some(word => text.toLowerCase().includes(word));
    };

    try {
        // Validate required fields
        if (!formData.shortage_meaning || !formData.chip_shortage_story || !formData.work_affected_story) {
            return res.json({ success: false, message: 'Please fill in all required fields.' });
        }

        // Check for spam in relevant fields
        if (containsSpam(formData.shortage_meaning) || 
            containsSpam(formData.chip_shortage_story) || 
            containsSpam(formData.work_affected_story)) {
            return res.json({ success: false, message: 'Your submission contains invalid content.' });
        }

        // Check for required keywords
        if (!containsRequiredWord(formData.shortage_meaning) && 
            !containsRequiredWord(formData.chip_shortage_story) && 
            !containsRequiredWord(formData.work_affected_story)) {
            return res.json({ success: false, message: 'Your submission was not accepted.' });
        }

        // Check for character limit in 'What does the word shortage mean to you?' field
        if (formData.shortage_meaning.length > 250) {
            return res.json({ success: false, message: 'The field "What does the word shortage mean to you?" cannot be more than 250 characters.' });
        }

        // Process valid submission
        const timestamp = new Date().toISOString();
        const entry = {
            ...formData,
            timestamp: timestamp
        };

        // Save to database
        db.insert(entry, (err, newDoc) => {
            if (err) {
                return res.json({ success: false, message: 'Database error occurred.' });
            }
            res.json({ success: true, message: 'Data received and stored successfully' });
        });
    } catch (error) {
        res.json({ success: false, message: 'An error occurred processing your submission.' });
    }
});

// Endpoint to get all submissions
app.get('/api/archive', (req, res) => {
    db.find({})
        .sort({ timestamp: -1 }) // Sort by timestamp, newest first
        .exec((err, docs) => {
            if (err) {
                console.error('Error reading from database:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.json(docs);
        });
});

// Make the server public by allowing access from any origin
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});