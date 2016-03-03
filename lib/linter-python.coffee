{BufferedProcess} = require 'atom'
{CompositeDisposable} = require 'atom'


regexp = /(.*):(\d+):\s+\[(.)\]\s+(.*)/


class LinterPython

    constructor: ->
        @subscriptions = new CompositeDisposable

    destroy: ->
        @subscriptions.dispose()

    parseLines: (data) =>
        lines = data.split '\n'
        results = for line in lines
            line.match regexp

    sortBy: (key, a, b, r) =>
        r = if r then 1 else -1
        return 1*r if a[key] == 'Error' and b[key] == 'Warning'
        return -1*r if a[key] == 'Warning' and b[key] == 'Error'
        return 0

    buildMessage: (textEditor, result) =>
        lineNumber = textEditor.buffer.lines[result[2]]
        colEnd = lineNumber.length if lineNumber
        resultType = if result[3] == 'E' or result[3] == 'F' then 'Error' else 'Warning'
        return {
          type: resultType
          text: result[4]
          filePath: textEditor.getPath()
          range: [
            [result[2] - 1, 0]
            [result[2] - 1, colEnd]
          ]
        }

    lint: (textEditor) =>
        return new Promise (resolve, reject) =>
            messages = []
            buff= []
            console.log 'started for ' + textEditor.getPath()
            cmd = '/home/pawel/.pyenv/versions/3.5.1/bin/pylama'
            args = ['-l', 'pep8,mccabe,pylint', '-f', 'pylint', textEditor.getPath()]
            stdout = (data) =>
                buff.push data
            stderr = (err) =>
                err
            exit = (code) =>
                results = @parseLines(buff.join(''))
                for result in results
                    if result?
                        message = @buildMessage(textEditor, result)
                        console.log message
                        messages.push message
                messages.sort (a, b) =>
                    @sortBy('type', a, b, true)
                resolve messages
            lint_process = new BufferedProcess(
              command: cmd
              args: args
              options: {}
              stdout: stdout
              stderr: stderr
              exit: exit
            )
            lint_process.onWillThrowError ({error, handle}) =>
              atom.notifications.addError "Failed to run #{command}",
                detail: "#{error.message}"
                dismissable: true
              handle()


module.exports = LinterPython
