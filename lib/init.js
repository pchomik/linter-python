'use babel';

const LinterPython = require('./linter-python.js');


module.exports = {

    config: {
        linuxOnWindows: {
            type: 'boolean',
            default: false,
            description: 'Enable support for Linux on Windows 10.',
            order: 1,
        },
        executablePath: {
            type: 'string',
            default: 'pylama',
            description: 'Excutable path for external Pylama. Example: /usr/local/bin/pylama.',
            order: 2,
        },
        withPep8: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with pep8 linter.',
            order: 3,
        },
        withPep257: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with PEP257 linter.',
            order: 4,
        },
        withMcCabe: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with McCabe linter.',
            order: 5,
        },
        withPyflakes: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with Pyflakes linter.',
            order: 6,
        },
        withPylint: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with Pylint linter. To enable this option please execute following command: pip install pylama-pylint.',
            order: 7,
        },
        skipFiles: {
            type: 'string',
            default: '',
            description: 'Skip files by masks (comma-separated, ex. */message,py,*/ignore.py).',
            order: 8,
        },
        ignoreCodes: {
            type: 'string',
            default: '',
            description: 'Provided codes will be ignored by linters. Example: E111,E114,D101,D102,DW0311.',
            order: 9,
        },
        optionsFile: {
            type: 'string',
            default: '',
            description: 'Path to configuration file. By default is <project dir>/pylama.ini',
            order: 10,
        },
        force: {
            type: 'boolean',
            default: false,
            description: 'Force code checking (if linter doesnt allow).',
            order: 11,
        },
        lintTrigger: {
            type: 'string',
            default: 'Lint only after save',
            enum: [
                'Lint only after save',
                'Lint only after change',
                'Lint after save and change'
            ],
            description: "Defines when lint action should be triggered.",
            order: 12,
        },
        underlineType: {
            type: 'string',
            default: 'Whole line',
            enum: [
                "Whole line",
                "Only place with error"
            ],
            description: "Defines how error will be shown.",
            order: 13,
        },
        underlineSize: {
            type: "integer",
            default: 2,
            description: "Size of underline after and before place where error appears. Option is working only if \"Only place with error\" underline type was selected.",
            order: 14,
        },
        enableDebug: {
            type: 'boolean',
            default: false,
            description: 'Enable debug console prints.',
            order: 15,
        },
        limitToSingleInstance: {
            type: 'boolean',
            default: true,
            description: 'Limit how many pylama binaries can be executed. By default is set to single instance.',
            order: 16,
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
        const linter = new LinterPython();
        const provider = {
            name: 'Python Linter',
            grammarScopes: ['source.python'],
            scope: 'file',
            lintOnFly: true,
            lint: linter.lint,
        };
        return provider;
    }
};
