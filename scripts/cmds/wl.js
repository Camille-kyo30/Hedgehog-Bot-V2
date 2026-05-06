const { writeFileSync } = require("fs-extra");
const moment = require("moment-timezone");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "whitelists",
		aliases: ["wlonly", "onlywlst", "onlywhitelist", "wl"],
		version: "1.6",
		author: "Camille 🤍",
		countDown: 5,
		role: 2,
		description: {
			en: "Gérer la liste blanche (Whitelist) du clan Uchiha",
		},
		category: "owner",
		guide: {
			en: " {pn} [add | -a] <uid | @tag> : Ajouter à la Whitelist" +
				"\n	 {pn} [remove | -r] <uid | @tag> : Retirer de la Whitelist" +
				"\n	 {pn} [list | -l] : Liste des membres autorisés" +
				"\n  {pn} -m [on | off] : Activer le mode Whitelist uniquement" +
				"\n  {pn} -m noti [on | off] : Activer les notifications d'accès refusé",
		},
	},

	langs: {
		en: {
			added: `╔═══════ 🍎 ═══════╗\n   ⚡ **ACCÈS ACCORDÉ** ⚡\n╚═══════ 🍎 ═══════╝\n✅ %1 membre(s) ajouté(s) à la Whitelist :\n%2\n⏰ Heure : %3`,
			alreadyAdded: `\n⚠️ | %1 membre(s) sont déjà sur la liste :\n%2`,
			missingIdAdd: "⚠️ | Identifie un membre ou entre un UID pour l'inviter dans les archives.",
			removed: `╔═══════ 🍎 ═══════╗\n   🌀 **ACCÈS RÉVOQUÉ** 🌀\n╚═══════ 🍎 ═══════╝\n✅ %1 membre(s) retiré(s) de la Whitelist :\n%2\n⏰ Heure : %3`,
			notAdded: `\n⚠️ | %1 membre(s) ne figurent pas sur la liste :\n%2`,
			missingIdRemove: "⚠️ | Identifie un membre ou entre un UID pour le bannir de la Whitelist.",
			listAdmin: `╭───── • 🍎 • ─────╮\n   MEMBRES WHITELIST\n╰───── • 🍎 • ─────╯\n%1\n\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n🚀 Camille 🤍`,
			turnedOn: "╔═══════ 🍎 ═══════╗\n   ⚡ **MODE WHITELIST** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Mode activé : Seuls les membres autorisés peuvent utiliser le Bot.\n⏰ Heure : %1",
			turnedOff: "╔═══════ 🍎 ═══════╗\n   🌀 **MODE OUVERT** 🌀\n╚═══════ 🍎 ═══════╝\n✅ Mode désactivé : Le Bot est accessible à tous.\n⏰ Heure : %1",
			turnedOnNoti: "✅ | Notifications activées pour les intrus hors Whitelist.",
			turnedOffNoti: "❎ | Notifications désactivées pour les intrus.",
		},
	},

	onStart: async function ({ message, args, usersData, event, getLang, api }) {
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		const permission = global.GoatBot.config.adminBot;
		
		if (!permission.includes(event.senderID)) {
			return; // Sécurité : Seuls les admins bot peuvent toucher à la WL
		}

		switch (args[0]) {
			case "add":
			case "-a": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply) uids.push(event.messageReply.senderID);
					else uids = args.filter((arg) => !isNaN(arg));

					const notWLIds = [];
					const authorIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							authorIds.push(uid);
						else notWLIds.push(uid);
					}

					config.whiteListMode.whiteListIds.push(...notWLIds);
					const getNames = await Promise.all(
						uids.map((uid) => usersData.getName(uid).then((name) => ({ uid, name })))
					);
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

					return message.reply(
						(notWLIds.length > 0 ? getLang("added", notWLIds.length, getNames.filter(n => notWLIds.includes(n.uid)).map(({ uid, name }) => `├‣ 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝙸𝙳: ${uid}`).join("\n"), time) : "") +
						(authorIds.length > 0 ? getLang("alreadyAdded", authorIds.length, authorIds.map((uid) => `├‣ 𝚄𝙸𝙳: ${uid}`).join("\n")) : "")
					);
				} else return message.reply(getLang("missingIdAdd"));
			}

			case "remove":
			case "-r": {
				if (args[1] || event.messageReply) {
					let uids = [];
					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else if (event.messageReply) uids.push(event.messageReply.senderID);
					else uids = args.filter((arg) => !isNaN(arg));

					const notWLIds = [];
					const authorIds = [];
					for (const uid of uids) {
						if (config.whiteListMode.whiteListIds.includes(uid))
							authorIds.push(uid);
						else notWLIds.push(uid);
					}

					for (const uid of authorIds)
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);

					const getNames = await Promise.all(
						authorIds.map((uid) => usersData.getName(uid).then((name) => ({ uid, name })))
					);
					writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

					return message.reply(
						(authorIds.length > 0 ? getLang("removed", authorIds.length, getNames.map(({ uid, name }) => `├‣ 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝙸𝙳: ${uid}`).join("\n"), time) : "") +
						(notWLIds.length > 0 ? getLang("notAdded", notWLIds.length, notWLIds.map((uid) => `├‣ 𝚄𝙸𝙳: ${uid}`).join("\n")) : "")
					);
				} else return message.reply(getLang("missingIdRemove"));
			}

			case "list":
			case "-l": {
				const getNames = await Promise.all(
					config.whiteListMode.whiteListIds.map((uid) => usersData.getName(uid).then((name) => ({ uid, name })))
				);
				return message.reply(
					getLang("listAdmin", getNames.map(({ uid, name }) => `⚡ ${name} (${uid})`).join("\n"))
				);
			}

			case "m":
			case "-m": {
				let isSetNoti = false;
				let value;
				let indexGetVal = 1;

				if (args[1] == "noti") {
					isSetNoti = true;
					indexGetVal = 2;
				}

				if (args[indexGetVal] == "on") value = true;
				else if (args[indexGetVal] == "off") value = false;
				else return message.reply("⚠️ | Utilise : .whitelists -m [on | off]");

				if (isSetNoti) {
					config.hideNotiMessage.whiteListMode = !value;
					message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					config.whiteListMode.enable = value;
					message.reply(getLang(value ? "turnedOn" : "turnedOff", time));
				}

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				break;
			}
			default:
				return message.reply("⚠️ | Commande invalide. Utilise : .whitelists [add | remove | list | -m]");
		}
	},
};
