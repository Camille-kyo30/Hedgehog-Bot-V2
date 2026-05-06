const { commands, aliases } = global.GoatBot;
const axios = require('axios');

function toCmdFont(text = "") {
  const map = {
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩",
    K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳",
    U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹",
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃",
    k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍",
    u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    " ": " "
  };
  return text.split("").map(c => map[c] || c).join("");
}

function toQuestionFont(text = "") {
  const map = {
    A: "𝐴", B: "𝐵", C: "𝐶", D: "𝐷", E: "𝐸", F: "𝐹", G: "𝐺", H: "𝐻", I: "𝐼", J: "𝐽",
    K: "𝐾", L: "𝐿", M: "𝑀", N: "𝑁", O: "𝑂", P: "𝑃", Q: "𝑄", R: "𝑅", S: "𝑆", T: "𝑇",
    U: "𝑈", V: "𝑉", W: "𝑊", X: "𝑋", Y: "𝑌", Z: "𝑍",
    a: "𝑎", b: "𝑏", c: "𝑐", d: "𝑑", e: "𝑒", f: "𝑓", g: "𝑔", h: "ℎ", i: "𝑖", j: "𝑗",
    k: "𝑘", l: "𝑙", m: "𝑚", n: "𝑛", o: "𝑜", p: "𝑝", q: "𝑞", r: "𝑟", s: "𝑠", t: "𝑡",
    u: "𝑢", v: "𝑣", w: "𝑤", x: "𝑥", y: "𝑦", z: "𝑧",
    " ": " "
  };
  return text.split("").map(c => map[c] || c).join("");
}

module.exports = {
  config: {
    name: "help",
    version: "6.5",
    author: "Camille 2.0",
    countDown: 2,
    role: 0,
    shortDescription: { en: "Explore all bot commands", fr: "Liste des pouvoirs du Bot" },
    category: "system",
    guide: { en: "help <command>", fr: "help <cmd>" },
  },

  onStart: async function ({ message, args }) {
    try {
      // Ton image spécifique
      const imageUrl = "https://i.ibb.co/4nNKxqwh/e19fa19560d5.jpg";
      const attachment = await global.utils.getStreamFromURL(imageUrl);

      if (!args || args.length === 0) {
        let body = "─── « 🍎 𝖴𝖢𝖧𝖨𝖧𝖠 𝖧𝖤𝖫𝖯 🍎 » ───\n\n";

        const categories = {};
        for (let [name, cmd] of commands) {
          const cat = cmd.config.category || "Général";
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(name);
        }

        for (const cat of Object.keys(categories).sort()) {
          const list = categories[cat]
            .sort()
            .map(c => `• ${toCmdFont(c)}`)
            .join("  ");

          body += `⚡ [ **${cat.toUpperCase()}** ]\n『 ${list || "Vide"} 』\n\n`;
        }

        body += `●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n`;
        body += `🌀 𝖳𝗈𝗍𝖺𝗅 : ${commands.size} 𝖼𝗆𝖽𝗌\n`;
        body += `🍎 𝖴𝗌𝖺𝗀𝖾 : .𝗁𝖾𝗅𝗉 <𝗇𝗈𝗆>\n`;
        body += `●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●`;

        return message.reply({ body, attachment });
      }

      const query = args[0].toLowerCase();
      const command = commands.get(query) || commands.get(aliases.get(query));

      if (!command) {
        return message.reply({ body: `❌ Le Sharingan ne trouve pas la commande "${query}".`, attachment });
      }

      const cfg = command.config || {};
      const aliasesList = Array.isArray(cfg.aliases) && cfg.aliases.length
        ? cfg.aliases.map(a => toCmdFont(a)).join(", ")
        : "Aucun";

      const card = 
`╔═══════ ● 🍎 ● ═══════╗
   ✨ ${toCmdFont(cfg.name).toUpperCase()} ✨
╚═══════ ● 🍎 ● ═══════╝
🔹 𝖣𝖾𝗌𝖼 : ${cfg.shortDescription?.fr || cfg.shortDescription?.en || "---"}
🔹 𝖢𝖺𝗍𝖾́𝗀𝗈𝗋𝗂𝖾 : ${cfg.category || "Misc"}
🔹 𝖠𝗅𝗂𝖺𝗌 : ${aliasesList}
🔹 𝖱𝗈̂𝗅𝖾 : ${cfg.role === 0 ? "Tous" : cfg.role === 1 ? "Admin" : "Boss"}
🔹 𝖢𝗈𝗈𝗅𝖽𝗈𝗐𝗇 : ${cfg.countDown || 1}𝗌
🔹 𝖠𝗎𝗍𝗁𝖾𝗎𝗋 : ${cfg.author || "Camille"}
●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
💡 𝖴𝗌𝖺𝗀𝖾 : .${toCmdFont(cfg.guide?.fr || cfg.guide?.en || cfg.name)}
●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●`;

      return message.reply({ body: card, attachment });

    } catch (err) {
      return message.reply(`⚠️ Erreur : ${err.message}`);
    }
  }
};
