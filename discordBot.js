const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require("discord.js");
const { download, sendGroupMeMessage } = require("./utils");
const config = require("./config");
const fs = require("fs");
const request = require("request-promise");

// Initialize the Discord client with necessary intents and partials
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

let discordGuild;
let discordChannel;

// Once the client is ready, log the guild and channel it is connected to
discordClient.once("ready", () => {
    console.log("Discord Client Ready.");
    discordGuild = discordClient.guilds.cache.get(config.discord.guild);
    discordChannel = discordGuild.channels.cache.get(config.discord.channel);
    console.log(`Connected to Discord guild: ${config.discord.guild}`);
    console.log(`Using Discord channel: ${config.discord.channel}`);
});

// Listen for presence updates (e.g., user status changes)
discordClient.on("presenceUpdate", async (oldPresence, newPresence) => {
    const member = newPresence.member;
    const author = member.nickname || member.user.username;

    // Check if the user has started streaming
    if (!oldPresence.activities.length && newPresence.activities.length) {
        const activity = newPresence.activities.find(activity => activity.type === 'STREAMING');
        if (activity) {
            await sendGroupMeMessage(config, `${author} is now streaming at ${activity.url}`);
        }
    }

    // Check if the user has stopped streaming
    if (oldPresence.activities.length && !newPresence.activities.length) {
        await sendGroupMeMessage(config, `${author} has stopped streaming`);
    }
});

// Listen for new messages in the specified Discord channel
discordClient.on("messageCreate", async (message) => {
    console.log(`Received message from Discord: ${message.author.username}: ${message.content}`);

    // Ignore messages from bots or from other channels
    if (message.author.bot || message.author.username === config.discord.username || message.channel.id !== config.discord.channel || (!message.content && !message.attachments.size)) {
        return;
    }

    const author = message.member.nickname || message.author.username;

    // Handle attachments in the message
    if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        if (attachment.url) {
            try {
                const { contentType, finalPath, finalFilename } = await download(attachment.url, attachment.name);
                const options = {
                    method: 'POST',
                    url: "https://image.groupme.com/pictures",
                    headers: { "X-Access-Token": config.groupme.accessToken },
                    formData: { file: fs.createReadStream(finalPath) }
                };
                const res = await request(options);
                const attachmentUrl = JSON.parse(res).payload.url;
                await sendGroupMeMessage(config, `${author} sent an image:`, [{ type: "image", url: attachmentUrl }]);
            } catch (err) {
                console.error("Error handling attachment:", err);
            }
        }
    } else {
        // Send the message content to GroupMe
        await sendGroupMeMessage(config, `${author}: ${message.cleanContent}`);
    }
});

// Log in to Discord with the bot token
discordClient.login(config.discord.token);

module.exports = discordClient;
