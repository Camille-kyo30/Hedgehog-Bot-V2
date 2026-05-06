const fs = require("fs-extra");
const moment = require("moment-timezone");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.5",
		author: "Camille 🤍",
		countDown: 5,
		role: 0,
		description: {
			en: "Changer le signe de commande (prefix) du bot avec le style Uchiha"
		},
		category: "config",
		guide: {
			en: "   {pn} <nouveau prefix> : change le prefix dans ce groupe"
				+ "\n   Exemple :"
				+ "\n    {pn} #"
				+ "\n\n   {pn} <nouveau prefix> -g : change le prefix global (Admin Bot uniquement)"
				+ "\n   {pn} reset : remet le prefix par défaut"
		}
	},

	langs: {
		en: {
			reset: "✅ | Le prefix de ce groupe a été réinitialisé par défaut : %1",
			onlyAdmin: "❌ | Seul un membre du conseil (Admin Bot) peut changer le prefix global.",
			confirmGlobal: "╭───── • 🍎 • ─────╮\n   MODIFICATION GLOBALE\n╰───── • 🍎 • ─────╯\n⚠️ Réagis à ce message pour confirmer le changement de prefix pour tout le système.",
			confirmThisThread: "╭───── • 🍎 • ─────╮\n   MODIFICATION LOCALE\n╰───── • 🍎 • ─────╯\n⚠️ Réagis à ce message pour confirmer le nouveau prefix dans ce groupe.",
			successGlobal: "╔═══════ 🍎 ═══════╗\n   ⚡ **PREFIX GLOBAL** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Le prefix du système est désormais : %1\n⏰ Heure : %2",
			successThisThread: "╔═══════ 🍎 ═══════╗\n   🌀 **PREFIX GROUPE** 🌀\n╚═══════ 🍎 ═══════╝\n✅ Le prefix du groupe est désormais : %1\n⏰ Heure : %2",
			myPrefix: "╔═══════ 🍎 ═══════╗\n   ⚡ **INFOS PREFIX** ⚡\n╚═══════ 🍎 ═══════╝\n🌐 Système : %1\n🛸 Ce groupe : %2\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n🚀 Camille 🤍"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) {
			const systemPrefix = global.GoatBot.config.prefix;
			const threadPrefix = utils.getPrefix(event.threadID);
			return message.reply(getLang("myPrefix", systemPrefix, threadPrefix));
		}

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g") {
			if (role < 2) return message.reply(getLang("onlyAdmin"));
			formSet.setGlobal = true;
		} else {
			formSet.setGlobal = false;
		}

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix, time));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix, time));
		}
	},

	onChat: async function ({ event, message, getLang }) {
		if (event.body && event.body.toLowerCase() === "prefix") {
			return () => {
				const systemPrefix = global.GoatBot.config.prefix;
				const threadPrefix = utils.getPrefix(event.threadID);
				return message.reply(getLang("myPrefix", systemPrefix, threadPrefix));
			};
		}
	}
};
