const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();

let messages = [];

app.use(express.json());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`BOT ONLINE: ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  try {
    let text = message.content || "";

    if (message.embeds.length > 0) {
      const embed = message.embeds[0];

      text += "\n" + (embed.title || "");
      text += "\n" + (embed.description || "");

      if (embed.fields) {
        for (const field of embed.fields) {
          text += "\n" + field.name;
          text += "\n" + field.value;
        }
      }
    }

    if (!text.trim()) return;

    const lower = text.toLowerCase();

    let status = "Live";

    if (
      lower.includes("full-time") ||
      lower.includes("full time") ||
      lower.includes("match ended")
    ) {
      status = "Ended";
    } else if (
      lower.includes("goal") ||
      lower.includes("goaaaa") ||
      lower.includes("net rippled")
    ) {
      status = "Goal";
    } else if (
      lower.includes("half-time") ||
      lower.includes("half time")
    ) {
      status = "Half-time";
    }

    const scoreMatch = text.match(
      /(.+?)\s+(\d+)\s*-\s*(\d+)\s+(.+)/
    );

    if (!scoreMatch) return;

    const data = {
      status,
      home: scoreMatch[1].trim(),
      homeScore: Number(scoreMatch[2]),
      awayScore: Number(scoreMatch[3]),
      away: scoreMatch[4].trim(),
      timestamp: Date.now()
    };

    messages = [data];

    console.log(data);

  } catch (err) {
    console.error(err);
  }
});

app.get("/", (req, res) => {
  res.send("Football API Running");
});

app.get("/latest", (req, res) => {
  res.json(messages[0] || {});
});

app.get("/messages", (req, res) => {
  res.json(messages);
});

app.get("/clear", (req, res) => {
  messages = [];
  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API RUNNING ON ${PORT}`);
});

client.login(process.env.TOKEN);
