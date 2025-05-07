const { pipeline } = require("@xenova/transformers");

let extractor, modelLoaded = false;

async function loadModel(model) {
    extractor = await pipeline("feature-extraction", model);
    modelLoaded = true;
    console.log("Xenova transformers model loadad: " + model);
}

async function generateEmbedding(text) {
    if (!modelLoaded) {
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        modelLoaded = true;
    }
    const embedding = await extractor(text, { pooling: "mean", normalize: true });
    return embedding.data;
}

module.exports = {
    loadModel,
    generateEmbedding
}