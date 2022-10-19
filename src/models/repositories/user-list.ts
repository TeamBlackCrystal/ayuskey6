import { EntityRepository, Repository } from 'typeorm';
import { UserList } from '@ayuskey/models';
import { ensure } from '@ayuskey/shared';
import { UserListJoinings } from '..';
import { Packed } from '../../misc/schema';

@EntityRepository(UserList)
export class UserListRepository extends Repository<UserList> {
	public async pack(
		src: UserList['id'] | UserList,
	): Promise<Packed<'UserList'>> {
		const userList = typeof src === 'object' ? src : await this.findOne(src).then(ensure);

		const users = await UserListJoinings.find({
			userListId: userList.id,
		});

		return {
			id: userList.id,
			createdAt: userList.createdAt.toISOString(),
			name: userList.name,
			userIds: users.map(x => x.userId),
		};
	}
}

export const packedUserListSchema = {
	type: 'object' as const,
	optional: false as const, nullable: false as const,
	properties: {
		id: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'id',
			description: 'The unique identifier for this UserList.',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			format: 'date-time',
			description: 'The date that the UserList was created.',
		},
		name: {
			type: 'string' as const,
			optional: false as const, nullable: false as const,
			description: 'The name of the UserList.',
		},
		userIds: {
			type: 'array' as const,
			nullable: false as const, optional: true as const,
			items: {
				type: 'string' as const,
				nullable: false as const, optional: false as const,
				format: 'id',
			},
		},
	},
};
