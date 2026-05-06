const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "admin",
		version: "1.7",
		author: "Camille 🤍",
		countDown: 5,
		role: 2,
		description: {
			en: "Gérer les rangs des administrateurs du clan Uchiha"
		},
		category: "owner",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag>: Ajouter un admin'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Retirer un admin'
				+ '\n	  {pn} [list | -l]: Voir les membres du conseil'
		}
	},

	langs: {
		en: {
			added: "╔═══════ 🍎 ═══════╗\n   ⚡ **NOUVEL ADMIN** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Accès accordé à %1 membre(s) :\n%2\n⏰ Heure : %3",
			alreadyAdmin: "\n⚠️ | %1 membre(s) possèdent déjà le Sharingan (Admin) :\n%2",
			missingIdAdd: "⚠️ | Identifie le futur membre du conseil (tag ou UID) pour lui accorder le rang.",
			removed: "╔═══════ 🍎 ═══════╗\n   🌀 **RANG RETIRÉ** 🌀\n╚═══════ 🍎 ═══════╝\n✅ %1 membre(s) ont été déchus de leurs fonctions :\n%2\n⏰ Heure : %3",
			notAdmin: "⚠️ | %1 individu(s) ne font pas partie du conseil :\n%2",
			missingIdRemove: "⚠️ | Identifie la personne à destituer du conseil.",
			listAdmin: "╭───── • 🍎 • ─────╮\n   CONSEIL DES UCHIHA\n╰───── • 🍎 • ─────╯\n\n%1\n\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n🚀 Fondateur : Camille 🤍"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang }) {
		const time = moment.tz("Africa/Abidjan").format("HH:mm");

		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));

					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					config.adminBot.push(...notAdminIds);
					const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

					return message.reply(
						(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(n => notAdminIds.includes(n.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n"), time) : "")
						+ (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdAdd"));
			}
			case "remove":
			case "-r": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply)
						uids.push(event.messageReply.senderID);
					else
						uids = args.filter(arg => !isNaN(arg));

					const notAdminIds = [];
					const adminIds = [];
					for (const uid of uids) {
						if (config.adminBot.includes(uid))
							adminIds.push(uid);
						else
							notAdminIds.push(uid);
					}

					for (const uid of adminIds)
						config.adminBot.splice(config.adminBot.indexOf(uid), 1);

					const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

					return message.reply(
						(adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n"), time) : "")
						+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
					);
				}
				else
					return message.reply(getLang("missingIdRemove"));
			}
			case "list":
			case "-l": {
				const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `⚡ ${name} (${uid})`).join("\n")));
			}
			default:
				return message.reply("⚠️ | Utilise : .admin [add | remove | list]");
		}
	}
};
