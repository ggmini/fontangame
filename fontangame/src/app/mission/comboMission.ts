import { Mission } from "./mission";
import { GameViewComponent } from "../game-view/game-view.component";

export class ComboMission implements Mission {
    
    private isCompleted = false;
    public get IsCompleted(): boolean {
        return this.isCompleted;
    }

    private comboCounter = 0;
    public get ComboCounter(): number {
        return this.comboCounter;
    }

    public get ComboTarget(): number {
        return this.comboTarget;
    }

    public get ComboTime(): number {
        return this.comboTime;
    }

    gameView: GameViewComponent;

    readonly Reward = 200;

    constructor(private comboTarget: number, private comboTime: number, gameView: GameViewComponent) {
        this.gameView = gameView;
    }

    checkCompletion() {
        if (this.gameView.curBpm >= this.comboTarget && this.gameView.TimeSinceLastUpdate < 3 && !this.gameView.GamePaused) { // if the user is above the target bpm and the readings are still active
            this.comboCounter++;
        } else {
            this.comboCounter = 0;
        }
        if (this.comboCounter >= this.comboTime) { //if the required combo has been reached complete the mission with no way to fail it afterwards
            this.isCompleted = true;
            this.gameView.RemoveActiveMission(this);
        }
    }
}