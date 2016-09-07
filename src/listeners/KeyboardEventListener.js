var Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color');

var keypress = require('keypress');

// remoteControlClient, ibusDebugger
var KeyboardEventListener = function() {

    var _self = this;

    _self.init = init;

    _self.setRemoteControlClient = setRemoteControlClient;

    _self.remoteControlClient = {};

    function setRemoteControlClient(key, remoteControlClient) {
        _self.remoteControlClient[key] = remoteControlClient;
    }

    function init(successFn) {
        log.info('[KeyboardEventListener] Starting up..');

        // make `process.stdin` begin emitting "keypress" events
        keypress(process.stdin);

        // listen for the "keypress" event
        process.stdin.on('keypress', function(ch, key) {
            //console.log('got "keypress"', ch, key);
           
            if (!(key && key.name)) {
                key = {
                    name: ch
                }
            }
            if (key && key.ctrl && key.name == 'c') {
                process.emit('SIGINT');
            }
            else if (key && key.ctrl && key.name == 'z') {
                process.emit('SIGTERM');
            }
            else if (key.name === '1') {
                _self.remoteControlClient['ibus'].rad1();
            } 
            else if (key.name === '2') {
                _self.remoteControlClient['ibus'].rad2();
            }
            else if (key.name === '3') {
                _self.remoteControlClient['ibus'].rad3();
            }
            else if (key.name === '4') {
                _self.remoteControlClient['ibus'].rad4();
            }
            else if (key.name === '5') {
                _self.remoteControlClient['ibus'].rad5();
            }
            else if (key.name === '6') {
                _self.remoteControlClient['ibus'].rad6();
            } 
            else if (key.name === 'f') {
                _self.remoteControlClient['ibus'].radrev();
            }
            else if (key.name === 'g') {
                _self.remoteControlClient['ibus'].radff();
            }
            else if (key.name === 'm') {
                _self.remoteControlClient['ibus'].radm();
            }
            else if (key.name === 'q') {
                _self.remoteControlClient['ibus'].mflprev();
            }
            else if (key.name === 'w') {
                _self.remoteControlClient['ibus'].mflnext();
            }
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();

        if (successFn) {
            successFn();
        }
    }
}

module.exports = KeyboardEventListener;