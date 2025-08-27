import { bpmList, bpmUnit } from './bpmData';
import { spo2List, spo2Unit } from './spo2Data';

export class GameData {

    private fileName: string;
    public get FileName(): string {
        return this.fileName;
    }

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

    private constructor(bpmList: bpmList, spo2List: spo2List, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number, fileName: string) {
        this.bpmList = bpmList;
        this.spo2List = spo2List;
        this.didWin = didWin;
        this.finalScore = finalScore;
        this.time = time;
        this.date = date;
        this.targetScore = targetScore;
        this.fileName = fileName;
    }

    public static CreateFromJson(json: string): GameData {
        const data = JSON.parse(json);
        console.log(data);
        //I hate the json implementation in angular...this stuff is necessary so these things work like the proper objects they are
        const bpmJson = Object.assign(new bpmList(), data.bpmList);
        const bpmData = new bpmList();
        bpmJson.GetAll().forEach((element: any) => {
            element = Object.assign(new bpmUnit(0, 0, false), element);
            bpmData.Add(element);
        });
        //and again for spo2 data
        const spo2Json = Object.assign(new spo2List(), data.spo2List);
        const spo2Data = new spo2List();
        spo2Json.GetAll().forEach((element: any) => {
            element = Object.assign(new spo2Unit(0, 0, false), element);
            spo2Data.Add(element);
        });
        return new GameData(
            bpmData,
            spo2Data,
            data.didWin,
            data.finalScore,
            data.time,
            new Date(data.date),
            data.targetScore,
            data.fileName
        );
    } 

    public static CreateFromInput(bpmList: bpmList, spo2List: spo2List, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number, fileName: string): GameData {
        return new GameData(bpmList, spo2List, didWin, finalScore, time, date, targetScore, fileName);
    }

    public static CreateTestData(): GameData {
        const BpmList: bpmList = new bpmList();
        BpmList.Add(new bpmUnit(1, 100, false));
        BpmList.Add(new bpmUnit(2, 110, false));
        BpmList.Add(new bpmUnit(3, 120, false));
        const Spo2List: spo2List = new spo2List();
        Spo2List.Add(new spo2Unit(1, 96, false));
        Spo2List.Add(new spo2Unit(2, 96, false));
        Spo2List.Add(new spo2Unit(3, 97, false));
        const date = new Date();

        return new GameData(
            BpmList,
            Spo2List,
            false,
            30,
            10,
            date,
            100,
            `gamedata_${date.toISOString()}`
        )
    }

}
