const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
function numberFormat(number) {
  const [integerPart, decimalPart] = number.toString().split(".");
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
  return decimalPart !== undefined
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart;
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Xem thông tin người dùng")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Người dùng bạn muốn xem thông tin")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("target") || interaction.user; // Lấy người dùng được chỉ định hoặc người dùng gửi lệnh
    const member = interaction.guild.members.cache.get(user.id);

    const filePath = path.join(
      __dirname,
      "../../data/user/",
      `${user.username}.json`
    );

    let userData;
    if (fs.existsSync(filePath)) {
      userData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
      userData = {
        Sodu: 0,
        Win: 0,
        Lose: 0,
        ThoiGian: "Chưa xác định",
      };
    }

    const embed = {
      color: 0x0099ff,
      title: `${user.username}'s Information`,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true }),
      },
      fields: [
        { name: "User Tag", value: user.tag, inline: true },
        { name: "User ID", value: user.id, inline: true },
        {
          name: "Số dư",
          value: `${numberFormat(userData.Sodu)} đ`,
          inline: true,
        },
        { name: "Số lần thắng", value: `${userData.Win}`, inline: true },
        { name: "Số lần thua", value: `${userData.Lose}`, inline: true },
        {
          name: "Thời gian cập nhật",
          value: userData.ThoiGian
            ? new Date(userData.ThoiGian).toLocaleString()
            : "Chưa xác định",
          inline: true,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: "Thông tin người dùng",
      },
    };

    await interaction.reply({ embeds: [embed] });
  },
};
