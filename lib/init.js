'use babel';

module.exports = {

    config: {
        executablePath: {
            type: 'string',
            default: 'pylama',
            description: 'Excutable path for external Pylama. Example: /usr/local/bin/pylama.',
        },
        ignoreCodes: {
            type: 'string',
            default: '',
            description: 'Provided codes will be ignored by linters. Example: E111,E114,D101,D102,DW0311.',
        },
        withPep8: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with pep8 linter.'
        },
        withPep257: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with PEP257 linter.',
        },
        withMcCabe: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with McCabe linter.',
        },
        withPyflakes: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with Pyflakes linter.',
        },
        withPylint: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with Pylint linter. To enable this option please execute following command: pip install pylama-pylint.'
        },
        skipFiles: {
            type: 'string',
            default: '',
            description: 'Skip files by masks (comma-separated, ex. */message,py,*/ignore.py).'
        },
        optionsFile: {
            type: 'string',
            default: '',
            description: 'Path to configuration file. By default is <project dir>/pylama.ini'
        },
        force: {
            type: 'boolean',
            default: false,
            description: 'Force code checking (if linter doesnt allow).'
        },
        enableDebug: {
            type: 'boolean',
            default: false,
            description: 'Enable debug console prints.'
        }
    },

    activate() {
        require('atom-package-deps').install('linter-python');
        console.log('My package was activated');
    },

    deactivate() {
        console.log('My package was deactivated');
    },

    provideLinter() {
        const LinterPython = require('./linter-python.js');
        const Linter = new LinterPython();
        Linter.initialPlugin();
        const provider = {
            name: 'Python Linter',
            grammarScopes: ['source.python'],
            scope: 'file',
            lintOnFly: true,
            lint: Linter.lint,
        };
        return provider;
    }
};
