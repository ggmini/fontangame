import { GameViewComponent } from "../game-view/game-view.component";

export interface Mission {
    
    IsCompleted: boolean;
    gameView: GameViewComponent;
    Reward: number;

    checkCompletion(): void;


}