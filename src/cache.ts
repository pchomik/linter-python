import { Logger } from './logger';


const logger:Logger = Logger.getInstance();


export class Cache {
    private static _instance:Cache = new Cache();

    private messages:any = {};
    private filePointer: string;

    constructor() {
        if(Cache._instance){
            throw new Error("Error: Instantiation failed: Use Logger.getInstance() instead of new.");
        }
        Cache._instance = this;
    }

    public static getInstance():Cache
    {
        return Cache._instance;
    }

    public store(messages) {
        logger.log(">>> NEW MESSAGES STORED IN CACHE <<<");
        this.messages[this.filePointer] = messages;
    }

    public get() {
        logger.log(">>> MESSAGES RETURNED FROM CACHE <<<");
        if (!this.messages[this.filePointer]) {
            return [];
        } else {
            return this.messages[this.filePointer];
        }
    }

    public set(filePath) {
        this.filePointer = filePath;
        logger.log(`>>> CACHE SET FOR ${this.filePointer} <<<`);
    }
}
