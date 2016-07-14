/** Module to handle process execution. */
import { Logger } from './logger';
import { MessageParser } from './parser';

const cp = require('child-process-es6-promise');
const logger:Logger = Logger.getInstance();

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
                logger.log(">>> RAW OUTPUT <<<");
                logger.log(result.stdout);
                logger.log(">>> END <<<");
                let parsedLines = this.parser.parseLines(result.stdout);
                for (let parsedLine of parsedLines) {
                    let message = this.parser.buildMessage(textEditor, parsedLine, config);
                    messages.unshift(message);
                }
                runningFlag = false;
                if(tempFile) {
                    tempFile.clean();
                }
                return resolve(messages);
            })
            .catch((error) => {
                atom.notifications.addError(`Execution finished with error:\n\n${error}`);
                logger.log(">>> EXECUTION ERROR <<<");
                logger.log(error);
                logger.log(">>> END <<<");
                runningFlag = false;
                if(tempFile) {
                    tempFile.clean();
                }
                return resolve([]);
            });
        })
    }
}
