var fs = require('fs');

module.exports = function () {
    return new config();
}

function config() {
    var _self = this;
    var filename = "./config.json";
    // Private state variables
    var cfg = {};
    var saved = "";
    
    try {
        saved = fs.re.readFileSync(filename)
        JSON.parse(saved, cfg);
    }
    catch (ex) {
        cfg = {
            mediaPath: "/mnt/usbstick",
            //mediaPath: "/media/usbstick",
            //mediaPath: "/media/MP316", 
            currentListType: "dir",
            dirCurrent: {},
            plsCurrent: {},
            queCurrent: {}
        };
        fs.writeFile(filename, JSON.stringify(cfg));
    }
    
    // Public method
    _self.saveSettings = function () {
        fs.writeFile(filename, JSON.stringify(cfg));
    };
    
    _self.mediaPath = cfg.mediaPath;
}