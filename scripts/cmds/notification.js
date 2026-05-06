const { getStreamsFromAttachment } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "1.9",
		author: "Camille 🤍",
		countDown: 5,
		role: 2,
		description: {
			en: "Envoyer une annonce Uchiha stylée à tous les groupes"
		},
		category: "owner",
		guide: {
			en: "{pn} <message>"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData }) {
		const { delayPerGroup } = envCommands[commandName];
		if (!args[0])
			return message.reply("❌ Tu dois entrer un message pour tes sujets, Camille.");

		const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
		message.reply(`🌀 Activation du Sharingan sur ${allThreadID.length} groupes...`);

		let sendSucces = 0;
		const sendError = [];
		const attachments = await getStreamsFromAttachment(
			[
				...event.attachments,
				...(event.messageReply?.attachments || [])
			].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
		);

		for (const thread of allThreadID) {
			const tid = thread.threadID;
			const threadName = thread.threadName || "Groupe Inconnu";
			const time = moment.tz("Africa/Abidjan").format("HH:mm");

			// Design Sasuke Uchiha avec Nom du Groupe et Heure
			const styledMessage = 
`╔═══════ 🍎 ═══════╗
   ⚡ **NOTIFICATION** ⚡
╚═══════ 🍎 ═══════╝
╭───── • 🍎 • ─────╮
   MESSAGE DE L'ADMIN
╰───── • 🍎 • ─────╯

👥 **Groupe :** ${threadName}
⏰ **Heure :** ${time}

📝 **Message :** 『 ${args.join(" ")} 』

●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
🚀 **Expéditeur :** Camille 🤍
🌀 **Status :** Jutsu Prioritaire
●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●`;

			try {
				await api.sendMessage({ body: styledMessage, attachment: attachments }, tid);
				sendSucces++;
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			}
			catch (e) {
				sendError.push(tid);
			}
		}

		let msg = `✅ Transmis avec succès à ${sendSucces} groupes.`;
		if (sendError.length > 0) msg += `\n❌ Échec sur ${sendError.length} groupes.`;
		
		message.reply(msg);
	}
};
