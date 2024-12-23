const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Đăng ký tài khoản mới"),

  async execute(interaction) {
    const username = interaction.user.username;
    const userId = interaction.user.id;
    const filePath = path.join(
      __dirname,
      "../../data/user/",
      `${username}.json`
    );
    if (fs.existsSync(filePath)) {
      return interaction.reply("**Bạn đã đăng ký tài khoản rồi. !!**");
    }
    const userData = {
      id: userId,
      username: username,
      Sodu: 100000,
      Win: 0,
      Lose: 0,
      ThoiGian: new Date(),
    };
    fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return interaction.reply("Đã xảy ra lỗi khi đăng ký tài khoản.");
      }
      interaction.reply(
        `**Tài khoản với tên "${username}" đã được đăng ký thành công!, /thongtin để xem thông tin của bạn\n- +50,000đ vào tài khoản**`
      );
    });
  },
};
