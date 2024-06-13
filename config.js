const fs = require("fs");
const YAML = require("yamljs");

// Define the default configuration
const DEFAULT_CONFIG = {
    listenPort: process.env.LISTEN_PORT || 8088, // Server listening port
    callbackURL: process.env.CALLBACK_URL || "/callback", // Callback URL for GroupMe
    discord: {
        username: process.env.DISCORD_USERNAME || "my-bot", // Discord bot username
        token: process.env.DISCORD_TOKEN || "", // Discord bot token
        guild: process.env.DISCORD_GUILD || "0", // Discord guild ID
        channel: process.env.DISCORD_CHANNEL || "0" // Discord channel ID
    },
    groupme: {
        name: process.env.GROUPME_NAME || "", // GroupMe bot name
        botId: process.env.GROUPME_BOT_ID || "", // GroupMe bot ID
        accessToken: process.env.GROUPME_ACCESS_TOKEN || "" // GroupMe access token
    }
};

let config;

try {
    // Attempt to load the configuration from the YAML file
    config = YAML.load("bridgeBot.yml");
} catch (e) {
    // If the file does not exist, create it with the default configuration
    console.error("Could not load bridgeBot.yml, perhaps it doesn't exist? Creating it...");
    fs.writeFileSync("bridgeBot.yml", YAML.stringify(DEFAULT_CONFIG, 4));
    console.error("Configuration file created. Please fill out the fields and then run the bot again.");
    process.exit(1);
}

module.exports = config;
