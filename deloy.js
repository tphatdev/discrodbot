const { REST, Routes } = require("discord.js");
require("dotenv").config(); // Load environment variables
const fs = require("node:fs");
const path = require("node:path");

module.exports = async (client) => {
  const commands = [];
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }

  console.log("Commands to be registered:", commands); // Log commands for verification

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application [/] commands.`
    );

    const data = await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application [/] commands.`
    );
    return data;
  } catch (error) {
    console.error(error);
  }
};
