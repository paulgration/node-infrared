var pty = require('pty.js');
var events = require('events');
var util = require('util');
var exec = require('child_process').exec;

startsWith = function(needle, haystack){
  return (haystack.substr(0, needle.length) === needle);
}

/*
 * @param {object} [settings]
 * @param {string} [settings.device] Hardware device to use
 * @param {string} [settings.driver] Used to open the device
 * @param {string} [settings.command] Command string ('irrecord')
 */
function irrecord(settings) {
  settings = settings || irrecord.DEFAULTS;
  this.driver = settings.driver || irrecord.DEFAULTS.driver;
  this.device = settings.device || irrecord.DEFAULTS.device;
  this.command = settings.command || irrecord.DEFAULTS.command;
  this.args = [];
  if(this.driver) {
    this.args.push('-H', this.driver);
  }
  if(this.device) {
    this.args.push('-d', this.device);
  }
  this._instance = null;
};

util.inherits(irrecord, events.EventEmitter);

irrecord.COMMAND = 'irrecord';

irrecord.DEFAULTS = {
  driver: null,
  device: null,
  command: irrecord.COMMAND
}

/*
 * Version of irrecord command
 */
irrecord.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

/*
 * Analyse raw mode config file
 */
irrecord.prototype.analyse = function(filename, callback) {
  var args = ['-a', filename];
  return this._exec(args, callback);
}

/*
 * List LIRC namespace
 */
irrecord.prototype.list_namespace = function(callback) {
  var args = ['-l'];
  return this._exec(args, callback);
}

/*
 * Start irrecord
 * 
 * @param {string} filename Name of the output configuration file
 * @param {object} opts Recording options (force, disable_namespace)
 * @throws Exception when already recording (single lircd instance
 * can only handle one irrecord at a time
 * 
 */
irrecord.prototype.start = function(filename, options) {
  filename = filename || 'remote';
  options = options || {};
  force = options.force || false;
  disable_namespace = options.disable_namespace || false;
  // Check if filename exists and add option to force overwrite?
  var args = [filename];
  if(force) {
    args.push('-f');
  }
  if(disable_namespace) {
    args.push('-n');
  }
  args = this.args.concat(args);
  return this._spawn(args);
}

/*
 * Quit irrecord
 */
irrecord.prototype.quit = function() {
  if(this._instance) {
    // Add clean parameter to clear potentially invalid config file as a result of early quit?
    this._instance.write(String.fromCharCode(3));
  }
}

/*
 * Write to irrecord process if running
 */
irrecord.prototype.write = function(data) {
  if(this._instance) {
    this._instance.write(data + '\n');
  }
}

irrecord.prototype.recording = this._instance ? true : false;

irrecord.prototype._exec = function(args, callback) {
  args = args.join(' ');
  return exec(this.command + ' ' + args, callback);
}

/*
 * Accepts 'args' as an array or string (converted to array) of
 * arguments to pass to pty
 */
irrecord.prototype._spawn = function(args) {
  if(!this._instance) {
    // Split arguments into an array
    if(Object.prototype.toString.call(args) === '[object String]') {
      args = args.split(/\s+/);
    }
    var self = this;
    this._instance = pty.spawn(this.command, args);
    this._instance.on('data', function(data) {
      var eol = '\r\n';
      var stdout = [];
      var stderr = [];
      var lines = data.split(eol);
      for(var i = 0; i < lines.length; i++) {
        // Filter stderr and stdout
        if(startsWith(self.command + ':', lines[i]) || lines[i].match(/Driver `\S+' not supported./)) {
          stderr.push(lines[i]);
        } else {
          stdout.push(lines[i]);
        }
      }
      if(stdout = stdout.join('\r\n')) {
        self.emit('stdout', stdout);
      }
       if(stderr = stderr.join('\r\n')) {
        self.emit('stderr', stderr);
      }
    });
    // pty doesn't provide an exit code :(
    this._instance.on('exit', function() {
      self.emit('exit');
      this._instance = null;
    });
  }
  // Throw an exception here?
}

exports = module.exports = irrecord;

