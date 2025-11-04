'use strict';
require('dotenv').config()
// Require the necessary discord.js classes
const { Client, Events, Collection, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, StreamType, demuxProbe, generateDependencyReport } = require('@discordjs/voice');
//require navigation
const fs = require('node:fs');
const path = require('node:path');
//express
const express = require('express');
const app = express();

// Middleware to handle raw binary data for audio streams
app.use('/guild/*/channel/*/audio-stream', express.raw({ type: 'audio/pcm', limit: '50mb' }));

//new client instance
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates
	] 
});

// Store audio players for each guild/channel combination
const activeAudioPlayers = new Map();
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	
	// Check voice dependencies
	try {
		const report = generateDependencyReport();
		console.log('Voice dependency report:', report);
	} catch (error) {
		console.warn('Voice dependency check failed:', error.message);
	}
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

app.post('/guild/:guildId/join-voice-channel/:channelId', async (req, res) => {
	// Check for authorization header
	if (!req.headers["x-dmbot-header"]) {
		return res.status(403).send("Unauthorized");
	}

	const { guildId, channelId } = req.params;

	try {
		// Get the guild
		const guild = await client.guilds.fetch(guildId);
		
		if (!guild) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		// Get the voice channel
		const channel = await guild.channels.fetch(channelId);
		
		if (!channel) {
			return res.status(404).json({ error: 'Channel not found' });
		}

		if (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice) {
			return res.status(400).json({ error: 'Channel is not a voice channel' });
		}

		// Check if bot already has a connection in this guild
		const existingConnection = getVoiceConnection(guildId);
		if (existingConnection) {
			existingConnection.destroy();
		}

		// Join the voice channel
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: guild.id,
			adapterCreator: guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		});

		// Create audio player for this guild/channel combination
		const playerKey = `${guildId}:${channelId}`;
		const player = createAudioPlayer();
		activeAudioPlayers.set(playerKey, player);
		
		// Subscribe the connection to the audio player
		connection.subscribe(player);

		// Add error handling for voice connection
		connection.on('error', (error) => {
			console.error('Voice connection error:', error);
		});
		
		connection.on(VoiceConnectionStatus.Disconnected, () => {
			console.log('Voice connection disconnected, attempting to reconnect...');
		});

		// Wait for the connection to be ready
		await new Promise((resolve, reject) => {
			connection.on(VoiceConnectionStatus.Ready, () => {
				console.log('Voice connection ready');
				resolve();
			});
			connection.on(VoiceConnectionStatus.Disconnected, () => reject(new Error('Failed to connect')));
			connection.on(VoiceConnectionStatus.Destroyed, () => reject(new Error('Connection destroyed')));
			
			// Timeout after 15 seconds (increased from 10)
			setTimeout(() => reject(new Error('Connection timeout')), 15000);
		});

		res.status(200).json({
			success: true,
			guildId: guild.id,
			guildName: guild.name,
			channelId: channel.id,
			channelName: channel.name,
			message: 'Successfully joined voice channel'
		});

	} catch (error) {
		console.error('Error joining voice channel:', error);
		
		if (error.code === 50001) {
			return res.status(403).json({ error: 'Bot does not have access to this guild' });
		} else if (error.code === 10004) {
			return res.status(404).json({ error: 'Guild not found' });
		} else if (error.code === 50013) {
			return res.status(403).json({ error: 'Bot does not have permission to join this voice channel' });
		}
		
		res.status(500).json({ error: 'Failed to join voice channel', details: error.message });
	}
});

