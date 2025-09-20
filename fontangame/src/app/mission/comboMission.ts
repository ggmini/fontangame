import { Mission } from "./mission";
import { GameViewComponent } from "../game-view/game-view.component";

export class ComboMission implements Mission {
    
    private isCompleted = false;
    /** Whether the mission is completed or not */
    public get IsCompleted(): boolean {
        return this.isCompleted;
    }

    private comboCounter = 0;
    /** The current combo count */
    public get ComboCounter(): number {
        return this.comboCounter;
    }

    /** The target BPM for the combo */
    public get ComboTarget(): number {
        return this.comboTarget;
    }

    /** The time (in s) the target BPM has to be held */
    public get ComboTime(): number {
        return this.comboTime;
    }

    /** The Point Reward for completing the mission */
    public readonly Reward = 200;

    constructor(private comboTarget: number, private comboTime: number, private gameView: GameViewComponent) { }

    /** Tick logic to check for mission completion */
    public checkCompletion() {
        if (this.gameView.CurBpm >= this.comboTarget && this.gameView.TimeSinceLastUpdate < 3 && !this.gameView.GamePaused) { //If the user is above the target bpm and the readings are still active
            this.comboCounter++; //Increase the combo counter
        } else {
            this.comboCounter = 0; //Else reset the combo counter
        }
        if (this.comboCounter >= this.comboTime) { //If the required combo has been reached mark as completed and remove the mission from the tick cycle
            this.isCompleted = true;
            this.gameView.RemoveActiveMission(this);
        }
    }
}