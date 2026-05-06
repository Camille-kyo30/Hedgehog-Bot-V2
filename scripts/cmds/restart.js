const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "restart",
		version: "1.2",
		author: "Camille 🤍",
		countDown: 5,
		role: 2,
		description: {
			en: "Réinitialiser le système (Restart) avec le style Archives Uchiha"
		},
		category: "Owner",
		guide: {
			en: "{pn} : Relance le bot instantanément"
		}
	},

	langs: {
		en: {
			restarting: "╔═══════ 🍎 ═══════╗\n   🌀 **RÉINITIALISATION** 🌀\n╚═══════ 🍎 ═══════╝\n⚡ Activation de l'Izanagi...\nLe système redémarre pour appliquer les changements.\n⏰ Heure : %1",
			restarted: "╔═══════ 🍎 ═══════╗\n   ⚡ **SYSTÈME EN LIGNE** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Le Bot a été réanimé avec succès.\n🚀 Temps de réaction : %1s\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n👤 Camille 🤍"
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			const duration = ((Date.now() - time) / 1000).toFixed(2);
			
			// Message de confirmation après le redémarrage
			api.sendMessage({
				body: `╔═══════ 🍎 ═══════╗\n   ⚡ **SYSTÈME EN LIGNE** ⚡\n╚═══════ 🍎 ═══════╝\n✅ Le Bot a été réanimé avec succès.\n🚀 Temps de réaction : ${duration}s\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n👤 Camille 🤍`
			}, tid);
			
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		const timeNow = moment.tz("Africa/Abidjan").format("HH:mm");
		
		// Création du dossier tmp s'il n'existe pas
		if (!fs.existsSync(`${__dirname}/tmp`)) fs.mkdirSync(`${__dirname}/tmp`);
		
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		
		await message.reply(getLang("restarting", timeNow));
		
		// Sortie du processus pour forcer le redémarrage (géré par PM2 ou ton script de lancement)
		process.exit(2);
	}
};
