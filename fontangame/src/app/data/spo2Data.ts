export class spo2List {
    
    private list: spo2Unit[] = [];

    public Add(spo2: spo2Unit): void {
        this.list.push(spo2);
    }

    public GetAll(): spo2Unit[] {
        return this.list;
    }

    public GetAvgSpo2(): number {
        let total = 0;
        this.list.forEach(element => {
            if(element.Spo2 != null)
                total += element.Spo2;
        });
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
    public get TimeString(): string {
        const min = Math.floor(this.time / 60);
        const sec = this.time - (min * 60);
        if (sec < 10) 
            return `${min}:0${sec}`; //make sure the seconds are always two digits
        return `${min}:${sec}`;
    }

    public get Spo2(): number | null {
        return this.spo2;
    }
    
    public get Paused(): boolean {
        return this.paused;
    }

    constructor(private time: number, private spo2: number | null, private paused: boolean) {}
}