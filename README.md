# linter-python package

Plugin to lint python files. Whole logic based on pylama and pylama-pylint applications.

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/example.gif)

## Requirements

* python >= 2.7
* pylama >= 7.3.3
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

#### Options added in 3.0.4 version

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/3.0.4.gif)

* Atom API was used to select error
* URL to error description

#### Plugin configuration vs. performance

Please be informed that plugin has to create temporary files to lint file in the fly. In case of any performance issues please try
to change trigger option to "File saved". For such option temporary files are not needed.

## Pylama related topics

#### Pylama results depend on plugin order

It was discovered that pylama plugin order may change lint results. Issue is under investigated and will be reported
to pylama project as soon as I get time to create test scenarios.

Tests show that the most trusted configuration is: mccabe,pyflakes,pylint,pep8,pep257

#### Pyflakes plugin may change pylama result

New issue was created in pylama project. Pylama results are not constant when pyflakes plugin is enabled. Issue is visible with Python 3.5.1

Issue details are available [here](https://github.com/klen/pylama/issues/67).

## Lint errors

Starting from plugin version 3.0.0 lint output provides link to error description available on GitHub [project](https://github.com/pchomik/linter-python-doc/blob/master/errors/).

Thanks to @linickx who created all pages. Please provide more pull requests if you like to create single place for all python defined errors.

## Contribution

Pull requests, issues, issue investigation, reviews are more than welcome.

## Contributors

* @linickx
* @Arcanemagus
* @Zebradil

## License

Package license is available [here](https://raw.githubusercontent.com/pchomik/linter-python/master/LICENSE.md)

## Contact

Please create issue in case of any question or feature request.

## Changelog

This section contains changes from last 3 releases.

Full list of changes is available [here](https://raw.githubusercontent.com/pchomik/linter-python/master/CHANGELOG.md)

#### 3.1.2
* (#37) Fix issue: Cannot read property 'getPath' of undefined

#### 3.1.1
* Update release notes and readme file

#### 3.1.0
* (#31) Execution finished with error because of pylama exit code change

#### 3.0.5
* (#28) Add cache functionality
* (#25) Remove underline options from plugin configuration
* (#27) Documentation update
* (#26) Regenerate new plugin exaples
