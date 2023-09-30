import { logger } from "./common";
import { noteQueue } from "./jobqueue";
import noteProcessor from "./processor/note.processor";

const cluster = require('cluster');

async function main() {
	const numWorkers = 32;

	if (cluster.isPrimary) {
		for (let i = 0; i < numWorkers; i++) {
			cluster.fork();
		}
		cluster.on("exit", (worker: any, code :any, signal:any) => {
			console.log(`worker ${worker.process.pid} died`);
		});
	} else {


		noteQueue.process(noteProcessor);
		noteQueue.on("completed", (job) => {
			logger.succ(`Note: ${job.data.note.id} の処理が完了しました`);
		});
	}
}

main().catch((e) => {
	console.warn(e);
	process.exit(1);
});
