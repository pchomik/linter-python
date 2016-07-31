"use strict";
var logger_1 = require('./logger');
var logger = logger_1.Logger.getInstance();
var Cache = (function () {
    function Cache() {
        this.messages = {};
        if (Cache._instance) {
            throw new Error("Error: Instantiation failed: Use Logger.getInstance() instead of new.");
        }
        Cache._instance = this;
    }
    Cache.getInstance = function () {
        return Cache._instance;
    };
    Cache.prototype.store = function (messages) {
        logger.log(">>> NEW MESSAGES STORED IN CACHE <<<");
        this.messages[this.filePointer] = messages;
    };
    Cache.prototype.get = function () {
        logger.log(">>> MESSAGES RETURNED FROM CACHE <<<");
        if (!this.messages[this.filePointer]) {
            return [];
        }
        else {
            return this.messages[this.filePointer];
        }
    };
    Cache.prototype.set = function (filePath) {
        this.filePointer = filePath;
        logger.log(">>> CACHE SET FOR " + this.filePointer + " <<<");
    };
    Cache._instance = new Cache();
    return Cache;
}());
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map