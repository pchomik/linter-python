"use strict";
/** Module to handle process execution. */
var logger_1 = require('./logger');
var parser_1 = require('./parser');
var cache_1 = require('./cache');
var cp = require('child-process-es6-promise');
var logger = logger_1.Logger.getInstance();
var cache = cache_1.Cache.getInstance();
/** Class to execute process and return read output. */
var ProcessRunner = (function () {
    function ProcessRunner() {
        this.parser = new parser_1.MessageParser();
    }
    ProcessRunner.prototype.run = function (textEditor, config, projectDir, cmd, args, runningFlag, tempFile) {
        var _this = this;
        return new Promise(function (resolve) {
            var messages = [];
            cp.spawn(cmd, args, { cwd: projectDir })
                .then(function (result) {
                // Pylama's exit code is 0 when there are no linting errors.
                logger.log(">>> NO ERRORS <<<");
                logger.log(">>> RAW OUTPUT <<<");
                logger.log(result.stdout);
                logger.log(">>> END <<<");
                return resolve(messages);
            })
                .catch(function (error) {
                // Pylama's exit code is 1 when there are linting errors.
                logger.log(">>> RAW OUTPUT <<<");
                logger.log(error.stdout);
                logger.log(">>> END <<<");
                var parsedLines = _this.parser.parseLines(error.stdout);
                for (var _i = 0, parsedLines_1 = parsedLines; _i < parsedLines_1.length; _i++) {
                    var parsedLine = parsedLines_1[_i];
                    var message = _this.parser.buildMessage(textEditor, parsedLine, config);
                    messages.unshift(message);
                }
                runningFlag = false;
                if (tempFile) {
                    tempFile.clean();
                }
                cache.store(messages);
                return resolve(messages);
            });
        });
    };
    return ProcessRunner;
}());
exports.ProcessRunner = ProcessRunner;
//# sourceMappingURL=runner.js.map