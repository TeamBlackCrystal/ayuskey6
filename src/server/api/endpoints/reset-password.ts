import $ from 'cafy';
import * as bcrypt from 'bcryptjs';
import define from '../define';
import { Users, UserProfiles, PasswordResetRequests } from '../../../models';

export const meta = {
	desc: {
		'ja-JP': 'パスワードのリセットを行います。',
	},

	tags: ['reset password'],

	requireCredential: false as const,

	params: {
		token: {
			validator: $.str.min(1)
		},

		password: {
			validator: $.str.min(1)
		}
	},

	errors: {
	}
};

export default define(meta, async (ps, user) => {
	const req = await PasswordResetRequests.findOneOrFail({
		token: ps.token,
	});

	if (req == null) {
		throw new Error(); // TODO
	}

	// 発行してから30分以上経過していたら無効
	if (Date.now() - req.createdAt.getTime() > 1000 * 60 * 30) {
		throw new Error(); // TODO
	}

	// Generate hash of password
	const salt = await bcrypt.genSalt(8);
	const hash = await bcrypt.hash(ps.password, salt);

  await UserProfiles.update(req.userId, {
		password: hash
	});

	PasswordResetRequests.delete(req.id);
});
