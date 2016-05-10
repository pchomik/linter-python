'use babel';

const LinterConfig = require('./linter-config.js');

const cp = require('child-process-es6-promise');
const genericRegexp = /(.*):(\d+):(\d+):\s(.\d+)\s*(.*)/;
const pyflakesRegexp = /(.*):(\d+):(\d+):\s*(.*)/;
const partitionRegexp = /(\w):\\\\(.*)/;

const fs = require('fs');
const os = require('os');
const temp = require('temp');
const path = require('path');


class LinterPython {

    constructor() {
        temp.track();

        this.running = false;

        this.lint = this.lint.bind(this);
        this.buildMessage = this.buildMessage.bind(this);
        this.createUnderlineRange = this.createUnderlineRange.bind(this);

        this.config = new LinterConfig();
        this.config.initialPlugin();
    }

    lint(textEditor) {
        let filePath = textEditor.getPath();
        let projectDir = this.calculateProjectDir(atom.project.relativizePath(textEditor.getPath())[0], filePath);
        let cmd = this.config.executablePath;
        let args = [];

        // Return if lintOnFly is not allowed
        if (textEditor.isModified() && !this.config.lintOnFly) {
            return Promise.resolve(null);
        }

        // Return if lintOnSave is not allowed
        else if (!textEditor.isModified() && !this.config.lintOnSave) {
            return Promise.resolve(null);
        }

        // Return if path is wrong
        if (!this.canExecute(cmd) && !this.config.linuxOnWindows) {
            atom.notifications.addError("Provided path doesn't exist.\n\n" + cmd + "\n\nPlease fix pylama path.");
            return Promise.resolve(null);
        }

        // Set parameters for lintOnFly
        if (textEditor.isModified() && this.config.lintOnFly) {
            tempFile = this.createTempFile(textEditor.getText());
            let pylama_options_file = path.join(projectDir, 'pylama.ini');
            projectDir = this.mapPath(path.dirname(tempFile.path), this.config.linuxOnWindows);
            if (!this.config.optionsFileSet && this.canRead(pylama_options_file)) {
                tempFilePath = this.mapPath(tempFile.path, linuxOnWindows);
                args = this.config.pylamaArgs.concat(['-o', pylama_options_file, '-f', 'pep8', tempFilePath]);
                if (!tempFilePath) {
                    atom.notifications.addError("Cannot translate path from Windows to Linux. Please check if linuxOnWindows is unselected.");
                    return Promise.resolve(null);
                }
            }
            else {
                tempFilePath = this.mapPath(tempFile.path, linuxOnWindows);
                args = this.config.pylamaArgs.concat(['-f', 'pep8', tempFilePath]);
                if (!tempFilePath) {
                    atom.notifications.addError("Cannot translate path from Windows to Linux. Please check if linuxOnWindows is unselected.");
                    return Promise.resolve(null);
                }
            }
        }

        // Set parameters for lintOnSave
        else if (!textEditor.isModified() && this.config.lintOnSave) {
            projectDir = this.mapPath(projectDir, this.config.linuxOnWindows);
            linuxPath = this.mapPath(filePath, this.config.linuxOnWindows);
            args = this.config.pylamaArgs.concat(['-f', 'pep8', linuxPath]);
            if (!linuxPath || !projectDir) {
                atom.notifications.addError("Cannot translate path from Windows to Linux. Please check if linuxOnWindows is unselected.");
                return Promise.resolve(null);
            }
        }

        // Return if limit is set and other lint process is working
        if (this.running && this.config.limitToSingleInstance) {
            console.log("[Linter-Python] Not executed because of limit");
            return Promise.resolve(null);
        }

        this.running = true;

        return new Promise((resolve) => {
            let messages = [];

            if (this.config.linuxOnWindows) {
                args = this.buildShellArgs(cmd, args);
                cmd = 'bash';
            }

            console.log("[Linter-Python] Command: " + cmd);
            console.log("[Linter-Python] Arguments: " + args);

            this.running = false;
            return resolve([]);

            cp.spawn(cmd, args, {cwd: projectDir})
            .then((result) => {
                console.log("[Linter-Python] Raw output \n " + result.stdout);
                lines = this.parseLines(result.stdout);
                console.log("[Linter-Python] Output: \n " + lines);

                for (let line of lines) {
                    if (line) {
                        let message = this.buildMessage(textEditor, line);
                        messages.push(message);
                    }
                }
                messages = messages.sort((a, b) => {
                    return this.sortBy('type', a, b);
                });
                this.cleanTempFiles();
                this.running = false;
                return resolve(messages);
            })
            .catch((error) => {
                atom.notifications.addError("Execution finished with error:\n\n" + error);
                console.log("[Linter-Python] Execution error: \n " + error);
                this.cleanTempFiles();
                this.running = false;
                return resolve(null);
            });
        });
    }

    calculateProjectDir(projectDir, filePath) {
        if (projectDir) {
            console.log("[Linter-Python] Project dir: " + projectDir);
            return projectDir;
        }
        fileDir = path.dirname(filePath);
        if (fileDir) {
            console.log("[Linter-Python] Project dir: " + fileDir);
            return fileDir;
        }
        console.log("[Linter-Python] Project dir: " + os.tmpdir());
        return os.tmpdir();
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

    mapPath(filePath, linuxOnWindows) {
        if (!linuxOnWindows) {
            return filePath;
        }
        let matches = filePath.match(partitionRegexp);
        if (matches) {
            return '/mnt/' + matches[1].toLowerCase() + '/' + matches[2].replace(/\\\\/g, '/');
        }
        else {
            return null;
        }
    }

    buildShellArgs(execPath, execArgs) {
        return ['-c', execPath + ' ' + execArgs.join(' ')];
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
        let filePath = textEditor.getPath();
        let resultType = 'Warning';

        if (result[4].indexOf('E') > -1 || result[4].indexOf('F') > -1) {
            resultType = 'Error';
        }

        text = result.length > 5 ? result[4] + ' ' + result[5] : result[4];
        range = this.createUnderlineRange(line, parseInt(result[2]), parseInt(result[3]));
        console.log("[Linter-Python] New message: \n    type: " + resultType + "\n    text: " + text + "\n    filePath: " + filePath + "\n    range: " + range);
        return {
            type: resultType,
            text: text,
            filePath: filePath,
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
