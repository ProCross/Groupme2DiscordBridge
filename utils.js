const fs = require("fs");
const path = require("path");
const request = require("request-promise");
const { v1: uuidv1 } = require("uuid");
const os = require("os");

const TEMP_DIR = path.join(os.tmpdir(), "groupme-discord-bridge");

const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp"
};

function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    return mimeTypes[ext] || "application/octet-stream";
}

async function detectFileType(filePath) {
    const fileBuffer = await fs.promises.readFile(filePath);
    const fileType = await import('file-type');
    const type = await fileType.fromBuffer(fileBuffer);
    return type;
}

async function download(url, filename) {
    const downloadedLocation = path.join(TEMP_DIR, filename);

    await new Promise((resolve, reject) => {
        request(url)
            .pipe(fs.createWriteStream(downloadedLocation))
            .on('finish', resolve)
            .on('error', reject);
    });

    const detectedType = await detectFileType(downloadedLocation);
    const contentType = detectedType ? detectedType.mime : getMimeType(filename);
    const finalFilename = detectedType ? `${filename}.${detectedType.ext}` : filename;

    const finalPath = path.join(TEMP_DIR, finalFilename);
    await fs.promises.rename(downloadedLocation, finalPath);

    return { contentType, finalPath, finalFilename };
}

async function sendGroupMeMessage(config, message, attachments = null) {
    try {
        const options = {
            method: 'POST',
            uri: 'https://api.groupme.com/v3/bots/post',
            body: {
                bot_id: config.groupme.botId,
                text: message,
                attachments: attachments || undefined
            },
            json: true
        };
        const res = await request(options);
        return res;
    } catch (err) {
        console.error("Error sending GroupMe message:", err);
        throw err;
    }
}

fs.mkdirSync(TEMP_DIR, { recursive: true });

module.exports = {
    getMimeType,
    download,
    sendGroupMeMessage
};
