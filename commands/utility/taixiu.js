const { SlashCommandBuilder, EmbedBuilder, Colors } = require("discord.js");
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
    .setName("taixiu")
    .setDescription("Chơi tài xỉu!")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Số tiền đặt cược")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("luachon")
        .setDescription("Lựa chọn đặt cược [ Tài/Xỉu ]")
        .setRequired(true)
        .addChoices([
          { name: "Tài", value: "tai" },
          { name: "Xỉu", value: "xiu" },
        ])
    ),

  async execute(interaction) {
    const bet = interaction.options.getInteger("amount");
    const betType = interaction.options.getString("luachon");

    if (bet <= 0) {
      return interaction.reply("Số tiền đặt cược phải lớn hơn 0.");
    }

    const username = interaction.user.username;
    const userFilePath = path.join(
      __dirname,
      "../../data/user/",
      `${username}.json`
    );
    const phienFilePath = path.join(
      __dirname,
      "../../data/phien/",
      `${username}_phien.json`
    );

    if (!fs.existsSync(userFilePath)) {
      return interaction.reply(
        "Bạn chưa đăng ký tài khoản. Hãy sử dụng lệnh `/register` để đăng ký."
      );
    }

    const userData = JSON.parse(fs.readFileSync(userFilePath));
    if (userData.Sodu < bet) {
      return interaction.reply("Bạn không đủ số dư để đặt cược.");
    }

    // Tăng số phiên lên 1
    userData.phien = (userData.phien || 0) + 1;

    const diceRolls = [
      Math.floor(Math.random() * 4) + 3,
      Math.floor(Math.random() * 4) + 3,
      Math.floor(Math.random() * 4) + 3,
    ];

    const diceTotal = diceRolls.reduce((a, b) => a + b, 0);
    const isTai = diceTotal >= 11 && diceTotal <= 18;
    const isXiu = diceTotal >= 3 && diceTotal <= 10;

    let resultMessage = "";
    let winAmount = 0;

    if (betType === "tai") {
      const luachon = "Tài";
      if (isTai) {
        winAmount = bet * 1.9;
        userData.Win += 1;
        resultMessage = `**- Bạn đã chiến thắng trong phiên #${
          userData.phien
        }\n- Cược:${luachon}\n- Kết quả: ${diceTotal} - Tài\n- Số tiền đặt cược: ${numberFormat(
          bet
        )}đ\n- +${numberFormat(winAmount)}đ**`;
      } else {
        resultMessage = `**- Bạn đã thua trong phiên #${
          userData.phien
        } :(( \n- Cược:${luachon}\n- Kết quả: ${diceTotal} - Xỉu\n- Số tiền đặt cược: ${numberFormat(
          bet
        )}đ\n- -${numberFormat(bet)}đ.**`;
        winAmount = -bet;
        userData.Lose += 1;
      }
    } else if (betType === "xiu") {
      const luachon = "Xỉu";
      if (isXiu) {
        winAmount = bet * 1.9;
        userData.Win += 1;
        resultMessage = `**- Bạn đã chiến thắng trong phiên #${
          userData.phien
        }\n- Cược:${luachon}\n- Kết quả: ${diceTotal} - Xỉu\n- Số tiền đặt cược: ${numberFormat(
          bet
        )}đ\n- +${numberFormat(winAmount)}đ**`;
      } else {
        resultMessage = `**- Bạn đã thua trong phiên #${
          userData.phien
        } :(( \n- Cược:${luachon}\n- Kết quả: ${diceTotal} - Tài\n- Số tiền đặt cược: ${numberFormat(
          bet
        )}đ\n- -${numberFormat(bet)}đ.**`;
        winAmount = -bet;
        userData.Lose += 1;
      }
    }

    userData.Sodu += winAmount;

    // Cập nhật file user
    fs.writeFile(userFilePath, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error("Error updating user data:", err);
      }
    });

    const phienData = {
      phien: userData.phien,
      diceRolls: diceRolls,
      diceTotal: diceTotal,
    };

    fs.appendFile(phienFilePath, JSON.stringify(phienData) + "\n", (err) => {
      if (err) {
        console.error("Error logging phien data:", err);
      }
    });

    // Create an embed message
    const embed = new EmbedBuilder()
      .setColor(winAmount >= 0 ? Colors.Green : Colors.Red)
      .setTitle("Kết quả tài xỉu")
      .setDescription(resultMessage)
      .addFields([
        {
          name: "**Xúc xắc**",
          value: `${diceRolls[0]} - ${diceRolls[1]} - ${diceRolls[2]}`,
          inline: true,
        },
        {
          name: "**Số dư**",
          value: `${numberFormat(userData.Sodu)}đ`,
          inline: true,
        },
      ]);

    await interaction.reply({ embeds: [embed] });
  },
};
