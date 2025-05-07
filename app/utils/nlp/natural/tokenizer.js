const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const stopwords = new Set(natural.stopwords);

const tokenize = (text) => {
    const words = tokenizer.tokenize(text);

    const processedWords = words
        .map(word => stemmer.stem(word.toLowerCase()))
        .filter(word => !stopwords.has(word));

    return processedWords;
};

module.exports = tokenize;