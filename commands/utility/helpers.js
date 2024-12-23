const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Hiển thị tất cả lệnh của bot!"),

  async execute(interaction) {
    const { commands } = interaction.client;
    const commandList = commands
      .map(
        (command) => `**/${command.data.name}**: ${command.data.description}`
      )
      .join("\n");

    if (commandList.length === 0) {
      return await interaction.reply("Hiện tại không có lệnh nào!");
    }

    await interaction.reply(
      `Dưới đây là tất cả các lệnh của bot:\n${commandList}`
    );
  },
};
