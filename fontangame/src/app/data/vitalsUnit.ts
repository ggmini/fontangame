/**
 * Snapshot containing vitals data for a specific second of the exercise
 */
export class VitalsUnit {

    /**
     * Time of Vitals Snapshot in seconds
     */
    public get Time(): number {
        return this.time;
    }

    /**
     * Returns time in the format M:SS
     */
    public get TimeString(): string {
        const min = Math.floor(this.time / 60);
        const sec = this.time - (min * 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`; //make sure the seconds are always two digits
    }

    /**
     * Heart Rate in BPM (null if not available)
     */
    public get Bpm(): number | null {
        return this.bpm;
    }

    /**
     * Blood Oxygen Level (null if not available)
     */
    public get Spo2(): number | null {
        return this.spo2;
    }

    /**
     * Whether the exercise was paused at this time
     */
    public get Paused(): boolean {
        return this.paused;
    }

    constructor(private time: number, private bpm: number | null, private spo2: number | null, private paused: boolean) {}

}