var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var events = require('events');
var util = require('util');

/*
 * @param {object} [settings]
 * @param {string} [settings.device] LIRCD socket file to connect to ('/var/run/lirc/lircd')
 * @param {string} [settings.command]
 */
function irw(settings) {
  // Initialize defaults
  settings = settings || irw.DEFAULTS;
  this.device = settings.device || irw.DEFAULTS.device;
  this.command = settings.command || irw.DEFAULTS.command;
  this.args = [];
  if(this.device) {
    this.args.push(this.device);
  }
  this._instance = null;
};

util.inherits(irw, events.EventEmitter);

irw.COMMAND = 'irw';

irw.DEFAULTS = {
  device: null,
  command: irw.COMMAND
}

/*
 * Start irw
 */
irw.prototype.start = function() {
  if(!this._instance) {
    this._spawn(this.args);
  }
}

/*
 * Quit irw
 */
irw.prototype.quit = function() {
  if(this._instance) {
    this._instance.kill();
  }
}

/*
 * @param {function} callback
 */
irw.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

irw.prototype._exec = function(args, callback) {
  args = args.join(' ');
  return exec(this.command + ' ' + args, callback);
}

irw.prototype._spawn = function(args) {
  if(!this._instance) {
    var self = this;
    this._instance = spawn(this.command, args);
    this._instance.stdout.on('data', function(data) {
      data = String(data);
      self.emit('stdout', data);
    });
    this._instance.stderr.on('data', function(data) {
      data = String(data);
      self.emit('stderr', data);
    });
    this._instance.on('exit', function() {
      self.emit('exit');
      this._instance = null;
    });
    this._instance.on('close', function() {
      self.emit('close');
      this._instance = null;
    });
  }
}

exports = module.exports = irw;
