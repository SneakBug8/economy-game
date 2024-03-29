import { Good } from "entity/Good";
import { Player } from "entity/Player";
import { PlayerProfitPerGood } from "entity/PlayerProfitPerGood";
import * as express from "express";
import { LeaderboardService } from "services/LeaderboardService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";
import { WebClientRouter } from "./WebClientRouter";

export class LeaderboardsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.get("/", this.onLeaderboard);
        router.get("/cash", this.onLeaderboardRichest);
        router.get("/factoryworkers", this.onLeaderboardFactoryWorkers);
        router.get("/rgoworkers", this.onLeaderboardRGOWorkers);
        router.get("/profit",  this.onLeaderboardProfit);
        router.get("/ppg", [WebClientUtil.LoadGoods], this.onLeaderboardPPGs);
        router.get("/ppg/:id([0-9]+)", this.onLeaderboardPPG);

        return router;
    }

    public static async onLeaderboard(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "leaderboards/home");
    }

    public static async onLeaderboardRichest(req: IMyRequest, res: express.Response)
    {
        const data = await LeaderboardService.GetRichestPlayers();

        let i = 1;
        for (const entry of data) {
            (entry as any).order = i;
            i++;
        }

        WebClientUtil.render(req, res, "leaderboards/richest", {
            data,
        });
    }

    public static async onLeaderboardRGOWorkers(req: IMyRequest, res: express.Response)
    {
        let data = await LeaderboardService.GetMostRGOWorkers();
        data = data.filter(x => Player.IsPlayable(x.playerId));

        const props = [];
        let i = 0;
        for (const entry of data) {
            i++;
            const player = await Player.GetById(entry.playerId);
            props.push({
                order: i,
                player,
                workers: entry.c,
            });
        }

        WebClientUtil.render(req, res, "leaderboards/rgoworkers", {
            data: props,
        });
    }

    public static async onLeaderboardFactoryWorkers(req: IMyRequest, res: express.Response)
    {
        const data = await LeaderboardService.GetMostFactoryWorkers();

        let i = 0;
        const props = [];
        for (const entry of data) {
            i++;
            const r1 = await Player.GetById(entry.playerId);
            if (!r1.result) {
                return WebClientUtil.error(req, res, r1.message);
            }
            const player = r1.data;

            if (!Player.IsPlayable(player.id)) {
                continue;
            }

            props.push({
                order: i,
                player,
                workers: entry.c,
            });
        }

        WebClientUtil.render(req, res, "leaderboards/factoryworkers", {
            data: props,
        });
    }

    public static async onLeaderboardPPGs(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "leaderboards/profitpergoods");
    }

    public static async onLeaderboardPPG(req: IMyRequest, res: express.Response)
    {
        const id = Number.parseInt(req.params.id, 10);
        let data = await PlayerProfitPerGood.GetWithGood(id);
        data = data.filter(x => Player.IsPlayable(x.playerId));
        const good = await Good.GetById(id);

        for (const entry of data) {
            const player = await Player.GetById(entry.playerId);
            (entry as any).player = player;
        }

        WebClientUtil.render(req, res, "leaderboards/profitpergood", { data, good });
    }

    public static async onLeaderboardProfit(req: IMyRequest, res: express.Response)
    {
        let data = await PlayerProfitPerGood.GetProfits();
        data = data.filter(x => Player.IsPlayable(x.playerId));

        for (const entry of data) {
            const player = await Player.GetById(entry.playerId);
            (entry as any).player = player;
        }

        WebClientUtil.render(req, res, "leaderboards/profit", { data });
    }
}
