"use strict";
var logger_1 = require('./logger');
var temp = require('temp');
var fs = require('fs');
var logger = logger_1.Logger.getInstance();
var TempFileHandler = (function () {
    function TempFileHandler() {
    }
    TempFileHandler.prototype.create = function (text) {
        var tempFile = temp.openSync({ suffix: '.py' });
        fs.writeSync(tempFile.fd, text);
        fs.closeSync(tempFile.fd);
        return new TempFileWrapper(tempFile);
    };
    return TempFileHandler;
}());
exports.TempFileHandler = TempFileHandler;
var TempFileWrapper = (function () {
    function TempFileWrapper(tempFile) {
        this.tempFile = tempFile;
        this.path = tempFile.path;
    }
    TempFileWrapper.prototype.clean = function () {
        if (this.tempFile == null) {
            return;
        }
        fs.unlink(this.path);
        this.path = null;
        this.tempFile = null;
    };
    return TempFileWrapper;
}());
exports.TempFileWrapper = TempFileWrapper;
function canExecute(path) {
    logger.log(">>> EXECUTE CHECK <<<");
    try {
        fs.accessSync(path, fs.R_OK | fs.X_OK);
        logger.log("> Path can be executed");
        logger.log(">>> END <<<");
        return true;
    }
    catch (err) {
        logger.log("> Path can not be executed:");
        logger.log(err);
        logger.log(">>> END <<<");
        return false;
    }
}
exports.canExecute = canExecute;
function canRead(path) {
    logger.log(">>> READ CHECK <<<");
    try {
        fs.accessSync(path, fs.R_OK);
        logger.log("> Path can be read");
        logger.log(">>> END <<<");
        return true;
    }
    catch (err) {
        logger.log("> Path can not be read");
        logger.log(err);
        logger.log(">>> END <<<");
        return false;
    }
}
exports.canRead = canRead;
//# sourceMappingURL=util.js.map