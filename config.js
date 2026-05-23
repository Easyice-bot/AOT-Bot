module.exports = {
  // ── À remplir avec tes infos Discord ───────────────────────────────────── 
TOKEN: 'process.env.TOKEN',
  CLIENT_ID: 'process.env.CLIENT_ID',  // ID de l'application du bot
  GUILD_ID: 'process.env.GUILD_ID',    // ID de ton serveur Discord

  // ── Familles ─────────────────────────────────────────────────────────────
  // ⚠️ Les "value" doivent correspondre EXACTEMENT aux noms des rôles sur Discord
  FAMILLES: [
    { label: '👑 Helos Mythique',      value: 'Helos Mythique' },
    { label: '⚡ Fritz Mythique',       value: 'Fritz Mythique' },
    { label: '🗡️ Ackerman Légendaire', value: 'Ackerman Légendaire' },
    { label: '🔥 Yeager Légendaire',   value: 'Yeager Légendaire' },
    { label: '👁️ Reis Légendaire',     value: 'Reis Légendaire' },
  ],

  // ── Prestiges ────────────────────────────────────────────────────────────
  PRESTIGES: [
    { label: '⭐ Prestige 1', value: 'Prestige 1' },
    { label: '⭐⭐ Prestige 2', value: 'Prestige 2' },
    { label: '⭐⭐⭐ Prestige 3', value: 'Prestige 3' },
    { label: '💫 Prestige 4', value: 'Prestige 4' },
    { label: '🌟 Prestige 5', value: 'Prestige 5' },
  ],

  // ── Builds ───────────────────────────────────────────────────────────────
  BUILDS: [
    { label: '⚡️ Titan',  value: 'titan' },
    { label: '🪂 ODM',    value: 'ODM' },
    { label: '🛡️ TS',    value: 'TS' },
  ],
};
