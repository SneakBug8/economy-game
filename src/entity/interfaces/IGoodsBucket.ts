import { MapToObject } from "utility/MapToObject";

export type IGoodsBucket = Map<number, number>;

export class GoodsBucketHelpers {
    public static Serialize(bucket: IGoodsBucket) {
        return JSON.stringify(MapToObject.Convert(bucket));
    }

    public static Deserialize(json: string) {
        return new Map(JSON.parse(json)) as IGoodsBucket;
    }
}