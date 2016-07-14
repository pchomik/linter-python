/** Module to log debug prints if debug prints are enabled */
"use strict";
var Logger = (function () {
    function Logger() {
        this._enabled = false;
        if (Logger._instance) {
            throw new Error("Error: Instantiation failed: Use Logger.getInstance() instead of new.");
        }
        Logger._instance = this;
    }
    Logger.getInstance = function () {
        return Logger._instance;
    };
    Logger.prototype.enableLogger = function () {
        if (!this._enabled) {
            this._enabled = true;
            console.log(">>> DEBUG ENABLED <<<");
        }
    };
    Logger.prototype.disableLogger = function () {
        if (this._enabled) {
            this._enabled = false;
            console.log(">>> DEBUG DISABLED <<<");
        }
    };
    Logger.prototype.log = function (message) {
        if (this._enabled) {
            console.log(message);
        }
    };
    Logger._instance = new Logger();
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map