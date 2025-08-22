import { bpmList } from './bpmData';
import { spo2List } from './spo2Data';

export class GameData {

    private bpmList: bpmList;
    public get BpmList(): bpmList {
        return this.bpmList;
    }
    private spo2List: spo2List;
    public get Spo2List(): spo2List {
        return this.spo2List;
    }

    private didWin: boolean;
    public get DidWin(): boolean {
        return this.didWin;
    }
    private finalScore: number;
    public get FinalScore(): number {
        return this.finalScore;
    }
    private targetScore: number;
    public get TargetScore(): number {
        return this.targetScore;
    }
    private time: number;
    public get Time(): number {
        return this.time;
    }
    private date: Date;
    public get Date(): Date {
        return this.date;
    }

    public Serialize(): string {
        return JSON.stringify(this);
    }

    private constructor(bpmList: bpmList, spo2List: spo2List, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number) {
        this.bpmList = bpmList;
        this.spo2List = spo2List;
        this.didWin = didWin;
        this.finalScore = finalScore;
        this.time = time;
        this.date = date;
        this.targetScore = targetScore;
    }

    public static CreateFromJson(json: string): GameData {
        const data = JSON.parse(json);
        return new GameData(
            Object.assign(new bpmList(), data.bpmList),
            Object.assign(new spo2List(), data.spo2List),
            Object.assign(new Boolean(), data.didWin),
            Object.assign(new Number(), data.finalScore),
            Object.assign(new Number(), data.time),
            Object.assign(new Date(), data.date),
            Object.assign(new Number(), data.targetScore)
        );
    }

    public static CreateFromInput(bpmList: bpmList, spo2List: spo2List, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number): GameData {
        return new GameData(bpmList, spo2List, didWin, finalScore, time, date, targetScore);
    }

}
