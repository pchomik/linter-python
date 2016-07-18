/** Plugin initialization needed by Atom editor and linter plugin. */

declare var atom;

import { PluginLinter } from './linter';
import { Logger } from './logger';

const logger:Logger = Logger.getInstance();

export = {
    activate(state) {
        require('atom-package-deps').install('linter-python');
        logger.log(">>> PACKAGE \"python-linter\" ACTIVATED <<<");
    },

    deactivate() {
        logger.log(">>> PACKAGE \"python-linter\" DEACTIVATED <<<");
    },

    provideLinter() {
        const linter = new PluginLinter();
        const provider = {
            name: 'Python Linter',
            grammarScopes: ['source.python'],
            scope: 'file',
            lintOnFly: true,
            lint: linter.lint,
        };
        return provider;
    }
}
