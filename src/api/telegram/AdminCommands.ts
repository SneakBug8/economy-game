import { Runner } from "Runner";
import { State } from "./State";

class AdminState extends State {
    constructor()
    {
        super();

        this.functions = [
            this.OnTurn,
        ];
    }

    public async OnTurn(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/turn 123456");
        if (registerregex.test(message)) {

            Runner.Turn();

            return true;
        }

        return false;
    }
}

export const AdminCommands = new AdminState();