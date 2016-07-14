"use strict";
var logger_1 = require('./logger');
var temp = require('temp');
var fs = require('fs');
var logger = logger_1.Logger.getInstance();
var TempFileHandler = (function () {
    function TempFileHandler() {
    }
    TempFileHandler.prototype.create = function (TextEditor) {
        var tempFile = temp.openSync({ suffix: '.py' });
        fs.writeSync(tempFile.fd, TextEditor.getText());
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
    try {
        fs.accessSync(path, fs.R_OK | fs.X_OK);
        logger.log(">>> EXECUTE CHECK <<<");
        logger.log("> Path can be executed");
        logger.log(">>> END <<<");
        return true;
    }
    catch (err) {
        logger.log(">>> EXECUTE CHECK <<<");
        logger.log("> Path can not be executed:");
        logger.log(err);
        logger.log(">>> END <<<");
        return false;
    }
}
exports.canExecute = canExecute;
function canRead(path) {
    try {
        fs.accessSync(path, fs.R_OK);
        logger.log(">>> READ CHECK <<<");
        logger.log(">>> Path can be read");
        return true;
    }
    catch (err) {
        logger.log(">>> READ CHECK <<<");
        logger.log("> Path can not be read");
        logger.log(err);
        return false;
    }
}
exports.canRead = canRead;
function calculateUnderlineRange(line, rowNumber, colNumber, config) {
    if (!line) {
        return [[rowNumber - 1, 0], [rowNumber - 1, 0]];
    }
    if (config.underlineType == "Whole line" || colNumber === 0) {
        return [[rowNumber - 1, 0], [rowNumber - 1, line.length]];
    }
    var startCol = colNumber - config.underlineSize >= 0 ? colNumber - config.underlineSize : 0;
    var endCol = colNumber + config.underlineSize <= line.length ? colNumber + config.underlineSize : line.length;
    return [[rowNumber - 1, startCol], [rowNumber - 1, endCol]];
}
exports.calculateUnderlineRange = calculateUnderlineRange;
//# sourceMappingURL=util.js.map