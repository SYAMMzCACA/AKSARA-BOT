const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionFlagsBits
} = require("discord.js");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const settings = new Map();
const timers = new Map();

function getSettings(guildId) {
if (!settings.has(guildId)) {
settings.set(guildId, {
channelId: null,
roleId: null,
interval: 10,
enabled: true,
banner: null,
staffRoleId: null,
ticketCategoryId: null
});
}

return settings.get(guildId);
}

function createAnnouncement(guild) {
const data = getSettings(guild.id);

const embed = new EmbedBuilder()
.setColor("#8B0000")
.setTitle("🪃 AKSARA COMMUNITY")
.setDescription(
`╭━━━━━━━━━━━━━━━━━━━━╮
AKSARA SERVICES
╰━━━━━━━━━━━━━━━━━━━━╯

🛒 Summit Kit & Club Kit
🔧 Install & Setup System
💰 Jual / Top Up Robux
🗺️ Pembuatan Map Roblox
🛠️ Fix Bug & Error Map
🤝 Rekber Transaksi Aman
🔓 Jasa Deobfuscation
🔑 Bantuan Pembukaan Lisensi
🤖 Pembuatan Bot Discord

━━━━━━━━━━━━━━━━━━━━

🎟️ BUTUH JASA?

Klik tombol Buka Ticket di bawah
untuk konsultasi dengan team
AKSARA COMMUNITY.

⚡ BUILD • FIX • DEVELOP • SUPPORT`
)
.setFooter({
text: "🔥 Gasken Ketua! • AKSARA COMMUNITY"
})
.setTimestamp();

if (data.banner) {
embed.setImage(data.banner);
}

return embed;
}

async function sendAnnouncement(guild) {
const data = getSettings(guild.id);

if (!data.enabled || !data.channelId) return;

const channel = await guild.channels
.fetch(data.channelId)
.catch(() => null);

if (!channel || !channel.isTextBased()) return;

const row = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("open_ticket")
.setLabel("Buka Ticket")
.setEmoji("🎟️")
.setStyle(ButtonStyle.Danger)
);

await channel.send({
content: data.roleId ? "<@&${data.roleId}>" : "",
embeds: [createAnnouncement(guild)],
components: [row],
allowedMentions: data.roleId
? { roles: [data.roleId] }
: { parse: [] }
});
}

function startTimer(guild) {
if (timers.has(guild.id)) {
clearInterval(timers.get(guild.id));
timers.delete(guild.id);
}

const data = getSettings(guild.id);

if (!data.enabled || !data.channelId) return;

const timer = setInterval(
() => sendAnnouncement(guild).catch(console.error),
data.interval * 60 * 1000
);

timers.set(guild.id, timer);
}

client.once("ready", () => {
console.log("🤖 ${client.user.tag} ONLINE");
console.log("🏠 Server: ${client.guilds.cache.size}");

for (const guild of client.guilds.cache.values()) {
startTimer(guild);
}
});

client.on("interactionCreate", async interaction => {
if (interaction.isButton()) {
if (interaction.customId === "open_ticket") {
const guild = interaction.guild;
const data = getSettings(guild.id);

  const existing = guild.channels.cache.find(
    c => c.name === `ticket-${interaction.user.id}`
  );

  if (existing) {
    return interaction.reply({
      content: `🎟️ Kamu sudah memiliki ticket: ${existing}`,
      ephemeral: true
    });
  }

  const permissions = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: interaction.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    }
  ];

  if (data.staffRoleId) {
    permissions.push({
      id: data.staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory
      ]
    });
  }

  const ticket = await guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    parent: data.ticketCategoryId || undefined,
    permissionOverwrites: permissions
  });

  const embed = new EmbedBuilder()
    .setColor("#8B0000")
    .setTitle("🎟️ AKSARA TICKET")
    .setDescription(

`Halo ${interaction.user} 👋

Silakan jelaskan kebutuhan kamu
secara lengkap di sini.

Team AKSARA COMMUNITY akan
membantu kamu.

🔒 Setelah selesai, tekan tombol
Tutup Ticket.`
);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Tutup Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );

  await ticket.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [row]
  });

  return interaction.reply({
    content: `✅ Ticket dibuat: ${ticket}`,
    ephemeral: true
  });
}

