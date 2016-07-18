/** Main body to handle whole process. */

import { ProcessRunner } from './runner';
import { PluginRuntimeConfig } from './config';
import { SaveParameterParser, OnFlyParameterParser } from './parser';
import { Logger } from './logger';
import { TempFileHandler, canExecute, TempFileWrapper } from './util';

const fs = require('fs');
const os = require('os');
const temp = require('temp');
const path = require('path');
const logger:Logger = Logger.getInstance();

declare var atom;

export class PluginLinter {

    runtimeConfig: PluginRuntimeConfig;
    runner: ProcessRunner;
    tempFileHandler: TempFileHandler;
    running: boolean;
    tempFile: TempFileWrapper;

    constructor() {
        this.runtimeConfig = new PluginRuntimeConfig();
        this.runtimeConfig.initialConfg();
        this.runtimeConfig.logCurrentState();
        this.runner = new ProcessRunner();
        this.tempFileHandler = new TempFileHandler();
        this.running = false;
        this.tempFile = null;

        this.lint = this.lint.bind(this);
    }

    lint() {
        let textEditor = atom.workspace.getActiveTextEditor();
        let filePath = textEditor.getPath();
        let projectDir = this.calculateProjectDir(textEditor, filePath);
        let cmd = this.runtimeConfig.executablePath;
        let args = [];

        if (this.running == true && this.runtimeConfig.limitToSingleInstance == true) {
            logger.log(">>> EXECUTION SKIPPED <<<");
            return Promise.resolve([]);
        }

        logger.log(">>> INPUT FOR LINTING <<<")
        logger.log(`>   filePath = ${filePath}`);
        logger.log(`> projectDir = ${projectDir}`);
        logger.log(`>        cmd = ${cmd}`);
        logger.log(">       args = []")
        logger.log('>>> END <<<');

        if (!canExecute(cmd)) {
            atom.notifications.addError(`Provided path doesn't exist.\n\n${cmd}\n\nPlease fix pylama path.`);
            return Promise.resolve([]);
        }

        if (this.isForLintOnFly(textEditor)) {
            this.tempFile = this.tempFileHandler.create(textEditor.getText());
            let parser = new OnFlyParameterParser();
            let result= parser.parse(projectDir, this.tempFile.path, this.runtimeConfig);
            args = result.args;
            projectDir = result.projectDir;
        } else if (this.isForLintOnSave(textEditor)) {
            let parser = new SaveParameterParser();
            let result = parser.parse(projectDir, filePath, this.runtimeConfig);
            args = result.args;
            projectDir = result.projectDir;
        } else {
            return Promise.resolve([]);
        }

        logger.log(">>> NEW ARGS <<<");
        logger.log(`> ${args}`);
        logger.log('>>> END <<<');

        return this.runner.run(textEditor, this.runtimeConfig, projectDir, cmd, args, this.running, this.tempFile);
    }

    calculateProjectDir(textEditor, filePath) {
        let projectDir = atom.project.relativizePath(textEditor.getPath())[0]
        if (projectDir) {
            return projectDir;
        }
        let fileDir = path.dirname(filePath);
        if (fileDir) {
            return fileDir;
        }
        return os.tmpdir();
    }

    isForLintOnFly(textEditor) {
        if (this.runtimeConfig.lintOnFly && textEditor.isModified()) {
            return true;
        } else {
            return false;
        }
    }

    isForLintOnSave(textEditor) {
        if (this.runtimeConfig.lintOnSave && !textEditor.isModified()) {
            return true;
        } else {
            return false;
        }
    }
}
