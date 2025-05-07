require('dotenv').config();

const mongodb = require('./configs/database/mongodb/mongodb.client');
mongodb.connectDB();

const transformers = require('./utils/nlp/xenova/transformers');
transformers.loadModel("Xenova/all-MiniLM-L6-v2");

const app = require('./server');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});