const Service = require('../entities/services.model').Service;
const uploadPDF = require('../../../configs/storage/cloudfalre-r2/s3.client');

const latex = require('node-latex');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp');

const create = async (req, res) => {
    try {
        const { chatId } = req.body;

        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User is not registered yet",
                data: {}
            });
        }

        const chatData = await Service.findOne(
            { email: req.user.email, "chatSession._id": chatId },
            { "chatSession.$": 1 }
        );
        if (!chatData) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chatId: chatId not found',
                data: {}
            });
        }

        let chatSession = chatData["chatSession"][0].toObject()["chatData"];

        let chatRequest = "Here is the previous chat between our customer and AI asstant:\n";

        for (chat of chatSession) {
            chatRequest += `user: ${chat["query"]}\n`;
            chatRequest += `user: ${chat["response"][0]["text"]}\n`;
        }

        const requestBody = {
            model: "google/gemma-3-27b-it:free",
            messages: [{ role: 'user', content: chatRequest + "\n\nBased on data above, create a latex document explaining the facts. Output only the latex file format." }],
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

        getService.pdfGeneration.push({
            chatId: chatId,
            createdAt: new Date() 
        });
        const newService = await getService.save();
        const pdfID = newService.pdfGeneration.slice(-1)[0]._id

        const data = await response.json();
        const chatCompletetion = data.choices[0].message.content.replace("```latex", "").replace("```", "");

        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(path.join(tempDir, 'output.tex'), chatCompletetion);

        const input = fs.createReadStream(path.join(tempDir, 'output.tex'));
        const output = fs.createWriteStream(path.join(tempDir, `${pdfID}.pdf`))
        const pdf = latex(input)
        await new Promise((resolve, reject) => {
            pdf.pipe(output);
            pdf.on('error', reject);
            pdf.on('finish', resolve);
        });

        const pdfURL = await uploadPDF(path.join(tempDir, `${pdfID}.pdf`), `pdf/${pdfID}.pdf`);

        return res.status(200).json({
            status: 'success',
            message: "Successfuly create user pdf from user chat",
            data: {
                pdfID: pdfID
                pdfURL: pdfURL
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

const read = async (req, res) => {
    try {
        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User is not registered yet",
                data: {}
            });
        }

        res.status(200).json({
            status: "success",
            message: "Successfuly read all user pdf",
            data: {
                chatData: getService.pdfGeneration
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
    create,
    read
};