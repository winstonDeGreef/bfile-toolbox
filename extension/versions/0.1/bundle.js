
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run$1(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run$1);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function init_binding_group(group) {
        let _inputs;
        return {
            /* push */ p(...inputs) {
                _inputs = inputs;
                _inputs.forEach(input => group.push(input));
            },
            /* remove */ r() {
                _inputs.forEach(input => group.splice(group.indexOf(input), 1));
            }
        };
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                /** #7364  target for <template> may be provided as #document-fragment(11) */
                else
                    this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
                this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run$1).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.58.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /**
     * @typedef {import('svelte').ComponentType} SvelteComponent
     */

    /**
     * @typedef {import('svelte/types/runtime/transition/index').FlyParams} FlyParams
     */

    /**
     * @typedef {Object} SvelteToastCustomComponent
     * @property {SvelteComponent} src - custom Svelte Component
     * @property {Object<string,any>} [props] - props to pass into custom component
     * @property {string} [sendIdTo] - forward toast id to prop name
     */

    /**
     * @callback SvelteToastOnPopCallback
     * @param {number} [id] - optionally get the toast id if needed
     */

    /**
     * @typedef {Object} SvelteToastOptions
     * @property {number} [id] - unique id generated for every toast
     * @property {string} [target] - container target name to send toast to
     * @property {string} [msg] - toast message
     * @property {number} [duration] - duration of progress bar tween from initial to next
     * @property {number} [initial] - initial progress bar value
     * @property {number} [next] - next progress bar value
     * @property {boolean} [pausable] - pause progress bar tween on mouse hover
     * @property {boolean} [dismissable] - allow dissmiss with close button
     * @property {boolean} [reversed] - display toasts in reverse order
     * @property {FlyParams} [intro] - toast intro fly animation settings
     * @property {Object<string,string|number>} [theme] - css var overrides
     * @property {string[]} [classes] - user-defined classes
     * @property {SvelteToastOnPopCallback} [onpop] - callback that runs on toast dismiss
     * @property {SvelteToastCustomComponent} [component] - send custom Svelte Component as a message
     * @property {number} [progress] - DEPRECATED
     */

    /** @type {SvelteToastOptions} */
    const defaults = {
      duration: 4000,
      initial: 1,
      next: 0,
      pausable: false,
      dismissable: true,
      reversed: false,
      intro: { x: 256 }
    };

    function createToast() {
      const { subscribe, update } = writable(new Array());
      /** @type {Object<string,SvelteToastOptions>} */
      const options = {};
      let count = 0;

      /** @param {any} obj */
      function _obj(obj) {
        return obj instanceof Object
      }

      function _init(target = 'default', opts = {}) {
        options[target] = opts;
        return options
      }

      /**
       * Send a new toast
       * @param {(string|SvelteToastOptions)} msg
       * @param {SvelteToastOptions} [opts]
       * @returns {number}
       */
      function push(msg, opts) {
        const param = {
          target: 'default',
          ...(_obj(msg) ? /** @type {SvelteToastOptions} */ (msg) : { ...opts, msg })
        };
        const conf = options[param.target] || {};
        const entry = {
          ...defaults,
          ...conf,
          ...param,
          theme: { ...conf.theme, ...param.theme },
          classes: [...(conf.classes || []), ...(param.classes || [])],
          id: ++count
        };
        update((n) => (entry.reversed ? [...n, entry] : [entry, ...n]));
        return count
      }

      /**
       * Remove toast(s)
       * - toast.pop() // removes the last toast
       * - toast.pop(0) // remove all toasts
       * - toast.pop(id) // removes the toast with specified `id`
       * - toast.pop({ target: 'foo' }) // remove all toasts from target `foo`
       * @param {(number|Object<'target',string>)} [id]
       */
      function pop(id) {
        update((n) => {
          if (!n.length || id === 0) return []
          // Filter function is deprecated; shim added for backward compatibility
          if (typeof id === 'function') return n.filter((i) => id(i))
          if (_obj(id))
            return n.filter(/** @type {SvelteToastOptions[]} i */ (i) => i.target !== id.target)
          const found = id || Math.max(...n.map((i) => i.id));
          return n.filter((i) => i.id !== found)
        });
      }

      /**
       * Update an existing toast
       * @param {(number|SvelteToastOptions)} id
       * @param {SvelteToastOptions} [opts]
       */
      function set(id, opts) {
        /** @type {any} */
        const param = _obj(id) ? id : { ...opts, id };
        update((n) => {
          const idx = n.findIndex((i) => i.id === param.id);
          if (idx > -1) {
            n[idx] = { ...n[idx], ...param };
          }
          return n
        });
      }

      return { subscribe, push, pop, set, _init }
    }

    const toast = createToast();

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules/@zerodevx/svelte-toast/ToastItem.svelte generated by Svelte v3.58.0 */
    const file$c = "node_modules/@zerodevx/svelte-toast/ToastItem.svelte";

    // (97:4) {:else}
    function create_else_block(ctx) {
    	let html_tag;
    	let raw_value = /*item*/ ctx[0].msg + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && raw_value !== (raw_value = /*item*/ ctx[0].msg + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(97:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (95:4) {#if item.component}
    function create_if_block_1$7(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*cprops*/ ctx[2]];
    	var switch_value = /*item*/ ctx[0].component.src;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*cprops*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*cprops*/ ctx[2])])
    			: {};

    			if (dirty & /*item*/ 1 && switch_value !== (switch_value = /*item*/ ctx[0].component.src)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(95:4) {#if item.component}",
    		ctx
    	});

    	return block;
    }

    // (101:2) {#if item.dismissable}
    function create_if_block$9(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "_toastBtn pe svelte-95rq8t");
    			attr_dev(div, "role", "button");
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$c, 101, 4, 2263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", /*close*/ ctx[4], false, false, false, false),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(101:2) {#if item.dismissable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let t1;
    	let progress_1;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$7, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[0].component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*item*/ ctx[0].dismissable && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			progress_1 = element("progress");
    			attr_dev(div0, "role", "status");
    			attr_dev(div0, "class", "_toastMsg svelte-95rq8t");
    			toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			add_location(div0, file$c, 93, 2, 2026);
    			attr_dev(progress_1, "class", "_toastBar svelte-95rq8t");
    			progress_1.value = /*$progress*/ ctx[1];
    			add_location(progress_1, file$c, 111, 2, 2492);
    			attr_dev(div1, "class", "_toastItem svelte-95rq8t");
    			toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			add_location(div1, file$c, 85, 0, 1883);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, progress_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mouseenter", /*mouseenter_handler*/ ctx[9], false, false, false, false),
    					listen_dev(div1, "mouseleave", /*resume*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, null);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div0, "pe", /*item*/ ctx[0].component);
    			}

    			if (/*item*/ ctx[0].dismissable) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$9(ctx);
    					if_block1.c();
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*$progress*/ 2) {
    				prop_dev(progress_1, "value", /*$progress*/ ctx[1]);
    			}

    			if (!current || dirty & /*item*/ 1) {
    				toggle_class(div1, "pe", /*item*/ ctx[0].pausable);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function check(prop, kind = 'undefined') {
    	return typeof prop === kind;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $progress;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToastItem', slots, []);
    	let { item } = $$props;

    	/** @type {any} */
    	let next = item.initial;

    	let prev = next;
    	let paused = false;
    	let cprops = {};

    	/** @type {any} */
    	let unlisten;

    	const progress = tweened(item.initial, { duration: item.duration, easing: identity });
    	validate_store(progress, 'progress');
    	component_subscribe($$self, progress, value => $$invalidate(1, $progress = value));

    	function close() {
    		toast.pop(item.id);
    	}

    	function autoclose() {
    		if ($progress === 1 || $progress === 0) close();
    	}

    	function pause() {
    		if (!paused && $progress !== next) {
    			progress.set($progress, { duration: 0 });
    			paused = true;
    		}
    	}

    	function resume() {
    		if (paused) {
    			const d = /** @type {any} */
    			item.duration;

    			const duration = d - d * (($progress - prev) / (next - prev));
    			progress.set(next, { duration }).then(autoclose);
    			paused = false;
    		}
    	}

    	function listen(d = document) {
    		if (check(d.hidden)) return;
    		const handler = () => d.hidden ? pause() : resume();
    		const name = 'visibilitychange';
    		d.addEventListener(name, handler);
    		unlisten = () => d.removeEventListener(name, handler);
    		handler();
    	}

    	onMount(listen);

    	onDestroy(() => {
    		if (check(item.onpop, 'function')) {
    			// @ts-ignore
    			item.onpop(item.id);
    		}

    		unlisten && unlisten();
    	});

    	$$self.$$.on_mount.push(function () {
    		if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
    			console.warn("<ToastItem> was created without expected prop 'item'");
    		}
    	});

    	const writable_props = ['item'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToastItem> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = e => {
    		if (e instanceof KeyboardEvent && ['Enter', ' '].includes(e.key)) close();
    	};

    	const mouseenter_handler = () => {
    		if (item.pausable) pause();
    	};

    	$$self.$$set = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		tweened,
    		linear: identity,
    		toast,
    		item,
    		next,
    		prev,
    		paused,
    		cprops,
    		unlisten,
    		progress,
    		close,
    		autoclose,
    		pause,
    		resume,
    		check,
    		listen,
    		$progress
    	});

    	$$self.$inject_state = $$props => {
    		if ('item' in $$props) $$invalidate(0, item = $$props.item);
    		if ('next' in $$props) $$invalidate(7, next = $$props.next);
    		if ('prev' in $$props) prev = $$props.prev;
    		if ('paused' in $$props) paused = $$props.paused;
    		if ('cprops' in $$props) $$invalidate(2, cprops = $$props.cprops);
    		if ('unlisten' in $$props) unlisten = $$props.unlisten;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 1) {
    			// `progress` has been renamed to `next`; shim included for backward compatibility, to remove in next major
    			if (!check(item.progress)) {
    				$$invalidate(0, item.next = item.progress, item);
    			}
    		}

    		if ($$self.$$.dirty & /*next, item, $progress*/ 131) {
    			if (next !== item.next) {
    				$$invalidate(7, next = item.next);
    				prev = $progress;
    				paused = false;
    				progress.set(next).then(autoclose);
    			}
    		}

    		if ($$self.$$.dirty & /*item*/ 1) {
    			if (item.component) {
    				const { props = {}, sendIdTo } = item.component;

    				$$invalidate(2, cprops = {
    					...props,
    					...sendIdTo && { [sendIdTo]: item.id }
    				});
    			}
    		}
    	};

    	return [
    		item,
    		$progress,
    		cprops,
    		progress,
    		close,
    		pause,
    		resume,
    		next,
    		keydown_handler,
    		mouseenter_handler
    	];
    }

    class ToastItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToastItem",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get item() {
    		throw new Error("<ToastItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ToastItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@zerodevx/svelte-toast/SvelteToast.svelte generated by Svelte v3.58.0 */

    const { Object: Object_1$1 } = globals;
    const file$b = "node_modules/@zerodevx/svelte-toast/SvelteToast.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:2) {#each items as item (item.id)}
    function create_each_block$3(key_1, ctx) {
    	let li;
    	let toastitem;
    	let t;
    	let li_class_value;
    	let li_style_value;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	toastitem = new ToastItem({
    			props: { item: /*item*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(toastitem.$$.fragment);
    			t = space();
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*item*/ ctx[4].classes?.join(' ')) + " svelte-1u812xz"));
    			attr_dev(li, "style", li_style_value = getCss(/*item*/ ctx[4].theme));
    			add_location(li, file$b, 26, 4, 722);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(toastitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const toastitem_changes = {};
    			if (dirty & /*items*/ 1) toastitem_changes.item = /*item*/ ctx[4];
    			toastitem.$set(toastitem_changes);

    			if (!current || dirty & /*items*/ 1 && li_class_value !== (li_class_value = "" + (null_to_empty(/*item*/ ctx[4].classes?.join(' ')) + " svelte-1u812xz"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (!current || dirty & /*items*/ 1 && li_style_value !== (li_style_value = getCss(/*item*/ ctx[4].theme))) {
    				attr_dev(li, "style", li_style_value);
    			}
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 200 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toastitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fly, /*item*/ ctx[4].intro);
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toastitem.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(toastitem);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(26:2) {#each items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "_toastContainer svelte-1u812xz");
    			add_location(ul, file$b, 24, 0, 655);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items, getCss*/ 1) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getCss(theme) {
    	return theme
    	? Object.keys(theme).reduce((a, c) => `${a}${c}:${theme[c]};`, '')
    	: undefined;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $toast;
    	validate_store(toast, 'toast');
    	component_subscribe($$self, toast, $$value => $$invalidate(3, $toast = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvelteToast', slots, []);
    	let { options = {} } = $$props;
    	let { target = 'default' } = $$props;

    	/** @type {import('./stores').SvelteToastOptions[]} */
    	let items = [];

    	const writable_props = ['options', 'target'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvelteToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('target' in $$props) $$invalidate(2, target = $$props.target);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		flip,
    		toast,
    		ToastItem,
    		options,
    		target,
    		items,
    		getCss,
    		$toast
    	});

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('target' in $$props) $$invalidate(2, target = $$props.target);
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*target, options*/ 6) {
    			toast._init(target, options);
    		}

    		if ($$self.$$.dirty & /*$toast, target*/ 12) {
    			$$invalidate(0, items = $toast.filter(i => i.target === target));
    		}
    	};

    	return [items, options, target, $toast];
    }

    class SvelteToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { options: 1, target: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteToast",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get options() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get target() {
    		throw new Error("<SvelteToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set target(value) {
    		throw new Error("<SvelteToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let errorToast = (msg) => {
        toast.push(msg, {
            theme: {
                "--toastBackground": "rgba(255, 0, 10, 0.9)"
            },
            // initial: 0
        });
    };

    class Bfile {
        constructor(id, parse = true) {
            this.id = id;
            this.loading = true;
            if (!id.match(/A\d{6|7}/))
                return;
            fetch("https://oeis.org/" + id + "/b" + id.slice(1) + ".txt").then(res => res.text()).then(text => {
                this.plaintext = text;
                if (parse)
                    this.data = Bfile.parsebfile(text);
                this.loading = false;
                this.subscribers.forEach(fn => fn(this.data));
            });
        }
        static parsebfile(text) {
            let lines = text.split("\n");
            lines = lines.map(line => line.trim());
            lines = lines.filter(line => !line.startsWith("#"));
            let linesSplit = lines.map(l => l.split(/\s+/));
            let data = {};
            linesSplit.forEach(line => {
                data[(line[0])] = line[1];
            });
            return {
                offset: parseInt(linesSplit[0][0]),
                data,
            };
        }
        subscribe(fn) {
            const unsub = () => {
                this.subscribers = this.subscribers.filter(s => s !== fn);
            };
            this.subscribers.push(fn);
            fn(this.data);
            return unsub;
        }
        static getNumFromSeq(seq) {
            return Number(seq.slice(1));
        }
    }
    class ManyBfileWithProgress {
        constructor(seqs) {
            this.seqs = seqs;
            this.outp = {};
            this.donesubs = [];
            this.xhr = null;
            this.canceled = false;
            this.progress = {
                currentSeq: seqs[0],
                currentPos: "1",
                totalPos: seqs.length.toString(),
                progressCurrent: "0%",
                bytesCurrentDownloaded: "0",
                bytesCurrentTotal: "unknown"
            };
            this.progressStore = writable(this.progress);
            this.start();
        }
        cancel() {
            if (this.xhr)
                this.xhr.abort();
            this.canceled = true;
        }
        ondone(fn) {
            this.donesubs.push(fn);
        }
        async start() {
            for (let i = 0; i < this.seqs.length; i++) {
                console.log("start download of bfile");
                if (this.canceled)
                    return;
                this.progress = {
                    currentSeq: this.seqs[i],
                    currentPos: (i + 1).toString(),
                    totalPos: this.seqs.length.toString(),
                    progressCurrent: "0%",
                    bytesCurrentDownloaded: "0",
                    bytesCurrentTotal: "unknown"
                };
                this.progressStore.set(this.progress);
                let text = await this.loadOne(this.seqs[i]);
                if (typeof text !== "string") {
                    errorToast("there was an error downloading the bfile for: " + this.seqs[i]);
                }
                else {
                    this.outp[this.seqs[i]] = Bfile.parsebfile(text);
                }
                if (this.canceled)
                    return;
                console.log("end download of bfile");
            }
            this.donesubs.forEach(s => s(this.outp));
        }
        loadOne(seq) {
            if (ManyBfileWithProgress.cache[seq])
                return Promise.resolve(ManyBfileWithProgress.cache[seq]);
            return new Promise(res => {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", "https://oeis.org/" + seq + "/b" + seq.slice(1) + ".txt");
                xhr.onprogress = e => {
                    this.progress.bytesCurrentDownloaded = e.loaded.toString();
                    if (e.lengthComputable) {
                        this.progress.bytesCurrentTotal = e.total.toString();
                        let promiles = Math.floor(e.loaded / e.total * 1000);
                        this.progress.progressCurrent = `${promiles / 10}%`;
                    }
                    else {
                        this.progress.progressCurrent = "unknown%";
                    }
                    this.progressStore.set(this.progress);
                };
                xhr.send();
                xhr.onload = () => {
                    ManyBfileWithProgress.cache[seq] = xhr.responseText;
                    res(xhr.responseText);
                };
                xhr.onerror = () => {
                    errorToast("there was a network error when downloading the bfile for: " + seq + ". Trying again");
                    this.loadOne(seq).then(res);
                };
            });
        }
    }
    ManyBfileWithProgress.cache = {};

    var pariMemoizeLib = String.raw `
\\ ---- BEGIN OF memoize.gp ----
\\ this version is modified.
\\ source: https://user42.tuxfamily.org/pari-memoize/index.html
\\ modified by removing comments for compactness
{
  my(comma = Vecsmall(",")[1]);
memoize_INTERNAL_any_comma(str) =
  my(v = Vecsmall(str));
  for(i=1,#v, if(v[i]==comma, return(1)));
  0;
}

{
my(close_paren = Vecsmall(")")[1]);
memoize_INTERNAL_func_is_zero_args(func) =
  if(type(func)!= "t_CLOSURE", error("not a function"));
  my(v = Vecsmall(Str(func)));
  #v >= 2 && v[2] == close_paren;
}

{
my (open_paren       = Vecsmall("(")[1],
    open_set         = Set(Vecsmall("([")),  /* open parens */
    close_set        = Set(Vecsmall(")]")),  /* close parens */
    open_bracket     = Vecsmall("[")[1],
    comma            = Vecsmall(",")[1],
    colon_equals_set = Set(Vecsmall(":=")),
    doublequote      = Vecsmall("\"")[1],
    backslash        = Vecsmall("\\")[1]);
memoize_INTERNAL_func_args(func) =
  if(type(func)!= "t_CLOSURE", error("not a function"));
  my(v = Vecsmall(Str(func)));

  if(! (#v >= 2 && v[1] == open_paren),
     error("cannot memoize an install()ed function (put a gp wrapper around it)"));

  my(ret         = List(),
     in_name     = 1,
     in_string   = 0,
     parens      = 0,
     is_variadic = 0);
  for(i=2, #v,
     my(ch = v[i]);
     if(in_string,
        if(ch==doublequote, in_string=0,  
           ch==backslash,   i++);         
        next);
     if(ch==doublequote,         in_string=1; next());
     if(in_name && ch==open_bracket, is_variadic=1);
     if(setsearch(open_set, ch), parens++;    next());
     if(setsearch(close_set, ch),
        parens--;
        if(parens<0, return([Strchr(Vecsmall(ret)),
                             if(i==2,"",Strchr(v[2..i-1])),
                             is_variadic]));
        next());
     if(parens>0, next());

     if(ch==comma,                       in_name=1,
        setsearch(colon_equals_set, ch), in_name=0);
     if(in_name, listput(ret,ch)));

  error("memoize_INTERNAL_func_args() oops, no closing paren");
}


{
if(type(mapisdefined)!="t_CLOSURE",

if(memoize_INTERNAL_args=='memoize_INTERNAL_args,
   memoize_INTERNAL_args   = List([]);     
   memoize_INTERNAL_values = List([]));    


memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_args[m],
     memoize_INTERNAL_values[m] = memoize_INTERNAL_args[m](); \\ call and record
     memoize_INTERNAL_args[m]=0);
  memoize_INTERNAL_values[m]
);

memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

memoize_INTERNAL_store = ((m, key,value)->
  my(pos = setsearch(memoize_INTERNAL_args[m],key,1));
  listinsert(memoize_INTERNAL_args[m], key, pos);
  listinsert(memoize_INTERNAL_values[m], value, pos);
  value
);

memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_args,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"),
                    argnames),
     call_str  = Strprintf(if(args[3],
                              "call(memoize_INTERNAL_func,[%s])",
                              "memoize_INTERNAL_func(%s)"),
                           argnames));
  Strprintf("(%s)->my(memoize_INTERNAL_pos=setsearch(memoize_INTERNAL_args[%d],%s)); if(memoize_INTERNAL_pos, memoize_INTERNAL_values[%d][memoize_INTERNAL_pos], memoize_INTERNAL_store(%d,%s,%s))",
            args_full,
            m, key_str,
            m,
            m, key_str, call_str)
);

memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     listput(memoize_INTERNAL_args,   memoize_INTERNAL_func);
     listput(memoize_INTERNAL_values, 0);
     memoize_INTERNAL_make0(#memoize_INTERNAL_args),

     listput(memoize_INTERNAL_args,   List());
     listput(memoize_INTERNAL_values, List());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))
)

,
if(memoize_INTERNAL_maps=='memoize_INTERNAL_maps,
   memoize_INTERNAL_maps = List([]));
memoize_INTERNAL_call0 = ((m)->
  if(memoize_INTERNAL_maps[m][1],
     memoize_INTERNAL_maps[m][2] = memoize_INTERNAL_maps[m][1]();
     memoize_INTERNAL_maps[m][1]=0);
  memoize_INTERNAL_maps[m][2]
);

memoize_INTERNAL_make0 = ((m)-> ()->memoize_INTERNAL_call0(m));

memoize_INTERNAL_store = ((m, key,value)->
  mapput(memoize_INTERNAL_maps[m],key,value);
  value
);

memoize_INTERNAL_make = ((func)->
  my(m         = #memoize_INTERNAL_maps,
     args      = memoize_INTERNAL_func_args(func),
     argnames  = args[1],
     args_full = args[2],
     key_str   = if(memoize_INTERNAL_any_comma(argnames),
                    Str("[",argnames,"]"),
                    argnames),
     call_str  = Strprintf(if(args[3],
                              "call(memoize_INTERNAL_func,[%s])",
                              "memoize_INTERNAL_func(%s)"),
                           argnames));
  Strprintf("(%s)->my(memoize_INTERNAL_value);if(!mapisdefined(memoize_INTERNAL_maps[%d],%s,&memoize_INTERNAL_value), mapput(memoize_INTERNAL_maps[%d],%s,memoize_INTERNAL_value=%s)); memoize_INTERNAL_value",
            args_full,
            m, key_str,
            m, key_str, call_str)
);

memoize = ((memoize_INTERNAL_func)->
  if(memoize_INTERNAL_func_is_zero_args(memoize_INTERNAL_func),
     listput(memoize_INTERNAL_maps, [memoize_INTERNAL_func,0]);
     memoize_INTERNAL_make0(#memoize_INTERNAL_maps),

     listput(memoize_INTERNAL_maps, Map());
     eval(memoize_INTERNAL_make(memoize_INTERNAL_func)))

)

);
}

{
addhelp(memoize,
"func = memoize(func)
Return a memoized version of function func.

func should be a function (a closure).  It can take any number of arguments,
including arguments with default values.  The return is likewise a function
(a closure).

    foo(x) = some hairy code;
    foo = memoize(foo);

or in a single expression if preferred

    foo=memoize((x,y) -> some hairy code using x and y);

See comments at the start of memoize.gp for more details.");
}
\\ ---- END OF memoize.gp ----
`;

    const PARI_BASE = (`
default(parisize,    {PARISIZE});
default(parisizemax, {PARISIZEMAX});

{CODE}
{LOOP}
`);
    const EXPLICIT_LOOP = `
{
    for(i={OFFSET}, {MAXOFFSET}, s=Str(i, " ", {MAIN}(i)); if(length(s) > 1000, break); print(Str("result ", s)););
    print("done"); print("done");
}
`;
    // for(i=0, 10000, s=Str(i, " ", a(i)); if(length(s) > 1000, break); print(Str("result ", s));)
    const LIST_LOOP = `
vecmap(v, f) = {
    for(i=1, length(v), v[i] = f(v[i], i));
    v;
}
v=[0]
size=0
linelength = 0
sizes = {SIZES}
sizeindex = 1
{

    while((linelength <= 999) && (sizeindex <= #sizes),
        size = sizes[sizeindex];
        sizeindex++;
        print("listsize ", size);
        v={MAIN}(size);
        linelength = vecmax(vecmap(v, (x, i) -> length(Str(i-1+{OFFSET}, " ", x))));
        print("listresult ", v)
    );
    print("done"); print("done");
}
`;
    const CHECK_LOOP = `
startcheck = {STARTCHECK}
i = startcheck
sendupdateevery = 500 \\\\ in ms
lastupdate = getwalltime()
{
    while (1, 
        if (getwalltime() - lastupdate > sendupdateevery,
            print("checkupto ", i);
            lastupdate = getwalltime();
        );
        if ({MAIN}(i),
            print("checkresult ", i)
        );
        i++
    );
    print("done"); print("done");
}
`;
    const GET_ROW_FROM_N = `get_row_from_n(n) = floor((sqrtint(1 + 8*n) - 1)  / 2)`;
    const ANTIDIAGONAL_WRAPPER = (upward) => `
${GET_ROW_FROM_N}
main_old = {MAIN}
a(n) = {
    my(row = get_row_from_n(n));
    my(remainder = n - row*(row+1)/2);
    my(a = row - remainder, b = remainder);
    ${!upward ? "my(t = b); b = a; a = t;" : ""}
    main_old(a + {XOFFSET}, b + {YOFFSET})
}`;
    const TRIANGLE_WRAPPER = `
${GET_ROW_FROM_N}
a(n) = {
    my(row = get_row_from_n(n));
    my(remainder = n - row*(row+1)/2);
    {MAIN}(row + {XOFFSET}, remainder + {YOFFSET})
}
`;
    const INCLUDE_MEMOIZE = pariMemoizeLib;
    const INCLUDE_MEMOIZE_SHORT = `\\\\ <memoize code> (press the view full code button below to see the generated code including libraries)`;
    const LOAD_A = `
OEISSequenceData = Map()
loadSeq(seq) = if(!mapisdefined(OEISSequenceData, seq), mapput(OEISSequenceData, seq, Map())); n -> {
    my(M = mapget(OEISSequenceData, seq));
    if (mapisdefined(M, n), mapget(M, n),
        print("loaddata ", seq, " ", n);
        my(r = input());
        my(offset = r[1]);
        for(i = 0, #r - 2, mapput(M, offset + i, r[i + 2]));
        mapput(OEISSequenceData, seq, M);
        self()(n)
    )
}
`;
    function progDataToMaxIndex(progData) {
        if (progData.limit.maxIndex.type === "index") {
            return progData.limit.maxIndex.maxIndex;
        }
        else if (progData.limit.maxIndex.type === "antidiagonals") {
            let n = progData.limit.maxIndex.maxAntidiaonal;
            return progData.offset + n * (n + 1) / 2 - 1 + progData.offset;
        }
    }
    function dataSizeToNumber({ amount, unit }) {
        let power = { "b": 0, "kb": 1, "mb": 2, "gb": 3 }[unit];
        return `round(${amount} * 1024 ^ ${power})`;
    }
    function formatLengthFromLengthGuessAlgorithm(algo, offset) {
        let outp = [];
        if (algo.type === "custom")
            outp = algo.customGuesses;
        else {
            let current = algo.start;
            outp = [current];
            do {
                current += algo.increment;
                outp.push(current);
            } while (current < 10000 - offset + 10);
        }
        return "[" + outp.join(", ") + "]";
    }
    function genPari(code, main, type, offset, progData, shortened = true) {
        if (!type)
            return "";
        if (!["list", "explicit", "check", "table explicit"].includes(type))
            throw new Error("unimplemented type:" + type);
        let loop = { list: LIST_LOOP, explicit: EXPLICIT_LOOP, check: CHECK_LOOP, "table explicit": EXPLICIT_LOOP }[type];
        if (type === "table explicit") {
            let base = progData.tableSettings.type === "triangle"
                ? TRIANGLE_WRAPPER
                : ANTIDIAGONAL_WRAPPER(progData.tableSettings.squareUpward);
            code += "\n" + base
                .replaceAll("{MAIN}", main)
                .replaceAll("{XOFFSET}", progData.tableSettings.xoffset.toString())
                .replaceAll("{YOFFSET}", progData.tableSettings.yoffset.toString());
            main = "a";
        }
        if (progData.importBfilesFor.length) {
            code = LOAD_A + progData.importBfilesFor.map(seq => `${seq} = loadSeq(${Bfile.getNumFromSeq(seq)})\n`).join() + code;
        }
        let result = PARI_BASE
            .replaceAll("{PARISIZE}", dataSizeToNumber(progData.langSettings.pari.parisize).toString())
            .replaceAll("{PARISIZEMAX}", dataSizeToNumber(progData.langSettings.pari.parisizemax).toString())
            .replaceAll("{LOOP}", loop)
            .replaceAll("{MAXOFFSET}", progDataToMaxIndex(progData).toString())
            .replaceAll("{MAIN}", main)
            .replaceAll("{STARTCHECK}", progData.checkSettings.checkStart.toString())
            .replaceAll("{CODE}", (progData.langSettings.pari.includeMemoize ? (shortened ? INCLUDE_MEMOIZE_SHORT : INCLUDE_MEMOIZE) : "") + code)
            .replaceAll("{OFFSET}", offset.toString());
        if (type === "list")
            result = result.replaceAll("{SIZES}", formatLengthFromLengthGuessAlgorithm(progData.listSettings.lengthGuessAlgorithm, offset));
        return result.trim() + "\n";
    }

    function textToUint8Array(text) {
        return new TextEncoder().encode(text);
    }
    function Unint8ArrayToText(array) {
        return new TextDecoder().decode(array);
    }
    function run2(lang, code, handleStdout, handleStderr) {
        const ws = new WebSocket("ws://localhost:3946/?command=gp");
        ws.binaryType = "arraybuffer";
        ws.onopen = () => {
            console.log("oppened");
            sendStdin(code);
            ws.onmessage = (event) => {
                let data = event.data;
                if (data instanceof ArrayBuffer) {
                    let binary = new Uint8Array(data);
                    let text = Unint8ArrayToText(binary);
                    if (text.startsWith("err ")) {
                        console.error(text.slice(4));
                    }
                    else if (text.startsWith("stdout ")) {
                        handleStdout(text.slice(7));
                    }
                    else if (text.startsWith("stderr ")) {
                        handleStderr(text.slice(7));
                    }
                    else {
                        console.log("Unknown message", text);
                    }
                }
            };
        };
        function sendStdin(s) {
            ws.send(textToUint8Array("stdin " + s));
        }
        return { stop: () => {
                console.trace("kill from where");
                ws.send(textToUint8Array("kill"));
                setTimeout(_ => {
                    if (ws.readyState === WebSocket.OPEN)
                        console.error("send kill but websocket still open");
                }, 1000);
            },
            sendStdin
        };
    }
    function run(lang, code) {
        return new Promise(res => {
            // open websocket to localhost 8765
            const ws = new WebSocket('ws://localhost:8765');
            ws.onopen = () => {
                // send lang {lang}
                // send code {code}
                // send run + space
                ws.onmessage = async (event) => {
                    let text = "";
                    // parse event.data in text
                    if (typeof event.data === "string") {
                        text = event.data;
                    }
                    else if (event.data instanceof Blob) {
                        text = await event.data.text();
                    }
                    else {
                        errorToast('Unknown data type');
                    }
                    // console.log("text", text)
                    const t = text.split(' ', 1)[0];
                    const data = text.slice(t.length + 1);
                    if (t === 'error') {
                        errorToast(data);
                    }
                    else if (t === 'result') {
                        res(formatOutput(data));
                    }
                    else {
                        console.log('Unknown response type', t);
                        console.log('text', text);
                    }
                };
                ws.send(`lang ${lang}`);
                ws.send(`code ${code}`);
                ws.send('run ');
            };
        });
    }
    function formatOutput(output) {
        // TODO: sort output
        let str = output.split("\n").filter(line => line.startsWith("result ")).map(line => line.slice(7)).join("\n") + "\n\n";
        let blob = new Blob([str]);
        let filename = "b" + document.querySelector("[name=seq]").value.slice(1) + ".txt";
        let file = new File([blob], filename, { type: "application/octet-stream" });
        return file;
    }

    /* src/src/Tabs.svelte generated by Svelte v3.58.0 */

    const { Error: Error_1 } = globals;
    const file$a = "src/src/Tabs.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (17:4) {#each tabNames as name, i}
    function create_each_block$2(ctx) {
    	let div;
    	let button;
    	let t0_value = /*name*/ ctx[7] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*i*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "tabselector svelte-1un26oq");
    			toggle_class(button, "selected", /*i*/ ctx[9] === /*opened*/ ctx[0]);
    			add_location(button, file$a, 18, 12, 626);
    			attr_dev(div, "class", "tab svelte-1un26oq");
    			add_location(div, file$a, 17, 8, 596);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(click_handler), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tabNames*/ 2 && t0_value !== (t0_value = /*name*/ ctx[7] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*opened*/ 1) {
    				toggle_class(button, "selected", /*i*/ ctx[9] === /*opened*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(17:4) {#each tabNames as name, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let current;
    	let each_value = /*tabNames*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "tabs svelte-1un26oq");
    			add_location(div0, file$a, 15, 0, 537);
    			attr_dev(div1, "class", "container svelte-1un26oq");
    			add_location(div1, file$a, 28, 0, 997);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[6](div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*opened, container, tabNames*/ 7) {
    				each_value = /*tabNames*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tabs', slots, ['default']);
    	let { tabNames } = $$props;
    	let { opened = 0 } = $$props;

    	onMount(() => {
    		if (!container) throw "container is null. How???";
    		if (tabNames.length !== container.childElementCount) throw new Error("tabNames.length !== container.childElementCount");

    		for (let child of container === null || container === void 0
    		? void 0
    		: container.children) {
    			child.style.display = "none";
    		}

    		$$invalidate(2, container.children[opened].style.display = "", container);
    	});

    	let container = null;

    	$$self.$$.on_mount.push(function () {
    		if (tabNames === undefined && !('tabNames' in $$props || $$self.$$.bound[$$self.$$.props['tabNames']])) {
    			console.warn("<Tabs> was created without expected prop 'tabNames'");
    		}
    	});

    	const writable_props = ['tabNames', 'opened'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => {
    		if (!container) throw "container is null. How???";
    		$$invalidate(2, container.children[opened].style.display = "none", container);
    		$$invalidate(2, container.children[i].style.display = "", container);
    		$$invalidate(0, opened = i);
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('tabNames' in $$props) $$invalidate(1, tabNames = $$props.tabNames);
    		if ('opened' in $$props) $$invalidate(0, opened = $$props.opened);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onMount, tabNames, opened, container });

    	$$self.$inject_state = $$props => {
    		if ('tabNames' in $$props) $$invalidate(1, tabNames = $$props.tabNames);
    		if ('opened' in $$props) $$invalidate(0, opened = $$props.opened);
    		if ('container' in $$props) $$invalidate(2, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [opened, tabNames, container, $$scope, slots, click_handler, div1_binding];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { tabNames: 1, opened: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get tabNames() {
    		throw new Error_1("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabNames(value) {
    		throw new Error_1("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opened() {
    		throw new Error_1("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opened(value) {
    		throw new Error_1("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/Status.svelte generated by Svelte v3.58.0 */
    const file$9 = "src/src/Status.svelte";

    // (5:0) {#if $status.running}
    function create_if_block_1$6(ctx) {
    	let h1;
    	let t1;
    	let button;
    	let t3;
    	let tabs;
    	let current;
    	let mounted;
    	let dispose;

    	tabs = new Tabs({
    			props: {
    				tabNames: ["general", "stdout", "stderr"],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Status";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Stop";
    			t3 = space();
    			create_component(tabs.$$.fragment);
    			add_location(h1, file$9, 5, 4, 108);
    			add_location(button, file$9, 6, 4, 128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(tabs, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[2]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const tabs_changes = {};

    			if (dirty & /*$$scope, $status*/ 10) {
    				tabs_changes.$$scope = { dirty, ctx };
    			}

    			tabs.$set(tabs_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			destroy_component(tabs, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(5:0) {#if $status.running}",
    		ctx
    	});

    	return block;
    }

    // (10:8) {#if $status.done}
    function create_if_block_2$3(ctx) {
    	let p;
    	let strong;

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Done";
    			add_location(strong, file$9, 10, 15, 369);
    			add_location(p, file$9, 10, 12, 366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(10:8) {#if $status.done}",
    		ctx
    	});

    	return block;
    }

    // (8:4) <Tabs tabNames={["general", "stdout", "stderr"]}>
    function create_default_slot(ctx) {
    	let div0;
    	let pre0;
    	let raw_value = /*$status*/ ctx[1].statusInfoHTML + "";
    	let t0;
    	let t1;
    	let div1;
    	let pre1;
    	let t2_value = /*$status*/ ctx[1].stdout + "";
    	let t2;
    	let t3;
    	let div2;
    	let pre2;
    	let t4_value = /*$status*/ ctx[1].stderr + "";
    	let t4;
    	let if_block = /*$status*/ ctx[1].done && create_if_block_2$3(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			pre0 = element("pre");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			pre1 = element("pre");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			pre2 = element("pre");
    			t4 = text(t4_value);
    			add_location(pre0, file$9, 8, 13, 285);
    			add_location(div0, file$9, 8, 8, 280);
    			add_location(pre1, file$9, 13, 13, 437);
    			add_location(div1, file$9, 13, 8, 432);
    			add_location(pre2, file$9, 14, 13, 484);
    			add_location(div2, file$9, 14, 8, 479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, pre0);
    			pre0.innerHTML = raw_value;
    			append_dev(div0, t0);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, pre1);
    			append_dev(pre1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, pre2);
    			append_dev(pre2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$status*/ 2 && raw_value !== (raw_value = /*$status*/ ctx[1].statusInfoHTML + "")) pre0.innerHTML = raw_value;
    			if (/*$status*/ ctx[1].done) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$status*/ 2 && t2_value !== (t2_value = /*$status*/ ctx[1].stdout + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$status*/ 2 && t4_value !== (t4_value = /*$status*/ ctx[1].stderr + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:4) <Tabs tabNames={[\\\"general\\\", \\\"stdout\\\", \\\"stderr\\\"]}>",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if $status.error}
    function create_if_block$8(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let strong;
    	let t3;
    	let t4_value = /*$status*/ ctx[1].message + "";
    	let t4;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Status";
    			t1 = space();
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "error";
    			t3 = text(": ");
    			t4 = text(t4_value);
    			add_location(h1, file$9, 18, 4, 560);
    			add_location(strong, file$9, 19, 7, 583);
    			add_location(p, file$9, 19, 4, 580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, t3);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$status*/ 2 && t4_value !== (t4_value = /*$status*/ ctx[1].message + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(18:0) {#if $status.error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$status*/ ctx[1].running && create_if_block_1$6(ctx);
    	let if_block1 = /*$status*/ ctx[1].error && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$status*/ ctx[1].running) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$status*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$status*/ ctx[1].error) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$8(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $status,
    		$$unsubscribe_status = noop,
    		$$subscribe_status = () => ($$unsubscribe_status(), $$unsubscribe_status = subscribe(status, $$value => $$invalidate(1, $status = $$value)), status);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_status());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Status', slots, []);
    	let { status } = $$props;
    	validate_store(status, 'status');
    	$$subscribe_status();

    	$$self.$$.on_mount.push(function () {
    		if (status === undefined && !('status' in $$props || $$self.$$.bound[$$self.$$.props['status']])) {
    			console.warn("<Status> was created without expected prop 'status'");
    		}
    	});

    	const writable_props = ['status'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Status> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $status.running && $status.cancel();

    	$$self.$$set = $$props => {
    		if ('status' in $$props) $$subscribe_status($$invalidate(0, status = $$props.status));
    	};

    	$$self.$capture_state = () => ({ Tabs, status, $status });

    	$$self.$inject_state = $$props => {
    		if ('status' in $$props) $$subscribe_status($$invalidate(0, status = $$props.status));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [status, $status, click_handler];
    }

    class Status extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { status: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Status",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get status() {
    		throw new Error("<Status>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Status>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class BufferedByLine {
        constructor(onLine) {
            this.onLine = onLine;
            this.buffer = "";
            this.stopped = false;
        }
        write(s) {
            if (this.stopped)
                return;
            this.buffer += s;
            let lines = this.buffer.split("\n");
            this.buffer = lines.pop();
            for (let line of lines) {
                this.onLine(line);
            }
        }
        stop() {
            this.stopped = true;
        }
    }
    function resultLineMaxLength(result) {
        function one(i, v) {
            return i.length + v.length + 1;
        }
        let max = 0;
        for (let i in result) {
            max = Math.max(max, one(i, result[i]));
        }
        return max;
    }
    function startCode(data, code, status) {
        if (!data.lang) {
            status.set({ running: false, error: true, message: "no language selected" });
            return;
        }
        let result = {};
        let checkResult = []; // different because unsorted if parallel
        let checkedUpTo = data.checkSettings.checkStart;
        let maxResultLength = 0;
        let resultsCalculated = 0;
        let statusInfoHTML = "";
        let IThrowwedError = false;
        let sequentialResultCalculated = 0;
        let currentListSize /* of number */ = null;
        let lastListSize /* of number */ = null;
        function updateSequentialResultCalculated() {
            while (result[data.offset + sequentialResultCalculated]) {
                sequentialResultCalculated++;
            }
        }
        function handleStdLine(s) {
            if (stdOutBuffer.stopped)
                return;
            if (s.startsWith("done")) {
                MyCancel();
            }
            if (s.startsWith("result ")) {
                let command = s.split(" ");
                if (command.length !== 3) {
                    status.set({ running: false, error: true, message: "invalid result command: too many or too little spaces: " + s });
                    cancel();
                    return;
                }
                let [_, i, v] = command;
                result[parseInt(i)] = v;
                maxResultLength = Math.max(maxResultLength, i.length + v.length + 1);
                resultsCalculated++;
                updateSequentialResultCalculated();
                statusInfoHTML = "results calculated: " + resultsCalculated + "<br>max result length: " + maxResultLength + "<br>current result length: " + (i.length + v.length + 1) + "<br>sequential results calculated: " + sequentialResultCalculated;
            }
            else if (s.startsWith("listresult ")) {
                let list = s.slice("listresult ".length);
                let listSplit = list.slice(1, list.length - 1).split(", ");
                for (let i = 0; i < listSplit.length; i++) {
                    console.log("result[i + data.offset] && result[i + data.offset] !== listSplit[i]", result[i + data.offset] && result[i + data.offset] !== listSplit[i]);
                    if (result[i + data.offset] && result[i + data.offset] !== listSplit[i]) {
                        status.set({ running: false, error: true, message: "listresult doesn't match previous result: " + result[i + data.offset] + " !== " + listSplit[i] + " at index " + (i + data.offset) });
                        status.set({ running: false, error: true, message: `listresult doesn't match previous result: ${result[i + data.offset]} !== ${listSplit[i]} at index ${i + data.offset}. Last size passed to the main function: ${lastListSize}, current size passed to the main function: ${currentListSize}}` });
                        IThrowwedError = true;
                        return;
                    }
                    result[i + data.offset] = listSplit[i];
                }
                resultsCalculated = listSplit.length;
                maxResultLength = resultLineMaxLength(result);
                statusInfoHTML = "results calculated: " + resultsCalculated + "<br>max result length: " + maxResultLength;
            }
            else if (s.startsWith("listsize ")) {
                let r = s.slice("listsize ".length);
                lastListSize = currentListSize;
                currentListSize = r;
            }
            else if (s.startsWith("checkresult ")) {
                let r = s.slice("checkresult ".length);
                checkResult.push(r);
                if (isFinite(Number(r)))
                    checkedUpTo = Math.max(checkedUpTo, Number(r));
                if (checkResult.length - 2 + data.offset >= data.maxResult) {
                    MyCancel();
                }
                statusInfoHTML = "check results calculated: " + checkResult.length + "<br>checked up to: " + checkedUpTo;
            }
            else if (s.startsWith("checkupto ")) {
                let r = s.slice("checkresult ".length);
                if (isFinite(Number(r)))
                    checkedUpTo = Math.max(checkedUpTo, Number(r));
                statusInfoHTML = "check results calculated: " + checkResult.length + "<br>checked up to: " + checkedUpTo;
            }
            else if (s.startsWith("loaddata ")) {
                let r = s.slice("loaddata ".length);
                let [seq, pos] = r.split(" ");
                let posParsed = parseInt(pos);
                let bfile = bfiledata["A" + seq.padStart(6, "0")];
                let block = Math.floor(posParsed / data.bfileIdealTransferBlocksize) * data.bfileIdealTransferBlocksize;
                let startPos = bfile.offset + block;
                let toSend = `[${startPos}`;
                for (let i = 0; i < data.bfileIdealTransferBlocksize && bfile.data[startPos + i]; i++)
                    toSend += "," + bfile.data[startPos + i];
                toSend += "]\n";
                sendStdin(toSend);
            }
        }
        let stdOutBuffer = new BufferedByLine(handleStdLine);
        let stdout = "", stderr = "";
        function MyCancel() {
            if (data.type === "check") {
                checkResult.map(BigInt).sort();
                for (let i = 0; i < checkResult.length; i++) {
                    result[i + data.offset] = checkResult[i];
                }
            }
            if (IThrowwedError)
                return;
            cancel();
            console.log("DOOONe");
            update(true);
            stdOutBuffer.stop();
        }
        function update(done = false) {
            if (stdOutBuffer.stopped || IThrowwedError)
                return;
            status.set({ running: true, error: false, stderr, stdout, cancel: MyCancel, statusInfoHTML, result, done });
        }
        function stdoutEvent(s) {
            stdout += s;
            // NOTE: even though in testing all messages and with newline, just to be sure that a very long line isn't sent in two parts doesn't cause any errors.
            stdOutBuffer.write(s);
            update();
        }
        function stderrEvent(s) {
            stderr += s;
            update();
        }
        function downloadBfiles() {
            let noMoreUpdates = false;
            if (!data.importBfilesFor.length) {
                let statusHTML = `Starting code...`;
                status.set({ running: true, error: false, stderr: "", stdout: "", cancel: MyCancel, statusInfoHTML: statusHTML, result, done: false });
                console.log("????????");
                // noMoreUpdates=true
                let returnValue = run2(data.lang, code, stdoutEvent, stderrEvent);
                cancel = returnValue.stop;
                sendStdin = returnValue.sendStdin;
                return;
            }
            let bfiles = new ManyBfileWithProgress(data.importBfilesFor);
            let downloadCancel = () => {
                bfiles.cancel();
                status.set({ running: true, error: false, stderr: "", stdout: "", cancel: downloadCancel, statusInfoHTML, result, done: true });
            };
            bfiles.progressStore.subscribe(progress => {
                if (noMoreUpdates)
                    return;
                let statusHTML = `
            downloading bfile of ${progress.currentSeq} ${progress.currentPos}/${progress.totalPos}...<br>
            progress: ${progress.bytesCurrentDownloaded} bytes / ${progress.bytesCurrentTotal} (${progress.progressCurrent})
            `;
                status.set({ running: true, error: false, stderr: "", stdout: "", cancel: downloadCancel, statusInfoHTML: statusHTML, result, done: false });
            });
            bfiles.ondone(outp => {
                bfiledata = outp;
                noMoreUpdates = true;
                let statusHTML = `Starting code...`;
                status.set({ running: true, error: false, stderr: "", stdout: "", cancel: MyCancel, statusInfoHTML: statusHTML, result, done: false });
                console.log("set HTML");
                let returnValue = run2(data.lang, code, stdoutEvent, stderrEvent);
                cancel = returnValue.stop;
                sendStdin = returnValue.sendStdin;
            });
        }
        let cancel;
        let sendStdin;
        let bfiledata;
        downloadBfiles();
    }

    function splitIntoLines(s, maxLength) {
        let r = "";
        while (s.length > 0) {
            r += s.slice(0, maxLength) + "\n# ";
            s = s.slice(maxLength);
        }
        return r.slice(0, -3);
    }
    function joinFromLines(s) {
        return s.replaceAll(/(\n|^)\# /g, "");
    }

    /* src/src/Output.svelte generated by Svelte v3.58.0 */

    const { console: console_1$4 } = globals;
    const file$8 = "src/src/Output.svelte";

    // (112:0) {#if $status.done}
    function create_if_block$7(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let label0;
    	let input0;
    	let t2;
    	let t3;
    	let br0;
    	let t4;
    	let label1;
    	let t5;
    	let input1;
    	let input1_disabled_value;
    	let input1_min_value;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let p1;
    	let label2;
    	let input2;
    	let t10;
    	let t11;
    	let button0;
    	let br1;
    	let t13;
    	let t14;
    	let textarea;
    	let textarea_disabled_value;
    	let br2;
    	let t15;
    	let button1;
    	let t16;
    	let button1_disabled_value;
    	let t17;
    	let t18;
    	let if_block2_anchor;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showingOldBfile*/ ctx[8] && create_if_block_4$1(ctx);
    	let if_block1 = !/*bfileEditable*/ ctx[3] && create_if_block_3$1(ctx);
    	let if_block2 = !/*autoSave*/ ctx[4] && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Output";
    			t1 = space();
    			p0 = element("p");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\n            Truncate?");
    			t3 = space();
    			br0 = element("br");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Truncate output to: ");
    			input1 = element("input");
    			t6 = text(" (max: ");
    			t7 = text(/*maxSequentialResult*/ ctx[7]);
    			t8 = text(")");
    			t9 = space();
    			p1 = element("p");
    			label2 = element("label");
    			input2 = element("input");
    			t10 = text("  Include header with data about oeis toolbox?");
    			t11 = space();
    			button0 = element("button");
    			button0.textContent = "(re-)Generate bfile";
    			br1 = element("br");
    			t13 = space();
    			if (if_block0) if_block0.c();
    			t14 = space();
    			textarea = element("textarea");
    			br2 = element("br");
    			t15 = space();
    			button1 = element("button");
    			t16 = text("Open in new tab");
    			t17 = space();
    			if (if_block1) if_block1.c();
    			t18 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			add_location(h1, file$8, 112, 4, 3828);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "id", "toolbox--should-truncate");
    			add_location(input0, file$8, 115, 12, 3911);
    			attr_dev(label0, "for", "toolbox--should-truncate");
    			add_location(label0, file$8, 114, 8, 3860);
    			add_location(br0, file$8, 118, 8, 4052);
    			input1.disabled = input1_disabled_value = !/*$progData*/ ctx[5].shouldTruncate;
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "toolbox--truncate");
    			attr_dev(input1, "min", input1_min_value = /*$progData*/ ctx[5].offset);
    			attr_dev(input1, "max", /*maxSequentialResult*/ ctx[7]);
    			add_location(input1, file$8, 120, 32, 4129);
    			attr_dev(label1, "for", "toolbox--truncate");
    			add_location(label1, file$8, 119, 8, 4065);
    			add_location(p0, file$8, 113, 4, 3848);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "toolbox--include-header");
    			add_location(input2, file$8, 123, 44, 4389);
    			attr_dev(label2, "for", "toolbox--include-header");
    			add_location(label2, file$8, 123, 7, 4352);
    			add_location(p1, file$8, 123, 4, 4349);
    			add_location(button0, file$8, 124, 4, 4543);
    			add_location(br1, file$8, 124, 86, 4625);
    			textarea.disabled = textarea_disabled_value = !/*bfileEditable*/ ctx[3];
    			attr_dev(textarea, "class", "svelte-yxyus9");
    			add_location(textarea, file$8, 128, 4, 4865);
    			add_location(br2, file$8, 128, 102, 4963);
    			button1.disabled = button1_disabled_value = !/*bfileFile*/ ctx[10];
    			add_location(button1, file$8, 129, 4, 4972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, label0);
    			append_dev(label0, input0);
    			input0.checked = /*$progData*/ ctx[5].shouldTruncate;
    			append_dev(label0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, br0);
    			append_dev(p0, t4);
    			append_dev(p0, label1);
    			append_dev(label1, t5);
    			append_dev(label1, input1);
    			set_input_value(input1, /*$progData*/ ctx[5].truncate);
    			append_dev(label1, t6);
    			append_dev(label1, t7);
    			append_dev(label1, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, label2);
    			append_dev(label2, input2);
    			input2.checked = /*$progData*/ ctx[5].includeHeader;
    			append_dev(label2, t10);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t13, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*bfile*/ ctx[2]);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, button1, anchor);
    			append_dev(button1, t16);
    			insert_dev(target, t17, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[15]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[17]),
    					listen_dev(button0, "click", prevent_default(/*click_handler*/ ctx[18]), false, true, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[19]),
    					listen_dev(textarea, "input", /*input_handler*/ ctx[20], false, false, false, false),
    					listen_dev(button1, "click", prevent_default(/*openBfile*/ ctx[14]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 32) {
    				input0.checked = /*$progData*/ ctx[5].shouldTruncate;
    			}

    			if (dirty & /*$progData*/ 32 && input1_disabled_value !== (input1_disabled_value = !/*$progData*/ ctx[5].shouldTruncate)) {
    				prop_dev(input1, "disabled", input1_disabled_value);
    			}

    			if (dirty & /*$progData*/ 32 && input1_min_value !== (input1_min_value = /*$progData*/ ctx[5].offset)) {
    				attr_dev(input1, "min", input1_min_value);
    			}

    			if (dirty & /*maxSequentialResult*/ 128) {
    				attr_dev(input1, "max", /*maxSequentialResult*/ ctx[7]);
    			}

    			if (dirty & /*$progData*/ 32 && to_number(input1.value) !== /*$progData*/ ctx[5].truncate) {
    				set_input_value(input1, /*$progData*/ ctx[5].truncate);
    			}

    			if (dirty & /*maxSequentialResult*/ 128) set_data_dev(t7, /*maxSequentialResult*/ ctx[7]);

    			if (dirty & /*$progData*/ 32) {
    				input2.checked = /*$progData*/ ctx[5].includeHeader;
    			}

    			if (/*showingOldBfile*/ ctx[8]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(t14.parentNode, t14);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*bfileEditable*/ 8 && textarea_disabled_value !== (textarea_disabled_value = !/*bfileEditable*/ ctx[3])) {
    				prop_dev(textarea, "disabled", textarea_disabled_value);
    			}

    			if (dirty & /*bfile*/ 4) {
    				set_input_value(textarea, /*bfile*/ ctx[2]);
    			}

    			if (dirty & /*bfileFile*/ 1024 && button1_disabled_value !== (button1_disabled_value = !/*bfileFile*/ ctx[10])) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}

    			if (!/*bfileEditable*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(t18.parentNode, t18);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!/*autoSave*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$5(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t13);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(textarea);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t17);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(112:0) {#if $status.done}",
    		ctx
    	});

    	return block;
    }

    // (126:4) {#if showingOldBfile}
    function create_if_block_4$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "The settings for creating the bfile have changed. You need to re-generate the bfile (or run the script again to calculate the new values) to see this reflected.";
    			set_style(p, "color", "red");
    			add_location(p, file$8, 126, 8, 4664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(126:4) {#if showingOldBfile}",
    		ctx
    	});

    	return block;
    }

    // (131:4) {#if !bfileEditable}
    function create_if_block_3$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Edit bfile directly";
    			add_location(button, file$8, 131, 8, 5096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler_1*/ ctx[21]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(131:4) {#if !bfileEditable}",
    		ctx
    	});

    	return block;
    }

    // (134:4) {#if !autoSave}
    function create_if_block_1$5(ctx) {
    	let p;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*unsaved*/ ctx[9] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			if (if_block) if_block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Save";
    			add_location(button, file$8, 136, 12, 5350);
    			add_location(p, file$8, 134, 8, 5221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			if (if_block) if_block.m(p, null);
    			append_dev(p, t0);
    			append_dev(p, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*save*/ ctx[13]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*unsaved*/ ctx[9]) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(p, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(134:4) {#if !autoSave}",
    		ctx
    	});

    	return block;
    }

    // (136:12) {#if unsaved}
    function create_if_block_2$2(ctx) {
    	let span;
    	let br;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "The current version of the bfile is not saved";
    			br = element("br");
    			set_style(span, "color", "red");
    			add_location(span, file$8, 135, 25, 5250);
    			add_location(br, file$8, 135, 102, 5327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, br, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(136:12) {#if unsaved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let if_block = /*$status*/ ctx[6].done && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$status*/ ctx[6].done) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sha256Hash(text) {
    	let buffer = new TextEncoder().encode(text);

    	return crypto.subtle.digest("SHA-256", buffer).then(hash => {
    		let hexCodes = [];
    		let view = new DataView(hash);

    		for (let i = 0; i < view.byteLength; i += 4) {
    			let value = view.getUint32(i);
    			let stringValue = value.toString(16);
    			let padding = "00000000";
    			let paddedValue = (padding + stringValue).slice(-padding.length);
    			hexCodes.push(paddedValue);
    		}

    		return hexCodes.join("");
    	});
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let autoSave;

    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(5, $progData = $$value)), progData);

    	let $status,
    		$$unsubscribe_status = noop,
    		$$subscribe_status = () => ($$unsubscribe_status(), $$unsubscribe_status = subscribe(status, $$value => $$invalidate(6, $status = $$value)), status);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_status());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Output', slots, []);
    	let { status } = $$props;
    	validate_store(status, 'status');
    	$$subscribe_status();
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let maxSequentialResult = 0;

    	function calculateMaxSequentialResult(s, p) {
    		if (!s.done) return;
    		let r = p.offset;
    		let result = s.result;
    		while (result[r] && r.toString().length + result[r].length + 1 <= 1000) r++;
    		r--;

    		if (r !== maxSequentialResult) {
    			$$invalidate(7, maxSequentialResult = r);
    		}
    	}

    	let viewingOutput = false;
    	let wasDone = false;
    	let bfile = "";

    	function doneUpdate(done) {
    		if (!wasDone && done) createBfile();
    		wasDone = done;
    	}

    	function generateHeader(modified = false) {
    		return (modified ? "# Edited after generation\n" : "") + "# Generated with bfile toolbox (https://toolbox.winstondegreef.com) with the following settings (includes version):\n# " + splitIntoLines(JSON.stringify($progData), 900) + "\n";
    	}

    	let showingOldBfile = false;
    	progData.subscribe(_ => $$invalidate(8, showingOldBfile = true));

    	function createBfile() {
    		set_store_value(progData, $progData.timestamp = Date.now(), $progData);
    		setTimeout(_ => $$invalidate(8, showingOldBfile = false), 0);
    		$$invalidate(9, unsaved = true);
    		let result = $status.result;

    		let truncate = $progData.shouldTruncate
    		? $progData.truncate
    		: maxSequentialResult;

    		let offset = $progData.offset;
    		console.log($progData.includeHeader);
    		$$invalidate(2, bfile = $progData.includeHeader ? generateHeader() : "");
    		let i = offset;

    		while (result[i] && i <= truncate) {
    			let line = i + " " + result[i] + "\n";
    			$$invalidate(2, bfile += line);
    			i++;
    		}

    		$$invalidate(3, bfileEditable = false);
    		return bfile;
    	}

    	let bfileEditable = false;

    	function enableBfileEdit(disable = false) {
    		$$invalidate(9, unsaved = true);
    		$$invalidate(3, bfileEditable = !disable);
    		$$invalidate(2, bfile = bfile.replace(/^(\#.*\n?)*/, generateHeader(!disable)));
    	}

    	let unsaved = true;
    	let bfileFile = null;

    	function save(_) {
    		console.log("saved");
    		$$invalidate(9, unsaved = false);
    		let blob = new Blob([bfile]);
    		let filename = "b" + $progData.sequenceId.slice(1) + ".txt";
    		$$invalidate(10, bfileFile = new File([blob], filename, { type: "text/plain" }));
    		let el = document.querySelector("[name=upload_file0]");
    		let dataTransfer = new DataTransfer();
    		dataTransfer.items.add(bfileFile);
    		el.files = dataTransfer.files;
    	}

    	function openBfile() {
    		console.log(bfileFile);
    		let url = URL.createObjectURL(bfileFile);
    		open(url, "_blank");
    		setTimeout(_ => URL.revokeObjectURL(url), 10000);
    	}

    	let dataField = document.getElementById("edit_Data").innerText.split(", ");

    	function compareDataField(result, offset, df) {
    		let maxl = Math.min(maxSequentialResult - offset + 1, df.length);

    		for (let i = 0; i < maxl; i++) {
    			if (result[i + offset] !== df[i]) {
    				return false;
    			}
    		}
    	}

    	function compareLengthWithDataField(result, offset, df) {
    		return maxSequentialResult - offset + 1 < df.length;
    	}

    	// function compareAccuracyWithOldBfile(result: Status["result"], offset: number, oldBfile: $Bfile) {
    	//     if (!oldBfile.data) return true
    	// }
    	let oldBfile = new Bfile($progData.sequenceId);

    	$$self.$$.on_mount.push(function () {
    		if (status === undefined && !('status' in $$props || $$self.$$.bound[$$self.$$.props['status']])) {
    			console_1$4.warn("<Output> was created without expected prop 'status'");
    		}

    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console_1$4.warn("<Output> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['status', 'progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Output> was created with unknown prop '${key}'`);
    	});

    	function input0_change_handler() {
    		$progData.shouldTruncate = this.checked;
    		progData.set($progData);
    	}

    	function input1_input_handler() {
    		$progData.truncate = to_number(this.value);
    		progData.set($progData);
    	}

    	function input2_change_handler() {
    		$progData.includeHeader = this.checked;
    		progData.set($progData);
    	}

    	const click_handler = () => createBfile();

    	function textarea_input_handler() {
    		bfile = this.value;
    		$$invalidate(2, bfile);
    	}

    	const input_handler = () => $$invalidate(9, unsaved = true);
    	const click_handler_1 = () => enableBfileEdit();

    	$$self.$$set = $$props => {
    		if ('status' in $$props) $$subscribe_status($$invalidate(0, status = $$props.status));
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(1, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		Status,
    		Bfile,
    		splitIntoLines,
    		status,
    		progData,
    		maxSequentialResult,
    		calculateMaxSequentialResult,
    		viewingOutput,
    		wasDone,
    		bfile,
    		doneUpdate,
    		generateHeader,
    		sha256Hash,
    		showingOldBfile,
    		createBfile,
    		bfileEditable,
    		enableBfileEdit,
    		unsaved,
    		bfileFile,
    		save,
    		openBfile,
    		dataField,
    		compareDataField,
    		compareLengthWithDataField,
    		oldBfile,
    		autoSave,
    		$progData,
    		$status
    	});

    	$$self.$inject_state = $$props => {
    		if ('status' in $$props) $$subscribe_status($$invalidate(0, status = $$props.status));
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(1, progData = $$props.progData));
    		if ('maxSequentialResult' in $$props) $$invalidate(7, maxSequentialResult = $$props.maxSequentialResult);
    		if ('viewingOutput' in $$props) viewingOutput = $$props.viewingOutput;
    		if ('wasDone' in $$props) wasDone = $$props.wasDone;
    		if ('bfile' in $$props) $$invalidate(2, bfile = $$props.bfile);
    		if ('showingOldBfile' in $$props) $$invalidate(8, showingOldBfile = $$props.showingOldBfile);
    		if ('bfileEditable' in $$props) $$invalidate(3, bfileEditable = $$props.bfileEditable);
    		if ('unsaved' in $$props) $$invalidate(9, unsaved = $$props.unsaved);
    		if ('bfileFile' in $$props) $$invalidate(10, bfileFile = $$props.bfileFile);
    		if ('dataField' in $$props) dataField = $$props.dataField;
    		if ('oldBfile' in $$props) oldBfile = $$props.oldBfile;
    		if ('autoSave' in $$props) $$invalidate(4, autoSave = $$props.autoSave);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$status, $progData*/ 96) {
    			calculateMaxSequentialResult($status, $progData);
    		}

    		if ($$self.$$.dirty & /*$status*/ 64) {
    			doneUpdate($status.done);
    		}

    		if ($$self.$$.dirty & /*bfileEditable*/ 8) {
    			$$invalidate(4, autoSave = !bfileEditable);
    		}

    		if ($$self.$$.dirty & /*autoSave, bfile*/ 20) {
    			autoSave && save();
    		}
    	};

    	return [
    		status,
    		progData,
    		bfile,
    		bfileEditable,
    		autoSave,
    		$progData,
    		$status,
    		maxSequentialResult,
    		showingOldBfile,
    		unsaved,
    		bfileFile,
    		createBfile,
    		enableBfileEdit,
    		save,
    		openBfile,
    		input0_change_handler,
    		input1_input_handler,
    		input2_change_handler,
    		click_handler,
    		textarea_input_handler,
    		input_handler,
    		click_handler_1
    	];
    }

    class Output extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { status: 0, progData: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Output",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get status() {
    		throw new Error("<Output>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set status(value) {
    		throw new Error("<Output>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progData() {
    		throw new Error("<Output>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<Output>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/ListSettings.svelte generated by Svelte v3.58.0 */
    const file$7 = "src/src/ListSettings.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (109:72) 
    function create_if_block_1$4(ctx) {
    	let p0;
    	let label;
    	let t0;
    	let br;
    	let t1;
    	let textarea;
    	let t2;
    	let t3;
    	let p1;
    	let t4;
    	let t5_value = /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.customGuesses.join(", ") + "";
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block = /*$lineDiagnosticsStore*/ ctx[3].length && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			label = element("label");
    			t0 = text("Custom guesses: (one per line, blank and invalid lines are ignored)");
    			br = element("br");
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			p1 = element("p");
    			t4 = text("parsed guesses: ");
    			t5 = text(t5_value);
    			add_location(br, file$7, 111, 79, 4461);
    			attr_dev(textarea, "class", "svelte-1mgq5t6");
    			add_location(textarea, file$7, 112, 12, 4478);
    			attr_dev(label, "for", "toolbox--list-custom-guess");
    			add_location(label, file$7, 110, 8, 4341);
    			add_location(p0, file$7, 109, 4, 4329);
    			add_location(p1, file$7, 124, 4, 4808);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, label);
    			append_dev(label, t0);
    			append_dev(label, br);
    			append_dev(label, t1);
    			append_dev(label, textarea);
    			set_input_value(textarea, /*customGuessesText*/ ctx[1]);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t4);
    			append_dev(p1, t5);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*customGuessesText*/ 2) {
    				set_input_value(textarea, /*customGuessesText*/ ctx[1]);
    			}

    			if (/*$lineDiagnosticsStore*/ ctx[3].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(t3.parentNode, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$progData*/ 4 && t5_value !== (t5_value = /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.customGuesses.join(", ") + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(109:72) ",
    		ctx
    	});

    	return block;
    }

    // (99:0) {#if $progData.listSettings.lengthGuessAlgorithm.type === "linear"}
    function create_if_block$6(ctx) {
    	let p;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let br;
    	let t2;
    	let label1;
    	let t3;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			label0 = element("label");
    			t0 = text("Start guess: ");
    			input0 = element("input");
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			label1 = element("label");
    			t3 = text("Increment: ");
    			input1 = element("input");
    			attr_dev(input0, "id", "toolbox--list-linear-start");
    			attr_dev(input0, "type", "number");
    			add_location(input0, file$7, 101, 25, 3890);
    			attr_dev(label0, "for", "toolbox--list-linear-start");
    			add_location(label0, file$7, 100, 8, 3824);
    			add_location(br, file$7, 102, 16, 4021);
    			attr_dev(input1, "id", "toolbox--list-linear-increment");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$7, 104, 23, 4102);
    			attr_dev(label1, "for", "toolbox--list-linear-increment");
    			add_location(label1, file$7, 103, 8, 4034);
    			add_location(p, file$7, 99, 4, 3812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.start);
    			append_dev(label0, t1);
    			append_dev(p, br);
    			append_dev(p, t2);
    			append_dev(p, label1);
    			append_dev(label1, t3);
    			append_dev(label1, input1);
    			set_input_value(input1, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.increment);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 4 && to_number(input0.value) !== /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.start) {
    				set_input_value(input0, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.start);
    			}

    			if (dirty & /*$progData*/ 4 && to_number(input1.value) !== /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.increment) {
    				set_input_value(input1, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.increment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(99:0) {#if $progData.listSettings.lengthGuessAlgorithm.type === \\\"linear\\\"}",
    		ctx
    	});

    	return block;
    }

    // (117:4) {#if $lineDiagnosticsStore.length}
    function create_if_block_2$1(ctx) {
    	let p;
    	let strong;
    	let br;
    	let t1;
    	let each_value = /*$lineDiagnosticsStore*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "There are some proplems with these guesses:";
    			br = element("br");
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(strong, file$7, 118, 12, 4625);
    			add_location(br, file$7, 118, 72, 4685);
    			add_location(p, file$7, 117, 8, 4609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, strong);
    			append_dev(p, br);
    			append_dev(p, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(p, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$lineDiagnosticsStore*/ 8) {
    				each_value = /*$lineDiagnosticsStore*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(117:4) {#if $lineDiagnosticsStore.length}",
    		ctx
    	});

    	return block;
    }

    // (120:12) {#each $lineDiagnosticsStore as l}
    function create_each_block$1(ctx) {
    	let t_value = /*l*/ ctx[11] + "";
    	let t;
    	let br;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    			br = element("br");
    			add_location(br, file$7, 120, 19, 4756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$lineDiagnosticsStore*/ 8 && t_value !== (t_value = /*l*/ ctx[11] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(120:12) {#each $lineDiagnosticsStore as l}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let label;
    	let t2;
    	let select;
    	let option0;
    	let option1;
    	let t5;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.type === "linear") return create_if_block$6;
    		if (/*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.type === "custom") return create_if_block_1$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "List settings";
    			t1 = space();
    			p = element("p");
    			label = element("label");
    			t2 = text("Length Guess Algorithm: \n        ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Linear (default)";
    			option1 = element("option");
    			option1.textContent = "Custom";
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$7, 86, 0, 3368);
    			option0.__value = "linear";
    			option0.value = option0.__value;
    			add_location(option0, file$7, 91, 12, 3602);
    			option1.__value = "custom";
    			option1.value = option1.__value;
    			add_location(option1, file$7, 92, 12, 3663);
    			attr_dev(select, "id", "toolbox--list-guess-algorithm");
    			if (/*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$7, 90, 8, 3484);
    			attr_dev(label, "for", "toolbox--list-guess-algorithm");
    			add_location(label, file$7, 88, 4, 3399);
    			add_location(p, file$7, 87, 0, 3391);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, label);
    			append_dev(label, t2);
    			append_dev(label, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.type, true);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progData*/ 4) {
    				select_option(select, /*$progData*/ ctx[2].listSettings.lengthGuessAlgorithm.type);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function findIndexes(arr, callback) {
    	let result = [];

    	for (let i = 0; i < arr.length; i++) {
    		if (callback(arr[i], arr[i - 1])) result.push(i);
    	}

    	return result;
    }

    function subtract(arr1, arr2) {
    	let result = [];

    	for (let value of arr1) {
    		if (!arr2.includes(value)) result.push(value);
    	}

    	return result;
    }

    function max(arr) {
    	let m = -Infinity;

    	for (let v of arr) {
    		if (v > m) m = v;
    	}

    	return m;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(2, $progData = $$value)), progData);

    	let $lineDiagnosticsStore;
    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ListSettings', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let customGuessesText = "";
    	let lineDiagnostics = [];
    	let lineDiagnosticsStore = writable([]);
    	validate_store(lineDiagnosticsStore, 'lineDiagnosticsStore');
    	component_subscribe($$self, lineDiagnosticsStore, value => $$invalidate(3, $lineDiagnosticsStore = value));

    	function parseCustomGuessesTextAndUpdate(text) {
    		let lines = text.split("\n");
    		let guesses = [];
    		let lineDiagnostics = [];

    		for (let i = 0; i < lines.length; i++) {
    			let line = lines[i];
    			let trimmed = line.trim();

    			if (trimmed === "") {
    				continue;
    			}

    			let guess = Number(trimmed);

    			if (Number.isNaN(guess)) {
    				lineDiagnostics.push(`line ${i}: could not parse number (${trimmed})`);
    				continue;
    			}

    			if (!Number.isFinite(guess)) {
    				lineDiagnostics.push(`line ${i}: number (absolute value) is too large to use (${trimmed})`);
    			}

    			guesses.push(guess);
    		}

    		let floats = findIndexes(guesses, v => !Number.isInteger(v));
    		let unsafeInts = findIndexes(guesses, v => !Number.isSafeInteger(v));
    		unsafeInts = subtract(unsafeInts, floats);

    		let decreases = findIndexes(guesses, (n, prev) => {
    			if (typeof prev !== "number") return false;
    			return prev > n;
    		});

    		let repeats = findIndexes(guesses, (n, p) => n === p);

    		if (decreases.length) {
    			lineDiagnostics.push(`A guess is immediately followed by a smaller one at the following valid guess indexes (this makes no sense and is a waste of computing): ${decreases.join(", ")}.`);
    		}

    		if (repeats.length) {
    			lineDiagnostics.push(`A guess is followed by a duplicate at the following valid guess indexes (this makes no sense and is a waste of computing): ${repeats.join(", ")}`);
    		}

    		if (floats.length) {
    			lineDiagnostics.push(`The following guesses (valid guess indexes listed) are not integers, this could lead to a bunch of errors because these guesses are expected to be integers: ${floats.join(", ")}`);
    		}

    		if (unsafeInts.length) {
    			lineDiagnostics.push(`The following guesses (valid guess indexes listed) are too large to be stored effectively in a 64bit float, causing roundoff errors: ${unsafeInts.join(", ")}`);
    		}

    		if (max(guesses) < 10001 - $progData.offset) {
    			lineDiagnostics.push(`the largest guess is less than the maximum possible amount of terms to generate. Largest guess: ${max(guesses)}, largest guess needed to insure calculation up to and including index 10000: ${10001 - $progData.offset} `);
    		}

    		// other errors
    		if (guesses.length === 0) {
    			lineDiagnostics.push(`no valid guesses`);
    		}

    		lineDiagnostics = lineDiagnostics;
    		lineDiagnosticsStore.set(lineDiagnostics);
    		set_store_value(progData, $progData.listSettings.lengthGuessAlgorithm.customGuesses = guesses, $progData);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console.warn("<ListSettings> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListSettings> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$progData.listSettings.lengthGuessAlgorithm.type = select_value(this);
    		progData.set($progData);
    	}

    	function input0_input_handler() {
    		$progData.listSettings.lengthGuessAlgorithm.start = to_number(this.value);
    		progData.set($progData);
    	}

    	function input1_input_handler() {
    		$progData.listSettings.lengthGuessAlgorithm.increment = to_number(this.value);
    		progData.set($progData);
    	}

    	function textarea_input_handler() {
    		customGuessesText = this.value;
    		$$invalidate(1, customGuessesText);
    	}

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		progData,
    		customGuessesText,
    		findIndexes,
    		subtract,
    		max,
    		lineDiagnostics,
    		lineDiagnosticsStore,
    		parseCustomGuessesTextAndUpdate,
    		$progData,
    		$lineDiagnosticsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    		if ('customGuessesText' in $$props) $$invalidate(1, customGuessesText = $$props.customGuessesText);
    		if ('lineDiagnostics' in $$props) lineDiagnostics = $$props.lineDiagnostics;
    		if ('lineDiagnosticsStore' in $$props) $$invalidate(4, lineDiagnosticsStore = $$props.lineDiagnosticsStore);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*customGuessesText*/ 2) {
    			parseCustomGuessesTextAndUpdate(customGuessesText);
    		}
    	};

    	return [
    		progData,
    		customGuessesText,
    		$progData,
    		$lineDiagnosticsStore,
    		lineDiagnosticsStore,
    		select_change_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler
    	];
    }

    class ListSettings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ListSettings",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get progData() {
    		throw new Error("<ListSettings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<ListSettings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/DataSizeInput.svelte generated by Svelte v3.58.0 */

    const file$6 = "src/src/DataSizeInput.svelte";

    function create_fragment$8(ctx) {
    	let input;
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "B";
    			option1 = element("option");
    			option1.textContent = "KB";
    			option2 = element("option");
    			option2.textContent = "MB";
    			option3 = element("option");
    			option3.textContent = "GB";
    			attr_dev(input, "min", "0");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "class", "svelte-18xsg3a");
    			add_location(input, file$6, 10, 0, 221);
    			option0.__value = "b";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 12, 4, 307);
    			option1.__value = "kb";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 13, 4, 340);
    			option2.__value = "mb";
    			option2.value = option2.__value;
    			add_location(option2, file$6, 14, 4, 375);
    			option3.__value = "gb";
    			option3.value = option3.__value;
    			add_location(option3, file$6, 15, 4, 410);
    			if (/*unit*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$6, 11, 0, 276);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*amount*/ ctx[0]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*unit*/ ctx[1], true);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*amount*/ 1 && to_number(input.value) !== /*amount*/ ctx[0]) {
    				set_input_value(input, /*amount*/ ctx[0]);
    			}

    			if (dirty & /*unit*/ 2) {
    				select_option(select, /*unit*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let nextId$1 = 0;

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DataSizeInput', slots, []);
    	let myId = nextId$1++;
    	let { id = `toolbox--data-size-input-${myId}` } = $$props;
    	let { amount = 0 } = $$props;
    	let { unit = "b" } = $$props;
    	const writable_props = ['id', 'amount', 'unit'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DataSizeInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		amount = to_number(this.value);
    		$$invalidate(0, amount);
    	}

    	function select_change_handler() {
    		unit = select_value(this);
    		$$invalidate(1, unit);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    	};

    	$$self.$capture_state = () => ({ nextId: nextId$1, myId, id, amount, unit });

    	$$self.$inject_state = $$props => {
    		if ('myId' in $$props) myId = $$props.myId;
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    		if ('unit' in $$props) $$invalidate(1, unit = $$props.unit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [amount, unit, id, input_input_handler, select_change_handler];
    }

    class DataSizeInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { id: 2, amount: 0, unit: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DataSizeInput",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get id() {
    		throw new Error("<DataSizeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<DataSizeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<DataSizeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<DataSizeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<DataSizeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<DataSizeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/PariConfig.svelte generated by Svelte v3.58.0 */
    const file$5 = "src/src/PariConfig.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let label0;
    	let input;
    	let t2;
    	let a;
    	let t4;
    	let p1;
    	let label1;
    	let t5;
    	let datasizeinput0;
    	let updating_amount;
    	let updating_unit;
    	let t6;
    	let p2;
    	let label2;
    	let t7;
    	let datasizeinput1;
    	let updating_amount_1;
    	let updating_unit_1;
    	let current;
    	let mounted;
    	let dispose;

    	function datasizeinput0_amount_binding(value) {
    		/*datasizeinput0_amount_binding*/ ctx[5](value);
    	}

    	function datasizeinput0_unit_binding(value) {
    		/*datasizeinput0_unit_binding*/ ctx[6](value);
    	}

    	let datasizeinput0_props = { id: /*id1*/ ctx[2] };

    	if (/*$progData*/ ctx[1].langSettings.pari.parisizemax.amount !== void 0) {
    		datasizeinput0_props.amount = /*$progData*/ ctx[1].langSettings.pari.parisizemax.amount;
    	}

    	if (/*$progData*/ ctx[1].langSettings.pari.parisizemax.unit !== void 0) {
    		datasizeinput0_props.unit = /*$progData*/ ctx[1].langSettings.pari.parisizemax.unit;
    	}

    	datasizeinput0 = new DataSizeInput({
    			props: datasizeinput0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(datasizeinput0, 'amount', datasizeinput0_amount_binding));
    	binding_callbacks.push(() => bind(datasizeinput0, 'unit', datasizeinput0_unit_binding));

    	function datasizeinput1_amount_binding(value) {
    		/*datasizeinput1_amount_binding*/ ctx[7](value);
    	}

    	function datasizeinput1_unit_binding(value) {
    		/*datasizeinput1_unit_binding*/ ctx[8](value);
    	}

    	let datasizeinput1_props = { id: /*id2*/ ctx[3] };

    	if (/*$progData*/ ctx[1].langSettings.pari.parisize.amount !== void 0) {
    		datasizeinput1_props.amount = /*$progData*/ ctx[1].langSettings.pari.parisize.amount;
    	}

    	if (/*$progData*/ ctx[1].langSettings.pari.parisize.unit !== void 0) {
    		datasizeinput1_props.unit = /*$progData*/ ctx[1].langSettings.pari.parisize.unit;
    	}

    	datasizeinput1 = new DataSizeInput({
    			props: datasizeinput1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(datasizeinput1, 'amount', datasizeinput1_amount_binding));
    	binding_callbacks.push(() => bind(datasizeinput1, 'unit', datasizeinput1_unit_binding));

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Pari";
    			t1 = space();
    			p0 = element("p");
    			label0 = element("label");
    			input = element("input");
    			t2 = text(" include ");
    			a = element("a");
    			a.textContent = "memoize.gp";
    			t4 = space();
    			p1 = element("p");
    			label1 = element("label");
    			t5 = text("pari size max:\n        ");
    			create_component(datasizeinput0.$$.fragment);
    			t6 = space();
    			p2 = element("p");
    			label2 = element("label");
    			t7 = text("pari size (you shouldn't change this, change pari size max instead):\n        ");
    			create_component(datasizeinput1.$$.fragment);
    			add_location(h1, file$5, 5, 0, 119);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", "toolbox--include-memoize");
    			add_location(input, file$5, 7, 4, 179);
    			attr_dev(a, "href", "https://user42.tuxfamily.org/pari-memoize/index.html");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$5, 7, 124, 299);
    			attr_dev(label0, "for", "toolbox--include-memoize");
    			add_location(label0, file$5, 6, 3, 136);
    			add_location(p0, file$5, 6, 0, 133);
    			attr_dev(label1, "for", /*id1*/ ctx[2]);
    			add_location(label1, file$5, 10, 4, 414);
    			add_location(p1, file$5, 9, 0, 406);
    			attr_dev(label2, "for", /*id2*/ ctx[3]);
    			add_location(label2, file$5, 16, 4, 634);
    			add_location(p2, file$5, 15, 0, 626);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, label0);
    			append_dev(label0, input);
    			input.checked = /*$progData*/ ctx[1].langSettings.pari.includeMemoize;
    			append_dev(label0, t2);
    			append_dev(label0, a);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, label1);
    			append_dev(label1, t5);
    			mount_component(datasizeinput0, label1, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, label2);
    			append_dev(label2, t7);
    			mount_component(datasizeinput1, label2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progData*/ 2) {
    				input.checked = /*$progData*/ ctx[1].langSettings.pari.includeMemoize;
    			}

    			const datasizeinput0_changes = {};

    			if (!updating_amount && dirty & /*$progData*/ 2) {
    				updating_amount = true;
    				datasizeinput0_changes.amount = /*$progData*/ ctx[1].langSettings.pari.parisizemax.amount;
    				add_flush_callback(() => updating_amount = false);
    			}

    			if (!updating_unit && dirty & /*$progData*/ 2) {
    				updating_unit = true;
    				datasizeinput0_changes.unit = /*$progData*/ ctx[1].langSettings.pari.parisizemax.unit;
    				add_flush_callback(() => updating_unit = false);
    			}

    			datasizeinput0.$set(datasizeinput0_changes);
    			const datasizeinput1_changes = {};

    			if (!updating_amount_1 && dirty & /*$progData*/ 2) {
    				updating_amount_1 = true;
    				datasizeinput1_changes.amount = /*$progData*/ ctx[1].langSettings.pari.parisize.amount;
    				add_flush_callback(() => updating_amount_1 = false);
    			}

    			if (!updating_unit_1 && dirty & /*$progData*/ 2) {
    				updating_unit_1 = true;
    				datasizeinput1_changes.unit = /*$progData*/ ctx[1].langSettings.pari.parisize.unit;
    				add_flush_callback(() => updating_unit_1 = false);
    			}

    			datasizeinput1.$set(datasizeinput1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(datasizeinput0.$$.fragment, local);
    			transition_in(datasizeinput1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(datasizeinput0.$$.fragment, local);
    			transition_out(datasizeinput1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p1);
    			destroy_component(datasizeinput0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p2);
    			destroy_component(datasizeinput1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(1, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PariConfig', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let id1;
    	let id2;

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console.warn("<PariConfig> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PariConfig> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		$progData.langSettings.pari.includeMemoize = this.checked;
    		progData.set($progData);
    	}

    	function datasizeinput0_amount_binding(value) {
    		if ($$self.$$.not_equal($progData.langSettings.pari.parisizemax.amount, value)) {
    			$progData.langSettings.pari.parisizemax.amount = value;
    			progData.set($progData);
    		}
    	}

    	function datasizeinput0_unit_binding(value) {
    		if ($$self.$$.not_equal($progData.langSettings.pari.parisizemax.unit, value)) {
    			$progData.langSettings.pari.parisizemax.unit = value;
    			progData.set($progData);
    		}
    	}

    	function datasizeinput1_amount_binding(value) {
    		if ($$self.$$.not_equal($progData.langSettings.pari.parisize.amount, value)) {
    			$progData.langSettings.pari.parisize.amount = value;
    			progData.set($progData);
    		}
    	}

    	function datasizeinput1_unit_binding(value) {
    		if ($$self.$$.not_equal($progData.langSettings.pari.parisize.unit, value)) {
    			$progData.langSettings.pari.parisize.unit = value;
    			progData.set($progData);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		DataSizeInput,
    		progData,
    		id1,
    		id2,
    		$progData
    	});

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    		if ('id1' in $$props) $$invalidate(2, id1 = $$props.id1);
    		if ('id2' in $$props) $$invalidate(3, id2 = $$props.id2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		progData,
    		$progData,
    		id1,
    		id2,
    		input_change_handler,
    		datasizeinput0_amount_binding,
    		datasizeinput0_unit_binding,
    		datasizeinput1_amount_binding,
    		datasizeinput1_unit_binding
    	];
    }

    class PariConfig extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PariConfig",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get progData() {
    		throw new Error("<PariConfig>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<PariConfig>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/TableSettings.svelte generated by Svelte v3.58.0 */

    const file$4 = "src/src/TableSettings.svelte";

    // (11:0) {#if $progData.tableSettings.type === "square"}
    function create_if_block$5(ctx) {
    	let p;
    	let label;
    	let input;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			label = element("label");
    			input = element("input");
    			t = text("Upward antidiagonal?");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", "toolbox-table-upward");
    			add_location(input, file$4, 12, 42, 613);
    			attr_dev(label, "for", "toolbox-table-upward");
    			add_location(label, file$4, 12, 8, 579);
    			add_location(p, file$4, 11, 4, 567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, label);
    			append_dev(label, input);
    			input.checked = /*$progData*/ ctx[1].tableSettings.squareUpward;
    			append_dev(label, t);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 2) {
    				input.checked = /*$progData*/ ctx[1].tableSettings.squareUpward;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(11:0) {#if $progData.tableSettings.type === \\\"square\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let label0;
    	let input0;
    	let t4;
    	let br1;
    	let t5;
    	let label1;
    	let input1;
    	let t6;
    	let br2;
    	let t7;
    	let t8;
    	let label2;
    	let t9;
    	let input2;
    	let br3;
    	let t10;
    	let label3;
    	let t11;
    	let input3;
    	let br4;
    	let t12;
    	let p1;
    	let t13;
    	let p2;
    	let binding_group;
    	let mounted;
    	let dispose;
    	let if_block = /*$progData*/ ctx[1].tableSettings.type === "square" && create_if_block$5(ctx);
    	binding_group = init_binding_group(/*$$binding_groups*/ ctx[3][0]);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Table/Triangle Explicit Settings";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Is it a...?");
    			br0 = element("br");
    			t3 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t4 = text(" Table");
    			br1 = element("br");
    			t5 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t6 = text(" Triangle");
    			br2 = element("br");
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			label2 = element("label");
    			t9 = text("start x (first argument): ");
    			input2 = element("input");
    			br3 = element("br");
    			t10 = space();
    			label3 = element("label");
    			t11 = text("start y (second argument): ");
    			input3 = element("input");
    			br4 = element("br");
    			t12 = space();
    			p1 = element("p");
    			t13 = space();
    			p2 = element("p");
    			add_location(h1, file$4, 3, 0, 50);
    			add_location(br0, file$4, 5, 15, 111);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "toolbox--table-table");
    			input0.__value = "square";
    			input0.value = input0.__value;
    			attr_dev(input0, "name", "toolbox--table-type");
    			add_location(input0, file$4, 6, 41, 157);
    			attr_dev(label0, "for", "toolbox--table-table");
    			add_location(label0, file$4, 6, 4, 120);
    			add_location(br1, file$4, 6, 190, 306);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "toolbox--table-triangle");
    			input1.__value = "triangle";
    			input1.value = input1.__value;
    			attr_dev(input1, "name", "toolbox--table-type");
    			add_location(input1, file$4, 7, 41, 352);
    			attr_dev(label1, "for", "toolbox--table-triangle");
    			add_location(label1, file$4, 7, 4, 315);
    			add_location(br2, file$4, 7, 193, 504);
    			add_location(p0, file$4, 4, 0, 92);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "id", "toolbox--table-explicit-startx");
    			add_location(input2, file$4, 16, 70, 829);
    			attr_dev(label2, "for", "toolbox--table-explicit-startx");
    			add_location(label2, file$4, 16, 0, 759);
    			add_location(br3, file$4, 16, 180, 939);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "id", "toolbox--table-explicit-starty");
    			add_location(input3, file$4, 17, 71, 1015);
    			attr_dev(label3, "for", "toolbox--table-explicit-starty");
    			add_location(label3, file$4, 17, 0, 944);
    			add_location(br4, file$4, 17, 181, 1125);
    			add_location(p1, file$4, 18, 0, 1130);
    			add_location(p2, file$4, 20, 0, 1139);
    			binding_group.p(input0, input1);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, br0);
    			append_dev(p0, t3);
    			append_dev(p0, label0);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*$progData*/ ctx[1].tableSettings.type;
    			append_dev(label0, t4);
    			append_dev(p0, br1);
    			append_dev(p0, t5);
    			append_dev(p0, label1);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*$progData*/ ctx[1].tableSettings.type;
    			append_dev(label1, t6);
    			append_dev(p0, br2);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, t9);
    			append_dev(label2, input2);
    			set_input_value(input2, /*$progData*/ ctx[1].tableSettings.xoffset);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, t11);
    			append_dev(label3, input3);
    			set_input_value(input3, /*$progData*/ ctx[1].tableSettings.yoffset);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p2, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[2]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progData*/ 2) {
    				input0.checked = input0.__value === /*$progData*/ ctx[1].tableSettings.type;
    			}

    			if (dirty & /*$progData*/ 2) {
    				input1.checked = input1.__value === /*$progData*/ ctx[1].tableSettings.type;
    			}

    			if (/*$progData*/ ctx[1].tableSettings.type === "square") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(t8.parentNode, t8);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$progData*/ 2 && to_number(input2.value) !== /*$progData*/ ctx[1].tableSettings.xoffset) {
    				set_input_value(input2, /*$progData*/ ctx[1].tableSettings.xoffset);
    			}

    			if (dirty & /*$progData*/ 2 && to_number(input3.value) !== /*$progData*/ ctx[1].tableSettings.yoffset) {
    				set_input_value(input3, /*$progData*/ ctx[1].tableSettings.yoffset);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(label2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(label3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p2);
    			binding_group.r();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(1, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableSettings', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console.warn("<TableSettings> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableSettings> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_change_handler() {
    		$progData.tableSettings.type = this.__value;
    		progData.set($progData);
    	}

    	function input1_change_handler() {
    		$progData.tableSettings.type = this.__value;
    		progData.set($progData);
    	}

    	function input_change_handler() {
    		$progData.tableSettings.squareUpward = this.checked;
    		progData.set($progData);
    	}

    	function input2_input_handler() {
    		$progData.tableSettings.xoffset = to_number(this.value);
    		progData.set($progData);
    	}

    	function input3_input_handler() {
    		$progData.tableSettings.yoffset = to_number(this.value);
    		progData.set($progData);
    	}

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({ progData, $progData });

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		progData,
    		$progData,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input_change_handler,
    		input2_input_handler,
    		input3_input_handler
    	];
    }

    class TableSettings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableSettings",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get progData() {
    		throw new Error("<TableSettings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<TableSettings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/ImportBfile.svelte generated by Svelte v3.58.0 */

    const { console: console_1$3 } = globals;
    const file$3 = "src/src/ImportBfile.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[13] = list;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (34:0) {#if toShow.length}
    function create_if_block_1$3(ctx) {
    	let p;
    	let each_value = /*toShow*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$3, 34, 4, 986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(p, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*toShow, selected, modified*/ 14) {
    				each_value = /*toShow*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(34:0) {#if toShow.length}",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#each toShow as seq}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let input_id_value;
    	let t_value = /*seq*/ ctx[12] + "";
    	let t;
    	let label_for_value;
    	let br;
    	let mounted;
    	let dispose;

    	function input_handler() {
    		return /*input_handler*/ ctx[7](/*seq*/ ctx[12]);
    	}

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[8].call(input, /*seq*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = text(t_value);
    			br = element("br");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", input_id_value = "toolbox--import-bfile-" + /*seq*/ ctx[12]);
    			add_location(input, file$3, 36, 53, 1073);
    			attr_dev(label, "for", label_for_value = "toolbox--import-bfile-" + /*seq*/ ctx[12]);
    			add_location(label, file$3, 36, 12, 1032);
    			add_location(br, file$3, 36, 189, 1209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*selected*/ ctx[2][/*seq*/ ctx[12]];
    			append_dev(label, t);
    			insert_dev(target, br, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_handler, false, false, false, false),
    					listen_dev(input, "change", input_change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*toShow*/ 2 && input_id_value !== (input_id_value = "toolbox--import-bfile-" + /*seq*/ ctx[12])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*selected, toShow*/ 6) {
    				input.checked = /*selected*/ ctx[2][/*seq*/ ctx[12]];
    			}

    			if (dirty & /*toShow*/ 2 && t_value !== (t_value = /*seq*/ ctx[12] + "")) set_data_dev(t, t_value);

    			if (dirty & /*toShow*/ 2 && label_for_value !== (label_for_value = "toolbox--import-bfile-" + /*seq*/ ctx[12])) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(br);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(36:8) {#each toShow as seq}",
    		ctx
    	});

    	return block;
    }

    // (42:0) {#if toShow.includes(addSeq)}
    function create_if_block$4(ctx) {
    	let p;
    	let t0;

    	let t1_value = (/*selected*/ ctx[2][/*addSeq*/ ctx[4]]
    	? "and selected"
    	: "but not selected. check the checkbox instead") + "";

    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("This sequence's checkbox is already shown. (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			set_style(p, "color", "red");
    			add_location(p, file$3, 42, 4, 1436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selected, addSeq*/ 20 && t1_value !== (t1_value = (/*selected*/ ctx[2][/*addSeq*/ ctx[4]]
    			? "and selected"
    			: "but not selected. check the checkbox instead") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(42:0) {#if toShow.includes(addSeq)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let h1;
    	let t1;
    	let t2;
    	let label;
    	let t3;
    	let input;
    	let t4;
    	let br;
    	let t5;
    	let show_if = /*toShow*/ ctx[1].includes(/*addSeq*/ ctx[4]);
    	let t6;
    	let button;
    	let t7;
    	let button_disabled_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*toShow*/ ctx[1].length && create_if_block_1$3(ctx);
    	let if_block1 = show_if && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Import bfiles";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			label = element("label");
    			t3 = text("Import other bfile: A");
    			input = element("input");
    			t4 = space();
    			br = element("br");
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			button = element("button");
    			t7 = text("Add");
    			add_location(h1, file$3, 31, 0, 938);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "toolbox--add-import-bfile");
    			add_location(input, file$3, 40, 60, 1305);
    			attr_dev(label, "for", "toolbox--add-import-bfile");
    			add_location(label, file$3, 40, 0, 1245);
    			add_location(br, file$3, 40, 152, 1397);
    			button.disabled = button_disabled_value = /*toShow*/ ctx[1].includes(/*addSeq*/ ctx[4]);
    			add_location(button, file$3, 44, 0, 1598);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, label, anchor);
    			append_dev(label, t3);
    			append_dev(label, input);
    			append_dev(label, t4);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*handleToolboxChange*/ ctx[5], false, false, false, false),
    					listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[9]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*toShow*/ ctx[1].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*toShow, addSeq*/ 18) show_if = /*toShow*/ ctx[1].includes(/*addSeq*/ ctx[4]);

    			if (show_if) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(t6.parentNode, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*toShow, addSeq*/ 18 && button_disabled_value !== (button_disabled_value = /*toShow*/ ctx[1].includes(/*addSeq*/ ctx[4]))) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t5);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const seqRegExp = /(?<=\W)A\d{6,7}(?=\()/g;

    function instance$5($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(6, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ImportBfile', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let modified = {};
    	let toShow = [];

    	function searchCode(code) {
    		let seqs = code.match(seqRegExp);
    		$$invalidate(1, toShow = [...new Set(toShow.filter(v => modified[v]).concat(seqs))].sort());
    		$$invalidate(1, toShow = toShow.filter(v => typeof v === "string"));

    		function defaultValue(seq) {
    			return !code.match(new RegExp(seq + String.raw`\([^)]+\)=`));
    		}

    		toShow.forEach(seq => {
    			if (!modified[seq]) $$invalidate(2, selected[seq] = defaultValue(seq), selected);
    		});
    	}

    	const selected = {};

    	function save(ts, s) {
    		set_store_value(progData, $progData.importBfilesFor = ts.filter(seq => s[seq]), $progData);
    	}

    	let addSeq = "A0";

    	function handleToolboxChange(e) {
    		let target = e.target;
    		target.value = target.value.replaceAll(/\D/g, "");
    		$$invalidate(4, addSeq = "A" + target.value.padStart(6, "0"));
    	}

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console_1$3.warn("<ImportBfile> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<ImportBfile> was created with unknown prop '${key}'`);
    	});

    	const input_handler = seq => $$invalidate(3, modified[seq] = true, modified);

    	function input_change_handler(seq) {
    		selected[seq] = this.checked;
    		$$invalidate(2, selected);
    	}

    	const click_handler = () => {
    		$$invalidate(3, modified[addSeq] = true, modified);
    		$$invalidate(2, selected[addSeq] = true, selected);
    		toShow.push(addSeq);
    		toShow.sort();
    	};

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		progData,
    		modified,
    		toShow,
    		seqRegExp,
    		searchCode,
    		selected,
    		save,
    		addSeq,
    		handleToolboxChange,
    		$progData
    	});

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    		if ('modified' in $$props) $$invalidate(3, modified = $$props.modified);
    		if ('toShow' in $$props) $$invalidate(1, toShow = $$props.toShow);
    		if ('addSeq' in $$props) $$invalidate(4, addSeq = $$props.addSeq);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*toShow*/ 2) {
    			console.log("toShpw", toShow);
    		}

    		if ($$self.$$.dirty & /*$progData*/ 64) {
    			searchCode($progData.code);
    		}

    		if ($$self.$$.dirty & /*toShow, selected*/ 6) {
    			save(toShow, selected);
    		}
    	};

    	return [
    		progData,
    		toShow,
    		selected,
    		modified,
    		addSeq,
    		handleToolboxChange,
    		$progData,
    		input_handler,
    		input_change_handler,
    		click_handler
    	];
    }

    class ImportBfile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImportBfile",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get progData() {
    		throw new Error("<ImportBfile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<ImportBfile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let events = new class Events {
        constructor() {
            this.computeTypeListeners = [];
        }
        onComputeType(f) {
            this.computeTypeListeners.push(f);
        }
        dispatchComputeType(current, prev) {
            for (let f of this.computeTypeListeners) {
                f(current, prev);
            }
        }
    };

    /* src/src/Limit.svelte generated by Svelte v3.58.0 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/src/Limit.svelte";

    // (31:60) 
    function create_if_block_1$2(ctx) {
    	let p;
    	let label;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			label = element("label");
    			t = text("Max antidiagonal/row count: ");
    			input = element("input");
    			attr_dev(input, "id", "toolbox--limit-size-max-antidiagonal");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "min", "0");
    			add_location(input, file$2, 33, 40, 1234);
    			attr_dev(label, "for", "toolbox--limit-size-max-antidiagonal");
    			add_location(label, file$2, 32, 8, 1143);
    			add_location(p, file$2, 31, 4, 1131);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, label);
    			append_dev(label, t);
    			append_dev(label, input);
    			set_input_value(input, /*$progData*/ ctx[1].limit.maxIndex.maxAntidiaonal);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 2 && to_number(input.value) !== /*$progData*/ ctx[1].limit.maxIndex.maxAntidiaonal) {
    				set_input_value(input, /*$progData*/ ctx[1].limit.maxIndex.maxAntidiaonal);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(31:60) ",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if $progData.limit.maxIndex.type === "index"}
    function create_if_block$3(ctx) {
    	let p;
    	let label;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			label = element("label");
    			t = text("Max index: ");
    			input = element("input");
    			attr_dev(input, "id", "toolbox--limit-size-max-index");
    			attr_dev(input, "type", "number");
    			add_location(input, file$2, 27, 23, 936);
    			attr_dev(label, "for", "toolbox--limit-size-max-index");
    			add_location(label, file$2, 26, 8, 869);
    			add_location(p, file$2, 25, 4, 857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, label);
    			append_dev(label, t);
    			append_dev(label, input);
    			set_input_value(input, /*$progData*/ ctx[1].limit.maxIndex.maxIndex);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 2 && to_number(input.value) !== /*$progData*/ ctx[1].limit.maxIndex.maxIndex) {
    				set_input_value(input, /*$progData*/ ctx[1].limit.maxIndex.maxIndex);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:0) {#if $progData.limit.maxIndex.type === \\\"index\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let label0;
    	let t2;
    	let input;
    	let t3;
    	let p1;
    	let label1;
    	let t4;
    	let select;
    	let option0;
    	let option1;
    	let t7;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$progData*/ ctx[1].limit.maxIndex.type === "index") return create_if_block$3;
    		if (/*$progData*/ ctx[1].limit.maxIndex.type === 'antidiagonals') return create_if_block_1$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Limit output length";
    			t1 = space();
    			p0 = element("p");
    			label0 = element("label");
    			t2 = text("Max line length: ");
    			input = element("input");
    			t3 = space();
    			p1 = element("p");
    			label1 = element("label");
    			t4 = text("Max size type:\n        ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "index";
    			option1 = element("option");
    			option1.textContent = "antidiagonals/rows";
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$2, 9, 0, 284);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "toolbox--limit-line-length");
    			add_location(input, file$2, 11, 61, 378);
    			attr_dev(label0, "for", "toolbox--limit-line-length");
    			add_location(label0, file$2, 11, 4, 321);
    			add_location(p0, file$2, 10, 0, 313);
    			option0.__value = "index";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 18, 12, 661);
    			option1.__value = "antidiagonals";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 19, 12, 710);
    			attr_dev(select, "id", "toolbox--limit-size-type");
    			if (/*$progData*/ ctx[1].limit.maxIndex.type === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$2, 17, 8, 567);
    			attr_dev(label1, "for", "toolbox--limit-size-type");
    			add_location(label1, file$2, 15, 4, 497);
    			add_location(p1, file$2, 14, 0, 489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input);
    			set_input_value(input, /*$progData*/ ctx[1].limit.maxLineLength);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, label1);
    			append_dev(label1, t4);
    			append_dev(label1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*$progData*/ ctx[1].limit.maxIndex.type, true);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$progData*/ 2 && to_number(input.value) !== /*$progData*/ ctx[1].limit.maxLineLength) {
    				set_input_value(input, /*$progData*/ ctx[1].limit.maxLineLength);
    			}

    			if (dirty & /*$progData*/ 2) {
    				select_option(select, /*$progData*/ ctx[1].limit.maxIndex.type);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t7);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(1, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Limit', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	const ROW_TYPES = ["table explicit"];

    	events.onComputeType(current => {
    		set_store_value(progData, $progData.limit.maxIndex.type = ROW_TYPES.includes(current) ? "antidiagonals" : "index", $progData);
    		console.log("eventtt");
    	});

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console_1$2.warn("<Limit> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Limit> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		$progData.limit.maxLineLength = to_number(this.value);
    		progData.set($progData);
    	}

    	function select_change_handler() {
    		$progData.limit.maxIndex.type = select_value(this);
    		progData.set($progData);
    	}

    	function input_input_handler_1() {
    		$progData.limit.maxIndex.maxIndex = to_number(this.value);
    		progData.set($progData);
    	}

    	function input_input_handler_2() {
    		$progData.limit.maxIndex.maxAntidiaonal = to_number(this.value);
    		progData.set($progData);
    	}

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({ events, progData, ROW_TYPES, $progData });

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		progData,
    		$progData,
    		input_input_handler,
    		select_change_handler,
    		input_input_handler_1,
    		input_input_handler_2
    	];
    }

    class Limit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Limit",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get progData() {
    		throw new Error("<Limit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<Limit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var util;
    (function (util) {
        util.assertEqual = (val) => val;
        function assertIs(_arg) { }
        util.assertIs = assertIs;
        function assertNever(_x) {
            throw new Error();
        }
        util.assertNever = assertNever;
        util.arrayToEnum = (items) => {
            const obj = {};
            for (const item of items) {
                obj[item] = item;
            }
            return obj;
        };
        util.getValidEnumValues = (obj) => {
            const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
            const filtered = {};
            for (const k of validKeys) {
                filtered[k] = obj[k];
            }
            return util.objectValues(filtered);
        };
        util.objectValues = (obj) => {
            return util.objectKeys(obj).map(function (e) {
                return obj[e];
            });
        };
        util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
            ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
            : (object) => {
                const keys = [];
                for (const key in object) {
                    if (Object.prototype.hasOwnProperty.call(object, key)) {
                        keys.push(key);
                    }
                }
                return keys;
            };
        util.find = (arr, checker) => {
            for (const item of arr) {
                if (checker(item))
                    return item;
            }
            return undefined;
        };
        util.isInteger = typeof Number.isInteger === "function"
            ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
            : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
        function joinValues(array, separator = " | ") {
            return array
                .map((val) => (typeof val === "string" ? `'${val}'` : val))
                .join(separator);
        }
        util.joinValues = joinValues;
        util.jsonStringifyReplacer = (_, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            }
            return value;
        };
    })(util || (util = {}));
    var objectUtil;
    (function (objectUtil) {
        objectUtil.mergeShapes = (first, second) => {
            return {
                ...first,
                ...second, // second overwrites first
            };
        };
    })(objectUtil || (objectUtil = {}));
    const ZodParsedType = util.arrayToEnum([
        "string",
        "nan",
        "number",
        "integer",
        "float",
        "boolean",
        "date",
        "bigint",
        "symbol",
        "function",
        "undefined",
        "null",
        "array",
        "object",
        "unknown",
        "promise",
        "void",
        "never",
        "map",
        "set",
    ]);
    const getParsedType = (data) => {
        const t = typeof data;
        switch (t) {
            case "undefined":
                return ZodParsedType.undefined;
            case "string":
                return ZodParsedType.string;
            case "number":
                return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
            case "boolean":
                return ZodParsedType.boolean;
            case "function":
                return ZodParsedType.function;
            case "bigint":
                return ZodParsedType.bigint;
            case "symbol":
                return ZodParsedType.symbol;
            case "object":
                if (Array.isArray(data)) {
                    return ZodParsedType.array;
                }
                if (data === null) {
                    return ZodParsedType.null;
                }
                if (data.then &&
                    typeof data.then === "function" &&
                    data.catch &&
                    typeof data.catch === "function") {
                    return ZodParsedType.promise;
                }
                if (typeof Map !== "undefined" && data instanceof Map) {
                    return ZodParsedType.map;
                }
                if (typeof Set !== "undefined" && data instanceof Set) {
                    return ZodParsedType.set;
                }
                if (typeof Date !== "undefined" && data instanceof Date) {
                    return ZodParsedType.date;
                }
                return ZodParsedType.object;
            default:
                return ZodParsedType.unknown;
        }
    };

    const ZodIssueCode = util.arrayToEnum([
        "invalid_type",
        "invalid_literal",
        "custom",
        "invalid_union",
        "invalid_union_discriminator",
        "invalid_enum_value",
        "unrecognized_keys",
        "invalid_arguments",
        "invalid_return_type",
        "invalid_date",
        "invalid_string",
        "too_small",
        "too_big",
        "invalid_intersection_types",
        "not_multiple_of",
        "not_finite",
    ]);
    const quotelessJson = (obj) => {
        const json = JSON.stringify(obj, null, 2);
        return json.replace(/"([^"]+)":/g, "$1:");
    };
    class ZodError extends Error {
        constructor(issues) {
            super();
            this.issues = [];
            this.addIssue = (sub) => {
                this.issues = [...this.issues, sub];
            };
            this.addIssues = (subs = []) => {
                this.issues = [...this.issues, ...subs];
            };
            const actualProto = new.target.prototype;
            if (Object.setPrototypeOf) {
                // eslint-disable-next-line ban/ban
                Object.setPrototypeOf(this, actualProto);
            }
            else {
                this.__proto__ = actualProto;
            }
            this.name = "ZodError";
            this.issues = issues;
        }
        get errors() {
            return this.issues;
        }
        format(_mapper) {
            const mapper = _mapper ||
                function (issue) {
                    return issue.message;
                };
            const fieldErrors = { _errors: [] };
            const processError = (error) => {
                for (const issue of error.issues) {
                    if (issue.code === "invalid_union") {
                        issue.unionErrors.map(processError);
                    }
                    else if (issue.code === "invalid_return_type") {
                        processError(issue.returnTypeError);
                    }
                    else if (issue.code === "invalid_arguments") {
                        processError(issue.argumentsError);
                    }
                    else if (issue.path.length === 0) {
                        fieldErrors._errors.push(mapper(issue));
                    }
                    else {
                        let curr = fieldErrors;
                        let i = 0;
                        while (i < issue.path.length) {
                            const el = issue.path[i];
                            const terminal = i === issue.path.length - 1;
                            if (!terminal) {
                                curr[el] = curr[el] || { _errors: [] };
                                // if (typeof el === "string") {
                                //   curr[el] = curr[el] || { _errors: [] };
                                // } else if (typeof el === "number") {
                                //   const errorArray: any = [];
                                //   errorArray._errors = [];
                                //   curr[el] = curr[el] || errorArray;
                                // }
                            }
                            else {
                                curr[el] = curr[el] || { _errors: [] };
                                curr[el]._errors.push(mapper(issue));
                            }
                            curr = curr[el];
                            i++;
                        }
                    }
                }
            };
            processError(this);
            return fieldErrors;
        }
        toString() {
            return this.message;
        }
        get message() {
            return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
        }
        get isEmpty() {
            return this.issues.length === 0;
        }
        flatten(mapper = (issue) => issue.message) {
            const fieldErrors = {};
            const formErrors = [];
            for (const sub of this.issues) {
                if (sub.path.length > 0) {
                    fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                    fieldErrors[sub.path[0]].push(mapper(sub));
                }
                else {
                    formErrors.push(mapper(sub));
                }
            }
            return { formErrors, fieldErrors };
        }
        get formErrors() {
            return this.flatten();
        }
    }
    ZodError.create = (issues) => {
        const error = new ZodError(issues);
        return error;
    };

    const errorMap = (issue, _ctx) => {
        let message;
        switch (issue.code) {
            case ZodIssueCode.invalid_type:
                if (issue.received === ZodParsedType.undefined) {
                    message = "Required";
                }
                else {
                    message = `Expected ${issue.expected}, received ${issue.received}`;
                }
                break;
            case ZodIssueCode.invalid_literal:
                message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
                break;
            case ZodIssueCode.unrecognized_keys:
                message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
                break;
            case ZodIssueCode.invalid_union:
                message = `Invalid input`;
                break;
            case ZodIssueCode.invalid_union_discriminator:
                message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
                break;
            case ZodIssueCode.invalid_enum_value:
                message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
                break;
            case ZodIssueCode.invalid_arguments:
                message = `Invalid function arguments`;
                break;
            case ZodIssueCode.invalid_return_type:
                message = `Invalid function return type`;
                break;
            case ZodIssueCode.invalid_date:
                message = `Invalid date`;
                break;
            case ZodIssueCode.invalid_string:
                if (typeof issue.validation === "object") {
                    if ("includes" in issue.validation) {
                        message = `Invalid input: must include "${issue.validation.includes}"`;
                        if (typeof issue.validation.position === "number") {
                            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                        }
                    }
                    else if ("startsWith" in issue.validation) {
                        message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                    }
                    else if ("endsWith" in issue.validation) {
                        message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                    }
                    else {
                        util.assertNever(issue.validation);
                    }
                }
                else if (issue.validation !== "regex") {
                    message = `Invalid ${issue.validation}`;
                }
                else {
                    message = "Invalid";
                }
                break;
            case ZodIssueCode.too_small:
                if (issue.type === "array")
                    message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
                else if (issue.type === "string")
                    message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
                else if (issue.type === "number")
                    message = `Number must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${issue.minimum}`;
                else if (issue.type === "date")
                    message = `Date must be ${issue.exact
                    ? `exactly equal to `
                    : issue.inclusive
                        ? `greater than or equal to `
                        : `greater than `}${new Date(Number(issue.minimum))}`;
                else
                    message = "Invalid input";
                break;
            case ZodIssueCode.too_big:
                if (issue.type === "array")
                    message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
                else if (issue.type === "string")
                    message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
                else if (issue.type === "number")
                    message = `Number must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
                else if (issue.type === "bigint")
                    message = `BigInt must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `less than or equal to`
                        : `less than`} ${issue.maximum}`;
                else if (issue.type === "date")
                    message = `Date must be ${issue.exact
                    ? `exactly`
                    : issue.inclusive
                        ? `smaller than or equal to`
                        : `smaller than`} ${new Date(Number(issue.maximum))}`;
                else
                    message = "Invalid input";
                break;
            case ZodIssueCode.custom:
                message = `Invalid input`;
                break;
            case ZodIssueCode.invalid_intersection_types:
                message = `Intersection results could not be merged`;
                break;
            case ZodIssueCode.not_multiple_of:
                message = `Number must be a multiple of ${issue.multipleOf}`;
                break;
            case ZodIssueCode.not_finite:
                message = "Number must be finite";
                break;
            default:
                message = _ctx.defaultError;
                util.assertNever(issue);
        }
        return { message };
    };

    let overrideErrorMap = errorMap;
    function setErrorMap(map) {
        overrideErrorMap = map;
    }
    function getErrorMap() {
        return overrideErrorMap;
    }

    const makeIssue = (params) => {
        const { data, path, errorMaps, issueData } = params;
        const fullPath = [...path, ...(issueData.path || [])];
        const fullIssue = {
            ...issueData,
            path: fullPath,
        };
        let errorMessage = "";
        const maps = errorMaps
            .filter((m) => !!m)
            .slice()
            .reverse();
        for (const map of maps) {
            errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
        }
        return {
            ...issueData,
            path: fullPath,
            message: issueData.message || errorMessage,
        };
    };
    const EMPTY_PATH = [];
    function addIssueToContext(ctx, issueData) {
        const issue = makeIssue({
            issueData: issueData,
            data: ctx.data,
            path: ctx.path,
            errorMaps: [
                ctx.common.contextualErrorMap,
                ctx.schemaErrorMap,
                getErrorMap(),
                errorMap, // then global default map
            ].filter((x) => !!x),
        });
        ctx.common.issues.push(issue);
    }
    class ParseStatus {
        constructor() {
            this.value = "valid";
        }
        dirty() {
            if (this.value === "valid")
                this.value = "dirty";
        }
        abort() {
            if (this.value !== "aborted")
                this.value = "aborted";
        }
        static mergeArray(status, results) {
            const arrayValue = [];
            for (const s of results) {
                if (s.status === "aborted")
                    return INVALID;
                if (s.status === "dirty")
                    status.dirty();
                arrayValue.push(s.value);
            }
            return { status: status.value, value: arrayValue };
        }
        static async mergeObjectAsync(status, pairs) {
            const syncPairs = [];
            for (const pair of pairs) {
                syncPairs.push({
                    key: await pair.key,
                    value: await pair.value,
                });
            }
            return ParseStatus.mergeObjectSync(status, syncPairs);
        }
        static mergeObjectSync(status, pairs) {
            const finalObject = {};
            for (const pair of pairs) {
                const { key, value } = pair;
                if (key.status === "aborted")
                    return INVALID;
                if (value.status === "aborted")
                    return INVALID;
                if (key.status === "dirty")
                    status.dirty();
                if (value.status === "dirty")
                    status.dirty();
                if (key.value !== "__proto__" &&
                    (typeof value.value !== "undefined" || pair.alwaysSet)) {
                    finalObject[key.value] = value.value;
                }
            }
            return { status: status.value, value: finalObject };
        }
    }
    const INVALID = Object.freeze({
        status: "aborted",
    });
    const DIRTY = (value) => ({ status: "dirty", value });
    const OK = (value) => ({ status: "valid", value });
    const isAborted = (x) => x.status === "aborted";
    const isDirty = (x) => x.status === "dirty";
    const isValid = (x) => x.status === "valid";
    const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

    var errorUtil;
    (function (errorUtil) {
        errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
        errorUtil.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
    })(errorUtil || (errorUtil = {}));

    class ParseInputLazyPath {
        constructor(parent, value, path, key) {
            this._cachedPath = [];
            this.parent = parent;
            this.data = value;
            this._path = path;
            this._key = key;
        }
        get path() {
            if (!this._cachedPath.length) {
                if (this._key instanceof Array) {
                    this._cachedPath.push(...this._path, ...this._key);
                }
                else {
                    this._cachedPath.push(...this._path, this._key);
                }
            }
            return this._cachedPath;
        }
    }
    const handleResult = (ctx, result) => {
        if (isValid(result)) {
            return { success: true, data: result.value };
        }
        else {
            if (!ctx.common.issues.length) {
                throw new Error("Validation failed but no issues detected.");
            }
            return {
                success: false,
                get error() {
                    if (this._error)
                        return this._error;
                    const error = new ZodError(ctx.common.issues);
                    this._error = error;
                    return this._error;
                },
            };
        }
    };
    function processCreateParams(params) {
        if (!params)
            return {};
        const { errorMap, invalid_type_error, required_error, description } = params;
        if (errorMap && (invalid_type_error || required_error)) {
            throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
        }
        if (errorMap)
            return { errorMap: errorMap, description };
        const customMap = (iss, ctx) => {
            if (iss.code !== "invalid_type")
                return { message: ctx.defaultError };
            if (typeof ctx.data === "undefined") {
                return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
            }
            return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
        };
        return { errorMap: customMap, description };
    }
    class ZodType {
        constructor(def) {
            /** Alias of safeParseAsync */
            this.spa = this.safeParseAsync;
            this._def = def;
            this.parse = this.parse.bind(this);
            this.safeParse = this.safeParse.bind(this);
            this.parseAsync = this.parseAsync.bind(this);
            this.safeParseAsync = this.safeParseAsync.bind(this);
            this.spa = this.spa.bind(this);
            this.refine = this.refine.bind(this);
            this.refinement = this.refinement.bind(this);
            this.superRefine = this.superRefine.bind(this);
            this.optional = this.optional.bind(this);
            this.nullable = this.nullable.bind(this);
            this.nullish = this.nullish.bind(this);
            this.array = this.array.bind(this);
            this.promise = this.promise.bind(this);
            this.or = this.or.bind(this);
            this.and = this.and.bind(this);
            this.transform = this.transform.bind(this);
            this.brand = this.brand.bind(this);
            this.default = this.default.bind(this);
            this.catch = this.catch.bind(this);
            this.describe = this.describe.bind(this);
            this.pipe = this.pipe.bind(this);
            this.readonly = this.readonly.bind(this);
            this.isNullable = this.isNullable.bind(this);
            this.isOptional = this.isOptional.bind(this);
        }
        get description() {
            return this._def.description;
        }
        _getType(input) {
            return getParsedType(input.data);
        }
        _getOrReturnCtx(input, ctx) {
            return (ctx || {
                common: input.parent.common,
                data: input.data,
                parsedType: getParsedType(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            });
        }
        _processInputParams(input) {
            return {
                status: new ParseStatus(),
                ctx: {
                    common: input.parent.common,
                    data: input.data,
                    parsedType: getParsedType(input.data),
                    schemaErrorMap: this._def.errorMap,
                    path: input.path,
                    parent: input.parent,
                },
            };
        }
        _parseSync(input) {
            const result = this._parse(input);
            if (isAsync(result)) {
                throw new Error("Synchronous parse encountered promise.");
            }
            return result;
        }
        _parseAsync(input) {
            const result = this._parse(input);
            return Promise.resolve(result);
        }
        parse(data, params) {
            const result = this.safeParse(data, params);
            if (result.success)
                return result.data;
            throw result.error;
        }
        safeParse(data, params) {
            var _a;
            const ctx = {
                common: {
                    issues: [],
                    async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
                    contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                },
                path: (params === null || params === void 0 ? void 0 : params.path) || [],
                schemaErrorMap: this._def.errorMap,
                parent: null,
                data,
                parsedType: getParsedType(data),
            };
            const result = this._parseSync({ data, path: ctx.path, parent: ctx });
            return handleResult(ctx, result);
        }
        async parseAsync(data, params) {
            const result = await this.safeParseAsync(data, params);
            if (result.success)
                return result.data;
            throw result.error;
        }
        async safeParseAsync(data, params) {
            const ctx = {
                common: {
                    issues: [],
                    contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
                    async: true,
                },
                path: (params === null || params === void 0 ? void 0 : params.path) || [],
                schemaErrorMap: this._def.errorMap,
                parent: null,
                data,
                parsedType: getParsedType(data),
            };
            const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
            const result = await (isAsync(maybeAsyncResult)
                ? maybeAsyncResult
                : Promise.resolve(maybeAsyncResult));
            return handleResult(ctx, result);
        }
        refine(check, message) {
            const getIssueProperties = (val) => {
                if (typeof message === "string" || typeof message === "undefined") {
                    return { message };
                }
                else if (typeof message === "function") {
                    return message(val);
                }
                else {
                    return message;
                }
            };
            return this._refinement((val, ctx) => {
                const result = check(val);
                const setError = () => ctx.addIssue({
                    code: ZodIssueCode.custom,
                    ...getIssueProperties(val),
                });
                if (typeof Promise !== "undefined" && result instanceof Promise) {
                    return result.then((data) => {
                        if (!data) {
                            setError();
                            return false;
                        }
                        else {
                            return true;
                        }
                    });
                }
                if (!result) {
                    setError();
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        refinement(check, refinementData) {
            return this._refinement((val, ctx) => {
                if (!check(val)) {
                    ctx.addIssue(typeof refinementData === "function"
                        ? refinementData(val, ctx)
                        : refinementData);
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        _refinement(refinement) {
            return new ZodEffects({
                schema: this,
                typeName: ZodFirstPartyTypeKind.ZodEffects,
                effect: { type: "refinement", refinement },
            });
        }
        superRefine(refinement) {
            return this._refinement(refinement);
        }
        optional() {
            return ZodOptional.create(this, this._def);
        }
        nullable() {
            return ZodNullable.create(this, this._def);
        }
        nullish() {
            return this.nullable().optional();
        }
        array() {
            return ZodArray.create(this, this._def);
        }
        promise() {
            return ZodPromise.create(this, this._def);
        }
        or(option) {
            return ZodUnion.create([this, option], this._def);
        }
        and(incoming) {
            return ZodIntersection.create(this, incoming, this._def);
        }
        transform(transform) {
            return new ZodEffects({
                ...processCreateParams(this._def),
                schema: this,
                typeName: ZodFirstPartyTypeKind.ZodEffects,
                effect: { type: "transform", transform },
            });
        }
        default(def) {
            const defaultValueFunc = typeof def === "function" ? def : () => def;
            return new ZodDefault({
                ...processCreateParams(this._def),
                innerType: this,
                defaultValue: defaultValueFunc,
                typeName: ZodFirstPartyTypeKind.ZodDefault,
            });
        }
        brand() {
            return new ZodBranded({
                typeName: ZodFirstPartyTypeKind.ZodBranded,
                type: this,
                ...processCreateParams(this._def),
            });
        }
        catch(def) {
            const catchValueFunc = typeof def === "function" ? def : () => def;
            return new ZodCatch({
                ...processCreateParams(this._def),
                innerType: this,
                catchValue: catchValueFunc,
                typeName: ZodFirstPartyTypeKind.ZodCatch,
            });
        }
        describe(description) {
            const This = this.constructor;
            return new This({
                ...this._def,
                description,
            });
        }
        pipe(target) {
            return ZodPipeline.create(this, target);
        }
        readonly() {
            return ZodReadonly.create(this);
        }
        isOptional() {
            return this.safeParse(undefined).success;
        }
        isNullable() {
            return this.safeParse(null).success;
        }
    }
    const cuidRegex = /^c[^\s-]{8,}$/i;
    const cuid2Regex = /^[a-z][a-z0-9]*$/;
    const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
    // const uuidRegex =
    //   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
    const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    // from https://stackoverflow.com/a/46181/1550155
    // old version: too slow, didn't support unicode
    // const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    //old email regex
    // const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
    // eslint-disable-next-line
    // const emailRegex =
    //   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
    // const emailRegex =
    //   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    // const emailRegex =
    //   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
    const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    // const emailRegex =
    //   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
    // from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
    const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    let emojiRegex;
    const ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
    const ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
    // Adapted from https://stackoverflow.com/a/3143231
    const datetimeRegex = (args) => {
        if (args.precision) {
            if (args.offset) {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
            }
            else {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
            }
        }
        else if (args.precision === 0) {
            if (args.offset) {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
            }
            else {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
            }
        }
        else {
            if (args.offset) {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
            }
            else {
                return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
            }
        }
    };
    function isValidIP(ip, version) {
        if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
            return true;
        }
        if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
            return true;
        }
        return false;
    }
    class ZodString extends ZodType {
        _parse(input) {
            if (this._def.coerce) {
                input.data = String(input.data);
            }
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.string) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.string,
                    received: ctx.parsedType,
                }
                //
                );
                return INVALID;
            }
            const status = new ParseStatus();
            let ctx = undefined;
            for (const check of this._def.checks) {
                if (check.kind === "min") {
                    if (input.data.length < check.value) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: false,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    if (input.data.length > check.value) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: false,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "length") {
                    const tooBig = input.data.length > check.value;
                    const tooSmall = input.data.length < check.value;
                    if (tooBig || tooSmall) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        if (tooBig) {
                            addIssueToContext(ctx, {
                                code: ZodIssueCode.too_big,
                                maximum: check.value,
                                type: "string",
                                inclusive: true,
                                exact: true,
                                message: check.message,
                            });
                        }
                        else if (tooSmall) {
                            addIssueToContext(ctx, {
                                code: ZodIssueCode.too_small,
                                minimum: check.value,
                                type: "string",
                                inclusive: true,
                                exact: true,
                                message: check.message,
                            });
                        }
                        status.dirty();
                    }
                }
                else if (check.kind === "email") {
                    if (!emailRegex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "email",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "emoji") {
                    if (!emojiRegex) {
                        emojiRegex = new RegExp(_emojiRegex, "u");
                    }
                    if (!emojiRegex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "emoji",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "uuid") {
                    if (!uuidRegex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "uuid",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "cuid") {
                    if (!cuidRegex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "cuid",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "cuid2") {
                    if (!cuid2Regex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "cuid2",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "ulid") {
                    if (!ulidRegex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "ulid",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "url") {
                    try {
                        new URL(input.data);
                    }
                    catch (_a) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "url",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "regex") {
                    check.regex.lastIndex = 0;
                    const testResult = check.regex.test(input.data);
                    if (!testResult) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "regex",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "trim") {
                    input.data = input.data.trim();
                }
                else if (check.kind === "includes") {
                    if (!input.data.includes(check.value, check.position)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.invalid_string,
                            validation: { includes: check.value, position: check.position },
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "toLowerCase") {
                    input.data = input.data.toLowerCase();
                }
                else if (check.kind === "toUpperCase") {
                    input.data = input.data.toUpperCase();
                }
                else if (check.kind === "startsWith") {
                    if (!input.data.startsWith(check.value)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.invalid_string,
                            validation: { startsWith: check.value },
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "endsWith") {
                    if (!input.data.endsWith(check.value)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.invalid_string,
                            validation: { endsWith: check.value },
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "datetime") {
                    const regex = datetimeRegex(check);
                    if (!regex.test(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.invalid_string,
                            validation: "datetime",
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "ip") {
                    if (!isValidIP(input.data, check.version)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            validation: "ip",
                            code: ZodIssueCode.invalid_string,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else {
                    util.assertNever(check);
                }
            }
            return { status: status.value, value: input.data };
        }
        _regex(regex, validation, message) {
            return this.refinement((data) => regex.test(data), {
                validation,
                code: ZodIssueCode.invalid_string,
                ...errorUtil.errToObj(message),
            });
        }
        _addCheck(check) {
            return new ZodString({
                ...this._def,
                checks: [...this._def.checks, check],
            });
        }
        email(message) {
            return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
        }
        url(message) {
            return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
        }
        emoji(message) {
            return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
        }
        uuid(message) {
            return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
        }
        cuid(message) {
            return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
        }
        cuid2(message) {
            return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
        }
        ulid(message) {
            return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
        }
        ip(options) {
            return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
        }
        datetime(options) {
            var _a;
            if (typeof options === "string") {
                return this._addCheck({
                    kind: "datetime",
                    precision: null,
                    offset: false,
                    message: options,
                });
            }
            return this._addCheck({
                kind: "datetime",
                precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
                offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
                ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
            });
        }
        regex(regex, message) {
            return this._addCheck({
                kind: "regex",
                regex: regex,
                ...errorUtil.errToObj(message),
            });
        }
        includes(value, options) {
            return this._addCheck({
                kind: "includes",
                value: value,
                position: options === null || options === void 0 ? void 0 : options.position,
                ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message),
            });
        }
        startsWith(value, message) {
            return this._addCheck({
                kind: "startsWith",
                value: value,
                ...errorUtil.errToObj(message),
            });
        }
        endsWith(value, message) {
            return this._addCheck({
                kind: "endsWith",
                value: value,
                ...errorUtil.errToObj(message),
            });
        }
        min(minLength, message) {
            return this._addCheck({
                kind: "min",
                value: minLength,
                ...errorUtil.errToObj(message),
            });
        }
        max(maxLength, message) {
            return this._addCheck({
                kind: "max",
                value: maxLength,
                ...errorUtil.errToObj(message),
            });
        }
        length(len, message) {
            return this._addCheck({
                kind: "length",
                value: len,
                ...errorUtil.errToObj(message),
            });
        }
        /**
         * @deprecated Use z.string().min(1) instead.
         * @see {@link ZodString.min}
         */
        nonempty(message) {
            return this.min(1, errorUtil.errToObj(message));
        }
        trim() {
            return new ZodString({
                ...this._def,
                checks: [...this._def.checks, { kind: "trim" }],
            });
        }
        toLowerCase() {
            return new ZodString({
                ...this._def,
                checks: [...this._def.checks, { kind: "toLowerCase" }],
            });
        }
        toUpperCase() {
            return new ZodString({
                ...this._def,
                checks: [...this._def.checks, { kind: "toUpperCase" }],
            });
        }
        get isDatetime() {
            return !!this._def.checks.find((ch) => ch.kind === "datetime");
        }
        get isEmail() {
            return !!this._def.checks.find((ch) => ch.kind === "email");
        }
        get isURL() {
            return !!this._def.checks.find((ch) => ch.kind === "url");
        }
        get isEmoji() {
            return !!this._def.checks.find((ch) => ch.kind === "emoji");
        }
        get isUUID() {
            return !!this._def.checks.find((ch) => ch.kind === "uuid");
        }
        get isCUID() {
            return !!this._def.checks.find((ch) => ch.kind === "cuid");
        }
        get isCUID2() {
            return !!this._def.checks.find((ch) => ch.kind === "cuid2");
        }
        get isULID() {
            return !!this._def.checks.find((ch) => ch.kind === "ulid");
        }
        get isIP() {
            return !!this._def.checks.find((ch) => ch.kind === "ip");
        }
        get minLength() {
            let min = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "min") {
                    if (min === null || ch.value > min)
                        min = ch.value;
                }
            }
            return min;
        }
        get maxLength() {
            let max = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "max") {
                    if (max === null || ch.value < max)
                        max = ch.value;
                }
            }
            return max;
        }
    }
    ZodString.create = (params) => {
        var _a;
        return new ZodString({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodString,
            coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
            ...processCreateParams(params),
        });
    };
    // https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
    function floatSafeRemainder(val, step) {
        const valDecCount = (val.toString().split(".")[1] || "").length;
        const stepDecCount = (step.toString().split(".")[1] || "").length;
        const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
        const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
        const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
        return (valInt % stepInt) / Math.pow(10, decCount);
    }
    class ZodNumber extends ZodType {
        constructor() {
            super(...arguments);
            this.min = this.gte;
            this.max = this.lte;
            this.step = this.multipleOf;
        }
        _parse(input) {
            if (this._def.coerce) {
                input.data = Number(input.data);
            }
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.number) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.number,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            let ctx = undefined;
            const status = new ParseStatus();
            for (const check of this._def.checks) {
                if (check.kind === "int") {
                    if (!util.isInteger(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.invalid_type,
                            expected: "integer",
                            received: "float",
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "min") {
                    const tooSmall = check.inclusive
                        ? input.data < check.value
                        : input.data <= check.value;
                    if (tooSmall) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            minimum: check.value,
                            type: "number",
                            inclusive: check.inclusive,
                            exact: false,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    const tooBig = check.inclusive
                        ? input.data > check.value
                        : input.data >= check.value;
                    if (tooBig) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            maximum: check.value,
                            type: "number",
                            inclusive: check.inclusive,
                            exact: false,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "multipleOf") {
                    if (floatSafeRemainder(input.data, check.value) !== 0) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.not_multiple_of,
                            multipleOf: check.value,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "finite") {
                    if (!Number.isFinite(input.data)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.not_finite,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else {
                    util.assertNever(check);
                }
            }
            return { status: status.value, value: input.data };
        }
        gte(value, message) {
            return this.setLimit("min", value, true, errorUtil.toString(message));
        }
        gt(value, message) {
            return this.setLimit("min", value, false, errorUtil.toString(message));
        }
        lte(value, message) {
            return this.setLimit("max", value, true, errorUtil.toString(message));
        }
        lt(value, message) {
            return this.setLimit("max", value, false, errorUtil.toString(message));
        }
        setLimit(kind, value, inclusive, message) {
            return new ZodNumber({
                ...this._def,
                checks: [
                    ...this._def.checks,
                    {
                        kind,
                        value,
                        inclusive,
                        message: errorUtil.toString(message),
                    },
                ],
            });
        }
        _addCheck(check) {
            return new ZodNumber({
                ...this._def,
                checks: [...this._def.checks, check],
            });
        }
        int(message) {
            return this._addCheck({
                kind: "int",
                message: errorUtil.toString(message),
            });
        }
        positive(message) {
            return this._addCheck({
                kind: "min",
                value: 0,
                inclusive: false,
                message: errorUtil.toString(message),
            });
        }
        negative(message) {
            return this._addCheck({
                kind: "max",
                value: 0,
                inclusive: false,
                message: errorUtil.toString(message),
            });
        }
        nonpositive(message) {
            return this._addCheck({
                kind: "max",
                value: 0,
                inclusive: true,
                message: errorUtil.toString(message),
            });
        }
        nonnegative(message) {
            return this._addCheck({
                kind: "min",
                value: 0,
                inclusive: true,
                message: errorUtil.toString(message),
            });
        }
        multipleOf(value, message) {
            return this._addCheck({
                kind: "multipleOf",
                value: value,
                message: errorUtil.toString(message),
            });
        }
        finite(message) {
            return this._addCheck({
                kind: "finite",
                message: errorUtil.toString(message),
            });
        }
        safe(message) {
            return this._addCheck({
                kind: "min",
                inclusive: true,
                value: Number.MIN_SAFE_INTEGER,
                message: errorUtil.toString(message),
            })._addCheck({
                kind: "max",
                inclusive: true,
                value: Number.MAX_SAFE_INTEGER,
                message: errorUtil.toString(message),
            });
        }
        get minValue() {
            let min = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "min") {
                    if (min === null || ch.value > min)
                        min = ch.value;
                }
            }
            return min;
        }
        get maxValue() {
            let max = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "max") {
                    if (max === null || ch.value < max)
                        max = ch.value;
                }
            }
            return max;
        }
        get isInt() {
            return !!this._def.checks.find((ch) => ch.kind === "int" ||
                (ch.kind === "multipleOf" && util.isInteger(ch.value)));
        }
        get isFinite() {
            let max = null, min = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "finite" ||
                    ch.kind === "int" ||
                    ch.kind === "multipleOf") {
                    return true;
                }
                else if (ch.kind === "min") {
                    if (min === null || ch.value > min)
                        min = ch.value;
                }
                else if (ch.kind === "max") {
                    if (max === null || ch.value < max)
                        max = ch.value;
                }
            }
            return Number.isFinite(min) && Number.isFinite(max);
        }
    }
    ZodNumber.create = (params) => {
        return new ZodNumber({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodNumber,
            coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
            ...processCreateParams(params),
        });
    };
    class ZodBigInt extends ZodType {
        constructor() {
            super(...arguments);
            this.min = this.gte;
            this.max = this.lte;
        }
        _parse(input) {
            if (this._def.coerce) {
                input.data = BigInt(input.data);
            }
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.bigint) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.bigint,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            let ctx = undefined;
            const status = new ParseStatus();
            for (const check of this._def.checks) {
                if (check.kind === "min") {
                    const tooSmall = check.inclusive
                        ? input.data < check.value
                        : input.data <= check.value;
                    if (tooSmall) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            type: "bigint",
                            minimum: check.value,
                            inclusive: check.inclusive,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    const tooBig = check.inclusive
                        ? input.data > check.value
                        : input.data >= check.value;
                    if (tooBig) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            type: "bigint",
                            maximum: check.value,
                            inclusive: check.inclusive,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "multipleOf") {
                    if (input.data % check.value !== BigInt(0)) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.not_multiple_of,
                            multipleOf: check.value,
                            message: check.message,
                        });
                        status.dirty();
                    }
                }
                else {
                    util.assertNever(check);
                }
            }
            return { status: status.value, value: input.data };
        }
        gte(value, message) {
            return this.setLimit("min", value, true, errorUtil.toString(message));
        }
        gt(value, message) {
            return this.setLimit("min", value, false, errorUtil.toString(message));
        }
        lte(value, message) {
            return this.setLimit("max", value, true, errorUtil.toString(message));
        }
        lt(value, message) {
            return this.setLimit("max", value, false, errorUtil.toString(message));
        }
        setLimit(kind, value, inclusive, message) {
            return new ZodBigInt({
                ...this._def,
                checks: [
                    ...this._def.checks,
                    {
                        kind,
                        value,
                        inclusive,
                        message: errorUtil.toString(message),
                    },
                ],
            });
        }
        _addCheck(check) {
            return new ZodBigInt({
                ...this._def,
                checks: [...this._def.checks, check],
            });
        }
        positive(message) {
            return this._addCheck({
                kind: "min",
                value: BigInt(0),
                inclusive: false,
                message: errorUtil.toString(message),
            });
        }
        negative(message) {
            return this._addCheck({
                kind: "max",
                value: BigInt(0),
                inclusive: false,
                message: errorUtil.toString(message),
            });
        }
        nonpositive(message) {
            return this._addCheck({
                kind: "max",
                value: BigInt(0),
                inclusive: true,
                message: errorUtil.toString(message),
            });
        }
        nonnegative(message) {
            return this._addCheck({
                kind: "min",
                value: BigInt(0),
                inclusive: true,
                message: errorUtil.toString(message),
            });
        }
        multipleOf(value, message) {
            return this._addCheck({
                kind: "multipleOf",
                value,
                message: errorUtil.toString(message),
            });
        }
        get minValue() {
            let min = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "min") {
                    if (min === null || ch.value > min)
                        min = ch.value;
                }
            }
            return min;
        }
        get maxValue() {
            let max = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "max") {
                    if (max === null || ch.value < max)
                        max = ch.value;
                }
            }
            return max;
        }
    }
    ZodBigInt.create = (params) => {
        var _a;
        return new ZodBigInt({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodBigInt,
            coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
            ...processCreateParams(params),
        });
    };
    class ZodBoolean extends ZodType {
        _parse(input) {
            if (this._def.coerce) {
                input.data = Boolean(input.data);
            }
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.boolean) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.boolean,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return OK(input.data);
        }
    }
    ZodBoolean.create = (params) => {
        return new ZodBoolean({
            typeName: ZodFirstPartyTypeKind.ZodBoolean,
            coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
            ...processCreateParams(params),
        });
    };
    class ZodDate extends ZodType {
        _parse(input) {
            if (this._def.coerce) {
                input.data = new Date(input.data);
            }
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.date) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.date,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            if (isNaN(input.data.getTime())) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_date,
                });
                return INVALID;
            }
            const status = new ParseStatus();
            let ctx = undefined;
            for (const check of this._def.checks) {
                if (check.kind === "min") {
                    if (input.data.getTime() < check.value) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_small,
                            message: check.message,
                            inclusive: true,
                            exact: false,
                            minimum: check.value,
                            type: "date",
                        });
                        status.dirty();
                    }
                }
                else if (check.kind === "max") {
                    if (input.data.getTime() > check.value) {
                        ctx = this._getOrReturnCtx(input, ctx);
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.too_big,
                            message: check.message,
                            inclusive: true,
                            exact: false,
                            maximum: check.value,
                            type: "date",
                        });
                        status.dirty();
                    }
                }
                else {
                    util.assertNever(check);
                }
            }
            return {
                status: status.value,
                value: new Date(input.data.getTime()),
            };
        }
        _addCheck(check) {
            return new ZodDate({
                ...this._def,
                checks: [...this._def.checks, check],
            });
        }
        min(minDate, message) {
            return this._addCheck({
                kind: "min",
                value: minDate.getTime(),
                message: errorUtil.toString(message),
            });
        }
        max(maxDate, message) {
            return this._addCheck({
                kind: "max",
                value: maxDate.getTime(),
                message: errorUtil.toString(message),
            });
        }
        get minDate() {
            let min = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "min") {
                    if (min === null || ch.value > min)
                        min = ch.value;
                }
            }
            return min != null ? new Date(min) : null;
        }
        get maxDate() {
            let max = null;
            for (const ch of this._def.checks) {
                if (ch.kind === "max") {
                    if (max === null || ch.value < max)
                        max = ch.value;
                }
            }
            return max != null ? new Date(max) : null;
        }
    }
    ZodDate.create = (params) => {
        return new ZodDate({
            checks: [],
            coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
            typeName: ZodFirstPartyTypeKind.ZodDate,
            ...processCreateParams(params),
        });
    };
    class ZodSymbol extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.symbol) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.symbol,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return OK(input.data);
        }
    }
    ZodSymbol.create = (params) => {
        return new ZodSymbol({
            typeName: ZodFirstPartyTypeKind.ZodSymbol,
            ...processCreateParams(params),
        });
    };
    class ZodUndefined extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.undefined) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.undefined,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return OK(input.data);
        }
    }
    ZodUndefined.create = (params) => {
        return new ZodUndefined({
            typeName: ZodFirstPartyTypeKind.ZodUndefined,
            ...processCreateParams(params),
        });
    };
    class ZodNull extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.null) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.null,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return OK(input.data);
        }
    }
    ZodNull.create = (params) => {
        return new ZodNull({
            typeName: ZodFirstPartyTypeKind.ZodNull,
            ...processCreateParams(params),
        });
    };
    class ZodAny extends ZodType {
        constructor() {
            super(...arguments);
            // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
            this._any = true;
        }
        _parse(input) {
            return OK(input.data);
        }
    }
    ZodAny.create = (params) => {
        return new ZodAny({
            typeName: ZodFirstPartyTypeKind.ZodAny,
            ...processCreateParams(params),
        });
    };
    class ZodUnknown extends ZodType {
        constructor() {
            super(...arguments);
            // required
            this._unknown = true;
        }
        _parse(input) {
            return OK(input.data);
        }
    }
    ZodUnknown.create = (params) => {
        return new ZodUnknown({
            typeName: ZodFirstPartyTypeKind.ZodUnknown,
            ...processCreateParams(params),
        });
    };
    class ZodNever extends ZodType {
        _parse(input) {
            const ctx = this._getOrReturnCtx(input);
            addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.never,
                received: ctx.parsedType,
            });
            return INVALID;
        }
    }
    ZodNever.create = (params) => {
        return new ZodNever({
            typeName: ZodFirstPartyTypeKind.ZodNever,
            ...processCreateParams(params),
        });
    };
    class ZodVoid extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.undefined) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.void,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return OK(input.data);
        }
    }
    ZodVoid.create = (params) => {
        return new ZodVoid({
            typeName: ZodFirstPartyTypeKind.ZodVoid,
            ...processCreateParams(params),
        });
    };
    class ZodArray extends ZodType {
        _parse(input) {
            const { ctx, status } = this._processInputParams(input);
            const def = this._def;
            if (ctx.parsedType !== ZodParsedType.array) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.array,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            if (def.exactLength !== null) {
                const tooBig = ctx.data.length > def.exactLength.value;
                const tooSmall = ctx.data.length < def.exactLength.value;
                if (tooBig || tooSmall) {
                    addIssueToContext(ctx, {
                        code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
                        minimum: (tooSmall ? def.exactLength.value : undefined),
                        maximum: (tooBig ? def.exactLength.value : undefined),
                        type: "array",
                        inclusive: true,
                        exact: true,
                        message: def.exactLength.message,
                    });
                    status.dirty();
                }
            }
            if (def.minLength !== null) {
                if (ctx.data.length < def.minLength.value) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: def.minLength.value,
                        type: "array",
                        inclusive: true,
                        exact: false,
                        message: def.minLength.message,
                    });
                    status.dirty();
                }
            }
            if (def.maxLength !== null) {
                if (ctx.data.length > def.maxLength.value) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: def.maxLength.value,
                        type: "array",
                        inclusive: true,
                        exact: false,
                        message: def.maxLength.message,
                    });
                    status.dirty();
                }
            }
            if (ctx.common.async) {
                return Promise.all([...ctx.data].map((item, i) => {
                    return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
                })).then((result) => {
                    return ParseStatus.mergeArray(status, result);
                });
            }
            const result = [...ctx.data].map((item, i) => {
                return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            });
            return ParseStatus.mergeArray(status, result);
        }
        get element() {
            return this._def.type;
        }
        min(minLength, message) {
            return new ZodArray({
                ...this._def,
                minLength: { value: minLength, message: errorUtil.toString(message) },
            });
        }
        max(maxLength, message) {
            return new ZodArray({
                ...this._def,
                maxLength: { value: maxLength, message: errorUtil.toString(message) },
            });
        }
        length(len, message) {
            return new ZodArray({
                ...this._def,
                exactLength: { value: len, message: errorUtil.toString(message) },
            });
        }
        nonempty(message) {
            return this.min(1, message);
        }
    }
    ZodArray.create = (schema, params) => {
        return new ZodArray({
            type: schema,
            minLength: null,
            maxLength: null,
            exactLength: null,
            typeName: ZodFirstPartyTypeKind.ZodArray,
            ...processCreateParams(params),
        });
    };
    function deepPartialify(schema) {
        if (schema instanceof ZodObject) {
            const newShape = {};
            for (const key in schema.shape) {
                const fieldSchema = schema.shape[key];
                newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
            }
            return new ZodObject({
                ...schema._def,
                shape: () => newShape,
            });
        }
        else if (schema instanceof ZodArray) {
            return new ZodArray({
                ...schema._def,
                type: deepPartialify(schema.element),
            });
        }
        else if (schema instanceof ZodOptional) {
            return ZodOptional.create(deepPartialify(schema.unwrap()));
        }
        else if (schema instanceof ZodNullable) {
            return ZodNullable.create(deepPartialify(schema.unwrap()));
        }
        else if (schema instanceof ZodTuple) {
            return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
        }
        else {
            return schema;
        }
    }
    class ZodObject extends ZodType {
        constructor() {
            super(...arguments);
            this._cached = null;
            /**
             * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
             * If you want to pass through unknown properties, use `.passthrough()` instead.
             */
            this.nonstrict = this.passthrough;
            // extend<
            //   Augmentation extends ZodRawShape,
            //   NewOutput extends util.flatten<{
            //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
            //       ? Augmentation[k]["_output"]
            //       : k extends keyof Output
            //       ? Output[k]
            //       : never;
            //   }>,
            //   NewInput extends util.flatten<{
            //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
            //       ? Augmentation[k]["_input"]
            //       : k extends keyof Input
            //       ? Input[k]
            //       : never;
            //   }>
            // >(
            //   augmentation: Augmentation
            // ): ZodObject<
            //   extendShape<T, Augmentation>,
            //   UnknownKeys,
            //   Catchall,
            //   NewOutput,
            //   NewInput
            // > {
            //   return new ZodObject({
            //     ...this._def,
            //     shape: () => ({
            //       ...this._def.shape(),
            //       ...augmentation,
            //     }),
            //   }) as any;
            // }
            /**
             * @deprecated Use `.extend` instead
             *  */
            this.augment = this.extend;
        }
        _getCached() {
            if (this._cached !== null)
                return this._cached;
            const shape = this._def.shape();
            const keys = util.objectKeys(shape);
            return (this._cached = { shape, keys });
        }
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.object) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.object,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const { status, ctx } = this._processInputParams(input);
            const { shape, keys: shapeKeys } = this._getCached();
            const extraKeys = [];
            if (!(this._def.catchall instanceof ZodNever &&
                this._def.unknownKeys === "strip")) {
                for (const key in ctx.data) {
                    if (!shapeKeys.includes(key)) {
                        extraKeys.push(key);
                    }
                }
            }
            const pairs = [];
            for (const key of shapeKeys) {
                const keyValidator = shape[key];
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                    alwaysSet: key in ctx.data,
                });
            }
            if (this._def.catchall instanceof ZodNever) {
                const unknownKeys = this._def.unknownKeys;
                if (unknownKeys === "passthrough") {
                    for (const key of extraKeys) {
                        pairs.push({
                            key: { status: "valid", value: key },
                            value: { status: "valid", value: ctx.data[key] },
                        });
                    }
                }
                else if (unknownKeys === "strict") {
                    if (extraKeys.length > 0) {
                        addIssueToContext(ctx, {
                            code: ZodIssueCode.unrecognized_keys,
                            keys: extraKeys,
                        });
                        status.dirty();
                    }
                }
                else if (unknownKeys === "strip") ;
                else {
                    throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
                }
            }
            else {
                // run catchall validation
                const catchall = this._def.catchall;
                for (const key of extraKeys) {
                    const value = ctx.data[key];
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                        ),
                        alwaysSet: key in ctx.data,
                    });
                }
            }
            if (ctx.common.async) {
                return Promise.resolve()
                    .then(async () => {
                    const syncPairs = [];
                    for (const pair of pairs) {
                        const key = await pair.key;
                        syncPairs.push({
                            key,
                            value: await pair.value,
                            alwaysSet: pair.alwaysSet,
                        });
                    }
                    return syncPairs;
                })
                    .then((syncPairs) => {
                    return ParseStatus.mergeObjectSync(status, syncPairs);
                });
            }
            else {
                return ParseStatus.mergeObjectSync(status, pairs);
            }
        }
        get shape() {
            return this._def.shape();
        }
        strict(message) {
            errorUtil.errToObj;
            return new ZodObject({
                ...this._def,
                unknownKeys: "strict",
                ...(message !== undefined
                    ? {
                        errorMap: (issue, ctx) => {
                            var _a, _b, _c, _d;
                            const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
                            if (issue.code === "unrecognized_keys")
                                return {
                                    message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError,
                                };
                            return {
                                message: defaultError,
                            };
                        },
                    }
                    : {}),
            });
        }
        strip() {
            return new ZodObject({
                ...this._def,
                unknownKeys: "strip",
            });
        }
        passthrough() {
            return new ZodObject({
                ...this._def,
                unknownKeys: "passthrough",
            });
        }
        // const AugmentFactory =
        //   <Def extends ZodObjectDef>(def: Def) =>
        //   <Augmentation extends ZodRawShape>(
        //     augmentation: Augmentation
        //   ): ZodObject<
        //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
        //     Def["unknownKeys"],
        //     Def["catchall"]
        //   > => {
        //     return new ZodObject({
        //       ...def,
        //       shape: () => ({
        //         ...def.shape(),
        //         ...augmentation,
        //       }),
        //     }) as any;
        //   };
        extend(augmentation) {
            return new ZodObject({
                ...this._def,
                shape: () => ({
                    ...this._def.shape(),
                    ...augmentation,
                }),
            });
        }
        /**
         * Prior to zod@1.0.12 there was a bug in the
         * inferred type of merged objects. Please
         * upgrade if you are experiencing issues.
         */
        merge(merging) {
            const merged = new ZodObject({
                unknownKeys: merging._def.unknownKeys,
                catchall: merging._def.catchall,
                shape: () => ({
                    ...this._def.shape(),
                    ...merging._def.shape(),
                }),
                typeName: ZodFirstPartyTypeKind.ZodObject,
            });
            return merged;
        }
        // merge<
        //   Incoming extends AnyZodObject,
        //   Augmentation extends Incoming["shape"],
        //   NewOutput extends {
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   },
        //   NewInput extends {
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }
        // >(
        //   merging: Incoming
        // ): ZodObject<
        //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
        //   Incoming["_def"]["unknownKeys"],
        //   Incoming["_def"]["catchall"],
        //   NewOutput,
        //   NewInput
        // > {
        //   const merged: any = new ZodObject({
        //     unknownKeys: merging._def.unknownKeys,
        //     catchall: merging._def.catchall,
        //     shape: () =>
        //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        //     typeName: ZodFirstPartyTypeKind.ZodObject,
        //   }) as any;
        //   return merged;
        // }
        setKey(key, schema) {
            return this.augment({ [key]: schema });
        }
        // merge<Incoming extends AnyZodObject>(
        //   merging: Incoming
        // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
        // ZodObject<
        //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
        //   Incoming["_def"]["unknownKeys"],
        //   Incoming["_def"]["catchall"]
        // > {
        //   // const mergedShape = objectUtil.mergeShapes(
        //   //   this._def.shape(),
        //   //   merging._def.shape()
        //   // );
        //   const merged: any = new ZodObject({
        //     unknownKeys: merging._def.unknownKeys,
        //     catchall: merging._def.catchall,
        //     shape: () =>
        //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
        //     typeName: ZodFirstPartyTypeKind.ZodObject,
        //   }) as any;
        //   return merged;
        // }
        catchall(index) {
            return new ZodObject({
                ...this._def,
                catchall: index,
            });
        }
        pick(mask) {
            const shape = {};
            util.objectKeys(mask).forEach((key) => {
                if (mask[key] && this.shape[key]) {
                    shape[key] = this.shape[key];
                }
            });
            return new ZodObject({
                ...this._def,
                shape: () => shape,
            });
        }
        omit(mask) {
            const shape = {};
            util.objectKeys(this.shape).forEach((key) => {
                if (!mask[key]) {
                    shape[key] = this.shape[key];
                }
            });
            return new ZodObject({
                ...this._def,
                shape: () => shape,
            });
        }
        /**
         * @deprecated
         */
        deepPartial() {
            return deepPartialify(this);
        }
        partial(mask) {
            const newShape = {};
            util.objectKeys(this.shape).forEach((key) => {
                const fieldSchema = this.shape[key];
                if (mask && !mask[key]) {
                    newShape[key] = fieldSchema;
                }
                else {
                    newShape[key] = fieldSchema.optional();
                }
            });
            return new ZodObject({
                ...this._def,
                shape: () => newShape,
            });
        }
        required(mask) {
            const newShape = {};
            util.objectKeys(this.shape).forEach((key) => {
                if (mask && !mask[key]) {
                    newShape[key] = this.shape[key];
                }
                else {
                    const fieldSchema = this.shape[key];
                    let newField = fieldSchema;
                    while (newField instanceof ZodOptional) {
                        newField = newField._def.innerType;
                    }
                    newShape[key] = newField;
                }
            });
            return new ZodObject({
                ...this._def,
                shape: () => newShape,
            });
        }
        keyof() {
            return createZodEnum(util.objectKeys(this.shape));
        }
    }
    ZodObject.create = (shape, params) => {
        return new ZodObject({
            shape: () => shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params),
        });
    };
    ZodObject.strictCreate = (shape, params) => {
        return new ZodObject({
            shape: () => shape,
            unknownKeys: "strict",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params),
        });
    };
    ZodObject.lazycreate = (shape, params) => {
        return new ZodObject({
            shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params),
        });
    };
    class ZodUnion extends ZodType {
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            const options = this._def.options;
            function handleResults(results) {
                // return first issue-free validation if it exists
                for (const result of results) {
                    if (result.result.status === "valid") {
                        return result.result;
                    }
                }
                for (const result of results) {
                    if (result.result.status === "dirty") {
                        // add issues from dirty option
                        ctx.common.issues.push(...result.ctx.common.issues);
                        return result.result;
                    }
                }
                // return invalid
                const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_union,
                    unionErrors,
                });
                return INVALID;
            }
            if (ctx.common.async) {
                return Promise.all(options.map(async (option) => {
                    const childCtx = {
                        ...ctx,
                        common: {
                            ...ctx.common,
                            issues: [],
                        },
                        parent: null,
                    };
                    return {
                        result: await option._parseAsync({
                            data: ctx.data,
                            path: ctx.path,
                            parent: childCtx,
                        }),
                        ctx: childCtx,
                    };
                })).then(handleResults);
            }
            else {
                let dirty = undefined;
                const issues = [];
                for (const option of options) {
                    const childCtx = {
                        ...ctx,
                        common: {
                            ...ctx.common,
                            issues: [],
                        },
                        parent: null,
                    };
                    const result = option._parseSync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    });
                    if (result.status === "valid") {
                        return result;
                    }
                    else if (result.status === "dirty" && !dirty) {
                        dirty = { result, ctx: childCtx };
                    }
                    if (childCtx.common.issues.length) {
                        issues.push(childCtx.common.issues);
                    }
                }
                if (dirty) {
                    ctx.common.issues.push(...dirty.ctx.common.issues);
                    return dirty.result;
                }
                const unionErrors = issues.map((issues) => new ZodError(issues));
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_union,
                    unionErrors,
                });
                return INVALID;
            }
        }
        get options() {
            return this._def.options;
        }
    }
    ZodUnion.create = (types, params) => {
        return new ZodUnion({
            options: types,
            typeName: ZodFirstPartyTypeKind.ZodUnion,
            ...processCreateParams(params),
        });
    };
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    //////////                                 //////////
    //////////      ZodDiscriminatedUnion      //////////
    //////////                                 //////////
    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    const getDiscriminator = (type) => {
        if (type instanceof ZodLazy) {
            return getDiscriminator(type.schema);
        }
        else if (type instanceof ZodEffects) {
            return getDiscriminator(type.innerType());
        }
        else if (type instanceof ZodLiteral) {
            return [type.value];
        }
        else if (type instanceof ZodEnum) {
            return type.options;
        }
        else if (type instanceof ZodNativeEnum) {
            // eslint-disable-next-line ban/ban
            return Object.keys(type.enum);
        }
        else if (type instanceof ZodDefault) {
            return getDiscriminator(type._def.innerType);
        }
        else if (type instanceof ZodUndefined) {
            return [undefined];
        }
        else if (type instanceof ZodNull) {
            return [null];
        }
        else {
            return null;
        }
    };
    class ZodDiscriminatedUnion extends ZodType {
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.object) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.object,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const discriminator = this.discriminator;
            const discriminatorValue = ctx.data[discriminator];
            const option = this.optionsMap.get(discriminatorValue);
            if (!option) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_union_discriminator,
                    options: Array.from(this.optionsMap.keys()),
                    path: [discriminator],
                });
                return INVALID;
            }
            if (ctx.common.async) {
                return option._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
            }
            else {
                return option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
        get discriminator() {
            return this._def.discriminator;
        }
        get options() {
            return this._def.options;
        }
        get optionsMap() {
            return this._def.optionsMap;
        }
        /**
         * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
         * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
         * have a different value for each object in the union.
         * @param discriminator the name of the discriminator property
         * @param types an array of object schemas
         * @param params
         */
        static create(discriminator, options, params) {
            // Get all the valid discriminator values
            const optionsMap = new Map();
            // try {
            for (const type of options) {
                const discriminatorValues = getDiscriminator(type.shape[discriminator]);
                if (!discriminatorValues) {
                    throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
                }
                for (const value of discriminatorValues) {
                    if (optionsMap.has(value)) {
                        throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                    }
                    optionsMap.set(value, type);
                }
            }
            return new ZodDiscriminatedUnion({
                typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
                discriminator,
                options,
                optionsMap,
                ...processCreateParams(params),
            });
        }
    }
    function mergeValues(a, b) {
        const aType = getParsedType(a);
        const bType = getParsedType(b);
        if (a === b) {
            return { valid: true, data: a };
        }
        else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
            const bKeys = util.objectKeys(b);
            const sharedKeys = util
                .objectKeys(a)
                .filter((key) => bKeys.indexOf(key) !== -1);
            const newObj = { ...a, ...b };
            for (const key of sharedKeys) {
                const sharedValue = mergeValues(a[key], b[key]);
                if (!sharedValue.valid) {
                    return { valid: false };
                }
                newObj[key] = sharedValue.data;
            }
            return { valid: true, data: newObj };
        }
        else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
            if (a.length !== b.length) {
                return { valid: false };
            }
            const newArray = [];
            for (let index = 0; index < a.length; index++) {
                const itemA = a[index];
                const itemB = b[index];
                const sharedValue = mergeValues(itemA, itemB);
                if (!sharedValue.valid) {
                    return { valid: false };
                }
                newArray.push(sharedValue.data);
            }
            return { valid: true, data: newArray };
        }
        else if (aType === ZodParsedType.date &&
            bType === ZodParsedType.date &&
            +a === +b) {
            return { valid: true, data: a };
        }
        else {
            return { valid: false };
        }
    }
    class ZodIntersection extends ZodType {
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            const handleParsed = (parsedLeft, parsedRight) => {
                if (isAborted(parsedLeft) || isAborted(parsedRight)) {
                    return INVALID;
                }
                const merged = mergeValues(parsedLeft.value, parsedRight.value);
                if (!merged.valid) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.invalid_intersection_types,
                    });
                    return INVALID;
                }
                if (isDirty(parsedLeft) || isDirty(parsedRight)) {
                    status.dirty();
                }
                return { status: status.value, value: merged.data };
            };
            if (ctx.common.async) {
                return Promise.all([
                    this._def.left._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: ctx,
                    }),
                    this._def.right._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: ctx,
                    }),
                ]).then(([left, right]) => handleParsed(left, right));
            }
            else {
                return handleParsed(this._def.left._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }), this._def.right._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }));
            }
        }
    }
    ZodIntersection.create = (left, right, params) => {
        return new ZodIntersection({
            left: left,
            right: right,
            typeName: ZodFirstPartyTypeKind.ZodIntersection,
            ...processCreateParams(params),
        });
    };
    class ZodTuple extends ZodType {
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.array) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.array,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            if (ctx.data.length < this._def.items.length) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: this._def.items.length,
                    inclusive: true,
                    exact: false,
                    type: "array",
                });
                return INVALID;
            }
            const rest = this._def.rest;
            if (!rest && ctx.data.length > this._def.items.length) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: this._def.items.length,
                    inclusive: true,
                    exact: false,
                    type: "array",
                });
                status.dirty();
            }
            const items = [...ctx.data]
                .map((item, itemIndex) => {
                const schema = this._def.items[itemIndex] || this._def.rest;
                if (!schema)
                    return null;
                return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
            })
                .filter((x) => !!x); // filter nulls
            if (ctx.common.async) {
                return Promise.all(items).then((results) => {
                    return ParseStatus.mergeArray(status, results);
                });
            }
            else {
                return ParseStatus.mergeArray(status, items);
            }
        }
        get items() {
            return this._def.items;
        }
        rest(rest) {
            return new ZodTuple({
                ...this._def,
                rest,
            });
        }
    }
    ZodTuple.create = (schemas, params) => {
        if (!Array.isArray(schemas)) {
            throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
        }
        return new ZodTuple({
            items: schemas,
            typeName: ZodFirstPartyTypeKind.ZodTuple,
            rest: null,
            ...processCreateParams(params),
        });
    };
    class ZodRecord extends ZodType {
        get keySchema() {
            return this._def.keyType;
        }
        get valueSchema() {
            return this._def.valueType;
        }
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.object) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.object,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const pairs = [];
            const keyType = this._def.keyType;
            const valueType = this._def.valueType;
            for (const key in ctx.data) {
                pairs.push({
                    key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                    value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
                });
            }
            if (ctx.common.async) {
                return ParseStatus.mergeObjectAsync(status, pairs);
            }
            else {
                return ParseStatus.mergeObjectSync(status, pairs);
            }
        }
        get element() {
            return this._def.valueType;
        }
        static create(first, second, third) {
            if (second instanceof ZodType) {
                return new ZodRecord({
                    keyType: first,
                    valueType: second,
                    typeName: ZodFirstPartyTypeKind.ZodRecord,
                    ...processCreateParams(third),
                });
            }
            return new ZodRecord({
                keyType: ZodString.create(),
                valueType: first,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(second),
            });
        }
    }
    class ZodMap extends ZodType {
        get keySchema() {
            return this._def.keyType;
        }
        get valueSchema() {
            return this._def.valueType;
        }
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.map) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.map,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const keyType = this._def.keyType;
            const valueType = this._def.valueType;
            const pairs = [...ctx.data.entries()].map(([key, value], index) => {
                return {
                    key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                    value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
                };
            });
            if (ctx.common.async) {
                const finalMap = new Map();
                return Promise.resolve().then(async () => {
                    for (const pair of pairs) {
                        const key = await pair.key;
                        const value = await pair.value;
                        if (key.status === "aborted" || value.status === "aborted") {
                            return INVALID;
                        }
                        if (key.status === "dirty" || value.status === "dirty") {
                            status.dirty();
                        }
                        finalMap.set(key.value, value.value);
                    }
                    return { status: status.value, value: finalMap };
                });
            }
            else {
                const finalMap = new Map();
                for (const pair of pairs) {
                    const key = pair.key;
                    const value = pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return INVALID;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            }
        }
    }
    ZodMap.create = (keyType, valueType, params) => {
        return new ZodMap({
            valueType,
            keyType,
            typeName: ZodFirstPartyTypeKind.ZodMap,
            ...processCreateParams(params),
        });
    };
    class ZodSet extends ZodType {
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.set) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.set,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const def = this._def;
            if (def.minSize !== null) {
                if (ctx.data.size < def.minSize.value) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: def.minSize.value,
                        type: "set",
                        inclusive: true,
                        exact: false,
                        message: def.minSize.message,
                    });
                    status.dirty();
                }
            }
            if (def.maxSize !== null) {
                if (ctx.data.size > def.maxSize.value) {
                    addIssueToContext(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: def.maxSize.value,
                        type: "set",
                        inclusive: true,
                        exact: false,
                        message: def.maxSize.message,
                    });
                    status.dirty();
                }
            }
            const valueType = this._def.valueType;
            function finalizeSet(elements) {
                const parsedSet = new Set();
                for (const element of elements) {
                    if (element.status === "aborted")
                        return INVALID;
                    if (element.status === "dirty")
                        status.dirty();
                    parsedSet.add(element.value);
                }
                return { status: status.value, value: parsedSet };
            }
            const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
            if (ctx.common.async) {
                return Promise.all(elements).then((elements) => finalizeSet(elements));
            }
            else {
                return finalizeSet(elements);
            }
        }
        min(minSize, message) {
            return new ZodSet({
                ...this._def,
                minSize: { value: minSize, message: errorUtil.toString(message) },
            });
        }
        max(maxSize, message) {
            return new ZodSet({
                ...this._def,
                maxSize: { value: maxSize, message: errorUtil.toString(message) },
            });
        }
        size(size, message) {
            return this.min(size, message).max(size, message);
        }
        nonempty(message) {
            return this.min(1, message);
        }
    }
    ZodSet.create = (valueType, params) => {
        return new ZodSet({
            valueType,
            minSize: null,
            maxSize: null,
            typeName: ZodFirstPartyTypeKind.ZodSet,
            ...processCreateParams(params),
        });
    };
    class ZodFunction extends ZodType {
        constructor() {
            super(...arguments);
            this.validate = this.implement;
        }
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.function) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.function,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            function makeArgsIssue(args, error) {
                return makeIssue({
                    data: args,
                    path: ctx.path,
                    errorMaps: [
                        ctx.common.contextualErrorMap,
                        ctx.schemaErrorMap,
                        getErrorMap(),
                        errorMap,
                    ].filter((x) => !!x),
                    issueData: {
                        code: ZodIssueCode.invalid_arguments,
                        argumentsError: error,
                    },
                });
            }
            function makeReturnsIssue(returns, error) {
                return makeIssue({
                    data: returns,
                    path: ctx.path,
                    errorMaps: [
                        ctx.common.contextualErrorMap,
                        ctx.schemaErrorMap,
                        getErrorMap(),
                        errorMap,
                    ].filter((x) => !!x),
                    issueData: {
                        code: ZodIssueCode.invalid_return_type,
                        returnTypeError: error,
                    },
                });
            }
            const params = { errorMap: ctx.common.contextualErrorMap };
            const fn = ctx.data;
            if (this._def.returns instanceof ZodPromise) {
                // Would love a way to avoid disabling this rule, but we need
                // an alias (using an arrow function was what caused 2651).
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const me = this;
                return OK(async function (...args) {
                    const error = new ZodError([]);
                    const parsedArgs = await me._def.args
                        .parseAsync(args, params)
                        .catch((e) => {
                        error.addIssue(makeArgsIssue(args, e));
                        throw error;
                    });
                    const result = await Reflect.apply(fn, this, parsedArgs);
                    const parsedReturns = await me._def.returns._def.type
                        .parseAsync(result, params)
                        .catch((e) => {
                        error.addIssue(makeReturnsIssue(result, e));
                        throw error;
                    });
                    return parsedReturns;
                });
            }
            else {
                // Would love a way to avoid disabling this rule, but we need
                // an alias (using an arrow function was what caused 2651).
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const me = this;
                return OK(function (...args) {
                    const parsedArgs = me._def.args.safeParse(args, params);
                    if (!parsedArgs.success) {
                        throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
                    }
                    const result = Reflect.apply(fn, this, parsedArgs.data);
                    const parsedReturns = me._def.returns.safeParse(result, params);
                    if (!parsedReturns.success) {
                        throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
                    }
                    return parsedReturns.data;
                });
            }
        }
        parameters() {
            return this._def.args;
        }
        returnType() {
            return this._def.returns;
        }
        args(...items) {
            return new ZodFunction({
                ...this._def,
                args: ZodTuple.create(items).rest(ZodUnknown.create()),
            });
        }
        returns(returnType) {
            return new ZodFunction({
                ...this._def,
                returns: returnType,
            });
        }
        implement(func) {
            const validatedFunc = this.parse(func);
            return validatedFunc;
        }
        strictImplement(func) {
            const validatedFunc = this.parse(func);
            return validatedFunc;
        }
        static create(args, returns, params) {
            return new ZodFunction({
                args: (args
                    ? args
                    : ZodTuple.create([]).rest(ZodUnknown.create())),
                returns: returns || ZodUnknown.create(),
                typeName: ZodFirstPartyTypeKind.ZodFunction,
                ...processCreateParams(params),
            });
        }
    }
    class ZodLazy extends ZodType {
        get schema() {
            return this._def.getter();
        }
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            const lazySchema = this._def.getter();
            return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
        }
    }
    ZodLazy.create = (getter, params) => {
        return new ZodLazy({
            getter: getter,
            typeName: ZodFirstPartyTypeKind.ZodLazy,
            ...processCreateParams(params),
        });
    };
    class ZodLiteral extends ZodType {
        _parse(input) {
            if (input.data !== this._def.value) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    received: ctx.data,
                    code: ZodIssueCode.invalid_literal,
                    expected: this._def.value,
                });
                return INVALID;
            }
            return { status: "valid", value: input.data };
        }
        get value() {
            return this._def.value;
        }
    }
    ZodLiteral.create = (value, params) => {
        return new ZodLiteral({
            value: value,
            typeName: ZodFirstPartyTypeKind.ZodLiteral,
            ...processCreateParams(params),
        });
    };
    function createZodEnum(values, params) {
        return new ZodEnum({
            values,
            typeName: ZodFirstPartyTypeKind.ZodEnum,
            ...processCreateParams(params),
        });
    }
    class ZodEnum extends ZodType {
        _parse(input) {
            if (typeof input.data !== "string") {
                const ctx = this._getOrReturnCtx(input);
                const expectedValues = this._def.values;
                addIssueToContext(ctx, {
                    expected: util.joinValues(expectedValues),
                    received: ctx.parsedType,
                    code: ZodIssueCode.invalid_type,
                });
                return INVALID;
            }
            if (this._def.values.indexOf(input.data) === -1) {
                const ctx = this._getOrReturnCtx(input);
                const expectedValues = this._def.values;
                addIssueToContext(ctx, {
                    received: ctx.data,
                    code: ZodIssueCode.invalid_enum_value,
                    options: expectedValues,
                });
                return INVALID;
            }
            return OK(input.data);
        }
        get options() {
            return this._def.values;
        }
        get enum() {
            const enumValues = {};
            for (const val of this._def.values) {
                enumValues[val] = val;
            }
            return enumValues;
        }
        get Values() {
            const enumValues = {};
            for (const val of this._def.values) {
                enumValues[val] = val;
            }
            return enumValues;
        }
        get Enum() {
            const enumValues = {};
            for (const val of this._def.values) {
                enumValues[val] = val;
            }
            return enumValues;
        }
        extract(values) {
            return ZodEnum.create(values);
        }
        exclude(values) {
            return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
        }
    }
    ZodEnum.create = createZodEnum;
    class ZodNativeEnum extends ZodType {
        _parse(input) {
            const nativeEnumValues = util.getValidEnumValues(this._def.values);
            const ctx = this._getOrReturnCtx(input);
            if (ctx.parsedType !== ZodParsedType.string &&
                ctx.parsedType !== ZodParsedType.number) {
                const expectedValues = util.objectValues(nativeEnumValues);
                addIssueToContext(ctx, {
                    expected: util.joinValues(expectedValues),
                    received: ctx.parsedType,
                    code: ZodIssueCode.invalid_type,
                });
                return INVALID;
            }
            if (nativeEnumValues.indexOf(input.data) === -1) {
                const expectedValues = util.objectValues(nativeEnumValues);
                addIssueToContext(ctx, {
                    received: ctx.data,
                    code: ZodIssueCode.invalid_enum_value,
                    options: expectedValues,
                });
                return INVALID;
            }
            return OK(input.data);
        }
        get enum() {
            return this._def.values;
        }
    }
    ZodNativeEnum.create = (values, params) => {
        return new ZodNativeEnum({
            values: values,
            typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
            ...processCreateParams(params),
        });
    };
    class ZodPromise extends ZodType {
        unwrap() {
            return this._def.type;
        }
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            if (ctx.parsedType !== ZodParsedType.promise &&
                ctx.common.async === false) {
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.promise,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            const promisified = ctx.parsedType === ZodParsedType.promise
                ? ctx.data
                : Promise.resolve(ctx.data);
            return OK(promisified.then((data) => {
                return this._def.type.parseAsync(data, {
                    path: ctx.path,
                    errorMap: ctx.common.contextualErrorMap,
                });
            }));
        }
    }
    ZodPromise.create = (schema, params) => {
        return new ZodPromise({
            type: schema,
            typeName: ZodFirstPartyTypeKind.ZodPromise,
            ...processCreateParams(params),
        });
    };
    class ZodEffects extends ZodType {
        innerType() {
            return this._def.schema;
        }
        sourceType() {
            return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
                ? this._def.schema.sourceType()
                : this._def.schema;
        }
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            const effect = this._def.effect || null;
            const checkCtx = {
                addIssue: (arg) => {
                    addIssueToContext(ctx, arg);
                    if (arg.fatal) {
                        status.abort();
                    }
                    else {
                        status.dirty();
                    }
                },
                get path() {
                    return ctx.path;
                },
            };
            checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
            if (effect.type === "preprocess") {
                const processed = effect.transform(ctx.data, checkCtx);
                if (ctx.common.issues.length) {
                    return {
                        status: "dirty",
                        value: ctx.data,
                    };
                }
                if (ctx.common.async) {
                    return Promise.resolve(processed).then((processed) => {
                        return this._def.schema._parseAsync({
                            data: processed,
                            path: ctx.path,
                            parent: ctx,
                        });
                    });
                }
                else {
                    return this._def.schema._parseSync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            }
            if (effect.type === "refinement") {
                const executeRefinement = (acc
                // effect: RefinementEffect<any>
                ) => {
                    const result = effect.refinement(acc, checkCtx);
                    if (ctx.common.async) {
                        return Promise.resolve(result);
                    }
                    if (result instanceof Promise) {
                        throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                    }
                    return acc;
                };
                if (ctx.common.async === false) {
                    const inner = this._def.schema._parseSync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (inner.status === "aborted")
                        return INVALID;
                    if (inner.status === "dirty")
                        status.dirty();
                    // return value is ignored
                    executeRefinement(inner.value);
                    return { status: status.value, value: inner.value };
                }
                else {
                    return this._def.schema
                        ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                        .then((inner) => {
                        if (inner.status === "aborted")
                            return INVALID;
                        if (inner.status === "dirty")
                            status.dirty();
                        return executeRefinement(inner.value).then(() => {
                            return { status: status.value, value: inner.value };
                        });
                    });
                }
            }
            if (effect.type === "transform") {
                if (ctx.common.async === false) {
                    const base = this._def.schema._parseSync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (!isValid(base))
                        return base;
                    const result = effect.transform(base.value, checkCtx);
                    if (result instanceof Promise) {
                        throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                    }
                    return { status: status.value, value: result };
                }
                else {
                    return this._def.schema
                        ._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx })
                        .then((base) => {
                        if (!isValid(base))
                            return base;
                        return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
                    });
                }
            }
            util.assertNever(effect);
        }
    }
    ZodEffects.create = (schema, effect, params) => {
        return new ZodEffects({
            schema,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect,
            ...processCreateParams(params),
        });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
        return new ZodEffects({
            schema,
            effect: { type: "preprocess", transform: preprocess },
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            ...processCreateParams(params),
        });
    };
    class ZodOptional extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType === ZodParsedType.undefined) {
                return OK(undefined);
            }
            return this._def.innerType._parse(input);
        }
        unwrap() {
            return this._def.innerType;
        }
    }
    ZodOptional.create = (type, params) => {
        return new ZodOptional({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodOptional,
            ...processCreateParams(params),
        });
    };
    class ZodNullable extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType === ZodParsedType.null) {
                return OK(null);
            }
            return this._def.innerType._parse(input);
        }
        unwrap() {
            return this._def.innerType;
        }
    }
    ZodNullable.create = (type, params) => {
        return new ZodNullable({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodNullable,
            ...processCreateParams(params),
        });
    };
    class ZodDefault extends ZodType {
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            let data = ctx.data;
            if (ctx.parsedType === ZodParsedType.undefined) {
                data = this._def.defaultValue();
            }
            return this._def.innerType._parse({
                data,
                path: ctx.path,
                parent: ctx,
            });
        }
        removeDefault() {
            return this._def.innerType;
        }
    }
    ZodDefault.create = (type, params) => {
        return new ZodDefault({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
            defaultValue: typeof params.default === "function"
                ? params.default
                : () => params.default,
            ...processCreateParams(params),
        });
    };
    class ZodCatch extends ZodType {
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            // newCtx is used to not collect issues from inner types in ctx
            const newCtx = {
                ...ctx,
                common: {
                    ...ctx.common,
                    issues: [],
                },
            };
            const result = this._def.innerType._parse({
                data: newCtx.data,
                path: newCtx.path,
                parent: {
                    ...newCtx,
                },
            });
            if (isAsync(result)) {
                return result.then((result) => {
                    return {
                        status: "valid",
                        value: result.status === "valid"
                            ? result.value
                            : this._def.catchValue({
                                get error() {
                                    return new ZodError(newCtx.common.issues);
                                },
                                input: newCtx.data,
                            }),
                    };
                });
            }
            else {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            }
        }
        removeCatch() {
            return this._def.innerType;
        }
    }
    ZodCatch.create = (type, params) => {
        return new ZodCatch({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
            catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
            ...processCreateParams(params),
        });
    };
    class ZodNaN extends ZodType {
        _parse(input) {
            const parsedType = this._getType(input);
            if (parsedType !== ZodParsedType.nan) {
                const ctx = this._getOrReturnCtx(input);
                addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.nan,
                    received: ctx.parsedType,
                });
                return INVALID;
            }
            return { status: "valid", value: input.data };
        }
    }
    ZodNaN.create = (params) => {
        return new ZodNaN({
            typeName: ZodFirstPartyTypeKind.ZodNaN,
            ...processCreateParams(params),
        });
    };
    const BRAND = Symbol("zod_brand");
    class ZodBranded extends ZodType {
        _parse(input) {
            const { ctx } = this._processInputParams(input);
            const data = ctx.data;
            return this._def.type._parse({
                data,
                path: ctx.path,
                parent: ctx,
            });
        }
        unwrap() {
            return this._def.type;
        }
    }
    class ZodPipeline extends ZodType {
        _parse(input) {
            const { status, ctx } = this._processInputParams(input);
            if (ctx.common.async) {
                const handleAsync = async () => {
                    const inResult = await this._def.in._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (inResult.status === "aborted")
                        return INVALID;
                    if (inResult.status === "dirty") {
                        status.dirty();
                        return DIRTY(inResult.value);
                    }
                    else {
                        return this._def.out._parseAsync({
                            data: inResult.value,
                            path: ctx.path,
                            parent: ctx,
                        });
                    }
                };
                return handleAsync();
            }
            else {
                const inResult = this._def.in._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return INVALID;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return {
                        status: "dirty",
                        value: inResult.value,
                    };
                }
                else {
                    return this._def.out._parseSync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            }
        }
        static create(a, b) {
            return new ZodPipeline({
                in: a,
                out: b,
                typeName: ZodFirstPartyTypeKind.ZodPipeline,
            });
        }
    }
    class ZodReadonly extends ZodType {
        _parse(input) {
            const result = this._def.innerType._parse(input);
            if (isValid(result)) {
                result.value = Object.freeze(result.value);
            }
            return result;
        }
    }
    ZodReadonly.create = (type, params) => {
        return new ZodReadonly({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodReadonly,
            ...processCreateParams(params),
        });
    };
    const custom = (check, params = {}, 
    /**
     * @deprecated
     *
     * Pass `fatal` into the params object instead:
     *
     * ```ts
     * z.string().custom((val) => val.length > 5, { fatal: false })
     * ```
     *
     */
    fatal) => {
        if (check)
            return ZodAny.create().superRefine((data, ctx) => {
                var _a, _b;
                if (!check(data)) {
                    const p = typeof params === "function"
                        ? params(data)
                        : typeof params === "string"
                            ? { message: params }
                            : params;
                    const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
                    const p2 = typeof p === "string" ? { message: p } : p;
                    ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
                }
            });
        return ZodAny.create();
    };
    const late = {
        object: ZodObject.lazycreate,
    };
    var ZodFirstPartyTypeKind;
    (function (ZodFirstPartyTypeKind) {
        ZodFirstPartyTypeKind["ZodString"] = "ZodString";
        ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
        ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
        ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
        ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
        ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
        ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
        ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
        ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
        ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
        ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
        ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
        ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
        ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
        ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
        ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
        ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
        ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
        ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
        ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
        ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
        ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
        ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
        ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
        ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
        ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
        ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
        ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
        ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
        ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
        ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
        ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
        ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
        ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
        ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
        ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    const instanceOfType = (
    // const instanceOfType = <T extends new (...args: any[]) => any>(
    cls, params = {
        message: `Input not instance of ${cls.name}`,
    }) => custom((data) => data instanceof cls, params);
    const stringType = ZodString.create;
    const numberType = ZodNumber.create;
    const nanType = ZodNaN.create;
    const bigIntType = ZodBigInt.create;
    const booleanType = ZodBoolean.create;
    const dateType = ZodDate.create;
    const symbolType = ZodSymbol.create;
    const undefinedType = ZodUndefined.create;
    const nullType = ZodNull.create;
    const anyType = ZodAny.create;
    const unknownType = ZodUnknown.create;
    const neverType = ZodNever.create;
    const voidType = ZodVoid.create;
    const arrayType = ZodArray.create;
    const objectType = ZodObject.create;
    const strictObjectType = ZodObject.strictCreate;
    const unionType = ZodUnion.create;
    const discriminatedUnionType = ZodDiscriminatedUnion.create;
    const intersectionType = ZodIntersection.create;
    const tupleType = ZodTuple.create;
    const recordType = ZodRecord.create;
    const mapType = ZodMap.create;
    const setType = ZodSet.create;
    const functionType = ZodFunction.create;
    const lazyType = ZodLazy.create;
    const literalType = ZodLiteral.create;
    const enumType = ZodEnum.create;
    const nativeEnumType = ZodNativeEnum.create;
    const promiseType = ZodPromise.create;
    const effectsType = ZodEffects.create;
    const optionalType = ZodOptional.create;
    const nullableType = ZodNullable.create;
    const preprocessType = ZodEffects.createWithPreprocess;
    const pipelineType = ZodPipeline.create;
    const ostring = () => stringType().optional();
    const onumber = () => numberType().optional();
    const oboolean = () => booleanType().optional();
    const coerce = {
        string: ((arg) => ZodString.create({ ...arg, coerce: true })),
        number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
        boolean: ((arg) => ZodBoolean.create({
            ...arg,
            coerce: true,
        })),
        bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
        date: ((arg) => ZodDate.create({ ...arg, coerce: true })),
    };
    const NEVER = INVALID;

    var z = /*#__PURE__*/Object.freeze({
        __proto__: null,
        defaultErrorMap: errorMap,
        setErrorMap: setErrorMap,
        getErrorMap: getErrorMap,
        makeIssue: makeIssue,
        EMPTY_PATH: EMPTY_PATH,
        addIssueToContext: addIssueToContext,
        ParseStatus: ParseStatus,
        INVALID: INVALID,
        DIRTY: DIRTY,
        OK: OK,
        isAborted: isAborted,
        isDirty: isDirty,
        isValid: isValid,
        isAsync: isAsync,
        get util () { return util; },
        get objectUtil () { return objectUtil; },
        ZodParsedType: ZodParsedType,
        getParsedType: getParsedType,
        ZodType: ZodType,
        ZodString: ZodString,
        ZodNumber: ZodNumber,
        ZodBigInt: ZodBigInt,
        ZodBoolean: ZodBoolean,
        ZodDate: ZodDate,
        ZodSymbol: ZodSymbol,
        ZodUndefined: ZodUndefined,
        ZodNull: ZodNull,
        ZodAny: ZodAny,
        ZodUnknown: ZodUnknown,
        ZodNever: ZodNever,
        ZodVoid: ZodVoid,
        ZodArray: ZodArray,
        ZodObject: ZodObject,
        ZodUnion: ZodUnion,
        ZodDiscriminatedUnion: ZodDiscriminatedUnion,
        ZodIntersection: ZodIntersection,
        ZodTuple: ZodTuple,
        ZodRecord: ZodRecord,
        ZodMap: ZodMap,
        ZodSet: ZodSet,
        ZodFunction: ZodFunction,
        ZodLazy: ZodLazy,
        ZodLiteral: ZodLiteral,
        ZodEnum: ZodEnum,
        ZodNativeEnum: ZodNativeEnum,
        ZodPromise: ZodPromise,
        ZodEffects: ZodEffects,
        ZodTransformer: ZodEffects,
        ZodOptional: ZodOptional,
        ZodNullable: ZodNullable,
        ZodDefault: ZodDefault,
        ZodCatch: ZodCatch,
        ZodNaN: ZodNaN,
        BRAND: BRAND,
        ZodBranded: ZodBranded,
        ZodPipeline: ZodPipeline,
        ZodReadonly: ZodReadonly,
        custom: custom,
        Schema: ZodType,
        ZodSchema: ZodType,
        late: late,
        get ZodFirstPartyTypeKind () { return ZodFirstPartyTypeKind; },
        coerce: coerce,
        any: anyType,
        array: arrayType,
        bigint: bigIntType,
        boolean: booleanType,
        date: dateType,
        discriminatedUnion: discriminatedUnionType,
        effect: effectsType,
        'enum': enumType,
        'function': functionType,
        'instanceof': instanceOfType,
        intersection: intersectionType,
        lazy: lazyType,
        literal: literalType,
        map: mapType,
        nan: nanType,
        nativeEnum: nativeEnumType,
        never: neverType,
        'null': nullType,
        nullable: nullableType,
        number: numberType,
        object: objectType,
        oboolean: oboolean,
        onumber: onumber,
        optional: optionalType,
        ostring: ostring,
        pipeline: pipelineType,
        preprocess: preprocessType,
        promise: promiseType,
        record: recordType,
        set: setType,
        strictObject: strictObjectType,
        string: stringType,
        symbol: symbolType,
        transformer: effectsType,
        tuple: tupleType,
        'undefined': undefinedType,
        union: unionType,
        unknown: unknownType,
        'void': voidType,
        NEVER: NEVER,
        ZodIssueCode: ZodIssueCode,
        quotelessJson: quotelessJson,
        ZodError: ZodError
    });

    let zodComputeType = z.enum(["list", "explicit", "check", "table explicit"]);
    let zodListSettings = z.object({
        // when calculating the sequence, we need to provide guesses for how many numbers the main function should calculate.
        lengthGuessAlgorithm: z.object({
            // If the algorithm is linear, start at start and increase the guess by increment each time
            // If the algorithm is custom, use the custom guesses provided by the user.
            type: z.enum(["linear", "custom"]),
            start: z.number(),
            increment: z.number(),
            customGuesses: z.array(z.number())
        })
    });
    let zodDataUnit = z.enum(["b", "kb", "mb", "gb"]);
    let zodProgData = z.object({
        // the language that code is in
        lang: z.enum(["PARI", ""]),
        // the code for the function that actually computes the sequence
        code: z.string(),
        // the type of computation function that code is.
        // List means that the function returns a list of values of length of the first parameter passed.
        // Explicit means that the function returns a single value, the nth value of the sequence.
        // Check means that the function returns a boolean, true if n is in the sequence
        // table explicit: this is actually for tables and triangles. The function has two arguments, n and k. If it is a table, n and k are the row and column. If it is a triangle n is the row and k is the position in said row. Only regular triangles are supported.
        type: zodComputeType,
        // the function specified in code that computed the sequence.
        main: z.string(),
        // the offset of the sequence. Parsed directly from the offset field of the sequence.
        offset: z.number(),
        // If you calculate too many terms, the resulting bfile can be truncated for n <= truncate
        truncate: z.number(),
        // If the resulting bfile should be truncated
        shouldTruncate: z.boolean(),
        // version of the progData
        version: z.literal("0.1"),
        // If the header saying that the bfile was generated with this program, and what settings were used should be included in said bfile.
        includeHeader: z.boolean(),
        // the A number of the sequence. Parsed automatically from a hidden input field with name=seq
        sequenceId: z.string(),
        // settings for the list computation type
        listSettings: zodListSettings,
        // settings for the check computation type
        checkSettings: z.object({
            // what the first n to check is.
            checkStart: z.number(),
        }),
        // settings for the table computation type
        tableSettings: z.object({
            // the start value for the first parameter of the main function
            xoffset: z.number(),
            // the start value for the second parameter of the main function
            yoffset: z.number(),
            // if it is a table or a triangle
            type: z.enum(["triangle", "square"]),
            // if this is true, read table by upward antidiagonals instead of downward antidiagonals
            squareUpward: z.boolean(),
        }),
        // settings specific to the programming language used to compute the sequence
        langSettings: z.object({
            // settings specific to the PARI programming language
            pari: z.object({
                // what to set the pari default called parisize to. This should probably be left to its default. Change parisizemax instead
                parisize: z.object({
                    // the amount of memory to allocate, multiplied by unit
                    amount: z.number(),
                    // the unit of memory to allocate
                    unit: zodDataUnit
                }),
                parisizemax: z.object({
                    // the amount of memory to allocate, multiplied by unit
                    amount: z.number(),
                    // the unit of memory to allocate
                    unit: zodDataUnit
                }),
                // wether to import memoize library or not. see: http://user42.tuxfamily.org/pari-memoize/
                includeMemoize: z.boolean()
            })
        }),
        // the maximum number of results to calculate when using 
        maxResult: z.number(),
        importBfilesFor: z.array(z.string()),
        bfileIdealTransferBlocksize: z.number(),
        timestamp: z.number(),
        limit: z.object({
            maxLineLength: z.number(),
            maxIndex: z.object({
                type: z.enum(["antidiagonals", "index"]),
                maxAntidiaonal: z.number(),
                maxIndex: z.number()
            })
        })
    });
    function getStores() {
        return {
            progData: writable({
                lang: "",
                code: "",
                type: "explicit",
                main: "",
                offset: 0,
                truncate: 0,
                shouldTruncate: false,
                version: "0.1",
                sequenceId: document.getElementsByName("seq")[0].value || "",
                includeHeader: true,
                listSettings: {
                    lengthGuessAlgorithm: {
                        type: "linear",
                        start: 100,
                        increment: 100,
                        customGuesses: []
                    }
                },
                checkSettings: {
                    checkStart: 0,
                },
                tableSettings: {
                    xoffset: 0,
                    yoffset: 0,
                    type: "square",
                    squareUpward: false,
                },
                langSettings: {
                    pari: {
                        parisize: {
                            amount: 50,
                            unit: "mb"
                        },
                        parisizemax: {
                            amount: 1,
                            unit: "gb"
                        },
                        includeMemoize: false
                    },
                },
                maxResult: 10000,
                limit: {
                    maxLineLength: 1000,
                    maxIndex: {
                        type: "index",
                        maxAntidiaonal: 150,
                        maxIndex: 10000
                    }
                },
                importBfilesFor: [],
                bfileIdealTransferBlocksize: 100,
                timestamp: 0,
            }),
        };
    }

    /* src/src/ImportConfig.svelte generated by Svelte v3.58.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/src/ImportConfig.svelte";

    // (70:20) 
    function create_if_block_1$1(ctx) {
    	let h3;
    	let t1;
    	let pre;
    	let code;
    	let t2;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Errors while importing";
    			t1 = space();
    			pre = element("pre");
    			code = element("code");
    			t2 = text(/*errorText*/ ctx[1]);
    			add_location(h3, file$1, 70, 4, 2444);
    			add_location(code, file$1, 71, 9, 2485);
    			add_location(pre, file$1, 71, 4, 2480);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, pre, anchor);
    			append_dev(pre, code);
    			append_dev(code, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorText*/ 2) set_data_dev(t2, /*errorText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(70:20) ",
    		ctx
    	});

    	return block;
    }

    // (68:0) {#if importCompleted}
    function create_if_block$2(ctx) {
    	let p;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Import completed. ");
    			button = element("button");
    			button.textContent = "Undo import";
    			add_location(button, file$1, 68, 25, 2284);
    			add_location(p, file$1, 68, 4, 2263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[7]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(68:0) {#if importCompleted}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let button0;
    	let t5;
    	let t6;
    	let br;
    	let t7;
    	let button1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*importCompleted*/ ctx[3]) return create_if_block$2;
    		if (/*errorText*/ ctx[1]) return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Import / export";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Go to the bfile and copy and paste the settings from there (you can leave the newlines and \"#\"s in)";
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Import config from clipboard";
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			br = element("br");
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Copy current config to clipboard";
    			add_location(h1, file$1, 64, 0, 2013);
    			add_location(p, file$1, 65, 0, 2038);
    			add_location(button0, file$1, 66, 0, 2145);
    			add_location(br, file$1, 73, 0, 2522);
    			add_location(button1, file$1, 74, 0, 2527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*importFromClipboard*/ ctx[6]), false, true, false, false),
    					listen_dev(button1, "click", prevent_default(/*copyConfig*/ ctx[5]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t6.parentNode, t6);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t5);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(4, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ImportConfig', slots, []);
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let importIsOpen = false;
    	let importText = "";
    	let errorText = "";
    	let oldProgData = undefined;
    	let importCompleted = false;

    	function importSettings() {
    		$$invalidate(1, errorText = "");
    		let data;

    		try {
    			console.log(joinFromLines(importText));
    			data = JSON.parse(joinFromLines(importText));
    		} catch(e) {
    			$$invalidate(1, errorText = "Settings are malformed: " + e.message);
    			return;
    		}

    		if (typeof data !== "object" || data === null) {
    			$$invalidate(1, errorText = "Settings are malformed: not an object");
    			return;
    		}

    		let v = data.version;

    		if (v !== "0.1") {
    			if (v === "0.0.0.1") {
    				$$invalidate(1, errorText = "importing from version 0.0.0.1 isn't supported because this was the general version used in development and has too many differences.");
    				return;
    			} else {
    				$$invalidate(1, errorText = `unknown version: ${v}`);
    				return;
    			}
    		}

    		let r = zodProgData.safeParse(data);

    		if (r.success) {
    			let parsed = r.data;

    			if (parsed.sequenceId !== $progData.sequenceId) {
    				$$invalidate(1, errorText = "sequenceId of imported isn't the sequence currently editing. Please go to the correct sequence page");
    				return;
    			}

    			$$invalidate(2, oldProgData = $progData);
    			set_store_value(progData, $progData = parsed, $progData);
    		} else {
    			$$invalidate(1, errorText = "while trying to parse the settings, the following issues were encountered: " + r.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("\n\n"));
    			return;
    		}
    	}

    	function copyConfig() {
    		let text = JSON.stringify($progData);
    		navigator.clipboard.writeText(text);
    	}

    	function importFromClipboard() {
    		navigator.clipboard.readText().then(text => {
    			importText = text;
    			importSettings();
    		});
    	}

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console_1$1.warn("<ImportConfig> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<ImportConfig> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		if (oldProgData) {
    			set_store_value(progData, $progData = oldProgData, $progData);
    			$$invalidate(3, importCompleted = true);
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		zodProgData,
    		joinFromLines,
    		prevent_default,
    		progData,
    		importIsOpen,
    		importText,
    		errorText,
    		oldProgData,
    		importCompleted,
    		importSettings,
    		copyConfig,
    		importFromClipboard,
    		$progData
    	});

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    		if ('importIsOpen' in $$props) importIsOpen = $$props.importIsOpen;
    		if ('importText' in $$props) importText = $$props.importText;
    		if ('errorText' in $$props) $$invalidate(1, errorText = $$props.errorText);
    		if ('oldProgData' in $$props) $$invalidate(2, oldProgData = $$props.oldProgData);
    		if ('importCompleted' in $$props) $$invalidate(3, importCompleted = $$props.importCompleted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		progData,
    		errorText,
    		oldProgData,
    		importCompleted,
    		$progData,
    		copyConfig,
    		importFromClipboard,
    		click_handler
    	];
    }

    class ImportConfig extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImportConfig",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get progData() {
    		throw new Error("<ImportConfig>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<ImportConfig>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/Code.svelte generated by Svelte v3.58.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/src/Code.svelte";

    // (129:4) {#if checkForCommonPattern($progData.code, $progData.lang)}
    function create_if_block_5(ctx) {
    	let p;
    	let t0;
    	let code;
    	let pre;
    	let t1_value = /*checkForCommonPattern*/ ctx[7](/*$progData*/ ctx[1].code, /*$progData*/ ctx[1].lang) + "";
    	let t1;
    	let br;
    	let t2;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Detected common pattern, replace code with: \n        ");
    			code = element("code");
    			pre = element("pre");
    			t1 = text(t1_value);
    			br = element("br");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Replace";
    			set_style(pre, "display", "inline-block");
    			add_location(pre, file, 130, 14, 4444);
    			add_location(code, file, 130, 8, 4438);
    			add_location(br, file, 130, 118, 4548);
    			add_location(button, file, 131, 8, 4561);
    			add_location(p, file, 129, 8, 4382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, code);
    			append_dev(code, pre);
    			append_dev(pre, t1);
    			append_dev(p, br);
    			append_dev(p, t2);
    			append_dev(p, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[12]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$progData*/ 2 && t1_value !== (t1_value = /*checkForCommonPattern*/ ctx[7](/*$progData*/ ctx[1].code, /*$progData*/ ctx[1].lang) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(129:4) {#if checkForCommonPattern($progData.code, $progData.lang)}",
    		ctx
    	});

    	return block;
    }

    // (147:4) {#if $progData.type === "table explicit" && $progData.tableSettings.type === "triangle"}
    function create_if_block_4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			add_location(p, file, 147, 8, 5287);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(147:4) {#if $progData.type === \\\"table explicit\\\" && $progData.tableSettings.type === \\\"triangle\\\"}",
    		ctx
    	});

    	return block;
    }

    // (150:4) {#if $progData.type === "table explicit"}
    function create_if_block_3(ctx) {
    	let tablesettings;
    	let current;

    	tablesettings = new TableSettings({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablesettings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablesettings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tablesettings_changes = {};
    			if (dirty & /*progData*/ 1) tablesettings_changes.progData = /*progData*/ ctx[0];
    			tablesettings.$set(tablesettings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablesettings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablesettings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablesettings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(150:4) {#if $progData.type === \\\"table explicit\\\"}",
    		ctx
    	});

    	return block;
    }

    // (156:4) {#if $progData.type === "list"}
    function create_if_block_2(ctx) {
    	let listsettings;
    	let current;

    	listsettings = new ListSettings({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(listsettings.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(listsettings, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const listsettings_changes = {};
    			if (dirty & /*progData*/ 1) listsettings_changes.progData = /*progData*/ ctx[0];
    			listsettings.$set(listsettings_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(listsettings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(listsettings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(listsettings, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(156:4) {#if $progData.type === \\\"list\\\"}",
    		ctx
    	});

    	return block;
    }

    // (167:4) {#if $progData.lang === "PARI"}
    function create_if_block_1(ctx) {
    	let pariconfig;
    	let current;

    	pariconfig = new PariConfig({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pariconfig.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pariconfig, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pariconfig_changes = {};
    			if (dirty & /*progData*/ 1) pariconfig_changes.progData = /*progData*/ ctx[0];
    			pariconfig.$set(pariconfig_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pariconfig.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pariconfig.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pariconfig, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(167:4) {#if $progData.lang === \\\"PARI\\\"}",
    		ctx
    	});

    	return block;
    }

    // (174:4) {#if resultingCode !== fullCode}
    function create_if_block$1(ctx) {
    	let p;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("The code shown above is a shortened version (not including any libraries). ");
    			button = element("button");
    			button.textContent = "View entire code in new tab";
    			add_location(button, file, 174, 86, 6260);
    			add_location(p, file, 174, 8, 6182);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*openFullCodeInNewTab*/ ctx[8]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(174:4) {#if resultingCode !== fullCode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let br0;
    	let t0;
    	let importconfig;
    	let br1;
    	let br2;
    	let t1;
    	let label0;
    	let t2;
    	let select0;
    	let option0;
    	let option1;
    	let t4;
    	let br3;
    	let t5;
    	let label1;
    	let t6;
    	let br4;
    	let t7;
    	let textarea;
    	let t8;
    	let br5;
    	let t9;
    	let show_if = /*checkForCommonPattern*/ ctx[7](/*$progData*/ ctx[1].code, /*$progData*/ ctx[1].lang);
    	let t10;
    	let label2;
    	let t11;
    	let select1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let t16;
    	let br6;
    	let t17;
    	let label3;
    	let t18;
    	let input;
    	let t19;
    	let br7;
    	let t20;
    	let t21;
    	let t22;
    	let limit;
    	let t23;
    	let importbfile;
    	let t24;
    	let t25;
    	let t26;
    	let h10;
    	let t28;
    	let code;
    	let pre;
    	let t29;
    	let t30;
    	let button0;
    	let t32;
    	let t33;
    	let h11;
    	let t35;
    	let button1;
    	let t37;
    	let status;
    	let updating_status;
    	let t38;
    	let output;
    	let current;
    	let mounted;
    	let dispose;

    	importconfig = new ImportConfig({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	let if_block0 = show_if && create_if_block_5(ctx);
    	let if_block1 = /*$progData*/ ctx[1].type === "table explicit" && /*$progData*/ ctx[1].tableSettings.type === "triangle" && create_if_block_4(ctx);
    	let if_block2 = /*$progData*/ ctx[1].type === "table explicit" && create_if_block_3(ctx);

    	limit = new Limit({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	importbfile = new ImportBfile({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	let if_block3 = /*$progData*/ ctx[1].type === "list" && create_if_block_2(ctx);
    	let if_block4 = /*$progData*/ ctx[1].lang === "PARI" && create_if_block_1(ctx);
    	let if_block5 = /*resultingCode*/ ctx[4] !== /*fullCode*/ ctx[5] && create_if_block$1(ctx);

    	function status_status_binding(value) {
    		/*status_status_binding*/ ctx[17](value);
    	}

    	let status_props = {};

    	if (/*runStatus*/ ctx[2] !== void 0) {
    		status_props.status = /*runStatus*/ ctx[2];
    	}

    	status = new Status({ props: status_props, $$inline: true });
    	binding_callbacks.push(() => bind(status, 'status', status_status_binding));

    	output = new Output({
    			props: {
    				status: /*runStatus*/ ctx[2],
    				progData: /*progData*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			br0 = element("br");
    			t0 = space();
    			create_component(importconfig.$$.fragment);
    			br1 = element("br");
    			br2 = element("br");
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Language:\n        ");
    			select0 = element("select");
    			option0 = element("option");
    			option1 = element("option");
    			option1.textContent = "PARI";
    			t4 = space();
    			br3 = element("br");
    			t5 = space();
    			label1 = element("label");
    			t6 = text("Code: ");
    			br4 = element("br");
    			t7 = space();
    			textarea = element("textarea");
    			t8 = space();
    			br5 = element("br");
    			t9 = space();
    			if (if_block0) if_block0.c();
    			t10 = space();
    			label2 = element("label");
    			t11 = text("Type:\n        ");
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "Explicit";
    			option3 = element("option");
    			option3.textContent = "List";
    			option4 = element("option");
    			option4.textContent = "Check";
    			option5 = element("option");
    			option5.textContent = "Table/Triangle explicit";
    			t16 = space();
    			br6 = element("br");
    			t17 = space();
    			label3 = element("label");
    			t18 = text("Main function:\n        ");
    			input = element("input");
    			t19 = space();
    			br7 = element("br");
    			t20 = space();
    			if (if_block1) if_block1.c();
    			t21 = space();
    			if (if_block2) if_block2.c();
    			t22 = space();
    			create_component(limit.$$.fragment);
    			t23 = space();
    			create_component(importbfile.$$.fragment);
    			t24 = space();
    			if (if_block3) if_block3.c();
    			t25 = space();
    			if (if_block4) if_block4.c();
    			t26 = space();
    			h10 = element("h1");
    			h10.textContent = "Generated code:";
    			t28 = space();
    			code = element("code");
    			pre = element("pre");
    			t29 = text(/*resultingCode*/ ctx[4]);
    			t30 = space();
    			button0 = element("button");
    			button0.textContent = "test";
    			t32 = space();
    			if (if_block5) if_block5.c();
    			t33 = space();
    			h11 = element("h1");
    			h11.textContent = "Run";
    			t35 = space();
    			button1 = element("button");
    			button1.textContent = "run";
    			t37 = space();
    			create_component(status.$$.fragment);
    			t38 = space();
    			create_component(output.$$.fragment);
    			add_location(br0, file, 115, 4, 3895);
    			add_location(br1, file, 116, 30, 3930);
    			add_location(br2, file, 116, 34, 3934);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file, 120, 12, 4049);
    			option1.__value = "PARI";
    			option1.value = option1.__value;
    			add_location(option1, file, 121, 12, 4088);
    			attr_dev(select0, "id", "lang-" + /*id*/ ctx[6]);
    			if (/*$progData*/ ctx[1].lang === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[9].call(select0));
    			add_location(select0, file, 119, 8, 3985);
    			attr_dev(label0, "for", "lang-" + /*id*/ ctx[6]);
    			add_location(label0, file, 118, 4, 3944);
    			add_location(br3, file, 124, 4, 4158);
    			add_location(br4, file, 125, 33, 4196);
    			attr_dev(textarea, "id", "code-" + /*id*/ ctx[6]);
    			attr_dev(textarea, "class", "svelte-hp6uaf");
    			add_location(textarea, file, 126, 8, 4209);
    			attr_dev(label1, "for", "code-" + /*id*/ ctx[6]);
    			add_location(label1, file, 125, 4, 4167);
    			add_location(br5, file, 127, 12, 4305);
    			option2.__value = "explicit";
    			option2.value = option2.__value;
    			add_location(option2, file, 136, 12, 4813);
    			option3.__value = "list";
    			option3.value = option3.__value;
    			add_location(option3, file, 137, 12, 4868);
    			option4.__value = "check";
    			option4.value = option4.__value;
    			add_location(option4, file, 138, 12, 4915);
    			option5.__value = "table explicit";
    			option5.value = option5.__value;
    			add_location(option5, file, 139, 12, 4964);
    			attr_dev(select1, "id", "type-" + /*id*/ ctx[6]);
    			if (/*$progData*/ ctx[1].type === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file, 135, 8, 4749);
    			attr_dev(label2, "for", "type-" + /*id*/ ctx[6]);
    			add_location(label2, file, 134, 4, 4712);
    			add_location(br6, file, 142, 4, 5063);
    			attr_dev(input, "id", "main-" + /*id*/ ctx[6]);
    			add_location(input, file, 144, 8, 5118);
    			attr_dev(label3, "for", "main-" + /*id*/ ctx[6]);
    			add_location(label3, file, 143, 4, 5072);
    			add_location(br7, file, 145, 12, 5181);
    			add_location(h10, file, 170, 4, 5958);
    			add_location(pre, file, 171, 23, 6006);
    			attr_dev(code, "class", "code svelte-hp6uaf");
    			add_location(code, file, 171, 4, 5987);
    			add_location(button0, file, 172, 4, 6044);
    			add_location(h11, file, 176, 4, 6370);
    			add_location(button1, file, 177, 4, 6387);
    			attr_dev(div, "class", "container svelte-hp6uaf");
    			add_location(div, file, 114, 0, 3867);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, br0);
    			append_dev(div, t0);
    			mount_component(importconfig, div, null);
    			append_dev(div, br1);
    			append_dev(div, br2);
    			append_dev(div, t1);
    			append_dev(div, label0);
    			append_dev(label0, t2);
    			append_dev(label0, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			select_option(select0, /*$progData*/ ctx[1].lang, true);
    			append_dev(div, t4);
    			append_dev(div, br3);
    			append_dev(div, t5);
    			append_dev(div, label1);
    			append_dev(label1, t6);
    			append_dev(label1, br4);
    			append_dev(label1, t7);
    			append_dev(label1, textarea);
    			/*textarea_binding*/ ctx[10](textarea);
    			set_input_value(textarea, /*$progData*/ ctx[1].code);
    			append_dev(label1, t8);
    			append_dev(div, br5);
    			append_dev(div, t9);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t10);
    			append_dev(div, label2);
    			append_dev(label2, t11);
    			append_dev(label2, select1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			select_option(select1, /*$progData*/ ctx[1].type, true);
    			append_dev(div, t16);
    			append_dev(div, br6);
    			append_dev(div, t17);
    			append_dev(div, label3);
    			append_dev(label3, t18);
    			append_dev(label3, input);
    			set_input_value(input, /*$progData*/ ctx[1].main);
    			append_dev(label3, t19);
    			append_dev(div, br7);
    			append_dev(div, t20);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t21);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t22);
    			mount_component(limit, div, null);
    			append_dev(div, t23);
    			mount_component(importbfile, div, null);
    			append_dev(div, t24);
    			if (if_block3) if_block3.m(div, null);
    			append_dev(div, t25);
    			if (if_block4) if_block4.m(div, null);
    			append_dev(div, t26);
    			append_dev(div, h10);
    			append_dev(div, t28);
    			append_dev(div, code);
    			append_dev(code, pre);
    			append_dev(pre, t29);
    			append_dev(div, t30);
    			append_dev(div, button0);
    			append_dev(div, t32);
    			if (if_block5) if_block5.m(div, null);
    			append_dev(div, t33);
    			append_dev(div, h11);
    			append_dev(div, t35);
    			append_dev(div, button1);
    			append_dev(div, t37);
    			mount_component(status, div, null);
    			append_dev(div, t38);
    			mount_component(output, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[9]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[13]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    					listen_dev(button0, "click", prevent_default(/*click_handler_1*/ ctx[15]), false, true, false, false),
    					listen_dev(button1, "click", prevent_default(/*click_handler_2*/ ctx[16]), false, true, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const importconfig_changes = {};
    			if (dirty & /*progData*/ 1) importconfig_changes.progData = /*progData*/ ctx[0];
    			importconfig.$set(importconfig_changes);

    			if (dirty & /*$progData*/ 2) {
    				select_option(select0, /*$progData*/ ctx[1].lang);
    			}

    			if (dirty & /*$progData*/ 2) {
    				set_input_value(textarea, /*$progData*/ ctx[1].code);
    			}

    			if (dirty & /*$progData*/ 2) show_if = /*checkForCommonPattern*/ ctx[7](/*$progData*/ ctx[1].code, /*$progData*/ ctx[1].lang);

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$progData*/ 2) {
    				select_option(select1, /*$progData*/ ctx[1].type);
    			}

    			if (dirty & /*$progData*/ 2 && input.value !== /*$progData*/ ctx[1].main) {
    				set_input_value(input, /*$progData*/ ctx[1].main);
    			}

    			if (/*$progData*/ ctx[1].type === "table explicit" && /*$progData*/ ctx[1].tableSettings.type === "triangle") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div, t21);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$progData*/ ctx[1].type === "table explicit") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$progData*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t22);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			const limit_changes = {};
    			if (dirty & /*progData*/ 1) limit_changes.progData = /*progData*/ ctx[0];
    			limit.$set(limit_changes);
    			const importbfile_changes = {};
    			if (dirty & /*progData*/ 1) importbfile_changes.progData = /*progData*/ ctx[0];
    			importbfile.$set(importbfile_changes);

    			if (/*$progData*/ ctx[1].type === "list") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*$progData*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div, t25);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*$progData*/ ctx[1].lang === "PARI") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*$progData*/ 2) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div, t26);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*resultingCode*/ 16) set_data_dev(t29, /*resultingCode*/ ctx[4]);

    			if (/*resultingCode*/ ctx[4] !== /*fullCode*/ ctx[5]) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block$1(ctx);
    					if_block5.c();
    					if_block5.m(div, t33);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			const status_changes = {};

    			if (!updating_status && dirty & /*runStatus*/ 4) {
    				updating_status = true;
    				status_changes.status = /*runStatus*/ ctx[2];
    				add_flush_callback(() => updating_status = false);
    			}

    			status.$set(status_changes);
    			const output_changes = {};
    			if (dirty & /*runStatus*/ 4) output_changes.status = /*runStatus*/ ctx[2];
    			if (dirty & /*progData*/ 1) output_changes.progData = /*progData*/ ctx[0];
    			output.$set(output_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(importconfig.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(limit.$$.fragment, local);
    			transition_in(importbfile.$$.fragment, local);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(status.$$.fragment, local);
    			transition_in(output.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(importconfig.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(limit.$$.fragment, local);
    			transition_out(importbfile.$$.fragment, local);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(status.$$.fragment, local);
    			transition_out(output.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(importconfig);
    			/*textarea_binding*/ ctx[10](null);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(limit);
    			destroy_component(importbfile);
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			destroy_component(status);
    			destroy_component(output);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let nextId = 0;

    function instance$2($$self, $$props, $$invalidate) {
    	let fullCode;

    	let $progData,
    		$$unsubscribe_progData = noop,
    		$$subscribe_progData = () => ($$unsubscribe_progData(), $$unsubscribe_progData = subscribe(progData, $$value => $$invalidate(1, $progData = $$value)), progData);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_progData());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Code', slots, []);
    	let id = nextId++;
    	const VALID_LANGS = ["PARI"];

    	const FUNC_MAP = {
    		a: "explicit",
    		lista: "list",
    		vector_a: "list",
    		isok: "check",
    		T: "table explicit"
    	};

    	let runStatus = writable({ running: false, error: false });
    	let { progData } = $$props;
    	validate_store(progData, 'progData');
    	$$subscribe_progData();
    	let codeEl = null;
    	let previousCode = "";

    	function updateCode(code) {
    		// detect lang
    		let match = code.match(/^\((\w+)\)/);

    		if (match) {
    			let lang = match[1];

    			if (VALID_LANGS.includes(lang)) {
    				// save selection in codeEl
    				if (!codeEl) throw "codeEl is null. How???";

    				let start = codeEl.selectionStart;
    				let end = codeEl.selectionEnd;
    				let newCode = code.slice(match[0].length).trimStart();
    				let deltaLength = code.length - newCode.length;

    				// update code
    				set_store_value(progData, $progData.code = newCode, $progData);

    				// update lang
    				set_store_value(progData, $progData.lang = lang, $progData);

    				// restore selection
    				$$invalidate(3, codeEl.selectionStart = Math.max(start - deltaLength, 0), codeEl);

    				$$invalidate(3, codeEl.selectionEnd = Math.max(end - deltaLength, 0), codeEl);
    				code = newCode;
    			}
    		}

    		// detect type
    		for (let key of Object.keys(FUNC_MAP)) {
    			if (code.startsWith(key + "(")) {
    				if ($progData.main !== key) set_store_value(progData, $progData.main = key, $progData);
    				break;
    			}
    		}

    		previousCode = code;
    	}

    	let previousMain = "";

    	function updateType(main) {
    		if (main === previousMain) return;
    		previousMain = main;
    		$progData.type;
    		if (main in FUNC_MAP) set_store_value(progData, $progData.type = FUNC_MAP[main], $progData);
    	}

    	let prevComputeType = $progData.type;

    	// $: console.log($progData)
    	function onTypeUpdate(type) {
    		if (type === prevComputeType) return;
    		prevComputeType = type;
    		events.dispatchComputeType(type, prevComputeType);
    	}

    	const REPLACEMENTS_MAP = {
    		"PARI": [
    			{
    				match: /^my\(N=30, x='x\+O\('x\^N\)\); (Vec\(.*\))$/,
    				subst: "lista(n) = my(x='x + O('x^n)); $1"
    			}
    		]
    	};

    	function checkForCommonPattern(code, lang) {
    		if (!lang) return;
    		let replacements = REPLACEMENTS_MAP[lang];
    		code = code.trim();

    		for (let r of replacements) {
    			if (code.match(r.match)) return code.replace(r.match, r.subst);
    		}
    	}

    	let resultingCode = "";
    	let offset = Number(document.getElementById("edit_Offset").innerText.split(",")[0]);

    	function openFullCodeInNewTab() {
    		let blob = new Blob([fullCode], { type: "text/plain" });
    		let url = URL.createObjectURL(blob);
    		window.open(url, "_blank");
    		setTimeout(() => URL.revokeObjectURL(url), 10000);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (progData === undefined && !('progData' in $$props || $$self.$$.bound[$$self.$$.props['progData']])) {
    			console_1.warn("<Code> was created without expected prop 'progData'");
    		}
    	});

    	const writable_props = ['progData'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Code> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		$progData.lang = select_value(this);
    		progData.set($progData);
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			codeEl = $$value;
    			$$invalidate(3, codeEl);
    		});
    	}

    	function textarea_input_handler() {
    		$progData.code = this.value;
    		progData.set($progData);
    	}

    	const click_handler = () => set_store_value(progData, $progData.code = checkForCommonPattern($progData.code, $progData.lang), $progData);

    	function select1_change_handler() {
    		$progData.type = select_value(this);
    		progData.set($progData);
    	}

    	function input_input_handler() {
    		$progData.main = this.value;
    		progData.set($progData);
    	}

    	const click_handler_1 = () => console.log({ fullCode, resultingCode });
    	const click_handler_2 = () => startCode($progData, fullCode, runStatus);

    	function status_status_binding(value) {
    		runStatus = value;
    		$$invalidate(2, runStatus);
    	}

    	$$self.$$set = $$props => {
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    	};

    	$$self.$capture_state = () => ({
    		nextId,
    		writable,
    		genPari,
    		run,
    		run2,
    		Status,
    		startCode,
    		Output,
    		ListSettings,
    		PariConfig,
    		TableSettings,
    		ImportBfile,
    		Limit,
    		events,
    		ImportConfig,
    		id,
    		VALID_LANGS,
    		FUNC_MAP,
    		runStatus,
    		progData,
    		codeEl,
    		previousCode,
    		updateCode,
    		previousMain,
    		updateType,
    		prevComputeType,
    		onTypeUpdate,
    		REPLACEMENTS_MAP,
    		checkForCommonPattern,
    		resultingCode,
    		offset,
    		openFullCodeInNewTab,
    		fullCode,
    		$progData
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(6, id = $$props.id);
    		if ('runStatus' in $$props) $$invalidate(2, runStatus = $$props.runStatus);
    		if ('progData' in $$props) $$subscribe_progData($$invalidate(0, progData = $$props.progData));
    		if ('codeEl' in $$props) $$invalidate(3, codeEl = $$props.codeEl);
    		if ('previousCode' in $$props) previousCode = $$props.previousCode;
    		if ('previousMain' in $$props) previousMain = $$props.previousMain;
    		if ('prevComputeType' in $$props) prevComputeType = $$props.prevComputeType;
    		if ('resultingCode' in $$props) $$invalidate(4, resultingCode = $$props.resultingCode);
    		if ('offset' in $$props) $$invalidate(27, offset = $$props.offset);
    		if ('fullCode' in $$props) $$invalidate(5, fullCode = $$props.fullCode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$progData*/ 2) {
    			// TODO: if type or main is modified and then immediately overwritten by updateCode, show the user a warning
    			updateCode($progData.code);
    		}

    		if ($$self.$$.dirty & /*$progData*/ 2) {
    			updateType($progData.main);
    		}

    		if ($$self.$$.dirty & /*$progData*/ 2) {
    			onTypeUpdate($progData.type);
    		}

    		if ($$self.$$.dirty & /*$progData*/ 2) {
    			$$invalidate(4, resultingCode = genPari($progData.code, $progData.main, $progData.type, offset, $progData));
    		}

    		if ($$self.$$.dirty & /*$progData*/ 2) {
    			$$invalidate(5, fullCode = genPari($progData.code, $progData.main, $progData.type, offset, $progData, false));
    		}
    	};

    	set_store_value(progData, $progData.offset = offset, $progData);

    	return [
    		progData,
    		$progData,
    		runStatus,
    		codeEl,
    		resultingCode,
    		fullCode,
    		id,
    		checkForCommonPattern,
    		openFullCodeInNewTab,
    		select0_change_handler,
    		textarea_binding,
    		textarea_input_handler,
    		click_handler,
    		select1_change_handler,
    		input_input_handler,
    		click_handler_1,
    		click_handler_2,
    		status_status_binding
    	];
    }

    class Code extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { progData: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Code",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get progData() {
    		throw new Error("<Code>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progData(value) {
    		throw new Error("<Code>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/src/Sequence.svelte generated by Svelte v3.58.0 */

    // (12:0) {#if !error}
    function create_if_block(ctx) {
    	let code;
    	let current;

    	code = new Code({
    			props: { progData: /*progData*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(code.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(code, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(code.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(code.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(code, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:0) {#if !error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*error*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*error*/ ctx[1]) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sequence', slots, []);
    	let { progData } = getStores();
    	let error = false;
    	let { ourIndex } = $$props;
    	document.getElementById("upload_bfile" + ourIndex).checked = true;
    	document.getElementById("upload_tt_" + ourIndex).innerText = document.getElementById("upload_tt_" + ourIndex).innerText.replace("TITLE FOR LINK", "Table of n, a(n) for n = MIN..MAX");

    	$$self.$$.on_mount.push(function () {
    		if (ourIndex === undefined && !('ourIndex' in $$props || $$self.$$.bound[$$self.$$.props['ourIndex']])) {
    			console.warn("<Sequence> was created without expected prop 'ourIndex'");
    		}
    	});

    	const writable_props = ['ourIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sequence> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ourIndex' in $$props) $$invalidate(2, ourIndex = $$props.ourIndex);
    	};

    	$$self.$capture_state = () => ({
    		Code,
    		getStores,
    		errorToast,
    		progData,
    		error,
    		ourIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('progData' in $$props) $$invalidate(0, progData = $$props.progData);
    		if ('error' in $$props) $$invalidate(1, error = $$props.error);
    		if ('ourIndex' in $$props) $$invalidate(2, ourIndex = $$props.ourIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [progData, error, ourIndex];
    }

    class Sequence extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { ourIndex: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sequence",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get ourIndex() {
    		throw new Error("<Sequence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ourIndex(value) {
    		throw new Error("<Sequence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.58.0 */

    function create_fragment(ctx) {
    	let sequence;
    	let t;
    	let sveltetoast;
    	let current;

    	sequence = new Sequence({
    			props: { ourIndex: /*ourIndex*/ ctx[0] },
    			$$inline: true
    		});

    	sveltetoast = new SvelteToast({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sequence.$$.fragment);
    			t = space();
    			create_component(sveltetoast.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sequence, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(sveltetoast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sequence_changes = {};
    			if (dirty & /*ourIndex*/ 1) sequence_changes.ourIndex = /*ourIndex*/ ctx[0];
    			sequence.$set(sequence_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sequence.$$.fragment, local);
    			transition_in(sveltetoast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sequence.$$.fragment, local);
    			transition_out(sveltetoast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sequence, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(sveltetoast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { ourIndex } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (ourIndex === undefined && !('ourIndex' in $$props || $$self.$$.bound[$$self.$$.props['ourIndex']])) {
    			console.warn("<App> was created without expected prop 'ourIndex'");
    		}
    	});

    	const writable_props = ['ourIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ourIndex' in $$props) $$invalidate(0, ourIndex = $$props.ourIndex);
    	};

    	$$self.$capture_state = () => ({ Sequence, SvelteToast, ourIndex });

    	$$self.$inject_state = $$props => {
    		if ('ourIndex' in $$props) $$invalidate(0, ourIndex = $$props.ourIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ourIndex];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { ourIndex: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get ourIndex() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ourIndex(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let container = document.createElement('div');
    // add target after end of element #add_upload
    let el = document.getElementById('add_upload');
    if (!el) {
        alert("BFile toolbox: catastrophic error, couldn't find the upload button.");
        throw "";
    }
    el.insertAdjacentElement('afterend', container);
    el.insertAdjacentElement('afterend', document.createElement("br"));
    let button = document.createElement('button');
    button.innerHTML = 'open bfile toolbox';
    button.addEventListener('click', e => {
        e.preventDefault();
        let elements = ["upload0", "upload1", "upload2", "upload3", "upload4"].map(id => document.getElementById(id));
        let index = elements.findIndex(el => el && el.style.display === "none");
        if (index === -1) {
            alert("BFile toolbox: no available files. This extension expects the \"I want to upload a supporting file to store with the OEIS and add a link to it.\" link to be available");
            throw "";
        }
        let link = document.querySelector("#add_upload a");
        (link instanceof HTMLElement) && link.click();
        new App({
            target: container,
            props: {
                ourIndex: index
            }
        });
    });
    container.appendChild(button);
    var main = {};

    return main;

})();
//# sourceMappingURL=bundle.js.map
