import { Factory } from "entity/Factory";
import { IMedianCashRecord, IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Turn } from "entity/Turn";
import * as express from "express";
import { toUnicode } from "punycode";
import { PopulationActivityService } from "services/PopulationActivityService";
import { StateActivityService } from "services/StateActivityService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class StatisticsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => WebClientUtil.LoadPlayerData(req, res, next));

        router.get("/", this.onHome);
        router.get("/inflation", this.OnInflation);
        router.get("/workers", this.OnWorkers);
        router.get("/cashglobal", this.OnCash);
        router.get("/country", this.OnCountry);
        router.get("/cash", [WebClientUtil.RedirectUnlogined], this.OnOwnCash);

        return router;
    }

    public static async onHome(req: IMyRequest, res: express.Response)
    {
        WebClientUtil.render(req, res, "statistics/home");
    }

    public static async OnInflation(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const props = [];
        const labels = [];
        const relative = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            props.push(turn.freecash || 0);
            relative.push((turn.freecash || 0) * 100 / (turn.totalcash || 1));
        }

        WebClientUtil.render(req, res, "statistics/inflation", {
            data: JSON.stringify(props),
            labels: JSON.stringify(labels),
            relative: JSON.stringify(relative),
        });
    }

    public static async OnCash(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const cashperplayer = [];
        const labels = [];
        const totalcash = [];
        const mediancash = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            cashperplayer.push(turn.cashperplayer || 0);
            totalcash.push(turn.totalcash || 0);

            const median = await Statistics.GetWithPlayerAndTurnAndType<IMedianCashRecord>(null,
                turn.id, StatisticsTypes.MedianCashRecord);

            mediancash.push(median && median.Value.cash || 0);
        }

        WebClientUtil.render(req, res, "statistics/cashglobal", {
            cashperplayer: JSON.stringify(cashperplayer),
            totalcash: JSON.stringify(totalcash),
            mediancash: JSON.stringify(mediancash),
            labels: JSON.stringify(labels),
        });
    }

    public static async OnWorkers(req: IMyRequest, res: express.Response)
    {
        const data = await Turn.All();

        const average = [];
        const median = [];
        const total = [];
        const labels = [];

        for (const turn of data) {
            labels.push(turn.id + "");
            average.push(turn.averageworkers || 0);
            median.push(turn.medianworkers || 0);
            total.push(turn.totalworkers || 0);
        }

        WebClientUtil.render(req, res, "statistics/workers", {
            total: JSON.stringify(total),
            average: JSON.stringify(average),
            median: JSON.stringify(median),
            labels: JSON.stringify(labels),
        });
    }

    public static async OnCountry(req: IMyRequest, res: express.Response)
    {
        const state = [];
        const population = [];
        const labels = [];

        const statestats = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>
            (StateActivityService.Player.id,
                StatisticsTypes.PlayerRecord);

        const popstats = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>
            (PopulationActivityService.Player.id,
                StatisticsTypes.PlayerRecord);

        let i = 0;
        for (const states of statestats) {
            labels.push(states.turnId + "");

            state.push(popstats[i].Value.cash);
            population.push(states.Value.cash);
            i++;
        }

        WebClientUtil.render(req, res, "statistics/country", {
            population: JSON.stringify(population),
            state: JSON.stringify(state),
            labels: JSON.stringify(labels),
        });
    }

    public static async OnOwnCash(req: IMyRequest, res: express.Response)
    {
        const cash = [];
        const labels = [];

        const stats = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>
            (req.client.playerId,
                StatisticsTypes.PlayerRecord);

        for (const s of stats) {
            labels.push(s.turnId + "");
            cash.push(s.Value.cash);
        }

        WebClientUtil.render(req, res, "statistics/cash", {
            cash: JSON.stringify(cash),
            labels: JSON.stringify(labels),
        });
    }
}
