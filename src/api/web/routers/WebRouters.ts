import * as express from "express";
import { WebAPIRouter } from "./WebAPIRouter";
import { WebClientRouter } from "./WebClientRouter";

export class WebRouters
{
    public static Init(app: express.Express)
    {
        app.use(WebClientRouter.GetRouter());
        // app.use("/api", WebAPIRouter.GetRouter());
    }
}
