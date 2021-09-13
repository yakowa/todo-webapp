
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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

    /* src\DisplayList.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\DisplayList.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (11:1) {#each todos[currentList] as todo, i}
    function create_each_block$1(ctx) {
    	let li;
    	let t0_value = /*todo*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let span;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[6], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "class", "svelte-jvyt6f");
    			add_location(span, file$5, 13, 2, 246);
    			attr_dev(li, "class", "svelte-jvyt6f");
    			add_location(li, file$5, 11, 1, 228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*todos, currentList*/ 3 && t0_value !== (t0_value = /*todo*/ ctx[4] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:1) {#each todos[currentList] as todo, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let t0;
    	let span;
    	let each_value = /*todos*/ ctx[0][/*currentList*/ ctx[1]];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			span = element("span");
    			span.textContent = "Yayy! There is nothing to do! ¯\\_(ツ)_/¯";
    			attr_dev(span, "class", "svelte-jvyt6f");
    			add_location(span, file$5, 16, 1, 367);
    			attr_dev(ul, "class", "svelte-jvyt6f");
    			add_location(ul, file$5, 9, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			append_dev(ul, span);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todos, currentList, storeList*/ 7) {
    				each_value = /*todos*/ ctx[0][/*currentList*/ ctx[1]];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t0);
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
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots("DisplayList", slots, []);
    	let { todos } = $$props;
    	let { currentList } = $$props;
    	let { storeList } = $$props;
    	const writable_props = ["todos", "currentList", "storeList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisplayList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, e) => {
    		todos[currentList].splice(i, 1);
    		$$invalidate(0, todos);
    		storeList();
    	};

    	$$self.$$set = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("currentList" in $$props) $$invalidate(1, currentList = $$props.currentList);
    		if ("storeList" in $$props) $$invalidate(2, storeList = $$props.storeList);
    	};

    	$$self.$capture_state = () => ({ todos, currentList, storeList });

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("currentList" in $$props) $$invalidate(1, currentList = $$props.currentList);
    		if ("storeList" in $$props) $$invalidate(2, storeList = $$props.storeList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todos, currentList, storeList, click_handler];
    }

    class DisplayList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { todos: 0, currentList: 1, storeList: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisplayList",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todos*/ ctx[0] === undefined && !("todos" in props)) {
    			console.warn("<DisplayList> was created without expected prop 'todos'");
    		}

    		if (/*currentList*/ ctx[1] === undefined && !("currentList" in props)) {
    			console.warn("<DisplayList> was created without expected prop 'currentList'");
    		}

    		if (/*storeList*/ ctx[2] === undefined && !("storeList" in props)) {
    			console.warn("<DisplayList> was created without expected prop 'storeList'");
    		}
    	}

    	get todos() {
    		throw new Error("<DisplayList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todos(value) {
    		throw new Error("<DisplayList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentList() {
    		throw new Error("<DisplayList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentList(value) {
    		throw new Error("<DisplayList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get storeList() {
    		throw new Error("<DisplayList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set storeList(value) {
    		throw new Error("<DisplayList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Adder.svelte generated by Svelte v3.38.2 */

    const file$4 = "src\\Adder.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "New item");
    			attr_dev(input, "class", "svelte-i0vcud");
    			add_location(input, file$4, 26, 1, 562);
    			attr_dev(button, "class", "svelte-i0vcud");
    			add_location(button, file$4, 27, 1, 633);
    			attr_dev(div, "class", "svelte-i0vcud");
    			add_location(div, file$4, 25, 0, 554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*newTodoItem*/ ctx[0]);
    			append_dev(div, t0);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*updateList*/ ctx[1], false, false, false)
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Adder", slots, []);
    	let { list } = $$props;
    	let { currentList } = $$props;
    	let { storeList } = $$props;
    	let newTodoItem = "";

    	function updateList() {
    		if (!(newTodoItem == "")) {
    			if (list[currentList].length > 0) {
    				$$invalidate(2, list[currentList] = [...list[currentList], newTodoItem], list);
    			} else {
    				$$invalidate(2, list[currentList] = [newTodoItem], list);
    			}

    			storeList();
    			$$invalidate(0, newTodoItem = "");
    		} else {
    			notificationAlert("Whoops!", "You must type something to add it!");
    		}
    	}

    	const writable_props = ["list", "currentList", "storeList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Adder> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { list: 2, currentList: 3, storeList: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Adder",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*list*/ ctx[2] === undefined && !("list" in props)) {
    			console.warn("<Adder> was created without expected prop 'list'");
    		}

    		if (/*currentList*/ ctx[3] === undefined && !("currentList" in props)) {
    			console.warn("<Adder> was created without expected prop 'currentList'");
    		}

    		if (/*storeList*/ ctx[4] === undefined && !("storeList" in props)) {
    			console.warn("<Adder> was created without expected prop 'storeList'");
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

    /* src\Navbar.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\Navbar.svelte";

    // (9:1) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Go Light ⛅";
    			attr_dev(button, "class", "svelte-syxd3p");
    			add_location(button, file$3, 9, 2, 197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[2], false, false, false);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(9:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#if light}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Go Dark 🌑";
    			attr_dev(button, "class", "svelte-syxd3p");
    			add_location(button, file$3, 7, 2, 87);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(7:1) {#if light}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*light*/ ctx[0]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Todo App!";
    			t1 = space();
    			if_block.c();
    			attr_dev(h2, "class", "svelte-syxd3p");
    			add_location(h2, file$3, 5, 1, 51);
    			attr_dev(div, "class", "svelte-syxd3p");
    			add_location(div, file$3, 4, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	let light = true;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, light = false);
    		document.body.className = "dark";
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, light = true);
    		document.body.className = "light";
    	};

    	$$self.$capture_state = () => ({ light });

    	$$self.$inject_state = $$props => {
    		if ("light" in $$props) $$invalidate(0, light = $$props.light);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [light, click_handler, click_handler_1];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
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
    			a0.textContent = "JacobEM.com";
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Licensed under\r\n\t\t");
    			a1 = element("a");
    			a1.textContent = "CC BY-NC-ND 4.0";
    			attr_dev(a0, "href", "https://jacobem.com");
    			attr_dev(a0, "class", "svelte-1ymq221");
    			add_location(a0, file$2, 5, 34, 86);
    			add_location(p0, file$2, 5, 1, 53);
    			attr_dev(a1, "class", "theme-header-primary al-link al-hover-underline al-link-focus svelte-1ymq221");
    			attr_dev(a1, "rel", "license");
    			attr_dev(a1, "href", "https://creativecommons.org/licenses/by-nc-nd/4.0?ref=chooser-v1");
    			attr_dev(a1, "target", "_blank");
    			set_style(a1, "display", "inline-block");
    			add_location(a1, file$2, 8, 2, 243);
    			attr_dev(p1, "xmlns:dct", "http://purl.org/dc/terms/");
    			attr_dev(p1, "xmlns:cc", "http://creativecommons.org/ns#");
    			add_location(p1, file$2, 6, 1, 138);
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

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (39:1) {#each lists as list, i}
    function create_each_block(ctx) {
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

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[8](/*i*/ ctx[12], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "class", "svelte-1h9pg9f");
    			add_location(span, file$1, 41, 2, 894);
    			attr_dev(li, "class", "svelte-1h9pg9f");
    			add_location(li, file$1, 39, 1, 826);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", click_handler, false, false, false),
    					listen_dev(li, "click", click_handler_1, false, false, false)
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:1) {#each lists as list, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let t2;
    	let ul;
    	let t3;
    	let span;
    	let mounted;
    	let dispose;
    	let each_value = /*lists*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add";
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			span = element("span");
    			span.textContent = "Yayy! There is nothing to do! ¯\\_(ツ)_/¯";
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "New list");
    			attr_dev(input, "class", "svelte-1h9pg9f");
    			add_location(input, file$1, 33, 1, 664);
    			attr_dev(button, "class", "svelte-1h9pg9f");
    			add_location(button, file$1, 34, 1, 735);
    			attr_dev(div, "class", "svelte-1h9pg9f");
    			add_location(div, file$1, 32, 0, 656);
    			attr_dev(span, "class", "svelte-1h9pg9f");
    			add_location(span, file$1, 44, 1, 1003);
    			attr_dev(ul, "class", "svelte-1h9pg9f");
    			add_location(ul, file$1, 37, 0, 792);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*newListName*/ ctx[3]);
    			append_dev(div, t0);
    			append_dev(div, button);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t3);
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

    			if (dirty & /*currentList, lists, todos, storeList*/ 23) {
    				each_value = /*lists*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t3);
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
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lists", slots, []);
    	let { todos } = $$props;
    	let { storeList } = $$props;
    	let { currentList } = $$props;
    	let newListName = "";

    	function createNewList() {
    		if (!(todos[newListName] == [])) {
    			$$invalidate(0, todos[newListName] = [], todos);
    			$$invalidate(0, todos);
    			storeList();
    			$$invalidate(3, newListName = "");
    			$$invalidate(4, lists = getList());
    		} else {
    			notificationAlert("Whoops!", "There is already a list with that name!");
    		}
    	}

    	var lists = getList();

    	function getList() {
    		let tempList = [];

    		for (var property in todos) {
    			tempList = [...tempList, property];
    		}

    		return tempList;
    	}

    	const writable_props = ["todos", "storeList", "currentList"];

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
    		storeList();
    	};

    	const click_handler_1 = (i, e) => {
    		$$invalidate(1, currentList = lists[i]);
    	};

    	$$self.$$set = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(2, storeList = $$props.storeList);
    		if ("currentList" in $$props) $$invalidate(1, currentList = $$props.currentList);
    	};

    	$$self.$capture_state = () => ({
    		todos,
    		storeList,
    		currentList,
    		newListName,
    		createNewList,
    		lists,
    		getList
    	});

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(0, todos = $$props.todos);
    		if ("storeList" in $$props) $$invalidate(2, storeList = $$props.storeList);
    		if ("currentList" in $$props) $$invalidate(1, currentList = $$props.currentList);
    		if ("newListName" in $$props) $$invalidate(3, newListName = $$props.newListName);
    		if ("lists" in $$props) $$invalidate(4, lists = $$props.lists);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todos,
    		currentList,
    		storeList,
    		newListName,
    		lists,
    		createNewList,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class Lists extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { todos: 0, storeList: 2, currentList: 1 });

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

    		if (/*storeList*/ ctx[2] === undefined && !("storeList" in props)) {
    			console.warn("<Lists> was created without expected prop 'storeList'");
    		}

    		if (/*currentList*/ ctx[1] === undefined && !("currentList" in props)) {
    			console.warn("<Lists> was created without expected prop 'currentList'");
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

    	get currentList() {
    		throw new Error("<Lists>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentList(value) {
    		throw new Error("<Lists>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (34:2) {#if currentList !== 'default'}
    function create_if_block(ctx) {
    	let h3;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*currentList*/ ctx[1]);
    			t1 = text(" list");
    			add_location(h3, file, 34, 3, 878);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentList*/ 2) set_data_dev(t0, /*currentList*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:2) {#if currentList !== 'default'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let navbar;
    	let t0;
    	let div;
    	let t1;
    	let adder;
    	let updating_list;
    	let t2;
    	let list_1;
    	let updating_todos;
    	let t3;
    	let hr;
    	let t4;
    	let lists;
    	let updating_todos_1;
    	let updating_currentList;
    	let t5;
    	let footer;
    	let t6;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	navbar = new Navbar({ $$inline: true });
    	let if_block = /*currentList*/ ctx[1] !== "default" && create_if_block(ctx);

    	function adder_list_binding(value) {
    		/*adder_list_binding*/ ctx[4](value);
    	}

    	let adder_props = {
    		storeList: /*storeList*/ ctx[2],
    		currentList: /*currentList*/ ctx[1]
    	};

    	if (/*todosList*/ ctx[0] !== void 0) {
    		adder_props.list = /*todosList*/ ctx[0];
    	}

    	adder = new Adder({ props: adder_props, $$inline: true });
    	binding_callbacks.push(() => bind(adder, "list", adder_list_binding));

    	function list_1_todos_binding(value) {
    		/*list_1_todos_binding*/ ctx[5](value);
    	}

    	let list_1_props = {
    		storeList: /*storeList*/ ctx[2],
    		currentList: /*currentList*/ ctx[1]
    	};

    	if (/*todosList*/ ctx[0] !== void 0) {
    		list_1_props.todos = /*todosList*/ ctx[0];
    	}

    	list_1 = new DisplayList({ props: list_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(list_1, "todos", list_1_todos_binding));

    	function lists_todos_binding(value) {
    		/*lists_todos_binding*/ ctx[6](value);
    	}

    	function lists_currentList_binding(value) {
    		/*lists_currentList_binding*/ ctx[7](value);
    	}

    	let lists_props = { storeList: /*storeList*/ ctx[2] };

    	if (/*todosList*/ ctx[0] !== void 0) {
    		lists_props.todos = /*todosList*/ ctx[0];
    	}

    	if (/*currentList*/ ctx[1] !== void 0) {
    		lists_props.currentList = /*currentList*/ ctx[1];
    	}

    	lists = new Lists({ props: lists_props, $$inline: true });
    	binding_callbacks.push(() => bind(lists, "todos", lists_todos_binding));
    	binding_callbacks.push(() => bind(lists, "currentList", lists_currentList_binding));

    	footer = new Footer({
    			props: { version: __version },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(adder.$$.fragment);
    			t2 = space();
    			create_component(list_1.$$.fragment);
    			t3 = space();
    			hr = element("hr");
    			t4 = space();
    			create_component(lists.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			t6 = space();
    			button = element("button");
    			button.textContent = "Click Me";
    			add_location(hr, file, 39, 2, 1101);
    			attr_dev(div, "class", "svelte-1cep2mi");
    			add_location(div, file, 31, 0, 801);
    			add_location(button, file, 45, 0, 1239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);
    			mount_component(adder, div, null);
    			append_dev(div, t2);
    			mount_component(list_1, div, null);
    			append_dev(div, t3);
    			append_dev(div, hr);
    			append_dev(div, t4);
    			mount_component(lists, div, null);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*test*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*currentList*/ ctx[1] !== "default") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const adder_changes = {};
    			if (dirty & /*currentList*/ 2) adder_changes.currentList = /*currentList*/ ctx[1];

    			if (!updating_list && dirty & /*todosList*/ 1) {
    				updating_list = true;
    				adder_changes.list = /*todosList*/ ctx[0];
    				add_flush_callback(() => updating_list = false);
    			}

    			adder.$set(adder_changes);
    			const list_1_changes = {};
    			if (dirty & /*currentList*/ 2) list_1_changes.currentList = /*currentList*/ ctx[1];

    			if (!updating_todos && dirty & /*todosList*/ 1) {
    				updating_todos = true;
    				list_1_changes.todos = /*todosList*/ ctx[0];
    				add_flush_callback(() => updating_todos = false);
    			}

    			list_1.$set(list_1_changes);
    			const lists_changes = {};

    			if (!updating_todos_1 && dirty & /*todosList*/ 1) {
    				updating_todos_1 = true;
    				lists_changes.todos = /*todosList*/ ctx[0];
    				add_flush_callback(() => updating_todos_1 = false);
    			}

    			if (!updating_currentList && dirty & /*currentList*/ 2) {
    				updating_currentList = true;
    				lists_changes.currentList = /*currentList*/ ctx[1];
    				add_flush_callback(() => updating_currentList = false);
    			}

    			lists.$set(lists_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(adder.$$.fragment, local);
    			transition_in(list_1.$$.fragment, local);
    			transition_in(lists.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(adder.$$.fragment, local);
    			transition_out(list_1.$$.fragment, local);
    			transition_out(lists.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			destroy_component(adder);
    			destroy_component(list_1);
    			destroy_component(lists);
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
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

    const __version = "v1.9.1";

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

    	// let currentList = 'default';
    	var currentList = "default";

    	var page = "list";

    	function test() {
    		page = page == "list" ? "listOptions" : "list";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function adder_list_binding(value) {
    		todosList = value;
    		$$invalidate(0, todosList);
    	}

    	function list_1_todos_binding(value) {
    		todosList = value;
    		$$invalidate(0, todosList);
    	}

    	function lists_todos_binding(value) {
    		todosList = value;
    		$$invalidate(0, todosList);
    	}

    	function lists_currentList_binding(value) {
    		currentList = value;
    		$$invalidate(1, currentList);
    	}

    	$$self.$capture_state = () => ({
    		List: DisplayList,
    		Adder,
    		Navbar,
    		Footer,
    		Lists,
    		list,
    		todosList,
    		storeList,
    		__version,
    		currentList,
    		page,
    		test
    	});

    	$$self.$inject_state = $$props => {
    		if ("list" in $$props) list = $$props.list;
    		if ("todosList" in $$props) $$invalidate(0, todosList = $$props.todosList);
    		if ("currentList" in $$props) $$invalidate(1, currentList = $$props.currentList);
    		if ("page" in $$props) page = $$props.page;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todosList,
    		currentList,
    		storeList,
    		test,
    		adder_list_binding,
    		list_1_todos_binding,
    		lists_todos_binding,
    		lists_currentList_binding
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
