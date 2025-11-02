'use strict';
require('dotenv').config()
// Require the necessary discord.js classes
const { Client, Events, Collection, GatewayIntentBits, ChannelType } = require('discord.js');
//require navigation
const fs = require('node:fs');
const path = require('node:path');
//express
const express = require('express');
const app = express()

//new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
let token;
if (process.env.PRODUCTION == 1) {
	token = process.env.BOT_TOKEN
}
else {
	token = process.env.TEST_BOT_TOKEN
}
client.login(token);

client.commands = new Collection();
//Configure command paths
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//Initialize command handler
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	//console.log(interaction);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

//ENDPOINTS FOR STUFF
app.get("/health", (req, res) => {
	res.status(200).send("Healthcheck succeeded!");
})

app.post('/trait', (req, res) => {
	if (!req.headers["x-dmbot-header"]) {
		res.status(403).send("Unauthorized");
	}
	else {

    }
});

app.get('/guild/:guildId/is-bot-present', async (req, res) => {
	// Check for authorization header
	if (!req.headers["x-dmbot-header"]) {
		return res.status(403).send("Unauthorized");
	}

	const { guildId } = req.params;

	try {
		// Try to fetch the guild
		const guild = await client.guilds.fetch(guildId);
		
		if (guild) {
			res.status(200).json({
				guildId: guild.id,
				guildName: guild.name,
				isBotPresent: true,
				memberCount: guild.memberCount,
				joinedAt: guild.joinedAt
			});
		} else {
			res.status(200).json({
				guildId: guildId,
				isBotPresent: false
			});
		}

	} catch (error) {
		console.error('Error checking bot presence in guild:', error);
		
		if (error.code === 50001) {
			return res.status(200).json({
				guildId: guildId,
				isBotPresent: false,
				reason: 'Bot does not have access to this guild'
			});
		} else if (error.code === 10004) {
			return res.status(200).json({
				guildId: guildId,
				isBotPresent: false,
				reason: 'Guild not found'
			});
		}
		
		// For other errors, return false but log the error
		res.status(200).json({
			guildId: guildId,
			isBotPresent: false,
			reason: 'Unknown error occurred'
		});
	}
});

app.get('/guild/:guildId/voice-channels', async (req, res) => {
	// Check for authorization header
	if (!req.headers["x-dmbot-header"]) {
		return res.status(403).send("Unauthorized");
	}

	const { guildId } = req.params;

	try {
		// Get the guild
		const guild = await client.guilds.fetch(guildId);
		
		if (!guild) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		// Fetch all channels and filter for voice channels
		const channels = await guild.channels.fetch();
		const voiceChannels = channels.filter(channel => 
			channel.type === ChannelType.GuildVoice || // Voice channel
			channel.type === ChannelType.GuildStageVoice   // Stage channel (also voice-based)
		);

		// Format the response
		const channelData = voiceChannels.map(channel => ({
			id: channel.id,
			name: channel.name,
			type: channel.type === ChannelType.GuildVoice ? 'voice' : 'stage',
			position: channel.position,
			parentId: channel.parentId,
			userLimit: channel.userLimit,
			bitrate: channel.bitrate
		}));

		res.status(200).json({
			guildId: guild.id,
			guildName: guild.name,
			voiceChannels: channelData
		});

	} catch (error) {
		console.error('Error fetching voice channels:', error);
		
		if (error.code === 50001) {
			return res.status(403).json({ error: 'Bot does not have access to this guild' });
		} else if (error.code === 10004) {
			return res.status(404).json({ error: 'Guild not found' });
		}
		
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.listen(process.env.PORT || 3000);