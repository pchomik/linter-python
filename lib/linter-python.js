'use babel';

const cp = require('child-process-es6-promise');
const regexp = /(.*):(\d+):\s+\[(.)\]\s+(.*)/;
const React = require('react');
const fs = require('fs');
const CompositeDisposable = require('atom').CompositeDisposable;


class LinterPython extends React.Component {

    constructor() {
        super();

        this.realConsoleLog = console.log;
        this.lastMessages = [];
        this.pylamaArgs = [];
        this.executablePath = '';
        this.enableDebug = false;

        this.lint = this.lint.bind(this);
        this.initialPlugin = this.initialPlugin.bind(this);
        this.updatePluginConfig = this.updatePluginConfig.bind(this);

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
    }

    initialPlugin() {
        let linters = [];

        this.pylamaArgs = [];
        this.executablePath = this.readConfigValue('executablePath');

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
            this.pylamaArgs.push('-o');
            this.pylamaArgs.push(optionsFile);
        }

        let force = this.readConfigValue('force');
        if (force) {
            this.pylamaArgs.push('-F');
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
            let messages = [];
            let buff = [];
            let cmd = this.executablePath;
            let args = this.pylamaArgs.concat(['-f', 'pylint', textEditor.getPath()]);
            let projectDir = atom.project.relativizePath(textEditor.getPath())[0];

            if (textEditor.isModified()) {
                resolve(this.lastMessages);
            }
            if (!this.canExecute(cmd)) {
                atom.notifications.addError("Provided path doesn't exist.\n\n" + cmd + "\n\nPlease fix pylama path.");
                resolve(this.lastMessages);
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
                    resolve(this.lastMessages);
                })
                .catch((error) => {
                    atom.notifications.addError("Execution finished with error:\n\n" + error);
                    console.log("[Linter-Python] Execution error: \n " + error);
                    resolve(this.lastMessages);
                });
        });
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

    buildMessage(textEditor, result) {
        let lineNumber = textEditor.buffer.lines[result[2]];
        let colEnd = lineNumber.length;
        let resultType = 'Warning';
        if (result[3] == 'E' || result[3] == 'F') {
            resultType = 'Error';
        }
        return {
            type: resultType,
            text: result[4],
            filePath: textEditor.getPath(),
            range: [
                [result[2] - 1, 0],
                [result[2] - 1, colEnd]
            ]
        };
    }
}

module.exports = LinterPython;
