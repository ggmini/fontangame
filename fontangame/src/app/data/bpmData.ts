export class bpmList {
    
    private list: bpmUnit[] = [];

    public Add(bpm: bpmUnit): void {
        this.list.push(bpm);
    }

    public GetAll(): bpmUnit[] {
        return this.list;
    }

    public GetAvgBpm(): number {
        const total = this.list.reduce((sum, unit) => sum + unit.Bpm, 0);
        return total / this.list.length || 0;
    }

    public Serialize(): string {
        return JSON.stringify(this.list);
    }
}

export class bpmUnit {

    public get Time(): number {
        return this.time;
    }

    public get Bpm(): number {
        return this.bpm;
    }

    public get Paused(): boolean {
        return this.paused;
    }

    constructor(private time: number, private bpm: number, private paused: boolean) {}
}