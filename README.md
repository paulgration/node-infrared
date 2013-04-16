# node_ir


Wrapper for lirc

Most common usage:

    var node_ir = require('./node_ir');

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

    var irsend = new node_ir.IRSend();
    irsend.list('', '', callback);

## Using IRRecord (may require elevated privileges)

    var irrecord = new node_ir.IRRecord();
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

    var irw = new node_ir.IRW();
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

    var receiver1 = new node_ir.LIRCD({device: 'serial=00000001',
      output: 'receiver1',
      pidfile: 'receiver1.pid',
      logfile: 'receiver1.log
    });
    var transmitter1 = new node_ir.LIRCD({device: 'serial=00000002',
      output: 'transmitter1',
      pidfile: 'transmitter1.pid',
      logfile: 'transmitter1.log
    });
    var transmitter2 = new node_ir.LIRCD({device: 'serial=01234567',
      output: 'transmitter2',
      pidfile: 'transmitter2.pid',
      logfile: 'transmitter2.log
    });
    
    var rx1 = new node_ir.IRRecord({device: 'receiver1'});
    rx1.on('stdout', function(data) {
      // handle output
    });
    
    var tx1 = new node_ir.IRSend({device: 'transmitter1'});
    var tx2 = new node_ir.IRSend({device: 'transmitter2'});
    
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

More features to come...
