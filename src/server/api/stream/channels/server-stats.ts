import autobind from 'autobind-decorator';
import Xev from '@ayuskey/xev';
import Channel from '../channel';

const ev = new Xev();

export default class extends Channel {
	public readonly chName = 'serverStats';
	public static shouldShare = true;
	public static requireCredential = false;

	@autobind
	public async init(params: any) {
		ev.addListener('serverStats', this.onStats);
	}

	@autobind
	private onStats(stats: any) {
		this.send('stats', stats);
	}

	@autobind
	public onMessage(type: string, body: any) {
		switch (type) {
			case 'requestLog':
				ev.once(`serverStatsLog:${body.id}`, statsLog => {
					this.send('statsLog', statsLog);
				});
				ev.emit('requestServerStatsLog', {
					id: body.id,
					length: body.length
				});
				break;
		}
	}

	@autobind
	public dispose() {
		ev.removeListener('serverStats', this.onStats);
	}
}
