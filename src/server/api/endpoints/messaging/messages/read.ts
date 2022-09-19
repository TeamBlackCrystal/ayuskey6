import $ from 'cafy';
import { ID } from '../../../../../misc/cafy-id';
import define from '../../../define';
import { ApiError } from '../../../error';
import { MessagingMessages } from '../../../../../models';
import { readUserMessagingMessage, readGroupMessagingMessage } from '../../../common/read-messaging-message';

export const meta = {
	desc: {
		'ja-JP': '指定した自分宛てのトークメッセージを既読にします。',
		'en-US': 'Mark as read a message of messaging.',
	},

	tags: ['messaging'],

	requireCredential: true,

	kind: 'write:messaging',

	params: {
		messageId: {
			validator: $.type(ID),
			desc: {
				'ja-JP': '既読にするメッセージのID',
				'en-US': 'The ID of a message that you want to mark as read',
			},
		},
	},

	errors: {
		noSuchMessage: {
			message: 'No such message.',
			code: 'NO_SUCH_MESSAGE',
			id: '86d56a2f-a9c3-4afb-b13c-3e9bfef9aa14',
		},
	},
};

export default define(meta, async (ps, user) => {
	const message = await MessagingMessages.findOne({
		id: ps.messageId,
	});

	if (message == null) {
		throw new ApiError(meta.errors.noSuchMessage);
	}

	if (message.recipientId) {
		await readUserMessagingMessage(user.id, message.recipientId, [message.id]).catch(e => {
			if (e.id === 'e140a4bf-49ce-4fb6-b67c-b78dadf6b52f') throw new ApiError(meta.errors.noSuchMessage);
			throw e;
		});
	} else if (message.groupId) {
		await readGroupMessagingMessage(user.id, message.groupId, [message.id]).catch(e => {
			if (e.id === '930a270c-714a-46b2-b776-ad27276dc569') throw new ApiError(meta.errors.noSuchMessage);
			throw e;
		});
	}
});
