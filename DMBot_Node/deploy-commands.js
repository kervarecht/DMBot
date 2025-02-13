const { REST, Routes } = require('discord.js');
require('dotenv').config()
const fs = require('node:fs');

let token, guildId, clientId

if (process.env.PRODUCTION == 1) {
	token = process.env.BOT_TOKEN;
	clientId = process.env.APP_ID;
}
else {
	token = process.env.TEST_BOT_TOKEN;
	guildId = process.env.DEV_SERVER_ID;
	clientId = process.env.TEST_APP_ID;
}


const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
const deploy = (async () => {
	if (process.env.PRODUCTION == 1) {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: commands },
			);
			if (data) {
				console.log(`Successfully reloaded ${data.length} application (/) commands.`);
				process.exit();
			}
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
	}
	else {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			// The put method is used to fully refresh all commands in the guild with the current set
			const data = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			);
			if (data) {
				console.log(`Successfully reloaded ${data.length} application (/) commands.`);
				process.exit();
            }

			
		} catch (error) {
			// And of course, make sure you catch and log any errors!
			console.error(error);
		}
    }
		
})();