import { Connection, getConnection } from "typeorm";
import { Instance } from "@/models/entities/instance";
import { Instance as v13Instance } from "@/v13/models";
import { createPagination } from "./common";
import { instanceQueue } from "./jobqueue";

export async function migrateInstance(instanceId: string) {
	const originalDb = getConnection();
	const nextDb = getConnection("nextDb");
	const instanceRepository = nextDb.getRepository(v13Instance);
	const originalInstanceRepository = originalDb.getRepository(Instance);

	const checkExists = await instanceRepository.findOne({
		where: { id: instanceId },
	});

	if (checkExists) return;
	const instance = await originalInstanceRepository.findOne({
		where: { id: instanceId },
	});

	if (!instance) throw new Error(`instance: ${instanceId}`);
	await instanceRepository.save({
		id: instance.id,
		host: instance.host,
		usersCount: instance.usersCount,
		notesCount: instance.notesCount,
		followingCount: instance.followingCount,
		followersCount: instance.followersCount,
		latestRequestReceivedAt: instance.latestRequestReceivedAt,
		isNotResponding: instance.isNotResponding,
		isSuspended: instance.isSuspended,
		softwareName: instance.softwareName,
		softwareVersion: instance.softwareVersion,
		openRegistrations: instance.openRegistrations,
		name: instance.name,
		description: instance.description,
		maintainerName: instance.maintainerName,
		maintainerEmail: instance.maintainerEmail,
		iconUrl: instance.iconUrl,
		faviconUrl: instance.faviconUrl,
		themeColor: instance.themeColor,
		infoUpdatedAt: instance.infoUpdatedAt,
		firstRetrievedAt: new Date(), // 現行のAyuskeyに存在しない為実行した日時を入れる
	});
	console.log(`instance: ${instanceId} の移行が完了しました`);
}

export async function migrateInstances(
	originalDb: Connection,
	nextDb: Connection
) {
	const pagination = await createPagination(originalDb, Instance);

	while (true) {
		const instances = await pagination.next();
		for (const instance of instances) {
			instanceQueue.add({instanceId: instance.id});
		}
		if (instances.length < 100) break; // 100以下になったら止める
	}
}
