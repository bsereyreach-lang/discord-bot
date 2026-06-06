const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// --------------------
// STORAGE
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
// MESSAGE HANDLER
// --------------------
client.on("messageCreate", (message) => {

    let text = message.content || "";

    // embed support (sports bots)
    if (!text && message.embeds?.length > 0) {
        const embed = message.embeds[0];
        text = `${embed.title || ""}\n${embed.description || ""}`;
    }

    if (!text) return;

    // --------------------
    // CLEAN TEXT (REMOVE JUNK)
    // --------------------
    text = text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\*\*/g, "")
        .replace(/>/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // [text](link)
        .replace(/\((https?:\/\/.*?)\)/g, "") // (link)
        .replace(/https?:\/\/\S+/g, "")
        .replace(/Match report[\s\S]*/i, "")
        .replace(/Click here[\s\S]*/i, "")
        .replace(/\n{2,}/g, "\n")
        .trim();

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // --------------------
    // STATUS
    // --------------------
    let status = "Live";
    const lower = text.toLowerCase();

    if (lower.includes("match ended")) status = "Ended";
    else if (lower.includes("kick")) status = "Live";
    else if (lower.includes("half")) status = "Live";
    else if (lower.includes("goal")) status = "Live";

    // --------------------
    // FIND SCORE
    // --------------------
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
// EXPRESS API
// --------------------
app.get("/", (req, res) => {
    res.send("API WORKING");
});

app.get("/messages", (req, res) => {
    res.json({ messages });
});

// --------------------
// RAILWAY SAFE PORT FIX
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("API RUNNING ON PORT", PORT);
});

// --------------------
// LOGIN BOT
// --------------------
client.login(process.env.TOKEN);
