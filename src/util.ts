import { Logger } from './logger';

const temp = require('temp');
const fs = require('fs');
const logger:Logger = Logger.getInstance();


export class TempFileHandler {
    track: any;

    create(text) {
        let tempFile = temp.openSync({suffix: '.py'});
        fs.writeSync(tempFile.fd, text);
        fs.closeSync(tempFile.fd);
        return new TempFileWrapper(tempFile);
    }
}


export class TempFileWrapper {
    tempFile: any;
    path: String;

    constructor(tempFile) {
        this.tempFile = tempFile;
        this.path = tempFile.path;
    }

    clean() {
        if (this.tempFile == null) {
            return;
        }
        fs.unlink(this.path);
        this.path = null;
        this.tempFile = null;
    }


}


export function canExecute(path) {
    logger.log(">>> EXECUTE CHECK <<<");
    try {
        fs.accessSync(path, fs.R_OK | fs.X_OK);
        logger.log("> Path can be executed");
        logger.log(">>> END <<<");
        return true;
    }
    catch(err) {
        logger.log("> Path can not be executed:");
        logger.log(err);
        logger.log(">>> END <<<");
        return false;
    }
}


export function canRead(path) {
    logger.log(">>> READ CHECK <<<");
    try {
        fs.accessSync(path, fs.R_OK);
        logger.log("> Path can be read");
        logger.log(">>> END <<<")
        return true;
    }
    catch(err) {
        logger.log("> Path can not be read");
        logger.log(err);
        logger.log(">>> END <<<")
        return false;
    }
}


export function calculateUnderlineRange(line, rowNumber, colNumber, config) {
    if (!line) {
        return [[rowNumber - 1 , 0], [rowNumber - 1, 0]];
    }
    if (config.underlineType == "Whole line" || colNumber === 0) {
        return [[rowNumber - 1, 0],[rowNumber - 1, line.length]];
    }

    let startCol = colNumber - config.underlineSize >= 0 ? colNumber - config.underlineSize : 0;
    let endCol = colNumber  + config.underlineSize <= line.length ? colNumber + config.underlineSize : line.length;
    return [[rowNumber - 1, startCol],[rowNumber - 1, endCol]];
}
