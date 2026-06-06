const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// --------------------
// DATA STORAGE
// --------------------
let messages = [];

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
// RAILWAY SAFE PORT
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("API RUNNING ON PORT", PORT);
});

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

    try {
        let text = message.content || "";

        // embed support (sports bots)
        if (!text && message.embeds && message.embeds.length > 0) {
            const embed = message.embeds[0];
            text = (embed.title || "") + "\n" + (embed.description || "");
        }

        if (!text) return;

        // clean junk
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

        // status
        let status = "Live";
        const lower = text.toLowerCase();

        if (lower.includes("match ended")) status = "Ended";

        // score detection
        const scoreLine = lines.find(l => /\d+\s*-\s*\d+/.test(l));
        if (!scoreLine) return;

        const match = scoreLine.match(/(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/);
        if (!match) return;

        const data = {
            status: status,
            home: match[1].trim(),
            homeScore: Number(match[2]),
            awayScore: Number(match[3]),
            away: match[4].trim()
        };

        messages.push(data);

        if (messages.length > 50) {
            messages.shift();
        }

        console.log("MATCH:", data);

    } catch (err) {
        console.log("ERROR:", err.message);
    }
});

// --------------------
// DISCORD LOGIN (SAFE)
// --------------------
client.login(process.env.TOKEN)
    .then(() => console.log("BOT LOGIN SENT"))
    .catch(err => console.log("LOGIN ERROR:", err.message));
