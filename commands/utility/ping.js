const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Xem trạng thái kết nối của bot !"),

  async execute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply(` Trạng thái của BOT ${ping}ms `);
  },
};
