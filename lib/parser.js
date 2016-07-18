"use strict";
/** Module responsible to read, parse message returned by pylama application.
 This module should return also link to github page where all errors
 are available.*/
var logger_1 = require('./logger');
var util_1 = require('./util');
var docUrl = 'https://github.com/pchomik/linter-python-doc/blob/master/errors/';
var genericRegexp = /(.*):(\d+):(\d+):\s(.\d+)\s*(.*)\[(.*)\]$/; // file:row:col:error:message:tool
var pyflakesRegexp = /(.*):(\d+):(\d+):\s*(.*)\[(.*)\]$/; // file:row:col:message:tool
var logger = logger_1.Logger.getInstance();
var path = require('path');
var atomLinter = require('atom-linter');
var MessageParser = (function () {
    function MessageParser() {
    }
    MessageParser.prototype.parseLines = function (data) {
        var results = [];
        var lines = data.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var found = line.match(genericRegexp);
            if (found) {
                results.push({
                    'fileName': found[1],
                    'row': Number(found[2]),
                    'col': Number(found[3]),
                    'error': found[4],
                    'message': found[5],
                    'tool': found[6]
                });
            }
            else {
                found = line.match(pyflakesRegexp);
                if (found) {
                    results.push({
                        'fileName': found[1],
                        'row': Number(found[2]),
                        'col': Number(found[3]),
                        'error': '',
                        'message': found[4],
                        'tool': found[5]
                    });
                }
            }
        }
        return results;
    };
    MessageParser.prototype.buildMessage = function (textEditor, result, config) {
        var line = textEditor.getBuffer().lineForRow(result.row - 1);
        var filePath = textEditor.getPath();
        var resultType = 'Warning';
        if (result.error.indexOf('E') > -1 || result.error.indexOf('F') > -1) {
            resultType = 'Error';
        }
        var text = this.buildErrorText(result, config);
        var range = atomLinter.rangeFromLineNumber(textEditor, result.row - 1, result.col - 1);
        var message = {
            type: resultType,
            html: text,
            filePath: filePath,
            range: range,
        };
        logger.log(">>> NEW MESSAGE <<");
        logger.log(">     type = " + message.type);
        logger.log(">     html = " + message.html);
        logger.log("> filePath = " + message.filePath);
        logger.log(">    range = " + message.range);
        logger.log(">>> END <<<");
        return message;
    };
    MessageParser.prototype.buildErrorText = function (result, config) {
        if (!result.tool) {
            return result.error + " " + result.message;
        }
        else if (result.tool == 'mccabe') {
            return result.error + " " + result.message + " [" + result.tool + "]";
        }
        else {
            return "<a href=\"" + docUrl + result.tool + ".md#" + result.error.toLowerCase() + "\" style=\"text-decoration: none; color: " + config.linkColor.toHexString() + ";\">" + result.error + "</a> " + result.message + " [" + result.tool + "]";
        }
    };
    return MessageParser;
}());
exports.MessageParser = MessageParser;
var SaveParameterParser = (function () {
    function SaveParameterParser() {
    }
    SaveParameterParser.prototype.parse = function (projectDir, filePath, config) {
        return {
            'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-f', 'pep8', filePath]),
            'projectDir': projectDir
        };
    };
    return SaveParameterParser;
}());
exports.SaveParameterParser = SaveParameterParser;
var OnFlyParameterParser = (function () {
    function OnFlyParameterParser() {
    }
    OnFlyParameterParser.prototype.parse = function (projectDir, filePath, config) {
        var pylama_options_file = path.join(projectDir, 'pylama.ini');
        projectDir = path.dirname(filePath);
        if (util_1.canRead(pylama_options_file)) {
            return {
                'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-o', pylama_options_file, '-f', 'pep8', filePath]),
                'projectDir': projectDir
            };
        }
        else {
            return {
                'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-f', 'pep8', filePath]),
                'projectDir': projectDir
            };
        }
    };
    return OnFlyParameterParser;
}());
exports.OnFlyParameterParser = OnFlyParameterParser;
//# sourceMappingURL=parser.js.map