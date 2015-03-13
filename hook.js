var arraySlice = [].slice;

// Get global context 'safely'
var global = (function() { return this; }());

/**
 *
 * @param {Array} callbacks The callbacks for the hook
 * @constructor
 */
function Hook(callbacks) {
    // Avoid weird things happening when new callbacks are added
    this._callbacks = callbacks.slice(0);

    this._running = false;
    this._onResume = function() {};
}

module.exports = Hook;

/**
 * Begins executing the hook list
 * If the list is already running (i.e hasn't been cancelled or has reached the end)
 * this will do nothing.
 *
 * @param {Array} args Arguments to provide to callbacks
 * @returns {Hook} this
 */
Hook.prototype.trigger = function(args) {
    if (this._running) return this;
    this._running = true;

    var self = this, cbs = this._callbacks, i = 0, x = 0;
    var currentArgs = [];

    function doNext() {
        if (!self._running || i >= cbs.length) {
            self._onResume = doNext;
            return self;
        }

        var nextArgs = arguments.length ? arraySlice.call(arguments, 0) : [];
        for (x = 0; x < nextArgs.length; x++) {
            if (nextArgs[x] != null) currentArgs[x] = nextArgs[x];
        }

        var currentCallback = cbs[i++];
        var provideArgs = args.slice(0), hasTriggered = false;
        provideArgs.push(function() {
            if (hasTriggered) return;
            return doNext.apply(this, arguments);
        });
        provideArgs.push(currentArgs);
        return currentCallback.apply(global, provideArgs);
    }
    doNext();
    return this;
};

/**
 * Resumes executing of the hook list
 * The list can be paused with Hook#cancel or Hook#pause.
 *
 * @returns {Hook}
 */
Hook.prototype.resume = function() {
    this._running = true;
    this._onResume();
    return this;
};

/**
 * Cancels or pauses the hook
 *
 * @type {Function}
 */
Hook.prototype.cancel = Hook.prototype.pause = function() {
    this._running = false;
    return this;
};