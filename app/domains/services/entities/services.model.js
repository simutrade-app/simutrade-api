const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    chatData: [{
        query: { type: String, required: true },
        response: [
            {
                videoMetadata: { type: String, required: false },
                thought: { type: String, required: false },
                inlineData: { type: String, required: false },
                codeExecutionResult: { type: String, required: false },
                executableCode: { type: String, required: false },
                fileData: { type: String, required: false },
                functionCall: { type: String, required: false },
                functionResponse: { type: String, required: false },
                text: { type: String, required: true },
            }
        ],
        grounding_metadata: { type: String, required: false },
        context_used: [{ type: String, required: false }]
    }]
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = {
    Service
};