var Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color'),
    tools = require('./tools.js');

var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();

    cluster.on('exit', function(worker, code, signal) {
        if (code === 0) {
            log.error('Worker ' + worker.id + ' died..');
            cluster.fork();
        } else {
            log.error('Worker ' + worker.id + ' terminated..');
        }
    });
} else {
    var Config = require('./config.js');
    var IbusInterface = require('ibus').IbusInterface;
    var IbusDevices = require('ibus').IbusDevices;

    var CDChangerDevice = require('./devices/CDChangerDevice.js')
    var MidDevice = require('./devices/MidDevice.js');
    var IkeDevice = require('./devices/IkeDevice.js');
    var IbusDebuggerDevice = require('./devices/IbusDebuggerDevice.js');
    //var KeyboardEventListener = require('./listeners/KeyboardEventListener.js');

    var IbusEventListenerMID = require('./listeners/IbusEventListenerMID.js');
    
    var cfg = new Config();
    
    // config
    var device = '/dev/ttyUSB0';
    
    // IBUS communication interface
    var ibusInterface = new IbusInterface(device);

    // Ibus debugger
    var ibusDebuggerDevice = new IbusDebuggerDevice();

    // MID Multi Information Display Device
    var midDevice = new MidDevice(ibusInterface);
    
    // CD Changer Device
    var cdcDevice = new CDChangerDevice(ibusInterface);
    
    // IKE Instrument Cluster Electronics Device
    var ikeDevice = new IkeDevice(ibusInterface);
    
    // Ibus MID Event Client
    var ibusEventClientMID = new IbusEventListenerMID(cfg);
    // Keyboard Client
    //var keyboardEventListener = new KeyboardEventListener();

    // events
    process.on('SIGINT', onSignalInt);
    process.on('SIGTERM', onSignalTerm);
    //TODO uncomment for production 
    //process.on('uncaughtException', onUncaughtException);

    // implementation
    function onSignalInt() {
        shutdown(function() {
            process.exit(1);
        });
    }

    function onSignalTerm() {
        log.info('Hard exiting..');
        process.exit(1);
    }

    var isShuttingDown = false;

    function onUncaughtException(err) {

        log.error('[exception-handler] caught: ', err);
        log.alert('Node NOT exiting...');

        //if (isShuttingDown) {
        //    log.info('[exception-handler] Waiting for previous restart..');
        //    return;
        //}

        //log.info('[exception-handler] Exiting app in 5 seconds...');

        //// is shutting down but still capturing the errors
        //isShuttingDown = true;

        //// restart app    
        //setTimeout(function() {
        //    shutdown(function() {
        //        log.info('[exception-handler] Shutdown success..');
        //        process.exit();
        //    });
        //}, 5000);
    }

    function startup(successFn) {
        tools.init();
        // init ibus serial interface
        ibusInterface.startup();

        // ibus debugger
        ibusDebuggerDevice.init(ibusInterface); //, ['18', '68', '0c']);

        cdcDevice.init(ibusInterface);
        ikeDevice.init(ibusInterface);
        midDevice.init(ibusInterface);

        // init mid event client
        ibusEventClientMID.init(ibusInterface, cdcDevice, midDevice);

        // init keyboard listeren
        //keyboardEventListener.init();
        //keyboardEventListener.setRemoteControlClient('ibus', ibusDebuggerDevice);
    }

    function shutdown(successFn) {
        ibusInterface.shutdown(function() {
            successFn();
        });
    }

    // main start
    startup();
}
