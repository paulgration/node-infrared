# node-infrared


Wrapper for lirc

Most common usage:

    var callback = function(error, stdout, stderr) {
      if(error) {
        console.log('error: ' + error);
      }
      if(stdout) {
        console.log('stdout: ' + stdout);
      }
      if(stderr) {
        console.log('stderr: ' + stderr);
      }
    }
    ...

## Using IRSend

    var IRSend = require('infrared').irsend;

    var irsend = new IRSend();
    irsend.list('', '', callback);

## Using IRRecord (may require elevated privileges)

    var IRRecord = require('infrared').irrecord;
    
    var irrecord = new IRRecord();
    irrecord.on('stdout', function(data) {
      console.log(data);
    });
    irrecord.on('stderr', function(data) {
      console.log(data);
    });
    irrecord.on('exit', function() {
      // handle exit event
    });
    irrecord.start('remote', {disable_namespace: true});

    /*
    setTimeout(function() {
      irrecord.quit();
    }, 5000);
    */

## Using IRW

    var IRW = require('infrared').irw;

    var irw = new IRW();
    irw.on('stdout', function(data) {
      console.log(data);
    });
    irw.on('stderr', function(data) {
      console.log(data);
    });
    // etc

If the distribution of linux isn't automatically handling the creation
of lircd instances or more are required these can also be created
(may need elevated privileges depending on where the lircd socket file
is to reside and whether uinput is required).

    var LIRCD = require('infrared').lircd;
    var IRRecord = require('infrared').irrecord;
    var IRSend = require('infrared').irsend;

    var receiver1 = new LIRCD({device: 'serial=00000001',
      output: 'receiver1',
      pidfile: 'receiver1.pid',
      logfile: 'receiver1.log'
    });
    var transmitter1 = new LIRCD({device: 'serial=00000002',
      output: 'transmitter1',
      pidfile: 'transmitter1.pid',
      logfile: 'transmitter1.log'
    });
    var transmitter2 = new LIRCD({device: 'serial=01234567',
      output: 'transmitter2',
      pidfile: 'transmitter2.pid',
      logfile: 'transmitter2.log'
    });
    
    var rx1 = new IRRecord({device: 'receiver1'});
    rx1.on('stdout', function(data) {
      // handle output
    });
    
    var tx1 = new IRSend({device: 'transmitter1'});
    var tx2 = new IRSend({device: 'transmitter2'});
    
    receiver1.on('running', function() {
      rx1.start('remote');
      // etc
    });
        
    transmitter1.on('running', function() {
      tx1.list('', '', callback);
    });
          
    transmitter2.on('running', function() {
      tx2.send_once('remote', 'code', callback);
    });

    receiver1.start();
    transmitter1.start();
    transmitter2.start();

More features to come...
