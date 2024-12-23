const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmoney")
    .setDescription("Cài đặt số tiền cho người dùng.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Người dùng để cài đặt số tiền")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Số tiền để cài đặt")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Kiểm tra quyền
    if (interaction.user.username !== "trum.mafia") {
      return interaction.reply(`**Bạn không có quyền thực hiện lệnh này.**`);
    }

    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (amount < 0) {
      return interaction.reply("**Số tiền phải là một số dương.**");
    }

    const filePath = path.join(
      __dirname,
      "../../data/user/",
      `${user.username}.json`
    );

    if (!fs.existsSync(filePath)) {
      return interaction.reply("**Người dùng chưa đăng ký tài khoản.**");
    }

    const userData = JSON.parse(fs.readFileSync(filePath));
    userData.Sodu = amount;

    fs.writeFile(filePath, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error("Error updating user data:", err);
        return interaction.reply("Đã xảy ra lỗi khi cập nhật số tiền.");
      }

      interaction.reply(
        `**Người dùng ${user.username} đã được đặt số dư thành ${amount}.**`
      );
    });
  },
};
