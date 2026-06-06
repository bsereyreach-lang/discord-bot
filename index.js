const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// STORE CLEAN MATCHES
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

client.on("clientReady", () => {
  console.log("BOT ONLINE");
});

// --------------------
// MESSAGE PARSER (STRICT CLEAN SYSTEM)
// --------------------
client.on("messageCreate", (message) => {
  if (!message) return;

  let text = message.content || "";

  // embed support
  if (!text && message.embeds?.length > 0) {
    const embed = message.embeds[0];
    text = (embed.title || "") + "\n" + (embed.description || "");
  }

  if (!text) return;

  // --------------------
  // CLEAN ALL NOISE
  // --------------------
  text = text
    .replace(/```[\s\S]*?```/g, "")              // code blocks
    .replace(/\*\*/g, "")                       // bold
    .replace(/>/g, "")                         // quote
    .replace(/\((https?:\/\/.*?)\)/g, "")      // (links)
    .replace(/https?:\/\/\S+/g, "")            // raw links
    .replace(/Match report[\s\S]*/i, "")       // remove reports
    .replace(/Click here[\s\S]*/i, "")         // remove junk
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // --------------------
  // DEFAULT VALUES
  // --------------------
  let status = "Live";
  let competition = "Unknown";
  let home = null;
  let away = null;
  let homeScore = null;
  let awayScore = null;

  const lower = text.toLowerCase();

  // --------------------
  // STATUS DETECTION
  // --------------------
  if (lower.includes("kick")) status = "Live";
  else if (lower.includes("half time")) status = "Half-time";
  else if (lower.includes("second half")) status = "Second-half";
  else if (lower.includes("ended")) status = "Ended";
  else if (lower.includes("goal")) status = "Goal";

  // --------------------
  // COMPETITION
  // --------------------
  competition =
    lines.find(l => l.toLowerCase().includes("friendlies")) ||
    "Unknown";

  // --------------------
  // SCORE PARSER (ONLY IMPORTANT LINE)
  // --------------------
  const scoreLine = lines.find(l => /\d+\s*-\s*\d+/.test(l));

  if (scoreLine) {
    const match = scoreLine.match(/(.+?)\s(\d+)\s*-\s*(\d+)\s(.+)/);

    if (match) {
      home = match[1].trim();
      homeScore = Number(match[2]);
      awayScore = Number(match[3]);
      away = match[4].trim();
    }
  }

  // --------------------
  // IGNORE INVALID MESSAGES
  // --------------------
  if (!home || !away || homeScore === null || awayScore === null) return;

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

// --------------------
// START SERVER
// --------------------
app.listen(3000, () => {
  console.log("API RUNNING");
});

// LOGIN BOT
client.login(process.env.TOKEN);
