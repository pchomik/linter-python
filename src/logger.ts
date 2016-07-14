/** Module to log debug prints if debug prints are enabled */

export class Logger {

    private static _instance:Logger = new Logger();

    private _enabled:boolean = false;

    constructor() {
        if(Logger._instance){
            throw new Error("Error: Instantiation failed: Use Logger.getInstance() instead of new.");
        }
        Logger._instance = this;
    }

    public static getInstance():Logger
    {
        return Logger._instance;
    }

    public enableLogger() {
        if (!this._enabled) {
            this._enabled = true;
            console.log(">>> DEBUG ENABLED <<<");
        }
    }

    public disableLogger() {
        if (this._enabled) {
            this._enabled = false;
            console.log(">>> DEBUG DISABLED <<<");
        }
    }

    public log(message) {
        if (this._enabled) {
            console.log(message);
        }
    }
}
