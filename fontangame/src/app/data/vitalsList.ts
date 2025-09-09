import { VitalsUnit } from "./vitalsUnit";

/**
 * Lists all vitals data snapshots for an exercise
 */
export class VitalsList {

    private list: VitalsUnit[] = []; //Stores all vitals data snapshots

    /**
     * Gets all vitals data snapshots
     * @returns All vitals data snapshots
     */
    public GetAll(): VitalsUnit[] {
        return this.list;
    }

    /**
     * Gets a specific vitals data snapshot by time
     * @param time The time of the vitals data snapshot in seconds
     * @returns The vitals data snapshot or null if not found
     */
    public Get(time: number): VitalsUnit | null {
        return this.list.find(vital => vital.Time === time) || null;
    }

    /**
     * Adds a vitals data snapshot to the list
     * @param vital The vitals data snapshot to add
     */
    public Add(vital: VitalsUnit): void {
        this.list.push(vital);
    }

    /**
     * Calculates the average BPM from all vitals data snapshots (excludes null values)
     * @returns The average BPM
     */
    public GetAvgBpm(): number {
        let total = 0;
        let count = 0;
        for(const vital of this.list) {
            const bpm = vital.Bpm;
            if(bpm !== null) {
                total += bpm;
                count++;
            }
        }
        return count > 0 ? total / count : 0;
    }

    /**
     * Calculates the average SpO2 from all vitals data snapshots (excludes null values)
     * @returns The average SpO2
     */
    public GetAvgSpo2(): number {
        let total = 0;
        let count = 0;
        for(const vital of this.list) {
            const spo2 = vital.Spo2;
            if(spo2 !== null) {
                total += spo2;
                count++;
            }
        }
        return count > 0 ? total / count : 0;
    }

    /**
     * Serializes the vitals data snapshots to a JSON string, to be used for saving
     * @returns The JSON string representation of the vitals data snapshots
     */
    public Serialize(): string {
        return JSON.stringify(this.list);
    }

}