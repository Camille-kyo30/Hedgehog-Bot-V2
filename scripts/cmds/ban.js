const { findUid } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "ban",
		version: "1.6",
		author: "Camille 🤍",
		countDown: 5,
		role: 1,
		description: {
			en: "Bannir un membre du groupe avec le style Uchiha"
		},
		category: "box chat",
		guide: {
			en: "   {pn} [@tag|uid|lien fb|reply] [raison] : Bannir un membre"
				+ "\n   {pn} check : Expulser les membres bannis présents"
				+ "\n   {pn} unban [@tag|uid|lien fb|reply] : Débannir un membre"
				+ "\n   {pn} list : Voir la liste noire du clan"
		}
	},

	langs: {
		en: {
			notFoundTarget: "⚠️ | Identifie la cible avec un @tag, un UID, un lien FB ou en répondant à son message.",
			notFoundTargetUnban: "⚠️ | Identifie la personne à gracier avec un @tag, un UID, un lien FB ou en répondant à son message.",
			userNotBanned: "⚠️ | L'individu avec l'ID %1 ne figure pas dans la liste noire de ce groupe.",
			unbannedSuccess: "✅ | %1 a été retiré de la liste noire par Camille 🤍 !",
			cantSelfBan: "⚠️ | Tu ne peux pas retourner ton propre Sharingan contre toi-même !",
			cantBanAdmin: "❌ | Un administrateur ne peut pas être banni des archives.",
			existedBan: "❌ | Cette personne a déjà été bannie par le clan Uchiha !",
			noReason: "Aucune raison spécifiée",
			bannedSuccess: "✅ | %1 a été banni du groupe !",
			needAdmin: "⚠️ | Le Bot a besoin des privilèges Admin pour expulser les traîtres.",
			noName: "Utilisateur Facebook",
			noData: "📑 | Aucun membre n'est banni dans ce groupe pour le moment.",
			listBanned: "╭───── • 🍎 • ─────╮\n   LISTE NOIRE UCHIHA\n╰───── • 🍎 • ─────╯\n(Page %1/%2)",
			content: "⚡ %1/ %2 (%3)\n📝 Raison : %4\n📅 Date : %5\n\n",
			needAdminToKick: "⚠️ | Le membre %1 (%2) est banni, mais je n'ai pas les droits d'admin pour l'exclure.",
			bannedKick: "╭───── • 🍎 • ─────╮\n   INTRUSION DÉTECTÉE\n╰───── • 🍎 • ─────╯\n⚠️ %1 a tenté d'entrer alors qu'il est banni !\n🆔 UID : %2\n📝 Raison : %3\n📅 Date : %4\n\n⚡ Le Bot a automatiquement expulsé l'intrus."
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, usersData, api }) {
		const { members, adminIDs } = await threadsData.get(event.threadID);
		const { senderID } = event;
		const timeNow = moment.tz("Africa/Abidjan").format("HH:mm:ss DD/MM/YYYY");
		let target;
		let reason;

		const dataBanned = await threadsData.get(event.threadID, 'data.banned_ban', []);

		if (args[0] == 'unban') {
			if (!isNaN(args[1])) target = args[1];
			else if (args[1]?.startsWith('https')) target = await findUid(args[1]);
			else if (Object.keys(event.mentions || {}).length) target = Object.keys(event.mentions)[0];
			else if (event.messageReply?.senderID) target = event.messageReply.senderID;
			else return api.sendMessage(getLang('notFoundTargetUnban'), event.threadID, event.messageID);

			const index = dataBanned.findIndex(item => item.id == target);
			if (index == -1) return api.sendMessage(getLang('userNotBanned', target), event.threadID, event.messageID);

			dataBanned.splice(index, 1);
			await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');
			const userName = members[target]?.name || await usersData.getName(target) || getLang('noName');

			return api.sendMessage(getLang('unbannedSuccess', userName), event.threadID, event.messageID);
		}
		else if (args[0] == "check") {
			if (!dataBanned.length) return;
			for (const user of dataBanned) {
				if (event.participantIDs.includes(user.id)) api.removeUserFromGroup(user.id, event.threadID);
			}
			return message.reply("🌀 Scan terminé. Les membres bannis ont été expulsés.");
		}

		if (args[0] == 'list') {
			if (!dataBanned.length) return message.reply(getLang('noData'));
			const limit = 20;
			const page = parseInt(args[1] || 1) || 1;
			const start = (page - 1) * limit;
			const end = page * limit;
			const data = dataBanned.slice(start, end);
			let msg = '';
			let count = 0;
			for (const user of data) {
				count++;
				const name = members[user.id]?.name || await usersData.getName(user.id) || getLang('noName');
				msg += getLang('content', start + count, name, user.id, user.reason, user.time);
			}
			return message.reply(getLang('listBanned', page, Math.ceil(dataBanned.length / limit)) + '\n\n' + msg);
		}

		if (event.messageReply?.senderID) {
			target = event.messageReply.senderID;
			reason = args.join(' ');
		}
		else if (Object.keys(event.mentions || {}).length) {
			target = Object.keys(event.mentions)[0];
			reason = args.join(' ').replace(event.mentions[target], '');
		}
		else if (!isNaN(args[0])) {
			target = args[0];
			reason = args.slice(1).join(' ');
		}
		else if (args[0]?.startsWith('https')) {
			target = await findUid(args[0]);
			reason = args.slice(1).join(' ');
		}

		if (!target) return message.reply(getLang('notFoundTarget'));
		if (target == senderID) return message.reply(getLang('cantSelfBan'));
		if (adminIDs.includes(target)) return message.reply(getLang('cantBanAdmin'));

		const banned = dataBanned.find(item => item.id == target);
		if (banned) return message.reply(getLang('existedBan'));

		const name = members[target]?.name || (await usersData.getName(target)) || getLang('noName');
		const data = { id: target, time: timeNow, reason: reason || getLang('noReason') };

		dataBanned.push(data);
		await threadsData.set(event.threadID, dataBanned, 'data.banned_ban');

		const banMsg = 
`╔═══════ 🍎 ═══════╗
   ⚡ **BANISSEMENT** ⚡
╚═══════ 🍎 ═══════╝
✅ ${name} a été banni !
⏰ Heure : ${timeNow}
📝 Raison : ${data.reason}
●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●
🚀 Par : Camille 🤍
●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●`;

		message.reply(banMsg, () => {
			if (adminIDs.includes(api.getCurrentUserID())) {
				api.removeUserFromGroup(target, event.threadID);
			} else {
				message.reply(getLang('needAdmin'));
			}
		});
	},

	onEvent: async function ({ event, api, threadsData, getLang, message }) {
		if (event.logMessageType == "log:subscribe") {
			const { threadID } = event;
			const dataBanned = await threadsData.get(threadID, 'data.banned_ban', []);
			const usersAdded = event.logMessageData.addedParticipants;

			for (const user of usersAdded) {
				const { userFbId, fullName } = user;
				const banned = dataBanned.find(item => item.id == userFbId);
				if (banned) {
					api.removeUserFromGroup(userFbId, threadID, err => {
						if (err) message.send(getLang('needAdminToKick', fullName, userFbId));
						else message.send(getLang('bannedKick', fullName, userFbId, banned.reason, banned.time));
					});
				}
			}
		}
	}
};
				
