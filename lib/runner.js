"use strict";
/** Module to handle process execution. */
var logger_1 = require('./logger');
var parser_1 = require('./parser');
var cp = require('child-process-es6-promise');
var logger = logger_1.Logger.getInstance();
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
                logger.log(">>> Raw output \n " + result.stdout);
                var parsedLines = _this.parser.parseLines(result.stdout);
                for (var _i = 0, parsedLines_1 = parsedLines; _i < parsedLines_1.length; _i++) {
                    var parsedLine = parsedLines_1[_i];
                    var message = _this.parser.buildMessage(textEditor, parsedLine, config);
                    messages.unshift(message);
                }
                runningFlag = false;
                if (tempFile) {
                    tempFile.clean();
                }
                return resolve(messages);
            })
                .catch(function (error) {
                atom.notifications.addError("Execution finished with error:\n\n" + error);
                logger.log(">>> Execution error: \n " + error);
                runningFlag = false;
                if (tempFile) {
                    tempFile.clean();
                }
                return resolve(null);
            });
        });
    };
    return ProcessRunner;
}());
exports.ProcessRunner = ProcessRunner;
//# sourceMappingURL=runner.js.map