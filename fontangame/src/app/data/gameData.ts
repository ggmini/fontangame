import { VitalsList } from './vitalsList';
import { VitalsUnit } from './vitalsUnit';

export class GameData {

    private fileName: string;
    public get FileName(): string {
        return this.fileName;
    }

    private vitalsList: VitalsList;
    public get VitalsList(): VitalsList {
        return this.vitalsList;
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

    private constructor(vitalsList: VitalsList, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number, fileName: string) {
        this.vitalsList = vitalsList;
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
        //I hate the json implementation in Angular/TypeScript...this stuff is necessary so these things work like the proper objects they are
        const vitalsJson = Object.assign(new VitalsList(), data.vitalsList);
        const vitalsData = new VitalsList();
        vitalsJson.GetAll().forEach((element: VitalsUnit) => {
            element = Object.assign(new VitalsUnit(0, 0, 0, false), element);
            vitalsData.Add(element);
        });

        return new GameData(
            vitalsData,
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
    public static CreateFromInput(vitalsList: VitalsList, didWin: boolean, finalScore: number, time: number, date: Date, targetScore: number, fileName: string): GameData {
        return new GameData(vitalsList, didWin, finalScore, time, date, targetScore, fileName);
    }

    /**
     * Creates a simple GameData Object for Testing Purposes; Not for final use
     * @returns A GameData object containing some data
     */
    public static CreateTestData(): GameData {
        const vitalsList: VitalsList = new VitalsList();
        vitalsList.Add(new VitalsUnit(1, 100, 96, false));
        vitalsList.Add(new VitalsUnit(2, 110, 95, false));
        vitalsList.Add(new VitalsUnit(3, 120, 97, true));
        vitalsList.Add(new VitalsUnit(4, 115, 98, true));
        vitalsList.Add(new VitalsUnit(5, 108, 97, true));
        vitalsList.Add(new VitalsUnit(6, 125, 95, true));
        vitalsList.Add(new VitalsUnit(7, 130, 94, true));
        vitalsList.Add(new VitalsUnit(8, 105, 96, false));
        vitalsList.Add(new VitalsUnit(9, 112, 95, false));
        vitalsList.Add(new VitalsUnit(10, 118, 94, false));
        const date = new Date();

        return new GameData(
            vitalsList,
            true,
            143,
            10,
            date,
            100,
            `gamedata_${date.toISOString()}`
        );
    }

}
