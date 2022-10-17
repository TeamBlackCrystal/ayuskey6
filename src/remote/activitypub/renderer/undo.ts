import config from '../../../config';
import { ILocalUser, User } from '@ayuskey/models';

export default (object: any, user: ILocalUser | User) => {
	if (object == null) return null;

	return {
		type: 'Undo',
		actor: `${config.url}/users/${user.id}`,
		object,
		published: new Date().toISOString(),
	};
};
