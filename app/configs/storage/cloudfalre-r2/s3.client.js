const { R2 } =  require('node-cloudflare-r2');
const path = require("path");

const r2 = new R2({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
});

const bucket = r2.bucket(process.env.R2_BUCKET);

bucket.provideBucketPublicUrl(process.env.R2_PUBLIC_URL);

const uploadPDF = async (file, directory) => {
    if (file.mimetype != "application/pdf") {
        throw {
            "name": "MimeTypeNotAllowed",
            "message": `Mimetype ${file.mimetype} is not allowed`
        };
    }

    const fileExtension = path.extname(file.originalname);
    const allowedExtension = ['.pdf'];

    if (!allowedExtension.includes(fileExtension)) {
        throw {
            "name": "ExtensionNotAllowed",
            "message": `Extension ${fileExtension} is not allowed`
        };
    }
    const upload = await bucket.uploadFile(file.path, directory, undefined, 'application/pdf');
    return upload.publicUrls[0];
};

module.exports = uploadPDF;