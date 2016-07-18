/** Module to define plugin configuration and react on change. */
import { Logger } from './logger';

const CompositeDisposable = require('atom').CompositeDisposable;
const logger:Logger = Logger.getInstance();

declare var atom;


/** Plugin runtime configuration. What is really set by the user when Atom is working */
export class PluginRuntimeConfig {

    pylamaArgs: any[] = [];
    executablePath: string = '';
    enableDebug: boolean = false;
    lintOnChange: boolean = false;
    lintOnSave: boolean = false;
    lintOnFly: boolean = false;
    optionsFileSet: boolean = false;
    underlineType: string = 'Whole line';
    underlineSize: number = 2;
    limitToSingleInstance: boolean = true;
    linkColor: any = "";
    subs: any;

    constructor() {

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
    initialConfg() {
        let linters = [];

        this.pylamaArgs = [];
        this.optionsFileSet = false;

        this.executablePath = this.readConfigValue('executablePath');
        this.limitToSingleInstance = this.readConfigValue('limitToSingleInstance');
        this.linkColor = this.readConfigValue('linkColor');

        this.underlineType = this.readConfigValue('underlineType');
        if (this.underlineType == 'Only place with error') {
            this.underlineSize = this.readConfigValue('underlineSize');
        }

        let enabledDebug = this.readConfigValue('enableDebug');
        if (enabledDebug) {
            logger.enableLogger();
        } else {
            logger.disableLogger();
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
    }

    /** Method to simplify variable reading */
    readConfigValue(value) {
        try {
            return atom.config.get(`linter-python.${value}`);
        }
        catch(err) {
            console.log(err);
            return '';
        }
    }

    /** Method to update configuration after value changing */
    updateConfig(value) {
        this.initialConfg();
    }

    public logCurrentState() {
        logger.log(">>> PLUGIN INITIAL CONFIGURATION <<<");
        logger.log(`>            pylamaArgs = ${this.pylamaArgs}`);
        logger.log(`>        executablePath = ${this.executablePath}`);
        logger.log(`>           enableDebug = ${this.enableDebug}`);
        logger.log(`>          lintOnChange = ${this.lintOnChange}`);
        logger.log(`>             linkOnFly = ${this.lintOnFly}`);
        logger.log(`>            lintOnSave = ${this.lintOnSave}`);
        logger.log(`>        optionsFileSet = ${this.optionsFileSet}`);
        logger.log(`>         underlineType = ${this.underlineType}`);
        logger.log(`>         underlineSize = ${this.underlineSize}`);
        logger.log(`> limitToSingleInstance = ${this.limitToSingleInstance}`);
        logger.log(`>             linkColor = ${this.linkColor}`);
        logger.log('>>> END <<<');
    }
}
