const {
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const commands = [

  new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Mengatur channel announcement")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("Channel announcement")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("settime")
    .setDescription("Mengatur interval announcement")
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("Interval dalam menit")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("setmemberrole")
    .setDescription("Mengatur role yang di-mention")
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Role MEMBER AKSARA")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("setbanner")
    .setDescription("Mengatur banner announcement")
    .addStringOption(option =>
      option
        .setName("url")
        .setDescription("URL gambar banner")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("setstaff")
    .setDescription("Mengatur role staff ticket")
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Role staff")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("setticketcategory")
    .setDescription("Mengatur category ticket")
    .addChannelOption(option =>
      option
        .setName("category")
        .setDescription("Category ticket")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("startannouncement")
    .setDescription("Mengaktifkan announcement otomatis")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("stopannouncement")
    .setDescription("Mematikan announcement otomatis")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Mengirim announcement sekarang")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Membuat panel ticket")

].map(command => command.toJSON());

const rest = new REST({ version: "10" })
  .setToken(process.env.TOKEN);

(async () => {

  try {

    console.log("🔄 Mendaftarkan slash commands...");

    await rest.put(
      Routes.applicationCommands(
        process.env.CLIENT_ID
      ),
      {
        body: commands
      }
    );

    console.log(
      "✅ Semua slash command berhasil didaftarkan!"
    );

  } catch (error) {

    console.error(error);

  }

})();
