import * as express from "express";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";
import { LeaderboardsRouter } from "./LeaderboardsRouter";
import { MarketsRouter } from "./MarketsRouter";
import { StatisticsRouter } from "./StatisticsRouter";
import { WebAPIRouter } from "./WebAPIRouter";
import { WebClientRouter } from "./WebClientRouter";

export class WebRouters
{
    public static Init(app: express.Express)
    {
        app.use(WebClientUtil.LoadPlayerData);
        app.use(WebClientUtil.FillPlayercardData);

        app.use("/leaderboard", LeaderboardsRouter.GetRouter());
        app.use("/markets", MarketsRouter.GetRouter());
        app.use("/statistics", StatisticsRouter.GetRouter());

        app.use(WebClientRouter.GetRouter());

        app.use(this.on404);

        // app.use("/api", WebAPIRouter.GetRouter());
    }

    public static on404(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "404", {}, false);
    }
}
