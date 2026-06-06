const { Client, GatewayIntentBits } = require("discord.js");

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

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  console.log(message.content);
});

client.login(process.env.TOKEN);