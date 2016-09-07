var Log = require('log'),
    log = new Log('info'),
    tools = require('../tools.js'),
    clc = require('cli-color');

var MidDevice = function (ibusInterface) {
    
    // self reference
    var _self = this;
    
    // exposed data
    this.title1 = "";
    this.title2 = "";
    this.init = init;
    this.deviceName = 'MidDevice';
    this.ibusInterface = {};
    this.setTitle1 = setTitle1;
    this.setTitle2 = setTitle2;
    this.refreshTop = refreshTop;
    this.refreshOptions = refreshOptions;
    this.showMenu1 = showMenu1;
    this.showMp3Menu = showMp3Menu;
    this.showStatus = showStatus;
    
    // events
    
    // local data
    
    // implementation
    function init() {
        _self.title1 = "";
        _self.title2 = "";
    }
    
    function clearScreen() {

    }
    
    function updateScreen1() {
        //working radio screen
        ibusInterface.sendMessage({
            src: 0x68,
            dst: 0xc0,
            msg: Buffer.concat([new Buffer([0x23, 0x40, 0x20]), getPaddedLenBuf(_self.title2, 11)])
        });
        
        //working BC screen
        ibusInterface.sendMessage({
            src: 0x80,
            dst: 0xc0,
            msg: Buffer.concat([new Buffer([0x23, 0x04, 0x20]), getPaddedLenBuf(_self.title1, 20)])
        });
    }
    
    function refreshOptions() {
        
    }
    
    function refreshTop() {
       
    }
    
    function showStatus() {
       
    }
    
    //MID radio display
    function setTitle1(text) {
        if (_self.title1 != text) {
            _self.title1 = text;
        }
        updateScreen1();
    }
    
    //MID board computer display
    function setTitle2(text) {
        if (_self.title2 != text) {
            _self.title2 = text;
        }
        updateScreen1();
    }
    
    function showMp3Menu() {
        ibusInterface.sendMessage({
            src: 0x68,
            dst: 0xc0,
            msg: new Buffer([0x21, 0x40, 0x00, 0x09, 0x05, 0x05, 0x4D, 0x50, 0x33])
        });
    }
    
    function showMenu1() {
        //68 21 c0 21 40 00 40 06 ' + '< SONG >'.asciiToHexString() + ' 20 06 ' + '^ SONG '.asciiToHexString() +' C1 06 ' + 'FIND  ||'.asciiToHexString()).split(' '),intId: [], description: 'MP3 Menu 1'
        var msg = {
            src: 0x68,
            dst: 0xc0,
            msg: Buffer.concat(
                [new Buffer([0x21, 0x40, 0x00, 0x40, 0x06]), 
                    getPaddedLenBuf('^ FIND ', 7), new Buffer([0xc1, 0x06]),
                    getPaddedLenBuf('OK  BACK', 8),
                    new Buffer([0x20, 0x06]),
                    getPaddedLenBuf('PLAY   Q', 8)
                ])
        };
        ibusInterface.sendMessage(msg);
        //log.info(clc.red(JSON.stringify(msg)) + clc.yellow(tools.intToAscii(msg.msg.slice())));
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

module.exports = MidDevice;