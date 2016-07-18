/** Plugin initialization needed by Atom editor and linter plugin. */
"use strict";
var linter_1 = require('./linter');
var logger_1 = require('./logger');
var logger = logger_1.Logger.getInstance();
module.exports = {
    activate: function (state) {
        require('atom-package-deps').install('linter-python');
        logger.log(">>> PACKAGE \"python-linter\" ACTIVATED <<<");
    },
    deactivate: function () {
        logger.log(">>> PACKAGE \"python-linter\" DEACTIVATED <<<");
    },
    provideLinter: function () {
        var linter = new linter_1.PluginLinter();
        var provider = {
            name: 'Python Linter',
            grammarScopes: ['source.python'],
            scope: 'file',
            lintOnFly: true,
            lint: linter.lint,
        };
        return provider;
    }
};
//# sourceMappingURL=init.js.map