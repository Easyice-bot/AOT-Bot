const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');

const config = require('./config.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  new SlashCommandBuilder()
    .setName('description')
    .setDescription('Choisis ta famille, ton prestige et ton build pour obtenir tes rôles !'),
  new SlashCommandBuilder()
    .setName('descriptionv2')
    .setDescription('(✨ Panel embed) Choisis ta famille, ton prestige et ton build !'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(config.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), { body: commands });
  } catch (error) {
    console.error(error);
  }
})();

const userSelections = new Map();

async function assignRoles(interaction, sel) {
  const member = interaction.member;
  const guild = interaction.guild;

  await guild.roles.fetch();

  const errors = [];

  const allRoleNames = [
    ...config.FAMILLES.map(f => f.value),
    ...config.PRESTIGES.map(p => p.value),
    ...config.BUILDS.map(b => b.value),
  ];

  for (const roleName of allRoleNames) {
    const existingRole = guild.roles.cache.find(r => r.name === roleName);
    if (existingRole && member.roles.cache.has(existingRole.id)) {
      try { await member.roles.remove(existingRole); } catch { }
    }
  }

  for (const roleName of [sel.famille, sel.prestige, sel.build]) {
    const role = guild.roles.cache.find(r => r.name === roleName);
    if (role) {
      try {
        await member.roles.add(role);
      } catch {
        errors.push(`❌ Impossible d'ajouter **${roleName}** (permissions insuffisantes)`);
      }
    } else {
      errors.push(`⚠️ Rôle **${roleName}** introuvable sur le serveur`);
    }
  }

  return errors;
}

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {

  if (interaction.isChatInputCommand() && interaction.commandName === 'description') {
    userSelections.set(interaction.user.id, { famille: null, prestige: null, build: null });

    const familleMenu = new StringSelectMenuBuilder()
      .setCustomId('sel_famille')
      .setPlaceholder('⚔️ Choisis ta Famille')
      .addOptions(config.FAMILLES.map(f =>
        new StringSelectMenuOptionBuilder().setLabel(f.label).setValue(f.value)
      ));

    await interaction.reply({
      content: '## 📜 Configuration de ton profil AOT\nSélectionne ta **Famille** ci-dessous :',
      components: [new ActionRowBuilder().addComponents(familleMenu)],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'sel_famille') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.famille = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const prestigeMenu = new StringSelectMenuBuilder()
      .setCustomId('sel_prestige')
      .setPlaceholder('🏅 Choisis ton Prestige')
      .addOptions(config.PRESTIGES.map(p =>
        new StringSelectMenuOptionBuilder().setLabel(p.label).setValue(p.value)
      ));

    await interaction.update({
      content: `✅ Famille **${sel.famille}** sélectionnée !\n\nMaintenant choisis ton **Prestige** :`,
      components: [new ActionRowBuilder().addComponents(prestigeMenu)],
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'sel_prestige') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.prestige = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const buildMenu = new StringSelectMenuBuilder()
      .setCustomId('sel_build')
      .setPlaceholder('🔧 Choisis ton Build')
      .addOptions(config.BUILDS.map(b =>
        new StringSelectMenuOptionBuilder().setLabel(b.label).setValue(b.value)
      ));

    await interaction.update({
      content: `✅ Prestige **${sel.prestige}** sélectionné !\n\nDernière étape — choisis ton **Build** :`,
      components: [new ActionRowBuilder().addComponents(buildMenu)],
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'sel_build') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.build = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const errors = await assignRoles(interaction, sel);
    userSelections.delete(interaction.user.id);

    const successMsg = errors.length === 0
      ? `✅ **Profil configuré avec succès !**\n\n🏰 Famille : **${sel.famille}**\n🏅 Prestige : **${sel.prestige}**\n⚔️ Build : **${sel.build}**\n\nBienvenue sur le serveur, soldat !`
      : `⚠️ Profil partiellement configuré.\n\n${errors.join('\n')}\n\nContacte un admin si le problème persiste.`;

    await interaction.update({ content: successMsg, components: [] });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === 'descriptionv2') {
    userSelections.set(interaction.user.id, { famille: null, prestige: null, build: null });

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Configuration du Profil AOT')
      .setDescription(
        '> Bienvenue, soldat.\n> Choisis ta **Famille**, ton **Prestige** et ton **Build** pour recevoir tes rôles.\n\n' +
        '**Étape 1/3 — Famille**'
      )
      .addFields(
        { name: '🏰 Famille',  value: '*En attente...*', inline: true },
        { name: '🏅 Prestige', value: '*En attente...*', inline: true },
        { name: '⚔️ Build',   value: '*En attente...*', inline: true },
      )
      .setColor(0x2B2D31)
      .setThumbnail('https://i.imgur.com/kJbHX2v.png')
      .setFooter({ text: 'Serveur AOT • Sélectionne ta Famille ci-dessous' })
      .setTimestamp();

    const familleMenu = new StringSelectMenuBuilder()
      .setCustomId('v2_famille')
      .setPlaceholder('👑 Choisis ta Famille')
      .addOptions(config.FAMILLES.map(f =>
        new StringSelectMenuOptionBuilder().setLabel(f.label).setValue(f.value)
      ));

    await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(familleMenu)],
      flags: MessageFlags.Ephemeral,
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'v2_famille') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.famille = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Configuration du Profil AOT')
      .setDescription(
        '> **Étape 2/3 — Prestige**\n\n' +
        '✅ Famille enregistrée ! Choisis maintenant ton **Prestige**.'
      )
      .addFields(
        { name: '🏰 Famille',  value: `**${sel.famille}** ✅`, inline: true },
        { name: '🏅 Prestige', value: '*En attente...*',        inline: true },
        { name: '⚔️ Build',   value: '*En attente...*',        inline: true },
      )
      .setColor(0x5865F2)
      .setThumbnail('https://i.imgur.com/kJbHX2v.png')
      .setFooter({ text: 'Serveur AOT • Étape 2/3' })
      .setTimestamp();

    const prestigeMenu = new StringSelectMenuBuilder()
      .setCustomId('v2_prestige')
      .setPlaceholder('🏅 Choisis ton Prestige')
      .addOptions(config.PRESTIGES.map(p =>
        new StringSelectMenuOptionBuilder().setLabel(p.label).setValue(p.value)
      ));

    await interaction.update({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(prestigeMenu)],
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'v2_prestige') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.prestige = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Configuration du Profil AOT')
      .setDescription(
        '> **Étape 3/3 — Build**\n\n' +
        '✅ Prestige enregistré ! Dernière étape : choisis ton **Build**.'
      )
      .addFields(
        { name: '🏰 Famille',  value: `**${sel.famille}** ✅`,  inline: true },
        { name: '🏅 Prestige', value: `**${sel.prestige}** ✅`, inline: true },
        { name: '⚔️ Build',   value: '*En attente...*',         inline: true },
      )
      .setColor(0xEB459E)
      .setThumbnail('https://i.imgur.com/kJbHX2v.png')
      .setFooter({ text: 'Serveur AOT • Dernière étape !' })
      .setTimestamp();

    const buildMenu = new StringSelectMenuBuilder()
      .setCustomId('v2_build')
      .setPlaceholder('🔧 Choisis ton Build')
      .addOptions(config.BUILDS.map(b =>
        new StringSelectMenuOptionBuilder().setLabel(b.label).setValue(b.value)
      ));

    await interaction.update({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(buildMenu)],
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'v2_build') {
    const sel = userSelections.get(interaction.user.id) || {};
    sel.build = interaction.values[0];
    userSelections.set(interaction.user.id, sel);

    const errors = await assignRoles(interaction, sel);
    userSelections.delete(interaction.user.id);

    let embed;

    if (errors.length === 0) {
      embed = new EmbedBuilder()
        .setTitle('✅ Profil configuré avec succès !')
        .setDescription(`> Bienvenue sur le serveur, **soldat** !\n> Tes rôles ont été assignés.\n\u200b`)
        .addFields(
          { name: '🏰 Famille',  value: `**${sel.famille}**`,  inline: true },
          { name: '🏅 Prestige', value: `**${sel.prestige}**`, inline: true },
          { name: '⚔️ Build',   value: `**${sel.build}**`,    inline: true },
        )
        .setColor(0x57F287)
        .setThumbnail('https://i.imgur.com/kJbHX2v.png')
        .setFooter({ text: 'Serveur AOT • Profil enregistré' })
        .setTimestamp();
    } else {
      embed = new EmbedBuilder()
        .setTitle('⚠️ Profil partiellement configuré')
        .setDescription(
          '> Certains rôles n\'ont pas pu être assignés.\n> Contacte un administrateur.\n\u200b\n' +
          errors.join('\n')
        )
        .addFields(
          { name: '🏰 Famille',  value: `**${sel.famille}**`,  inline: true },
          { name: '🏅 Prestige', value: `**${sel.prestige}**`, inline: true },
          { name: '⚔️ Build',   value: `**${sel.build}**`,    inline: true },
        )
        .setColor(0xFEE75C)
        .setFooter({ text: 'Serveur AOT • Erreur partielle' })
        .setTimestamp();
    }

    await interaction.update({ embeds: [embed], components: [] });
  }
});

client.login(config.TOKEN);
