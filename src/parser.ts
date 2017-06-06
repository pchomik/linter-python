/** Module responsible to read, parse message returned by pylama application.
 This module should return also link to github page where all errors
 are available.*/
import { Logger } from './logger';
import { canRead } from './util';

const docUrl = 'https://github.com/pchomik/linter-python-doc/blob/master/errors/'

const genericRegexp = /(.*):(\d+):(\d+):\s(.\d+)\s*(.*)\[(.*)\]$/;  // file:row:col:error:message:tool
const pyflakesRegexp = /(.*):(\d+):(\d+):\s*(.*)\[(.*)\]$/;         // file:row:col:message:tool
const logger: Logger = Logger.getInstance();
const path = require('path');
const atomLinter = require('atom-linter');


export class MessageParser {

    parseLines(data) {
        logger.log("ADD PARSE LINES LOGS");
        let results = [];
        let lines = data.split(/(\r|\n|\r\n)/).filter(function(line) { return !!line.trim(); });
        for (let line of lines) {
            let found = line.match(genericRegexp);
            if (found) {
                logger.log("FOUND 1");
                logger.log(found);
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
                    logger.log("FOUND 2");
                    logger.log(found);
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
        logger.log("ALL RESULTS");
        for (let result of results)
          logger.log(result);
        return results;
    }

    buildMessage(textEditor, result, config) {
        logger.log(">>> ADD BUILD MESSAGE LOGS");
        logger.log(`> filename = ${result.fileName}`);
        logger.log(`> row = ${result.row}`);
        logger.log(`> col = ${result.col}`);
        logger.log(`> error = ${result.error}`);
        logger.log(`> message = ${result.message}`);
        logger.log(`> tool = ${result.tool}`);
        let line = textEditor.getBuffer().lineForRow(result.row - 1);
        logger.log(`> line = ${line}`);
        let filePath = textEditor.getPath();
        let resultType = 'Warning';

        if (result.error.indexOf('E') > -1 || result.error.indexOf('F') > -1) {
            resultType = 'Error';
        }

        let text = this.buildErrorText(result, config);
        logger.log(`> text = ${text}`);
        let range = atomLinter.rangeFromLineNumber(textEditor, result.row -1, result.col - 1);
        logger.log(`> range = ${range}`);
        let message = {
            type: resultType,
            html: text,
            filePath: filePath,
            range: range,
        };
        logger.log(">>> NEW MESSAGE <<");
        logger.log(`>     type = ${message.type}`);
        logger.log(`>     html = ${message.html}`);
        logger.log(`> filePath = ${message.filePath}`);
        logger.log(`>    range = ${message.range}`);
        logger.log(">>> END <<<");
        return message;
    }

    buildErrorText(result, config) {
        if (!result.tool) {
            return `${result.error} ${result.message}`;
        }
        else if(result.tool == 'mccabe') {
            return `${result.error} ${result.message} [${result.tool}]`;
        }
        else {
            return `<a href="${docUrl}${result.tool}.md#${result.error.toLowerCase()}" style="text-decoration: none; color: ${config.linkColor.toHexString()};">${result.error}</a> ${result.message} [${result.tool}]`;
        }
    }
}


export class SaveParameterParser {
    public parse(projectDir, filePath, config) {
        return {
            'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-f', 'pep8', filePath]),
            'projectDir': projectDir
        }
    }
}


export class OnFlyParameterParser {
    public parse(projectDir, filePath, config) {
        let pylama_options_file = path.join(projectDir, 'pylama.ini');
        projectDir = path.dirname(filePath);
        if (canRead(pylama_options_file)) {
            return {
                'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-o', pylama_options_file, '-f', 'pep8', filePath]),
                'projectDir': projectDir
            }
        } else {
            return {
                'args': config.pylamaArgs.concat(['--sort', 'E,W,D', '-f', 'pep8', filePath]),
                'projectDir': projectDir
            }
        }
    }
}
