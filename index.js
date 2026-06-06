const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// STORE MANY MESSAGES
let messages = [];

// DISCORD BOT
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

// SAVE MESSAGES
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  messages.push({
    content: message.content,
    user: message.author.username,
    time: Date.now()
  });

  // limit memory (important)
  if (messages.length > 50) {
    messages.shift();
  }

  console.log(message.author.username + ":", message.content);
});

// ROBLOX API (GET ALL MESSAGES)
app.get("/messages", (req, res) => {
  res.json({ messages });
});

// START SERVER
app.listen(3000, () => {
  console.log("API RUNNING");
});

// LOGIN
client.login(process.env.TOKEN);