# GroupMe-Discord Bridge
A "Bridge" Bot That Links GroupMe and Discord.
The bridge is designed to run on a server and operates entirely via the command line. While you can run it on your home computer, it's not recommended due to the need to open your firewall for GroupMe message reception, which poses security risks.

**SECURITY NOTICE:** To ensure secure communication, run the bridge behind a reverse proxy with HTTPS enabled. The bridge uses plain HTTP to receive data from GroupMe, which could be intercepted if not protected. A reverse proxy forwards secure requests from your web server to the bridge over the local network, enhancing security.

## Table of Contents
- [Requirements](##requirements)
- [Limitations](##limitations)
- [Setting up](##setting-up)
- [Configuration](##configuration)
- [Running the Bridge](##running-the-bridge)
- [License](##license)

## Requirements
- NodeJS installed.
- Your firewall opened for a port so GroupMe can send the bridge messages **OR** a forward-facing web server like Nginx or Apache that you can configure a reverse proxy for.

## Limitations
The program can only bridge a single GroupMe Group and a single Discord Channel together. Because of how GroupMe Bots work (only a single bot can be in a single group), this is unlikely to change soon.

## Setting up
1. Clone this repository (or download it) and then run:
    ```bash
    npm install
    ```
    to fetch dependencies.

2. Run:
    ```bash
    node app.js
    ```
    It should error out saying you don't have a config file, and it will create a skeleton one for you, which should look something like this:
    ```yaml
    listenPort: 8088
    callbackURL: "/callback"
    discord:
        username: my-bot
        token: ""
        guild: '0'
        channel: '0'
    groupme:
        name: ""
        botId: ""
        accessToken: ""
    ```

3. You can change `listenPort` to the port you want the bridge to listen on. That's the port GroupMe will be sending messages to, and the one that needs to be open in your Firewall **OR** configured in your reverse proxy, which is out of the scope of this guide. There are many guides online on how to configure a reverse proxy.

4. Next, you will need to create a Discord bot account on the Discord developers page. You can use this [handy guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). The Discord web interface has changed a bit, so you'll need to select "Bot" on the far left to create the bot account and see the access token. Once you've added the Discord bot to your Guild, you'll need to copy the "Token" and put it in the `bridgeBot.yml` config file. It goes in the "token" field under "discord" in the YAML file. Also fill in the "username" field with the Discord bot's username that you gave.
    ```yaml
    listenPort: 8088
    callbackURL: "/callback"
    discord:
        username: "YOUR DISCORD BOT's USERNAME HERE"
        token: "YOUR DISCORD TOKEN HERE"
        guild: '0'
        channel: '0'
    groupme:
        name: ""
        botId: ""
        accessToken: ""
    ```

5. Now you will need the Guild and Channel IDs for the Discord side. In Discord, you'll need to enable Developer mode (you can find this option under "Settings->Appearance->Advanced"). Now you can right-click on the Discord Guild (or server as it is called in the client) and click "copy-ID". You can paste that in the "guild" field in `bridgeBot.yml`. Do the same for the channel by right-clicking on the channel and clicking "copy-ID". Paste that in the "channel" field.
    ```yaml
    listenPort: 8088
    callbackURL: "/callback"
    discord:
        username: "YOUR DISCORD BOT's USERNAME HERE"
        token: "YOUR DISCORD TOKEN HERE"
        guild: 'THE GUILD ID YOU COPIED'
        channel: 'THE CHANNEL ID YOU COPIED'
    groupme:
        name: ""
        botId: ""
        accessToken: ""
    ```

6. Finally, we need to set up the GroupMe bot. Head over to https://dev.groupme.com/ and sign in with your GroupMe account. Once you've logged in, you'll need to head over to https://dev.groupme.com/bots and click on the "Create a Bot" button. Select which GroupMe group you want the bot to be in, and give it a Name and an Avatar URL (a URL to a picture) if you choose to do so. For the callback URL, you need to put in the address that the bridge will receive GroupMe messages from.

    For example, if I am running the bridge on my server, myserver.com, and I set `listenPort` to be 8088 and `callbackURL` set to "/callback", then the callback URL will be "http://myserver.com:8088/callback".

    The callback URL is very important, as if it is not correct then the bridge will not receive messages from GroupMe and nothing will show up in Discord. This is probably the number 1 cause of the bridge not working.

    Once you've created the GroupMe bot, copy its "bot ID" and paste it in `bridgeBot.yml` in the "botId" field. You'll also need to copy your GroupMe access token, which can be found by clicking on "Access Token" in the top right of the GroupMe developers site. 

    Also enter the bot's name under the "name" field in the config file. The Bot's name should match the name you gave it on the GroupMe site, case-sensitive and must match perfectly, as if it doesn't the bridge will echo and relay the GroupMe bot's messages on Discord!
    ```yaml
    listenPort: 8088
    callbackURL: "/callback"
    discord:
        username: "YOUR DISCORD BOT's USERNAME HERE"
        token: "YOUR DISCORD TOKEN HERE"
        guild: 'THE GUILD ID YOU COPIED'
        channel: 'THE CHANNEL ID YOU COPIED'
    groupme:
        name: "YOUR GROUPME BOT's NAME"
        botId: "THE GROUPME BOT's ID"
        accessToken: "YOUR GROUPME ACCESS TOKEN"
    ```

## Configuration
1. Change `listenPort` to the port you want the bridge to listen on. That's the port GroupMe will be sending messages to, and the one that needs to be open in your Firewall **OR** configured in your reverse proxy.

2. Fill in the Discord bot details:
    - `username`: The Discord bot's username.
    - `token`: The token for your Discord bot.
    - `guild`: The ID of your Discord server (guild).
    - `channel`: The ID of the Discord channel.

3. Set up the GroupMe bot:
    - `name`: The name of your GroupMe bot.
    - `botId`: The GroupMe bot's ID.
    - `accessToken`: Your GroupMe access token.

## Running the Bridge
Save the config file and run:
```bash
node app.js
```

## License
This project is licensed under the BSD 2-Clause License - see the [LICENSE](https://github.com/ProCross/Groupme2DiscordBridge/blob/master/LICENSE) file for details.
