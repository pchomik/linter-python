# linter-python package

Plugin to lint python files. Whole logic based on pylama and pylama-pylint applications.

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/example.gif)

## Requirements

* python >= 2.7
* pylama
* pylama-pylint (optional)

## Atom linters

* [Atom Linters](http://atomlinter.github.io/)

#### Linters for python

* [linter-python](https://atom.io/packages/linter-python)
* [linter-pep8](https://atom.io/packages/linter-pep8)
* [linter-pydocstyle](https://atom.io/packages/linter-pydocstyle)
* [linter-flake8](https://atom.io/packages/linter-flake8)
* [linter-pylama](https://atom.io/packages/linter-pylama)

## Plugin installation

#### Atom plugin installation

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/install.gif)

* Go to Settings -> Install
* Type "linter-python"
* Press "Install"

#### Pylama installation

```
pip install pylama pylama-pylint
```

If pip is something new for you please look [here](https://pip.pypa.io/en/stable/installing/) for more detail.

## Plugin configuration

#### Basic plugin configuration

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/config.gif)

* Go to Settings -> Packages
* Type "linter-python" and go to plugin settings
* Set path to pylama binary e.g. /usr/bin/pylama
* Select needed pylama options

#### Options added in 2.1.3 version

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/2.1.3.gif)

* Option when lint process is triggered
* Option to choose underline type and underline size
* Pylama "force" option

Please be informed that plugin has to create temporary files to lint file in the fly. In case of any performance issues please try
to change trigger option to "Lint only after save". For such option temporary files are not needed.

## Pylama results depend on plugin order

It was discovered that pylama plugin order may change lint results. Issue is under investigated and will be reported
to pylama project as soon as I get time to create test scenarios.

Tests show that the most trusted configuration is: mccabe,pyflakes,pylint,pep8,pep257

#### Pyflakes plugin may change pylama result

New issue was created in pylama project. Pylama results are not constant when pyflakes plugin is enabled.

Issue details are available [here](https://github.com/klen/pylama/issues/67).

## Plugin errors

Starting from plugin version 3.0.0 error output provides link to error description available on GitHub [project](https://github.com/pchomik/linter-python-doc/blob/master/errors/).

Thanks to @linickx who created all pages. Please provide more pull requests if you like to create single place for all python defined errors.

## Contribution

Pull requests, issues, issue investigation, reviews are more than welcome.

## Constributors

* @linickx
* @Arcanemagus

## License

Package license is available [here](https://raw.githubusercontent.com/pchomik/linter-python/master/LICENSE.md)

## Contact

Please create issue in case of any question or feature request.

## Changelog

This section contains changes from last 3 releases.

Full list of changes is available [here](https://raw.githubusercontent.com/pchomik/linter-python/master/CHANGELOG.md)

#### 3.0.4
* Rewrite whole plugin to typescript
* Fix #23 Remove logic responsible by disabling console
* Implement #22 Link for plugin errors
* Implement #17 Change "Lint trigger" option names
* Fix few deployment issues
* Add colorLink option

#### 2.1.7
* Fix error if file is in edition without project

#### 2.1.6
* Add option to run only single lint instance
* Fix error with blocked lint operation
* Change way how results are returned to linter
