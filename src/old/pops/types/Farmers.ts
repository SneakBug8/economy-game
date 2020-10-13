import { Population } from "../population";
import { BasicNeeds } from "../behaviours/needs/BasicNeeds";
import { EverydayNeeds } from "../behaviours/needs/EverydayNeeds";
import { LuxuryNeeds } from "../behaviours/needs/LuxuryNeeds";
import { AllPopsNeeds } from "../behaviours/needs/AllPopsNeeds";
import { RGOBehaviour } from "../behaviours/RGOBehaviour";

export class Farmers extends Population {
    public Start(): void {
        this.BasicNeeds = new BasicNeeds(AllPopsNeeds.Farmers.Basic);
        this.EverydayNeeds = new EverydayNeeds(AllPopsNeeds.Farmers.Everyday);
        this.LuxuryNeeds = new LuxuryNeeds(AllPopsNeeds.Farmers.Luxury);

        this.Add(this.BasicNeeds);
        this.Add(this.EverydayNeeds);
        this.Add(this.LuxuryNeeds);

        this.Add(new RGOBehaviour());

        super.Start();
    }
}