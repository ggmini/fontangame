import { Mission } from "./mission";
import { GameViewComponent } from "../game-view/game-view.component";

export class NoPauseMission implements Mission {

    private isCompleted = true;
    public get IsCompleted(): boolean {
        return this.isCompleted;
    }

    gameView: GameViewComponent;
    readonly Reward = 200;

    constructor(gameView: GameViewComponent) {
        this.gameView = gameView;
    }

    checkCompletion() {
        if (this.gameView.GamePaused || this.gameView.WasPausedDuringLastTick) { //if the game is paused, the mission will be markes as failed with no way to recover
            this.isCompleted = false;
            this.gameView.RemoveActiveMission(this);
        }
    }

}