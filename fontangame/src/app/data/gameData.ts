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

    /**
     * Creates a new GameData object from the JSON string; to be used when reading from storage
     * @param json The JSON string to parse
     * @returns A GameData object constructed from the JSON string
     */
    public static CreateFromJson(json: string): GameData {
        const data = JSON.parse(json);
        console.log(data);
        //I hate the json implementation in Angular/TypeScript...this stuff is necessary so these things work like the proper objects they are
        const bpmJson = Object.assign(new bpmList(), data.bpmList);
        const bpmData = new bpmList();
        bpmJson.GetAll().forEach((element: bpmUnit) => {
            element = Object.assign(new bpmUnit(0, 0, false), element);
            bpmData.Add(element);
        });
        //and again for spo2 data
        const spo2Json = Object.assign(new spo2List(), data.spo2List);
        const spo2Data = new spo2List();
        spo2Json.GetAll().forEach((element: spo2Unit) => {
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

    /**
     * Creates a new GameData object from the input parameters
     * @param bpmList The list of BPM data
     * @param spo2List The list of SpO2 data
     * @param didWin Whether the player won the game
     * @param finalScore The final score of the game
     * @param time The time spent in that session
     * @param date The date when the game was played
     * @param targetScore The target score for that game
     * @param fileName Filename for the Save Data
     * @returns A new GameData object
     */
    public static CreateFromInput(bpmList: bpmList, spo2List: spo2List, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number, fileName: string): GameData {
        return new GameData(bpmList, spo2List, didWin, finalScore, time, date, targetScore, fileName);
    }

    /**
     * Creates a simple GameData Object for Testing
     * @returns A GameData object containing some data
     */
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
        );
    }

}
