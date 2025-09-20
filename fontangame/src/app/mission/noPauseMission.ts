import { Mission } from "./mission";
import { GameViewComponent } from "../game-view/game-view.component";

export class NoPauseMission implements Mission {

    private isCompleted = true;
    /** Whether the mission is completed or failed */
    public get IsCompleted(): boolean {
        return this.isCompleted;
    }

    /** The Point Reward for completing the mission */
    public readonly Reward = 200;

    constructor(private gameView: GameViewComponent) { }

    /** Tick logic to check for mission completion */
    public checkCompletion() {
        if (this.gameView.GamePaused || this.gameView.WasPausedDuringLastTick) { //If the game is paused, the mission will be markes as not completed and removed from the tick cycle
            this.isCompleted = false;
            this.gameView.RemoveActiveMission(this);
        }
    }

}