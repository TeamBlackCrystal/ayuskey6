import { Injectable } from "@nestjs/common";
import { v4 as uuid } from 'uuid';
import { IActivity } from '../../../../../../built/remote/activitypub/type';
import { LdSignature } from '@ayuskey/shared';
import { ILocalUser, UserKeypair } from '@ayuskey/models';
import { ensure } from '@ayuskey/shared';
import { InjectRepository } from "@ayuskey/nestjs-typeorm";
import { Repository } from "typeorm";
import { config } from "src/const";

@Injectable()
export class RendererService {

    constructor(
        @InjectRepository(UserKeypair)
        private userKeyPairRepository: Repository<UserKeypair>
    ) {}
    
    renderActivity(x: any): IActivity | null {
        if (x == null) return null;
    
        if (x !== null && typeof x === 'object' && x.id == null) {
            x.id = `${config.url}/${uuid()}`;
        }
    
        return Object.assign({
            '@context': [
                'https://www.w3.org/ns/activitystreams',
                'https://w3id.org/security/v1',
                {
                    // as non-standards
                    manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
                    sensitive: 'as:sensitive',
                    Hashtag: 'as:Hashtag',
                    quoteUrl: 'as:quoteUrl',
                    // Mastodon
                    toot: 'http://joinmastodon.org/ns#',
                    Emoji: 'toot:Emoji',
                    featured: 'toot:featured',
                    discoverable: 'toot:discoverable',
                    // schema
                    schema: 'http://schema.org#',
                    PropertyValue: 'schema:PropertyValue',
                    value: 'schema:value',
                    // Misskey
                    misskey: 'https://misskey-hub.net/ns#',
                    '_misskey_content': 'misskey:_misskey_content',
                    '_misskey_quote': 'misskey:_misskey_quote',
                    '_misskey_reaction': 'misskey:_misskey_reaction',
                    '_misskey_votes': 'misskey:_misskey_votes',
                    '_misskey_talk': 'misskey:_misskey_talk',
                    'isCat': 'misskey:isCat',
                    // Ayuskey
                    ayuskey: `${config.url}/ns#`,
                    'isLady': 'ayuskey:isLady',
                    // vcard
                    vcard: 'http://www.w3.org/2006/vcard/ns#',
                },
            ],
        }, x);
    };
    
    async attachLdSignature(activity: any, user: ILocalUser): Promise<IActivity | null> {
        if (activity == null) return null;
    
        const keypair = await this.userKeyPairRepository.findOne({
            userId: user.id,
        }).then(ensure);
    
        const ldSignature = new LdSignature();
        ldSignature.debug = false;
        activity = await ldSignature.signRsaSignature2017(activity, keypair.privateKey, `${config.url}/users/${user.id}#main-key`);
    
        return activity;
    };
}