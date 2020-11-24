import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import { PlayerProfitPerGood } from "entity/PlayerProfitPerGood";
import * as express from "express";
import { LeaderboardService } from "services/LeaderboardService";
import { PlayerService } from "services/PlayerService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";
import { WebClientRouter } from "./WebClientRouter";

export class MarketsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => WebClientUtil.LoadPlayerData(req, res, next));

        router.get("/move", [WebClientUtil.RedirectUnlogined], this.onMove);
        router.get("/move/:id([0-9]+)", [WebClientUtil.RedirectUnlogined], this.onMoveAction);

        return router;
    }

    public static async onMove(req: IMyRequest, res: express.Response)
    {
        console.log(req.url);

        const markets = await Market.All();
        WebClientUtil.render(req, res, "markets/list", { markets });
    }

    public static async onMoveAction(req: IMyRequest, res: express.Response)
    {
        const marketid = Number.parseInt(req.params.id, 10);

        const answ = await PlayerService.MoveBetweenMarkets(req.client.playerId, marketid);

        if (typeof answ !== "boolean") {
            WebClientUtil.error(req, res, answ as string);
            return true;
        }

        req.client.infoToShow = "Moved successfully";
        res.redirect(req.baseUrl + "/move");
    }
}
