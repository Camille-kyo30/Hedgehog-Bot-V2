const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "kick",
		version: "1.5",
		author: "Camille 🤍",
		countDown: 5,
		role: 1,
		description: {
			en: "Expulser un membre du groupe avec le style Uchiha"
		},
		category: "box chat",
		guide: {
			en: "{pn} @tags : Expulse les membres identifiés ou réponds à un message."
		}
	},

	langs: {
		en: {
			needAdmin: "⚠️ | Le Bot a besoin des privilèges Admin pour utiliser le Sharingan. Assurez-vous que je suis bien administrateur du groupe.",
			successKick: "⚡ **EXPULSION RÉUSSIE** ⚡\n\nL'intrus a été banni par Camille 🤍.\n⏰ Heure : %1"
		}
	},

	onStart: async function ({ message, event, args, api, getLang }) {
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		const botID = api.getCurrentUserID();

		// On récupère les infos fraîches du thread directement via l'API
		const threadInfo = await api.getThreadInfo(event.threadID);
		const adminIDs = threadInfo.adminIDs.map(item => item.id);

		// Vérification si le bot est réellement admin
		if (!adminIDs.includes(botID))
			return message.reply(getLang("needAdmin"));

		async function kickAndCheckError(uid) {
			try {
				// On vérifie que la cible n'est pas un admin (on ne peut pas kick un admin)
				if (adminIDs.includes(uid)) {
					message.reply("❌ | Impossible d'expulser un autre administrateur.");
					return "ERROR";
				}
				await api.removeUserFromGroup(uid, event.threadID);
				return "SUCCESS";
			}
			catch (e) {
				message.reply("❌ | Une erreur est survenue lors de l'expulsion.");
				return "ERROR";
			}
		}

		const styledHeader = 
`╔═══════ 🍎 ═══════╗
   🌀 **UCHIHA KICK** 🌀
╚═══════ 🍎 ═══════╝`;

		if (!args[0]) {
			if (!event.messageReply)
				return message.reply("⚠️ | Tag la personne à expulser ou réponds à son message.");
			
			const status = await kickAndCheckError(event.messageReply.senderID);
			if (status === "SUCCESS") {
				return message.reply(`${styledHeader}\n${getLang("successKick", time)}`);
			}
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.reply("⚠️ | Utilise @tag pour désigner ceux qui doivent partir.");

			let successCount = 0;
			for (const uid of uids) {
				const res = await kickAndCheckError(uid);
				if (res === "SUCCESS") successCount++;
			}

			if (successCount > 0) {
				return message.reply(`${styledHeader}\n${getLang("successKick", time)}`);
			}
		}
	}
};
