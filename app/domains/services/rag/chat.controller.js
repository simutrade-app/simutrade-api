const Service = require('../entities/services.model').Service;

const create = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "query" required',
                data: {}
            });
        }

        const getService = await Service.findOne({ email: req.user.email });
        if (!getService) {
            return res.status(400).json({
                status: 'error',
                message: "User is not registered yet",
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
        getService.chatSession.push({chatData: [data]});
        const chatId = await getService.save();

        data["_id"] = chatId.chatSession.slice(-1)[0]._id;

        return res.status(200).json({
            status: 'success',
            message: "Successfuly create user chat",
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
            message: "Successfuly read all user chat",
            data: {
                chatSession: getService.chatSession
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

const readbyID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "chatId" required',
                data: {}
            });
        }

        const chatSession = await Service.findOne(
            { email: req.user.email, "chatSession._id": id },
            { "chatSession.$": 1 }
        );

        if (!chatSession) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chat id: chatId not found',
                data: {}
            });
        }

        let session = chatSession["chatSession"][0].toObject();
        session.chatData = session.chatData.map(({ _id, ...data }) => data);

        res.status(200).json({
            status: "success",
            message: "Successfuly read user chat by ID",
            data: session
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

const update = async (req, res) => {
    try {
        const { id, query } = req.body;

        if (!id || !query) {
            return res.status(400).json({
                status: 'error',
                message: 'Parameter "id" and "query" required',
                data: {}
            });
        }

        const chatData = await Service.findOne(
            { email: req.user.email, "chatSession._id": id },
            { "chatSession.$": 1 }
        );
        if (!chatData) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chat id: id not found',
                data: {}
            });
        }

        let chatSession = chatData["chatSession"][0].toObject()["chatData"];

        console.log(chatSession);

        let chatRequest = "Here is the previous chat between our customer and AI asstant:\n";

        for (chat of chatSession) {
            chatRequest += `user: ${chat["query"]}\n`;
            chatRequest += `user: ${chat["response"][0]["text"]}\n`;
        }

        chatRequest += `User added a reply: ${query}\n\nFollow up the user reply`;

        const requestBody = {
            query: chatRequest
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

        data["query"] = query;

        await Service.findOneAndUpdate(
            { 
                email: req.user.email, 
                "chatSession._id": id 
            },{ 
                $push: { 
                    "chatSession.$.chatData": { $each: [data] }
                }
            }
        );

        return res.status(200).json({
            status: 'success',
            message: "Successfuly update user chat",
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

module.exports = {
    create,
    read,
    readbyID,
    update
};