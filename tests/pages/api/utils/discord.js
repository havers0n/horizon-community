const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')

export default async function handler(channel, data) {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD)
    data.embeds[0].setAuthor({ name: process.env.NEXT_PUBLIC_NAME, iconURL: guild.iconURL({ dynamic: true }) })
    let ch = await guild.channels.fetch(channel)
    await ch.send(data);
}

client.login(process.env.DISCORD_TOKEN)