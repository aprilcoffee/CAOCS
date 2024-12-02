// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Datastore = require('nedb');
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize the database
const db = new Datastore({ 
    filename: path.join(__dirname, 'data/submissions.db'), 
    autoload: true 
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to receive form data
app.post('/submit', (req, res) => {
    const formData = req.body;
    const timestamp = new Date().toISOString();
    
    // Add timestamp to the data
    const entry = {
        ...formData,
        timestamp: timestamp
    };

    // Insert into database
    db.insert(entry, (err, newDoc) => {
        if (err) {
            console.error('Error saving to database:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('Data received and stored successfully');
    });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});