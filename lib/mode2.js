var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var events = require('events');
var util = require('util');

/*
 * @param {object} [settings]
 * @param {string} [settings.device] Hardware device to use
 * @param {string} [settings.command]
 * @param {boolean} [settings.raw]
 */
function mode2(settings) {
  // Initialize defaults
  settings = settings || mode2.DEFAULTS;
  this.device = settings.device || mode2.DEFAULTS.device;
  this.driver = (!settings.raw && settings.driver) || mode2.DEFAULTS.driver;
  this.raw = settings.raw || mode2.DEFAULTS.raw;
  this.command = settings.command || mode2.DEFAULTS.command;
  this.args = [];
  if(this.device) {
    this.args.push('-d', this.device);
  }
  if(this.driver) {
    this.args.push('-H', this.driver);
  }
  if(this.raw) {
    this.args.push('-r');
  }
  this._instance = null;
};

util.inherits(mode2, events.EventEmitter);

mode2.COMMAND = 'mode2';

mode2.DEFAULTS = {
  device: null,
  driver: null,
  raw: false,
  command: mode2.COMMAND
}

/*
 * Start mode2
 */
mode2.prototype.start = function(mode) {
  mode = mode || false;
  var args = [];
  if(mode) {
    args.push('-m');
  }
  args = this.args.concat(args);
  if(!this._instance) {
    this._spawn(args);
  }
}

/*
 * Quit mode2
 */
mode2.prototype.quit = function() {
  if(this._instance) {
    this._instance.kill();
  }
}

/*
 * @param {function} callback
 */
mode2.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

mode2.prototype._exec = function(args, callback) {
  args = args.join(' ');
  return exec(this.command + ' ' + args, callback);
}

mode2.prototype._spawn = function(args) {
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
      self._instance = null;
    });
    this._instance.on('close', function() {
      self.emit('close');
      self._instance = null;
    });
  }
}

exports = module.exports = mode2;
