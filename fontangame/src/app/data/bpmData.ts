export class bpmList {
    
    private list: bpmUnit[] = [];

    public Add(bpm: bpmUnit): void {
        this.list.push(bpm);
    }

    public GetAll(): bpmUnit[] {
        return this.list;
    }

    public GetAvgBpm(): number {
        let total = 0;
        this.list.forEach(element => {
            if(element.Bpm != null)
                total += element.Bpm;
        });
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

    public get Bpm(): number | null {
        return this.bpm;
    }

    public get Paused(): boolean {
        return this.paused;
    }

    constructor(private time: number, private bpm: number | null, private paused: boolean) {}
}