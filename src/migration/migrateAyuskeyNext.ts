import { createConnection } from "typeorm";
import { initDb } from "../db/postgre";

import { AyuskeyNextEntities } from "@/v13/models";

import config from "@/config";

import { migrateMeta } from "./meta";
import { migrateUsedUsernames } from "./UsedUsername";

import { migrateUsers } from "./user";
import { migrateRelaies } from "./Relay";
import { migrateApps } from "./App";
import { migrateAbuseUserReports } from "./AbuseUserReport";
import { migrateRegistryItems } from "./RegistryItem";
import { migrateUserLists } from "./UserList";
import { migrateSwSubscriptions } from "./SwSubscription";
import { migratePolls } from "./Poll";
import { migrateUserListJoinings } from "./UserListJoining";
import { migrateAnnouncements } from "./Announcement";
import { migrateInstances } from "./instance";
import { migrateHashtags } from "./hashtag";
import { logger } from "./common";

async function main(): Promise<any> {
	const originalDb = await initDb();
	const nextDb = await createConnection({
		name: "nextDb",
		type: "postgres",
		host: config.db.nextDb.host,
		port: config.db.nextDb.port,
		username: config.db.nextDb.user,
		password: config.db.nextDb.pass,
		database: config.db.nextDb.db,
		entities: AyuskeyNextEntities,
	});

	await migrateAnnouncements();
	await migrateRelaies(originalDb, nextDb);
	await migrateUsedUsernames(originalDb, nextDb);
	await migrateMeta(originalDb, nextDb); // 並列するまでもない

	await migrateInstances(originalDb, nextDb);
	await migrateHashtags(originalDb, nextDb);
	await migrateUserLists(originalDb, nextDb);
	await migrateUserListJoinings();
	await migrateRegistryItems(originalDb, nextDb);
	await migrateAbuseUserReports(originalDb, nextDb);
	await migrateApps(originalDb, nextDb);
	await migratePolls();
	await migrateSwSubscriptions();
	await migrateUsers(originalDb, nextDb);

	logger.succ("ジョブの登録が完了しました")

}

main().catch((e) => {
	console.warn(e);
	process.exit(1);
});
