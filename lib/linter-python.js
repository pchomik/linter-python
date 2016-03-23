'use babel';

const LinterConfig = require('./linter-config.js');

const cp = require('child-process-es6-promise');
const genericRegexp = /(.*):(\d+):(\d+):\s(.\d+)\s*(.*)/;
const pyflakesRegexp = /(.*):(\d+):(\d+):\s*(.*)/;

const fs = require('fs');
const temp = require('temp');
const path = require('path');


class LinterPython {

    constructor() {
        temp.track();

        this.lastMessages = [];

        this.lint = this.lint.bind(this);
        this.buildMessage = this.buildMessage.bind(this);
        this.createUnderlineRange = this.createUnderlineRange.bind(this);

        this.config = new LinterConfig();
        this.config.initialPlugin();
    }

    lint(textEditor) {
        return new Promise ((resolve, reject) => {
            let buff = [];
            let args = [];
            let messages = [];
            let projectDir = "";
            let cmd = this.config.executablePath;

            // Return if lintOnFly is not allowed
            if (textEditor.isModified() && !this.config.lintOnFly) {
                resolve(this.lastMessages);
                return;
            }

            // Return if lintOnSave is not allowed
            else if (!textEditor.isModified() && !this.config.lintOnSave) {
                resolve(this.lastMessages);
                return;
            }

            // Set parameters for lintOnFly
            else if (textEditor.isModified() && this.config.lintOnFly) {
                tempFile = this.createTempFile(textEditor.getText());
                projectDir = path.dirname(tempFile.path);
                let pylama_options_file = path.join(atom.project.relativizePath(textEditor.getPath())[0], 'pylama.ini');
                if (!this.config.optionsFileSet && this.canRead(pylama_options_file)) {
                    args = this.config.pylamaArgs.concat(['-o', pylama_options_file, '-f', 'pep8', tempFile.path]);
                }
                else {
                    args = this.config.pylamaArgs.concat(['-f', 'pep8', tempFile.path]);
                }
            }

            // Set parameters for lintOnSave
            else if (!textEditor.isModified() && this.config.lintOnSave) {
                args = this.config.pylamaArgs.concat(['-f', 'pep8', textEditor.getPath()]);
                projectDir = atom.project.relativizePath(textEditor.getPath())[0];
            }

            // Return if path is wrong
            if (!this.canExecute(cmd)) {
                atom.notifications.addError("Provided path doesn't exist.\n\n" + cmd + "\n\nPlease fix pylama path.");
                resolve(this.lastMessages);
                return;
            }

            console.log("[Linter-Python] Command: " + cmd);
            console.log("[Linter-Python] Arguments: " + args);

            cp.spawn(cmd, args, {cwd: projectDir})
                .then((result) => {
                    console.log("[Linter-Python] Raw output \n " + result.stdout);
                    results = this.parseLines(result.stdout);
                    console.log("[Linter-Python] Output: \n " + results);

                    for (result of results) {
                        if (result) {
                            message = this.buildMessage(textEditor, result);
                            messages.push(message);
                        }
                    }
                    this.lastMessages = messages.sort((a, b) => {
                        return this.sortBy('type', a, b);
                    });
                    this.cleanTempFiles();
                    resolve(this.lastMessages);
                })
                .catch((error) => {
                    atom.notifications.addError("Execution finished with error:\n\n" + error);
                    console.log("[Linter-Python] Execution error: \n " + error);
                    this.cleanTempFiles();
                    resolve(this.lastMessages);
                });
        });
    }

    createTempFile(text) {
        let tempFile = temp.openSync({suffix: '.py'});
        fs.writeSync(tempFile.fd, text);
        fs.closeSync(tempFile.fd);
        return tempFile;
    }

    cleanTempFiles() {
        temp.cleanupSync();
    }

    canExecute(path) {
        try {
            fs.accessSync(path, fs.R_OK | fs.X_OK);
            console.log("[Linter-Python] Pylama path looks ok.");
            return true;
        }
        catch(err) {
            console.log("[Linter-Python] There is a problem with pylama path: \n " + err);
            return false;
        }
    }

    canRead(path) {
        try {
            fs.accessSync(path, fs.R_OK);
            console.log("[Linter-Python] File looks ok.");
            return true;
        }
        catch(err) {
            console.log("[Linter-Python] There is a problem with file path: \n " + err);
            return false;
        }
    }

    parseLines(data) {
        let results = [];
        let lines = data.split('\n');
        for (let line of lines) {
            found = line.match(genericRegexp);
            if (found) {
                results.push(found);
            }
            else {
                found = line.match(pyflakesRegexp);
                if (found) {
                    results.push(found);
                }
            }
        }
        return results;
    }

    sortBy(key, a, b) {
        if (a[key] == 'Error' && b[key] == 'Warning') {
            return -1;
        }
        if (a[key] == 'Warning' && b[key] == 'Error') {
            return 1;
        }
        return 0;
    }

    buildMessage(textEditor, result) {
        let line = textEditor.getBuffer().lineForRow(result[2] - 1);
        let resultType = 'Warning';

        if (result[4].indexOf('E') > -1 || result[4].indexOf('F') > -1) {
            resultType = 'Error';
        }

        text = result.length > 5 ? result[4] + ' ' + result[5] : result[4];
        range = this.createUnderlineRange(line, parseInt(result[2]), parseInt(result[3]));
        console.log("[Linter-Python] New message: \n    type: " + resultType + "\n    text: " + text + "\n    filePath: " + textEditor.getPath() + "\n    range: " + range);
        return {
            type: resultType,
            text: text,
            filePath: textEditor.getPath(),
            range: range,
        };
    }

    createUnderlineRange(line, rowNumber, colNumber) {
        if (!line) {
            return [[rowNumber - 1 , 0], [rowNumber - 1, 0]];
        }
        if (this.config.underlineType == "Whole line" || colNumber === 0) {
            return [[rowNumber - 1, 0],[rowNumber - 1, line.length]];
        }

        startCol = colNumber - this.config.underlineSize >= 0 ? colNumber - this.config.underlineSize : 0;
        endCol = colNumber  + this.config.underlineSize <= line.length ? colNumber + this.config.underlineSize : line.length;
        return [[rowNumber - 1, startCol],[rowNumber - 1, endCol]];
    }
}

module.exports = LinterPython;
