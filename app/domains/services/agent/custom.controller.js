const models = JSON.parse(process.env.OPENROUTER_API_MODELS);

const vertex = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "query" required',
                data: {}
            });
        }

        const requestBody = {
            query: query
        };

        const response = await fetch(process.env.SIMUTRADE_AI_HOST + "/query", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.error.message : "Failed to process request",
                data: errorData.error
            });
        }

        let data = await response.json();

        return res.status(200).json({
            status: 'success',
            message: "Successfuly create AI agent custom chat using vertex google ai studio",
            data: data
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

const openrouter = async (req, res) => {
    try {
        const { query, model } = req.body;

        if (!query || !model) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "model" and "query" required',
                data: {}
            });
        }

        let chosenModel;
        if (model) {
            if (!models.includes(model)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Unsupported openrouter.ai models',
                    data: {}
                });
            }

            chosenModel = model;
        } else {
            console.log("No model chosen. Falling back to google/gemma-3-27b-it:free . . .");
            chosenModel = "google/gemma-3-27b-it:free";
        }

        const requestBody = {
            model: chosenModel,
            messages: [{ role: 'user', content: query }],
        };

        const response = await fetch(process.env.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://api.simutrade.app',
                'X-Title': 'SimuTrade AI Supply Chain Simulation',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(errorData);
            return res.status(400).json({
                status: 'error',
                message: process.env.DEBUG ? errorData.error.message : "Failed to process request",
                data: errorData.error
            });
        }

        const data = await response.json();
        const chatCompletetion = data.choices[0].message.content

        return res.status(200).json({
            status: 'success',
            message: "Successfuly create AI agent custom chat using openrouter.ai with model " + model,
            data: {
                answer: chatCompletetion
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(400).json({
            status: 'error',
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {}
        });
    }
};

module.exports = {
    vertex,
    openrouter
};

// google/gemma-2-9b-it:free
// google/gemma-3-1b-it:free
// google/gemma-3-4b-it:free
// google/gemma-3-12b-it:free
// google/gemma-3-27b-it:free
// google/gemini-2.0-flash-exp:free