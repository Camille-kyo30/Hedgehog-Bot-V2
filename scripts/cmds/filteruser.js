const moment = require("moment-timezone");

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
	config: {
		name: "filteruser",
		version: "1.7",
		author: "Camille 🤍",
		countDown: 5,
		role: 1,
		description: {
			en: "Filtrer les membres du groupe (inactifs ou comptes bloqués) style Uchiha"
		},
		category: "box chat",
		guide: {
			en: "   {pn} [<nombre de messages> | die]"
		}
	},

	langs: {
		en: {
			needAdmin: "⚠️ | Le Bot a besoin des privilèges Admin pour activer le filtre du Sharingan.",
			confirm: "╭───── • 🍎 • ─────╮\n   PURGE DU CLAN\n╰───── • 🍎 • ─────╯\n⚠️ Es-tu sûr de vouloir bannir les membres ayant moins de %1 messages ?\n\n🔹 Réagis à ce message pour confirmer l'exécution.",
			kickByBlock: "✅ | %1 comptes 'fantômes' (bloqués) ont été éliminés avec succès.",
			kickByMsg: "✅ | %1 membres inactifs (< %2 messages) ont été purgés.",
			kickError: "❌ | Le Sharingan a échoué sur %1 membres :\n%2",
			noBlock: "✅ | Aucun compte bloqué détecté dans les archives.",
			noMsg: "✅ | Tous les membres sont actifs au-dessus du seuil de %1 messages."
		}
	},

	onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		const botID = api.getCurrentUserID();
		
		// Vérification admin en temps réel
		const threadInfo = await api.getThreadInfo(event.threadID);
		const adminIDs = threadInfo.adminIDs.map(item => item.id);

		if (!adminIDs.includes(botID))
			return message.reply(getLang("needAdmin"));

		const styledHeader = 
`╔═══════ 🍎 ═══════╗
   🌀 **UCHIHA FILTER** 🌀
╚═══════ 🍎 ═══════╝
⏰ Heure : ${time}\n`;

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		}
		else if (args[0] == "die") {
			const membersBlocked = threadInfo.userInfo.filter(user => user.type !== "User");
			const errors = [];
			const success = [];
			
			message.reply("🌀 Scan des comptes bloqués en cours...");

			for (const user of membersBlocked) {
				if (!adminIDs.includes(user.id)) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					}
					catch (e) {
						errors.push(user.name || user.id);
					}
					await sleep(700);
				}
			}

			let msg = styledHeader;
			if (success.length > 0) msg += `${getLang("kickByBlock", success.length)}\n`;
			if (errors.length > 0) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
			if (success.length == 0 && errors.length == 0) msg += getLang("noBlock");
			
			message.reply(msg);
		}
		else {
			message.reply("⚠️ Usage : .filteruser <nombre> ou .filteruser die");
		}
	},

	onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
		const { minimum = 1, author } = Reaction;
		if (event.userID != author) return;

		const threadData = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();
		
		// Nouveau check admin en temps réel pour la réaction
		const threadInfo = await api.getThreadInfo(event.threadID);
		const adminIDs = threadInfo.adminIDs.map(item => item.id);

		const membersCountLess = threadData.members.filter(member =>
			member.count < minimum
			&& member.inGroup == true
			&& member.userID != botID
			&& !adminIDs.includes(member.userID)
		);

		const errors = [];
		const success = [];
		
		message.reply(`⚡ Début de la purge (${membersCountLess.length} membres)...`);

		for (const member of membersCountLess) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			}
			catch (e) {
				errors.push(member.name || member.userID);
			}
			await sleep(700);
		}

		let msg = "╔═══════ 🍎 ═══════╗\n   🌀 **RÉSULTAT PURGE** 🌀\n╚═══════ 🍎 ═══════╝\n";
		if (success.length > 0) msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
		if (errors.length > 0) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
		if (success.length == 0 && errors.length == 0) msg += getLang("noMsg", minimum);
		
		message.reply(msg);
	}
};
