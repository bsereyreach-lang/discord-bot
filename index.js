const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// STORE DATA
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

client.on("ready", () => {
  console.log("BOT ONLINE");
});

// --------------------
// MESSAGE HANDLER (CLEAN + SAFE)
// --------------------
client.on("messageCreate", (message) => {
  if (!message) return;

  // RAW TEXT OR EMBED TEXT
  let text = message.content || "";

  if (!text && message.embeds?.length > 0) {
    const embed = message.embeds[0];
    text = (embed.title || "") + "\n" + (embed.description || "");
  }

  if (!text) return;

  // --------------------
  // CLEAN DISCORD FORMAT
  // --------------------
  text = text
    .replace(/```[\s\S]*?```/g, "")        // code blocks
    .replace(/\*\*/g, "")                 // bold **
    .replace(/>/g, "")                   // quote >
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")   // links
    .replace(/https?:\/\/\S+/g, "")       // raw URLs
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // --------------------
  // DEFAULT VALUES
  // --------------------
  let status = "Unknown";
  let competition = null;
  let home = null;
  let away = null;
  let homeScore = null;
  let awayScore = null;
  let eventText = null;
  let minute = null;

  const lower = text.toLowerCase();

  // --------------------
  // STATUS DETECTION
  // --------------------
  if (lower.includes("kick")) status = "Kick-off";
  else if (lower.includes("half")) status = "Half-time";
  else if (lower.includes("second half")) status = "Second-half";
  else if (lower.includes("ended")) status = "Ended";
  else if (lower.includes("goal")) status = "Goal";
  else status = "Live";

  // --------------------
  // COMPETITION
  // --------------------
  competition =
    lines.find(l => l.toLowerCase().includes("friendlies")) ||
    "Unknown";

  // --------------------
  // SCORE PARSER
  // --------------------
  const scoreLine = lines.find(l => /\d+\s*-\s*\d+/.test(l));

  if (scoreLine) {
    const match = scoreLine.match(/(.+?)\s(\d+)\s*-\s*(\d+)\s(.+)/);

    if (match) {
      home = match[1].trim();
      homeScore = parseInt(match[2]);
      awayScore = parseInt(match[3]);
      away = match[4].trim();
    }
  }

  // --------------------
  // GOAL EVENT
  // --------------------
  if (lower.includes("goal")) {
    eventText = text;

    const minuteMatch = text.match(/(\d+)'/);
    if (minuteMatch) minute = parseInt(minuteMatch[1]);
  }

  // --------------------
  // STORE CLEAN DATA
  // --------------------
  messages.push({
    type: "match_update",
    status,
    competition,
    home,
    away,
    homeScore,
    awayScore,
    eventText,
    minute,
    raw: text
  });

  if (messages.length > 50) messages.shift();

  console.log("MATCH:", status, home, homeScore, "-", awayScore, away);
});

// --------------------
// API FOR ROBLOX
// --------------------
app.get("/messages", (req, res) => {
  res.json({ messages });
});

// START SERVER
app.listen(3000, () => {
  console.log("API RUNNING");
});

// LOGIN BOT
client.login(process.env.TOKEN);