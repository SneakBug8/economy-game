import { Good } from "entity/Good";
import * as express from "express";
import { RecipesService } from "services/RecipesService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class InfoPagesRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => WebClientUtil.LoadPlayerData(req, res, next));

        router.get("/good/:id([0-9]+)", this.onGoodSingle);

        return router;
    }

    public static async onGoodSingle(req: IMyRequest, res: express.Response)
    {
        const goodId = Number.parseInt(req.params.id, 10);
        const good = await Good.GetById(goodId);

        if (!good) {
            WebClientUtil.error(req, res, "No such good");
            return;
        }

        const recipes = RecipesService.GetWithGood(good.id);

        WebClientUtil.render(req, res, "good", {
            good,
            recipes,
        });
    }
}
