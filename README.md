# Hookjs

Hooks are a sort of hybrid between events and promises.

Hooks allow actions and events to be easily customized by allowing the parent application to interrupt the 'event list'.

**Simple Example:**

```javascript
var game = new Game();

game.hook('player.talkTo', function(basePlayer, player2, message, next) {
	player2.send(basePlayer, message);

    next();
});
```

You might have some kind of API (e.g. a game server interface) where you want the parent application to be able to 'inject' events or prevent the default actions from occuring. This is where hooks come in.

With hooks, the application would trigger a 'hook' when an action occurs, and provide a default handler for this. When the hook is triggered, all callbacks in the 'hook event list' will be executed in reverse-order, meaning the first to be added will be called last and vice versa.

Each callback is provided with the arguments provided to the trigger function, as well as a `next` function and `args` array.

To call the next callback in the chain, each callback would call it's `next` function. A callback can call this function whenever it wants, however calling it twice or more will not work. If the hook has been triggered again in the time between when the callback is called and the next function is called, or the hook is cancelled, the next function will not do anything.

If a hook wishes to 'end the chain', it can simply not call the `next` function. This might be useful if you want to prevent the default hook from being called.

Arguments can be provided to the `next` function. These arguments will be provided in the `args` array in the next callback. Arguments will be retained until overwritten (i.e if the next function is called with arguments `1, 2`, and then called with one argument: `3`, the resulting value of the `args` array will be `3, 2`).

Hooks are designed to compliment events. As a result, the HookEmitter class does not overwrite any functions that would be used for an EventEmitter (e.g. `emit`)

Hook names *should always* be namespaced, with a dot separating each section (although this is not enforced). The first section should describe the type of object that 'does' the action, and the second section should be the action. More than 2 sections *are* allowed. Additionally, the first argument passed to the hook should always be the object that 'does' the action.

### Usage

Install with NPM:

	npm install hooks --save

Inherit the HookEmitter class:

```javascript
var HookEmitter = require('hooks'), // or require('hooks').HookEmitter
util = require('util')

function myClass() { }
util.inherits(HookEmitter, myClass);
```

Add a hook:

```javascript
myClass.hook('user.doesSomething', function(user, next) {
	/* ... */
    next();
});
```

Trigger a hook:

```javascript
myClass.trigger('user.doesSomething', user);
```

### API Reference

#### HookEmitter()

Creates a `HookEmitter` object with no hooks.

**HookEmitter#hook(string name, function cb)**

Add a hook callback (`cb`) to the hook `name`.
Returns self for method chaining.

**HookEmitter#triggerHook(name, args...)**

Trigger the hook `name`.
Returns the `Hook` object.

**HookEmitter#cancelHook(name)**

**HookEmitter#pauseHook(name)**

Cancels or pauses the hook `name`. `name` can have wildcards (`*`), in which case any matching hooks will be cancelled or paused.
Returns self for method chaining.

**HookEmitter#resumeHook(name)**

Resumes the hook `name`. `name` can have wildcards (`*`), in which case any matching hooks will be resumed.
Returns self for method chaining.

#### Hook([function] callbacks)

Creates a `Hook` object with the provided `callbacks` array.

**Hook#trigger(array args)**

Begins executing the callback list. If the list is already running (i.e hasn't been cancelled or hasn't reached the end) this will do nothing. *Keep in mind that if a callback does not call `next` the list will always be running unless manually cancelled.*
Returns self for method chaining.

**Hook#cancel()**

**Hook#pause()**

Cancels or pauses the hook.
Returns self for method chaining.

**Hook#resume()**

Resumes executing of the callback list. The list can be paused with `#cancel` or `#pause`.
Returns self for method chaining.