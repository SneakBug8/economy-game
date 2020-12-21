import { Factory } from "entity/Factory";
import { Currency } from "entity/finances/Currency";
import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import { ICurrencyRecord, IMedianCashRecord, IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Turn } from "entity/Turn";
import * as express from "express";
import { toUnicode } from "punycode";
import { MarketService } from "services/MarketService";
import { PopulationActivityService } from "services/PopulationActivityService";
import { StateActivityService } from "services/StateActivityService";
import { TurnsService } from "services/TurnsService";
import { Logger } from "utility/Logger";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class StatisticsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.get("/", this.onHome);
        router.get("/inflation", this.OnInflation);
        router.get("/workers", this.OnWorkers);
        // router.get("/cashglobal", this.OnCash);
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

        const inflationdata: Array<{
            title: string,
            description: string,
            data: Array<{
                label: string,
                data: number[],
                borderColor: string,
            }> | string,
        }> = [];

        const labels = [];

        for (const market of await Market.All()) {
            const stateplayerid = StateActivityService.PlayersMap.get(market.id);

            if (!stateplayerid) {
                continue;
            }

            const currency = await Market.GetCashGood(market.id);

            if (!currency) {
                continue;
            }

            const currencystats = await Statistics.GetWithPlayerAndType<ICurrencyRecord>
                (stateplayerid,
                    StatisticsTypes.CurrencyRecord);

            const inflabsolute = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const inflrelative = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const totalamount = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const goldreserve = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const goldratio = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const backing = {
                label: (currency && currency.name) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            for (const entry of currencystats) {
                labels.push(entry.turnId);
                inflabsolute.data.push(entry.Value.inflation);
                inflrelative.data.push(entry.Value.inflation / entry.Value.totalamount);
                totalamount.data.push(entry.Value.totalamount);
                goldreserve.data.push(entry.Value.goldreserve);
                goldratio.data.push(entry.Value.goldExchangeRate);
                backing.data.push((entry.Value.goldreserve * entry.Value.goldExchangeRate * 100) / (entry.Value.totalamount || 1));
            }

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Inflation (absolute)" || "State",
                    description: "Инфляция в абсолютных значениях.",
                    data: JSON.stringify([inflabsolute]),
                },
            );

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Inflation (relative)" || "State",
                    description: "Инфляция в процентах от общего объёма валюты.",
                    data: JSON.stringify([inflrelative]),
                },
            );

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Total supply" || "State",
                    description: "Общий объём валюты (Money Supply).",
                    data: JSON.stringify([totalamount]),
                },
            );

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Gold reserve" || "State",
                    description: "Золотовалютный запас страны обеспечивает привязку стоимости валюты к золоту.",
                    data: JSON.stringify([goldreserve]),
                },
            );

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Gold to currency ratio" || "State",
                    description: "Золотой эквивалент единицы валюты. Меняется лишь государством.",
                    data: JSON.stringify([goldratio]),
                },
            );

            inflationdata.push(
                {
                    title: (currency && currency.name) + ": Gold backing" || "State",
                    description: "Процент валюты, обеспеченной золотом.",
                    data: JSON.stringify([backing]),
                },
            );
        }

        WebClientUtil.render(req, res, "statistics/inflation", {
            data: inflationdata,
            labels: JSON.stringify(labels)
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
        const labels = [];


        const markets: Array<{
            title: string,
            data: Array<{
                label: string,
                data: number[],
                borderColor: string,
            }> | string,
        }> = [];

        for (let turnid = TurnsService.CurrentTurn.id - 90;
            turnid < TurnsService.CurrentTurn.id;
            turnid++) {
            labels.push(turnid);
        }

        for (const market of await Market.All()) {
            const r1 = await StateActivityService.GetPlayer(market.id);
            if (!r1.result) {
                Logger.warn(r1.toString());
            }
            const stateplayer = r1.data;
            const r2 = await PopulationActivityService.GetPlayer(market.id);
            if (!r2.result) {
                Logger.warn(r1.toString());
            }
            const popplayer = r2.data;

            const state = {
                label: (stateplayer && stateplayer.username) || "State",
                borderColor: market.govtColor || "red",
                data: [],
            };

            const pop = {
                label: (popplayer && popplayer.username) || "Population",
                borderColor: market.popColor || "blue",
                data: [],
            };

            const statemarket = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>
                (stateplayer.id,
                    StatisticsTypes.PlayerRecord);

            const popmarket = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>
                (popplayer.id,
                    StatisticsTypes.PlayerRecord);

            for (let turnid = TurnsService.CurrentTurn.id - 90;
                turnid < TurnsService.CurrentTurn.id;
                turnid++) {

                const statestat = statemarket && statemarket.find((x) => x.turnId === turnid);
                if (statestat) {
                    state.data.push(statestat.Value.cash);
                }
                else {
                    state.data.push(0);
                }

                const popstat = popmarket && popmarket.find((x) => x.turnId === turnid);
                if (popstat) {
                    pop.data.push(popstat.Value.cash);
                }
                else {
                    pop.data.push(0);
                }
            }

            markets.push({
                title: market.name,
                data: JSON.stringify([state, pop]),
            });
        }

        WebClientUtil.render(req, res, "statistics/country", {
            markets,
            labels: JSON.stringify(labels),
        });
    }

    public static async OnOwnCash(req: IMyRequest, res: express.Response)
    {
        const cashdata: Array<{
            title: string,
            description: string,
            data: Array<{
                label: string,
                data: number[],
            }> | string,
        }> = [];

        const labels = [];

        for (let i = TurnsService.CurrentTurn.id - 90; i < TurnsService.CurrentTurn.id; i++) {
            if (i < 0) { continue; }
            labels.push(i);
        }

        for (const currency of await Currency.All()) {

            const Stats = await Statistics.GetWithPlayerAndType<IPlayerStatisticsRecord>(
                req.client.playerId,
                StatisticsTypes.PlayerRecord,
            );

            const cash = {
                label: (currency && currency.name),
                data: [],
            };

            for (let i = TurnsService.CurrentTurn.id - 90; i < TurnsService.CurrentTurn.id; i++) {
                if (i < 0) { continue; }

                const entry = Stats.find((x) => x.turnId === i && x.Value.goodId === currency.goodId);

                if (!entry) {
                    cash.data.push(0);
                }
                else {
                    cash.data.push(entry.Value.cash);
                }
            }

            cashdata.push(
                {
                    title: (currency && currency.name) || "State",
                    description: "",
                    data: JSON.stringify([cash]),
                },
            );
        }

        WebClientUtil.render(req, res, "statistics/cash", {
            data: cashdata,
            labels: JSON.stringify(labels)
        });
    }
}
