var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var events = require('events');
var util = require('util');

/*
 * @param {object} [settings]
 * @param {string} [settings.device] LIRCD socket file to connect to ('/var/run/lirc/lircd')
 * @param {string} [settings.command]
 */
function IRW(settings) {
  // Initialize defaults
  settings = settings || IRW.DEFAULTS;
  this.device = settings.device || IRW.DEFAULTS.device;
  this.command = settings.command || IRW.DEFAULTS.command;
  this.args = [];
  if(this.device) {
    this.args.push(this.device);
  }
  this._instance = null;
};

util.inherits(IRW, events.EventEmitter);

IRW.COMMAND = 'irw';

IRW.DEFAULTS = {
  device: null,
  command: IRW.COMMAND
}

/*
 * Start irw
 */
IRW.prototype.start = function() {
  if(!this._instance) {
    this._spawn(this.args);
  }
}

/*
 * Quit irw
 */
IRW.prototype.quit = function() {
  if(this._instance) {
    this._instance.kill('SIGINT');
  }
}

/*
 * @param {function} callback
 */
IRW.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

IRW.prototype._exec = function(args, callback) {
  args = args.join(' ');
  return exec(this.command + ' ' + args, callback);
}

IRW.prototype._spawn = function(args) {
  var self = this;
  console.log(this.command + ' ' + args.join(' '));
  this._instance = spawn(this.command, args);
  this._instance.stdout.on('data', function(data) {
    self.emit('stdout', data);
  });
  this._instance.stderr.on('data', function(data) {
    self.emit('stderr', data);
  });
  this._instance.on('exit', function() {
    self.emit('exit');
  });
  this._instance.on('close', function() {
    self.emit('close');
  });
}

exports = module.exports = IRW;
