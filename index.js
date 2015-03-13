var arraySlice = [].slice;

var wildcard = require('wildcard');
var Hook = require('./hook');

/**
 * HookJS
 * 
 * Hooks are an excellent way to customize the behaviour of code, through a hybrid
 * of events and promises.
 *
 * @author mrfishie <me@mrfishie.com>
 * @constructor
 */
function HookEmitter() {
    this._hooks = {};
}

HookEmitter.HookEmitter = HookEmitter;
HookEmitter.Hook = Hook;

module.exports = HookEmitter;


/**
 * Add a handler to a hook
 *
 * @param {String} name The name of the hook
 * @param {Function} cb The hook callback
 * @returns {HookEmitter} this
 */
HookEmitter.prototype.hook = function(name, cb) {
    if (!this._hooks[name]) this._hooks[name] = { items: [], obj: false };
    this._hooks[name].items.unshift(cb);
    return this;
};

/**
 * Triggers a hook
 *
 * @param {String} name The name of the hook
 * @param {Array} args Arguments to provide to the hook (provide as arguments...)
 * @returns {Hook} The hook object
 */
HookEmitter.prototype.triggerHook = function(name, args) {
    if (!this._hooks[name]) return new Hook([]); // create dummy hook
    var hookObj = this._hooks[name];
    if (hookObj.obj) hookObj.obj.cancel();
    hookObj.obj = new Hook(hookObj.items);
    hookObj.obj.trigger(arraySlice.call(arguments, 1));
    return hookObj.obj;
};

/**
 * Cancel or pause a hook
 *
 * @param {String} name
 */
HookEmitter.prototype.cancelHook = HookEmitter.prototype.pauseHook = function(name) {
    for (var hName in this._hooks) {
        if (!this._hooks.hasOwnProperty(hName) || !wildcard(name, hName)) continue;
        this._hooks[hName].obj.cancel();
    }
    return this;
};

/**
 * Resume a hook
 *
 * @param {String} name
 */
HookEmitter.prototype.resumeHook = function(name) {
    for (var hName in this._hooks) {
        if (!this._hooks.hasOwnProperty(hName) || !wildcard(name, hName)) continue;
        this._hooks[hName].obj.resume();
    }
    return this;
};