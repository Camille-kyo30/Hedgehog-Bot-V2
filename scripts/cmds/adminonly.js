const fs = require("fs-extra");
const moment = require("moment-timezone");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "adminonly",
		aliases: ["adonly", "onlyad", "onlyadmin"],
		version: "1.7",
		author: "Camille 🤍",
		countDown: 5,
		role: 2,
		description: {
			en: "Activer/désactiver le mode restreint aux admins (Style Uchiha)"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off] : active/désactive le mode admin uniquement"
				+ "\n   {pn} noti [on | off] : active/désactive les alertes pour les non-admins"
		}
	},

	langs: {
		en: {
			turnedOn: "╔═══════ 🍎 ═══════╗\n   ⚡ **MODE RESTREINT** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Le Sharingan est activé : Seuls les admins peuvent utiliser le Bot.\n⏰ Heure : %1",
			turnedOff: "╔═══════ 🍎 ═══════╗\n   🌀 **MODE PUBLIC** 🌀\n╚═══════ 🍎 ═══════╝\n✅ Le mode restreint est désactivé. Tout le monde peut utiliser le Bot.\n⏰ Heure : %1",
			turnedOnNoti: "🔔 | Alertes activées : Le Bot signalera les tentatives d'utilisation non autorisées.",
			turnedOffNoti: "🔕 | Alertes désactivées : Le Bot restera silencieux face aux non-admins."
		}
	},

	onStart: function ({ args, message, getLang }) {
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		let isSetNoti = false;
		let value;
		let indexGetVal = 0;

		if (args[0] == "noti") {
			isSetNoti = true;
			indexGetVal = 1;
		}

		if (args[indexGetVal] == "on")
			value = true;
		else if (args[indexGetVal] == "off")
			value = false;
		else
			return message.reply("⚠️ | Utilise : .adminonly [on | off] ou .adminonly noti [on | off]");

		if (isSetNoti) {
			config.hideNotiMessage.adminOnly = !value;
			message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
		}
		else {
			config.adminOnly.enable = value;
			message.reply(getLang(value ? "turnedOn" : "turnedOff", time));
		}

		// Sauvegarde automatique dans le fichier config.json
		fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
	}
};
