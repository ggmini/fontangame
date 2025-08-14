export class spo2List {
    
    private list: spo2Unit[] = [];

    public Add(spo2: spo2Unit): void {
        this.list.push(spo2);
    }

    public GetAll(): spo2Unit[] {
        return this.list;
    }

    public GetAvgSpo2(): number {
        const total = this.list.reduce((sum, unit) => sum + unit.Spo2, 0);
        return total / this.list.length || 0;
    }

    public Serialize(): string {
        return JSON.stringify(this.list);
    }
}

export class spo2Unit {
    
    public get Time(): number {
        return this.time;
    }
    public get Spo2(): number {
        return this.spo2;
    }
    public get Paused(): boolean {
        return this.paused;
    }

    constructor(private time: number, private spo2: number, private paused: boolean) {}
}