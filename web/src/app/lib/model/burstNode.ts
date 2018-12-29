export class BurstNode {
    public name: string;
    public region: string;
    public location: string;
    public address: string;
    public port = -1;
    public selected = false;
    public ping = -1;

    public constructor(data: any = {}) {
        this.name = data.name;
        this.region = data.region;
        this.location = data.location || undefined;
        this.address = data.address || undefined;
        this.port = data.port || -1;
        this.selected = data.selected || false;
        this.ping = data.ping || -1;
    }

    public toUrl(suffix = '/burst'): string {
        return this.address + ':' + this.port + suffix;
    }

}
