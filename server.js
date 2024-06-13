const express = require("express");
const bodyParser = require("body-parser");
const { download } = require("./utils");
const config = require("./config");
const discordClient = require("./discordBot");
const { v1: uuidv1 } = require("uuid");
const fs = require("fs");

// Initialize Express app
const expressApp = express();
expressApp.use(bodyParser.json());

// Handle POST requests to the callback URL
expressApp.post(config.callbackURL, async (req, res) => {
    // Ignore messages sent by the bot itself
    if (req.body.name === config.groupme.name) {
        res.status(200).send('OK');
        return;
    }

    const text = req.body.text;
    const sender = req.body.name;
    const attachments = req.body.attachments;

    // Check for attachments
    if (attachments.length > 0) {
        const attachment = attachments[0];
        if (attachment.url) {
            try {
                const isImage = attachment.type === "image";
                const filename = `${uuidv1()}.${attachment.url.split('.').pop()}`;
                const { contentType, finalPath, finalFilename } = await download(attachment.url, filename);
                const stats = fs.statSync(finalPath);

                // Check file size (Discord max file size is 8MB)
                if (stats.size > (8 * 1024 * 1024)) {
                    await discordChannel.send(`**${sender}** ***Sent ${isImage ? "an image" : "a video"}:*** ${attachment.url}`);
                } else {
                    await discordChannel.send({ content: `**${sender}**: ${text}`, files: [new AttachmentBuilder(finalPath, { name: finalFilename })] });
                }
                fs.unlinkSync(finalPath);
            } catch (err) {
                console.error("Error handling attachment:", err);
            }
        }
    } else {
        // Send message to Discord channel
        await discordChannel.send(`**${sender}**: ${text}`);
    }

    res.status(200).send('OK');
});

// Start the Express server
expressApp.listen(config.listenPort, () => console.log(`Express now listening for requests on port ${config.listenPort}`));
