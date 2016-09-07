var Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color');

var IkeDevice = function(ibusInterface) {

    // self reference
    var _self = this;

    // exposed data
    this.init = init;
    this.deviceName = 'IkeDevice';
    this.setTitle = setTitle;
    
    // events

    // local data

    // implementation
    function init() {
    }

    function clearScreen() {

    }

    function setTitle(type, text) {
        //0 - normal
        //1 - arrows
        //2 - arrows and dong
        //...
        
    }
    
    function getPaddedLenBuf(text, len) {
        var outputTextBuf = new Buffer(len);
        outputTextBuf.fill(0x20);

        var textBuf = (new Buffer(text, 'utf-8')).slice(0, len);

        // copy to the new padded buffer
        textBuf.copy(outputTextBuf);

        return outputTextBuf;
    }

};

module.exports = IkeDevice;