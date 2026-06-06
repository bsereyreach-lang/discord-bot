const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

const app = express();
app.use(express.json());

// STORE LAST MESSAGE
let latestMessage = "";

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

// READ DISCORD MESSAGE
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  latestMessage = message.content;
  console.log("Discord:", latestMessage);
});

// API FOR ROBLOX
app.get("/message", (req, res) => {
  res.json({ message: latestMessage });
});

// START SERVER
app.listen(3000, () => {
  console.log("API RUNNING");
});

// LOGIN BOT
client.login(process.env.TOKEN);