/** Module to handle process execution. */
import { Logger } from './logger';
import { MessageParser } from './parser';
import { Cache } from './cache';

const cp = require('child-process-es6-promise');
const logger:Logger = Logger.getInstance();
const cache:Cache = Cache.getInstance();

declare var atom;

/** Class to execute process and return read output. */
export class ProcessRunner {

    parser: MessageParser;

    constructor() {
        this.parser = new MessageParser();
    }
    run(textEditor, config, projectDir, cmd, args, runningFlag, tempFile) {
        return new Promise((resolve) => {
            let messages = []
            cp.spawn(cmd, args, {cwd: projectDir})
            .then((result) => {
                // Pylama's exit code is 0 when there are no linting errors.
                logger.log(">>> NO ERRORS <<<");
                logger.log(">>> RAW OUTPUT <<<");
                logger.log(result.stdout);
                logger.log(">>> END <<<");
                return resolve(messages);
            })
            .catch((error) => {
                // Pylama's exit code is 1 when there are linting errors.
                logger.log(">>> RAW OUTPUT <<<");
                logger.log(error.stdout);
                logger.log(">>> END <<<");
                let parsedLines = this.parser.parseLines(error.stdout);
                for (let parsedLine of parsedLines) {
                    let message = this.parser.buildMessage(textEditor, parsedLine, config);
                    messages.unshift(message);
                }
                runningFlag = false;
                if(tempFile) {
                    tempFile.clean();
                }
                cache.store(messages);
                return resolve(messages);
            });
        })
    }
}
