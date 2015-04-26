var Command = require('./command');
var crypto = require('crypto');
var Promise = require('bluebird');

function Script(lua, numberOfKeys) {
  this.lua = lua;
  this.sha = crypto.createHash('sha1').update(this.lua).digest('hex');
  this.numberOfKeys = typeof numberOfKeys === 'number' ? numberOfKeys : null;
}

Script.prototype.execute = function (container, args, replyEncoding, callback) {
  if (this.numberOfKeys) {
    args.unshift(this.numberOfKeys);
  }

  var suffix = replyEncoding === 'utf8' ? '' : 'Buffer';

  var result = container['evalsha' + suffix](this.sha, args);
  if (result instanceof Promise) {
    var _this = this;
    return result.catch(function (err) {
      if (err.toString().indexOf('NOSCRIPT') === -1) {
        throw err;
      }
      return container['eval' + suffix](_this.lua, args);
    }).nodeify(callback);
  }

  return result;
};

module.exports = Script;
