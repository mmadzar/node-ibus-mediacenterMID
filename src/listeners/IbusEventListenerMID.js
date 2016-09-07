var Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color'),
    tools = require('../tools.js'),
    msgs = require('../messages.js'),
    Playlist = require('../media/Playlist.js');

var IbusEventListenerMID = function (config) {
    
    var _self = this;
    
    this.deviceName = 'IbusEventClientMID';
    this.ibusInterface = {};
    this.cdChangerDevice = {};
    this.midDevice = {};
    this.init = init;
    this.currentListType = {};
    
    function init(ibusInterface, cdcDevice, midDevice) {
        _self.ibusInterface = ibusInterface;
        _self.cdChangerDevice = cdcDevice;
        _self.midDevice = midDevice;
        
        _self.title1 = "";
        _self.title2 = "";
        _self.currentPlaylist = new Playlist(config);
        _self.currentPlaylist.init("dir" /*config.currentListType*/);
        
        _self.currentPlaylist.on('statusUpdate', onStatusUpdate)
        
        log.info('[IbusEventListenerMID] Starting up..');
        
        // events
        ibusInterface.on('data', onData);

    }
    
    function onStatusUpdate(data) {
        _self.title1 = data.title1;
        _self.title2 = data.title2;
        log.info(clc.yellow(_self.title1 + " -> " + _self.title2));
        //log.info(JSON.stringify(data));
    }
    
    function onData(data) {
        //log.info(clc.yellow('[IbusEventListener] ', JSON.stringify(data)), clc.green(parseInt(data.src, 16)));
        
        if (parseInt(data.src, 16) == msgs.devices.radio) { //From radio
            if (parseInt(data.dst, 16) == msgs.devices.cd_changer) { //To CD changer
                if (tools.compareMsg(data, msgs.messages.rad_cdReqParams) || tools.compare(data, msgs.messages.rad_cdReqPlay)) {
                   log.info("response");
			 _self.cdChangerDevice.sendPlaying0101();
                }
                else if (tools.compareMsg(data, msgs.messages.rad_cdPool)) {
                    _self.cdChangerDevice.respondAsCDplayer();
                }
            }
            else if (parseInt(data.dst, 16) == msgs.devices.mid) { //To MID
                if (tools.startsWith(data, msgs.messageParts.mid_buttons_for_replaceStart) 
                        && tools.endsWith(data, msgs.messageParts.mid_buttons_for_replaceEnd)) {
                    _self.midDevice.showMp3Menu();
                }
                else if (tools.compareMsg(data, msgs.messages.replace_rad2mid_CD0101)) {
                    log.info("title: " + _self.title1 + ' ' + _self.title2);
                    _self.midDevice.setTitle1(_self.title1);
                    _self.midDevice.setTitle2(_self.title2);
                }
                else if (tools.compareMsg(data, msgs.messages.replace_rad2midCDbuttons)) {
                    _self.midDevice.showMenu1();
                }
            }
        }
        else if (parseInt(data.src, 16) == msgs.devices.mid) { //From MID
            if (parseInt(data.dst, 16) == msgs.devices.radio) { //To radio
                if (tools.compareMsg(data, msgs.messages.radio_1_press)) {
                    _self.currentPlaylist.up();
                }
                else if (tools.compareMsg(data, msgs.messages.radio_2_press)) {
                    _self.currentPlaylist.down();
                }
                else if (tools.compareMsg(data, msgs.messages.radio_3_press)) {
                    _self.currentPlaylist.enter();
                }
                else if (tools.compareMsg(data, msgs.messages.radio_4_press)) {
                    _self.currentPlaylist.back();
                }
                else if (tools.compareMsg(data, msgs.messages.radio_5_press)) {
                    _self.currentPlaylist.current = _self.currentPlaylist.browseCurrent;
                    _self.currentPlaylist.mode = "play";
                    _self.currentPlaylist.play();
                }
                else if (tools.compareMsg(data, msgs.messages.radio_6_press)) {
                    _self.currentPlaylist.queue(_self.currentPlaylist.browseCurrent);
                }
                else if (tools.compareMsg(data, msgs.messages.radio_rev_press)) {
                    _self.currentPlaylist.seek(-10);
                }
                else if (tools.compareMsg(data, msgs.messages.radio_ff_press)) {
                    _self.currentPlaylist.seek(10);
                }
                else if (tools.compareMsg(data, msgs.messages.radio_m_press)) {
                    _self.currentPlaylist.currentTime(function (data) {
                        log.info("............." + data);
                    });
                }
            }
        }
        else if (parseInt(data.src, 16) == msgs.devices.mfl) { //From MFL
            if (parseInt(data.dst, 16) == msgs.devices.radio) { //To radio
                if (tools.compareMsg(data, msgs.messages.previous_press)) {
                    _self.currentPlaylist.previous();
                }
                else if (tools.compareMsg(data, msgs.messages.next_press)) {
                    _self.currentPlaylist.next();
                }
            }
        }
    }
}

module.exports = IbusEventListenerMID;