if (interaction.customId === "close_ticket") {
  await interaction.reply(
    "🔒 Ticket akan ditutup dalam 5 detik..."
  );

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000);

  return;
}

}

if (!interaction.isChatInputCommand()) return;

const guild = interaction.guild;
if (!guild) return;

const data = getSettings(guild.id);

if (
!interaction.member.permissions.has(
PermissionFlagsBits.ManageGuild
)
) {
return interaction.reply({
content: "❌ Kamu membutuhkan permission Manage Server.",
ephemeral: true
});
}

if (interaction.commandName === "setchannel") {
const channel = interaction.options.getChannel("channel");

data.channelId = channel.id;
startTimer(guild);

return interaction.reply({
  content: `✅ Announcement channel: ${channel}`,
  ephemeral: true
});

}

if (interaction.commandName === "settime") {
const minutes =
interaction.options.getInteger("minutes");

data.interval = minutes;
startTimer(guild);

return interaction.reply({
  content:
    `⏱️ Announcement akan dikirim setiap ${minutes} menit.`,
  ephemeral: true
});

}

if (interaction.commandName === "setmemberrole") {
const role = interaction.options.getRole("role");

data.roleId = role.id;

return interaction.reply({
  content: `✅ Role announcement: ${role}`,
  ephemeral: true
});

}

if (interaction.commandName === "setbanner") {
const url = interaction.options.getString("url");

data.banner = url;

return interaction.reply({
  content: "🖼️ Banner berhasil diatur.",
  ephemeral: true
});

}

if (interaction.commandName === "setstaff") {
const role = interaction.options.getRole("role");

data.staffRoleId = role.id;

return interaction.reply({
  content: `👮 Staff ticket: ${role}`,
  ephemeral: true
});

}

if (interaction.commandName === "setticketcategory") {
const category =
interaction.options.getChannel("category");

if (category.type !== ChannelType.GuildCategory) {
  return interaction.reply({
    content: "❌ Pilih Category, bukan channel biasa.",
    ephemeral: true
  });
}

data.ticketCategoryId = category.id;

return interaction.reply({
  content: `📁 Ticket category: ${category}`,
  ephemeral: true
});

}

if (interaction.commandName === "startannouncement") {
data.enabled = true;
startTimer(guild);

return interaction.reply({
  content: "▶️ Announcement otomatis AKTIF.",
  ephemeral: true
});

}

if (interaction.commandName === "stopannouncement") {
data.enabled = false;

if (timers.has(guild.id)) {
  clearInterval(timers.get(guild.id));
  timers.delete(guild.id);
}

return interaction.reply({
  content: "⏹️ Announcement otomatis DIMATIKAN.",
  ephemeral: true
});

}

if (interaction.commandName === "announcement") {
await sendAnnouncement(guild);

return interaction.reply({
  content: "📢 Announcement berhasil dikirim.",
  ephemeral: true
});

}

if (interaction.commandName === "ticket") {
const embed = new EmbedBuilder()
.setColor("#8B0000")
.setTitle("🎟️ AKSARA COMMUNITY")
.setDescription(
`Butuh bantuan atau ingin menggunakan
jasa AKSARA COMMUNITY?

Klik tombol Buka Ticket.

🛒 Summit Kit / Club Kit
🗺️ Pembuatan Map
🛠️ Fix Bug
🤖 Bot Discord
🤝 Rekber
🔓 Deobfuscation
🔑 Lisensi`
);

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("open_ticket")
    .setLabel("Buka Ticket")
    .setEmoji("🎟️")
    .setStyle(ButtonStyle.Danger)
);

await interaction.channel.send({
  embeds: [embed],
  components: [row]
});

return interaction.reply({
  content: "✅ Panel ticket dibuat.",
  ephemeral: true
});

}
});

client.login(process.env.TOKEN);
