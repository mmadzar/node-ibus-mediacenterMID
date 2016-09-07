var Log = require('log'),
    log = new Log('debug'),
    clc = require('cli-color'),
    _ = require('underscore'),
    tools = require('../tools.js'),
    msgs = require('../messages.js');

// Debug Ibus messages
var IbusDebuggerDevice = function () {
    
    // self reference
    var _self = this;
    
    // exposed data
    this.init = init;
    this.deviceName = 'Ibus Debugger';
    this.listenDeviceIds = [];
    
    this.radrev = simulateREV;
    this.radff = simulateFF;
    this.rad1 = simulateButton1;
    this.rad2 = simulateButton2;
    this.rad3 = simulateButton3;
    this.rad4 = simulateButton4;
    this.rad5 = simulateButton5;
    this.rad6 = simulateButton6;
    this.radm = simulateM;
    this.mflprev = simulateMflPrev;
    this.mflnext = simulateMflNext;

    this.allMessages = [];
    
    // local data
    this.ibusInterface = {};
    
    // implementation
    function init(ibusInterface, listenDeviceIds, successFn) {
        log.debug('[IbusDebuggerDevice] Starting up..');
        
        // set interfaces
        _self.ibusInterface = ibusInterface;
        _self.listenDeviceIds = listenDeviceIds || [];
        
        //local data
        _self.allMessages = [];
        for (var attributename in msgs.messages) {
            _self.allMessages.push({ key: attributename, value: msgs.messages[attributename] })
        }
        
        // events
        _self.ibusInterface.on('data', onData);
        
        if (successFn) {
            successFn();
        }
    }
    
    function onData(data) {
        //printReadableMessage(data);
    }

    function printReadableMessage(data) {
        if ((_self.listenDeviceIds.length === 0) || (_.find(_self.listenDeviceIds, function (val) {
            return val === data.dst;
        }))) {
            var displayLen = data.msg.length + 2;
            var msg = 'Received   :  <Buffer ' + (data.src.toString(16).length < 2 ? "0":"") + (data.src).toString(16) + ' ' + ((displayLen).toString(16).length<2 ? "0":"") + (displayLen).toString(16) + ' ' + (data.dst.toString(16).length < 2 ? "0":"") + (data.dst).toString(16);
            for (var i = 0; i < data.msg.length; i++) {
                msg += ' ' + ((data.msg[i] < 0x10) ? '0' : '') + data.msg[i].toString(16);
            }
            
            var known = undefined; //findMessage(data);
            if (known != undefined) {
                //log.info('[IbusDebuggerDevice]*' + msg + "> '" + known.key + "' " + tools.intToAscii(data.msg)); // data);
            }
            else {
                log.info('[IbusDebuggerDevice] ' + msg + "> '" + tools.intToAscii(data.msg.slice()) + "'"); // data);
            }
            //console.log('// ' + data.msg.toString('ascii'));
            //console.log('ibusInterface.sendMessage({src: 0x' + data.src + ',dst: 0x' + data.dst + ', msg: new Buffer([' + msg.substr(2), '])});');
        }
       //log.info('[IbusDebuggerDevice All] ',data.src + '.' + data.dst + '.' + data.msg + ' -> ' + data.msg.toString('ascii')); // data);
   
    }
    
    function findMessage(data) {
        for (var i = 0; i < _self.allMessages.length; i++) {
            if (tools.compare(data, _self.allMessages[i].value)) {
                return _self.allMessages[i];
                break;
            }
        };
        return undefined;
    }
    
    function simulateButton1() {
        //C0 06 68 31 40 00 00 - radio button 1 press
        _self.ibusInterface.sendMessage(msgs.messages.radio_1_press);
    }
    
    function simulateButton2() {
        //C0 06 68 31 40 00 01 - radio button 2 press
        _self.ibusInterface.sendMessage(msgs.messages.radio_2_press);
    }
    
    function simulateButton3() {
        //C0 06 68 31 40 00 02 - radio button 3 press
        _self.ibusInterface.sendMessage(msgs.messages.radio_3_press);
    }
    
    function simulateButton4() {
        _self.ibusInterface.sendMessage(msgs.messages.radio_4_press);
    }
    
    function simulateButton5() {
        //C0 06 68 31 40 00 04 - radio button 5
        _self.ibusInterface.sendMessage(msgs.messages.radio_5_press);
    }
    
    function simulateButton6() {
        //C0 06 68 31 40 00 05 - radio button 6
        _self.ibusInterface.sendMessage(msgs.messages.radio_6_press);
    }

    function simulateREV() {
        //C0 06 68 31 00 00 0C - radio REV press
        _self.ibusInterface.sendMessage(msgs.messages.radio_rev_press);
    }
    
    function simulateFF() {
        //C0 06 68 31 00 00 0C - radio REV press
        _self.ibusInterface.sendMessage(msgs.messages.radio_ff_press);
    }

    function simulateM() {
        //C0 06 68 31 00 00 0E - radio m press
        _self.ibusInterface.sendMessage(msgs.messages.radio_m_press);
    }
    
    function simulateMflPrev() {
        _self.ibusInterface.sendMessage(msgs.messages.previous_press);
    }
    
    function simulateMflNext() {
        _self.ibusInterface.sendMessage(msgs.messages.next_press);
    }
    
}

module.exports = IbusDebuggerDevice;
