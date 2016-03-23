# linter-python package

Plugin to lint python files. Whole logic based on pylama and pylama-pylint applications.

![Package usage](https://raw.githubusercontent.com/pchomik/linter-python-doc/master/img/example.gif)

## Requirements

* python >= 2.7
* pylama
* pylama-pylint (optional)

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

## Pylama results depends on plugin order

Last discovered that pylama plugin order may change linting result. Issue is under investigated and will be reported
to pylama as soon as I get time to create test scenarios.

My tests show that the most trusted configuration is: mccabe,pyflakes,pylint,pep8,pep257

## Contribution

Pull requests are welcome.

## License

Package license is available [here](https://raw.githubusercontent.com/pchomik/linter-python/master/LICENSE.md)

## Contact

Please create issue in case of any question or feature request.

## Changelog

#### 2.1.4
* Fix error with lint plugins order
* Fix error related to messages without error code

#### 2.1.3
* Fix error message
* Set whole line for errors with position 0
* Set items order in settings window
* Speed up startup

#### 2.1.2
* Update package documentation

#### 2.1.1
* Update package description

#### 2.1.0
* Move documentation to separate project
* Add trigger options: after save, after change, after save and change
* Add option to define underscore type and size

#### 2.0.0
* First release
* Fix error with unknown line number
* Update documentation

#### 1.0.0
* Create plugin