app.get('/guild/:guildId/voice-connection-status', async (req, res) => {
	// Check for authorization header
    console.log(`Received request for voice connection status in guild ${req.params.guildId}`);
	if (!req.headers["x-dmbot-header"]) {
		return res.status(403).send("Unauthorized");
	}

	const { guildId } = req.params;

	try {
		// Get the guild
		const guild = await client.guilds.fetch(guildId);
		console.log(`Fetched guild ${guildId}: ${guild ? guild.name : 'not found'}`);
		if (!guild) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		// Check for voice connection
		const connection = getVoiceConnection(guildId);
		
		if (connection) {
			// Get the channel the bot is connected to
			const botMember = guild.members.me;
			const voiceChannel = botMember?.voice?.channel;
			
			res.status(200).json({
				guildId: guild.id,
				guildName: guild.name,
				isInVoiceChannel: true,
				connectionStatus: connection.state.status,
				channelId: voiceChannel?.id || null,
				channelName: voiceChannel?.name || null,
				channelType: voiceChannel?.type === ChannelType.GuildVoice ? 'voice' : 'stage'
			});
		} else {
			res.status(200).json({
				guildId: guild.id,
				guildName: guild.name,
				isInVoiceChannel: false,
				connectionStatus: 'disconnected',
				channelId: null,
				channelName: null
			});
		}

	} catch (error) {
		console.error('Error checking voice connection status:', error);
		
		if (error.code === 50001) {
			return res.status(403).json({ error: 'Bot does not have access to this guild' });
		} else if (error.code === 10004) {
			return res.status(404).json({ error: 'Guild not found' });
		}
		
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/guild/:guildId/leave-voice-channel', async (req, res) => {
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

		// Check for voice connection
		const connection = getVoiceConnection(guildId);
		
		if (!connection) {
			return res.status(400).json({ error: 'Bot is not in a voice channel in this guild' });
		}

		// Get current channel info before leaving
		const botMember = guild.members.me;
		const voiceChannel = botMember?.voice?.channel;
		const channelInfo = {
			channelId: voiceChannel?.id || null,
			channelName: voiceChannel?.name || null
		};

		// Clean up audio players for this guild
		const playersToRemove = [];
		for (const [key, player] of activeAudioPlayers.entries()) {
			if (key.startsWith(`${guildId}:`)) {
				player.stop();
				playersToRemove.push(key);
			}
		}
		playersToRemove.forEach(key => activeAudioPlayers.delete(key));

		// Disconnect from voice channel
		connection.destroy();

		res.status(200).json({
			success: true,
			guildId: guild.id,
			guildName: guild.name,
			leftChannel: channelInfo,
			message: 'Successfully left voice channel'
		});

	} catch (error) {
		console.error('Error leaving voice channel:', error);
		
		if (error.code === 50001) {
			return res.status(403).json({ error: 'Bot does not have access to this guild' });
		} else if (error.code === 10004) {
			return res.status(404).json({ error: 'Guild not found' });
		}
		
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/guild/:guildId/channel/:channelId/audio-stream', async (req, res) => {
	// Endpoint to stream raw PCM audio data to a Discord voice channel
	// Expected headers:
	// - Content-Type: audio/pcm
	// - Audio-Sample-Rate: sample rate in Hz (e.g., 44100)
	// - Audio-Channels: number of channels (1 for mono, 2 for stereo)
	// - Audio-Bit-Depth: bit depth (e.g., 16)
	// - x-dmbot-header: authorization token
	
	console.log(`Received audio stream request for guild ${req.params.guildId}, channel ${req.params.channelId}`);
	
	// Check for authorization header
	if (!req.headers["x-dmbot-header"]) {
		return res.status(403).send("Unauthorized");
	}

	const { guildId, channelId } = req.params;

	try {
		// Get the guild for validation and logging
		const guild = await client.guilds.fetch(guildId);
		if (!guild) {
			return res.status(404).json({ error: 'Guild not found' });
		}

		// Get the target voice channel
		const channel = await guild.channels.fetch(channelId);
		if (!channel) {
			return res.status(404).json({ error: 'Channel not found' });
		}

		if (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice) {
			return res.status(400).json({ error: 'Channel is not a voice channel' });
		}

		// Check if bot is in a voice channel in this guild
		const connection = getVoiceConnection(guildId);
		if (!connection) {
			return res.status(400).json({ 
				error: 'Bot is not in a voice channel in this guild',
				suggestion: 'Use the join-voice-channel endpoint first',
				recommendedEndpoint: `/guild/${guildId}/join-voice-channel/${channelId}`
			});
		}

		// Check if bot is in the correct channel
		const botMember = guild.members.me;
		const botCurrentChannel = botMember?.voice?.channel;
		
		if (!botCurrentChannel || botCurrentChannel.id !== channelId) {
			return res.status(400).json({ 
				error: 'Bot is not in the specified voice channel',
				botCurrentChannel: botCurrentChannel?.name || 'None',
				requestedChannel: channel.name,
				suggestion: `Bot is currently in "${botCurrentChannel?.name || 'no channel'}". Join the correct channel first.`
			});
		}

		// Check if we have audio data
		if (!req.body || req.body.length === 0) {
			return res.status(400).json({ error: 'No audio data received' });
		}

		// Validate PCM audio headers
		const sampleRate = req.headers['audio-sample-rate'];
		const channels = req.headers['audio-channels'];
		const bitDepth = req.headers['audio-bit-depth'];
		
		if (!sampleRate || !channels || !bitDepth) {
			return res.status(400).json({ 
				error: 'Missing required PCM audio headers',
				required: ['Audio-Sample-Rate', 'Audio-Channels', 'Audio-Bit-Depth'],
				received: {
					sampleRate: sampleRate || 'missing',
					channels: channels || 'missing',
					bitDepth: bitDepth || 'missing'
				}
			});
		}

		// Validate audio parameters
		const sampleRateNum = parseInt(sampleRate);
		const channelsNum = parseInt(channels);
		const bitDepthNum = parseInt(bitDepth);

		if (isNaN(sampleRateNum) || isNaN(channelsNum) || isNaN(bitDepthNum)) {
			return res.status(400).json({ 
				error: 'Invalid audio parameters - must be numeric',
				sampleRate: sampleRateNum || 'invalid',
				channels: channelsNum || 'invalid',
				bitDepth: bitDepthNum || 'invalid'
			});
		}

		// Get or create audio player for this guild/channel combination
		const playerKey = `${guildId}:${channelId}`;
		let player = activeAudioPlayers.get(playerKey);
		
		if (!player) {
			// Create new player if one doesn't exist
			player = createAudioPlayer();
			activeAudioPlayers.set(playerKey, player);
			connection.subscribe(player);
		}

		console.log(`Received PCM audio stream for guild ${guild.name} (${guildId}), channel ${channel.name} (${channelId})`);
		console.log(`Audio format: ${sampleRateNum}Hz, ${channelsNum} channel(s), ${bitDepthNum}-bit, size: ${req.body.length} bytes`);

		// Create a Readable stream from the PCM buffer
		const { Readable } = require('stream');
		const audioStream = new Readable({
			read() {}
		});
		
		// Push the PCM audio data to the stream
		audioStream.push(req.body);
		audioStream.push(null); // Signal end of stream

		// Create audio resource from the PCM stream
		// For PCM data, we specify it as raw PCM input
		const resource = createAudioResource(audioStream, {
			inputType: StreamType.Raw,
			inlineVolume: true,
			// Additional metadata for PCM processing
			metadata: {
				sampleRate: sampleRateNum,
				channels: channelsNum,
				bitDepth: bitDepthNum
			}
		});

		// Set volume (optional, can be adjusted)
		if (resource.volume) {
			resource.volume.setVolume(1); // 100% volume
		}

		// Play the audio
		player.play(resource);

		res.status(200).json({
			success: true,
			guildId: guild.id,
			guildName: guild.name,
			channelId: channel.id,
			channelName: channel.name,
			message: 'PCM audio stream received and playing',
			audioFormat: {
				sampleRate: sampleRateNum,
				channels: channelsNum,
				bitDepth: bitDepthNum,
				format: 'PCM'
			},
			audioSize: req.body.length,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Error processing audio stream:', error);
		
		if (error.code === 50001) {
			return res.status(403).json({ error: 'Bot does not have access to this guild' });
		} else if (error.code === 10004) {
			return res.status(404).json({ error: 'Guild not found' });
		}
		
		res.status(500).json({ error: 'Failed to process audio stream', details: error.message });
	}
});

app.listen(process.env.PORT || 3000);