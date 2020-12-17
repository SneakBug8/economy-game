import { IGoodsBucket } from "entity/interfaces/IGoodsBucket";
import { Storage } from "entity/Storage";

export class GoodsBucketService {
    public static async HasResources(marketId: number, playerId: number, bucket: IGoodsBucket) {
        for (const entry of bucket) {
            if (! await Storage.Has(marketId, playerId, entry[0], entry[1])) {
                return false;
            }
        }

        return true;
    }
}