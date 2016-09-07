var cp = require('child_process'),
    Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color'),
    fs = require('fs'),
    cp = require('child_process'),
    events = require('events'),
    readline = require('readline'),
    util = require('util'),
    EventEmitter = require("events").EventEmitter,
    spawn = cp.spawn;

var moduleName = '[MPlayerClient] ';

// Media-player-daemon client
var MPlayerClient = function () {
    // self reference
    var _self = this;
    
    this.childProc = null;
    this.file = "";
    this.rl = null;
    
    // exposed data
    this.init = init;
    this.play = play;
    this.pause = pause;
    this.info = info;
    this.seek = seek;
    
    if (typeof path !== 'undefined')
        this.setFile(path);
    
    events.EventEmitter.call(this);
    
    //cp.exec('mplayer', function (err, stdout, stdin) {
    //    if (err)
    //        throw new Error("Mplayer encountered an error or isn't installed.");
    //});
    
    // implementation
    function init() {
        log.info('[MPLayerClient] Starting up..');
    }
    
    function play(filename) {
        if (!filename) {
            log.alert("*** player no file.");
        }
        else {
            _self.file = filename;
            try {
                _self.rl.close();
            } catch (e1) {
                //log.alert("*** player no interface to disconnect ." + e1);
            };
            
            try {
                _self.childProc.kill('SIGTERM');
            } catch (e2) {
                //log.alert("*** player nothing to kill ." + e2);
            };
            try {
                //var args = ['-slave', '-quiet', 'loop 0', '-playlist' /* added to support playlists */, this.file],
                var args = ['-slave', '-quiet', 'loop 0', this.file],
                    that = this;
                
                _self.childProc = spawn('mplayer', args);
                if (_self.childProc !== null) {
                    log.alert("*** player setup " + " ... " + filename);
                    _self.childProc.stdin.write('volume 100 1\n');
                    _self.childProc.stdin.write('loop 0\n');
                }
                
                _self.childProc.on('error', function (error) {
                    log.alert("*** player Error " + " ... " + filename);
                    that.emit('error');
                });
                
                _self.childProc.on('exit', function (code, sig) {
                    if (code === 0 && sig === null) {
                        log.alert("*** player End " + " ... " + sig + '.' + code);
                        that.emit('end');
                    }
                });
                
                _self.rl = readline.createInterface({
                    input: _self.childProc.stdout,
                    output: _self.childProc.stdin
                });
            }
            catch (ex) {
                log.info("retry playing " + " ... " + filename + " - " + e);
                _self.play(filename);
            }
        }
        log.info("playing " + " ... " + filename);
    }
    
    function pause() {
        if (_self.childProc !== null) {
            _self.childProc.stdin.write('mute\n');
        }
    }
    
    function seek(sec) {
        if (_self.childProc !== null) {
            _self.childProc.stdin.write('seek ' + sec + ' 0\n');
        }
    }
    
    
    function info(callback) {
        if (_self.childProc !== null) {
            _self.rl.question("get_time_pos\n", function (answer) {
                if (answer.split('=')[1] !== undefined) {
                    callback(answer.split('=')[1]);
                }
                //clause not working                
                //if (answer !== null && answer.match(/\S+/g) !== null) {
                //    callback(answer.split('=')[1]);
                //       }
            });
        }
    }
}

util.inherits(MPlayerClient, EventEmitter);
module.exports = MPlayerClient;
