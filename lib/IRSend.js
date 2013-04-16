var exec = require('child_process').exec;

/*
 * @param {object} [settings]
 * @param {string} [settings.device] LIRCD socket file to connect to ('/var/run/lirc/lircd')
 * @param {string} [settings.address] Address and optional port of host running LIRCD instance ('address[:port]')
 * @param {string} [settings.command] Command string ('irsend')
 */
function IRSend(settings) {
  // Initialize defaults
  settings = settings || IRSend.DEFAULTS;
  // Set device to null if address is given as device will be ignored
  this.device = (!settings.address && settings.device || IRSend.DEFAULTS.device);
  this.address = settings.address || IRSend.DEFAULTS.address;
  this.command = settings.command || IRSend.DEFAULTS.command;
  this.args = [];
  if(this.address) {
    this.args.push('-a', this.address);
  }
  if(this.device) {
    this.args.push('-d', this.device);
  }
};

IRSend.COMMAND = 'irsend';

IRSend.DEFAULTS = {
  address: null,
  device: null,
  command: IRSend.COMMAND
}

/*
 * @param {string} remote
 * @param {string|array} code
 * @param {function} callback
 */
IRSend.prototype.send_once = function(remote, code, callback) {
  if(Object.prototype.toString.call(code) === '[object] Array') {
    code = code.join(' ');
  }
  var args = ['SEND_ONCE', remote, code];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {string} remote
 * @param {string} code
 * @param {integer} count
 * @param {function} callback
 */
IRSend.prototype.send_once_repeat = function(remote, code, count,
    callback) {
  var args = ['SEND_ONCE', remote, code, '-#', count];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {string} remote
 * @param {string} code
 * @param {function} callback
 */
IRSend.prototype.send_start = function(remote, code, callback) {
  var args = ['SEND_START', remote, code];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {string} remote
 * @param {string} code
 * @param {function} callback
 */
IRSend.prototype.send_stop = function(remote, code, callback) {
  /*
   * LIRC only allows for the continuous transmission of one code at a
   * time so specifying remote and code is overkill but expected.
   * May be sensible to simplify this by keeping a record of what code
   * is being sent and just call send_stop(callback)
   */
  var args = ['SEND_STOP', remote, code];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {string} remote
 * @param {string} code
 * @param {function} callback
 */
IRSend.prototype.list = function(remote, code, callback) {
  if(!remote) {
    remote = '""';
    code = '""';
  }
  if(!code) {
    code = '""';
  }
  var args = ['LIST', remote, code];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {array|string} remote
 * @param {function} callback
 */
IRSend.prototype.set_transmitters = function(transmitters, callback) {
  if(Object.prototype.toString.call(transmitters) ===
      '[object] String') {
    transmitters = transmitters.split(' ');
  }
  var args = ['SET_TRANSMITTERS'];
  args = args.concat(transmitters);
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {string} code
 * @param {function} callback
 */
IRSend.prototype.simulate = function(code, callback) {
  var args = ['SIMULATE', '"' + code + '"'];
  args = this.args.concat(args);
  return this._exec(args, callback);
}

/*
 * @param {function} callback
 */
IRSend.prototype.version = function(callback) {
  var args = ['-v'];
  return this._exec(args, callback);
}

IRSend.prototype._exec = function(args, callback) {
  args = args.join(' ');
  //console.log(this.command + ' ' + args);
  return exec(this.command + ' ' + args, callback);
}

exports = module.exports = IRSend;
