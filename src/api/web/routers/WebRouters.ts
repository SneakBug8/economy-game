import * as express from "express";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";
import { LeaderboardsRouter } from "./LeaderboardsRouter";
import { WebAPIRouter } from "./WebAPIRouter";
import { WebClientRouter } from "./WebClientRouter";

export class WebRouters
{
    public static Init(app: express.Express)
    {
        app.use("/leaderboard", LeaderboardsRouter.GetRouter());
        app.use(WebClientRouter.GetRouter());
        app.use(this.on404);

        // app.use("/api", WebAPIRouter.GetRouter());
    }

    public static on404(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "404", {}, false);
    }
}
