const os = require('os');
const axios = require('axios');
const fs = require('fs-extra');
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up", "runtime"],
    version: "1.5", 
    author: "NeoKEX",
    editor: "Camille 2.0 🍎",
    countDown: 5,
    role: 0,
    category: "system",
    guide: { en: "{pn}" }
  },

  onStart: async function({ api, event, message }) {
    const { threadID, messageID } = event;
    
    // URL de ton image Ayanokōji
    const imgUrl = "https://i.ibb.co/8LBPg4YX/682737295-994456263277856-2980690542480371984-n-jpg-nc-cat-111-ccb-1-7-nc-sid-9f807c-nc-eui2-Ae-F.jpg";
    const cachePath = path.join(__dirname, "cache", `uptime_${Date.now()}.jpg`);

    // --- Fonctions de conversion ---
    const bytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);
    const formatDuration = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const time = [h, m, s].map(t => t.toString().padStart(2, '0')).join(':');
        return d > 0 ? `${d} jour${d > 1 ? 's' : ''}, ${time}` : time;
    };

    // --- Collecte des données ---
    const uptime = formatDuration(process.uptime());
    const usedRAM = bytesToGB(os.totalmem() - os.freemem());
    const totalRAM = bytesToGB(os.totalmem());
    const cpuModel = os.cpus()[0].model.replace(/\s+/g, ' ');
    const botID = api.getCurrentUserID();
    
    // Stats globales (si dispos)
    const cmdCount = global.GoatBot?.commands?.size || 0;
    const threadCount = global.db?.allThreadData?.length || 0;
    const mogoCount = global.db?.allUserData?.length || 0;

    const msg = 
      `🍎 ━━━━━━━━━━━━━━━ 🍎\n` +
      `  𝐂𝐀𝐌𝐈𝐋𝐋𝐄 𝟐.𝟎 𝐒𝐘𝐒𝐓𝐄𝐌\n` +
      `🍎 ━━━━━━━━━━━━━━━ 🍎\n` +
      `■ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptime}\n` +
      `■ 𝐁𝐨𝐭 𝐈𝐃: ${botID}\n` +
      `■ 𝐂𝐦𝐝𝐬: ${cmdCount} | 𝐆𝐫𝐩𝐬: ${threadCount}\n` +
      `■ 𝐌𝐨𝐠𝐨𝐬: ${mogoCount}\n` +
      `🍎 ━━━━ 𝐒𝐘𝐒𝐓𝐄𝐌𝐄 ━━━━ 🍎\n` +
      `■ 𝐎𝐒: ${os.type()} (${os.arch()})\n` +
      `■ 𝐍𝐨𝐝𝐞: v${process.versions.node}\n` +
      `■ 𝐇𝐨𝐬𝐭: ${os.hostname()}\n` +
      `🍎 ━━━━ 𝐇𝐀𝐑𝐃𝐖𝐀𝐑𝐄 ━━━ 🍎\n` +
      `■ 𝐂𝐏𝐔: ${os.cpus().length} Coeurs\n` +
      `■ 𝐑𝐀𝐌: ${usedRAM}GB / ${totalRAM}GB\n` +
      `■ 𝐋𝐨𝐚𝐝: [${os.loadavg().map(l => l.toFixed(2)).join(', ')}]\n` +
      `🍎 ━━━━━━━━━━━━━━━ 🍎\n` +
      `   𝐄𝐝𝐢𝐭𝐞𝐝 𝐛𝐲 𝐂𝐚𝐦𝐢𝐥𝐥𝐞 𝟐.𝟎 🍎`;

    try {
      // Création du cache si inexistant
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
      }

      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      await fs.writeFile(cachePath, Buffer.from(response.data, 'utf-8'));

      return api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, messageID);

    } catch (err) {
      console.error("Erreur Uptime:", err);
      return api.sendMessage(msg, threadID, messageID);
    }
  }
};
