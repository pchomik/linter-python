'use babel';

const cp = require('child-process-es6-promise');
const regexp = /(.*):(\d+):\s+\[(.)\]\s+(.*)/;
const React = require('react');
const fs = require('fs');


class LinterPython extends React.Component {

    constructor() {
        super();

        this.lastMessages = [];
        this.lint = this.lint.bind(this);
        this.initialPlugin = this.initialPlugin.bind(this);
    }

    initialPlugin() {
        let linters = [];

        this.executablePath = this.readConfigValue('executablePath');
        this.pylamaArgs = [];

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

        if (linters.length > 0) {
            this.pylamaArgs.push('-l');
            this.pylamaArgs.push(linters.join());
        }

        let ignoreCodes = this.readConfigValue('ignoreCodes');
        if (ignoreCodes) {
            this.pylamaArgs.push('-i');
            this.pylamaArgs.push(ignoreCodes);
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

    isExecutablePathExists(path) {
        try {
            fs.accessSync(path, fs.R_OK | fs.X_OK);
            return true;
        }
        catch(err) {
            return false;
        }
    }

    lint(textEditor) {
        return new Promise ((resolve, reject) => {
            let messages = [];
            let buff = [];
            let cmd = this.executablePath;
            let args = this.pylamaArgs.concat(['-f', 'pylint', textEditor.getPath()]);
            if (textEditor.isModified()) {
                resolve(this.lastMessages);
            }
            if (!this.isExecutablePathExists(cmd)) {
                atom.notifications.addError("Provided path doesn't exist. Please fix pylama path.");
                resolve([]);
            }
            cp.spawn(cmd, args, {})
                .then((result) => {
                    results = this.parseLines(result.stdout);

                    for (result of results) {
                        if (result) {
                            message = this.buildMessage(textEditor, result);
                            messages.push(message);
                        }
                    }
                    this.lastMessages = messages.sort((a, b) => {
                        return this.sortBy('type', a, b);
                    });
                    resolve(this.lastMessages);
                })
                .catch((error) => {
                    atom.notifications.addError("Execution finished with error: " + error);
                    console.log(error);
                    resolve([]);
                });
        });
    }
}

module.exports = LinterPython;
