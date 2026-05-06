const { getStreamsFromAttachment, log } = global.utils;
const moment = require("moment-timezone");
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		version: "1.8",
		author: "Camille 🤍",
		countDown: 5,
		role: 0,
		description: {
			en: "Envoyer un rapport ou feedback à l'admin avec le style Uchiha"
		},
		category: "contacts admin",
		guide: {
			en: "{pn} <message>"
		}
	},

	langs: {
		en: {
			missingMessage: "❌ Tu dois entrer un message pour l'admin, Camille.",
			sendByGroup: "\n👥 Groupe: %1\n🆔 ID Groupe: %2",
			sendByUser: "\n👤 Envoi en privé",
			content: "\n\n📝 CONTENU :\n─────────────────\n%1\n─────────────────\n💬 Réponds à ce message pour parler à l'utilisateur.",
			success: "✅ Ton message a été transmis par le Sharingan à %1 admin(s) !",
			failed: "❌ Échec de transmission vers %1 admin(s).",
			reply: "╭───── • 🍎 • ─────╮\n   RÉPONSE DE L'ADMIN\n╰───── • 🍎 • ─────╯\n\n📍 Admin : %1\n⏰ Heure : %2\n─────────────────\n『 %3 』\n─────────────────\n💬 Réponds pour continuer la discussion.",
			replySuccess: "✅ Réponse transmise à l'admin !",
			feedback: "╭───── • 🍎 • ─────╮\n   FEEDBACK UTILISATEUR\n╰───── • 🍎 • ─────╯\n\n👤 De : %1\n🆔 ID : %2%3\n⏰ Heure : %4\n\n📝 CONTENU :\n─────────────────\n%5\n─────────────────\n💬 Réponds pour envoyer un message.",
			replyUserSuccess: "✅ Réponse transmise à l'utilisateur !",
			noAdmin: "🌀 Aucun admin n'est disponible dans les archives Uchiha."
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		
		if (!args[0])
			return message.reply(getLang("missingMessage"));
		
		const { senderID, threadID, isGroup } = event;
		if (config.adminBot.length == 0)
			return message.reply(getLang("noAdmin"));

		const senderName = await usersData.getName(senderID);
		const threadName = isGroup ? (await threadsData.get(threadID)).threadName : "Privé";

		const header = 
`╔═══════ 🍎 ═══════╗
   ⚡ **CALL ADMIN** ⚡
╚═══════ 🍎 ═══════╝
👤 Nom : ${senderName}
⏰ Heure : ${time}`;

		const msg = header + (isGroup ? getLang("sendByGroup", threadName, threadID) : getLang("sendByUser"));

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{ id: senderID, tag: senderName }],
			attachment: await getStreamsFromAttachment(
				[...event.attachments, ...(event.messageReply?.attachments || [])]
					.filter(item => mediaTypes.includes(item.type))
			)
		};

		const successIDs = [];
		const failedIDs = [];

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);
				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			} catch (err) {
				failedIDs.push(uid);
			}
		}

		if (successIDs.length > 0) return message.reply(getLang("success", successIDs.length));
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const time = moment.tz("Africa/Abidjan").format("HH:mm");
		const { isGroup } = event;

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", senderName, time, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.reply(err);
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				let groupInfo = "";
				if (isGroup) {
					const { threadName } = await api.getThreadInfo(event.threadID);
					groupInfo = getLang("sendByGroup", threadName, event.threadID);
				}
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, groupInfo, time, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: await getStreamsFromAttachment(
						event.attachments.filter(item => mediaTypes.includes(item.type))
					)
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.reply(err);
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
		}
	}
};
