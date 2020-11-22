import * as express from "express";
import { WebClient } from "./WebClient";
import { WebRouters } from "./routers/WebRouters";

export class WebAPI
{
    public static clients = new Array<WebClient>();

    public static Init(app: express.Express)
    {
        WebRouters.Init(app);
    }
}