const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "join",
    version: "3.2",
    author: "Camille 🤍",
    countDown: 5,
    role: 2,
    shortDescription: {
        en: "Infiltrer un groupe où le bot est présent"
    },
    longDescription: {
        en: "Affiche la liste des archives (groupes). Répondez avec un numéro pour rejoindre."
    },
    category: "owner",
    guide: { en: "{pn} [page|next|prev]" },
  },

  onStart: async function ({ api, event, args }) {
    try {
      const timeNow = moment.tz("Africa/Abidjan").format("HH:mm");
      const groupList = await api.getThreadList(200, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);

      if (!filteredList.length) return api.sendMessage("❌ Aucune archive trouvée dans la base de données.", event.threadID);

      const pageSize = 15;
      const totalPages = Math.ceil(filteredList.length / pageSize);
      if (!global.joinPage) global.joinPage = {};
      const currentThread = event.threadID;

      let page = 1;
      if (args[0]) {
        const input = args[0].toLowerCase();
        if (input === "next") page = (global.joinPage[currentThread] || 1) + 1;
        else if (input === "prev") page = (global.joinPage[currentThread] || 1) - 1;
        else page = parseInt(input) || 1;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      global.joinPage[currentThread] = page;

      const startIndex = (page - 1) * pageSize;
      const currentGroups = filteredList.slice(startIndex, startIndex + pageSize);

      const formatted = currentGroups.map((g, i) =>
        `┃ ${startIndex + i + 1}. 『${g.threadName || "Sans nom"}』\n┃ 👥 ${g.participantIDs.length} membres\n┃ 🆔 ${g.threadID}\n┃`
      );

      const message = [
        "╔═══════ 🍎 ═══════╗",
        "   🌀 **ARCHIVES UCHIHA** 🌀",
        "╚═══════ 🍎 ═══════╝",
        "⚡ Liste des zones d'infiltration :",
        "●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●",
        formatted.join("\n"),
        "●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●",
        `📄 Page : ${page}/${totalPages} | Total : ${filteredList.length}`,
        `⏰ Heure : ${timeNow}`,
        "●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●",
        "👉 Réponds avec le numéro de la zone pour t'y téléporter."
      ].join("\n");

      const sentMessage = await api.sendMessage(message, event.threadID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID,
        list: filteredList,
        page,
        pageSize
      });

    } catch (e) {
      api.sendMessage("⚠️ Le Sharingan n'a pas pu localiser les groupes.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, list, page, pageSize } = Reply;
    if (event.senderID !== author) return;

    const groupIndex = parseInt(args[0], 10);
    if (isNaN(groupIndex) || groupIndex <= 0) {
      return api.sendMessage("⚠️ Numéro invalide. Choisis une cible réelle.", event.threadID, event.messageID);
    }

    const startIndex = (page - 1) * pageSize;
    const currentGroups = list.slice(startIndex, startIndex + pageSize);

    if (groupIndex > currentGroups.length) {
      return api.sendMessage("⚠️ Cible hors de portée pour cette page.", event.threadID, event.messageID);
    }

    try {
      const selected = currentGroups[groupIndex - 1];
      const groupID = selected.threadID;
      const threadInfo = await api.getThreadInfo(groupID);

      if (threadInfo.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`⚠️ Tu es déjà présent dans l'archive 『${selected.threadName}』`, event.threadID, event.messageID);
      }
      if (threadInfo.participantIDs.length >= 250) {
        return api.sendMessage(`🚫 Archive complète : 『${selected.threadName}』`, event.threadID, event.messageID);
      }

      await api.addUserToGroup(event.senderID, groupID);
      api.sendMessage(`✅ Infiltration réussie dans 『${selected.threadName}』`, event.threadID, event.messageID);

    } catch (e) {
      api.sendMessage("❌ Échec de la téléportation. L'accès est peut-être bloqué.", event.threadID, event.messageID);
    } finally {
      global.GoatBot.onReply.delete(Reply.messageID);
    }
  },
};
        
