import { Connection } from "DB";

export class Good
{
    id: number;
    name: string;
    image: string;

    public async GetById(id: number) : Promise<void> {
        const res = GoodRepository.select().where("id", id);

        console.log(res);
    }
}

export const GoodRepository = Connection("Goods");