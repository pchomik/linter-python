"use strict";
/** Module to define plugin configuration and react on change. */
var logger_1 = require('./logger');
var CompositeDisposable = require('atom').CompositeDisposable;
var logger = logger_1.Logger.getInstance();
/** Plugin runtime configuration. What is really set by the user when Atom is working */
var PluginRuntimeConfig = (function () {
    function PluginRuntimeConfig() {
        this.pylamaArgs = [];
        this.executablePath = '';
        this.enableDebug = false;
        this.lintOnChange = false;
        this.lintOnSave = false;
        this.lintOnFly = false;
        this.optionsFileSet = false;
        this.underlineType = 'Whole line';
        this.underlineSize = 2;
        this.limitToSingleInstance = true;
        this.linkColor = "";
        this.initialConfg = this.initialConfg.bind(this);
        this.updateConfig = this.updateConfig.bind(this);
        this.subs = new CompositeDisposable();
        this.subs.add(atom.config.observe('linter-python.executablePath', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.withPep8', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.withPep257', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.withMcCabe', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.withPylint', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.withPyflakes', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.ignoreCodes', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.skipFiles', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.force', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.optionsFile', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.enableDebug', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.lintTrigger', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.underlineSize', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.underlineType', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.limitToSingleInstance', {}, this.updateConfig));
        this.subs.add(atom.config.observe('linter-python.linkColor', {}, this.updateConfig));
    }
    /** Set default cofiguration values */
    PluginRuntimeConfig.prototype.initialConfg = function () {
        var linters = [];
        this.pylamaArgs = [];
        this.optionsFileSet = false;
        this.executablePath = this.readConfigValue('executablePath');
        this.limitToSingleInstance = this.readConfigValue('limitToSingleInstance');
        this.linkColor = this.readConfigValue('linkColor');
        this.underlineType = this.readConfigValue('underlineType');
        if (this.underlineType == 'Only place with error') {
            this.underlineSize = this.readConfigValue('underlineSize');
        }
        var enabledDebug = this.readConfigValue('enableDebug');
        if (enabledDebug) {
            logger.enableLogger();
        }
        else {
            logger.disableLogger();
        }
        var withMcCabe = this.readConfigValue('withMcCabe');
        if (withMcCabe) {
            linters.push('mccabe');
        }
        var withPyflakes = this.readConfigValue('withPyflakes');
        if (withPyflakes) {
            linters.push('pyflakes');
        }
        var withPylint = this.readConfigValue('withPylint');
        if (withPylint) {
            linters.push('pylint');
        }
        var withPep8 = this.readConfigValue('withPep8');
        if (withPep8) {
            linters.push('pep8');
        }
        var withPep257 = this.readConfigValue('withPep257');
        if (withPep257) {
            linters.push('pep257');
        }
        if (linters.length > 0) {
            this.pylamaArgs.push('-l');
            this.pylamaArgs.push(linters.join());
        }
        var skipFiles = this.readConfigValue('skipFiles');
        if (skipFiles.length > 0) {
            this.pylamaArgs.push('--skip');
            this.pylamaArgs.push(skipFiles);
        }
        var ignoreCodes = this.readConfigValue('ignoreCodes');
        if (ignoreCodes.length > 0) {
            this.pylamaArgs.push('-i');
            this.pylamaArgs.push(ignoreCodes);
        }
        var optionsFile = this.readConfigValue('optionsFile');
        if (optionsFile.length > 0) {
            this.optionsFileSet = true;
            this.pylamaArgs.push('-o');
            this.pylamaArgs.push(optionsFile);
        }
        var force = this.readConfigValue('force');
        if (force) {
            this.pylamaArgs.push('-F');
        }
        var lintTrigger = this.readConfigValue('lintTrigger');
        if (lintTrigger == 'File saved') {
            this.lintOnSave = true;
            this.lintOnFly = false;
        }
        else if (lintTrigger == 'File modified') {
            this.lintOnSave = false;
            this.lintOnFly = true;
        }
        else if (lintTrigger == 'File saved or modified') {
            this.lintOnSave = true;
            this.lintOnFly = true;
        }
    };
    /** Method to simplify variable reading */
    PluginRuntimeConfig.prototype.readConfigValue = function (value) {
        try {
            return atom.config.get("linter-python." + value);
        }
        catch (err) {
            console.log(err);
            return '';
        }
    };
    /** Method to update configuration after value changing */
    PluginRuntimeConfig.prototype.updateConfig = function (value) {
        this.initialConfg();
    };
    PluginRuntimeConfig.prototype.logCurrentState = function () {
        logger.log(">>> PLUGIN INITIAL CONFIGURATION <<<");
        logger.log(">            pylamaArgs = " + this.pylamaArgs);
        logger.log(">        executablePath = " + this.executablePath);
        logger.log(">           enableDebug = " + this.enableDebug);
        logger.log(">          lintOnChange = " + this.lintOnChange);
        logger.log(">             linkOnFly = " + this.lintOnFly);
        logger.log(">            lintOnSave = " + this.lintOnSave);
        logger.log(">        optionsFileSet = " + this.optionsFileSet);
        logger.log(">         underlineType = " + this.underlineType);
        logger.log(">         underlineSize = " + this.underlineSize);
        logger.log("> limitToSingleInstance = " + this.limitToSingleInstance);
        logger.log(">             linkColor = " + this.linkColor);
        logger.log('>>> END <<<');
    };
    return PluginRuntimeConfig;
}());
exports.PluginRuntimeConfig = PluginRuntimeConfig;
//# sourceMappingURL=config.js.map