const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();

let messages = [];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log("BOT ONLINE");
});

client.on("messageCreate", (message) => {
    let text = message.content || "";

    // Read embeds from sports bots
    if (!text && message.embeds && message.embeds.length > 0) {
        const embed = message.embeds[0];

        text = [
            embed.title || "",
            embed.description || ""
        ].join("\n");
    }

    if (!text) return;

    // Convert [Brazil 2 - 0 Egypt](url)
    // into Brazil 2 - 0 Egypt
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");

    let status = "Live";

    if (text.toLowerCase().includes("match ended")) {
        status = "Ended";
    }

    const scoreMatch = text.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);

    if (!scoreMatch) return;

    const home = scoreMatch[1].trim();
    const homeScore = parseInt(scoreMatch[2]);
    const awayScore = parseInt(scoreMatch[3]);
    const away = scoreMatch[4].trim();

    const matchData = {
        status,
        home,
        away,
        homeScore,
        awayScore
    };

    messages.push(matchData);

    if (messages.length > 50) {
        messages.shift();
    }

    console.log("MATCH:", matchData);
});

app.get("/", (req, res) => {
    res.send("API RUNNING");
});

app.get("/messages", (req, res) => {
    res.json({
        messages
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API RUNNING");
});

client.login(process.env.TOKEN);
