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
            description: 'Ryun pylama with Pyflakes linter.',
        },
        withPylint: {
            type: 'boolean',
            default: false,
            description: 'Run pylama with Pylint linter. To enable this option please execute following command: pip install pylama-pylint.'
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
// # module.exports =
// #   config:
// #     executablePath:
// #       type: 'string'
// #       default: 'pylama'
// #       description: 'Excutable path for external Pylama.
// #       Example: /usr/local/bin/pylama'
// #     ignoreErrorsAndWarnings:
// #       type: 'string'
// #       default: ''
// #       description: 'Comma-separated list of errors and warnings.
// #       Example: E111,E114,D101,D102,DW0311'
// #     skipFiles:
// #       type: 'string'
// #       default: ''
// #       description: 'Skip files by masks.
// #       Comma-separated list of a file names.
// #       Example: */messages.py,*/__init__.py'
// #     useMccabe:
// #       type: 'boolean'
// #       default: true
// #       title: 'Use McCabe'
// #       description: 'Use McCabe complexity checker.'
// #     usePep8:
// #       type: 'boolean'
// #       default: true
// #       title: 'Use PEP8'
// #       description: 'Use PEP8 style guide checker.'
// #     usePyflakes:
// #       type: 'boolean'
// #       default: true
// #       title: 'Use PyFlakes'
// #       description: 'Use PyFlakes checker.'
// #     usePep257:
// #       type: 'boolean'
// #       default: true
// #       title: 'Use PEP257'
// #       description: 'Use PEP257 docstring conventions checker.'
// #     usePylint:
// #       type: 'boolean'
// #       default: false
// #       title: 'Use PyLint'
// #       description: 'Use PyLint linter. May be unstable for internal Pylama.
// #       For use with external Pylama you should install pylama_pylint module
// #       ("pip install pylama-pylint").'
  // #
  // # activate: ->
  // #   require('atom-package-deps').install 'linter-python'
  // #   console.log 'Linter-Python: package loaded,
  // #                ready to get initialized by AtomLinter.'
  // #
  // # provideLinter: ->
  // #   LinterPython = require './linter-python.coffee'
  // #   @provider = new LinterPython()
  // #   return {
  // #     grammarScopes: ['source.python']
  // #     scope: 'file'
  // #     lint: @provider.lint
  // #     lintOnFly: true
  // #   }
