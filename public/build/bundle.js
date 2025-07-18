
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
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
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
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

    /* src\Adder.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$5 = "src\\Adder.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let form;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "New item");
    			attr_dev(input, "class", "svelte-1l7puk8");
    			add_location(input, file$5, 28, 2, 699);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-1l7puk8");
    			add_location(button, file$5, 29, 2, 771);
    			attr_dev(form, "class", "svelte-1l7puk8");
    			add_location(form, file$5, 27, 1, 651);
    			attr_dev(div, "class", "svelte-1l7puk8");
    			add_location(div, file$5, 26, 0, 643);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, input);
    			set_input_value(input, /*newTodoItem*/ ctx[0]);
    			append_dev(form, t0);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(form, "submit", prevent_default(/*updateList*/ ctx[1]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newTodoItem*/ 1 && input.value !== /*newTodoItem*/ ctx[0]) {
    				set_input_value(input, /*newTodoItem*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Adder", slots, []);
    	let { list } = $$props;
    	let { currentList } = $$props;
    	let { storeList } = $$props;
    	let newTodoItem = "";

    	function updateList() {
    		console.warn("RAN" + newTodoItem);

    		if (!(newTodoItem == "")) {
    			if (list[currentList].length > 0) {
    				$$invalidate(2, list[currentList] = [...list[currentList], { text: newTodoItem, completed: false }], list);
    			} else {
    				$$invalidate(2, list[currentList] = [{ text: newTodoItem, completed: false }], list);
    			}

    			storeList();
    			$$invalidate(0, newTodoItem = "");
    		} else {
    			notificationAlert("Whoops!", "You must type something to add it!");
    		}
    	}

    	const writable_props = ["list", "currentList", "storeList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Adder> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newTodoItem = this.value;
    		$$invalidate(0, newTodoItem);
    	}

    	$$self.$$set = $$props => {
    		if ("list" in $$props) $$invalidate(2, list = $$props.list);
    		if ("currentList" in $$props) $$invalidate(3, currentList = $$props.currentList);
    		if ("storeList" in $$props) $$invalidate(4, storeList = $$props.storeList);
    	};

    	$$self.$capture_state = () => ({
    		list,
    		currentList,
    		storeList,
    		newTodoItem,
    		updateList
    	});

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) $$invalidate(2, list = $$props.list);
    		if ("currentList" in $$props) $$invalidate(3, currentList = $$props.currentList);
    		if ("storeList" in $$props) $$invalidate(4, storeList = $$props.storeList);
    		if ("newTodoItem" in $$props) $$invalidate(0, newTodoItem = $$props.newTodoItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newTodoItem, updateList, list, currentList, storeList, input_input_handler];
    }

    class Adder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { list: 2, currentList: 3, storeList: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Adder",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*list*/ ctx[2] === undefined && !("list" in props)) {
    			console_1.warn("<Adder> was created without expected prop 'list'");
    		}

    		if (/*currentList*/ ctx[3] === undefined && !("currentList" in props)) {
    			console_1.warn("<Adder> was created without expected prop 'currentList'");
    		}

    		if (/*storeList*/ ctx[4] === undefined && !("storeList" in props)) {
    			console_1.warn("<Adder> was created without expected prop 'storeList'");
    		}
    	}

    	get list() {
    		throw new Error("<Adder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Adder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentList() {
    		throw new Error("<Adder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentList(value) {
    		throw new Error("<Adder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get storeList() {
    		throw new Error("<Adder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storeList(value) {
    		throw new Error("<Adder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DisplayList.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "src\\DisplayList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[10] = list;
    	child_ctx[11] = i;
    	return child_ctx;
    }

    // (14:2) {#each todos[todoListName] as todo, i}
    function create_each_block_1(ctx) {
    	let li;
    	let input;
    	let t0;
    	let span0;
    	let t2;
    	let span1;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[2].call(input, /*each_value_1*/ ctx[10], /*i*/ ctx[11]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*todoListName*/ ctx[6], /*i*/ ctx[11], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[4](/*todo*/ ctx[9], /*each_value_1*/ ctx[10], /*i*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			input = element("input");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "×";
    			t2 = space();
    			span1 = element("span");
    			span1.textContent = "✓";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-140y7cm");
    			toggle_class(input, "done", /*todo*/ ctx[9].completed);
    			add_location(input, file$4, 15, 3, 383);
    			attr_dev(span0, "class", "svelte-140y7cm");
    			add_location(span0, file$4, 16, 3, 458);
    			attr_dev(span1, "class", "check svelte-140y7cm");
    			add_location(span1, file$4, 17, 3, 564);
    			attr_dev(li, "class", "svelte-140y7cm");
    			toggle_class(li, "done", /*todo*/ ctx[9].completed);
    			add_location(li, file$4, 14, 2, 346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, input);
    			set_input_value(input, /*todo*/ ctx[9].text);
    			append_dev(li, t0);
    			append_dev(li, span0);
    			append_dev(li, t2);
    			append_dev(li, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(span0, "click", click_handler, false, false, false),
    					listen_dev(span1, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*todos, Object*/ 1 && input.value !== /*todo*/ ctx[9].text) {
    				set_input_value(input, /*todo*/ ctx[9].text);
    			}

    			if (dirty & /*todos, Object*/ 1) {
    				toggle_class(input, "done", /*todo*/ ctx[9].completed);
    			}

    			if (dirty & /*todos, Object*/ 1) {
    				toggle_class(li, "done", /*todo*/ ctx[9].completed);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(14:2) {#each todos[todoListName] as todo, i}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each Object.keys(todos) as todoListName}
    function create_each_block$2(ctx) {
    	let h3;
    	let t0_value = /*todoListName*/ ctx[6] + "";
    	let t0;
    	let h3_id_value;
    	let t1;
    	let ul;
    	let t2;
    	let span;
    	let t4;
    	let adder;
    	let updating_list;
    	let t5;
    	let current;
    	let each_value_1 = /*todos*/ ctx[0][/*todoListName*/ ctx[6]];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function adder_list_binding(value) {
    		/*adder_list_binding*/ ctx[5](value);
    	}

    	let adder_props = {
    		storeList: /*storeList*/ ctx[1],
    		currentList: /*todoListName*/ ctx[6]
    	};

    	if (/*todos*/ ctx[0] !== void 0) {
    		adder_props.list = /*todos*/ ctx[0];
    	}

    	adder = new Adder({ props: adder_props, $$inline: true });
    	binding_callbacks.push(() => bind(adder, "list", adder_list_binding));

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			span = element("span");
    			span.textContent = "Yayy! There is nothing to do! ¯\\_(ツ)_/¯";
    			t4 = space();
    			create_component(adder.$$.fragment);
    			t5 = space();
    			attr_dev(h3, "id", h3_id_value = /*todoListName*/ ctx[6]);
    			add_location(h3, file$4, 11, 1, 250);
    			attr_dev(span, "class", "svelte-140y7cm");
    			add_location(span, file$4, 20, 2, 707);
    			attr_dev(ul, "class", "svelte-140y7cm");
    			add_location(ul, file$4, 12, 1, 296);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t2);
    			append_dev(ul, span);
    			append_dev(ul, t4);
    			mount_component(adder, ul, null);
    			append_dev(ul, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*todos*/ 1) && t0_value !== (t0_value = /*todoListName*/ ctx[6] + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*todos*/ 1 && h3_id_value !== (h3_id_value = /*todoListName*/ ctx[6])) {
    				attr_dev(h3, "id", h3_id_value);
    			}

    			if (dirty & /*todos, Object, storeList*/ 3) {
    				each_value_1 = /*todos*/ ctx[0][/*todoListName*/ ctx[6]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			const adder_changes = {};
    			if (dirty & /*storeList*/ 2) adder_changes.storeList = /*storeList*/ ctx[1];
    			if (dirty & /*todos*/ 1) adder_changes.currentList = /*todoListName*/ ctx[6];

    			if (!updating_list && dirty & /*todos*/ 1) {
    				updating_list = true;
    				adder_changes.list = /*todos*/ ctx[0];
    				add_flush_callback(() => updating_list = false);
    			}

    			adder.$set(adder_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			destroy_component(adder);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(11:0) {#each Object.keys(todos) as todoListName}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = Object.keys(/*todos*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*storeList, Object, todos*/ 3) {
    				each_value = Object.keys(/*todos*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

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
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DisplayList", slots, []);
    	let { todos } = $$props;
    	let { storeList } = $$props;
    	const writable_props = ["todos", "storeList"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayList> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value_1, i) {
    		each_value_1[i].text = this.value;
    		$$invalidate(0, todos);
    	}

    	const click_handler = (todoListName, i, e) => {
    		todos[todoListName].splice(i, 1);
    		$$invalidate(0, todos);
    		storeList();
    	};

    	const click_handler_1 = (todo, each_value_1, i, e) => {
    		$$invalidate(0, each_value_1[i].completed = !todo.completed, todos);
    		$$invalidate(0, todos);
    		storeList();
    	};

    	function adder_list_binding(value) {
    		todos = value;
    		$$invalidate(0, todos);
    	}

    	$$self.$$set = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(1, storeList = $$props.storeList);
    	};

    	$$self.$capture_state = () => ({ text, Adder, todos, storeList });

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(1, storeList = $$props.storeList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todos,
    		storeList,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		adder_list_binding
    	];
    }

    class DisplayList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { todos: 0, storeList: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayList",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todos*/ ctx[0] === undefined && !("todos" in props)) {
    			console.warn("<DisplayList> was created without expected prop 'todos'");
    		}

    		if (/*storeList*/ ctx[1] === undefined && !("storeList" in props)) {
    			console.warn("<DisplayList> was created without expected prop 'storeList'");
    		}
    	}

    	get todos() {
    		throw new Error("<DisplayList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todos(value) {
    		throw new Error("<DisplayList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get storeList() {
    		throw new Error("<DisplayList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storeList(value) {
    		throw new Error("<DisplayList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Navbar.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\Navbar.svelte";

    // (18:2) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Go Light ⛅";
    			attr_dev(button, "class", "svelte-syxd3p");
    			add_location(button, file$3, 18, 3, 486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[4], false, false, false);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(18:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#if light}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Go Dark 🌑";
    			attr_dev(button, "class", "svelte-syxd3p");
    			add_location(button, file$3, 16, 3, 334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:2) {#if light}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let section;
    	let button;
    	let t2_value = (/*page*/ ctx[1] == "list" ? "My Lists" : "Back to items") + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*light*/ ctx[2]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Todo App!";
    			t1 = space();
    			section = element("section");
    			button = element("button");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			attr_dev(h2, "class", "svelte-syxd3p");
    			add_location(h2, file$3, 10, 1, 158);
    			set_style(button, "margin-right", "1rem");
    			attr_dev(button, "class", "svelte-syxd3p");
    			add_location(button, file$3, 13, 2, 194);
    			add_location(section, file$3, 12, 1, 181);
    			attr_dev(div, "class", "svelte-syxd3p");
    			add_location(div, file$3, 9, 0, 150);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, section);
    			append_dev(section, button);
    			append_dev(button, t2);
    			append_dev(section, t3);
    			if_block.m(section, null);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*togglePage*/ ctx[0])) /*togglePage*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*page*/ 2 && t2_value !== (t2_value = (/*page*/ ctx[1] == "list" ? "My Lists" : "Back to items") + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	let { togglePage } = $$props;
    	let { page } = $$props;
    	let light = true;
    	const writable_props = ["togglePage", "page"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, light = false);
    		document.body.className = "dark";
    		localStorage.setItem("theme", "dark");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(2, light = true);
    		document.body.className = "light";
    		localStorage.setItem("theme", "light");
    	};

    	$$self.$$set = $$props => {
    		if ("togglePage" in $$props) $$invalidate(0, togglePage = $$props.togglePage);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    	};

    	$$self.$capture_state = () => ({ togglePage, page, light });

    	$$self.$inject_state = $$props => {
    		if ("togglePage" in $$props) $$invalidate(0, togglePage = $$props.togglePage);
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("light" in $$props) $$invalidate(2, light = $$props.light);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [togglePage, page, light, click_handler, click_handler_1];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { togglePage: 0, page: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*togglePage*/ ctx[0] === undefined && !("togglePage" in props)) {
    			console.warn("<Navbar> was created without expected prop 'togglePage'");
    		}

    		if (/*page*/ ctx[1] === undefined && !("page" in props)) {
    			console.warn("<Navbar> was created without expected prop 'page'");
    		}
    	}

    	get togglePage() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set togglePage(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get page() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.38.2 */

    const file$2 = "src\\Footer.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let a0;
    	let t4;
    	let p1;
    	let t5;
    	let a1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Todo App ");
    			t1 = text(/*version*/ ctx[0]);
    			t2 = text(" created by ");
    			a0 = element("a");
    			a0.textContent = "Yakowa.com";
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Licensed under\r\n\t\t");
    			a1 = element("a");
    			a1.textContent = "CC BY-NC-ND 4.0";
    			attr_dev(a0, "href", "https://yakowa.com");
    			attr_dev(a0, "class", "svelte-1ymq221");
    			add_location(a0, file$2, 5, 34, 86);
    			add_location(p0, file$2, 5, 1, 53);
    			attr_dev(a1, "class", "theme-header-primary al-link al-hover-underline al-link-focus svelte-1ymq221");
    			attr_dev(a1, "rel", "license");
    			attr_dev(a1, "href", "https://creativecommons.org/licenses/by-nc-nd/4.0?ref=chooser-v1");
    			attr_dev(a1, "target", "_blank");
    			set_style(a1, "display", "inline-block");
    			add_location(a1, file$2, 8, 2, 241);
    			attr_dev(p1, "xmlns:dct", "http://purl.org/dc/terms/");
    			attr_dev(p1, "xmlns:cc", "http://creativecommons.org/ns#");
    			add_location(p1, file$2, 6, 1, 136);
    			attr_dev(div, "class", "svelte-1ymq221");
    			add_location(div, file$2, 4, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, a0);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(p1, t5);
    			append_dev(p1, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*version*/ 1) set_data_dev(t1, /*version*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let { version } = $$props;
    	const writable_props = ["version"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("version" in $$props) $$invalidate(0, version = $$props.version);
    	};

    	$$self.$capture_state = () => ({ version });

    	$$self.$inject_state = $$props => {
    		if ("version" in $$props) $$invalidate(0, version = $$props.version);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [version];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { version: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*version*/ ctx[0] === undefined && !("version" in props)) {
    			console.warn("<Footer> was created without expected prop 'version'");
    		}
    	}

    	get version() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Lists.svelte generated by Svelte v3.38.2 */

    const file$1 = "src\\Lists.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (46:2) {:else}
    function create_else_block$1(ctx) {
    	let li;
    	let t_value = /*lists*/ ctx[4][/*i*/ ctx[12]] + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-1xyv4yd");
    			add_location(li, file$1, 46, 2, 1086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler_2*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*lists*/ 16 && t_value !== (t_value = /*lists*/ ctx[4][/*i*/ ctx[12]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(46:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if i !== 0}
    function create_if_block$1(ctx) {
    	let li;
    	let t0_value = /*lists*/ ctx[4][/*i*/ ctx[12]] + "";
    	let t0;
    	let t1;
    	let span;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[7](/*list*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "class", "svelte-1xyv4yd");
    			add_location(span, file$1, 43, 4, 949);
    			attr_dev(li, "class", "svelte-1xyv4yd");
    			add_location(li, file$1, 41, 3, 887);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", click_handler, false, false, false),
    					listen_dev(li, "click", /*click_handler_1*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*lists*/ 16 && t0_value !== (t0_value = /*lists*/ ctx[4][/*i*/ ctx[12]] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:2) {#if i !== 0}",
    		ctx
    	});

    	return block;
    }

    // (40:1) {#each lists as list, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*i*/ ctx[12] !== 0) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(40:1) {#each lists as list, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let input;
    	let t2;
    	let button;
    	let t4;
    	let ul;
    	let t5;
    	let span;
    	let mounted;
    	let dispose;
    	let each_value = /*lists*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "My Lists";
    			t1 = space();
    			div = element("div");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Add";
    			t4 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			span = element("span");
    			span.textContent = "You have no lists! ¯\\_(ツ)_/¯";
    			add_location(h2, file$1, 32, 0, 679);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "New list");
    			attr_dev(input, "class", "svelte-1xyv4yd");
    			add_location(input, file$1, 34, 1, 706);
    			attr_dev(button, "class", "svelte-1xyv4yd");
    			add_location(button, file$1, 35, 1, 777);
    			attr_dev(div, "class", "svelte-1xyv4yd");
    			add_location(div, file$1, 33, 0, 698);
    			attr_dev(span, "class", "svelte-1xyv4yd");
    			add_location(span, file$1, 51, 1, 1172);
    			attr_dev(ul, "class", "svelte-1xyv4yd");
    			add_location(ul, file$1, 38, 0, 834);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*newListName*/ ctx[3]);
    			append_dev(div, t2);
    			append_dev(div, button);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t5);
    			append_dev(ul, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(button, "click", /*createNewList*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newListName*/ 8 && input.value !== /*newListName*/ ctx[3]) {
    				set_input_value(input, /*newListName*/ ctx[3]);
    			}

    			if (dirty & /*togglePage, todos, lists, getList, storeList*/ 23) {
    				each_value = /*lists*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    function getList(passedList) {
    	let tempList = [];

    	for (var property in passedList) {
    		tempList = [...tempList, property];
    	}

    	return tempList;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lists", slots, []);
    	let { todos } = $$props;
    	let { storeList } = $$props;
    	let { togglePage } = $$props;
    	let newListName = "";

    	function createNewList() {
    		if (!(todos[newListName] == [])) {
    			$$invalidate(0, todos[newListName] = [], todos);
    			$$invalidate(0, todos);
    			storeList();
    			$$invalidate(3, newListName = "");
    			$$invalidate(4, lists = getList(todos));
    		} else {
    			notificationAlert("Whoops!", "There is already a list with that name!");
    		}
    	}

    	var lists = getList(todos);
    	const writable_props = ["todos", "storeList", "togglePage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lists> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newListName = this.value;
    		$$invalidate(3, newListName);
    	}

    	const click_handler = (list, e) => {
    		delete todos[list];
    		$$invalidate(0, todos);
    		$$invalidate(4, lists = getList(todos));
    		storeList();
    	};

    	const click_handler_1 = e => {
    		togglePage();
    	};

    	const click_handler_2 = e => {
    		togglePage();
    	};

    	$$self.$$set = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(1, storeList = $$props.storeList);
    		if ("togglePage" in $$props) $$invalidate(2, togglePage = $$props.togglePage);
    	};

    	$$self.$capture_state = () => ({
    		todos,
    		storeList,
    		togglePage,
    		newListName,
    		createNewList,
    		lists,
    		getList
    	});

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(1, storeList = $$props.storeList);
    		if ("togglePage" in $$props) $$invalidate(2, togglePage = $$props.togglePage);
    		if ("newListName" in $$props) $$invalidate(3, newListName = $$props.newListName);
    		if ("lists" in $$props) $$invalidate(4, lists = $$props.lists);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todos,
    		storeList,
    		togglePage,
    		newListName,
    		lists,
    		createNewList,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Lists extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { todos: 0, storeList: 1, togglePage: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lists",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todos*/ ctx[0] === undefined && !("todos" in props)) {
    			console.warn("<Lists> was created without expected prop 'todos'");
    		}

    		if (/*storeList*/ ctx[1] === undefined && !("storeList" in props)) {
    			console.warn("<Lists> was created without expected prop 'storeList'");
    		}

    		if (/*togglePage*/ ctx[2] === undefined && !("togglePage" in props)) {
    			console.warn("<Lists> was created without expected prop 'togglePage'");
    		}
    	}

    	get todos() {
    		throw new Error("<Lists>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todos(value) {
    		throw new Error("<Lists>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get storeList() {
    		throw new Error("<Lists>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storeList(value) {
    		throw new Error("<Lists>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get togglePage() {
    		throw new Error("<Lists>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set togglePage(value) {
    		throw new Error("<Lists>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (33:2) {#each Object.keys(todosList) as todo}
    function create_each_block(ctx) {
    	let li;
    	let a;
    	let t_value = /*todo*/ ctx[9] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "#" + /*todo*/ ctx[9]);
    			add_location(a, file, 33, 7, 873);
    			add_location(li, file, 33, 3, 869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todosList*/ 1 && t_value !== (t_value = /*todo*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*todosList*/ 1 && a_href_value !== (a_href_value = "#" + /*todo*/ ctx[9])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:2) {#each Object.keys(todosList) as todo}",
    		ctx
    	});

    	return block;
    }

    // (42:1) {:else}
    function create_else_block(ctx) {
    	let lists;
    	let updating_todos;
    	let current;

    	function lists_todos_binding(value) {
    		/*lists_todos_binding*/ ctx[6](value);
    	}

    	let lists_props = {
    		togglePage: /*togglePage*/ ctx[3],
    		storeList: /*storeList*/ ctx[2]
    	};

    	if (/*todosList*/ ctx[0] !== void 0) {
    		lists_props.todos = /*todosList*/ ctx[0];
    	}

    	lists = new Lists({ props: lists_props, $$inline: true });
    	binding_callbacks.push(() => bind(lists, "todos", lists_todos_binding));

    	const block = {
    		c: function create() {
    			create_component(lists.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lists, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const lists_changes = {};

    			if (!updating_todos && dirty & /*todosList*/ 1) {
    				updating_todos = true;
    				lists_changes.todos = /*todosList*/ ctx[0];
    				add_flush_callback(() => updating_todos = false);
    			}

    			lists.$set(lists_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lists.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lists.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lists, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(42:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:1) {#if page == 'list'}
    function create_if_block(ctx) {
    	let list_1;
    	let updating_todos;
    	let current;

    	function list_1_todos_binding(value) {
    		/*list_1_todos_binding*/ ctx[5](value);
    	}

    	let list_1_props = { storeList: /*storeList*/ ctx[2] };

    	if (/*todosList*/ ctx[0] !== void 0) {
    		list_1_props.todos = /*todosList*/ ctx[0];
    	}

    	list_1 = new DisplayList({ props: list_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(list_1, "todos", list_1_todos_binding));

    	const block = {
    		c: function create() {
    			create_component(list_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_1_changes = {};

    			if (!updating_todos && dirty & /*todosList*/ 1) {
    				updating_todos = true;
    				list_1_changes.todos = /*todosList*/ ctx[0];
    				add_flush_callback(() => updating_todos = false);
    			}

    			list_1.$set(list_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:1) {#if page == 'list'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let navbar;
    	let updating_page;
    	let t0;
    	let div0;
    	let h3;
    	let t2;
    	let ul;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let t4;
    	let footer;
    	let current;

    	function navbar_page_binding(value) {
    		/*navbar_page_binding*/ ctx[4](value);
    	}

    	let navbar_props = { togglePage: /*togglePage*/ ctx[3] };

    	if (/*page*/ ctx[1] !== void 0) {
    		navbar_props.page = /*page*/ ctx[1];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, "page", navbar_page_binding));
    	let each_value = Object.keys(/*todosList*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[1] == "list") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	footer = new Footer({
    			props: { version: __version },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "List - Quick Select";
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div1 = element("div");
    			if_block.c();
    			t4 = space();
    			create_component(footer.$$.fragment);
    			add_location(h3, file, 30, 1, 787);
    			add_location(ul, file, 31, 1, 818);
    			attr_dev(div0, "class", "svelte-16ge9lb");
    			add_location(div0, file, 29, 0, 779);
    			attr_dev(div1, "class", "svelte-16ge9lb");
    			add_location(div1, file, 37, 0, 935);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(div0, t2);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			if_blocks[current_block_type_index].m(div1, null);
    			insert_dev(target, t4, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const navbar_changes = {};

    			if (!updating_page && dirty & /*page*/ 2) {
    				updating_page = true;
    				navbar_changes.page = /*page*/ ctx[1];
    				add_flush_callback(() => updating_page = false);
    			}

    			navbar.$set(navbar_changes);

    			if (dirty & /*Object, todosList*/ 1) {
    				each_value = Object.keys(/*todosList*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

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
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div1, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t4);
    			destroy_component(footer, detaching);
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

    const __version = "v2.0.1";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	var list = localStorage.getItem("list");

    	if (list == null) {
    		localStorage.setItem("list", "{ \"default\": [] }");
    	}

    	let todosList = JSON.parse(localStorage.getItem("list"));

    	if (todosList == {}) {
    		todosList = { "default": [] };
    		storeList();
    	}

    	function storeList() {
    		localStorage.setItem("list", JSON.stringify(todosList));
    	}

    	let currentList = "default";
    	let page = "list";

    	function togglePage() {
    		$$invalidate(1, page = page == "list" ? "listOptions" : "list");
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_page_binding(value) {
    		page = value;
    		$$invalidate(1, page);
    	}

    	function list_1_todos_binding(value) {
    		todosList = value;
    		$$invalidate(0, todosList);
    	}

    	function lists_todos_binding(value) {
    		todosList = value;
    		$$invalidate(0, todosList);
    	}

    	$$self.$capture_state = () => ({
    		List: DisplayList,
    		Navbar,
    		Footer,
    		Lists,
    		list,
    		todosList,
    		storeList,
    		__version,
    		currentList,
    		page,
    		togglePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) list = $$props.list;
    		if ("todosList" in $$props) $$invalidate(0, todosList = $$props.todosList);
    		if ("currentList" in $$props) currentList = $$props.currentList;
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todosList,
    		page,
    		storeList,
    		togglePage,
    		navbar_page_binding,
    		list_1_todos_binding,
    		lists_todos_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	// target: document.body
    	target: document.querySelector('#root')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
