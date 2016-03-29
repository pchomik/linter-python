'use babel';

const CompositeDisposable = require('atom').CompositeDisposable;


class LinterConfig {
    constructor() {
        this.pylamaArgs = [];
        this.executablePath = '';
        this.enableDebug = false;
        this.lintOnChange = false;
        this.lintOnSave = false;
        this.optionsFileSet = false;
        this.underlineType = "Whole line";
        this.underlineSize = 2;
        this.realConsoleLog = console.log;
        this.limitToSingleInstance = true;

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
        this.subs.add(atom.config.observe('linter-python.lintTrigger', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.underlineSize', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.underlineType', {}, this.updatePluginConfig));
        this.subs.add(atom.config.observe('linter-python.limitToSingleInstance', {}, this.updatePluginConfig));
    }

    initialPlugin() {
        let linters = [];

        this.pylamaArgs = [];
        this.optionsFileSet = false;

        this.executablePath = this.readConfigValue('executablePath');
        this.limitToSingleInstance = this.readConfigValue('limitToSingleInstance');

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

        let withPep8 = this.readConfigValue('withPep8');
        if (withPep8) {
            linters.push('pep8');
        }

        let withPep257 = this.readConfigValue('withPep257');
        if (withPep257) {
            linters.push('pep257');
        }

        if (linters.length > 0) {
            this.pylamaArgs.push('-l');
            this.pylamaArgs.push(linters.join());
        }

        let skipFiles = this.readConfigValue('skipFiles');
        if (skipFiles.length > 0) {
            this.pylamaArgs.push('--skip');
            this.pylamaArgs.push(skipFiles);
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
}

module.exports = LinterConfig;
