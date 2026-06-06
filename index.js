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

// --------------------
// MESSAGE LISTENER (DEBUG + CLEAN)
// --------------------
client.on("messageCreate", (message) => {

    // 🔴 DEBUG: show EVERYTHING received
    console.log("----- NEW MESSAGE -----");
    console.log("CONTENT:", message.content);

    if (message.embeds?.length > 0) {
        console.log("EMBED:", JSON.stringify(message.embeds[0], null, 2));
    }

    let text = message.content || "";

    // embed support (sports bots)
    if (!text && message.embeds?.length > 0) {
        const embed = message.embeds[0];
        text = `${embed.title || ""}\n${embed.description || ""}`;
    }

    if (!text) return;

    // --------------------
    // CLEAN TEXT (REMOVE NOISE)
    // --------------------
    text = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\*\*/g, "")
        .replace(/>/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // [text](link)
        .replace(/\((https?:\/\/.*?)\)/g, "") // (link)
        .replace(/https?:\/\/\S+/g, "") // raw links
        .replace(/Match report[\s\S]*/i, "")
        .replace(/Click here[\s\S]*/i, "")
        .replace(/\n{2,}/g, "\n")
        .trim();

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // --------------------
    // STATUS DETECTION
    // --------------------
    let status = "Live";

    const lower = text.toLowerCase();

    if (lower.includes("kick")) status = "Live";
    if (lower.includes("half time")) status = "Live";
    if (lower.includes("second half")) status = "Live";
    if (lower.includes("goal")) status = "Live";
    if (lower.includes("match ended")) status = "Ended";

    // --------------------
    // FIND SCORE LINE
    // --------------------
    const scoreLine = lines.find(l => /\d+\s*-\s*\d+/.test(l));

    if (!scoreLine) return;

    const match = scoreLine.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);

    if (!match) return;

    const home = match[1].trim();
    const homeScore = Number(match[2]);
    const awayScore = Number(match[3]);
    const away = match[4].trim();

    // --------------------
    // SAVE CLEAN DATA
    // --------------------
    const data = {
        status,
        home,
        away,
        homeScore,
        awayScore
    };

    messages.push(data);

    if (messages.length > 50) messages.shift();

    console.log("MATCH SAVED:", data);
});

// --------------------
// API FOR ROBLOX
// --------------------
app.get("/", (req, res) => {
    res.send("API RUNNING");
});

app.get("/messages", (req, res) => {
    res.json({ messages });
});

// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API RUNNING ON PORT", PORT);
});

// BOT LOGIN
client.login(process.env.TOKEN);
