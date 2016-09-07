// https://raw.githubusercontent.com/loics2/node-mplayer/master/lib/node-mplayer.js

var cp = require('child_process'),
    events = require('events'),
    fs = require('fs'),
    readline = require('readline'),
    Log = require('log'),
    log = new Log('info'),
    spawn = cp.spawn;

function Mplayer(path){
    this.childProc = null;
    this.file = "";
    this.rl = null;

    if(typeof path !== 'undefined')
        this.setFile(path);

    events.EventEmitter.call(this);

    cp.exec('mplayer', function(err, stdout, stdin){
        if(err)
            throw new Error("Mplayer encountered an error or isn't installed.");
    });
};

Mplayer.prototype.__proto__ = events.EventEmitter.prototype;

Mplayer.prototype.play = function(opts) {
    if(this.file !== null){
        //var args = ['-slave', '-quiet', 'loop 0', '-playlist' /* added to support playlists */, this.file],
        var args = ['-slave', '-quiet', 'loop 0', this.file],
            that = this;

        this.childProc = spawn('mplayer', args);

        if(typeof opts !== 'undefined'){
            if(typeof opts.volume !== 'undefined')
                this.setVolume(opts.volume);

            if(typeof opts.loop !== 'undefined')
                this.setLoop(opts.loop);
        }


        this.childProc.on('error', function(error){
            that.emit('error');
        });

        this.childProc.on('exit', function(code, sig){
            if (code === 0 && sig === null)
                that.emit('end');
        });

        this.rl = readline.createInterface({
            input: this.childProc.stdout,
            output: this.childProc.stdin
        });
    }
};

Mplayer.prototype.stop = function() {
    if(this.childProc !== null){
        this.childProc.stdin.write('stop\n');
    }
};

Mplayer.prototype.pause = function() {
    if(this.childProc !== null){
        this.childProc.stdin.write('pause\n');
    }
};

Mplayer.prototype.mute = function() {
    if(this.childProc !== null){
        this.childProc.stdin.write('mute\n');
    }
};

Mplayer.prototype.setVolume = function(volume) {
    if(this.childProc !== null){
        this.childProc.stdin.write('volume ' + volume + ' 1\n');
    }
};

Mplayer.prototype.seek = function(sec) {
    if(this.childProc !== null){
        this.childProc.stdin.write('seek ' + sec + ' 0\n');
    }
};

Mplayer.prototype.setLoop = function(times) {
    if(this.childProc !== null){
        this.childProc.stdin.write('loop ' + times + '\n');
    }
};

Mplayer.prototype.setSpeed = function(speed) {
    if(this.childProc !== null){
        this.childProc.stdin.write('speed_set ' + speed + '\n');
    }
};

Mplayer.prototype.setFile = function(path) {
    if(fs.existsSync(path))
        this.file = path;
    else
        throw new Error("File '" + path + "' not found!");
};

Mplayer.prototype.getTimeLength = function(callback) {
    if(this.childProc !== null){
        this.rl.question("get_time_length\n", function(answer) {
            callback(answer.split('=')[1]);
        });
    }
};


Mplayer.prototype.getTimePosition = function(callback) {
    if(this.childProc !== null){
        log.info("getting answer... ");
        this.rl.question("get_time_pos\n", function (answer) {
            log.info("answer1: " + JSON.stringify(answer));
            log.info("answer2: " + answer);
            log.info("answer3: " + JSON.stringify(answer));
            if(answer !== null && answer.match(/\S+/g) !== null){
                callback(answer.split('=')[1]);
            }
        });
    }
};

Mplayer.prototype.getMetaTitle = function(callback) {
    if (this.childProc !== null) {
        this.rl.question("get_meta_title\n", function (answer) {
            var a = answer.split('=')[1];
            if(a !== undefined){
                callback(a.substring(1, a.length - 1));
            }
        });
    }
};

Mplayer.prototype.getMetaArtist = function(callback) {
    if(this.childProc !== null){
        this.rl.question("get_meta_artist\n", function(answer) {
            var a = answer.split('=')[1];
            if(a !== undefined){
                callback(a.substring(1, a.length - 1));
            }
        });
    }
};

Mplayer.prototype.getFilename = function(callback) {
    if(this.childProc !== null){
        log.info("getting answer... ");
      this.rl.question("get_file_name\n", function (answer) {
            log.info("answer1: " + JSON.stringify(answer));
            log.info("answer2: " + answer);
            log.info("answer3: " + JSON.stringify(answer));

            var a = answer.split('=')[1];
            callback(a.substring(1, a.length - 5));
        });
    }
};

Mplayer.prototype.next = function(step) {
    if(this.childProc !== null){
        console.log("next");
        this.childProc.stdin.write("pt_step " + step + " 1\n");
    }
};

Mplayer.prototype.previous = function(step) {
    if(this.childProc !== null){
        console.log("previous");
        this.childProc.stdin.write("pt_step -" + step + " 1\n");
    }
};
Mplayer.prototype.quit = function () {
    if (this.childProc !== null) {
        console.log("quit");
        this.childProc.stdin.write("quit\n");
    }
};
Mplayer.prototype.seek = function (sec) {
    if (this.childProc !== null) {
        this.childProc.stdin.write('seek ' + sec + ' 2\n');
    }
};

module.exports = Mplayer;