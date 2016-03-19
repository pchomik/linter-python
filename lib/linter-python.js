'use babel';

const cp = require('child-process-es6-promise');
//const regexp = /(.*):(\d+):\s+\[(.)\]\s+(.*)/;
const regexp = /(.*):(\d+):(\d+):\s(.\d+)\s*(.*)/;

//test.py:15:1: E303 too many blank lines (6) [pep8]
//test.py:15: [C] E303 too many blank lines (6) [pep8]
const React = require('react');
const fs = require('fs');
const CompositeDisposable = require('atom').CompositeDisposable;
const temp = require('temp');
const path = require('path');


class LinterPython extends React.Component {

    constructor() {
        super();

        temp.track();

        this.realConsoleLog = console.log;
        this.lastMessages = [];
        this.pylamaArgs = [];
        this.executablePath = '';
        this.enableDebug = false;
        this.lintOnChange = false;
        this.lintOnSave = false;
        this.optionsFileSet = false;
        this.underlineType = "Whole line";
        this.underlineSize = 2;

        this.lint = this.lint.bind(this);
        this.initialPlugin = this.initialPlugin.bind(this);
        this.updatePluginConfig = this.updatePluginConfig.bind(this);
        this.buildMessage = this.buildMessage.bind(this);
        this.createUnderlineRange = this.createUnderlineRange.bind(this);

        this.subs = new CompositeDisposable();
        this.subs.add(atom.config.observe('linter-python.executablePath', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.withPep8', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.withPep257', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.withMcCabe', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.withPylint', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.withPyflakes', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.ignoreCodes', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.skipFiles', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.force', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.optionsFile', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.enableDebug', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.lintTrigger', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.underlineSize', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.underlineType', {}, this.updatePluginConfig));
    }

    initialPlugin() {
        let linters = [];

        this.pylamaArgs = [];
        this.optionsFileSet = false;

        this.executablePath = this.readConfigValue('executablePath');

        this.underlineType = this.readConfigValue('underlineType');
        if (this.underlineType == 'Only place with error') {
            this.underlineSize = this.readConfigValue('underlineSize');
        }

        let enableDebug = this.readConfigValue('enableDebug');
        if (enableDebug) {
            console.log = this.realConsoleLog;
            console.log("[Linter-Python] Debug prints were enabled.");
        }
        else {
            console.log("[Linter-Python] Debug prints were disabled.");
            console.log = () => {};
        }

        let withPep8 = this.readConfigValue('withPep8');
        if (withPep8) {
            linters.push('pep8');
        }

        let withPep257 = this.readConfigValue('withPep257');
        if (withPep257) {
            linters.push('pep257');
        }

        let withMcCabe = this.readConfigValue('withMcCabe');
        if (withMcCabe) {
            linters.push('mccabe');
        }

        let withPyflakes = this.readConfigValue('withPyflakes');
        if (withPyflakes) {
            linters.push('pyflakes');
        }

        let withPylint = this.readConfigValue('withPylint');
        if (withPylint) {
            linters.push('pylint');
        }

        let skipFiles = this.readConfigValue('skipFiles');
        if (skipFiles.length > 0) {
            this.pylamaArgs.push('--skip');
            this.pylamaArgs.push(skipFiles);
        }

        if (linters.length > 0) {
            this.pylamaArgs.push('-l');
            this.pylamaArgs.push(linters.join());
        }

        let ignoreCodes = this.readConfigValue('ignoreCodes');
        if (ignoreCodes.length > 0) {
            this.pylamaArgs.push('-i');
            this.pylamaArgs.push(ignoreCodes);
        }

        let optionsFile = this.readConfigValue('optionsFile');
        if (optionsFile.length > 0) {
            this.optionsFileSet = true;
            this.pylamaArgs.push('-o');
            this.pylamaArgs.push(optionsFile);
        }

        let force = this.readConfigValue('force');
        if (force) {
            this.pylamaArgs.push('-F');
        }

        let lintTrigger = this.readConfigValue('lintTrigger');
        if (lintTrigger == 'Lint only after save') {
            this.lintOnSave = true;
            this.lintOnFly = false;
        }
        else if (lintTrigger == 'Lint only after change') {
            this.lintOnSave = false;
            this.lintOnFly = true;
        }
        else if (lintTrigger == 'Lint after save and change') {
            this.lintOnSave = true;
            this.lintOnFly = true;
        }
    }

    readConfigValue(value) {
        try {
            return atom.config.get('linter-python.' + value);
        }
        catch(err) {
            console.log(err);
            return '';
        }
    }

    updatePluginConfig(value) {
        this.initialPlugin();
    }

    lint(textEditor) {
        return new Promise ((resolve, reject) => {
            let buff = [];
            let args = [];
            let messages = [];
            let projectDir = "";
            let cmd = this.executablePath;

            // Return if lintOnFly is not allowed
            if (textEditor.isModified() && !this.lintOnFly) {
                resolve(this.lastMessages);
                return;
            }

            // Return if lintOnSave is not allowed
            else if (!textEditor.isModified() && !this.lintOnSave) {
                resolve(this.lastMessages);
                return;
            }

            // Set parameters for lintOnFly
            else if (textEditor.isModified() && this.lintOnFly) {
                tempFile = this.createTempFile(textEditor.getText());
                projectDir = path.dirname(tempFile.path);
                let pylama_options_file = path.join(atom.project.relativizePath(textEditor.getPath())[0], 'pylama.ini');
                if (!this.optionsFileSet && this.canRead(pylama_options_file)) {
                    args = this.pylamaArgs.concat(['-o', pylama_options_file, '-f', 'pep8', tempFile.path]);
                }
                else {
                    args = this.pylamaArgs.concat(['-f', 'pep8', tempFile.path]);
                }
            }

            // Set parameters for lintOnSave
            else if (!textEditor.isModified() && this.lintOnSave) {
                args = this.pylamaArgs.concat(['-f', 'pep8', textEditor.getPath()]);
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
                    results = this.parseLines(result.stdout);
                    console.log("[Linter-Python] Output: \n " + results);

                    for (result of results) {
                        if (result) {
                            message = this.buildMessage(textEditor, result);
                            console.log("[Linter-Python] New message: \n " + message);
                            messages.push(message);
                        }
                    }
                    this.lastMessages = messages.sort((a, b) => {
                        return this.sortBy('type', a, b);
                    });
                    console.log("[Linter-Python] Messages: \n " + this.lastMessages);
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
            results.push(line.match(regexp));
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


    // r[1] - plik
    // r[2] - linia
    // r[3] - columna
    // r[4] - blad
    // r[5] - wiadomosc r[3] + r[4] - pelna wiadomosc
    buildMessage(textEditor, result) {
        let line = textEditor.getBuffer().lineForRow(result[2] - 1);
        let resultType = 'Warning';

        if (result[4].indexOf('E') > -1 || result[4].indexOf('F') > -1) {
            resultType = 'Error';
        }

        range = this.createUnderlineRange(line, parseInt(result[2]), parseInt(result[3]));
        console.log("[Linter-Python] Range output: \n " + range);
        return {
            type: resultType,
            text: result[4] + result[5],
            filePath: textEditor.getPath(),
            range: range,
        };
    }

    createUnderlineRange(line, rowNumber, colNumber) {
        if (!line) {
            return [[rowNumber - 1 , 0], [rowNumber - 1, 0]];
        }
        if (this.underlineType == "Whole line") {
            return [[rowNumber - 1, 0],[rowNumber - 1, line.length]];
        }

        startCol = colNumber - this.underlineSize >= 0 ? colNumber - this.underlineSize : 0;
        endCol = colNumber  + this.underlineSize <= line.length ? colNumber + this.underlineSize : line.length;
        return [[rowNumber - 1, startCol],[rowNumber - 1, endCol]];
    }
}

module.exports = LinterPython;
