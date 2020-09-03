import { UpdatedEntity } from "./updatedentity";

export class CashPile extends UpdatedEntity {
    Amount: number;
    ReceivedInTurn: number;

    public Start(): void {
        this.Amount = 0;
    }
    public Update(): void {
        this.ReceivedInTurn = 0;
    }

    public Has(amount: number): boolean {
        return this.Amount >= amount;
    }

    public Give(pile: CashPile, amount: number) {
        if (amount < 0) {
            this.ReceivedInTurn -= amount;
        }

        if (this.Has(amount)) {
            pile.Amount += amount;
            this.Amount -= amount;
        }
    }

    public Take(pile: CashPile, amount: number) {
        if (amount > 0) {
            this.ReceivedInTurn += amount;
        }
        if (pile.Has(amount)) {
            pile.Amount -= amount;
            this.Amount += amount;
        }
    }
}
