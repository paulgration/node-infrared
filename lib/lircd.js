var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var events = require('events');
var util = require('util');

/*
 * @param {object} [settings=lircd.DEFAULTS]
 * @param {boolean} [settings.nodaemon]
 * @param {integer} [settings.permission]
 * @param {string} [settings.driver]
 * @param {string} [settings.device]
 * @param {boolean|string} [settings.listen]
 * @param {string} [settings.connect]
 * @param {string} [settings.output]
 * @param {string} [settings.pidfile]
 * @param {string} [settings.logfile]
 * @param {boolean|string} [settings.release]
 * @param {boolean} [settings.allow_simulate]
 * @param {boolean} [settings.uinput]
 * @param {integer} [settings.repeat_max]
 */
function lircd(settings) {
  settings = settings || lircd.DEFAULTS;
  this.nodaemon = settings.nodaemon || lircd.DEFAULTS.nodaemon;
  this.permission = settings.permission || lircd.DEFAULTS.permission;
  this.driver = settings.driver || lircd.DEFAULTS.driver;
  this.device = settings.device || lircd.DEFAULTS.device;
  this.listen = settings.listen || lircd.DEFAULTS.listen;
  this.connect = settings.connect || lircd.DEFAULTS.connect;
  this.output = settings.output || lircd.DEFAULTS.output;
  this.pidfile = settings.pidfile || lircd.DEFAULTS.pidfile;
  this.logfile = settings.logfile || lircd.DEFAULTS.logfile;
  this.release = settings.release || lircd.DEFAULTS.release;
  this.allow_simulate = settings.allow_simulate || lircd.DEFAULTS.allow_simulate;
  this.uinput = settings.uinput || lircd.DEFAULTS.uinput;
  this.repeat_max = settings.repeat_max || lircd.DEFAULTS.repeat_max;
  this.config_file = settings.config_file || lircd.DEFAULTS.config_file;
  
  this.command = settings.command || lircd.COMMAND;
  this.args = [];
  if(this.nodaemon) {
    this.args.push('-n');
  }
  if(this.permission) {
    this.args.push('-p', this.permission);
  }
  if(this.driver) {
    this.args.push('-H', this.driver);
  }
  if(this.device) {
    this.args.push('-d', this.device);
  }
  if(this.listen) {
    var args = '-l';
    if(Object.prototype.toString.call(this.listen) === '[object String]') {
      args += this.listen;
    }
    this.args.push(args);
  }
  if(this.connect) {
    this.args.push('-c', this.connect);
  }
  if(this.output) {
    this.args.push('-o', this.output);
  }
  if(this.pidfile) {
    this.args.push('-P', this.pidfile);
  }
  if(this.logfile) {
    this.args.push('-L', this.logfile);
  }
  if(this.release) {
    var args = '-r';
    if(Object.prototype.toString.call(this.release) === '[object String]') {
      args += this.release;
    }
    this.args = this.args.concat(args);
  }
  if(this.allow_simulate) {
    this.args.push('-a');
  }
  if(this.uinput) {
    this.args.push('-u');
  }
  if(this.repeat_max) {
    this.args.push('-R', this.repeat_max);
  }
  if(this.config_file) {
    this.args.push(this.config_file);
  }
  this._instance = null;
  this.running = false;
}

util.inherits(lircd, events.EventEmitter);

lircd.COMMAND = 'lircd';

lircd.DEFAULTS = {
  nodaemon: true,
  permission: null,
  driver: null,
  device: null,
  listen: null,
  connect: null,
  output: null,
  pidfile: null,
  logfile: null,
  release: null,
  allow_simulate: false,
  uinput: false,
  repeat_max: null,
  config_file: null,
  command: lircd.COMMAND
}

/*
 * @param {function} callback
 */
lircd.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

/*
 * Start lircd
 */
lircd.prototype.start = function() {
  return this._spawn(this.args);
}

/*
 * Quit lircd
 */
lircd.prototype.quit = function() {
  if(this._instance) {
    this._instance.kill();
  }
}

/*
 * Reload configuration file
 */
lircd.prototype.reload = function() {
  if(this._instance) {
    this._instance.kill('SIGHUP');
  }
}

lircd.prototype._exec = function(args, callback) {
  args = args.join(' ');
  return exec(this.command + ' ' + args, callback);
}


lircd.prototype._spawn = function(args) {
  var self = this;
  this._instance = spawn(this.command, args);
  this._instance.stdout.on('data', function(data) {
    data = String(data);
    self.emit('stdout', data);
  });
  var pattern = new RegExp(this.command + '\\S*: lircd\\(\\S+\\) ready, using \\S+');
  this._instance.stderr.on('data', function(data) {
    data = String(data);
    if(data.match(pattern)) {
      this.running = true;
      self.emit('running');
    }
    self.emit('stderr', data);
  });
  this._instance.on('exit', function() {
    self._finish();
    self.emit('exit');
  });
  this._instance.on('close', function() {
    self._finish();
    self.emit('close');
  });
}

lircd.prototype._finish = function() {
  this.running = false;
}

exports = module.exports = lircd;
