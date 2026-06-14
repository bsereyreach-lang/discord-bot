const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// --------------------
// STORED MATCHES
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

client.on("clientReady", () => {
  console.log("BOT ONLINE");
});

// --------------------
// MESSAGE PARSER
// --------------------
client.on("messageCreate", (message) => {

  let text = message.content || "";

  // Read embeds too
  if (message.embeds?.length > 0) {
    const embed = message.embeds[0];

    text += "\n" + (embed.title || "");
    text += "\n" + (embed.description || "");

    if (embed.fields?.length) {
      for (const field of embed.fields) {
        text += "\n" + field.name;
        text += "\n" + field.value;
      }
    }

    if (embed.footer?.text) {
      text += "\n" + embed.footer.text;
    }
  }

  if (!text.trim()) return;

  // --------------------
  // CLEAN MESSAGE
  // --------------------
  text = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*/g, "")
    .replace(/>/g, "")
    .replace(/\((https?:\/\/.*?)\)/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lower = text.toLowerCase();

  // --------------------
  // STATUS DETECTION
  // --------------------
  let status = "Live";

  if (
    lower.includes("full-time") ||
    lower.includes("full time") ||
    lower.includes("match ended")
  ) {
    status = "Ended";
  }
  else if (
    lower.includes("goaaaa") ||
    lower.includes("goal") ||
    lower.includes("net rippled")
  ) {
    status = "Goal";
  }
  else if (
    lower.includes("half-time") ||
    lower.includes("half time")
  ) {
    status = "Half-time";
  }
  else if (
    lower.includes("second half")
  ) {
    status = "Second-half";
  }
  else if (
    lower.includes("kick-off") ||
    lower.includes("kick off") ||
    lower.includes("kickoff")
  ) {
    status = "Live";
  }

  // --------------------
  // LEAGUE DETECTION
  // --------------------
  let competition = "Unknown";

  const leagueMatch = text.match(/League:\s*(.+)/i);

  if (leagueMatch) {
    competition = leagueMatch[1].split(",")[0].trim();
  }

  // --------------------
  // SCORE PARSER
  // --------------------
  let home = null;
  let away = null;
  let homeScore = null;
  let awayScore = null;

  const scoreMatch = text.match(
    /([A-Za-zÀ-ÿ'.\- ]+?)\s+(\d+)\s*-\s*(\d+)\s+([A-Za-zÀ-ÿ'.\- ]+)/m
  );

  if (scoreMatch) {
    home = scoreMatch[1].trim();
    homeScore = Number(scoreMatch[2]);
    awayScore = Number(scoreMatch[3]);
    away = scoreMatch[4].trim();
  }

  if (!home || !away) return;

  // --------------------
  // GOAL MINUTE
  // --------------------
  let minute = null;

  const minuteMatch = text.match(/\[(\d+)'?\]/);

  if (minuteMatch) {
    minute = Number(minuteMatch[1]);
  }

  // --------------------
  // SAVE DATA
  // --------------------
  const data = {
    type: "match_update",
    status,
    competition,
    home,
    away,
    homeScore,
    awayScore,
    minute,
    timestamp: Date.now(),
    raw: text
  };

  messages.push(data);

  if (messages.length > 100) {
    messages.shift();
  }

  console.log(
    `[${status}] ${home} ${homeScore}-${awayScore} ${away}`
  );
});

// --------------------
// API ROUTES
// --------------------
app.get("/", (req, res) => {
  res.send("Football API Running");
});

app.get("/messages", (req, res) => {
  res.json({
    success: true,
    count: messages.length,
    messages
  });
});

app.get("/latest", (req, res) => {
  res.json(
    messages.length
      ? messages[messages.length - 1]
      : {}
  );
});

// --------------------
// START EXPRESS
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API RUNNING ON ${PORT}`);
});

// --------------------
// LOGIN
// --------------------
client.login(process.env.TOKEN);
