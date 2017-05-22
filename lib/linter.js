/** Main body to handle whole process. */
"use strict";
var runner_1 = require('./runner');
var config_1 = require('./config');
var parser_1 = require('./parser');
var logger_1 = require('./logger');
var cache_1 = require('./cache');
var util_1 = require('./util');
var fs = require('fs');
var os = require('os');
var temp = require('temp');
var path = require('path');
var logger = logger_1.Logger.getInstance();
var cache = cache_1.Cache.getInstance();
var PluginLinter = (function () {
    function PluginLinter() {
        this.runtimeConfig = new config_1.PluginRuntimeConfig();
        this.runtimeConfig.initialConfg();
        this.runtimeConfig.logCurrentState();
        this.runner = new runner_1.ProcessRunner();
        this.tempFileHandler = new util_1.TempFileHandler();
        this.running = false;
        this.tempFile = null;
        this.lint = this.lint.bind(this);
    }
    PluginLinter.prototype.lint = function () {
        var textEditor = atom.workspace.getActiveTextEditor();
        if (!atom.workspace.isTextEditor(textEditor)) {
            return Promise.resolve(cache.get());
        }
        var filePath = textEditor.getPath();
        if (!filePath) {
            return Promise.resolve(cache.get());
        }
        var projectDir = this.calculateProjectDir(filePath);
        var cmd = this.runtimeConfig.executablePath;
        var args = [];
        cache.set(filePath);
        if (this.running == true && this.runtimeConfig.limitToSingleInstance == true) {
            logger.log(">>> EXECUTION SKIPPED <<<");
            return Promise.resolve(cache.get());
        }
        logger.log(">>> INPUT FOR LINTING <<<");
        logger.log(">   filePath = " + filePath);
        logger.log("> projectDir = " + projectDir);
        logger.log(">        cmd = " + cmd);
        logger.log(">       args = []");
        logger.log('>>> END <<<');
        if (!util_1.canExecute(cmd)) {
            atom.notifications.addError("Provided path doesn't exist.\n\n" + cmd + "\n\nPlease fix pylama path or install latest version.");
            return Promise.resolve(cache.get());
        }
        if (this.isForLintOnFly(textEditor)) {
            this.tempFile = this.tempFileHandler.create(textEditor.getText());
            var parser = new parser_1.OnFlyParameterParser();
            var result = parser.parse(projectDir, this.tempFile.path, this.runtimeConfig);
            args = result.args;
            projectDir = result.projectDir;
        }
        else if (this.isForLintOnSave(textEditor)) {
            var parser = new parser_1.SaveParameterParser();
            var result = parser.parse(projectDir, filePath, this.runtimeConfig);
            args = result.args;
            projectDir = result.projectDir;
        }
        else {
            return Promise.resolve(cache.get());
        }
        logger.log(">>> NEW ARGS <<<");
        logger.log("> " + args);
        logger.log('>>> END <<<');
        return this.runner.run(textEditor, this.runtimeConfig, projectDir, cmd, args, this.running, this.tempFile);
    };
    PluginLinter.prototype.calculateProjectDir = function (filePath) {
        var projectDir = atom.project.relativizePath(filePath)[0];
        if (projectDir) {
            return projectDir;
        }
        var fileDir = path.dirname(filePath);
        if (fileDir) {
            return fileDir;
        }
        return os.tmpdir();
    };
    PluginLinter.prototype.isForLintOnFly = function (textEditor) {
        if (this.runtimeConfig.lintOnFly && textEditor.isModified()) {
            return true;
        }
        else {
            return false;
        }
    };
    PluginLinter.prototype.isForLintOnSave = function (textEditor) {
        if (this.runtimeConfig.lintOnSave && !textEditor.isModified()) {
            return true;
        }
        else {
            return false;
        }
    };
    return PluginLinter;
}());
exports.PluginLinter = PluginLinter;
//# sourceMappingURL=linter.js.map