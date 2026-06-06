const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// --------------------
// STORE MATCHES
// --------------------
let messages = [];

// --------------------
// DISCORD BOT
// --------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log("BOT ONLINE");
});

// --------------------
// MESSAGE PARSER
// --------------------
client.on("messageCreate", (message) => {

    let text = message.content || "";

    // embed support
    if (!text && message.embeds?.length > 0) {
        const embed = message.embeds[0];
        text = `${embed.title || ""}\n${embed.description || ""}`;
    }

    if (!text) return;

    // CLEAN TEXT
    text = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\*\*/g, "")
        .replace(/>/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/\((https?:\/\/.*?)\)/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/Match report[\s\S]*/i, "")
        .replace(/Click here[\s\S]*/i, "")
        .trim();

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // STATUS
    let status = "Live";
    const lower = text.toLowerCase();

    if (lower.includes("match ended")) status = "Ended";

    // FIND SCORE
    const scoreLine = lines.find(l => /\d+\s*-\s*\d+/.test(l));

    if (!scoreLine) return;

    const match = scoreLine.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);

    if (!match) return;

    const home = match[1].trim();
    const homeScore = Number(match[2]);
    const awayScore = Number(match[3]);
    const away = match[4].trim();

    const data = {
        status,
        home,
        away,
        homeScore,
        awayScore
    };

    messages.push(data);

    if (messages.length > 50) messages.shift();

    console.log("MATCH:", data);
});

// --------------------
// API ROUTES
// --------------------
app.get("/", (req, res) => {
    res.status(200).send("API WORKING");
});

app.get("/messages", (req, res) => {
    res.json({ messages });
});

// --------------------
// IMPORTANT RAILWAY FIX (THIS IS WHAT YOU WERE MISSING)
// --------------------
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
    console.log("API RUNNING ON PORT", PORT);
});

// --------------------
// LOGIN BOT
// --------------------
client.login(process.env.TOKEN);
