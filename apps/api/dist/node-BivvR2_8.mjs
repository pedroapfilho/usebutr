import { i as __exportAll, n as __commonJSMin, s as __toESM, t as require_react } from "./react-BTFHglfO.mjs";
import { Writable } from "node:stream";
//#region ../../node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region ../../node_modules/react/cjs/react-jsx-runtime.development.js
/**
* @license React
* react-jsx-runtime.development.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_development = /* @__PURE__ */ __commonJSMin(((exports) => {
	"production" !== process.env.NODE_ENV && (function() {
		function getComponentNameFromType(type) {
			if (null == type) return null;
			if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
			if ("string" === typeof type) return type;
			switch (type) {
				case REACT_FRAGMENT_TYPE: return "Fragment";
				case REACT_PROFILER_TYPE: return "Profiler";
				case REACT_STRICT_MODE_TYPE: return "StrictMode";
				case REACT_SUSPENSE_TYPE: return "Suspense";
				case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
				case REACT_ACTIVITY_TYPE: return "Activity";
			}
			if ("object" === typeof type) switch ("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof) {
				case REACT_PORTAL_TYPE: return "Portal";
				case REACT_CONTEXT_TYPE: return type.displayName || "Context";
				case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
				case REACT_FORWARD_REF_TYPE:
					var innerType = type.render;
					type = type.displayName;
					type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
					return type;
				case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
				case REACT_LAZY_TYPE:
					innerType = type._payload;
					type = type._init;
					try {
						return getComponentNameFromType(type(innerType));
					} catch (x) {}
			}
			return null;
		}
		function testStringCoercion(value) {
			return "" + value;
		}
		function checkKeyStringCoercion(value) {
			try {
				testStringCoercion(value);
				var JSCompiler_inline_result = !1;
			} catch (e) {
				JSCompiler_inline_result = !0;
			}
			if (JSCompiler_inline_result) {
				JSCompiler_inline_result = console;
				var JSCompiler_temp_const = JSCompiler_inline_result.error;
				var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
				JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
				return testStringCoercion(value);
			}
		}
		function getTaskName(type) {
			if (type === REACT_FRAGMENT_TYPE) return "<>";
			if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
			try {
				var name = getComponentNameFromType(type);
				return name ? "<" + name + ">" : "<...>";
			} catch (x) {
				return "<...>";
			}
		}
		function getOwner() {
			var dispatcher = ReactSharedInternals.A;
			return null === dispatcher ? null : dispatcher.getOwner();
		}
		function UnknownOwner() {
			return Error("react-stack-top-frame");
		}
		function hasValidKey(config) {
			if (hasOwnProperty.call(config, "key")) {
				var getter = Object.getOwnPropertyDescriptor(config, "key").get;
				if (getter && getter.isReactWarning) return !1;
			}
			return void 0 !== config.key;
		}
		function defineKeyPropWarningGetter(props, displayName) {
			function warnAboutAccessingKey() {
				specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
			}
			warnAboutAccessingKey.isReactWarning = !0;
			Object.defineProperty(props, "key", {
				get: warnAboutAccessingKey,
				configurable: !0
			});
		}
		function elementRefGetterWithDeprecationWarning() {
			var componentName = getComponentNameFromType(this.type);
			didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
			componentName = this.props.ref;
			return void 0 !== componentName ? componentName : null;
		}
		function ReactElement(type, key, props, owner, debugStack, debugTask) {
			var refProp = props.ref;
			type = {
				$$typeof: REACT_ELEMENT_TYPE,
				type,
				key,
				props,
				_owner: owner
			};
			null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
				enumerable: !1,
				get: elementRefGetterWithDeprecationWarning
			}) : Object.defineProperty(type, "ref", {
				enumerable: !1,
				value: null
			});
			type._store = {};
			Object.defineProperty(type._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			});
			Object.defineProperty(type, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			});
			Object.defineProperty(type, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugStack
			});
			Object.defineProperty(type, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: debugTask
			});
			Object.freeze && (Object.freeze(type.props), Object.freeze(type));
			return type;
		}
		function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
			var children = config.children;
			if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
				for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++) validateChildKeys(children[isStaticChildren]);
				Object.freeze && Object.freeze(children);
			} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
			else validateChildKeys(children);
			if (hasOwnProperty.call(config, "key")) {
				children = getComponentNameFromType(type);
				var keys = Object.keys(config).filter(function(k) {
					return "key" !== k;
				});
				isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
				didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
			}
			children = null;
			void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
			hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
			if ("key" in config) {
				maybeKey = {};
				for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
			} else maybeKey = config;
			children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
			return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
		}
		function validateChildKeys(node) {
			isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
		}
		function isValidElement(object) {
			return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
		}
		var React = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
			return null;
		};
		React = { react_stack_bottom_frame: function(callStackForError) {
			return callStackForError();
		} };
		var specialPropKeyWarningShown;
		var didWarnAboutElementRef = {};
		var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
		var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
		var didWarnAboutKeySpread = {};
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.jsx = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return jsxDEVImpl(type, config, maybeKey, !1, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
		exports.jsxs = function(type, config, maybeKey) {
			var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
			return jsxDEVImpl(type, config, maybeKey, !0, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
		};
	})();
}));
//#endregion
//#region ../../node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	if (process.env.NODE_ENV === "production") module.exports = require_react_jsx_runtime_production();
	else module.exports = require_react_jsx_runtime_development();
}));
//#endregion
//#region ../../node_modules/prettier/plugins/html.mjs
var html_exports = /* @__PURE__ */ __exportAll({
	default: () => Ji,
	languages: () => Vi,
	options: () => Wi,
	parsers: () => Nr$1,
	printers: () => qo$1
});
var Lr$1 = Object.defineProperty;
var Pr$1 = (e) => {
	throw TypeError(e);
};
var Zi = (e, t, r) => t in e ? Lr$1(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: r
}) : e[t] = r;
var Or$1 = (e, t) => {
	for (var r in t) Lr$1(e, r, {
		get: t[r],
		enumerable: !0
	});
};
var Ut$1 = (e, t, r) => Zi(e, typeof t != "symbol" ? t + "" : t, r), es = (e, t, r) => t.has(e) || Pr$1("Cannot " + r);
var Fe$1 = (e, t, r) => (es(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Dr$1 = (e, t, r) => t.has(e) ? Pr$1("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r);
var Ji = {};
Or$1(Ji, {
	languages: () => Vi,
	options: () => Wi,
	parsers: () => Nr$1,
	printers: () => qo$1
});
var ve$1 = (e, t) => (r, n, ...i) => r | 1 && n == null ? void 0 : (t.call(n) ?? n[e]).apply(n, i);
var ts = String.prototype.replaceAll ?? function(e, t) {
	return e.global ? this.replace(e, t) : this.split(e).join(t);
}, w$1 = ve$1("replaceAll", function() {
	if (typeof this == "string") return ts;
});
function ns(e) {
	return this[e < 0 ? this.length + e : e];
}
var M$1 = ve$1("at", function() {
	if (Array.isArray(this) || typeof this == "string") return ns;
});
var ss = () => {}, He$1 = ss;
var Ve = "string", Ue$1 = "array", lt$1 = "cursor", Te = "indent", be$1 = "align", ct$1 = "trim", we$1 = "group", ke$1 = "fill", xe$1 = "if-break", ye$1 = "indent-if-break", ut$1 = "line-suffix", pt$1 = "line-suffix-boundary", $$1 = "line", ht$1 = "label", Ae$1 = "break-parent", mt$1 = new Set([
	lt$1,
	Te,
	be$1,
	ct$1,
	we$1,
	ke$1,
	xe$1,
	ye$1,
	ut$1,
	pt$1,
	$$1,
	ht$1,
	Ae$1
]);
function as(e) {
	if (typeof e == "string") return Ve;
	if (Array.isArray(e)) return Ue$1;
	if (!e) return;
	let { type: t } = e;
	if (mt$1.has(t)) return t;
}
var ft$1 = as;
var os = (e) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e);
function ls(e) {
	let t = e === null ? "null" : typeof e;
	if (t !== "string" && t !== "object") return `Unexpected doc '${t}', 
Expected it to be 'string' or 'object'.`;
	if (ft$1(e)) throw new Error("doc is valid.");
	let r = Object.prototype.toString.call(e);
	if (r !== "[object Object]") return `Unexpected doc '${r}'.`;
	let n = os([...mt$1].map((i) => `'${i}'`));
	return `Unexpected doc.type '${e.type}'.
Expected it to be ${n}.`;
}
var Wt$1 = class extends Error {
	name = "InvalidDocError";
	constructor(t) {
		super(ls(t)), this.doc = t;
	}
}, Ir$1 = Wt$1;
function Gt$1(e, t) {
	if (typeof e == "string") return t(e);
	let r = /* @__PURE__ */ new Map();
	return n(e);
	function n(s) {
		if (r.has(s)) return r.get(s);
		let a = i(s);
		return r.set(s, a), a;
	}
	function i(s) {
		switch (ft$1(s)) {
			case Ue$1: return t(s.map(n));
			case ke$1: return t({
				...s,
				parts: s.parts.map(n)
			});
			case xe$1: return t({
				...s,
				breakContents: n(s.breakContents),
				flatContents: n(s.flatContents)
			});
			case we$1: {
				let { expandedStates: a, contents: o } = s;
				return a ? (a = a.map(n), o = a[0]) : o = n(o), t({
					...s,
					contents: o,
					expandedStates: a
				});
			}
			case be$1:
			case Te:
			case ye$1:
			case ht$1:
			case ut$1: return t({
				...s,
				contents: n(s.contents)
			});
			case Ve:
			case lt$1:
			case ct$1:
			case pt$1:
			case $$1:
			case Ae$1: return t(s);
			default: throw new Ir$1(s);
		}
	}
}
function L$1(e, t = Rr$1) {
	return Gt$1(e, (r) => typeof r == "string" ? B$1(t, r.split(`
`)) : r);
}
var D = He$1, dt$1 = He$1, Mr$1 = He$1, Br$1 = He$1;
function A(e) {
	return D(e), {
		type: Te,
		contents: e
	};
}
function cs(e, t) {
	return Br$1(e), D(t), {
		type: be$1,
		contents: t,
		n: e
	};
}
function qr$1(e) {
	return cs(Number.NEGATIVE_INFINITY, e);
}
var Y$1 = { type: Ae$1 };
function gt$1(e) {
	return Mr$1(e), {
		type: ke$1,
		parts: e
	};
}
function E(e, t = {}) {
	return D(e), dt$1(t.expandedStates, !0), {
		type: we$1,
		id: t.id,
		contents: e,
		break: !!t.shouldBreak,
		expandedStates: t.expandedStates
	};
}
function j$1(e, t = "", r = {}) {
	return D(e), t !== "" && D(t), {
		type: xe$1,
		breakContents: e,
		flatContents: t,
		groupId: r.groupId
	};
}
function Fr$1(e, t) {
	return D(e), {
		type: ye$1,
		contents: e,
		groupId: t.groupId,
		negate: t.negate
	};
}
function B$1(e, t) {
	D(e), dt$1(t);
	let r = [];
	for (let n = 0; n < t.length; n++) n !== 0 && r.push(e), r.push(t[n]);
	return r;
}
var S$1 = { type: $$1 }, k$1 = {
	type: $$1,
	soft: !0
}, C = [{
	type: $$1,
	hard: !0
}, Y$1], Rr$1 = [{
	type: $$1,
	hard: !0,
	literal: !0
}, Y$1];
var Hr$1 = Object.freeze({
	character: "'",
	codePoint: 39
}), Vr$1 = Object.freeze({
	character: "\"",
	codePoint: 34
}), hs = Object.freeze({
	preferred: Hr$1,
	alternate: Vr$1
}), ms = Object.freeze({
	preferred: Vr$1,
	alternate: Hr$1
});
function fs(e, t) {
	let { preferred: r, alternate: n } = t === !0 || t === "'" ? hs : ms, { length: i } = e, s = 0, a = 0;
	for (let o = 0; o < i; o++) {
		let c = e.charCodeAt(o);
		c === r.codePoint ? s++ : c === n.codePoint && a++;
	}
	return (s > a ? n : r).character;
}
var Ur$1 = fs;
function zt$1(e) {
	if (typeof e != "string") throw new TypeError("Expected a string");
	return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
var $t$1 = class {
	#e;
	constructor(t) {
		this.#e = new Set(t);
	}
	getLeadingWhitespaceCount(t) {
		let r = this.#e, n = 0;
		for (let i = 0; i < t.length && r.has(t.charAt(i)); i++) n++;
		return n;
	}
	getTrailingWhitespaceCount(t) {
		let r = this.#e, n = 0;
		for (let i = t.length - 1; i >= 0 && r.has(t.charAt(i)); i--) n++;
		return n;
	}
	getLeadingWhitespace(t) {
		let r = this.getLeadingWhitespaceCount(t);
		return t.slice(0, r);
	}
	getTrailingWhitespace(t) {
		let r = this.getTrailingWhitespaceCount(t);
		return t.slice(t.length - r);
	}
	hasLeadingWhitespace(t) {
		return this.#e.has(t.charAt(0));
	}
	hasTrailingWhitespace(t) {
		return this.#e.has(M$1(0, t, -1));
	}
	trimStart(t) {
		let r = this.getLeadingWhitespaceCount(t);
		return t.slice(r);
	}
	trimEnd(t) {
		let r = this.getTrailingWhitespaceCount(t);
		return t.slice(0, t.length - r);
	}
	trim(t) {
		return this.trimEnd(this.trimStart(t));
	}
	split(t, r = !1) {
		let n = `[${zt$1([...this.#e].join(""))}]+`, i = new RegExp(r ? `(${n})` : n, "u");
		return t.split(i);
	}
	hasWhitespaceCharacter(t) {
		let r = this.#e;
		return Array.prototype.some.call(t, (n) => r.has(n));
	}
	hasNonWhitespaceCharacter(t) {
		let r = this.#e;
		return Array.prototype.some.call(t, (n) => !r.has(n));
	}
	isWhitespaceOnly(t) {
		let r = this.#e;
		return Array.prototype.every.call(t, (n) => r.has(n));
	}
	#t(t) {
		let r = Number.POSITIVE_INFINITY;
		for (let n of t.split(`
`)) {
			if (n.length === 0) continue;
			let i = this.getLeadingWhitespaceCount(n);
			if (i === 0) return 0;
			n.length !== i && i < r && (r = i);
		}
		return r === Number.POSITIVE_INFINITY ? 0 : r;
	}
	dedentString(t) {
		let r = this.#t(t);
		return r === 0 ? t : t.split(`
`).map((n) => n.slice(r)).join(`
`);
	}
};
var N$1 = new $t$1([
	"	",
	`
`,
	"\f",
	"\r",
	" "
]);
var Yt$1 = class extends Error {
	name = "UnexpectedNodeError";
	constructor(t, r, n = "type") {
		super(`Unexpected ${r} node ${n}: ${JSON.stringify(t[n])}.`), this.node = t;
	}
}, Gr$1 = Yt$1;
var _s = new Set([
	"sourceSpan",
	"startSourceSpan",
	"endSourceSpan",
	"nameSpan",
	"valueSpan",
	"keySpan",
	"tagDefinition",
	"tokens",
	"valueTokens",
	"switchValueSourceSpan",
	"expSourceSpan",
	"valueSourceSpan"
]), Ss = new Set([
	"if",
	"else if",
	"for",
	"switch",
	"case"
]);
function zr$1(e, t, r) {
	if (e.kind === "text" || e.kind === "comment") return null;
	if (e.kind === "yaml" && delete t.value, e.kind === "attribute") {
		let { fullName: n, value: i } = e;
		n === "style" || n === "class" || n === "srcset" && (r.fullName === "img" || r.fullName === "source") || n === "allow" && r.fullName === "iframe" || n.startsWith("on") || n.startsWith("@") || n.startsWith(":") || n.startsWith(".") || n.startsWith("#") || n.startsWith("v-") || n === "vars" && r.fullName === "style" || (n === "setup" || n === "generic") && r.fullName === "script" || n === "slot-scope" || n.startsWith("(") || n.startsWith("[") || n.startsWith("*") || n.startsWith("bind") || n.startsWith("i18n") || n.startsWith("on-") || n.startsWith("ng-") || i?.includes("{{") ? delete t.value : i && (t.value = w$1(0, i, /'|&quot;|&apos;/gu, "\""));
	}
	if (e.kind === "docType" && (t.value = w$1(0, e.value.toLowerCase(), /\s+/gu, " ")), e.kind === "angularControlFlowBlock" && e.parameters?.children) for (let n of t.parameters.children) Ss.has(e.name) ? delete n.expression : n.expression = n.expression.trim();
	e.kind === "angularIcuExpression" && (t.switchValue = e.switchValue.trim()), e.kind === "angularLetDeclarationInitializer" && delete t.value, e.kind === "element" && e.isVoid && !e.isSelfClosing && (t.isSelfClosing = !0);
}
zr$1.ignoredProperties = _s;
var $r$1 = zr$1;
function X$1(e, t = !0) {
	return [A([k$1, e]), t ? k$1 : ""];
}
function V$2(e, t) {
	let r = e.type === "NGRoot" ? e.node.type === "NGMicrosyntax" && e.node.body.length === 1 && e.node.body[0].type === "NGMicrosyntaxExpression" ? e.node.body[0].expression : e.node : e.type === "JsExpressionRoot" ? e.node : e;
	return r && (r.type === "ObjectExpression" || r.type === "ArrayExpression" || (t.parser === "__vue_expression" || t.parser === "__vue_ts_expression" || t.parser === "__ng_binding" || t.parser === "__ng_directive") && (r.type === "TemplateLiteral" || r.type === "StringLiteral"));
}
async function x$1(e, t, r, n) {
	r = {
		__isInHtmlAttribute: !0,
		__embeddedInHtml: !0,
		...r
	};
	let i = !0;
	n && (r.__onHtmlBindingRoot = (a, o) => {
		i = n(a, o);
	});
	let s = await t(e, r, t);
	return i ? E(s) : X$1(s);
}
function Es(e, t, r, n) {
	let { node: i } = r, s = n.originalText.slice(i.sourceSpan.start.offset, i.sourceSpan.end.offset);
	return /^\s*$/u.test(s) ? "" : x$1(s, e, {
		parser: "__ng_directive",
		__isInHtmlAttribute: !1
	}, V$2);
}
var Yr$1 = Es;
var Cs = Array.prototype.toReversed ?? function() {
	return [...this].reverse();
}, jr$1 = ve$1("toReversed", function() {
	if (Array.isArray(this)) return Cs;
});
function Ts() {
	let e = globalThis, t = e.Deno?.build?.os;
	return typeof t == "string" ? t === "windows" : e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? !1;
}
var bs = Ts();
function Xr$1(e) {
	if (e = e instanceof URL ? e : new URL(e), e.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
	return e;
}
function ws$1(e) {
	return e = Xr$1(e), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function ks(e) {
	e = Xr$1(e);
	let t = decodeURIComponent(e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
	return e.hostname !== "" && (t = `\\\\${e.hostname}${t}`), t;
}
function jt$1(e) {
	return bs ? ks(e) : ws$1(e);
}
var Kr$1 = (e) => String(e).split(/[/\\]/u).pop(), Qr$1 = (e) => String(e).startsWith("file:");
function xs(e) {
	return Array.isArray(e) && e.length > 0;
}
var Ne$1 = xs;
function Jr$1(e, t) {
	if (!t) return;
	let r = Kr$1(t).toLowerCase();
	return e.find(({ filenames: n }) => n?.some((i) => i.toLowerCase() === r)) ?? e.find(({ extensions: n }) => n?.some((i) => r.endsWith(i)));
}
function ys(e, t) {
	if (t) return e.find(({ name: r }) => r.toLowerCase() === t) ?? e.find(({ aliases: r }) => r?.includes(t)) ?? e.find(({ extensions: r }) => r?.includes(`.${t}`));
}
var As = void 0;
function Zr$1(e, t) {
	if (t) {
		if (Qr$1(t)) try {
			t = jt$1(t);
		} catch {
			return;
		}
		if (typeof t == "string") return e.find(({ isSupported: r }) => r?.({ filepath: t }));
	}
}
function Ns(e, t) {
	let r = jr$1(0, e.plugins).flatMap((i) => i.languages ?? []);
	return (ys(r, t.language) ?? Jr$1(r, t.physicalFile) ?? Jr$1(r, t.file) ?? Zr$1(r, t.physicalFile) ?? Zr$1(r, t.file) ?? As?.(r, t.physicalFile))?.parsers[0];
}
var _t = Ns;
var St = Symbol.for("PRETTIER_IS_FRONT_MATTER");
function Ls(e) {
	return !!e?.[St];
}
var ie$1 = Ls;
var We$1 = 3;
function Ps(e) {
	let t = e.slice(0, We$1);
	if (t !== "---" && t !== "+++") return;
	let r = e.indexOf(`
`, We$1);
	if (r === -1) return;
	let n = e.slice(We$1, r).trim(), i = e.indexOf(`
${t}`, r), s = n;
	if (s || (s = t === "+++" ? "toml" : "yaml"), i === -1 && t === "---" && s === "yaml" && (i = e.indexOf(`
...`, r)), i === -1) return;
	let a = i + 1 + We$1, o = e.charAt(a + 1);
	if (!/\s?/u.test(o)) return;
	let c = e.slice(0, a), u;
	return {
		language: s,
		explicitLanguage: n || null,
		value: e.slice(r + 1, i),
		startDelimiter: t,
		endDelimiter: c.slice(-We$1),
		raw: c,
		start: {
			line: 1,
			column: 0,
			index: 0
		},
		end: {
			index: c.length,
			get line() {
				return u ?? (u = c.split(`
`)), u.length;
			},
			get column() {
				return u ?? (u = c.split(`
`)), M$1(0, u, -1).length;
			}
		},
		[St]: !0
	};
}
function Os(e) {
	let t = Ps(e);
	return t ? {
		frontMatter: t,
		get content() {
			let { raw: r } = t;
			return w$1(0, r, /[^\n]/gu, " ") + e.slice(r.length);
		}
	} : { content: e };
}
var Xt$1 = Os;
var en$1 = "inline", Kt$1 = {
	area: "none",
	base: "none",
	basefont: "none",
	datalist: "none",
	head: "none",
	link: "none",
	meta: "none",
	noembed: "none",
	noframes: "none",
	param: "block",
	rp: "none",
	script: "block",
	style: "none",
	template: "inline",
	title: "none",
	html: "block",
	body: "block",
	address: "block",
	blockquote: "block",
	center: "block",
	dialog: "block",
	div: "block",
	figure: "block",
	figcaption: "block",
	footer: "block",
	form: "block",
	header: "block",
	hr: "block",
	legend: "block",
	listing: "block",
	main: "block",
	p: "block",
	plaintext: "block",
	pre: "block",
	search: "block",
	xmp: "block",
	slot: "contents",
	ruby: "ruby",
	rt: "ruby-text",
	article: "block",
	aside: "block",
	h1: "block",
	h2: "block",
	h3: "block",
	h4: "block",
	h5: "block",
	h6: "block",
	hgroup: "block",
	nav: "block",
	section: "block",
	dir: "block",
	dd: "block",
	dl: "block",
	dt: "block",
	menu: "block",
	ol: "block",
	ul: "block",
	li: "list-item",
	table: "table",
	caption: "table-caption",
	colgroup: "table-column-group",
	col: "table-column",
	thead: "table-header-group",
	tbody: "table-row-group",
	tfoot: "table-footer-group",
	tr: "table-row",
	td: "table-cell",
	th: "table-cell",
	input: "inline-block",
	button: "inline-block",
	fieldset: "block",
	details: "block",
	summary: "block",
	marquee: "inline-block",
	select: "inline-block",
	source: "block",
	track: "block",
	meter: "inline-block",
	progress: "inline-block",
	object: "inline-block",
	video: "inline-block",
	audio: "inline-block",
	option: "block",
	optgroup: "block"
}, tn$1 = "normal", Qt$1 = {
	listing: "pre",
	plaintext: "pre",
	pre: "pre",
	xmp: "pre",
	nobr: "nowrap",
	table: "initial",
	textarea: "pre-wrap"
};
function Ds(e) {
	return e.kind === "element" && !e.hasExplicitNamespace && !["html", "svg"].includes(e.namespace);
}
var se$1 = Ds;
var Is = (e) => w$1(0, e, /^[\t\f\r ]*\n/gu, ""), Jt$1 = (e) => Is(N$1.trimEnd(e)), rn$1 = (e) => {
	let t = e, r = N$1.getLeadingWhitespace(t);
	r && (t = t.slice(r.length));
	let n = N$1.getTrailingWhitespace(t);
	return n && (t = t.slice(0, -n.length)), {
		leadingWhitespace: r,
		trailingWhitespace: n,
		text: t
	};
};
function Et$1(e, t) {
	return !!(e.kind === "ieConditionalComment" && e.lastChild && !e.lastChild.isSelfClosing && !e.lastChild.endSourceSpan || e.kind === "ieConditionalComment" && !e.complete || ae$1(e) && e.children.some((r) => r.kind !== "text" && r.kind !== "interpolation") || Tt(e, t) && !q$1(e, t) && e.kind !== "interpolation");
}
function oe$1(e) {
	return e.kind === "attribute" || !e.parent || !e.prev ? !1 : Rs(e.prev);
}
function Rs(e) {
	return e.kind === "comment" && e.value.trim() === "prettier-ignore";
}
function O$1(e) {
	return e.kind === "text" || e.kind === "comment";
}
function q$1(e, t) {
	return e.kind === "element" && (e.fullName === "script" || e.fullName === "style" || e.fullName === "svg:style" || e.fullName === "svg:script" || e.fullName === "mj-style" && t.parser === "mjml" || se$1(e) && (e.name === "script" || e.name === "style"));
}
function nn$1(e, t) {
	return e.children && !q$1(e, t);
}
function sn$1(e, t) {
	return q$1(e, t) || e.kind === "interpolation" || Zt$1(e);
}
function Zt$1(e) {
	return gn$1(e).startsWith("pre");
}
function an$1(e, t) {
	let r = n();
	if (r && !e.prev && e.parent?.tagDefinition?.ignoreFirstLf) return e.kind === "interpolation";
	return r;
	function n() {
		return ie$1(e) || e.kind === "angularControlFlowBlock" ? !1 : (e.kind === "text" || e.kind === "interpolation") && e.prev && (e.prev.kind === "text" || e.prev.kind === "interpolation") ? !0 : !e.parent || e.parent.cssDisplay === "none" ? !1 : ae$1(e.parent) ? !0 : !(!e.prev && (e.parent.kind === "root" || ae$1(e) && e.parent || q$1(e.parent, t) || $e(e.parent, t) || !Vs(e.parent.cssDisplay)) || e.prev && !Gs(e.prev.cssDisplay));
	}
}
function on$1(e, t) {
	return ie$1(e) || e.kind === "angularControlFlowBlock" ? !1 : (e.kind === "text" || e.kind === "interpolation") && e.next && (e.next.kind === "text" || e.next.kind === "interpolation") ? !0 : !e.parent || e.parent.cssDisplay === "none" ? !1 : ae$1(e.parent) ? !0 : !(!e.next && (e.parent.kind === "root" || ae$1(e) && e.parent || q$1(e.parent, t) || $e(e.parent, t) || !Us(e.parent.cssDisplay)) || e.next && !Ws(e.next.cssDisplay));
}
function ln(e, t) {
	return zs(e.cssDisplay) && !q$1(e, t);
}
function Ge$1(e) {
	return ie$1(e) || e.next && e.sourceSpan.end && e.sourceSpan.end.line + 1 < e.next.sourceSpan.start.line;
}
function cn(e) {
	return er$1(e) || e.kind === "element" && e.children.length > 0 && ([
		"body",
		"script",
		"style"
	].includes(e.name) || e.children.some((t) => Bs(t))) || e.firstChild && e.firstChild === e.lastChild && e.firstChild.kind !== "text" && pn$1(e.firstChild) && (!e.lastChild.isTrailingSpaceSensitive || hn$1(e.lastChild));
}
function er$1(e) {
	return e.kind === "element" && e.children.length > 0 && ([
		"html",
		"head",
		"ul",
		"ol",
		"select"
	].includes(e.name) || e.cssDisplay.startsWith("table") && e.cssDisplay !== "table-cell");
}
function Ct$1(e) {
	return mn$1(e) || e.prev && Ms(e.prev) || un$1(e);
}
function Ms(e) {
	return mn$1(e) || e.kind === "element" && e.fullName === "br" || un$1(e);
}
function un$1(e) {
	return pn$1(e) && hn$1(e);
}
function pn$1(e) {
	return e.hasLeadingSpaces && (e.prev ? e.prev.sourceSpan.end.line < e.sourceSpan.start.line : e.parent.kind === "root" || e.parent.startSourceSpan.end.line < e.sourceSpan.start.line);
}
function hn$1(e) {
	return e.hasTrailingSpaces && (e.next ? e.next.sourceSpan.start.line > e.sourceSpan.end.line : e.parent.kind === "root" || e.parent.endSourceSpan && e.parent.endSourceSpan.start.line > e.sourceSpan.end.line);
}
function mn$1(e) {
	switch (e.kind) {
		case "ieConditionalComment":
		case "comment":
		case "directive": return !0;
		case "element": return ["script", "select"].includes(e.name);
	}
	return !1;
}
function vt(e) {
	return e.lastChild ? vt(e.lastChild) : e;
}
function Bs(e) {
	return e.children?.some((t) => t.kind !== "text");
}
function fn(e) {
	if (e) switch (e) {
		case "module":
		case "text/javascript":
		case "text/babel":
		case "text/jsx":
		case "application/javascript": return "babel";
		case "application/x-typescript": return "typescript";
		case "text/markdown": return "markdown";
		case "text/html": return "html";
		case "text/x-handlebars-template": return "glimmer";
		default: if (e.endsWith("json") || e.endsWith("importmap") || e === "speculationrules") return "json";
	}
}
function qs(e, t) {
	let { name: r, attrMap: n } = e;
	if (r !== "script" || Object.prototype.hasOwnProperty.call(n, "src")) return;
	let { type: i, lang: s } = e.attrMap;
	return !s && !i ? "babel" : _t(t, { language: s }) ?? fn(i);
}
function Fs(e, t) {
	if (!Tt(e, t)) return;
	let { attrMap: r } = e;
	if (Object.prototype.hasOwnProperty.call(r, "src")) return;
	let { type: n, lang: i } = r;
	return _t(t, { language: i }) ?? fn(n);
}
function Hs(e, t) {
	if (e.name === "style") {
		let { lang: r } = e.attrMap;
		return r ? _t(t, { language: r }) : "css";
	}
	if (e.name === "mj-style" && t.parser === "mjml") return "css";
}
function tr$1(e, t) {
	return qs(e, t) ?? Hs(e, t) ?? Fs(e, t);
}
function ze$1(e) {
	return e === "block" || e === "list-item" || e.startsWith("table");
}
function Vs(e) {
	return !ze$1(e) && e !== "inline-block";
}
function Us(e) {
	return !ze$1(e) && e !== "inline-block";
}
function Ws(e) {
	return !ze$1(e);
}
function Gs(e) {
	return !ze$1(e);
}
function zs(e) {
	return !ze$1(e) && e !== "inline-block";
}
function ae$1(e) {
	return gn$1(e).startsWith("pre");
}
function $s(e, t) {
	let r = e;
	for (; r;) {
		if (t(r)) return !0;
		r = r.parent;
	}
	return !1;
}
function dn$1(e, t) {
	if (le$1(e, t)) return "block";
	if (e.prev?.kind === "comment") {
		let n = e.prev.value.match(/^\s*display:\s*([a-z]+)\s*$/u);
		if (n) return n[1];
	}
	let r = !1;
	if (e.kind === "element" && e.namespace === "svg") if ($s(e, (n) => n.fullName === "svg:foreignObject")) r = !0;
	else return e.name === "svg" ? "inline-block" : "block";
	switch (t.htmlWhitespaceSensitivity) {
		case "strict": return "inline";
		case "ignore": return "block";
		default: if (e.kind === "element" && (!e.namespace || r || se$1(e)) && Object.prototype.hasOwnProperty.call(Kt$1, e.name)) return Kt$1[e.name];
	}
	return en$1;
}
function gn$1(e) {
	return e.kind === "element" && (!e.namespace || se$1(e)) && Object.prototype.hasOwnProperty.call(Qt$1, e.name) ? Qt$1[e.name] : tn$1;
}
function rr$1(e) {
	return w$1(0, w$1(0, e, "&apos;", "'"), "&quot;", "\"");
}
function b$1(e) {
	return rr$1(e.value);
}
var Ys = new Set([
	"template",
	"style",
	"script"
]);
function $e(e, t) {
	return le$1(e, t) && !Ys.has(e.fullName);
}
function le$1(e, t) {
	return t.parser === "vue" && e.kind === "element" && e.parent.kind === "root" && e.fullName.toLowerCase() !== "html";
}
function Tt(e, t) {
	return le$1(e, t) && ($e(e, t) || e.attrMap.lang && e.attrMap.lang !== "html");
}
function _n$1(e) {
	let t = e.fullName;
	return t.charAt(0) === "#" || t === "slot-scope" || t === "v-slot" || t.startsWith("v-slot:");
}
function Sn$1(e, t) {
	let r = e.parent;
	if (!le$1(r, t)) return !1;
	let n = r.fullName, i = e.fullName;
	return n === "script" && i === "setup" || n === "style" && i === "vars";
}
function bt(e, t = e.value) {
	return e.parent.isWhitespaceSensitive ? e.parent.isIndentationSensitive ? L$1(t) : L$1(N$1.dedentString(Jt$1(t)), C) : B$1(S$1, N$1.split(t));
}
function wt(e, t) {
	return le$1(e, t) && e.name === "script";
}
function js(e) {
	let { valueSpan: t, value: r } = e;
	return t.end.offset - t.start.offset === r.length + 2;
}
function kt$1(e, t) {
	if (js(e)) return !1;
	let { value: r } = e;
	return /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/u.test(r) || t.parser === "lwc" && r.startsWith("{") && r.endsWith("}");
}
var En$1 = /\{\{(.+?)\}\}/su, Cn$1 = ({ node: { value: e } }) => En$1.test(e);
async function vn$1(e, t, r) {
	let n = b$1(r.node), i = [];
	for (let [s, a] of n.split(En$1).entries()) if (s % 2 === 0) i.push(L$1(a));
	else try {
		i.push(E([
			"{{",
			A([S$1, await x$1(a, e, {
				parser: "__ng_interpolation",
				__isInHtmlInterpolation: !0
			})]),
			S$1,
			"}}"
		]));
	} catch {
		i.push("{{", L$1(a), "}}");
	}
	return i;
}
var nr$1 = (e) => (t, r, n) => x$1(b$1(n.node), t, { parser: e }, V$2), Xs = [
	{
		test(e) {
			let t = e.node.fullName;
			return t.startsWith("(") && t.endsWith(")") || t.startsWith("on-");
		},
		print: nr$1("__ng_action")
	},
	{
		test(e) {
			let t = e.node.fullName;
			return t.startsWith("[") && t.endsWith("]") || /^bind(?:on)?-/u.test(t) || /^ng-(?:if|show|hide|class|style)$/u.test(t);
		},
		print: nr$1("__ng_binding")
	},
	{
		test: (e) => e.node.fullName.startsWith("*"),
		print: nr$1("__ng_directive")
	},
	{
		test: (e) => /^i18n(?:-.+)?$/u.test(e.node.fullName),
		print: Ks
	},
	{
		test: Cn$1,
		print: vn$1
	}
].map(({ test: e, print: t }) => ({
	test: (r, n) => n.parser === "angular" && e(r),
	print: t
}));
function Ks(e, t, { node: r }) {
	let n = b$1(r);
	return X$1(gt$1(bt(r, n.trim())), !n.includes("@@"));
}
var Tn$1 = Xs;
var bn$1 = ({ node: e }, t) => !t.parentParser && e.fullName === "class" && !e.value.includes("{{"), wn$1 = (e, t, r) => b$1(r.node).trim().split(/\s+/u).join(" ");
var Js = new Set([
	"onabort",
	"onafterprint",
	"onauxclick",
	"onbeforeinput",
	"onbeforematch",
	"onbeforeprint",
	"onbeforetoggle",
	"onbeforeunload",
	"onblur",
	"oncancel",
	"oncanplay",
	"oncanplaythrough",
	"onchange",
	"onclick",
	"onclose",
	"oncommand",
	"oncontextlost",
	"oncontextmenu",
	"oncontextrestored",
	"oncopy",
	"oncuechange",
	"oncut",
	"ondblclick",
	"ondrag",
	"ondragend",
	"ondragenter",
	"ondragleave",
	"ondragover",
	"ondragstart",
	"ondrop",
	"ondurationchange",
	"onemptied",
	"onended",
	"onerror",
	"onfocus",
	"onformdata",
	"onhashchange",
	"oninput",
	"oninvalid",
	"onkeydown",
	"onkeypress",
	"onkeyup",
	"onlanguagechange",
	"onload",
	"onloadeddata",
	"onloadedmetadata",
	"onloadstart",
	"onmessage",
	"onmessageerror",
	"onmousedown",
	"onmouseenter",
	"onmouseleave",
	"onmousemove",
	"onmouseout",
	"onmouseover",
	"onmouseup",
	"onoffline",
	"ononline",
	"onpagehide",
	"onpagereveal",
	"onpageshow",
	"onpageswap",
	"onpaste",
	"onpause",
	"onplay",
	"onplaying",
	"onpopstate",
	"onprogress",
	"onratechange",
	"onrejectionhandled",
	"onreset",
	"onresize",
	"onscroll",
	"onscrollend",
	"onsecuritypolicyviolation",
	"onseeked",
	"onseeking",
	"onselect",
	"onslotchange",
	"onstalled",
	"onstorage",
	"onsubmit",
	"onsuspend",
	"ontimeupdate",
	"ontoggle",
	"onunhandledrejection",
	"onunload",
	"onvolumechange",
	"onwaiting",
	"onwheel"
]), kn$1 = ({ node: e }, t) => Js.has(e.fullName) && !t.parentParser && !e.value.includes("{{"), xn$1 = (e, t, r) => x$1(b$1(r.node), e, {
	parser: "babel",
	__isHtmlInlineEventHandler: !0
}, () => !1);
function Zs(e) {
	let t = [];
	for (let r of e.split(";")) {
		if (r = N$1.trim(r), !r) continue;
		let [n, ...i] = N$1.split(r);
		t.push({
			name: n,
			value: i
		});
	}
	return t;
}
var yn$1 = Zs;
var An$1 = ({ node: e }, t) => e.fullName === "allow" && !t.parentParser && e.parent.fullName === "iframe" && !e.value.includes("{{");
function Nn$1(e, t, r) {
	let { node: n } = r, i = yn$1(b$1(n));
	return i.length === 0 ? [""] : X$1(i.map(({ name: s, value: a }, o) => [[s, ...a].join(" "), o === i.length - 1 ? j$1(";") : [";", S$1]]));
}
function Ln$1(e) {
	return e === "	" || e === `
` || e === "\f" || e === "\r" || e === " ";
}
var ea$1 = /^[ \t\n\r\u000c]+/, ta$1 = /^[, \t\n\r\u000c]+/, ra$1 = /^[^ \t\n\r\u000c]+/, na$1 = /[,]+$/, Pn$1 = /^\d+$/, ia$1 = /^-?(?:[0-9]+|[0-9]*\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
function sa$1(e) {
	let t = e.length, r, n, i, s, a, o = 0, c;
	function u(m) {
		let _, T = m.exec(e.substring(o));
		if (T) return [_] = T, o += _.length, _;
	}
	let p = [];
	for (;;) {
		if (u(ta$1), o >= t) {
			if (p.length === 0) throw new Error("Must contain one or more image candidate strings.");
			return p;
		}
		c = o, r = u(ra$1), n = [], r.slice(-1) === "," ? (r = r.replace(na$1, ""), g()) : d();
	}
	function d() {
		for (u(ea$1), i = "", s = "in descriptor";;) {
			if (a = e.charAt(o), s === "in descriptor") if (Ln$1(a)) i && (n.push(i), i = "", s = "after descriptor");
			else if (a === ",") {
				o += 1, i && n.push(i), g();
				return;
			} else if (a === "(") i += a, s = "in parens";
			else if (a === "") {
				i && n.push(i), g();
				return;
			} else i += a;
			else if (s === "in parens") if (a === ")") i += a, s = "in descriptor";
			else if (a === "") {
				n.push(i), g();
				return;
			} else i += a;
			else if (s === "after descriptor" && !Ln$1(a)) if (a === "") {
				g();
				return;
			} else s = "in descriptor", o -= 1;
			o += 1;
		}
	}
	function g() {
		let m = !1, _, T, P, z, ne = {}, Q, ot, Ce, qe, Vt;
		for (z = 0; z < n.length; z++) Q = n[z], ot = Q[Q.length - 1], Ce = Q.substring(0, Q.length - 1), qe = parseInt(Ce, 10), Vt = parseFloat(Ce), Pn$1.test(Ce) && ot === "w" ? ((_ || T) && (m = !0), qe === 0 ? m = !0 : _ = qe) : ia$1.test(Ce) && ot === "x" ? ((_ || T || P) && (m = !0), Vt < 0 ? m = !0 : T = Vt) : Pn$1.test(Ce) && ot === "h" ? ((P || T) && (m = !0), qe === 0 ? m = !0 : P = qe) : m = !0;
		if (!m) ne.source = {
			value: r,
			startOffset: c
		}, _ && (ne.width = { value: _ }), T && (ne.density = { value: T }), P && (ne.height = { value: P }), p.push(ne);
		else throw new Error(`Invalid srcset descriptor found in "${e}" at "${Q}".`);
	}
}
var On$1 = sa$1;
var Dn$1 = (e) => e.node.fullName === "srcset" && (e.parent.fullName === "img" || e.parent.fullName === "source"), In$1 = {
	width: "w",
	height: "h",
	density: "x"
}, aa = Object.keys(In$1);
function Rn$1(e, t, r) {
	let i = On$1(b$1(r.node)), s = aa.filter((m) => i.some((_) => Object.prototype.hasOwnProperty.call(_, m)));
	if (s.length > 1) throw new Error("Mixed descriptor in srcset is not supported");
	let [a] = s, o = In$1[a], c = i.map((m) => m.source.value), u = Math.max(...c.map((m) => m.length)), p = i.map((m) => m[a] ? String(m[a].value) : ""), d = p.map((m) => {
		let _ = m.indexOf(".");
		return _ === -1 ? m.length : _;
	}), g = Math.max(...d);
	return X$1(B$1([",", S$1], c.map((m, _) => {
		let T = [m], P = p[_];
		if (P) {
			let z = u - m.length + 1, ne = g - d[_], Q = " ".repeat(z + ne);
			T.push(j$1(Q, " "), P + o);
		}
		return T;
	})));
}
var Mn$1 = ({ node: e }, t) => e.fullName === "style" && !t.parentParser && !e.value.includes("{{"), Bn$1 = async (e, t, r) => X$1(await e(b$1(r.node), {
	parser: "css",
	__isHTMLStyleAttribute: !0
}));
var sr$1 = /* @__PURE__ */ new WeakMap();
function oa$1(e, t) {
	let { root: r } = e;
	return sr$1.has(r) || sr$1.set(r, r.children.some((n) => wt(n, t) && ["ts", "typescript"].includes(n.attrMap.lang))), sr$1.get(r);
}
var U$1 = oa$1;
function qn(e, t, r) {
	return x$1(`type T<${b$1(r.node)}> = any`, e, {
		parser: "babel-ts",
		__isEmbeddedTypescriptGenericParameters: !0
	}, V$2);
}
function Fn$1(e, t, r, n) {
	let i = b$1(r.node), s = U$1(r, n) ? "babel-ts" : "babel";
	return x$1(`function _(${i}) {}`, e, {
		parser: s,
		__isVueBindings: !0
	});
}
async function Hn$1(e, t, r, n) {
	let { left: s, operator: a, right: o } = la$1(b$1(r.node)), c = U$1(r, n);
	return [
		E(await x$1(`function _(${s}) {}`, e, {
			parser: c ? "babel-ts" : "babel",
			__isVueForBindingLeft: !0
		})),
		" ",
		a,
		" ",
		await x$1(o, e, { parser: c ? "__ts_expression" : "__js_expression" })
	];
}
function la$1(e) {
	let t = /(.*?)\s+(in|of)\s+(.*)/su, r = /,([^,\]}]*)(?:,([^,\]}]*))?$/u, n = /^\(|\)$/gu, i = e.match(t);
	if (!i) return;
	let s = { for: i[3].trim() };
	if (!s.for) return;
	let a = w$1(0, i[1].trim(), n, ""), o = a.match(r);
	o ? (s.alias = a.replace(r, ""), s.iterator1 = o[1].trim(), o[2] && (s.iterator2 = o[2].trim())) : s.alias = a;
	let c = [
		s.alias,
		s.iterator1,
		s.iterator2
	];
	if (!c.some((u, p) => !u && (p === 0 || c.slice(p + 1).some(Boolean)))) return {
		left: c.filter(Boolean).join(","),
		operator: i[2],
		right: s.for
	};
}
var ca$1 = [
	{
		test: (e) => e.node.fullName === "v-for",
		print: Hn$1
	},
	{
		test: (e, t) => e.node.fullName === "generic" && wt(e.parent, t),
		print: qn
	},
	{
		test: ({ node: e }, t) => _n$1(e) || Sn$1(e, t),
		print: Fn$1
	},
	{
		test(e) {
			let t = e.node.fullName;
			return t.startsWith("@") || t.startsWith("v-on:");
		},
		print: ua$1
	},
	{
		test(e) {
			let t = e.node.fullName;
			return t.startsWith(":") || t.startsWith(".") || t.startsWith("v-bind:");
		},
		print: pa$1
	},
	{
		test: (e) => e.node.fullName.startsWith("v-"),
		print: Vn$1
	}
].map(({ test: e, print: t }) => ({
	test: (r, n) => n.parser === "vue" && e(r, n),
	print: t
}));
async function ua$1(e, t, r, n) {
	try {
		return await Vn$1(e, t, r, n);
	} catch (a) {
		if (a.cause?.code !== "BABEL_PARSER_SYNTAX_ERROR") throw a;
	}
	return x$1(b$1(r.node), e, { parser: U$1(r, n) ? "__vue_ts_event_binding" : "__vue_event_binding" }, V$2);
}
function pa$1(e, t, r, n) {
	return x$1(b$1(r.node), e, { parser: U$1(r, n) ? "__vue_ts_expression" : "__vue_expression" }, V$2);
}
function Vn$1(e, t, r, n) {
	return x$1(b$1(r.node), e, { parser: U$1(r, n) ? "__ts_expression" : "__js_expression" }, V$2);
}
var ha$1 = [
	{
		test: Dn$1,
		print: Rn$1
	},
	{
		test: Mn$1,
		print: Bn$1
	},
	{
		test: kn$1,
		print: xn$1
	},
	{
		test: bn$1,
		print: wn$1
	},
	{
		test: An$1,
		print: Nn$1
	},
	...ca$1,
	...Tn$1
].map(({ test: e, print: t }) => ({
	test: e,
	print: fa(t)
}));
function ma$1(e, t) {
	let { node: r } = e, { value: n } = r;
	if (n) return kt$1(r, t) ? [
		r.rawName,
		"=",
		n
	] : ha$1.find(({ test: i }) => i(e, t))?.print;
}
function fa(e) {
	return async (t, r, n, i) => {
		let s = await e(t, r, n, i);
		if (s) return s = Gt$1(s, (a) => typeof a == "string" ? w$1(0, a, "\"", "&quot;") : a), [
			n.node.rawName,
			"=\"",
			E(s),
			"\""
		];
	};
}
var Wn$1 = ma$1;
var K$1 = (e) => e.sourceSpan.start.offset, J = (e) => e.sourceSpan.end.offset;
function Ye$1(e, t) {
	return [e.isSelfClosing ? "" : da$1(e, t), ce$1(e, t)];
}
function da$1(e, t) {
	return e.lastChild && he$1(e.lastChild) ? "" : [ga$1(e, t), xt(e, t)];
}
function ce$1(e, t) {
	return (e.next ? W$1(e.next) : pe(e.parent)) ? "" : [ue$1(e, t), F(e, t)];
}
function ga$1(e, t) {
	return pe(e) ? ue$1(e.lastChild, t) : "";
}
function F(e, t) {
	return he$1(e) ? xt(e.parent, t) : je$1(e) ? yt(e.next, t) : "";
}
function xt(e, t) {
	if (zn$1(e, t)) return "";
	switch (e.kind) {
		case "ieConditionalComment": return "<!";
		case "element": if (e.hasHtmComponentClosingTag) return "<//";
		default: return `</${e.rawName}`;
	}
}
function ue$1(e, t) {
	if (zn$1(e, t)) return "";
	switch (e.kind) {
		case "ieConditionalComment":
		case "ieConditionalEndComment": return "[endif]-->";
		case "ieConditionalStartComment": return "]><!-->";
		case "interpolation": return "}}";
		case "angularIcuExpression": return "}";
		case "element": if (e.isSelfClosing) return "/>";
		default: return ">";
	}
}
function zn$1(e, t) {
	return !e.isSelfClosing && !e.endSourceSpan && (oe$1(e) || Et$1(e.parent, t));
}
function W$1(e) {
	return e.prev && e.prev.kind !== "docType" && e.kind !== "angularControlFlowBlock" && !O$1(e.prev) && e.isLeadingSpaceSensitive && !e.hasLeadingSpaces;
}
function pe(e) {
	return e.lastChild?.isTrailingSpaceSensitive && !e.lastChild.hasTrailingSpaces && !O$1(vt(e.lastChild)) && !ae$1(e);
}
function he$1(e) {
	return !e.next && !e.hasTrailingSpaces && e.isTrailingSpaceSensitive && O$1(vt(e));
}
function je$1(e) {
	return e.next && !O$1(e.next) && O$1(e) && e.isTrailingSpaceSensitive && !e.hasTrailingSpaces;
}
function _a$2(e) {
	let t = e.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/su);
	return t ? t[1] ? t[1].split(/\s+/u) : !0 : !1;
}
function Xe$1(e) {
	return !e.prev && e.isLeadingSpaceSensitive && !e.hasLeadingSpaces;
}
function Sa$1(e, t, r) {
	let { node: n } = e;
	if (!Ne$1(n.attrs)) return n.isSelfClosing ? " " : "";
	let i = n.prev?.kind === "comment" && _a$2(n.prev.value), s = typeof i == "boolean" ? () => i : Array.isArray(i) ? (d) => i.includes(d.rawName) : () => !1, a = e.map(({ node: d }) => s(d) ? L$1(t.originalText.slice(K$1(d), J(d))) : r(), "attrs"), o = n.kind === "element" && n.fullName === "script" && n.attrs.length === 1 && n.attrs[0].fullName === "src" && n.children.length === 0, u = t.singleAttributePerLine && n.attrs.length > 1 && !le$1(n, t) ? C : S$1, p = [A([o ? " " : S$1, B$1(u, a)])];
	return n.firstChild && Xe$1(n.firstChild) || n.isSelfClosing && pe(n.parent) || o ? p.push(n.isSelfClosing ? " " : "") : p.push(t.bracketSameLine ? n.isSelfClosing ? " " : "" : n.isSelfClosing ? S$1 : k$1), p;
}
function Ea$1(e) {
	return e.firstChild && Xe$1(e.firstChild) ? "" : At(e);
}
function Ke(e, t, r) {
	let { node: n } = e;
	return [
		me$1(n, t),
		Sa$1(e, t, r),
		n.isSelfClosing ? "" : Ea$1(n)
	];
}
function me$1(e, t) {
	return e.prev && je$1(e.prev) ? "" : [H$1(e, t), yt(e, t)];
}
function H$1(e, t) {
	return Xe$1(e) ? At(e.parent) : W$1(e) ? ue$1(e.prev, t) : "";
}
var Gn$1 = "<!doctype";
function yt(e, t) {
	switch (e.kind) {
		case "ieConditionalComment":
		case "ieConditionalStartComment": return `<!--[if ${e.condition}`;
		case "ieConditionalEndComment": return "<!--<!";
		case "interpolation": return "{{";
		case "docType": {
			if (e.value === "html") {
				let { filepath: n } = t;
				if (n && /\.html?$/u.test(n)) return Gn$1;
			}
			let r = K$1(e);
			return t.originalText.slice(r, r + Gn$1.length);
		}
		case "angularIcuExpression": return "{";
		case "element": if (e.condition) return `<!--[if ${e.condition}]><!--><${e.rawName}`;
		default: return `<${e.rawName}`;
	}
}
function At(e) {
	switch (e.kind) {
		case "ieConditionalComment": return "]>";
		case "element": if (e.condition) return "><!--<![endif]-->";
		default: return ">";
	}
}
function Ca(e, t) {
	if (!e.endSourceSpan) return "";
	let r = e.startSourceSpan.end.offset;
	e.firstChild && Xe$1(e.firstChild) && (r -= At(e).length);
	let n = e.endSourceSpan.start.offset;
	return e.lastChild && he$1(e.lastChild) ? n += xt(e, t).length : pe(e) && (n -= ue$1(e.lastChild, t).length), t.originalText.slice(r, n);
}
var Nt = Ca;
var va$1 = new Set([
	"if",
	"else if",
	"for",
	"switch",
	"case"
]);
function Ta$1(e, t) {
	let { node: r } = e;
	switch (r.kind) {
		case "element":
			if (q$1(r, t) || r.kind === "interpolation") return;
			if (!r.isSelfClosing && Tt(r, t)) {
				let n = tr$1(r, t);
				return n ? async (i, s) => {
					let a = Nt(r, t), o = /^\s*$/u.test(a), c = "";
					return o || (c = await i(Jt$1(a), {
						parser: n,
						__embeddedInHtml: !0
					}), o = c === ""), [
						H$1(r, t),
						E(Ke(e, t, s)),
						o ? "" : C,
						c,
						o ? "" : C,
						Ye$1(r, t),
						F(r, t)
					];
				} : void 0;
			}
			break;
		case "text":
			if (q$1(r.parent, t)) {
				let n = tr$1(r.parent, t);
				if (n) return async (i) => {
					let s = n === "markdown" ? N$1.dedentString(r.value.replace(/^[^\S\n]*\n/u, "")) : r.value, a = {
						parser: n,
						__embeddedInHtml: !0
					};
					if (t.parser === "html" && n === "babel") {
						let o = "script", { attrMap: c } = r.parent;
						c && (c.type === "module" || (c.type === "text/babel" || c.type === "text/jsx") && c["data-type"] === "module") && (o = "module"), a.__babelSourceType = o;
					}
					return [
						Y$1,
						H$1(r, t),
						await i(s, a),
						F(r, t)
					];
				};
			} else if (r.parent.kind === "interpolation") return async (n) => {
				let i = {
					__isInHtmlInterpolation: !0,
					__embeddedInHtml: !0
				};
				return t.parser === "angular" ? i.parser = "__ng_interpolation" : t.parser === "vue" ? i.parser = U$1(e, t) ? "__vue_ts_expression" : "__vue_expression" : i.parser = "__js_expression", [A([S$1, await n(r.value, i)]), r.parent.next && W$1(r.parent.next) ? " " : S$1];
			};
			break;
		case "attribute": return Wn$1(e, t);
		case "angularControlFlowBlockParameters": return va$1.has(e.parent.name) ? Yr$1 : void 0;
		case "angularLetDeclarationInitializer": return (n) => x$1(r.value, n, {
			parser: "__ng_binding",
			__isInHtmlAttribute: !1
		});
	}
}
var $n$1 = Ta$1;
var Qe$1 = null;
function Je$1(e) {
	if (Qe$1 !== null && typeof Qe$1.property) {
		let t = Qe$1;
		return Qe$1 = Je$1.prototype = null, t;
	}
	return Qe$1 = Je$1.prototype = e ?? Object.create(null), new Je$1();
}
var ba$1 = 10;
for (let e = 0; e <= ba$1; e++) Je$1();
function ar$1(e) {
	return Je$1(e);
}
function wa$1(e, t = "type") {
	ar$1(e);
	function r(n) {
		let i = n[t], s = e[i];
		if (!Array.isArray(s)) throw Object.assign(/* @__PURE__ */ new Error(`Missing visitor keys for '${i}'.`), { node: n });
		return s;
	}
	return r;
}
var Yn$1 = wa$1;
var I$2 = [["children"], []];
var Xn = Yn$1({
	root: I$2[0],
	element: ["attrs", "children"],
	ieConditionalComment: I$2[0],
	ieConditionalStartComment: I$2[1],
	ieConditionalEndComment: I$2[1],
	interpolation: I$2[0],
	text: I$2[0],
	docType: I$2[1],
	comment: I$2[1],
	attribute: I$2[1],
	cdata: I$2[1],
	angularControlFlowBlock: ["children", "parameters"],
	angularControlFlowBlockParameters: I$2[0],
	angularControlFlowBlockParameter: I$2[1],
	angularLetDeclaration: ["init"],
	angularLetDeclarationInitializer: I$2[1],
	angularIcuExpression: ["cases"],
	angularIcuCase: ["expression"]
}, "kind");
var Kn$1 = "format";
var Qn = /^\s*<!--\s*@(?:noformat|noprettier)\s*-->/u, Jn$1 = /^\s*<!--\s*@(?:format|prettier)\s*-->/u;
var Zn$1 = (e) => Jn$1.test(e), ei$1 = (e) => Qn.test(e), ti$1 = (e) => `<!-- @${Kn$1} -->

${e}`;
var ri$1 = new Map([
	["if", new Set(["else if", "else"])],
	["else if", new Set(["else if", "else"])],
	["for", new Set(["empty"])],
	["defer", new Set([
		"placeholder",
		"error",
		"loading"
	])],
	["placeholder", new Set([
		"placeholder",
		"error",
		"loading"
	])],
	["error", new Set([
		"placeholder",
		"error",
		"loading"
	])],
	["loading", new Set([
		"placeholder",
		"error",
		"loading"
	])]
]);
function ni$1(e) {
	let t = J(e);
	return e.kind === "element" && !e.endSourceSpan && Ne$1(e.children) ? Math.max(t, ni$1(M$1(0, e.children, -1))) : t;
}
function Ze$1(e, t, r) {
	let n = e.node;
	if (oe$1(n)) {
		let i = ni$1(n);
		return [
			H$1(n, t),
			L$1(N$1.trimEnd(t.originalText.slice(K$1(n) + (n.prev && je$1(n.prev) ? yt(n).length : 0), i - (n.next && W$1(n.next) ? ue$1(n, t).length : 0)))),
			F(n, t)
		];
	}
	return r();
}
function Lt(e, t) {
	return O$1(e) && O$1(t) ? e.isTrailingSpaceSensitive ? e.hasTrailingSpaces ? Ct$1(t) ? C : S$1 : "" : Ct$1(t) ? C : k$1 : je$1(e) && (oe$1(t) || t.firstChild || t.isSelfClosing || t.kind === "element" && t.attrs.length > 0) || e.kind === "element" && e.isSelfClosing && W$1(t) ? "" : !t.isLeadingSpaceSensitive || Ct$1(t) || W$1(t) && e.lastChild && he$1(e.lastChild) && e.lastChild.lastChild && he$1(e.lastChild.lastChild) ? C : t.hasLeadingSpaces ? S$1 : k$1;
}
function Le$1(e, t, r) {
	let { node: n } = e;
	if (er$1(n)) return [Y$1, ...e.map(() => {
		let s = e.node, a = s.prev ? Lt(s.prev, s) : "";
		return [a ? [a, Ge$1(s.prev) ? C : ""] : "", Ze$1(e, t, r)];
	}, "children")];
	let i = n.children.map(() => Symbol(""));
	return e.map(({ node: s, index: a }) => {
		if (O$1(s)) {
			if (s.prev && O$1(s.prev)) {
				let m = Lt(s.prev, s);
				if (m) return Ge$1(s.prev) ? [
					C,
					C,
					Ze$1(e, t, r)
				] : [m, Ze$1(e, t, r)];
			}
			return Ze$1(e, t, r);
		}
		let o = [], c = [], u = [], p = [], d = s.prev ? Lt(s.prev, s) : "", g = s.next ? Lt(s, s.next) : "";
		return d && (Ge$1(s.prev) ? o.push(C, C) : d === C ? o.push(C) : O$1(s.prev) ? c.push(d) : c.push(j$1("", k$1, { groupId: i[a - 1] }))), g && (Ge$1(s) ? O$1(s.next) && p.push(C, C) : g === C ? O$1(s.next) && p.push(C) : u.push(g)), [
			...o,
			E([...c, E([Ze$1(e, t, r), ...u], { id: i[a] })]),
			...p
		];
	}, "children");
}
function ii$1(e, t, r) {
	let { node: n } = e, i = [];
	if (Na$1(e) && i.push("} "), i.push("@", n.name), ya$1(n)) return i.push(";"), i;
	if (n.parameters && i.push(" (", E(r("parameters")), ")"), !Aa(n)) {
		i.push(" {");
		let s = si$1(n);
		n.children.length > 0 ? (n.firstChild.hasLeadingSpaces = !0, n.lastChild.hasTrailingSpaces = !0, i.push(A([C, Le$1(e, t, r)])), s && i.push(C, "}")) : s && i.push("}");
	}
	return E(i, { shouldBreak: !0 });
}
function si$1(e) {
	return !(e.next?.kind === "angularControlFlowBlock" && ri$1.get(e.name)?.has(e.next.name));
}
var xa$1 = (e) => e?.kind === "angularControlFlowBlock" && (e.name === "case" || e.name === "default"), ya$1 = (e) => e?.kind === "angularControlFlowBlock" && e.name === "default never";
function Aa(e) {
	return xa$1(e) && e.endSourceSpan && e.endSourceSpan.start.offset === e.endSourceSpan.end.offset;
}
function Na$1(e) {
	let { previous: t } = e;
	return t?.kind === "angularControlFlowBlock" && !oe$1(t) && !si$1(t);
}
function ai$1(e, t, r) {
	return [A([k$1, B$1([";", S$1], e.map(r, "children"))]), k$1];
}
function oi$1(e, t, r) {
	let { node: n } = e;
	return [
		me$1(n, t),
		E([
			n.switchValue.trim(),
			", ",
			n.type,
			n.cases.length > 0 ? [",", A([S$1, B$1(S$1, e.map(r, "cases"))])] : "",
			k$1
		]),
		ce$1(n, t)
	];
}
function li$1(e, t, r) {
	let { node: n } = e;
	return [
		n.value,
		" {",
		E([A([k$1, e.map(({ node: i, isLast: s }) => {
			let a = [r()];
			return i.kind === "text" && (i.hasLeadingSpaces && a.unshift(S$1), i.hasTrailingSpaces && !s && a.push(S$1)), a;
		}, "expression")]), k$1]),
		"}"
	];
}
function ci$1(e, t, r) {
	let { node: n } = e;
	if (Et$1(n, t)) return [
		H$1(n, t),
		E(Ke(e, t, r)),
		L$1(Nt(n, t)),
		...Ye$1(n, t),
		F(n, t)
	];
	let i = n.children.length === 1 && (n.firstChild.kind === "interpolation" || n.firstChild.kind === "angularIcuExpression") && n.firstChild.isLeadingSpaceSensitive && !n.firstChild.hasLeadingSpaces && n.lastChild.isTrailingSpaceSensitive && !n.lastChild.hasTrailingSpaces, s = Symbol("element-attr-group-id"), a = (p) => E([
		E(Ke(e, t, r), { id: s }),
		p,
		Ye$1(n, t)
	]), o = (p) => i ? Fr$1(p, { groupId: s }) : (q$1(n, t) || $e(n, t)) && n.parent.kind === "root" && t.parser === "vue" && !t.vueIndentScriptAndStyle ? p : A(p), c = () => i ? j$1(k$1, "", { groupId: s }) : n.firstChild.hasLeadingSpaces && n.firstChild.isLeadingSpaceSensitive ? S$1 : n.firstChild.kind === "text" && n.isWhitespaceSensitive && n.isIndentationSensitive ? qr$1(k$1) : k$1, u = () => (n.next ? W$1(n.next) : pe(n.parent)) ? n.lastChild.hasTrailingSpaces && n.lastChild.isTrailingSpaceSensitive ? " " : "" : i ? j$1(k$1, "", { groupId: s }) : n.lastChild.hasTrailingSpaces && n.lastChild.isTrailingSpaceSensitive ? S$1 : (n.lastChild.kind === "comment" || n.lastChild.kind === "text" && n.isWhitespaceSensitive && n.isIndentationSensitive) && new RegExp(`\\n[\\t ]{${t.tabWidth * (e.ancestors.length - 1)}}$`, "u").test(n.lastChild.value) ? "" : k$1;
	return n.children.length === 0 ? a(n.hasDanglingSpaces && n.isDanglingSpaceSensitive ? S$1 : "") : a([
		cn(n) ? Y$1 : "",
		o([c(), Le$1(e, t, r)]),
		u()
	]);
}
var R$1 = (function(e) {
	return e[e.RAW_TEXT = 0] = "RAW_TEXT", e[e.ESCAPABLE_RAW_TEXT = 1] = "ESCAPABLE_RAW_TEXT", e[e.PARSABLE_DATA = 2] = "PARSABLE_DATA", e;
})({});
function et$1(e, t = !0) {
	if (e[0] != ":") return [null, e];
	let r = e.indexOf(":", 1);
	if (r === -1) {
		if (t) throw new Error(`Unsupported format "${e}" expecting ":namespace:name"`);
		return [null, e];
	}
	return [e.slice(1, r), e.slice(r + 1)];
}
function or$1(e) {
	return et$1(e)[1] === "ng-container";
}
function lr$1(e) {
	return et$1(e)[1] === "ng-content";
}
function Pe$1(e) {
	return e === null ? null : et$1(e)[0];
}
function fe$1(e, t) {
	return e ? `:${e}:${t}` : t;
}
var cr$1 = { name: "custom-elements" }, ur$1 = { name: "no-errors-schema" }, Z$1 = (function(e) {
	return e[e.NONE = 0] = "NONE", e[e.HTML = 1] = "HTML", e[e.STYLE = 2] = "STYLE", e[e.SCRIPT = 3] = "SCRIPT", e[e.URL = 4] = "URL", e[e.RESOURCE_URL = 5] = "RESOURCE_URL", e[e.ATTRIBUTE_NO_BINDING = 6] = "ATTRIBUTE_NO_BINDING", e;
})({});
var La$1 = /-+([a-z0-9])/g;
function ui$1(e) {
	return e.replace(La$1, (...t) => t[1].toUpperCase());
}
var Pt;
function pr$1() {
	return Pt || (Pt = {}, tt$1(Z$1.HTML, [
		"iframe|srcdoc",
		"*|innerHTML",
		"*|outerHTML"
	]), tt$1(Z$1.STYLE, ["*|style"]), tt$1(Z$1.URL, [
		"*|formAction",
		"area|href",
		"a|href",
		"a|xlink:href",
		"form|action",
		"annotation|href",
		"annotation|xlink:href",
		"annotation-xml|href",
		"annotation-xml|xlink:href",
		"maction|href",
		"maction|xlink:href",
		"malignmark|href",
		"malignmark|xlink:href",
		"math|href",
		"math|xlink:href",
		"mroot|href",
		"mroot|xlink:href",
		"msqrt|href",
		"msqrt|xlink:href",
		"merror|href",
		"merror|xlink:href",
		"mfrac|href",
		"mfrac|xlink:href",
		"mglyph|href",
		"mglyph|xlink:href",
		"msub|href",
		"msub|xlink:href",
		"msup|href",
		"msup|xlink:href",
		"msubsup|href",
		"msubsup|xlink:href",
		"mmultiscripts|href",
		"mmultiscripts|xlink:href",
		"mprescripts|href",
		"mprescripts|xlink:href",
		"mi|href",
		"mi|xlink:href",
		"mn|href",
		"mn|xlink:href",
		"mo|href",
		"mo|xlink:href",
		"mpadded|href",
		"mpadded|xlink:href",
		"mphantom|href",
		"mphantom|xlink:href",
		"mrow|href",
		"mrow|xlink:href",
		"ms|href",
		"ms|xlink:href",
		"mspace|href",
		"mspace|xlink:href",
		"mstyle|href",
		"mstyle|xlink:href",
		"mtable|href",
		"mtable|xlink:href",
		"mtd|href",
		"mtd|xlink:href",
		"mtr|href",
		"mtr|xlink:href",
		"mtext|href",
		"mtext|xlink:href",
		"mover|href",
		"mover|xlink:href",
		"munder|href",
		"munder|xlink:href",
		"munderover|href",
		"munderover|xlink:href",
		"semantics|href",
		"semantics|xlink:href",
		"none|href",
		"none|xlink:href",
		"img|src",
		"video|src"
	]), tt$1(Z$1.RESOURCE_URL, [
		"base|href",
		"embed|src",
		"frame|src",
		"iframe|src",
		"link|href",
		"object|codebase",
		"object|data",
		"script|src",
		"script|href",
		"script|xlink:href"
	]), tt$1(Z$1.ATTRIBUTE_NO_BINDING, [
		"animate|attributeName",
		"animate|values",
		"animate|to",
		"animate|from",
		"set|to",
		"set|attributeName",
		"animateMotion|attributeName",
		"animateTransform|attributeName",
		"unknown|attributeName",
		"unknown|values",
		"unknown|to",
		"unknown|from",
		"iframe|sandbox",
		"iframe|allow",
		"iframe|allowFullscreen",
		"iframe|referrerPolicy",
		"iframe|csp",
		"iframe|fetchPriority",
		"unknown|sandbox",
		"unknown|allow",
		"unknown|allowFullscreen",
		"unknown|referrerPolicy",
		"unknown|csp",
		"unknown|fetchPriority"
	])), Pt;
}
function tt$1(e, t) {
	for (let r of t) Pt[r.toLowerCase()] = e;
}
var pi = class {};
var Pa$1 = "boolean", Oa$1 = "number", Da$1 = "string", Ia = "object", Ra$1 = [
	"[Element]|textContent,%ariaActiveDescendantElement,%ariaAtomic,%ariaAutoComplete,%ariaBusy,%ariaChecked,%ariaColCount,%ariaColIndex,%ariaColIndexText,%ariaColSpan,%ariaControlsElements,%ariaCurrent,%ariaDescribedByElements,%ariaDescription,%ariaDetailsElements,%ariaDisabled,%ariaErrorMessageElements,%ariaExpanded,%ariaFlowToElements,%ariaHasPopup,%ariaHidden,%ariaInvalid,%ariaKeyShortcuts,%ariaLabel,%ariaLabelledByElements,%ariaLevel,%ariaLive,%ariaModal,%ariaMultiLine,%ariaMultiSelectable,%ariaOrientation,%ariaOwnsElements,%ariaPlaceholder,%ariaPosInSet,%ariaPressed,%ariaReadOnly,%ariaRelevant,%ariaRequired,%ariaRoleDescription,%ariaRowCount,%ariaRowIndex,%ariaRowIndexText,%ariaRowSpan,%ariaSelected,%ariaSetSize,%ariaSort,%ariaValueMax,%ariaValueMin,%ariaValueNow,%ariaValueText,%classList,className,elementTiming,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*fullscreenchange,*fullscreenerror,*search,*webkitfullscreenchange,*webkitfullscreenerror,outerHTML,%part,#scrollLeft,#scrollTop,slot,*message,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored",
	"[HTMLElement]^[Element]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,!inert,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy",
	"abbr,address,article,aside,b,bdi,bdo,cite,content,code,dd,dfn,dt,em,figcaption,figure,footer,header,hgroup,i,kbd,main,mark,nav,noscript,rb,rp,rt,rtc,ruby,s,samp,search,section,small,strong,sub,sup,u,var,wbr^[HTMLElement]|accessKey,autocapitalize,!autofocus,contentEditable,dir,!draggable,enterKeyHint,!hidden,innerText,inputMode,lang,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate,virtualKeyboardPolicy",
	"media^[HTMLElement]|!autoplay,!controls,%controlsList,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,*waitingforkey,#playbackRate,preload,!preservesPitch,src,%srcObject,#volume",
	":svg:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex",
	":svg:graphics^:svg:|",
	":svg:animation^:svg:|*begin,*end,*repeat",
	":svg:geometry^:svg:|",
	":svg:componentTransferFunction^:svg:|",
	":svg:gradient^:svg:|",
	":svg:textContent^:svg:graphics|",
	":svg:textPositioning^:svg:textContent|",
	"a^[HTMLElement]|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,rev,search,shape,target,text,type,username",
	"area^[HTMLElement]|alt,coords,download,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,referrerPolicy,rel,%relList,search,shape,target,username",
	"audio^media|",
	"br^[HTMLElement]|clear",
	"base^[HTMLElement]|href,target",
	"body^[HTMLElement]|aLink,background,bgColor,link,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink",
	"button^[HTMLElement]|!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value",
	"canvas^[HTMLElement]|#height,#width",
	"content^[HTMLElement]|select",
	"dl^[HTMLElement]|!compact",
	"data^[HTMLElement]|value",
	"datalist^[HTMLElement]|",
	"details^[HTMLElement]|!open",
	"dialog^[HTMLElement]|!open,returnValue",
	"dir^[HTMLElement]|!compact",
	"div^[HTMLElement]|align",
	"embed^[HTMLElement]|align,height,name,src,type,width",
	"fieldset^[HTMLElement]|!disabled,name",
	"font^[HTMLElement]|color,face,size",
	"form^[HTMLElement]|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target",
	"frame^[HTMLElement]|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src",
	"frameset^[HTMLElement]|cols,*afterprint,*beforeprint,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*messageerror,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows",
	"geolocation^[HTMLElement]|accuracymode,!autolocate,*location,*promptaction,*promptdismiss,*validationstatuschange,!watch",
	"hr^[HTMLElement]|align,color,!noShade,size,width",
	"head^[HTMLElement]|",
	"h1,h2,h3,h4,h5,h6^[HTMLElement]|align",
	"html^[HTMLElement]|version",
	"iframe^[HTMLElement]|align,allow,!allowFullscreen,!allowPaymentRequest,csp,frameBorder,height,loading,longDesc,marginHeight,marginWidth,name,referrerPolicy,%sandbox,scrolling,src,srcdoc,width",
	"img^[HTMLElement]|align,alt,border,%crossOrigin,decoding,#height,#hspace,!isMap,loading,longDesc,lowsrc,name,referrerPolicy,sizes,src,srcset,useMap,#vspace,#width",
	"input^[HTMLElement]|accept,align,alt,autocomplete,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width",
	"li^[HTMLElement]|type,#value",
	"label^[HTMLElement]|htmlFor",
	"legend^[HTMLElement]|align",
	"link^[HTMLElement]|as,charset,%crossOrigin,!disabled,href,hreflang,imageSizes,imageSrcset,integrity,media,referrerPolicy,rel,%relList,rev,%sizes,target,type",
	"map^[HTMLElement]|name",
	"marquee^[HTMLElement]|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width",
	"menu^[HTMLElement]|!compact",
	"meta^[HTMLElement]|content,httpEquiv,media,name,scheme",
	"meter^[HTMLElement]|#high,#low,#max,#min,#optimum,#value",
	"ins,del^[HTMLElement]|cite,dateTime",
	"ol^[HTMLElement]|!compact,!reversed,#start,type",
	"object^[HTMLElement]|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width",
	"optgroup^[HTMLElement]|!disabled,label",
	"option^[HTMLElement]|!defaultSelected,!disabled,label,!selected,text,value",
	"output^[HTMLElement]|defaultValue,%htmlFor,name,value",
	"p^[HTMLElement]|align",
	"param^[HTMLElement]|name,type,value,valueType",
	"picture^[HTMLElement]|",
	"pre^[HTMLElement]|#width",
	"progress^[HTMLElement]|#max,#value",
	"q,blockquote,cite^[HTMLElement]|",
	"script^[HTMLElement]|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,!noModule,%referrerPolicy,src,text,type",
	"select^[HTMLElement]|autocomplete,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value",
	"selectedcontent^[HTMLElement]|",
	"slot^[HTMLElement]|name",
	"source^[HTMLElement]|#height,media,sizes,src,srcset,type,#width",
	"span^[HTMLElement]|",
	"style^[HTMLElement]|!disabled,media,type",
	"search^[HTMLELement]|",
	"caption^[HTMLElement]|align",
	"th,td^[HTMLElement]|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width",
	"col,colgroup^[HTMLElement]|align,ch,chOff,#span,vAlign,width",
	"table^[HTMLElement]|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width",
	"tr^[HTMLElement]|align,bgColor,ch,chOff,vAlign",
	"tfoot,thead,tbody^[HTMLElement]|align,ch,chOff,vAlign",
	"template^[HTMLElement]|",
	"textarea^[HTMLElement]|autocomplete,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap",
	"time^[HTMLElement]|dateTime",
	"title^[HTMLElement]|text",
	"track^[HTMLElement]|!default,kind,label,src,srclang",
	"ul^[HTMLElement]|!compact,type",
	"unknown^[HTMLElement]|",
	"video^media|!disablePictureInPicture,#height,*enterpictureinpicture,*leavepictureinpicture,!playsInline,poster,#width",
	":svg:a^:svg:graphics|",
	":svg:animate^:svg:animation|",
	":svg:animateMotion^:svg:animation|",
	":svg:animateTransform^:svg:animation|",
	":svg:circle^:svg:geometry|",
	":svg:clipPath^:svg:graphics|",
	":svg:defs^:svg:graphics|",
	":svg:desc^:svg:|",
	":svg:discard^:svg:|",
	":svg:ellipse^:svg:geometry|",
	":svg:feBlend^:svg:|",
	":svg:feColorMatrix^:svg:|",
	":svg:feComponentTransfer^:svg:|",
	":svg:feComposite^:svg:|",
	":svg:feConvolveMatrix^:svg:|",
	":svg:feDiffuseLighting^:svg:|",
	":svg:feDisplacementMap^:svg:|",
	":svg:feDistantLight^:svg:|",
	":svg:feDropShadow^:svg:|",
	":svg:feFlood^:svg:|",
	":svg:feFuncA^:svg:componentTransferFunction|",
	":svg:feFuncB^:svg:componentTransferFunction|",
	":svg:feFuncG^:svg:componentTransferFunction|",
	":svg:feFuncR^:svg:componentTransferFunction|",
	":svg:feGaussianBlur^:svg:|",
	":svg:feImage^:svg:|",
	":svg:feMerge^:svg:|",
	":svg:feMergeNode^:svg:|",
	":svg:feMorphology^:svg:|",
	":svg:feOffset^:svg:|",
	":svg:fePointLight^:svg:|",
	":svg:feSpecularLighting^:svg:|",
	":svg:feSpotLight^:svg:|",
	":svg:feTile^:svg:|",
	":svg:feTurbulence^:svg:|",
	":svg:filter^:svg:|",
	":svg:foreignObject^:svg:graphics|",
	":svg:g^:svg:graphics|",
	":svg:image^:svg:graphics|decoding",
	":svg:line^:svg:geometry|",
	":svg:linearGradient^:svg:gradient|",
	":svg:mpath^:svg:|",
	":svg:marker^:svg:|",
	":svg:mask^:svg:|",
	":svg:metadata^:svg:|",
	":svg:path^:svg:geometry|",
	":svg:pattern^:svg:|",
	":svg:polygon^:svg:geometry|",
	":svg:polyline^:svg:geometry|",
	":svg:radialGradient^:svg:gradient|",
	":svg:rect^:svg:geometry|",
	":svg:svg^:svg:graphics|#currentScale,#zoomAndPan",
	":svg:script^:svg:|type",
	":svg:set^:svg:animation|",
	":svg:stop^:svg:|",
	":svg:style^:svg:|!disabled,media,title,type",
	":svg:switch^:svg:graphics|",
	":svg:symbol^:svg:|",
	":svg:tspan^:svg:textPositioning|",
	":svg:text^:svg:textPositioning|",
	":svg:textPath^:svg:textContent|",
	":svg:title^:svg:|",
	":svg:use^:svg:graphics|",
	":svg:view^:svg:|#zoomAndPan",
	"data^[HTMLElement]|value",
	"keygen^[HTMLElement]|!autofocus,challenge,!disabled,form,keytype,name",
	"menuitem^[HTMLElement]|type,label,icon,!disabled,!checked,radiogroup,!default",
	"summary^[HTMLElement]|",
	"time^[HTMLElement]|dateTime",
	":svg:cursor^:svg:|",
	":math:^[HTMLElement]|!autofocus,nonce,*abort,*animationend,*animationiteration,*animationstart,*auxclick,*beforeinput,*beforematch,*beforetoggle,*beforexrselect,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contentvisibilityautostatechange,*contextlost,*contextmenu,*contextrestored,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*formdata,*gotpointercapture,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*lostpointercapture,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*paste,*pause,*play,*playing,*pointercancel,*pointerdown,*pointerenter,*pointerleave,*pointermove,*pointerout,*pointerover,*pointerrawupdate,*pointerup,*progress,*ratechange,*reset,*resize,*scroll,*scrollend,*securitypolicyviolation,*seeked,*seeking,*select,*selectionchange,*selectstart,*slotchange,*stalled,*submit,*suspend,*timeupdate,*toggle,*transitioncancel,*transitionend,*transitionrun,*transitionstart,*volumechange,*waiting,*webkitanimationend,*webkitanimationiteration,*webkitanimationstart,*webkittransitionend,*wheel,%style,#tabIndex",
	":math:math^:math:|",
	":math:maction^:math:|",
	":math:menclose^:math:|",
	":math:merror^:math:|",
	":math:mfenced^:math:|",
	":math:mfrac^:math:|",
	":math:mi^:math:|",
	":math:mmultiscripts^:math:|",
	":math:mn^:math:|",
	":math:mo^:math:|",
	":math:mover^:math:|",
	":math:mpadded^:math:|",
	":math:mphantom^:math:|",
	":math:mroot^:math:|",
	":math:mrow^:math:|",
	":math:ms^:math:|",
	":math:mspace^:math:|",
	":math:msqrt^:math:|",
	":math:mstyle^:math:|",
	":math:msub^:math:|",
	":math:msubsup^:math:|",
	":math:msup^:math:|",
	":math:mtable^:math:|",
	":math:mtd^:math:|",
	":math:mtext^:math:|",
	":math:mtr^:math:|",
	":math:munder^:math:|",
	":math:munderover^:math:|",
	":math:semantics^:math:|"
], hi = new Map(Object.entries({
	class: "className",
	for: "htmlFor",
	formaction: "formAction",
	innerHtml: "innerHTML",
	readonly: "readOnly",
	tabindex: "tabIndex",
	"aria-activedescendant": "ariaActiveDescendantElement",
	"aria-atomic": "ariaAtomic",
	"aria-autocomplete": "ariaAutoComplete",
	"aria-busy": "ariaBusy",
	"aria-checked": "ariaChecked",
	"aria-colcount": "ariaColCount",
	"aria-colindex": "ariaColIndex",
	"aria-colindextext": "ariaColIndexText",
	"aria-colspan": "ariaColSpan",
	"aria-controls": "ariaControlsElements",
	"aria-current": "ariaCurrent",
	"aria-describedby": "ariaDescribedByElements",
	"aria-description": "ariaDescription",
	"aria-details": "ariaDetailsElements",
	"aria-disabled": "ariaDisabled",
	"aria-errormessage": "ariaErrorMessageElements",
	"aria-expanded": "ariaExpanded",
	"aria-flowto": "ariaFlowToElements",
	"aria-haspopup": "ariaHasPopup",
	"aria-hidden": "ariaHidden",
	"aria-invalid": "ariaInvalid",
	"aria-keyshortcuts": "ariaKeyShortcuts",
	"aria-label": "ariaLabel",
	"aria-labelledby": "ariaLabelledByElements",
	"aria-level": "ariaLevel",
	"aria-live": "ariaLive",
	"aria-modal": "ariaModal",
	"aria-multiline": "ariaMultiLine",
	"aria-multiselectable": "ariaMultiSelectable",
	"aria-orientation": "ariaOrientation",
	"aria-owns": "ariaOwnsElements",
	"aria-placeholder": "ariaPlaceholder",
	"aria-posinset": "ariaPosInSet",
	"aria-pressed": "ariaPressed",
	"aria-readonly": "ariaReadOnly",
	"aria-required": "ariaRequired",
	"aria-roledescription": "ariaRoleDescription",
	"aria-rowcount": "ariaRowCount",
	"aria-rowindex": "ariaRowIndex",
	"aria-rowindextext": "ariaRowIndexText",
	"aria-rowspan": "ariaRowSpan",
	"aria-selected": "ariaSelected",
	"aria-setsize": "ariaSetSize",
	"aria-sort": "ariaSort",
	"aria-valuemax": "ariaValueMax",
	"aria-valuemin": "ariaValueMin",
	"aria-valuenow": "ariaValueNow",
	"aria-valuetext": "ariaValueText"
})), Ma$1 = Array.from(hi).reduce((e, [t, r]) => (e.set(t, r), e), /* @__PURE__ */ new Map()), mi = class extends pi {
	_schema = /* @__PURE__ */ new Map();
	_eventSchema = /* @__PURE__ */ new Map();
	constructor() {
		super(), Ra$1.forEach((e) => {
			let t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set(), [n, i] = e.split("|"), s = i.split(","), [a, o] = n.split("^");
			a.split(",").forEach((u) => {
				this._schema.set(u.toLowerCase(), t), this._eventSchema.set(u.toLowerCase(), r);
			});
			let c = o && this._schema.get(o.toLowerCase());
			if (c) {
				for (let [u, p] of c) t.set(u, p);
				for (let u of this._eventSchema.get(o.toLowerCase())) r.add(u);
			}
			s.forEach((u) => {
				if (u.length > 0) switch (u[0]) {
					case "*":
						r.add(u.substring(1));
						break;
					case "!":
						t.set(u.substring(1), Pa$1);
						break;
					case "#":
						t.set(u.substring(1), Oa$1);
						break;
					case "%":
						t.set(u.substring(1), Ia);
						break;
					default: t.set(u, Da$1);
				}
			});
		});
	}
	hasProperty(e, t, r) {
		if (r.some((n) => n.name === ur$1.name)) return !0;
		if (e.indexOf("-") > -1) {
			if (or$1(e) || lr$1(e)) return !1;
			if (r.some((n) => n.name === cr$1.name)) return !0;
		}
		return (this._schema.get(e.toLowerCase()) || this._schema.get("unknown")).has(t);
	}
	hasElement(e, t) {
		return t.some((r) => r.name === ur$1.name) || e.indexOf("-") > -1 && (or$1(e) || lr$1(e) || t.some((r) => r.name === cr$1.name)) ? !0 : this._schema.has(e.toLowerCase());
	}
	securityContext(e, t, r) {
		r && (t = this.getMappedPropName(t)), e = e.toLowerCase(), t = t.toLowerCase();
		let n = pr$1()[e + "|" + t];
		return n || (n = pr$1()["*|" + t], n || Z$1.NONE);
	}
	getMappedPropName(e) {
		return hi.get(e) ?? e;
	}
	getDefaultComponentElementName() {
		return "ng-component";
	}
	validateProperty(e) {
		return e.toLowerCase().startsWith("on") ? {
			error: !0,
			msg: `Binding to event property '${e}' is disallowed for security reasons, please use (${e.slice(2)})=...
If '${e}' is a directive input, make sure the directive is imported by the current module.`
		} : { error: !1 };
	}
	validateAttribute(e) {
		return e.toLowerCase().startsWith("on") ? {
			error: !0,
			msg: `Binding to event attribute '${e}' is disallowed for security reasons, please use (${e.slice(2)})=...`
		} : { error: !1 };
	}
	allKnownElementNames() {
		return Array.from(this._schema.keys());
	}
	allKnownAttributesOfElement(e) {
		let t = this._schema.get(e.toLowerCase()) || this._schema.get("unknown");
		return Array.from(t.keys()).map((r) => Ma$1.get(r) ?? r);
	}
	allKnownEventsOfElement(e) {
		return Array.from(this._eventSchema.get(e.toLowerCase()) ?? []);
	}
	normalizeAnimationStyleProperty(e) {
		return ui$1(e);
	}
	normalizeAnimationStyleValue(e, t, r) {
		let n = "", i = r.toString().trim(), s = null;
		if (Ba$1(e) && r !== 0 && r !== "0") if (typeof r == "number") n = "px";
		else {
			let a = r.match(/^[+-]?[\d\.]+([a-z]*)$/);
			a && a[1].length == 0 && (s = `Please provide a CSS unit value for ${t}:${r}`);
		}
		return {
			error: s,
			value: i + n
		};
	}
};
function Ba$1(e) {
	switch (e) {
		case "width":
		case "height":
		case "minWidth":
		case "minHeight":
		case "maxWidth":
		case "maxHeight":
		case "left":
		case "top":
		case "bottom":
		case "right":
		case "fontSize":
		case "outlineWidth":
		case "outlineOffset":
		case "paddingTop":
		case "paddingLeft":
		case "paddingBottom":
		case "paddingRight":
		case "marginTop":
		case "marginLeft":
		case "marginBottom":
		case "marginRight":
		case "borderRadius":
		case "borderWidth":
		case "borderTopWidth":
		case "borderLeftWidth":
		case "borderRightWidth":
		case "borderBottomWidth":
		case "textIndent": return !0;
		default: return !1;
	}
}
var f = class {
	closedByChildren = {};
	contentType;
	closedByParent = !1;
	implicitNamespacePrefix;
	isVoid;
	ignoreFirstLf;
	canSelfClose;
	preventNamespaceInheritance;
	constructor({ closedByChildren: e, implicitNamespacePrefix: t, contentType: r = R$1.PARSABLE_DATA, closedByParent: n = !1, isVoid: i = !1, ignoreFirstLf: s = !1, preventNamespaceInheritance: a = !1, canSelfClose: o = !1 } = {}) {
		e && e.length > 0 && e.forEach((c) => this.closedByChildren[c] = !0), this.isVoid = i, this.closedByParent = n || i, this.implicitNamespacePrefix = t || null, this.contentType = r, this.ignoreFirstLf = s, this.preventNamespaceInheritance = a, this.canSelfClose = o ?? i;
	}
	isClosedByChild(e) {
		return this.isVoid || e.toLowerCase() in this.closedByChildren;
	}
	getContentType(e) {
		return typeof this.contentType == "object" ? (e === void 0 ? void 0 : this.contentType[e]) ?? this.contentType.default : this.contentType;
	}
}, fi$1, rt$1;
function Oe$1(e) {
	return rt$1 || (fi$1 = new f({ canSelfClose: !0 }), rt$1 = Object.assign(Object.create(null), {
		base: new f({ isVoid: !0 }),
		meta: new f({ isVoid: !0 }),
		area: new f({ isVoid: !0 }),
		embed: new f({ isVoid: !0 }),
		link: new f({ isVoid: !0 }),
		img: new f({ isVoid: !0 }),
		input: new f({ isVoid: !0 }),
		param: new f({ isVoid: !0 }),
		hr: new f({ isVoid: !0 }),
		br: new f({ isVoid: !0 }),
		source: new f({ isVoid: !0 }),
		track: new f({ isVoid: !0 }),
		wbr: new f({ isVoid: !0 }),
		p: new f({
			closedByChildren: [
				"address",
				"article",
				"aside",
				"blockquote",
				"div",
				"dl",
				"fieldset",
				"footer",
				"form",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"header",
				"hgroup",
				"hr",
				"main",
				"nav",
				"ol",
				"p",
				"pre",
				"section",
				"table",
				"ul"
			],
			closedByParent: !0
		}),
		thead: new f({ closedByChildren: ["tbody", "tfoot"] }),
		tbody: new f({
			closedByChildren: ["tbody", "tfoot"],
			closedByParent: !0
		}),
		tfoot: new f({
			closedByChildren: ["tbody"],
			closedByParent: !0
		}),
		tr: new f({
			closedByChildren: ["tr"],
			closedByParent: !0
		}),
		td: new f({
			closedByChildren: ["td", "th"],
			closedByParent: !0
		}),
		th: new f({
			closedByChildren: ["td", "th"],
			closedByParent: !0
		}),
		col: new f({ isVoid: !0 }),
		svg: new f({ implicitNamespacePrefix: "svg" }),
		foreignObject: new f({
			implicitNamespacePrefix: "svg",
			preventNamespaceInheritance: !0
		}),
		math: new f({ implicitNamespacePrefix: "math" }),
		li: new f({
			closedByChildren: ["li"],
			closedByParent: !0
		}),
		dt: new f({ closedByChildren: ["dt", "dd"] }),
		dd: new f({
			closedByChildren: ["dt", "dd"],
			closedByParent: !0
		}),
		rb: new f({
			closedByChildren: [
				"rb",
				"rt",
				"rtc",
				"rp"
			],
			closedByParent: !0
		}),
		rt: new f({
			closedByChildren: [
				"rb",
				"rt",
				"rtc",
				"rp"
			],
			closedByParent: !0
		}),
		rtc: new f({
			closedByChildren: [
				"rb",
				"rtc",
				"rp"
			],
			closedByParent: !0
		}),
		rp: new f({
			closedByChildren: [
				"rb",
				"rt",
				"rtc",
				"rp"
			],
			closedByParent: !0
		}),
		optgroup: new f({
			closedByChildren: ["optgroup"],
			closedByParent: !0
		}),
		option: new f({
			closedByChildren: ["option", "optgroup"],
			closedByParent: !0
		}),
		pre: new f({ ignoreFirstLf: !0 }),
		listing: new f({ ignoreFirstLf: !0 }),
		style: new f({ contentType: R$1.RAW_TEXT }),
		script: new f({ contentType: R$1.RAW_TEXT }),
		title: new f({ contentType: {
			default: R$1.ESCAPABLE_RAW_TEXT,
			svg: R$1.PARSABLE_DATA
		} }),
		textarea: new f({
			contentType: R$1.ESCAPABLE_RAW_TEXT,
			ignoreFirstLf: !0
		})
	}), new mi().allKnownElementNames().forEach((t) => {
		!rt$1[t] && Pe$1(t) === null && (rt$1[t] = new f({ canSelfClose: !1 }));
	})), rt$1[e] ?? fi$1;
}
var De$1 = class gi {
	constructor(t, r, n, i) {
		this.file = t, this.offset = r, this.line = n, this.col = i;
	}
	toString() {
		return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
	}
	moveBy(t) {
		let r = this.file.content, n = r.length, i = this.offset, s = this.line, a = this.col;
		for (; i > 0 && t < 0;) if (i--, t++, r.charCodeAt(i) == 10) {
			s--;
			let o = r.substring(0, i - 1).lastIndexOf(`
`);
			a = o > 0 ? i - o : i;
		} else a--;
		for (; i < n && t > 0;) {
			let o = r.charCodeAt(i);
			i++, t--, o == 10 ? (s++, a = 0) : a++;
		}
		return new gi(this.file, i, s, a);
	}
	getContext(t, r) {
		let n = this.file.content, i = this.offset;
		if (i != null) {
			i > n.length - 1 && (i = n.length - 1);
			let s = i, a = 0, o = 0;
			for (; a < t && i > 0 && (i--, a++, !(n[i] == `
` && ++o == r)););
			for (a = 0, o = 0; a < t && s < n.length - 1 && (s++, a++, !(n[s] == `
` && ++o == r)););
			return {
				before: n.substring(i, this.offset),
				after: n.substring(this.offset, s + 1)
			};
		}
		return null;
	}
}, nt$1 = class {
	constructor(e, t) {
		this.content = e, this.url = t;
	}
}, h = class {
	constructor(e, t, r = e, n = null) {
		this.start = e, this.end = t, this.fullStart = r, this.details = n;
	}
	toString() {
		return this.start.file.content.substring(this.start.offset, this.end.offset);
	}
}, di = (function(e) {
	return e[e.WARNING = 0] = "WARNING", e[e.ERROR = 1] = "ERROR", e;
})({}), ee$1 = class extends Error {
	constructor(e, t, r = di.ERROR, n) {
		super(t), this.span = e, this.msg = t, this.level = r, this.relatedError = n, Object.setPrototypeOf(this, new.target.prototype);
	}
	contextualMessage() {
		let e = this.span.start.getContext(100, 3);
		return e ? `${this.msg} ("${e.before}[${di[this.level]} ->]${e.after}")` : this.msg;
	}
	toString() {
		let e = this.span.details ? `, ${this.span.details}` : "";
		return `${this.contextualMessage()}: ${this.span.start}${e}`;
	}
};
var de$1 = class {
	constructor(e, t) {
		this.sourceSpan = e, this.i18n = t;
	}
}, _i = class extends de$1 {
	constructor(e, t, r, n) {
		super(t, n), this.value = e, this.tokens = r;
	}
	visit(e, t) {
		return e.visitText(this, t);
	}
	kind = "text";
}, Si = class extends de$1 {
	constructor(e, t, r, n) {
		super(t, n), this.value = e, this.tokens = r;
	}
	visit(e, t) {
		return e.visitCdata(this, t);
	}
	kind = "cdata";
}, Ei = class extends de$1 {
	constructor(e, t, r, n, i, s) {
		super(n, s), this.switchValue = e, this.type = t, this.cases = r, this.switchValueSourceSpan = i;
	}
	visit(e, t) {
		return e.visitExpansion(this, t);
	}
	kind = "expansion";
}, Ci = class {
	constructor(e, t, r, n, i) {
		this.value = e, this.expression = t, this.sourceSpan = r, this.valueSourceSpan = n, this.expSourceSpan = i;
	}
	visit(e, t) {
		return e.visitExpansionCase(this, t);
	}
	kind = "expansionCase";
}, vi = class extends de$1 {
	constructor(e, t, r, n, i, s, a) {
		super(r, a), this.name = e, this.value = t, this.keySpan = n, this.valueSpan = i, this.valueTokens = s;
	}
	visit(e, t) {
		return e.visitAttribute(this, t);
	}
	kind = "attribute";
	get nameSpan() {
		return this.keySpan;
	}
}, te$1 = class extends de$1 {
	constructor(e, t, r, n, i, s, a, o = null, c = null, u, p) {
		super(s, p), this.name = e, this.attrs = t, this.directives = r, this.children = n, this.isSelfClosing = i, this.startSourceSpan = a, this.endSourceSpan = o, this.nameSpan = c, this.isVoid = u;
	}
	visit(e, t) {
		return e.visitElement(this, t);
	}
	kind = "element";
}, Ti = class {
	constructor(e, t) {
		this.value = e, this.sourceSpan = t;
	}
	visit(e, t) {
		return e.visitComment(this, t);
	}
	kind = "comment";
}, bi = class {
	constructor(e, t) {
		this.value = e, this.sourceSpan = t;
	}
	visit(e, t) {
		return e.visitDocType(this, t);
	}
	kind = "docType";
}, ge$1 = class extends de$1 {
	constructor(e, t, r, n, i, s, a = null, o) {
		super(n, o), this.name = e, this.parameters = t, this.children = r, this.nameSpan = i, this.startSourceSpan = s, this.endSourceSpan = a;
	}
	visit(e, t) {
		return e.visitBlock(this, t);
	}
	kind = "block";
}, G$1 = class extends de$1 {
	constructor(e, t, r, n, i, s, a, o, c, u = null, p) {
		super(o, p), this.componentName = e, this.tagName = t, this.fullName = r, this.attrs = n, this.directives = i, this.children = s, this.isSelfClosing = a, this.startSourceSpan = c, this.endSourceSpan = u;
	}
	visit(e, t) {
		return e.visitComponent(this, t);
	}
	kind = "component";
}, wi = class {
	constructor(e, t, r, n, i = null) {
		this.name = e, this.attrs = t, this.sourceSpan = r, this.startSourceSpan = n, this.endSourceSpan = i;
	}
	visit(e, t) {
		return e.visitDirective(this, t);
	}
	kind = "directive";
}, hr$1 = class {
	constructor(e, t) {
		this.expression = e, this.sourceSpan = t;
	}
	visit(e, t) {
		return e.visitBlockParameter(this, t);
	}
	kind = "blockParameter";
	startSourceSpan = null;
	endSourceSpan = null;
}, mr$1 = class {
	constructor(e, t, r, n, i) {
		this.name = e, this.value = t, this.sourceSpan = r, this.nameSpan = n, this.valueSpan = i;
	}
	visit(e, t) {
		return e.visitLetDeclaration(this, t);
	}
	kind = "letDeclaration";
	startSourceSpan = null;
	endSourceSpan = null;
};
function Ot(e, t, r = null) {
	let n = [], i = e.visit ? (s) => e.visit(s, r) || s.visit(e, r) : (s) => s.visit(e, r);
	return t.forEach((s) => {
		let a = i(s);
		a && n.push(a);
	}), n;
}
var fr$1 = class {
	constructor() {}
	visitElement(e, t) {
		this.visitChildren(t, (r) => {
			r(e.attrs), r(e.directives), r(e.children);
		});
	}
	visitAttribute(e, t) {}
	visitText(e, t) {}
	visitCdata(e, t) {}
	visitComment(e, t) {}
	visitDocType(e, t) {}
	visitExpansion(e, t) {
		return this.visitChildren(t, (r) => {
			r(e.cases);
		});
	}
	visitExpansionCase(e, t) {}
	visitBlock(e, t) {
		this.visitChildren(t, (r) => {
			r(e.parameters), r(e.children);
		});
	}
	visitBlockParameter(e, t) {}
	visitLetDeclaration(e, t) {}
	visitComponent(e, t) {
		this.visitChildren(t, (r) => {
			r(e.attrs), r(e.children);
		});
	}
	visitDirective(e, t) {
		this.visitChildren(t, (r) => {
			r(e.attrs);
		});
	}
	visitChildren(e, t) {
		let r = [], n = this;
		function i(s) {
			s && r.push(Ot(n, s, e));
		}
		return t(i), Array.prototype.concat.apply([], r);
	}
};
var _e$1 = {
	AElig: "Æ",
	AMP: "&",
	amp: "&",
	Aacute: "Á",
	Abreve: "Ă",
	Acirc: "Â",
	Acy: "А",
	Afr: "𝔄",
	Agrave: "À",
	Alpha: "Α",
	Amacr: "Ā",
	And: "⩓",
	Aogon: "Ą",
	Aopf: "𝔸",
	ApplyFunction: "⁡",
	af: "⁡",
	Aring: "Å",
	angst: "Å",
	Ascr: "𝒜",
	Assign: "≔",
	colone: "≔",
	coloneq: "≔",
	Atilde: "Ã",
	Auml: "Ä",
	Backslash: "∖",
	setminus: "∖",
	setmn: "∖",
	smallsetminus: "∖",
	ssetmn: "∖",
	Barv: "⫧",
	Barwed: "⌆",
	doublebarwedge: "⌆",
	Bcy: "Б",
	Because: "∵",
	becaus: "∵",
	because: "∵",
	Bernoullis: "ℬ",
	Bscr: "ℬ",
	bernou: "ℬ",
	Beta: "Β",
	Bfr: "𝔅",
	Bopf: "𝔹",
	Breve: "˘",
	breve: "˘",
	Bumpeq: "≎",
	HumpDownHump: "≎",
	bump: "≎",
	CHcy: "Ч",
	COPY: "©",
	copy: "©",
	Cacute: "Ć",
	Cap: "⋒",
	CapitalDifferentialD: "ⅅ",
	DD: "ⅅ",
	Cayleys: "ℭ",
	Cfr: "ℭ",
	Ccaron: "Č",
	Ccedil: "Ç",
	Ccirc: "Ĉ",
	Cconint: "∰",
	Cdot: "Ċ",
	Cedilla: "¸",
	cedil: "¸",
	CenterDot: "·",
	centerdot: "·",
	middot: "·",
	Chi: "Χ",
	CircleDot: "⊙",
	odot: "⊙",
	CircleMinus: "⊖",
	ominus: "⊖",
	CirclePlus: "⊕",
	oplus: "⊕",
	CircleTimes: "⊗",
	otimes: "⊗",
	ClockwiseContourIntegral: "∲",
	cwconint: "∲",
	CloseCurlyDoubleQuote: "”",
	rdquo: "”",
	rdquor: "”",
	CloseCurlyQuote: "’",
	rsquo: "’",
	rsquor: "’",
	Colon: "∷",
	Proportion: "∷",
	Colone: "⩴",
	Congruent: "≡",
	equiv: "≡",
	Conint: "∯",
	DoubleContourIntegral: "∯",
	ContourIntegral: "∮",
	conint: "∮",
	oint: "∮",
	Copf: "ℂ",
	complexes: "ℂ",
	Coproduct: "∐",
	coprod: "∐",
	CounterClockwiseContourIntegral: "∳",
	awconint: "∳",
	Cross: "⨯",
	Cscr: "𝒞",
	Cup: "⋓",
	CupCap: "≍",
	asympeq: "≍",
	DDotrahd: "⤑",
	DJcy: "Ђ",
	DScy: "Ѕ",
	DZcy: "Џ",
	Dagger: "‡",
	ddagger: "‡",
	Darr: "↡",
	Dashv: "⫤",
	DoubleLeftTee: "⫤",
	Dcaron: "Ď",
	Dcy: "Д",
	Del: "∇",
	nabla: "∇",
	Delta: "Δ",
	Dfr: "𝔇",
	DiacriticalAcute: "´",
	acute: "´",
	DiacriticalDot: "˙",
	dot: "˙",
	DiacriticalDoubleAcute: "˝",
	dblac: "˝",
	DiacriticalGrave: "`",
	grave: "`",
	DiacriticalTilde: "˜",
	tilde: "˜",
	Diamond: "⋄",
	diam: "⋄",
	diamond: "⋄",
	DifferentialD: "ⅆ",
	dd: "ⅆ",
	Dopf: "𝔻",
	Dot: "¨",
	DoubleDot: "¨",
	die: "¨",
	uml: "¨",
	DotDot: "⃜",
	DotEqual: "≐",
	doteq: "≐",
	esdot: "≐",
	DoubleDownArrow: "⇓",
	Downarrow: "⇓",
	dArr: "⇓",
	DoubleLeftArrow: "⇐",
	Leftarrow: "⇐",
	lArr: "⇐",
	DoubleLeftRightArrow: "⇔",
	Leftrightarrow: "⇔",
	hArr: "⇔",
	iff: "⇔",
	DoubleLongLeftArrow: "⟸",
	Longleftarrow: "⟸",
	xlArr: "⟸",
	DoubleLongLeftRightArrow: "⟺",
	Longleftrightarrow: "⟺",
	xhArr: "⟺",
	DoubleLongRightArrow: "⟹",
	Longrightarrow: "⟹",
	xrArr: "⟹",
	DoubleRightArrow: "⇒",
	Implies: "⇒",
	Rightarrow: "⇒",
	rArr: "⇒",
	DoubleRightTee: "⊨",
	vDash: "⊨",
	DoubleUpArrow: "⇑",
	Uparrow: "⇑",
	uArr: "⇑",
	DoubleUpDownArrow: "⇕",
	Updownarrow: "⇕",
	vArr: "⇕",
	DoubleVerticalBar: "∥",
	par: "∥",
	parallel: "∥",
	shortparallel: "∥",
	spar: "∥",
	DownArrow: "↓",
	ShortDownArrow: "↓",
	darr: "↓",
	downarrow: "↓",
	DownArrowBar: "⤓",
	DownArrowUpArrow: "⇵",
	duarr: "⇵",
	DownBreve: "̑",
	DownLeftRightVector: "⥐",
	DownLeftTeeVector: "⥞",
	DownLeftVector: "↽",
	leftharpoondown: "↽",
	lhard: "↽",
	DownLeftVectorBar: "⥖",
	DownRightTeeVector: "⥟",
	DownRightVector: "⇁",
	rhard: "⇁",
	rightharpoondown: "⇁",
	DownRightVectorBar: "⥗",
	DownTee: "⊤",
	top: "⊤",
	DownTeeArrow: "↧",
	mapstodown: "↧",
	Dscr: "𝒟",
	Dstrok: "Đ",
	ENG: "Ŋ",
	ETH: "Ð",
	Eacute: "É",
	Ecaron: "Ě",
	Ecirc: "Ê",
	Ecy: "Э",
	Edot: "Ė",
	Efr: "𝔈",
	Egrave: "È",
	Element: "∈",
	in: "∈",
	isin: "∈",
	isinv: "∈",
	Emacr: "Ē",
	EmptySmallSquare: "◻",
	EmptyVerySmallSquare: "▫",
	Eogon: "Ę",
	Eopf: "𝔼",
	Epsilon: "Ε",
	Equal: "⩵",
	EqualTilde: "≂",
	eqsim: "≂",
	esim: "≂",
	Equilibrium: "⇌",
	rightleftharpoons: "⇌",
	rlhar: "⇌",
	Escr: "ℰ",
	expectation: "ℰ",
	Esim: "⩳",
	Eta: "Η",
	Euml: "Ë",
	Exists: "∃",
	exist: "∃",
	ExponentialE: "ⅇ",
	ee: "ⅇ",
	exponentiale: "ⅇ",
	Fcy: "Ф",
	Ffr: "𝔉",
	FilledSmallSquare: "◼",
	FilledVerySmallSquare: "▪",
	blacksquare: "▪",
	squarf: "▪",
	squf: "▪",
	Fopf: "𝔽",
	ForAll: "∀",
	forall: "∀",
	Fouriertrf: "ℱ",
	Fscr: "ℱ",
	GJcy: "Ѓ",
	GT: ">",
	gt: ">",
	Gamma: "Γ",
	Gammad: "Ϝ",
	Gbreve: "Ğ",
	Gcedil: "Ģ",
	Gcirc: "Ĝ",
	Gcy: "Г",
	Gdot: "Ġ",
	Gfr: "𝔊",
	Gg: "⋙",
	ggg: "⋙",
	Gopf: "𝔾",
	GreaterEqual: "≥",
	ge: "≥",
	geq: "≥",
	GreaterEqualLess: "⋛",
	gel: "⋛",
	gtreqless: "⋛",
	GreaterFullEqual: "≧",
	gE: "≧",
	geqq: "≧",
	GreaterGreater: "⪢",
	GreaterLess: "≷",
	gl: "≷",
	gtrless: "≷",
	GreaterSlantEqual: "⩾",
	geqslant: "⩾",
	ges: "⩾",
	GreaterTilde: "≳",
	gsim: "≳",
	gtrsim: "≳",
	Gscr: "𝒢",
	Gt: "≫",
	NestedGreaterGreater: "≫",
	gg: "≫",
	HARDcy: "Ъ",
	Hacek: "ˇ",
	caron: "ˇ",
	Hat: "^",
	Hcirc: "Ĥ",
	Hfr: "ℌ",
	Poincareplane: "ℌ",
	HilbertSpace: "ℋ",
	Hscr: "ℋ",
	hamilt: "ℋ",
	Hopf: "ℍ",
	quaternions: "ℍ",
	HorizontalLine: "─",
	boxh: "─",
	Hstrok: "Ħ",
	HumpEqual: "≏",
	bumpe: "≏",
	bumpeq: "≏",
	IEcy: "Е",
	IJlig: "Ĳ",
	IOcy: "Ё",
	Iacute: "Í",
	Icirc: "Î",
	Icy: "И",
	Idot: "İ",
	Ifr: "ℑ",
	Im: "ℑ",
	image: "ℑ",
	imagpart: "ℑ",
	Igrave: "Ì",
	Imacr: "Ī",
	ImaginaryI: "ⅈ",
	ii: "ⅈ",
	Int: "∬",
	Integral: "∫",
	int: "∫",
	Intersection: "⋂",
	bigcap: "⋂",
	xcap: "⋂",
	InvisibleComma: "⁣",
	ic: "⁣",
	InvisibleTimes: "⁢",
	it: "⁢",
	Iogon: "Į",
	Iopf: "𝕀",
	Iota: "Ι",
	Iscr: "ℐ",
	imagline: "ℐ",
	Itilde: "Ĩ",
	Iukcy: "І",
	Iuml: "Ï",
	Jcirc: "Ĵ",
	Jcy: "Й",
	Jfr: "𝔍",
	Jopf: "𝕁",
	Jscr: "𝒥",
	Jsercy: "Ј",
	Jukcy: "Є",
	KHcy: "Х",
	KJcy: "Ќ",
	Kappa: "Κ",
	Kcedil: "Ķ",
	Kcy: "К",
	Kfr: "𝔎",
	Kopf: "𝕂",
	Kscr: "𝒦",
	LJcy: "Љ",
	LT: "<",
	lt: "<",
	Lacute: "Ĺ",
	Lambda: "Λ",
	Lang: "⟪",
	Laplacetrf: "ℒ",
	Lscr: "ℒ",
	lagran: "ℒ",
	Larr: "↞",
	twoheadleftarrow: "↞",
	Lcaron: "Ľ",
	Lcedil: "Ļ",
	Lcy: "Л",
	LeftAngleBracket: "⟨",
	lang: "⟨",
	langle: "⟨",
	LeftArrow: "←",
	ShortLeftArrow: "←",
	larr: "←",
	leftarrow: "←",
	slarr: "←",
	LeftArrowBar: "⇤",
	larrb: "⇤",
	LeftArrowRightArrow: "⇆",
	leftrightarrows: "⇆",
	lrarr: "⇆",
	LeftCeiling: "⌈",
	lceil: "⌈",
	LeftDoubleBracket: "⟦",
	lobrk: "⟦",
	LeftDownTeeVector: "⥡",
	LeftDownVector: "⇃",
	dharl: "⇃",
	downharpoonleft: "⇃",
	LeftDownVectorBar: "⥙",
	LeftFloor: "⌊",
	lfloor: "⌊",
	LeftRightArrow: "↔",
	harr: "↔",
	leftrightarrow: "↔",
	LeftRightVector: "⥎",
	LeftTee: "⊣",
	dashv: "⊣",
	LeftTeeArrow: "↤",
	mapstoleft: "↤",
	LeftTeeVector: "⥚",
	LeftTriangle: "⊲",
	vartriangleleft: "⊲",
	vltri: "⊲",
	LeftTriangleBar: "⧏",
	LeftTriangleEqual: "⊴",
	ltrie: "⊴",
	trianglelefteq: "⊴",
	LeftUpDownVector: "⥑",
	LeftUpTeeVector: "⥠",
	LeftUpVector: "↿",
	uharl: "↿",
	upharpoonleft: "↿",
	LeftUpVectorBar: "⥘",
	LeftVector: "↼",
	leftharpoonup: "↼",
	lharu: "↼",
	LeftVectorBar: "⥒",
	LessEqualGreater: "⋚",
	leg: "⋚",
	lesseqgtr: "⋚",
	LessFullEqual: "≦",
	lE: "≦",
	leqq: "≦",
	LessGreater: "≶",
	lessgtr: "≶",
	lg: "≶",
	LessLess: "⪡",
	LessSlantEqual: "⩽",
	leqslant: "⩽",
	les: "⩽",
	LessTilde: "≲",
	lesssim: "≲",
	lsim: "≲",
	Lfr: "𝔏",
	Ll: "⋘",
	Lleftarrow: "⇚",
	lAarr: "⇚",
	Lmidot: "Ŀ",
	LongLeftArrow: "⟵",
	longleftarrow: "⟵",
	xlarr: "⟵",
	LongLeftRightArrow: "⟷",
	longleftrightarrow: "⟷",
	xharr: "⟷",
	LongRightArrow: "⟶",
	longrightarrow: "⟶",
	xrarr: "⟶",
	Lopf: "𝕃",
	LowerLeftArrow: "↙",
	swarr: "↙",
	swarrow: "↙",
	LowerRightArrow: "↘",
	searr: "↘",
	searrow: "↘",
	Lsh: "↰",
	lsh: "↰",
	Lstrok: "Ł",
	Lt: "≪",
	NestedLessLess: "≪",
	ll: "≪",
	Map: "⤅",
	Mcy: "М",
	MediumSpace: " ",
	Mellintrf: "ℳ",
	Mscr: "ℳ",
	phmmat: "ℳ",
	Mfr: "𝔐",
	MinusPlus: "∓",
	mnplus: "∓",
	mp: "∓",
	Mopf: "𝕄",
	Mu: "Μ",
	NJcy: "Њ",
	Nacute: "Ń",
	Ncaron: "Ň",
	Ncedil: "Ņ",
	Ncy: "Н",
	NegativeMediumSpace: "​",
	NegativeThickSpace: "​",
	NegativeThinSpace: "​",
	NegativeVeryThinSpace: "​",
	ZeroWidthSpace: "​",
	NewLine: `
`,
	Nfr: "𝔑",
	NoBreak: "⁠",
	NonBreakingSpace: "\xA0",
	nbsp: "\xA0",
	Nopf: "ℕ",
	naturals: "ℕ",
	Not: "⫬",
	NotCongruent: "≢",
	nequiv: "≢",
	NotCupCap: "≭",
	NotDoubleVerticalBar: "∦",
	npar: "∦",
	nparallel: "∦",
	nshortparallel: "∦",
	nspar: "∦",
	NotElement: "∉",
	notin: "∉",
	notinva: "∉",
	NotEqual: "≠",
	ne: "≠",
	NotEqualTilde: "≂̸",
	nesim: "≂̸",
	NotExists: "∄",
	nexist: "∄",
	nexists: "∄",
	NotGreater: "≯",
	ngt: "≯",
	ngtr: "≯",
	NotGreaterEqual: "≱",
	nge: "≱",
	ngeq: "≱",
	NotGreaterFullEqual: "≧̸",
	ngE: "≧̸",
	ngeqq: "≧̸",
	NotGreaterGreater: "≫̸",
	nGtv: "≫̸",
	NotGreaterLess: "≹",
	ntgl: "≹",
	NotGreaterSlantEqual: "⩾̸",
	ngeqslant: "⩾̸",
	nges: "⩾̸",
	NotGreaterTilde: "≵",
	ngsim: "≵",
	NotHumpDownHump: "≎̸",
	nbump: "≎̸",
	NotHumpEqual: "≏̸",
	nbumpe: "≏̸",
	NotLeftTriangle: "⋪",
	nltri: "⋪",
	ntriangleleft: "⋪",
	NotLeftTriangleBar: "⧏̸",
	NotLeftTriangleEqual: "⋬",
	nltrie: "⋬",
	ntrianglelefteq: "⋬",
	NotLess: "≮",
	nless: "≮",
	nlt: "≮",
	NotLessEqual: "≰",
	nle: "≰",
	nleq: "≰",
	NotLessGreater: "≸",
	ntlg: "≸",
	NotLessLess: "≪̸",
	nLtv: "≪̸",
	NotLessSlantEqual: "⩽̸",
	nleqslant: "⩽̸",
	nles: "⩽̸",
	NotLessTilde: "≴",
	nlsim: "≴",
	NotNestedGreaterGreater: "⪢̸",
	NotNestedLessLess: "⪡̸",
	NotPrecedes: "⊀",
	npr: "⊀",
	nprec: "⊀",
	NotPrecedesEqual: "⪯̸",
	npre: "⪯̸",
	npreceq: "⪯̸",
	NotPrecedesSlantEqual: "⋠",
	nprcue: "⋠",
	NotReverseElement: "∌",
	notni: "∌",
	notniva: "∌",
	NotRightTriangle: "⋫",
	nrtri: "⋫",
	ntriangleright: "⋫",
	NotRightTriangleBar: "⧐̸",
	NotRightTriangleEqual: "⋭",
	nrtrie: "⋭",
	ntrianglerighteq: "⋭",
	NotSquareSubset: "⊏̸",
	NotSquareSubsetEqual: "⋢",
	nsqsube: "⋢",
	NotSquareSuperset: "⊐̸",
	NotSquareSupersetEqual: "⋣",
	nsqsupe: "⋣",
	NotSubset: "⊂⃒",
	nsubset: "⊂⃒",
	vnsub: "⊂⃒",
	NotSubsetEqual: "⊈",
	nsube: "⊈",
	nsubseteq: "⊈",
	NotSucceeds: "⊁",
	nsc: "⊁",
	nsucc: "⊁",
	NotSucceedsEqual: "⪰̸",
	nsce: "⪰̸",
	nsucceq: "⪰̸",
	NotSucceedsSlantEqual: "⋡",
	nsccue: "⋡",
	NotSucceedsTilde: "≿̸",
	NotSuperset: "⊃⃒",
	nsupset: "⊃⃒",
	vnsup: "⊃⃒",
	NotSupersetEqual: "⊉",
	nsupe: "⊉",
	nsupseteq: "⊉",
	NotTilde: "≁",
	nsim: "≁",
	NotTildeEqual: "≄",
	nsime: "≄",
	nsimeq: "≄",
	NotTildeFullEqual: "≇",
	ncong: "≇",
	NotTildeTilde: "≉",
	nap: "≉",
	napprox: "≉",
	NotVerticalBar: "∤",
	nmid: "∤",
	nshortmid: "∤",
	nsmid: "∤",
	Nscr: "𝒩",
	Ntilde: "Ñ",
	Nu: "Ν",
	OElig: "Œ",
	Oacute: "Ó",
	Ocirc: "Ô",
	Ocy: "О",
	Odblac: "Ő",
	Ofr: "𝔒",
	Ograve: "Ò",
	Omacr: "Ō",
	Omega: "Ω",
	ohm: "Ω",
	Omicron: "Ο",
	Oopf: "𝕆",
	OpenCurlyDoubleQuote: "“",
	ldquo: "“",
	OpenCurlyQuote: "‘",
	lsquo: "‘",
	Or: "⩔",
	Oscr: "𝒪",
	Oslash: "Ø",
	Otilde: "Õ",
	Otimes: "⨷",
	Ouml: "Ö",
	OverBar: "‾",
	oline: "‾",
	OverBrace: "⏞",
	OverBracket: "⎴",
	tbrk: "⎴",
	OverParenthesis: "⏜",
	PartialD: "∂",
	part: "∂",
	Pcy: "П",
	Pfr: "𝔓",
	Phi: "Φ",
	Pi: "Π",
	PlusMinus: "±",
	plusmn: "±",
	pm: "±",
	Popf: "ℙ",
	primes: "ℙ",
	Pr: "⪻",
	Precedes: "≺",
	pr: "≺",
	prec: "≺",
	PrecedesEqual: "⪯",
	pre: "⪯",
	preceq: "⪯",
	PrecedesSlantEqual: "≼",
	prcue: "≼",
	preccurlyeq: "≼",
	PrecedesTilde: "≾",
	precsim: "≾",
	prsim: "≾",
	Prime: "″",
	Product: "∏",
	prod: "∏",
	Proportional: "∝",
	prop: "∝",
	propto: "∝",
	varpropto: "∝",
	vprop: "∝",
	Pscr: "𝒫",
	Psi: "Ψ",
	QUOT: "\"",
	quot: "\"",
	Qfr: "𝔔",
	Qopf: "ℚ",
	rationals: "ℚ",
	Qscr: "𝒬",
	RBarr: "⤐",
	drbkarow: "⤐",
	REG: "®",
	circledR: "®",
	reg: "®",
	Racute: "Ŕ",
	Rang: "⟫",
	Rarr: "↠",
	twoheadrightarrow: "↠",
	Rarrtl: "⤖",
	Rcaron: "Ř",
	Rcedil: "Ŗ",
	Rcy: "Р",
	Re: "ℜ",
	Rfr: "ℜ",
	real: "ℜ",
	realpart: "ℜ",
	ReverseElement: "∋",
	SuchThat: "∋",
	ni: "∋",
	niv: "∋",
	ReverseEquilibrium: "⇋",
	leftrightharpoons: "⇋",
	lrhar: "⇋",
	ReverseUpEquilibrium: "⥯",
	duhar: "⥯",
	Rho: "Ρ",
	RightAngleBracket: "⟩",
	rang: "⟩",
	rangle: "⟩",
	RightArrow: "→",
	ShortRightArrow: "→",
	rarr: "→",
	rightarrow: "→",
	srarr: "→",
	RightArrowBar: "⇥",
	rarrb: "⇥",
	RightArrowLeftArrow: "⇄",
	rightleftarrows: "⇄",
	rlarr: "⇄",
	RightCeiling: "⌉",
	rceil: "⌉",
	RightDoubleBracket: "⟧",
	robrk: "⟧",
	RightDownTeeVector: "⥝",
	RightDownVector: "⇂",
	dharr: "⇂",
	downharpoonright: "⇂",
	RightDownVectorBar: "⥕",
	RightFloor: "⌋",
	rfloor: "⌋",
	RightTee: "⊢",
	vdash: "⊢",
	RightTeeArrow: "↦",
	map: "↦",
	mapsto: "↦",
	RightTeeVector: "⥛",
	RightTriangle: "⊳",
	vartriangleright: "⊳",
	vrtri: "⊳",
	RightTriangleBar: "⧐",
	RightTriangleEqual: "⊵",
	rtrie: "⊵",
	trianglerighteq: "⊵",
	RightUpDownVector: "⥏",
	RightUpTeeVector: "⥜",
	RightUpVector: "↾",
	uharr: "↾",
	upharpoonright: "↾",
	RightUpVectorBar: "⥔",
	RightVector: "⇀",
	rharu: "⇀",
	rightharpoonup: "⇀",
	RightVectorBar: "⥓",
	Ropf: "ℝ",
	reals: "ℝ",
	RoundImplies: "⥰",
	Rrightarrow: "⇛",
	rAarr: "⇛",
	Rscr: "ℛ",
	realine: "ℛ",
	Rsh: "↱",
	rsh: "↱",
	RuleDelayed: "⧴",
	SHCHcy: "Щ",
	SHcy: "Ш",
	SOFTcy: "Ь",
	Sacute: "Ś",
	Sc: "⪼",
	Scaron: "Š",
	Scedil: "Ş",
	Scirc: "Ŝ",
	Scy: "С",
	Sfr: "𝔖",
	ShortUpArrow: "↑",
	UpArrow: "↑",
	uarr: "↑",
	uparrow: "↑",
	Sigma: "Σ",
	SmallCircle: "∘",
	compfn: "∘",
	Sopf: "𝕊",
	Sqrt: "√",
	radic: "√",
	Square: "□",
	squ: "□",
	square: "□",
	SquareIntersection: "⊓",
	sqcap: "⊓",
	SquareSubset: "⊏",
	sqsub: "⊏",
	sqsubset: "⊏",
	SquareSubsetEqual: "⊑",
	sqsube: "⊑",
	sqsubseteq: "⊑",
	SquareSuperset: "⊐",
	sqsup: "⊐",
	sqsupset: "⊐",
	SquareSupersetEqual: "⊒",
	sqsupe: "⊒",
	sqsupseteq: "⊒",
	SquareUnion: "⊔",
	sqcup: "⊔",
	Sscr: "𝒮",
	Star: "⋆",
	sstarf: "⋆",
	Sub: "⋐",
	Subset: "⋐",
	SubsetEqual: "⊆",
	sube: "⊆",
	subseteq: "⊆",
	Succeeds: "≻",
	sc: "≻",
	succ: "≻",
	SucceedsEqual: "⪰",
	sce: "⪰",
	succeq: "⪰",
	SucceedsSlantEqual: "≽",
	sccue: "≽",
	succcurlyeq: "≽",
	SucceedsTilde: "≿",
	scsim: "≿",
	succsim: "≿",
	Sum: "∑",
	sum: "∑",
	Sup: "⋑",
	Supset: "⋑",
	Superset: "⊃",
	sup: "⊃",
	supset: "⊃",
	SupersetEqual: "⊇",
	supe: "⊇",
	supseteq: "⊇",
	THORN: "Þ",
	TRADE: "™",
	trade: "™",
	TSHcy: "Ћ",
	TScy: "Ц",
	Tab: "	",
	Tau: "Τ",
	Tcaron: "Ť",
	Tcedil: "Ţ",
	Tcy: "Т",
	Tfr: "𝔗",
	Therefore: "∴",
	there4: "∴",
	therefore: "∴",
	Theta: "Θ",
	ThickSpace: "  ",
	ThinSpace: " ",
	thinsp: " ",
	Tilde: "∼",
	sim: "∼",
	thicksim: "∼",
	thksim: "∼",
	TildeEqual: "≃",
	sime: "≃",
	simeq: "≃",
	TildeFullEqual: "≅",
	cong: "≅",
	TildeTilde: "≈",
	ap: "≈",
	approx: "≈",
	asymp: "≈",
	thickapprox: "≈",
	thkap: "≈",
	Topf: "𝕋",
	TripleDot: "⃛",
	tdot: "⃛",
	Tscr: "𝒯",
	Tstrok: "Ŧ",
	Uacute: "Ú",
	Uarr: "↟",
	Uarrocir: "⥉",
	Ubrcy: "Ў",
	Ubreve: "Ŭ",
	Ucirc: "Û",
	Ucy: "У",
	Udblac: "Ű",
	Ufr: "𝔘",
	Ugrave: "Ù",
	Umacr: "Ū",
	UnderBar: "_",
	lowbar: "_",
	UnderBrace: "⏟",
	UnderBracket: "⎵",
	bbrk: "⎵",
	UnderParenthesis: "⏝",
	Union: "⋃",
	bigcup: "⋃",
	xcup: "⋃",
	UnionPlus: "⊎",
	uplus: "⊎",
	Uogon: "Ų",
	Uopf: "𝕌",
	UpArrowBar: "⤒",
	UpArrowDownArrow: "⇅",
	udarr: "⇅",
	UpDownArrow: "↕",
	updownarrow: "↕",
	varr: "↕",
	UpEquilibrium: "⥮",
	udhar: "⥮",
	UpTee: "⊥",
	bot: "⊥",
	bottom: "⊥",
	perp: "⊥",
	UpTeeArrow: "↥",
	mapstoup: "↥",
	UpperLeftArrow: "↖",
	nwarr: "↖",
	nwarrow: "↖",
	UpperRightArrow: "↗",
	nearr: "↗",
	nearrow: "↗",
	Upsi: "ϒ",
	upsih: "ϒ",
	Upsilon: "Υ",
	Uring: "Ů",
	Uscr: "𝒰",
	Utilde: "Ũ",
	Uuml: "Ü",
	VDash: "⊫",
	Vbar: "⫫",
	Vcy: "В",
	Vdash: "⊩",
	Vdashl: "⫦",
	Vee: "⋁",
	bigvee: "⋁",
	xvee: "⋁",
	Verbar: "‖",
	Vert: "‖",
	VerticalBar: "∣",
	mid: "∣",
	shortmid: "∣",
	smid: "∣",
	VerticalLine: "|",
	verbar: "|",
	vert: "|",
	VerticalSeparator: "❘",
	VerticalTilde: "≀",
	wr: "≀",
	wreath: "≀",
	VeryThinSpace: " ",
	hairsp: " ",
	Vfr: "𝔙",
	Vopf: "𝕍",
	Vscr: "𝒱",
	Vvdash: "⊪",
	Wcirc: "Ŵ",
	Wedge: "⋀",
	bigwedge: "⋀",
	xwedge: "⋀",
	Wfr: "𝔚",
	Wopf: "𝕎",
	Wscr: "𝒲",
	Xfr: "𝔛",
	Xi: "Ξ",
	Xopf: "𝕏",
	Xscr: "𝒳",
	YAcy: "Я",
	YIcy: "Ї",
	YUcy: "Ю",
	Yacute: "Ý",
	Ycirc: "Ŷ",
	Ycy: "Ы",
	Yfr: "𝔜",
	Yopf: "𝕐",
	Yscr: "𝒴",
	Yuml: "Ÿ",
	ZHcy: "Ж",
	Zacute: "Ź",
	Zcaron: "Ž",
	Zcy: "З",
	Zdot: "Ż",
	Zeta: "Ζ",
	Zfr: "ℨ",
	zeetrf: "ℨ",
	Zopf: "ℤ",
	integers: "ℤ",
	Zscr: "𝒵",
	aacute: "á",
	abreve: "ă",
	ac: "∾",
	mstpos: "∾",
	acE: "∾̳",
	acd: "∿",
	acirc: "â",
	acy: "а",
	aelig: "æ",
	afr: "𝔞",
	agrave: "à",
	alefsym: "ℵ",
	aleph: "ℵ",
	alpha: "α",
	amacr: "ā",
	amalg: "⨿",
	and: "∧",
	wedge: "∧",
	andand: "⩕",
	andd: "⩜",
	andslope: "⩘",
	andv: "⩚",
	ang: "∠",
	angle: "∠",
	ange: "⦤",
	angmsd: "∡",
	measuredangle: "∡",
	angmsdaa: "⦨",
	angmsdab: "⦩",
	angmsdac: "⦪",
	angmsdad: "⦫",
	angmsdae: "⦬",
	angmsdaf: "⦭",
	angmsdag: "⦮",
	angmsdah: "⦯",
	angrt: "∟",
	angrtvb: "⊾",
	angrtvbd: "⦝",
	angsph: "∢",
	angzarr: "⍼",
	aogon: "ą",
	aopf: "𝕒",
	apE: "⩰",
	apacir: "⩯",
	ape: "≊",
	approxeq: "≊",
	apid: "≋",
	apos: "'",
	aring: "å",
	ascr: "𝒶",
	ast: "*",
	midast: "*",
	atilde: "ã",
	auml: "ä",
	awint: "⨑",
	bNot: "⫭",
	backcong: "≌",
	bcong: "≌",
	backepsilon: "϶",
	bepsi: "϶",
	backprime: "‵",
	bprime: "‵",
	backsim: "∽",
	bsim: "∽",
	backsimeq: "⋍",
	bsime: "⋍",
	barvee: "⊽",
	barwed: "⌅",
	barwedge: "⌅",
	bbrktbrk: "⎶",
	bcy: "б",
	bdquo: "„",
	ldquor: "„",
	bemptyv: "⦰",
	beta: "β",
	beth: "ℶ",
	between: "≬",
	twixt: "≬",
	bfr: "𝔟",
	bigcirc: "◯",
	xcirc: "◯",
	bigodot: "⨀",
	xodot: "⨀",
	bigoplus: "⨁",
	xoplus: "⨁",
	bigotimes: "⨂",
	xotime: "⨂",
	bigsqcup: "⨆",
	xsqcup: "⨆",
	bigstar: "★",
	starf: "★",
	bigtriangledown: "▽",
	xdtri: "▽",
	bigtriangleup: "△",
	xutri: "△",
	biguplus: "⨄",
	xuplus: "⨄",
	bkarow: "⤍",
	rbarr: "⤍",
	blacklozenge: "⧫",
	lozf: "⧫",
	blacktriangle: "▴",
	utrif: "▴",
	blacktriangledown: "▾",
	dtrif: "▾",
	blacktriangleleft: "◂",
	ltrif: "◂",
	blacktriangleright: "▸",
	rtrif: "▸",
	blank: "␣",
	blk12: "▒",
	blk14: "░",
	blk34: "▓",
	block: "█",
	bne: "=⃥",
	bnequiv: "≡⃥",
	bnot: "⌐",
	bopf: "𝕓",
	bowtie: "⋈",
	boxDL: "╗",
	boxDR: "╔",
	boxDl: "╖",
	boxDr: "╓",
	boxH: "═",
	boxHD: "╦",
	boxHU: "╩",
	boxHd: "╤",
	boxHu: "╧",
	boxUL: "╝",
	boxUR: "╚",
	boxUl: "╜",
	boxUr: "╙",
	boxV: "║",
	boxVH: "╬",
	boxVL: "╣",
	boxVR: "╠",
	boxVh: "╫",
	boxVl: "╢",
	boxVr: "╟",
	boxbox: "⧉",
	boxdL: "╕",
	boxdR: "╒",
	boxdl: "┐",
	boxdr: "┌",
	boxhD: "╥",
	boxhU: "╨",
	boxhd: "┬",
	boxhu: "┴",
	boxminus: "⊟",
	minusb: "⊟",
	boxplus: "⊞",
	plusb: "⊞",
	boxtimes: "⊠",
	timesb: "⊠",
	boxuL: "╛",
	boxuR: "╘",
	boxul: "┘",
	boxur: "└",
	boxv: "│",
	boxvH: "╪",
	boxvL: "╡",
	boxvR: "╞",
	boxvh: "┼",
	boxvl: "┤",
	boxvr: "├",
	brvbar: "¦",
	bscr: "𝒷",
	bsemi: "⁏",
	bsol: "\\",
	bsolb: "⧅",
	bsolhsub: "⟈",
	bull: "•",
	bullet: "•",
	bumpE: "⪮",
	cacute: "ć",
	cap: "∩",
	capand: "⩄",
	capbrcup: "⩉",
	capcap: "⩋",
	capcup: "⩇",
	capdot: "⩀",
	caps: "∩︀",
	caret: "⁁",
	ccaps: "⩍",
	ccaron: "č",
	ccedil: "ç",
	ccirc: "ĉ",
	ccups: "⩌",
	ccupssm: "⩐",
	cdot: "ċ",
	cemptyv: "⦲",
	cent: "¢",
	cfr: "𝔠",
	chcy: "ч",
	check: "✓",
	checkmark: "✓",
	chi: "χ",
	cir: "○",
	cirE: "⧃",
	circ: "ˆ",
	circeq: "≗",
	cire: "≗",
	circlearrowleft: "↺",
	olarr: "↺",
	circlearrowright: "↻",
	orarr: "↻",
	circledS: "Ⓢ",
	oS: "Ⓢ",
	circledast: "⊛",
	oast: "⊛",
	circledcirc: "⊚",
	ocir: "⊚",
	circleddash: "⊝",
	odash: "⊝",
	cirfnint: "⨐",
	cirmid: "⫯",
	cirscir: "⧂",
	clubs: "♣",
	clubsuit: "♣",
	colon: ":",
	comma: ",",
	commat: "@",
	comp: "∁",
	complement: "∁",
	congdot: "⩭",
	copf: "𝕔",
	copysr: "℗",
	crarr: "↵",
	cross: "✗",
	cscr: "𝒸",
	csub: "⫏",
	csube: "⫑",
	csup: "⫐",
	csupe: "⫒",
	ctdot: "⋯",
	cudarrl: "⤸",
	cudarrr: "⤵",
	cuepr: "⋞",
	curlyeqprec: "⋞",
	cuesc: "⋟",
	curlyeqsucc: "⋟",
	cularr: "↶",
	curvearrowleft: "↶",
	cularrp: "⤽",
	cup: "∪",
	cupbrcap: "⩈",
	cupcap: "⩆",
	cupcup: "⩊",
	cupdot: "⊍",
	cupor: "⩅",
	cups: "∪︀",
	curarr: "↷",
	curvearrowright: "↷",
	curarrm: "⤼",
	curlyvee: "⋎",
	cuvee: "⋎",
	curlywedge: "⋏",
	cuwed: "⋏",
	curren: "¤",
	cwint: "∱",
	cylcty: "⌭",
	dHar: "⥥",
	dagger: "†",
	daleth: "ℸ",
	dash: "‐",
	hyphen: "‐",
	dbkarow: "⤏",
	rBarr: "⤏",
	dcaron: "ď",
	dcy: "д",
	ddarr: "⇊",
	downdownarrows: "⇊",
	ddotseq: "⩷",
	eDDot: "⩷",
	deg: "°",
	delta: "δ",
	demptyv: "⦱",
	dfisht: "⥿",
	dfr: "𝔡",
	diamondsuit: "♦",
	diams: "♦",
	digamma: "ϝ",
	gammad: "ϝ",
	disin: "⋲",
	div: "÷",
	divide: "÷",
	divideontimes: "⋇",
	divonx: "⋇",
	djcy: "ђ",
	dlcorn: "⌞",
	llcorner: "⌞",
	dlcrop: "⌍",
	dollar: "$",
	dopf: "𝕕",
	doteqdot: "≑",
	eDot: "≑",
	dotminus: "∸",
	minusd: "∸",
	dotplus: "∔",
	plusdo: "∔",
	dotsquare: "⊡",
	sdotb: "⊡",
	drcorn: "⌟",
	lrcorner: "⌟",
	drcrop: "⌌",
	dscr: "𝒹",
	dscy: "ѕ",
	dsol: "⧶",
	dstrok: "đ",
	dtdot: "⋱",
	dtri: "▿",
	triangledown: "▿",
	dwangle: "⦦",
	dzcy: "џ",
	dzigrarr: "⟿",
	eacute: "é",
	easter: "⩮",
	ecaron: "ě",
	ecir: "≖",
	eqcirc: "≖",
	ecirc: "ê",
	ecolon: "≕",
	eqcolon: "≕",
	ecy: "э",
	edot: "ė",
	efDot: "≒",
	fallingdotseq: "≒",
	efr: "𝔢",
	eg: "⪚",
	egrave: "è",
	egs: "⪖",
	eqslantgtr: "⪖",
	egsdot: "⪘",
	el: "⪙",
	elinters: "⏧",
	ell: "ℓ",
	els: "⪕",
	eqslantless: "⪕",
	elsdot: "⪗",
	emacr: "ē",
	empty: "∅",
	emptyset: "∅",
	emptyv: "∅",
	varnothing: "∅",
	emsp13: " ",
	emsp14: " ",
	emsp: " ",
	eng: "ŋ",
	ensp: " ",
	eogon: "ę",
	eopf: "𝕖",
	epar: "⋕",
	eparsl: "⧣",
	eplus: "⩱",
	epsi: "ε",
	epsilon: "ε",
	epsiv: "ϵ",
	straightepsilon: "ϵ",
	varepsilon: "ϵ",
	equals: "=",
	equest: "≟",
	questeq: "≟",
	equivDD: "⩸",
	eqvparsl: "⧥",
	erDot: "≓",
	risingdotseq: "≓",
	erarr: "⥱",
	escr: "ℯ",
	eta: "η",
	eth: "ð",
	euml: "ë",
	euro: "€",
	excl: "!",
	fcy: "ф",
	female: "♀",
	ffilig: "ﬃ",
	fflig: "ﬀ",
	ffllig: "ﬄ",
	ffr: "𝔣",
	filig: "ﬁ",
	fjlig: "fj",
	flat: "♭",
	fllig: "ﬂ",
	fltns: "▱",
	fnof: "ƒ",
	fopf: "𝕗",
	fork: "⋔",
	pitchfork: "⋔",
	forkv: "⫙",
	fpartint: "⨍",
	frac12: "½",
	half: "½",
	frac13: "⅓",
	frac14: "¼",
	frac15: "⅕",
	frac16: "⅙",
	frac18: "⅛",
	frac23: "⅔",
	frac25: "⅖",
	frac34: "¾",
	frac35: "⅗",
	frac38: "⅜",
	frac45: "⅘",
	frac56: "⅚",
	frac58: "⅝",
	frac78: "⅞",
	frasl: "⁄",
	frown: "⌢",
	sfrown: "⌢",
	fscr: "𝒻",
	gEl: "⪌",
	gtreqqless: "⪌",
	gacute: "ǵ",
	gamma: "γ",
	gap: "⪆",
	gtrapprox: "⪆",
	gbreve: "ğ",
	gcirc: "ĝ",
	gcy: "г",
	gdot: "ġ",
	gescc: "⪩",
	gesdot: "⪀",
	gesdoto: "⪂",
	gesdotol: "⪄",
	gesl: "⋛︀",
	gesles: "⪔",
	gfr: "𝔤",
	gimel: "ℷ",
	gjcy: "ѓ",
	glE: "⪒",
	gla: "⪥",
	glj: "⪤",
	gnE: "≩",
	gneqq: "≩",
	gnap: "⪊",
	gnapprox: "⪊",
	gne: "⪈",
	gneq: "⪈",
	gnsim: "⋧",
	gopf: "𝕘",
	gscr: "ℊ",
	gsime: "⪎",
	gsiml: "⪐",
	gtcc: "⪧",
	gtcir: "⩺",
	gtdot: "⋗",
	gtrdot: "⋗",
	gtlPar: "⦕",
	gtquest: "⩼",
	gtrarr: "⥸",
	gvertneqq: "≩︀",
	gvnE: "≩︀",
	hardcy: "ъ",
	harrcir: "⥈",
	harrw: "↭",
	leftrightsquigarrow: "↭",
	hbar: "ℏ",
	hslash: "ℏ",
	planck: "ℏ",
	plankv: "ℏ",
	hcirc: "ĥ",
	hearts: "♥",
	heartsuit: "♥",
	hellip: "…",
	mldr: "…",
	hercon: "⊹",
	hfr: "𝔥",
	hksearow: "⤥",
	searhk: "⤥",
	hkswarow: "⤦",
	swarhk: "⤦",
	hoarr: "⇿",
	homtht: "∻",
	hookleftarrow: "↩",
	larrhk: "↩",
	hookrightarrow: "↪",
	rarrhk: "↪",
	hopf: "𝕙",
	horbar: "―",
	hscr: "𝒽",
	hstrok: "ħ",
	hybull: "⁃",
	iacute: "í",
	icirc: "î",
	icy: "и",
	iecy: "е",
	iexcl: "¡",
	ifr: "𝔦",
	igrave: "ì",
	iiiint: "⨌",
	qint: "⨌",
	iiint: "∭",
	tint: "∭",
	iinfin: "⧜",
	iiota: "℩",
	ijlig: "ĳ",
	imacr: "ī",
	imath: "ı",
	inodot: "ı",
	imof: "⊷",
	imped: "Ƶ",
	incare: "℅",
	infin: "∞",
	infintie: "⧝",
	intcal: "⊺",
	intercal: "⊺",
	intlarhk: "⨗",
	intprod: "⨼",
	iprod: "⨼",
	iocy: "ё",
	iogon: "į",
	iopf: "𝕚",
	iota: "ι",
	iquest: "¿",
	iscr: "𝒾",
	isinE: "⋹",
	isindot: "⋵",
	isins: "⋴",
	isinsv: "⋳",
	itilde: "ĩ",
	iukcy: "і",
	iuml: "ï",
	jcirc: "ĵ",
	jcy: "й",
	jfr: "𝔧",
	jmath: "ȷ",
	jopf: "𝕛",
	jscr: "𝒿",
	jsercy: "ј",
	jukcy: "є",
	kappa: "κ",
	kappav: "ϰ",
	varkappa: "ϰ",
	kcedil: "ķ",
	kcy: "к",
	kfr: "𝔨",
	kgreen: "ĸ",
	khcy: "х",
	kjcy: "ќ",
	kopf: "𝕜",
	kscr: "𝓀",
	lAtail: "⤛",
	lBarr: "⤎",
	lEg: "⪋",
	lesseqqgtr: "⪋",
	lHar: "⥢",
	lacute: "ĺ",
	laemptyv: "⦴",
	lambda: "λ",
	langd: "⦑",
	lap: "⪅",
	lessapprox: "⪅",
	laquo: "«",
	larrbfs: "⤟",
	larrfs: "⤝",
	larrlp: "↫",
	looparrowleft: "↫",
	larrpl: "⤹",
	larrsim: "⥳",
	larrtl: "↢",
	leftarrowtail: "↢",
	lat: "⪫",
	latail: "⤙",
	late: "⪭",
	lates: "⪭︀",
	lbarr: "⤌",
	lbbrk: "❲",
	lbrace: "{",
	lcub: "{",
	lbrack: "[",
	lsqb: "[",
	lbrke: "⦋",
	lbrksld: "⦏",
	lbrkslu: "⦍",
	lcaron: "ľ",
	lcedil: "ļ",
	lcy: "л",
	ldca: "⤶",
	ldrdhar: "⥧",
	ldrushar: "⥋",
	ldsh: "↲",
	le: "≤",
	leq: "≤",
	leftleftarrows: "⇇",
	llarr: "⇇",
	leftthreetimes: "⋋",
	lthree: "⋋",
	lescc: "⪨",
	lesdot: "⩿",
	lesdoto: "⪁",
	lesdotor: "⪃",
	lesg: "⋚︀",
	lesges: "⪓",
	lessdot: "⋖",
	ltdot: "⋖",
	lfisht: "⥼",
	lfr: "𝔩",
	lgE: "⪑",
	lharul: "⥪",
	lhblk: "▄",
	ljcy: "љ",
	llhard: "⥫",
	lltri: "◺",
	lmidot: "ŀ",
	lmoust: "⎰",
	lmoustache: "⎰",
	lnE: "≨",
	lneqq: "≨",
	lnap: "⪉",
	lnapprox: "⪉",
	lne: "⪇",
	lneq: "⪇",
	lnsim: "⋦",
	loang: "⟬",
	loarr: "⇽",
	longmapsto: "⟼",
	xmap: "⟼",
	looparrowright: "↬",
	rarrlp: "↬",
	lopar: "⦅",
	lopf: "𝕝",
	loplus: "⨭",
	lotimes: "⨴",
	lowast: "∗",
	loz: "◊",
	lozenge: "◊",
	lpar: "(",
	lparlt: "⦓",
	lrhard: "⥭",
	lrm: "‎",
	lrtri: "⊿",
	lsaquo: "‹",
	lscr: "𝓁",
	lsime: "⪍",
	lsimg: "⪏",
	lsquor: "‚",
	sbquo: "‚",
	lstrok: "ł",
	ltcc: "⪦",
	ltcir: "⩹",
	ltimes: "⋉",
	ltlarr: "⥶",
	ltquest: "⩻",
	ltrPar: "⦖",
	ltri: "◃",
	triangleleft: "◃",
	lurdshar: "⥊",
	luruhar: "⥦",
	lvertneqq: "≨︀",
	lvnE: "≨︀",
	mDDot: "∺",
	macr: "¯",
	strns: "¯",
	male: "♂",
	malt: "✠",
	maltese: "✠",
	marker: "▮",
	mcomma: "⨩",
	mcy: "м",
	mdash: "—",
	mfr: "𝔪",
	mho: "℧",
	micro: "µ",
	midcir: "⫰",
	minus: "−",
	minusdu: "⨪",
	mlcp: "⫛",
	models: "⊧",
	mopf: "𝕞",
	mscr: "𝓂",
	mu: "μ",
	multimap: "⊸",
	mumap: "⊸",
	nGg: "⋙̸",
	nGt: "≫⃒",
	nLeftarrow: "⇍",
	nlArr: "⇍",
	nLeftrightarrow: "⇎",
	nhArr: "⇎",
	nLl: "⋘̸",
	nLt: "≪⃒",
	nRightarrow: "⇏",
	nrArr: "⇏",
	nVDash: "⊯",
	nVdash: "⊮",
	nacute: "ń",
	nang: "∠⃒",
	napE: "⩰̸",
	napid: "≋̸",
	napos: "ŉ",
	natur: "♮",
	natural: "♮",
	ncap: "⩃",
	ncaron: "ň",
	ncedil: "ņ",
	ncongdot: "⩭̸",
	ncup: "⩂",
	ncy: "н",
	ndash: "–",
	neArr: "⇗",
	nearhk: "⤤",
	nedot: "≐̸",
	nesear: "⤨",
	toea: "⤨",
	nfr: "𝔫",
	nharr: "↮",
	nleftrightarrow: "↮",
	nhpar: "⫲",
	nis: "⋼",
	nisd: "⋺",
	njcy: "њ",
	nlE: "≦̸",
	nleqq: "≦̸",
	nlarr: "↚",
	nleftarrow: "↚",
	nldr: "‥",
	nopf: "𝕟",
	not: "¬",
	notinE: "⋹̸",
	notindot: "⋵̸",
	notinvb: "⋷",
	notinvc: "⋶",
	notnivb: "⋾",
	notnivc: "⋽",
	nparsl: "⫽⃥",
	npart: "∂̸",
	npolint: "⨔",
	nrarr: "↛",
	nrightarrow: "↛",
	nrarrc: "⤳̸",
	nrarrw: "↝̸",
	nscr: "𝓃",
	nsub: "⊄",
	nsubE: "⫅̸",
	nsubseteqq: "⫅̸",
	nsup: "⊅",
	nsupE: "⫆̸",
	nsupseteqq: "⫆̸",
	ntilde: "ñ",
	nu: "ν",
	num: "#",
	numero: "№",
	numsp: " ",
	nvDash: "⊭",
	nvHarr: "⤄",
	nvap: "≍⃒",
	nvdash: "⊬",
	nvge: "≥⃒",
	nvgt: ">⃒",
	nvinfin: "⧞",
	nvlArr: "⤂",
	nvle: "≤⃒",
	nvlt: "<⃒",
	nvltrie: "⊴⃒",
	nvrArr: "⤃",
	nvrtrie: "⊵⃒",
	nvsim: "∼⃒",
	nwArr: "⇖",
	nwarhk: "⤣",
	nwnear: "⤧",
	oacute: "ó",
	ocirc: "ô",
	ocy: "о",
	odblac: "ő",
	odiv: "⨸",
	odsold: "⦼",
	oelig: "œ",
	ofcir: "⦿",
	ofr: "𝔬",
	ogon: "˛",
	ograve: "ò",
	ogt: "⧁",
	ohbar: "⦵",
	olcir: "⦾",
	olcross: "⦻",
	olt: "⧀",
	omacr: "ō",
	omega: "ω",
	omicron: "ο",
	omid: "⦶",
	oopf: "𝕠",
	opar: "⦷",
	operp: "⦹",
	or: "∨",
	vee: "∨",
	ord: "⩝",
	order: "ℴ",
	orderof: "ℴ",
	oscr: "ℴ",
	ordf: "ª",
	ordm: "º",
	origof: "⊶",
	oror: "⩖",
	orslope: "⩗",
	orv: "⩛",
	oslash: "ø",
	osol: "⊘",
	otilde: "õ",
	otimesas: "⨶",
	ouml: "ö",
	ovbar: "⌽",
	para: "¶",
	parsim: "⫳",
	parsl: "⫽",
	pcy: "п",
	percnt: "%",
	period: ".",
	permil: "‰",
	pertenk: "‱",
	pfr: "𝔭",
	phi: "φ",
	phiv: "ϕ",
	straightphi: "ϕ",
	varphi: "ϕ",
	phone: "☎",
	pi: "π",
	piv: "ϖ",
	varpi: "ϖ",
	planckh: "ℎ",
	plus: "+",
	plusacir: "⨣",
	pluscir: "⨢",
	plusdu: "⨥",
	pluse: "⩲",
	plussim: "⨦",
	plustwo: "⨧",
	pointint: "⨕",
	popf: "𝕡",
	pound: "£",
	prE: "⪳",
	prap: "⪷",
	precapprox: "⪷",
	precnapprox: "⪹",
	prnap: "⪹",
	precneqq: "⪵",
	prnE: "⪵",
	precnsim: "⋨",
	prnsim: "⋨",
	prime: "′",
	profalar: "⌮",
	profline: "⌒",
	profsurf: "⌓",
	prurel: "⊰",
	pscr: "𝓅",
	psi: "ψ",
	puncsp: " ",
	qfr: "𝔮",
	qopf: "𝕢",
	qprime: "⁗",
	qscr: "𝓆",
	quatint: "⨖",
	quest: "?",
	rAtail: "⤜",
	rHar: "⥤",
	race: "∽̱",
	racute: "ŕ",
	raemptyv: "⦳",
	rangd: "⦒",
	range: "⦥",
	raquo: "»",
	rarrap: "⥵",
	rarrbfs: "⤠",
	rarrc: "⤳",
	rarrfs: "⤞",
	rarrpl: "⥅",
	rarrsim: "⥴",
	rarrtl: "↣",
	rightarrowtail: "↣",
	rarrw: "↝",
	rightsquigarrow: "↝",
	ratail: "⤚",
	ratio: "∶",
	rbbrk: "❳",
	rbrace: "}",
	rcub: "}",
	rbrack: "]",
	rsqb: "]",
	rbrke: "⦌",
	rbrksld: "⦎",
	rbrkslu: "⦐",
	rcaron: "ř",
	rcedil: "ŗ",
	rcy: "р",
	rdca: "⤷",
	rdldhar: "⥩",
	rdsh: "↳",
	rect: "▭",
	rfisht: "⥽",
	rfr: "𝔯",
	rharul: "⥬",
	rho: "ρ",
	rhov: "ϱ",
	varrho: "ϱ",
	rightrightarrows: "⇉",
	rrarr: "⇉",
	rightthreetimes: "⋌",
	rthree: "⋌",
	ring: "˚",
	rlm: "‏",
	rmoust: "⎱",
	rmoustache: "⎱",
	rnmid: "⫮",
	roang: "⟭",
	roarr: "⇾",
	ropar: "⦆",
	ropf: "𝕣",
	roplus: "⨮",
	rotimes: "⨵",
	rpar: ")",
	rpargt: "⦔",
	rppolint: "⨒",
	rsaquo: "›",
	rscr: "𝓇",
	rtimes: "⋊",
	rtri: "▹",
	triangleright: "▹",
	rtriltri: "⧎",
	ruluhar: "⥨",
	rx: "℞",
	sacute: "ś",
	scE: "⪴",
	scap: "⪸",
	succapprox: "⪸",
	scaron: "š",
	scedil: "ş",
	scirc: "ŝ",
	scnE: "⪶",
	succneqq: "⪶",
	scnap: "⪺",
	succnapprox: "⪺",
	scnsim: "⋩",
	succnsim: "⋩",
	scpolint: "⨓",
	scy: "с",
	sdot: "⋅",
	sdote: "⩦",
	seArr: "⇘",
	sect: "§",
	semi: ";",
	seswar: "⤩",
	tosa: "⤩",
	sext: "✶",
	sfr: "𝔰",
	sharp: "♯",
	shchcy: "щ",
	shcy: "ш",
	shy: "­",
	sigma: "σ",
	sigmaf: "ς",
	sigmav: "ς",
	varsigma: "ς",
	simdot: "⩪",
	simg: "⪞",
	simgE: "⪠",
	siml: "⪝",
	simlE: "⪟",
	simne: "≆",
	simplus: "⨤",
	simrarr: "⥲",
	smashp: "⨳",
	smeparsl: "⧤",
	smile: "⌣",
	ssmile: "⌣",
	smt: "⪪",
	smte: "⪬",
	smtes: "⪬︀",
	softcy: "ь",
	sol: "/",
	solb: "⧄",
	solbar: "⌿",
	sopf: "𝕤",
	spades: "♠",
	spadesuit: "♠",
	sqcaps: "⊓︀",
	sqcups: "⊔︀",
	sscr: "𝓈",
	star: "☆",
	sub: "⊂",
	subset: "⊂",
	subE: "⫅",
	subseteqq: "⫅",
	subdot: "⪽",
	subedot: "⫃",
	submult: "⫁",
	subnE: "⫋",
	subsetneqq: "⫋",
	subne: "⊊",
	subsetneq: "⊊",
	subplus: "⪿",
	subrarr: "⥹",
	subsim: "⫇",
	subsub: "⫕",
	subsup: "⫓",
	sung: "♪",
	sup1: "¹",
	sup2: "²",
	sup3: "³",
	supE: "⫆",
	supseteqq: "⫆",
	supdot: "⪾",
	supdsub: "⫘",
	supedot: "⫄",
	suphsol: "⟉",
	suphsub: "⫗",
	suplarr: "⥻",
	supmult: "⫂",
	supnE: "⫌",
	supsetneqq: "⫌",
	supne: "⊋",
	supsetneq: "⊋",
	supplus: "⫀",
	supsim: "⫈",
	supsub: "⫔",
	supsup: "⫖",
	swArr: "⇙",
	swnwar: "⤪",
	szlig: "ß",
	target: "⌖",
	tau: "τ",
	tcaron: "ť",
	tcedil: "ţ",
	tcy: "т",
	telrec: "⌕",
	tfr: "𝔱",
	theta: "θ",
	thetasym: "ϑ",
	thetav: "ϑ",
	vartheta: "ϑ",
	thorn: "þ",
	times: "×",
	timesbar: "⨱",
	timesd: "⨰",
	topbot: "⌶",
	topcir: "⫱",
	topf: "𝕥",
	topfork: "⫚",
	tprime: "‴",
	triangle: "▵",
	utri: "▵",
	triangleq: "≜",
	trie: "≜",
	tridot: "◬",
	triminus: "⨺",
	triplus: "⨹",
	trisb: "⧍",
	tritime: "⨻",
	trpezium: "⏢",
	tscr: "𝓉",
	tscy: "ц",
	tshcy: "ћ",
	tstrok: "ŧ",
	uHar: "⥣",
	uacute: "ú",
	ubrcy: "ў",
	ubreve: "ŭ",
	ucirc: "û",
	ucy: "у",
	udblac: "ű",
	ufisht: "⥾",
	ufr: "𝔲",
	ugrave: "ù",
	uhblk: "▀",
	ulcorn: "⌜",
	ulcorner: "⌜",
	ulcrop: "⌏",
	ultri: "◸",
	umacr: "ū",
	uogon: "ų",
	uopf: "𝕦",
	upsi: "υ",
	upsilon: "υ",
	upuparrows: "⇈",
	uuarr: "⇈",
	urcorn: "⌝",
	urcorner: "⌝",
	urcrop: "⌎",
	uring: "ů",
	urtri: "◹",
	uscr: "𝓊",
	utdot: "⋰",
	utilde: "ũ",
	uuml: "ü",
	uwangle: "⦧",
	vBar: "⫨",
	vBarv: "⫩",
	vangrt: "⦜",
	varsubsetneq: "⊊︀",
	vsubne: "⊊︀",
	varsubsetneqq: "⫋︀",
	vsubnE: "⫋︀",
	varsupsetneq: "⊋︀",
	vsupne: "⊋︀",
	varsupsetneqq: "⫌︀",
	vsupnE: "⫌︀",
	vcy: "в",
	veebar: "⊻",
	veeeq: "≚",
	vellip: "⋮",
	vfr: "𝔳",
	vopf: "𝕧",
	vscr: "𝓋",
	vzigzag: "⦚",
	wcirc: "ŵ",
	wedbar: "⩟",
	wedgeq: "≙",
	weierp: "℘",
	wp: "℘",
	wfr: "𝔴",
	wopf: "𝕨",
	wscr: "𝓌",
	xfr: "𝔵",
	xi: "ξ",
	xnis: "⋻",
	xopf: "𝕩",
	xscr: "𝓍",
	yacute: "ý",
	yacy: "я",
	ycirc: "ŷ",
	ycy: "ы",
	yen: "¥",
	yfr: "𝔶",
	yicy: "ї",
	yopf: "𝕪",
	yscr: "𝓎",
	yucy: "ю",
	yuml: "ÿ",
	zacute: "ź",
	zcaron: "ž",
	zcy: "з",
	zdot: "ż",
	zeta: "ζ",
	zfr: "𝔷",
	zhcy: "ж",
	zigrarr: "⇝",
	zopf: "𝕫",
	zscr: "𝓏",
	zwj: "‍",
	zwnj: "‌"
};
_e$1.ngsp = "";
var l$1 = (function(e) {
	return e[e.TAG_OPEN_START = 0] = "TAG_OPEN_START", e[e.TAG_OPEN_END = 1] = "TAG_OPEN_END", e[e.TAG_OPEN_END_VOID = 2] = "TAG_OPEN_END_VOID", e[e.TAG_CLOSE = 3] = "TAG_CLOSE", e[e.INCOMPLETE_TAG_OPEN = 4] = "INCOMPLETE_TAG_OPEN", e[e.TEXT = 5] = "TEXT", e[e.ESCAPABLE_RAW_TEXT = 6] = "ESCAPABLE_RAW_TEXT", e[e.RAW_TEXT = 7] = "RAW_TEXT", e[e.INTERPOLATION = 8] = "INTERPOLATION", e[e.ENCODED_ENTITY = 9] = "ENCODED_ENTITY", e[e.COMMENT_START = 10] = "COMMENT_START", e[e.COMMENT_END = 11] = "COMMENT_END", e[e.CDATA_START = 12] = "CDATA_START", e[e.CDATA_END = 13] = "CDATA_END", e[e.ATTR_NAME = 14] = "ATTR_NAME", e[e.ATTR_QUOTE = 15] = "ATTR_QUOTE", e[e.ATTR_VALUE_TEXT = 16] = "ATTR_VALUE_TEXT", e[e.ATTR_VALUE_INTERPOLATION = 17] = "ATTR_VALUE_INTERPOLATION", e[e.DOC_TYPE_START = 18] = "DOC_TYPE_START", e[e.DOC_TYPE_END = 19] = "DOC_TYPE_END", e[e.EXPANSION_FORM_START = 20] = "EXPANSION_FORM_START", e[e.EXPANSION_CASE_VALUE = 21] = "EXPANSION_CASE_VALUE", e[e.EXPANSION_CASE_EXP_START = 22] = "EXPANSION_CASE_EXP_START", e[e.EXPANSION_CASE_EXP_END = 23] = "EXPANSION_CASE_EXP_END", e[e.EXPANSION_FORM_END = 24] = "EXPANSION_FORM_END", e[e.BLOCK_OPEN_START = 25] = "BLOCK_OPEN_START", e[e.BLOCK_OPEN_END = 26] = "BLOCK_OPEN_END", e[e.BLOCK_CLOSE = 27] = "BLOCK_CLOSE", e[e.BLOCK_PARAMETER = 28] = "BLOCK_PARAMETER", e[e.INCOMPLETE_BLOCK_OPEN = 29] = "INCOMPLETE_BLOCK_OPEN", e[e.LET_START = 30] = "LET_START", e[e.LET_VALUE = 31] = "LET_VALUE", e[e.LET_END = 32] = "LET_END", e[e.INCOMPLETE_LET = 33] = "INCOMPLETE_LET", e[e.COMPONENT_OPEN_START = 34] = "COMPONENT_OPEN_START", e[e.COMPONENT_OPEN_END = 35] = "COMPONENT_OPEN_END", e[e.COMPONENT_OPEN_END_VOID = 36] = "COMPONENT_OPEN_END_VOID", e[e.COMPONENT_CLOSE = 37] = "COMPONENT_CLOSE", e[e.INCOMPLETE_COMPONENT_OPEN = 38] = "INCOMPLETE_COMPONENT_OPEN", e[e.DIRECTIVE_NAME = 39] = "DIRECTIVE_NAME", e[e.DIRECTIVE_OPEN = 40] = "DIRECTIVE_OPEN", e[e.DIRECTIVE_CLOSE = 41] = "DIRECTIVE_CLOSE", e[e.EOF = 42] = "EOF", e;
})({});
function it$1(e) {
	return e >= 9 && e <= 32 || e == 160;
}
function Ie$1(e) {
	return 48 <= e && e <= 57;
}
function Re$1(e) {
	return e >= 97 && e <= 122 || e >= 65 && e <= 90;
}
function ki(e) {
	return e >= 97 && e <= 102 || e >= 65 && e <= 70 || Ie$1(e);
}
function Me$1(e) {
	return e === 10 || e === 13;
}
function dr$1(e) {
	return 48 <= e && e <= 55;
}
function Dt$1(e) {
	return e === 39 || e === 34 || e === 96;
}
var qa$1 = class {
	constructor(e, t, r) {
		this.tokens = e, this.errors = t, this.nonNormalizedIcuExpressions = r;
	}
};
function Pi(e, t, r, n = {}) {
	let i = new Ua(new nt$1(e, t), r, n);
	return i.tokenize(), new qa$1(Xa$1(i.tokens), i.errors, i.nonNormalizedIcuExpressions);
}
var Fa$1 = /\r\n?/g;
function Se$1(e) {
	return `Unexpected character "${e === 0 ? "EOF" : String.fromCharCode(e)}"`;
}
function xi(e) {
	return `Unknown entity "${e}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
function Ha$1(e, t) {
	return `Unable to parse entity "${t}" - ${e} character reference entities must end with ";"`;
}
var gr$1 = (function(e) {
	return e.HEX = "hexadecimal", e.DEC = "decimal", e;
})(gr$1 || {}), Va$1 = [
	"@if",
	"@else",
	"@for",
	"@switch",
	"@case",
	"@default",
	"@empty",
	"@defer",
	"@placeholder",
	"@loading",
	"@error"
], st$1 = {
	start: "{{",
	end: "}}"
}, Ua = class {
	_cursor;
	_tokenizeIcu;
	_leadingTriviaCodePoints;
	_canSelfClose;
	_allowHtmComponentClosingTags;
	_currentTokenStart = null;
	_currentTokenType = null;
	_expansionCaseStack = [];
	_openDirectiveCount = 0;
	_inInterpolation = !1;
	_preserveLineEndings;
	_i18nNormalizeLineEndingsInICUs;
	_fullNameStack = [];
	_tokenizeBlocks;
	_tokenizeLet;
	_selectorlessEnabled;
	tokens = [];
	errors = [];
	nonNormalizedIcuExpressions = [];
	constructor(e, t, r) {
		this._getTagContentType = t, this._tokenizeIcu = r.tokenizeExpansionForms || !1, this._leadingTriviaCodePoints = r.leadingTriviaChars && r.leadingTriviaChars.map((i) => i.codePointAt(0) || 0), this._canSelfClose = r.canSelfClose || !1, this._allowHtmComponentClosingTags = r.allowHtmComponentClosingTags || !1;
		let n = r.range || {
			endPos: e.content.length,
			startPos: 0,
			startLine: 0,
			startCol: 0
		};
		this._cursor = r.escapedString ? new Ka$1(e, n) : new Oi(e, n), this._preserveLineEndings = r.preserveLineEndings || !1, this._i18nNormalizeLineEndingsInICUs = r.i18nNormalizeLineEndingsInICUs || !1, this._tokenizeBlocks = r.tokenizeBlocks ?? !0, this._tokenizeLet = r.tokenizeLet ?? !0, this._selectorlessEnabled = r.selectorlessEnabled ?? !1;
		try {
			this._cursor.init();
		} catch (i) {
			this.handleError(i);
		}
	}
	_processCarriageReturns(e) {
		return this._preserveLineEndings ? e : e.replace(Fa$1, `
`);
	}
	tokenize() {
		for (; this._cursor.peek() !== 0;) {
			let e = this._cursor.clone();
			try {
				if (this._attemptCharCode(60)) if (this._attemptCharCode(33)) this._attemptStr("[CDATA[") ? this._consumeCdata(e) : this._attemptStr("--") ? this._consumeComment(e) : this._attemptStrCaseInsensitive("doctype") ? this._consumeDocType(e) : this._consumeBogusComment(e);
				else if (this._attemptCharCode(47)) this._consumeTagClose(e);
				else {
					let t = this._cursor.clone();
					this._attemptCharCode(63) ? (this._cursor = t, this._consumeBogusComment(e)) : this._consumeTagOpen(e);
				}
				else this._tokenizeLet && this._cursor.peek() === 64 && !this._inInterpolation && this._isLetStart() ? this._consumeLetDeclaration(e) : this._tokenizeBlocks && this._isBlockStart() ? this._consumeBlockStart(e) : this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansionCase() && !this._isInExpansionForm() && this._attemptCharCode(125) ? this._consumeBlockEnd(e) : this._tokenizeIcu && this._tokenizeExpansionForm() || this._consumeWithInterpolation(l$1.TEXT, l$1.INTERPOLATION, () => this._isTextEnd(), () => this._isTagStart());
			} catch (t) {
				this.handleError(t);
			}
		}
		this._beginToken(l$1.EOF), this._endToken([]);
	}
	_getBlockName() {
		let e = !1, t = this._cursor.clone();
		return this._attemptCharCodeUntilFn((r) => it$1(r) ? !e : ja$1(r) ? (e = !0, !1) : !0), this._cursor.getChars(t).trim();
	}
	_consumeBlockStart(e) {
		this._requireCharCode(64), this._beginToken(l$1.BLOCK_OPEN_START, e);
		let t = this._endToken([this._getBlockName()]);
		if (this._cursor.peek() === 40) if (this._cursor.advance(), this._consumeBlockParameters(), this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(41)) this._attemptCharCodeUntilFn(v$1);
		else {
			t.type = l$1.INCOMPLETE_BLOCK_OPEN;
			return;
		}
		if (t.parts[0] === "default never" && this._attemptCharCode(59)) {
			this._beginToken(l$1.BLOCK_OPEN_END), this._endToken([]), this._beginToken(l$1.BLOCK_CLOSE), this._endToken([]);
			return;
		}
		this._attemptCharCode(123) ? (this._beginToken(l$1.BLOCK_OPEN_END), this._endToken([])) : this._isBlockStart() && (t.parts[0] === "case" || t.parts[0] === "default") ? (this._beginToken(l$1.BLOCK_OPEN_END), this._endToken([]), this._beginToken(l$1.BLOCK_CLOSE), this._endToken([])) : t.type = l$1.INCOMPLETE_BLOCK_OPEN;
	}
	_consumeBlockEnd(e) {
		this._beginToken(l$1.BLOCK_CLOSE, e), this._endToken([]);
	}
	_consumeBlockParameters() {
		for (this._attemptCharCodeUntilFn(Ai); this._cursor.peek() !== 41 && this._cursor.peek() !== 0;) {
			this._beginToken(l$1.BLOCK_PARAMETER);
			let e = this._cursor.clone(), t = null, r = 0;
			for (; this._cursor.peek() !== 59 && this._cursor.peek() !== 0 || t !== null;) {
				let n = this._cursor.peek();
				if (n === 92) this._cursor.advance();
				else if (n === t) t = null;
				else if (t === null && Dt$1(n)) t = n;
				else if (n === 40 && t === null) r++;
				else if (n === 41 && t === null) {
					if (r === 0) break;
					r > 0 && r--;
				}
				this._cursor.advance();
			}
			this._endToken([this._cursor.getChars(e)]), this._attemptCharCodeUntilFn(Ai);
		}
	}
	_consumeLetDeclaration(e) {
		if (this._requireStr("@let"), this._beginToken(l$1.LET_START, e), it$1(this._cursor.peek())) this._attemptCharCodeUntilFn(v$1);
		else {
			let r = this._endToken([this._cursor.getChars(e)]);
			r.type = l$1.INCOMPLETE_LET;
			return;
		}
		let t = this._endToken([this._getLetDeclarationName()]);
		if (this._attemptCharCodeUntilFn(v$1), !this._attemptCharCode(61)) {
			t.type = l$1.INCOMPLETE_LET;
			return;
		}
		this._attemptCharCodeUntilFn((r) => v$1(r) && !Me$1(r)), this._consumeLetDeclarationValue(), this._cursor.peek() === 59 ? (this._beginToken(l$1.LET_END), this._endToken([]), this._cursor.advance()) : (t.type = l$1.INCOMPLETE_LET, t.sourceSpan = this._cursor.getSpan(e));
	}
	_getLetDeclarationName() {
		let e = this._cursor.clone(), t = !1;
		return this._attemptCharCodeUntilFn((r) => Re$1(r) || r === 36 || r === 95 || t && Ie$1(r) ? (t = !0, !1) : !0), this._cursor.getChars(e).trim();
	}
	_consumeLetDeclarationValue() {
		let e = this._cursor.clone();
		for (this._beginToken(l$1.LET_VALUE, e); this._cursor.peek() !== 0;) {
			let t = this._cursor.peek();
			if (t === 59) break;
			Dt$1(t) && (this._cursor.advance(), this._attemptCharCodeUntilFn((r) => r === 92 ? (this._cursor.advance(), !1) : r === t)), this._cursor.advance();
		}
		this._endToken([this._cursor.getChars(e)]);
	}
	_tokenizeExpansionForm() {
		if (this.isExpansionFormStart()) return this._consumeExpansionFormStart(), !0;
		if ($a$1(this._cursor.peek()) && this._isInExpansionForm()) return this._consumeExpansionCaseStart(), !0;
		if (this._cursor.peek() === 125) {
			if (this._isInExpansionCase()) return this._consumeExpansionCaseEnd(), !0;
			if (this._isInExpansionForm()) return this._consumeExpansionFormEnd(), !0;
		}
		return !1;
	}
	_beginToken(e, t = this._cursor.clone()) {
		this._currentTokenStart = t, this._currentTokenType = e;
	}
	_endToken(e, t) {
		if (this._currentTokenStart === null) throw new ee$1(this._cursor.getSpan(t), "Programming error - attempted to end a token when there was no start to the token");
		if (this._currentTokenType === null) throw new ee$1(this._cursor.getSpan(this._currentTokenStart), "Programming error - attempted to end a token which has no token type");
		let r = {
			type: this._currentTokenType,
			parts: e,
			sourceSpan: (t ?? this._cursor).getSpan(this._currentTokenStart, this._leadingTriviaCodePoints)
		};
		return this.tokens.push(r), this._currentTokenStart = null, this._currentTokenType = null, r;
	}
	_createError(e, t) {
		this._isInExpansionForm() && (e += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`);
		let r = new ee$1(t, e);
		return this._currentTokenStart = null, this._currentTokenType = null, r;
	}
	handleError(e) {
		if (e instanceof Er$1 && (e = this._createError(e.msg, this._cursor.getSpan(e.cursor))), e instanceof ee$1) this.errors.push(e);
		else throw e;
	}
	_attemptCharCode(e) {
		return this._cursor.peek() === e ? (this._cursor.advance(), !0) : !1;
	}
	_attemptCharCodeCaseInsensitive(e) {
		return Ya$1(this._cursor.peek(), e) ? (this._cursor.advance(), !0) : !1;
	}
	_requireCharCode(e) {
		let t = this._cursor.clone();
		if (!this._attemptCharCode(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
	}
	_attemptStr(e) {
		let t = e.length;
		if (this._cursor.charsLeft() < t) return !1;
		let r = this._cursor.clone();
		for (let n = 0; n < t; n++) if (!this._attemptCharCode(e.charCodeAt(n))) return this._cursor = r, !1;
		return !0;
	}
	_attemptStrCaseInsensitive(e) {
		for (let t = 0; t < e.length; t++) if (!this._attemptCharCodeCaseInsensitive(e.charCodeAt(t))) return !1;
		return !0;
	}
	_requireStr(e) {
		let t = this._cursor.clone();
		if (!this._attemptStr(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
	}
	_requireStrCaseInsensitive(e) {
		let t = this._cursor.clone();
		if (!this._attemptStrCaseInsensitive(e)) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(t));
	}
	_attemptCharCodeUntilFn(e) {
		for (; !e(this._cursor.peek());) this._cursor.advance();
	}
	_requireCharCodeUntilFn(e, t) {
		let r = this._cursor.clone();
		if (this._attemptCharCodeUntilFn(e), this._cursor.diff(r) < t) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(r));
	}
	_attemptUntilChar(e) {
		for (; this._cursor.peek() !== e;) this._cursor.advance();
	}
	_readChar() {
		let e = String.fromCodePoint(this._cursor.peek());
		return this._cursor.advance(), e;
	}
	_peekStr(e) {
		let t = e.length;
		if (this._cursor.charsLeft() < t) return !1;
		let r = this._cursor.clone();
		for (let n = 0; n < t; n++) {
			if (r.peek() !== e.charCodeAt(n)) return !1;
			r.advance();
		}
		return !0;
	}
	_isBlockStart() {
		return this._cursor.peek() === 64 && Va$1.some((e) => this._peekStr(e));
	}
	_isLetStart() {
		return this._cursor.peek() === 64 && this._peekStr("@let");
	}
	_consumeEntity(e) {
		this._beginToken(l$1.ENCODED_ENTITY);
		let t = this._cursor.clone();
		if (this._cursor.advance(), this._attemptCharCode(35)) {
			let r = this._attemptCharCode(120) || this._attemptCharCode(88), n = this._cursor.clone();
			if (this._attemptCharCodeUntilFn(Ga$1), this._cursor.peek() != 59) {
				this._cursor.advance();
				let s = r ? gr$1.HEX : gr$1.DEC;
				throw this._createError(Ha$1(s, this._cursor.getChars(t)), this._cursor.getSpan());
			}
			let i = this._cursor.getChars(n);
			this._cursor.advance();
			try {
				let s = parseInt(i, r ? 16 : 10);
				this._endToken([String.fromCodePoint(s), this._cursor.getChars(t)]);
			} catch {
				throw this._createError(xi(this._cursor.getChars(t)), this._cursor.getSpan());
			}
		} else {
			let r = this._cursor.clone();
			if (this._attemptCharCodeUntilFn(za$1), this._cursor.peek() != 59) this._beginToken(e, t), this._cursor = r, this._endToken(["&"]);
			else {
				let n = this._cursor.getChars(r);
				this._cursor.advance();
				let i = _e$1.hasOwnProperty(n) && _e$1[n];
				if (!i) throw this._createError(xi(n), this._cursor.getSpan(t));
				this._endToken([i, `&${n};`]);
			}
		}
	}
	_consumeRawText(e, t) {
		this._beginToken(e ? l$1.ESCAPABLE_RAW_TEXT : l$1.RAW_TEXT);
		let r = [];
		for (;;) {
			let n = this._cursor.clone(), i = t();
			if (this._cursor = n, i) break;
			e && this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(r.join(""))]), r.length = 0, this._consumeEntity(l$1.ESCAPABLE_RAW_TEXT), this._beginToken(l$1.ESCAPABLE_RAW_TEXT)) : r.push(this._readChar());
		}
		this._endToken([this._processCarriageReturns(r.join(""))]);
	}
	_consumeComment(e) {
		this._beginToken(l$1.COMMENT_START, e), this._endToken([]), this._consumeRawText(!1, () => this._attemptStr("-->")), this._beginToken(l$1.COMMENT_END), this._requireStr("-->"), this._endToken([]);
	}
	_consumeBogusComment(e) {
		this._beginToken(l$1.COMMENT_START, e), this._endToken([]), this._consumeRawText(!1, () => this._cursor.peek() === 62), this._beginToken(l$1.COMMENT_END), this._cursor.advance(), this._endToken([]);
	}
	_consumeCdata(e) {
		this._beginToken(l$1.CDATA_START, e), this._endToken([]), this._consumeRawText(!1, () => this._attemptStr("]]>")), this._beginToken(l$1.CDATA_END), this._requireStr("]]>"), this._endToken([]);
	}
	_consumeDocType(e) {
		this._beginToken(l$1.DOC_TYPE_START, e), this._endToken([]), this._consumeRawText(!1, () => this._cursor.peek() === 62), this._beginToken(l$1.DOC_TYPE_END), this._cursor.advance(), this._endToken([]);
	}
	_consumePrefixAndName(e) {
		let t = this._cursor.clone(), r = "";
		for (; this._cursor.peek() !== 58 && !Wa$1(this._cursor.peek());) this._cursor.advance();
		let n;
		this._cursor.peek() === 58 ? (r = this._cursor.getChars(t), this._cursor.advance(), n = this._cursor.clone()) : n = t, this._requireCharCodeUntilFn(e, r === "" ? 0 : 1);
		let i = this._cursor.getChars(n);
		return [r, i];
	}
	_consumeSingleLineComment() {
		this._attemptCharCodeUntilFn((e) => Me$1(e) || e === 0), this._attemptCharCodeUntilFn(v$1);
	}
	_consumeMultiLineComment() {
		this._attemptCharCodeUntilFn((e) => {
			if (e === 0) return !0;
			if (e === 42) {
				let t = this._cursor.clone();
				return t.advance(), t.peek() === 47;
			}
			return !1;
		}), this._attemptStr("*/") && this._attemptCharCodeUntilFn(v$1);
	}
	_consumeTagOpen(e) {
		let t, r, n, i, s = [];
		try {
			if (this._selectorlessEnabled && It$1(this._cursor.peek())) i = this._consumeComponentOpenStart(e), [n, r, t] = i.parts, r && (n += `:${r}`), t && (n += `:${t}`), this._attemptCharCodeUntilFn(v$1);
			else {
				if (!Re$1(this._cursor.peek())) throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(e));
				i = this._consumeTagOpenStart(e), r = i.parts[0], t = n = i.parts[1], this._attemptCharCodeUntilFn(v$1);
			}
			for (;;) {
				if (this._attemptStr("//")) {
					this._consumeSingleLineComment();
					continue;
				}
				if (this._attemptStr("/*")) {
					this._consumeMultiLineComment();
					continue;
				}
				if (Li(this._cursor.peek())) break;
				if (this._selectorlessEnabled && this._cursor.peek() === 64) {
					let o = this._cursor.clone(), c = o.clone();
					c.advance(), It$1(c.peek()) && this._consumeDirective(o, c);
				} else {
					let o = this._consumeAttribute();
					s.push(o);
				}
			}
			i.type === l$1.COMPONENT_OPEN_START ? this._consumeComponentOpenEnd() : this._consumeTagOpenEnd();
		} catch (o) {
			if (o instanceof ee$1) {
				i ? i.type = i.type === l$1.COMPONENT_OPEN_START ? l$1.INCOMPLETE_COMPONENT_OPEN : l$1.INCOMPLETE_TAG_OPEN : (this._beginToken(l$1.TEXT, e), this._endToken(["<"]));
				return;
			}
			throw o;
		}
		if (this._canSelfClose && this.tokens[this.tokens.length - 1].type === l$1.TAG_OPEN_END_VOID) return;
		let a = this._getTagContentType(t, r, this._fullNameStack.length > 0, s);
		this._handleFullNameStackForTagOpen(r, t), a === R$1.RAW_TEXT ? this._consumeRawTextWithTagClose(r, i, n, !1) : a === R$1.ESCAPABLE_RAW_TEXT && this._consumeRawTextWithTagClose(r, i, n, !0);
	}
	_consumeRawTextWithTagClose(e, t, r, n) {
		this._consumeRawText(n, () => !this._attemptCharCode(60) || !this._attemptCharCode(47) || (this._attemptCharCodeUntilFn(v$1), !this._attemptStrCaseInsensitive(e && t.type !== l$1.COMPONENT_OPEN_START ? `${e}:${r}` : r)) ? !1 : (this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(62))), this._beginToken(t.type === l$1.COMPONENT_OPEN_START ? l$1.COMPONENT_CLOSE : l$1.TAG_CLOSE), this._requireCharCodeUntilFn((i) => i === 62, 3), this._cursor.advance(), this._endToken(t.parts), this._handleFullNameStackForTagClose(e, r);
	}
	_consumeTagOpenStart(e) {
		this._beginToken(l$1.TAG_OPEN_START, e);
		let t = this._consumePrefixAndName(Ee$1);
		return this._endToken(t);
	}
	_consumeComponentOpenStart(e) {
		this._beginToken(l$1.COMPONENT_OPEN_START, e);
		let t = this._consumeComponentName();
		return this._endToken(t);
	}
	_consumeComponentName() {
		let e = this._cursor.clone();
		for (; Ni(this._cursor.peek());) this._cursor.advance();
		let t = this._cursor.getChars(e), r = "", n = "";
		return this._cursor.peek() === 58 && (this._cursor.advance(), [r, n] = this._consumePrefixAndName(Ee$1)), [
			t,
			r,
			n
		];
	}
	_consumeAttribute() {
		let [e, t] = this._consumeAttributeName(), r;
		return this._attemptCharCodeUntilFn(v$1), this._attemptCharCode(61) && (this._attemptCharCodeUntilFn(v$1), r = this._consumeAttributeValue()), this._attemptCharCodeUntilFn(v$1), {
			prefix: e,
			name: t,
			value: r
		};
	}
	_consumeAttributeName() {
		let e = this._cursor.peek();
		if (e === 39 || e === 34) throw this._createError(Se$1(e), this._cursor.getSpan());
		this._beginToken(l$1.ATTR_NAME);
		let t;
		if (this._openDirectiveCount > 0) {
			let n = 0;
			t = (i) => {
				if (this._openDirectiveCount > 0) {
					if (i === 40) n++;
					else if (i === 41) {
						if (n === 0) return !0;
						n--;
					}
				}
				return Ee$1(i);
			};
		} else if (e === 91) {
			let n = 0;
			t = (i) => (i === 91 ? n++ : i === 93 && n--, n <= 0 ? Ee$1(i) : Me$1(i));
		} else t = Ee$1;
		let r = this._consumePrefixAndName(t);
		return this._endToken(r), r;
	}
	_consumeAttributeValue() {
		let e;
		if (this._cursor.peek() === 39 || this._cursor.peek() === 34) {
			let t = this._cursor.peek();
			this._consumeQuote(t);
			let r = () => this._cursor.peek() === t;
			e = this._consumeWithInterpolation(l$1.ATTR_VALUE_TEXT, l$1.ATTR_VALUE_INTERPOLATION, r, r), this._consumeQuote(t);
		} else {
			let t = () => Ee$1(this._cursor.peek());
			e = this._consumeWithInterpolation(l$1.ATTR_VALUE_TEXT, l$1.ATTR_VALUE_INTERPOLATION, t, t);
		}
		return e;
	}
	_consumeQuote(e) {
		this._beginToken(l$1.ATTR_QUOTE), this._requireCharCode(e), this._endToken([String.fromCodePoint(e)]);
	}
	_consumeTagOpenEnd() {
		let e = this._attemptCharCode(47) ? l$1.TAG_OPEN_END_VOID : l$1.TAG_OPEN_END;
		this._beginToken(e), this._requireCharCode(62), this._endToken([]);
	}
	_consumeComponentOpenEnd() {
		let e = this._attemptCharCode(47) ? l$1.COMPONENT_OPEN_END_VOID : l$1.COMPONENT_OPEN_END;
		this._beginToken(e), this._requireCharCode(62), this._endToken([]);
	}
	_consumeTagClose(e) {
		if (this._selectorlessEnabled) {
			let t = e.clone();
			for (; t.peek() !== 62 && !It$1(t.peek());) t.advance();
			if (It$1(t.peek())) {
				this._beginToken(l$1.COMPONENT_CLOSE, e);
				let r = this._consumeComponentName();
				this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken(r);
				return;
			}
		}
		if (this._beginToken(l$1.TAG_CLOSE, e), this._attemptCharCodeUntilFn(v$1), this._allowHtmComponentClosingTags && this._attemptCharCode(47)) this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken([]);
		else {
			let [t, r] = this._consumePrefixAndName(Ee$1);
			this._attemptCharCodeUntilFn(v$1), this._requireCharCode(62), this._endToken([t, r]), this._handleFullNameStackForTagClose(t, r);
		}
	}
	_consumeExpansionFormStart() {
		this._beginToken(l$1.EXPANSION_FORM_START), this._requireCharCode(123), this._endToken([]), this._expansionCaseStack.push(l$1.EXPANSION_FORM_START), this._beginToken(l$1.RAW_TEXT);
		let e = this._readUntil(44), t = this._processCarriageReturns(e);
		if (this._i18nNormalizeLineEndingsInICUs) this._endToken([t]);
		else {
			let n = this._endToken([e]);
			t !== e && this.nonNormalizedIcuExpressions.push(n);
		}
		this._requireCharCode(44), this._attemptCharCodeUntilFn(v$1), this._beginToken(l$1.RAW_TEXT);
		let r = this._readUntil(44);
		this._endToken([r]), this._requireCharCode(44), this._attemptCharCodeUntilFn(v$1);
	}
	_consumeExpansionCaseStart() {
		this._beginToken(l$1.EXPANSION_CASE_VALUE);
		let e = this._readUntil(123).trim();
		this._endToken([e]), this._attemptCharCodeUntilFn(v$1), this._beginToken(l$1.EXPANSION_CASE_EXP_START), this._requireCharCode(123), this._endToken([]), this._attemptCharCodeUntilFn(v$1), this._expansionCaseStack.push(l$1.EXPANSION_CASE_EXP_START);
	}
	_consumeExpansionCaseEnd() {
		this._beginToken(l$1.EXPANSION_CASE_EXP_END), this._requireCharCode(125), this._endToken([]), this._attemptCharCodeUntilFn(v$1), this._expansionCaseStack.pop();
	}
	_consumeExpansionFormEnd() {
		this._beginToken(l$1.EXPANSION_FORM_END), this._requireCharCode(125), this._endToken([]), this._expansionCaseStack.pop();
	}
	_consumeWithInterpolation(e, t, r, n) {
		this._beginToken(e);
		let i = [];
		for (; !r();) {
			let a = this._cursor.clone();
			this._attemptStr(st$1.start) ? (this._endToken([this._processCarriageReturns(i.join(""))], a), i.length = 0, this._consumeInterpolation(t, a, n), this._beginToken(e)) : this._cursor.peek() === 38 ? (this._endToken([this._processCarriageReturns(i.join(""))]), i.length = 0, this._consumeEntity(e), this._beginToken(e)) : i.push(this._readChar());
		}
		this._inInterpolation = !1;
		let s = this._processCarriageReturns(i.join(""));
		return this._endToken([s]), s;
	}
	_consumeInterpolation(e, t, r) {
		let n = [];
		this._beginToken(e, t), n.push(st$1.start);
		let i = this._cursor.clone(), s = null, a = !1;
		for (; this._cursor.peek() !== 0 && (r === null || !r());) {
			let o = this._cursor.clone();
			if (this._isTagStart()) {
				this._cursor = o, n.push(this._getProcessedChars(i, o)), this._endToken(n);
				return;
			}
			if (s === null) if (this._attemptStr(st$1.end)) {
				n.push(this._getProcessedChars(i, o)), n.push(st$1.end), this._endToken(n);
				return;
			} else this._attemptStr("//") && (a = !0);
			let c = this._cursor.peek();
			this._cursor.advance(), c === 92 ? this._cursor.advance() : c === s ? s = null : !a && s === null && Dt$1(c) && (s = c);
		}
		n.push(this._getProcessedChars(i, this._cursor)), this._endToken(n);
	}
	_consumeDirective(e, t) {
		for (this._requireCharCode(64), this._cursor.advance(); Ni(this._cursor.peek());) this._cursor.advance();
		this._beginToken(l$1.DIRECTIVE_NAME, e);
		let r = this._cursor.getChars(t);
		if (this._endToken([r]), this._attemptCharCodeUntilFn(v$1), this._cursor.peek() === 40) {
			for (this._openDirectiveCount++, this._beginToken(l$1.DIRECTIVE_OPEN), this._cursor.advance(), this._endToken([]), this._attemptCharCodeUntilFn(v$1); !Li(this._cursor.peek()) && this._cursor.peek() !== 41;) this._consumeAttribute();
			if (this._attemptCharCodeUntilFn(v$1), this._openDirectiveCount--, this._cursor.peek() !== 41) {
				if (this._cursor.peek() === 62 || this._cursor.peek() === 47) return;
				throw this._createError(Se$1(this._cursor.peek()), this._cursor.getSpan(e));
			}
			this._beginToken(l$1.DIRECTIVE_CLOSE), this._cursor.advance(), this._endToken([]), this._attemptCharCodeUntilFn(v$1);
		}
	}
	_getProcessedChars(e, t) {
		return this._processCarriageReturns(t.getChars(e));
	}
	_isTextEnd() {
		return !!(this._isTagStart() || this._cursor.peek() === 0 || this._tokenizeIcu && !this._inInterpolation && (this.isExpansionFormStart() || this._cursor.peek() === 125 && this._isInExpansionCase()) || this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansion() && (this._isBlockStart() || this._isLetStart() || this._cursor.peek() === 125));
	}
	_isTagStart() {
		if (this._cursor.peek() === 60) {
			let e = this._cursor.clone();
			e.advance();
			let t = e.peek();
			if (97 <= t && t <= 122 || 65 <= t && t <= 90 || t === 47 || t === 33) return !0;
		}
		return !1;
	}
	_readUntil(e) {
		let t = this._cursor.clone();
		return this._attemptUntilChar(e), this._cursor.getChars(t);
	}
	_isInExpansion() {
		return this._isInExpansionCase() || this._isInExpansionForm();
	}
	_isInExpansionCase() {
		return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === l$1.EXPANSION_CASE_EXP_START;
	}
	_isInExpansionForm() {
		return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === l$1.EXPANSION_FORM_START;
	}
	isExpansionFormStart() {
		if (this._cursor.peek() !== 123) return !1;
		let e = this._cursor.clone(), t = this._attemptStr(st$1.start);
		return this._cursor = e, !t;
	}
	_handleFullNameStackForTagOpen(e, t) {
		let r = fe$1(e, t);
		(this._fullNameStack.length === 0 || this._fullNameStack[this._fullNameStack.length - 1] === r) && this._fullNameStack.push(r);
	}
	_handleFullNameStackForTagClose(e, t) {
		let r = fe$1(e, t);
		this._fullNameStack.length !== 0 && this._fullNameStack[this._fullNameStack.length - 1] === r && this._fullNameStack.pop();
	}
};
function v$1(e) {
	return !it$1(e) || e === 0;
}
function Ee$1(e) {
	return it$1(e) || e === 62 || e === 60 || e === 47 || e === 39 || e === 34 || e === 61 || e === 0;
}
function Wa$1(e) {
	return (e < 97 || 122 < e) && (e < 65 || 90 < e) && (e < 48 || e > 57);
}
function Ga$1(e) {
	return e === 59 || e === 0 || !ki(e);
}
function za$1(e) {
	return e === 59 || e === 0 || !(Re$1(e) || Ie$1(e));
}
function $a$1(e) {
	return e !== 125;
}
function Ya$1(e, t) {
	return yi(e) === yi(t);
}
function yi(e) {
	return e >= 97 && e <= 122 ? e - 97 + 65 : e;
}
function ja$1(e) {
	return Re$1(e) || Ie$1(e) || e === 95;
}
function Ai(e) {
	return e !== 59 && v$1(e);
}
function It$1(e) {
	return e === 95 || e >= 65 && e <= 90;
}
function Ni(e) {
	return Re$1(e) || Ie$1(e) || e === 95;
}
function Li(e) {
	return e === 47 || e === 62 || e === 60 || e === 0;
}
function Xa$1(e) {
	let t = [], r;
	for (let n = 0; n < e.length; n++) {
		let i = e[n];
		r && r.type === l$1.TEXT && i.type === l$1.TEXT || r && r.type === l$1.ATTR_VALUE_TEXT && i.type === l$1.ATTR_VALUE_TEXT ? (r.parts[0] += i.parts[0], r.sourceSpan.end = i.sourceSpan.end) : (r = i, t.push(r));
	}
	return t;
}
var Oi = class _r {
	state;
	file;
	input;
	end;
	constructor(t, r) {
		if (t instanceof _r) {
			this.file = t.file, this.input = t.input, this.end = t.end;
			let n = t.state;
			this.state = {
				peek: n.peek,
				offset: n.offset,
				line: n.line,
				column: n.column
			};
		} else {
			if (!r) throw new Error("Programming error: the range argument must be provided with a file argument.");
			this.file = t, this.input = t.content, this.end = r.endPos, this.state = {
				peek: -1,
				offset: r.startPos,
				line: r.startLine,
				column: r.startCol
			};
		}
	}
	clone() {
		return new _r(this);
	}
	peek() {
		return this.state.peek;
	}
	charsLeft() {
		return this.end - this.state.offset;
	}
	diff(t) {
		return this.state.offset - t.state.offset;
	}
	advance() {
		this.advanceState(this.state);
	}
	init() {
		this.updatePeek(this.state);
	}
	getSpan(t, r) {
		t = t || this;
		let n = t;
		if (r) for (; this.diff(t) > 0 && r.indexOf(t.peek()) !== -1;) n === t && (t = t.clone()), t.advance();
		let i = this.locationFromCursor(t);
		return new h(i, this.locationFromCursor(this), n !== t ? this.locationFromCursor(n) : i);
	}
	getChars(t) {
		return this.input.substring(t.state.offset, this.state.offset);
	}
	charAt(t) {
		return this.input.charCodeAt(t);
	}
	advanceState(t) {
		if (t.offset >= this.end) throw this.state = t, new Er$1("Unexpected character \"EOF\"", this);
		let r = this.charAt(t.offset);
		r === 10 ? (t.line++, t.column = 0) : Me$1(r) || t.column++, t.offset++, this.updatePeek(t);
	}
	updatePeek(t) {
		t.peek = t.offset >= this.end ? 0 : this.charAt(t.offset);
	}
	locationFromCursor(t) {
		return new De$1(t.file, t.state.offset, t.state.line, t.state.column);
	}
}, Ka$1 = class Sr extends Oi {
	internalState;
	constructor(t, r) {
		t instanceof Sr ? (super(t), this.internalState = { ...t.internalState }) : (super(t, r), this.internalState = this.state);
	}
	advance() {
		this.state = this.internalState, super.advance(), this.processEscapeSequence();
	}
	init() {
		super.init(), this.processEscapeSequence();
	}
	clone() {
		return new Sr(this);
	}
	getChars(t) {
		let r = t.clone(), n = "";
		for (; r.internalState.offset < this.internalState.offset;) n += String.fromCodePoint(r.peek()), r.advance();
		return n;
	}
	processEscapeSequence() {
		let t = () => this.internalState.peek;
		if (t() === 92) if (this.internalState = { ...this.state }, this.advanceState(this.internalState), t() === 110) this.state.peek = 10;
		else if (t() === 114) this.state.peek = 13;
		else if (t() === 118) this.state.peek = 11;
		else if (t() === 116) this.state.peek = 9;
		else if (t() === 98) this.state.peek = 8;
		else if (t() === 102) this.state.peek = 12;
		else if (t() === 117) if (this.advanceState(this.internalState), t() === 123) {
			this.advanceState(this.internalState);
			let r = this.clone(), n = 0;
			for (; t() !== 125;) this.advanceState(this.internalState), n++;
			this.state.peek = this.decodeHexDigits(r, n);
		} else {
			let r = this.clone();
			this.advanceState(this.internalState), this.advanceState(this.internalState), this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r, 4);
		}
		else if (t() === 120) {
			this.advanceState(this.internalState);
			let r = this.clone();
			this.advanceState(this.internalState), this.state.peek = this.decodeHexDigits(r, 2);
		} else if (dr$1(t())) {
			let r = "", n = 0, i = this.clone();
			for (; dr$1(t()) && n < 3;) i = this.clone(), r += String.fromCodePoint(t()), this.advanceState(this.internalState), n++;
			this.state.peek = parseInt(r, 8), this.internalState = i.internalState;
		} else Me$1(this.internalState.peek) ? (this.advanceState(this.internalState), this.state = this.internalState) : this.state.peek = this.internalState.peek;
	}
	decodeHexDigits(t, r) {
		let n = this.input.slice(t.internalState.offset, t.internalState.offset + r), i = parseInt(n, 16);
		if (isNaN(i)) throw t.state = t.internalState, new Er$1("Invalid hexadecimal escape sequence", t);
		return i;
	}
}, Er$1 = class extends Error {
	constructor(e, t) {
		super(e), this.msg = e, this.cursor = t, Object.setPrototypeOf(this, new.target.prototype);
	}
};
var y = class Ri extends ee$1 {
	static create(t, r, n) {
		return new Ri(t, r, n);
	}
	constructor(t, r, n) {
		super(r, n), this.elementName = t;
	}
}, Qa$1 = class {
	constructor(e, t) {
		this.rootNodes = e, this.errors = t;
	}
}, Mi = class {
	constructor(e) {
		this.getTagDefinition = e;
	}
	parse(e, t, r, n = !1, i) {
		let s = (m) => (_, ...T) => m(_.toLowerCase(), ...T), a = n ? this.getTagDefinition : s(this.getTagDefinition), o = (m) => a(m).getContentType(), c = n ? i : s(i), u = Pi(e, t, i ? (m, _, T, P) => {
			let z = c(m, _, T, P);
			return z !== void 0 ? z : o(m);
		} : o, r), p = r && r.canSelfClose || !1, d = r && r.allowHtmComponentClosingTags || !1, g = new Ja$1(u.tokens, a, p, d, n);
		return g.build(), new Qa$1(g.rootNodes, [...u.errors, ...g.errors]);
	}
}, Ja$1 = class Bi {
	_index = -1;
	_peek;
	_containerStack = [];
	rootNodes = [];
	errors = [];
	constructor(t, r, n, i, s) {
		this.tokens = t, this.tagDefinitionResolver = r, this.canSelfClose = n, this.allowHtmComponentClosingTags = i, this.isTagNameCaseSensitive = s, this._advance();
	}
	build() {
		for (; this._peek.type !== l$1.EOF;) this._peek.type === l$1.TAG_OPEN_START || this._peek.type === l$1.INCOMPLETE_TAG_OPEN ? this._consumeElementStartTag(this._advance()) : this._peek.type === l$1.TAG_CLOSE ? (this._closeVoidElement(), this._consumeElementEndTag(this._advance())) : this._peek.type === l$1.CDATA_START ? (this._closeVoidElement(), this._consumeCdata(this._advance())) : this._peek.type === l$1.COMMENT_START ? (this._closeVoidElement(), this._consumeComment(this._advance())) : this._peek.type === l$1.TEXT || this._peek.type === l$1.RAW_TEXT || this._peek.type === l$1.ESCAPABLE_RAW_TEXT ? (this._closeVoidElement(), this._consumeText(this._advance())) : this._peek.type === l$1.EXPANSION_FORM_START ? this._consumeExpansion(this._advance()) : this._peek.type === l$1.BLOCK_OPEN_START ? (this._closeVoidElement(), this._consumeBlockOpen(this._advance())) : this._peek.type === l$1.BLOCK_CLOSE ? (this._closeVoidElement(), this._consumeBlockClose(this._advance())) : this._peek.type === l$1.INCOMPLETE_BLOCK_OPEN ? (this._closeVoidElement(), this._consumeIncompleteBlock(this._advance())) : this._peek.type === l$1.LET_START ? (this._closeVoidElement(), this._consumeLet(this._advance())) : this._peek.type === l$1.DOC_TYPE_START ? this._consumeDocType(this._advance()) : this._peek.type === l$1.INCOMPLETE_LET ? (this._closeVoidElement(), this._consumeIncompleteLet(this._advance())) : this._peek.type === l$1.COMPONENT_OPEN_START || this._peek.type === l$1.INCOMPLETE_COMPONENT_OPEN ? this._consumeComponentStartTag(this._advance()) : this._peek.type === l$1.COMPONENT_CLOSE ? this._consumeComponentEndTag(this._advance()) : this._advance();
		for (let t of this._containerStack) t instanceof ge$1 && this.errors.push(y.create(t.name, t.sourceSpan, `Unclosed block "${t.name}"`));
	}
	_advance() {
		let t = this._peek;
		return this._index < this.tokens.length - 1 && this._index++, this._peek = this.tokens[this._index], t;
	}
	_advanceIf(t) {
		return this._peek.type === t ? this._advance() : null;
	}
	_consumeCdata(t) {
		let r = this._advance(), n = this._getText(r), i = this._advanceIf(l$1.CDATA_END);
		this._addToParent(new Si(n, new h(t.sourceSpan.start, (i || r).sourceSpan.end), [r]));
	}
	_consumeComment(t) {
		let r = this._advanceIf(l$1.RAW_TEXT), n = this._advanceIf(l$1.COMMENT_END), i = r != null ? r.parts[0].trim() : null, s = n == null ? t.sourceSpan : new h(t.sourceSpan.start, n.sourceSpan.end, t.sourceSpan.fullStart);
		this._addToParent(new Ti(i, s));
	}
	_consumeDocType(t) {
		let r = this._advanceIf(l$1.RAW_TEXT), n = this._advanceIf(l$1.DOC_TYPE_END), i = r != null ? r.parts[0].trim() : null, s = new h(t.sourceSpan.start, (n || r || t).sourceSpan.end);
		this._addToParent(new bi(i, s));
	}
	_consumeExpansion(t) {
		let r = this._advance(), n = this._advance(), i = [];
		for (; this._peek.type === l$1.EXPANSION_CASE_VALUE;) {
			let a = this._parseExpansionCase();
			if (!a) return;
			i.push(a);
		}
		if (this._peek.type !== l$1.EXPANSION_FORM_END) {
			this.errors.push(y.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '}'."));
			return;
		}
		let s = new h(t.sourceSpan.start, this._peek.sourceSpan.end, t.sourceSpan.fullStart);
		this._addToParent(new Ei(r.parts[0], n.parts[0], i, s, r.sourceSpan)), this._advance();
	}
	_parseExpansionCase() {
		let t = this._advance();
		if (this._peek.type !== l$1.EXPANSION_CASE_EXP_START) return this.errors.push(y.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '{'.")), null;
		let r = this._advance(), n = this._collectExpansionExpTokens(r);
		if (!n) return null;
		let i = this._advance();
		n.push({
			type: l$1.EOF,
			parts: [],
			sourceSpan: i.sourceSpan
		});
		let s = new Bi(n, this.tagDefinitionResolver, this.canSelfClose, this.allowHtmComponentClosingTags, this.isTagNameCaseSensitive);
		if (s.build(), s.errors.length > 0) return this.errors = this.errors.concat(s.errors), null;
		let a = new h(t.sourceSpan.start, i.sourceSpan.end, t.sourceSpan.fullStart), o = new h(r.sourceSpan.start, i.sourceSpan.end, r.sourceSpan.fullStart);
		return new Ci(t.parts[0], s.rootNodes, a, t.sourceSpan, o);
	}
	_collectExpansionExpTokens(t) {
		let r = [], n = [l$1.EXPANSION_CASE_EXP_START];
		for (;;) {
			if ((this._peek.type === l$1.EXPANSION_FORM_START || this._peek.type === l$1.EXPANSION_CASE_EXP_START) && n.push(this._peek.type), this._peek.type === l$1.EXPANSION_CASE_EXP_END) if (Di$1(n, l$1.EXPANSION_CASE_EXP_START)) {
				if (n.pop(), n.length === 0) return r;
			} else return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
			if (this._peek.type === l$1.EXPANSION_FORM_END) if (Di$1(n, l$1.EXPANSION_FORM_START)) n.pop();
			else return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
			if (this._peek.type === l$1.EOF) return this.errors.push(y.create(null, t.sourceSpan, "Invalid ICU message. Missing '}'.")), null;
			r.push(this._advance());
		}
	}
	_getText(t) {
		let r = t.parts[0];
		if (r.length > 0 && r[0] == `
`) {
			var n;
			let i = this._getClosestElementLikeParent();
			i != null && i.children.length == 0 && !((n = this._getTagDefinition(i)) === null || n === void 0) && n.ignoreFirstLf && (r = r.substring(1));
		}
		return r;
	}
	_consumeText(t) {
		let r = [t], n = t.sourceSpan, i = t.parts[0];
		if (i.length > 0 && i[0] === `
`) {
			var s;
			let a = this._getContainer();
			a != null && a.children.length === 0 && !((s = this._getTagDefinition(a)) === null || s === void 0) && s.ignoreFirstLf && (i = i.substring(1), r[0] = {
				type: t.type,
				sourceSpan: t.sourceSpan,
				parts: [i]
			});
		}
		for (; this._peek.type === l$1.INTERPOLATION || this._peek.type === l$1.TEXT || this._peek.type === l$1.ENCODED_ENTITY;) t = this._advance(), r.push(t), t.type === l$1.INTERPOLATION ? i += t.parts.join("").replace(/&([^;]+);/g, Ii) : t.type === l$1.ENCODED_ENTITY ? i += t.parts[0] : i += t.parts.join("");
		if (i.length > 0) {
			let a = t.sourceSpan;
			this._addToParent(new _i(i, new h(n.start, a.end, n.fullStart, n.details), r));
		}
	}
	_closeVoidElement() {
		var t;
		let r = this._getContainer();
		r !== null && !((t = this._getTagDefinition(r)) === null || t === void 0) && t.isVoid && this._containerStack.pop();
	}
	_consumeElementStartTag(t) {
		var r;
		let n = [], i = [];
		this._consumeAttributesAndDirectives(n, i);
		let s = this._getElementFullName(t, this._getClosestElementLikeParent()), a = this._getTagDefinition(s), o = !1;
		if (this._peek.type === l$1.TAG_OPEN_END_VOID) {
			this._advance(), o = !0;
			let T = this._getTagDefinition(s);
			this.canSelfClose || T?.canSelfClose || Pe$1(s) !== null || T?.isVoid || this.errors.push(y.create(s, t.sourceSpan, `Only void, custom and foreign elements can be self closed "${t.parts[1]}"`));
		} else this._peek.type === l$1.TAG_OPEN_END && (this._advance(), o = !1);
		let c = this._peek.sourceSpan.fullStart, u = new h(t.sourceSpan.start, c, t.sourceSpan.fullStart), p = new h(t.sourceSpan.start, c, t.sourceSpan.fullStart), d = new h(t.sourceSpan.start.moveBy(1), t.sourceSpan.end), g = new te$1(s, n, i, [], o, u, p, void 0, d, a?.isVoid ?? !1), m = this._getContainer(), _ = m !== null && !!(!((r = this._getTagDefinition(m)) === null || r === void 0) && r.isClosedByChild(g.name));
		this._pushContainer(g, _), o ? this._popContainer(s, te$1, u) : t.type === l$1.INCOMPLETE_TAG_OPEN && (this._popContainer(s, te$1, null), this.errors.push(y.create(s, u, `Opening tag "${s}" not terminated.`)));
	}
	_consumeComponentStartTag(t) {
		var r;
		let n = t.parts[0], i = [], s = [];
		this._consumeAttributesAndDirectives(i, s);
		let a = this._getClosestElementLikeParent(), o = this._getComponentTagName(t, a), c = this._getComponentFullName(t, a), u = this._peek.type === l$1.COMPONENT_OPEN_END_VOID;
		this._advance();
		let p = this._peek.sourceSpan.fullStart, d = new h(t.sourceSpan.start, p, t.sourceSpan.fullStart), g = new G$1(n, o, c, i, s, [], u, d, new h(t.sourceSpan.start, p, t.sourceSpan.fullStart), void 0), m = this._getContainer(), _ = m !== null && g.tagName !== null && !!(!((r = this._getTagDefinition(m)) === null || r === void 0) && r.isClosedByChild(g.tagName));
		this._pushContainer(g, _), u ? this._popContainer(c, G$1, d) : t.type === l$1.INCOMPLETE_COMPONENT_OPEN && (this._popContainer(c, G$1, null), this.errors.push(y.create(c, d, `Opening tag "${c}" not terminated.`)));
	}
	_consumeAttributesAndDirectives(t, r) {
		for (; this._peek.type === l$1.ATTR_NAME || this._peek.type === l$1.DIRECTIVE_NAME;) this._peek.type === l$1.DIRECTIVE_NAME ? r.push(this._consumeDirective(this._peek)) : t.push(this._consumeAttr(this._advance()));
	}
	_consumeComponentEndTag(t) {
		let r = this._getComponentFullName(t, this._getClosestElementLikeParent());
		if (!this._popContainer(r, G$1, t.sourceSpan)) {
			let n = this._containerStack[this._containerStack.length - 1], i;
			n instanceof G$1 && n.componentName === t.parts[0] ? i = `, did you mean "${n.fullName}"?` : i = ". It may happen when the tag has already been closed by another tag.";
			let s = `Unexpected closing tag "${r}"${i}`;
			this.errors.push(y.create(r, t.sourceSpan, s));
		}
	}
	_getTagDefinition(t) {
		return typeof t == "string" ? this.tagDefinitionResolver(t) : t instanceof te$1 ? this.tagDefinitionResolver(t.name) : t instanceof G$1 && t.tagName !== null ? this.tagDefinitionResolver(t.tagName) : null;
	}
	_pushContainer(t, r) {
		r && this._containerStack.pop(), this._addToParent(t), this._containerStack.push(t);
	}
	_consumeElementEndTag(t) {
		var r;
		let n = this.allowHtmComponentClosingTags && t.parts.length === 0 ? null : this._getElementFullName(t, this._getClosestElementLikeParent());
		if (n && !((r = this._getTagDefinition(n)) === null || r === void 0) && r.isVoid) this.errors.push(y.create(n, t.sourceSpan, `Void elements do not have end tags "${t.parts[1]}"`));
		else if (!this._popContainer(n, te$1, t.sourceSpan)) {
			let i = `Unexpected closing tag "${n}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
			this.errors.push(y.create(n, t.sourceSpan, i));
		}
	}
	_popContainer(t, r, n) {
		let i = !1;
		for (let a = this._containerStack.length - 1; a >= 0; a--) {
			var s;
			let o = this._containerStack[a], c = o instanceof G$1 ? o.fullName : o.name;
			if (Pe$1(c) ? c === t : (c === t || t === null) && o instanceof r) return o.endSourceSpan = n, o.sourceSpan.end = n !== null ? n.end : o.sourceSpan.end, this._containerStack.splice(a, this._containerStack.length - a), !i;
			(o instanceof ge$1 || !(!((s = this._getTagDefinition(o)) === null || s === void 0) && s.closedByParent)) && (i = !0);
		}
		return !1;
	}
	_consumeAttr(t) {
		let r = fe$1(t.parts[0], t.parts[1]), n = t.sourceSpan.end, i;
		this._peek.type === l$1.ATTR_QUOTE && (i = this._advance());
		let s = "", a = [], o, c;
		if (this._peek.type === l$1.ATTR_VALUE_TEXT) for (o = this._peek.sourceSpan, c = this._peek.sourceSpan.end; this._peek.type === l$1.ATTR_VALUE_TEXT || this._peek.type === l$1.ATTR_VALUE_INTERPOLATION || this._peek.type === l$1.ENCODED_ENTITY;) {
			let p = this._advance();
			a.push(p), p.type === l$1.ATTR_VALUE_INTERPOLATION ? s += p.parts.join("").replace(/&([^;]+);/g, Ii) : p.type === l$1.ENCODED_ENTITY ? s += p.parts[0] : s += p.parts.join(""), c = n = p.sourceSpan.end;
		}
		this._peek.type === l$1.ATTR_QUOTE && (c = n = this._advance().sourceSpan.end);
		let u = o && c && new h(i?.sourceSpan.start ?? o.start, c, i?.sourceSpan.fullStart ?? o.fullStart);
		return new vi(r, s, new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), t.sourceSpan, u, a.length > 0 ? a : void 0, void 0);
	}
	_consumeDirective(t) {
		let r = [], n = t.sourceSpan.end, i = null;
		if (this._advance(), this._peek.type === l$1.DIRECTIVE_OPEN) {
			for (n = this._peek.sourceSpan.end, this._advance(); this._peek.type === l$1.ATTR_NAME;) r.push(this._consumeAttr(this._advance()));
			this._peek.type === l$1.DIRECTIVE_CLOSE ? (i = this._peek.sourceSpan, this._advance()) : this.errors.push(y.create(null, t.sourceSpan, "Unterminated directive definition"));
		}
		let s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new h(s.start, i === null ? t.sourceSpan.end : i.end, s.fullStart);
		return new wi(t.parts[0], r, a, s, i);
	}
	_consumeBlockOpen(t) {
		let r = [];
		for (; this._peek.type === l$1.BLOCK_PARAMETER;) {
			let o = this._advance();
			r.push(new hr$1(o.parts[0], o.sourceSpan));
		}
		this._peek.type === l$1.BLOCK_OPEN_END && this._advance();
		let n = this._peek.sourceSpan.fullStart, i = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new ge$1(t.parts[0], r, [], i, t.sourceSpan, s);
		this._pushContainer(a, !1);
	}
	_consumeBlockClose(t) {
		let r = this._containerStack.length, n = this._containerStack[r - 1];
		if (!this._popContainer(null, ge$1, t.sourceSpan)) {
			if (this._containerStack.length < r) {
				let i = n instanceof G$1 ? n.fullName : n.name;
				this.errors.push(y.create(null, t.sourceSpan, `Unexpected closing block. The block may have been closed earlier. Did you forget to close the <${i}> element? If you meant to write the \`}\` character, you should use the "&#125;" HTML entity instead.`));
				return;
			}
			this.errors.push(y.create(null, t.sourceSpan, "Unexpected closing block. The block may have been closed earlier. If you meant to write the `}` character, you should use the \"&#125;\" HTML entity instead."));
		}
	}
	_consumeIncompleteBlock(t) {
		let r = [];
		for (; this._peek.type === l$1.BLOCK_PARAMETER;) {
			let o = this._advance();
			r.push(new hr$1(o.parts[0], o.sourceSpan));
		}
		let n = this._peek.sourceSpan.fullStart, i = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), s = new h(t.sourceSpan.start, n, t.sourceSpan.fullStart), a = new ge$1(t.parts[0], r, [], i, t.sourceSpan, s);
		this._pushContainer(a, !1), this._popContainer(null, ge$1, null), this.errors.push(y.create(t.parts[0], i, `Incomplete block "${t.parts[0]}". If you meant to write the @ character, you should use the "&#64;" HTML entity instead.`));
	}
	_consumeLet(t) {
		let r = t.parts[0], n, i;
		if (this._peek.type !== l$1.LET_VALUE) {
			this.errors.push(y.create(t.parts[0], t.sourceSpan, `Invalid @let declaration "${r}". Declaration must have a value.`));
			return;
		} else n = this._advance();
		if (this._peek.type !== l$1.LET_END) {
			this.errors.push(y.create(t.parts[0], t.sourceSpan, `Unterminated @let declaration "${r}". Declaration must be terminated with a semicolon.`));
			return;
		} else i = this._advance();
		let s = i.sourceSpan.fullStart, a = new h(t.sourceSpan.start, s, t.sourceSpan.fullStart), o = t.sourceSpan.toString().lastIndexOf(r), c = new h(t.sourceSpan.start.moveBy(o), t.sourceSpan.end), u = new mr$1(r, n.parts[0], a, c, n.sourceSpan);
		this._addToParent(u);
	}
	_consumeIncompleteLet(t) {
		let r = t.parts[0] ?? "", n = r ? ` "${r}"` : "";
		if (r.length > 0) {
			let i = t.sourceSpan.toString().lastIndexOf(r), s = new h(t.sourceSpan.start.moveBy(i), t.sourceSpan.end), a = new h(t.sourceSpan.start, t.sourceSpan.start.moveBy(0)), o = new mr$1(r, "", t.sourceSpan, s, a);
			this._addToParent(o);
		}
		this.errors.push(y.create(t.parts[0], t.sourceSpan, `Incomplete @let declaration${n}. @let declarations must be written as \`@let <name> = <value>;\``));
	}
	_getContainer() {
		return this._containerStack.length > 0 ? this._containerStack[this._containerStack.length - 1] : null;
	}
	_getClosestElementLikeParent() {
		for (let t = this._containerStack.length - 1; t > -1; t--) {
			let r = this._containerStack[t];
			if (r instanceof te$1 || r instanceof G$1) return r;
		}
		return null;
	}
	_addToParent(t) {
		let r = this._getContainer();
		r === null ? this.rootNodes.push(t) : r.children.push(t);
	}
	_getElementFullName(t, r) {
		return fe$1(this._getPrefix(t, r), t.parts[1]);
	}
	_getComponentFullName(t, r) {
		let n = t.parts[0], i = this._getComponentTagName(t, r);
		return i === null ? n : i.startsWith(":") ? n + i : `${n}:${i}`;
	}
	_getComponentTagName(t, r) {
		let n = this._getPrefix(t, r), i = t.parts[2];
		return !n && !i ? null : !n && i ? i : fe$1(n, i || "ng-component");
	}
	_getPrefix(t, r) {
		var n;
		let i, s;
		if (t.type === l$1.COMPONENT_OPEN_START || t.type === l$1.INCOMPLETE_COMPONENT_OPEN || t.type === l$1.COMPONENT_CLOSE ? (i = t.parts[1], s = t.parts[2]) : (i = t.parts[0], s = t.parts[1]), i = i || ((n = this._getTagDefinition(s)) === null || n === void 0 ? void 0 : n.implicitNamespacePrefix) || "", !i && r) {
			let a = r instanceof te$1 ? r.name : r.tagName;
			if (a !== null) {
				let o = et$1(a)[1], c = this._getTagDefinition(o);
				c !== null && !c.preventNamespaceInheritance && (i = Pe$1(a));
			}
		}
		return i;
	}
};
function Di$1(e, t) {
	return e.length > 0 && e[e.length - 1] === t;
}
function Ii(e, t) {
	return _e$1[t] !== void 0 ? _e$1[t] || e : /^#x[a-f0-9]+$/i.test(t) ? String.fromCodePoint(parseInt(t.slice(2), 16)) : /^#\d+$/.test(t) ? String.fromCodePoint(parseInt(t.slice(1), 10)) : e;
}
var qi = class extends Mi {
	constructor() {
		super(Oe$1);
	}
	parse(e, t, r, n = !1, i) {
		return super.parse(e, t, r, n, i);
	}
};
var Cr$1;
function Rt(e, t = {}) {
	let { canSelfClose: r = !1, allowHtmComponentClosingTags: n = !1, isTagNameCaseSensitive: i = !1, getTagContentType: s, tokenizeAngularBlocks: a = !1, tokenizeAngularLetDeclaration: o = !1, enableAngularSelectorlessSyntax: c = !1 } = t;
	return Cr$1 ?? (Cr$1 = new qi()), Cr$1.parse(e, "angular-html-parser", {
		tokenizeExpansionForms: a,
		canSelfClose: r,
		allowHtmComponentClosingTags: n,
		tokenizeBlocks: a,
		tokenizeLet: o,
		selectorlessEnabled: c
	}, i, s);
}
var Za$1 = [
	to$1,
	ro$1,
	io$1,
	ao$1,
	oo$1,
	uo$1,
	lo$1,
	co,
	po$1,
	so
];
function eo$1(e, t) {
	for (let r of Za$1) r(e, t);
	return e;
}
function to$1(e) {
	e.walk((t) => {
		if (t.kind === "element" && t.tagDefinition.ignoreFirstLf && t.children.length > 0 && t.children[0].kind === "text" && t.children[0].value[0] === `
`) {
			let r = t.children[0];
			r.value.length === 1 ? t.removeChild(r) : r.value = r.value.slice(1);
		}
	});
}
function ro$1(e) {
	let t = (r) => r.kind === "element" && r.prev?.kind === "ieConditionalStartComment" && r.prev.sourceSpan.end.offset === r.startSourceSpan.start.offset && r.firstChild?.kind === "ieConditionalEndComment" && r.firstChild.sourceSpan.start.offset === r.startSourceSpan.end.offset;
	e.walk((r) => {
		if (r.children) for (let n = 0; n < r.children.length; n++) {
			let i = r.children[n];
			if (!t(i)) continue;
			let s = i.prev, a = i.firstChild;
			r.removeChild(s), n--;
			let o = new h(s.sourceSpan.start, a.sourceSpan.end), c = new h(o.start, i.sourceSpan.end);
			i.condition = s.condition, i.sourceSpan = c, i.startSourceSpan = o, i.removeChild(a);
		}
	});
}
function no$1(e, t, r) {
	e.walk((n) => {
		if (n.children) for (let i = 0; i < n.children.length; i++) {
			let s = n.children[i];
			if (s.kind !== "text" && !t(s)) continue;
			s.kind !== "text" && (s.kind = "text", s.value = r(s));
			let a = s.prev;
			!a || a.kind !== "text" || (a.value += s.value, a.sourceSpan = new h(a.sourceSpan.start, s.sourceSpan.end), n.removeChild(s), i--);
		}
	});
}
function io$1(e) {
	return no$1(e, (t) => t.kind === "cdata", (t) => `<![CDATA[${t.value}]]>`);
}
function so(e) {
	let t = (r) => r.kind === "element" && r.attrs.length === 0 && r.children.length === 1 && r.firstChild.kind === "text" && !N$1.hasWhitespaceCharacter(r.children[0].value) && !r.firstChild.hasLeadingSpaces && !r.firstChild.hasTrailingSpaces && r.isLeadingSpaceSensitive && !r.hasLeadingSpaces && r.isTrailingSpaceSensitive && !r.hasTrailingSpaces && r.prev?.kind === "text" && r.next?.kind === "text";
	e.walk((r) => {
		if (r.children) for (let n = 0; n < r.children.length; n++) {
			let i = r.children[n];
			if (!t(i)) continue;
			let s = i.prev, a = i.next;
			s.value += `<${i.rawName}>` + i.firstChild.value + `</${i.rawName}>` + a.value, s.sourceSpan = new h(s.sourceSpan.start, a.sourceSpan.end), s.isTrailingSpaceSensitive = a.isTrailingSpaceSensitive, s.hasTrailingSpaces = a.hasTrailingSpaces, r.removeChild(i), n--, r.removeChild(a);
		}
	});
}
function ao$1(e, t) {
	if (t.parser === "html") return;
	let r = /\{\{(.+?)\}\}/su;
	e.walk((n) => {
		if (nn$1(n, t)) for (let i of n.children) {
			if (i.kind !== "text") continue;
			let s = i.sourceSpan.start, a = null, o = i.value.split(r);
			for (let c = 0; c < o.length; c++, s = a) {
				let u = o[c];
				if (c % 2 === 0) {
					a = s.moveBy(u.length), u.length > 0 && n.insertChildBefore(i, {
						kind: "text",
						value: u,
						sourceSpan: new h(s, a)
					});
					continue;
				}
				a = s.moveBy(u.length + 4), n.insertChildBefore(i, {
					kind: "interpolation",
					sourceSpan: new h(s, a),
					children: u.length === 0 ? [] : [{
						kind: "text",
						value: u,
						sourceSpan: new h(s.moveBy(2), a.moveBy(-2))
					}]
				});
			}
			n.removeChild(i);
		}
	});
}
function oo$1(e, t) {
	e.walk((r) => {
		let n = r.$children;
		if (!n) return;
		if (n.length === 0 || n.length === 1 && n[0].kind === "text" && N$1.trim(n[0].value).length === 0) {
			r.hasDanglingSpaces = n.length > 0, r.$children = [];
			return;
		}
		let i = sn$1(r, t), s = Zt$1(r);
		if (!i) for (let a = 0; a < n.length; a++) {
			let o = n[a];
			if (o.kind !== "text") continue;
			let { leadingWhitespace: c, text: u, trailingWhitespace: p } = rn$1(o.value), d = o.prev, g = o.next;
			u ? (o.value = u, o.sourceSpan = new h(o.sourceSpan.start.moveBy(c.length), o.sourceSpan.end.moveBy(-p.length)), c && (d && (d.hasTrailingSpaces = !0), o.hasLeadingSpaces = !0), p && (o.hasTrailingSpaces = !0, g && (g.hasLeadingSpaces = !0))) : (r.removeChild(o), a--, (c || p) && (d && (d.hasTrailingSpaces = !0), g && (g.hasLeadingSpaces = !0)));
		}
		r.isWhitespaceSensitive = i, r.isIndentationSensitive = s;
	});
}
function lo$1(e) {
	e.walk((t) => {
		t.isSelfClosing = !t.children || t.kind === "element" && (t.tagDefinition.isVoid || t.endSourceSpan && t.startSourceSpan.start === t.endSourceSpan.start && t.startSourceSpan.end === t.endSourceSpan.end);
	});
}
function co(e, t) {
	e.walk((r) => {
		r.kind === "element" && (r.hasHtmComponentClosingTag = r.endSourceSpan && /^<\s*\/\s*\/\s*>$/u.test(t.originalText.slice(r.endSourceSpan.start.offset, r.endSourceSpan.end.offset)));
	});
}
function uo$1(e, t) {
	e.walk((r) => {
		r.cssDisplay = dn$1(r, t);
	});
}
function po$1(e, t) {
	e.walk((r) => {
		let { children: n } = r;
		if (n) {
			if (n.length === 0) {
				r.isDanglingSpaceSensitive = ln(r, t);
				return;
			}
			for (let i of n) i.isLeadingSpaceSensitive = an$1(i, t), i.isTrailingSpaceSensitive = on$1(i, t);
			for (let i = 0; i < n.length; i++) {
				let s = n[i];
				s.isLeadingSpaceSensitive = (i === 0 || s.prev.isTrailingSpaceSensitive) && s.isLeadingSpaceSensitive, s.isTrailingSpaceSensitive = (i === n.length - 1 || s.next.isLeadingSpaceSensitive) && s.isTrailingSpaceSensitive;
			}
		}
	});
}
var Fi = eo$1;
function ho$1(e, t, r) {
	let { node: n } = e;
	switch (n.kind) {
		case "root": return t.__onHtmlRoot && t.__onHtmlRoot(n), [E(Le$1(e, t, r)), C];
		case "element":
		case "ieConditionalComment": return ci$1(e, t, r);
		case "angularControlFlowBlock": return ii$1(e, t, r);
		case "angularControlFlowBlockParameters": return ai$1(e, t, r);
		case "angularControlFlowBlockParameter": return N$1.trim(n.expression);
		case "angularLetDeclaration": return E([
			"@let ",
			E([
				n.id,
				" =",
				E(A([S$1, r("init")]))
			]),
			";"
		]);
		case "angularLetDeclarationInitializer": return n.value;
		case "angularIcuExpression": return oi$1(e, t, r);
		case "angularIcuCase": return li$1(e, t, r);
		case "ieConditionalStartComment":
		case "ieConditionalEndComment": return [me$1(n), ce$1(n)];
		case "interpolation": return [
			me$1(n, t),
			...e.map(r, "children"),
			ce$1(n, t)
		];
		case "text": {
			if (n.parent.kind === "interpolation") {
				let o = /\n[^\S\n]*$/u, c = o.test(n.value);
				return [L$1(c ? n.value.replace(o, "") : n.value), c ? C : ""];
			}
			let i = H$1(n, t), s = bt(n), a = F(n, t);
			return s[0] = [i, s[0]], s.push([s.pop(), a]), gt$1(s);
		}
		case "docType": return [E([
			me$1(n, t),
			" ",
			w$1(0, n.value.replace(/^html\b/iu, "html"), /\s+/gu, " ")
		]), ce$1(n, t)];
		case "comment": return [
			H$1(n, t),
			L$1(t.originalText.slice(K$1(n), J(n))),
			F(n, t)
		];
		case "attribute": {
			if (n.value === null) return n.rawName;
			let i = rr$1(n.value), s = kt$1(n, t) ? "" : Ur$1(i, "\"");
			return [
				n.rawName,
				"=",
				s,
				L$1(s === "\"" ? w$1(0, i, "\"", "&quot;") : w$1(0, i, "'", "&apos;")),
				s
			];
		}
		default: throw new Gr$1(n, "HTML");
	}
}
var Hi = {
	features: { experimental_frontMatterSupport: {
		massageAstNode: !0,
		embed: !0,
		print: !0
	} },
	preprocess: Fi,
	print: ho$1,
	insertPragma: ti$1,
	massageAstNode: $r$1,
	embed: $n$1,
	getVisitorKeys: Xn
};
var Vi = [
	{
		name: "Angular",
		type: "markup",
		aceMode: "html",
		extensions: [".component.html"],
		tmScope: "text.html.basic",
		aliases: ["xhtml"],
		codemirrorMode: "htmlmixed",
		codemirrorMimeType: "text/html",
		parsers: ["angular"],
		vscodeLanguageIds: ["html"],
		filenames: [],
		linguistLanguageId: 146
	},
	{
		name: "HTML",
		type: "markup",
		aceMode: "html",
		extensions: [
			".html",
			".hta",
			".htm",
			".html.hl",
			".inc",
			".xht",
			".xhtml"
		],
		tmScope: "text.html.basic",
		aliases: ["xhtml"],
		codemirrorMode: "htmlmixed",
		codemirrorMimeType: "text/html",
		parsers: ["html"],
		vscodeLanguageIds: ["html"],
		linguistLanguageId: 146
	},
	{
		name: "Lightning Web Components",
		type: "markup",
		aceMode: "html",
		extensions: [],
		tmScope: "text.html.basic",
		aliases: ["xhtml"],
		codemirrorMode: "htmlmixed",
		codemirrorMimeType: "text/html",
		parsers: ["lwc"],
		vscodeLanguageIds: ["html"],
		filenames: [],
		linguistLanguageId: 146
	},
	{
		name: "MJML",
		type: "markup",
		aceMode: "html",
		extensions: [".mjml"],
		tmScope: "text.mjml.basic",
		aliases: ["MJML", "mjml"],
		codemirrorMode: "htmlmixed",
		codemirrorMimeType: "text/html",
		parsers: ["mjml"],
		filenames: [],
		vscodeLanguageIds: ["mjml"],
		linguistLanguageId: 146
	},
	{
		name: "Vue",
		type: "markup",
		aceMode: "vue",
		extensions: [".vue"],
		tmScope: "source.vue",
		codemirrorMode: "vue",
		codemirrorMimeType: "text/x-vue",
		parsers: ["vue"],
		vscodeLanguageIds: ["vue"],
		linguistLanguageId: 391
	}
];
var vr$1 = {
	bracketSpacing: {
		category: "Common",
		type: "boolean",
		default: !0,
		description: "Print spaces between brackets.",
		oppositeDescription: "Do not print spaces between brackets."
	},
	objectWrap: {
		category: "Common",
		type: "choice",
		default: "preserve",
		description: "How to wrap object literals.",
		choices: [{
			value: "preserve",
			description: "Keep as multi-line, if there is a newline between the opening brace and first property."
		}, {
			value: "collapse",
			description: "Fit to a single line when possible."
		}]
	},
	singleQuote: {
		category: "Common",
		type: "boolean",
		default: !1,
		description: "Use single quotes instead of double quotes."
	},
	proseWrap: {
		category: "Common",
		type: "choice",
		default: "preserve",
		description: "How to wrap prose.",
		choices: [
			{
				value: "always",
				description: "Wrap prose if it exceeds the print width."
			},
			{
				value: "never",
				description: "Do not wrap prose."
			},
			{
				value: "preserve",
				description: "Wrap prose as-is."
			}
		]
	},
	bracketSameLine: {
		category: "Common",
		type: "boolean",
		default: !1,
		description: "Put > of opening tags on the last line instead of on a new line."
	},
	singleAttributePerLine: {
		category: "Common",
		type: "boolean",
		default: !1,
		description: "Enforce single attribute per line in HTML, Vue and JSX."
	}
};
var Ui = "HTML", Wi = {
	bracketSameLine: vr$1.bracketSameLine,
	htmlWhitespaceSensitivity: {
		category: Ui,
		type: "choice",
		default: "css",
		description: "How to handle whitespaces in HTML.",
		choices: [
			{
				value: "css",
				description: "Respect the default value of CSS display property."
			},
			{
				value: "strict",
				description: "Whitespaces are considered sensitive."
			},
			{
				value: "ignore",
				description: "Whitespaces are considered insensitive."
			}
		]
	},
	singleAttributePerLine: vr$1.singleAttributePerLine,
	vueIndentScriptAndStyle: {
		category: Ui,
		type: "boolean",
		default: !1,
		description: "Indent script and style tags in Vue files."
	}
};
var Nr$1 = {};
Or$1(Nr$1, {
	angular: () => Ro$1,
	html: () => Oo$1,
	lwc: () => Bo$1,
	mjml: () => Io$1,
	vue: () => Mo$1
});
function go$1(e, t) {
	let r = /* @__PURE__ */ new SyntaxError(e + " (" + t.loc.start.line + ":" + t.loc.start.column + ")");
	return Object.assign(r, t);
}
var Gi = go$1;
var _o$1 = {
	canSelfClose: !0,
	normalizeTagName: !1,
	normalizeAttributeName: !1,
	allowHtmComponentClosingTags: !1,
	isTagNameCaseSensitive: !1,
	shouldParseFrontMatter: !0
};
function Mt$1(e) {
	return {
		..._o$1,
		...e
	};
}
function Tr$1(e) {
	let { canSelfClose: t, allowHtmComponentClosingTags: r, isTagNameCaseSensitive: n, shouldParseAsRawText: i, tokenizeAngularBlocks: s, tokenizeAngularLetDeclaration: a } = e;
	return {
		canSelfClose: t,
		allowHtmComponentClosingTags: r,
		isTagNameCaseSensitive: n,
		getTagContentType: i ? (...o) => i(...o) ? R$1.RAW_TEXT : void 0 : void 0,
		tokenizeAngularBlocks: s,
		tokenizeAngularLetDeclaration: a
	};
}
var Bt = new Map([
	["*", new Set([
		"accesskey",
		"autocapitalize",
		"autocorrect",
		"autofocus",
		"class",
		"contenteditable",
		"dir",
		"draggable",
		"enterkeyhint",
		"exportparts",
		"hidden",
		"id",
		"inert",
		"inputmode",
		"is",
		"itemid",
		"itemprop",
		"itemref",
		"itemscope",
		"itemtype",
		"lang",
		"nonce",
		"part",
		"popover",
		"slot",
		"spellcheck",
		"style",
		"tabindex",
		"title",
		"translate",
		"writingsuggestions"
	])],
	["a", new Set([
		"charset",
		"coords",
		"download",
		"href",
		"hreflang",
		"name",
		"ping",
		"referrerpolicy",
		"rel",
		"rev",
		"shape",
		"target",
		"type"
	])],
	["applet", new Set([
		"align",
		"alt",
		"archive",
		"code",
		"codebase",
		"height",
		"hspace",
		"name",
		"object",
		"vspace",
		"width"
	])],
	["area", new Set([
		"alt",
		"coords",
		"download",
		"href",
		"hreflang",
		"nohref",
		"ping",
		"referrerpolicy",
		"rel",
		"shape",
		"target",
		"type"
	])],
	["audio", new Set([
		"autoplay",
		"controls",
		"crossorigin",
		"loop",
		"muted",
		"preload",
		"src"
	])],
	["base", new Set(["href", "target"])],
	["basefont", new Set([
		"color",
		"face",
		"size"
	])],
	["blockquote", new Set(["cite"])],
	["body", new Set([
		"alink",
		"background",
		"bgcolor",
		"link",
		"text",
		"vlink"
	])],
	["br", new Set(["clear"])],
	["button", new Set([
		"command",
		"commandfor",
		"disabled",
		"form",
		"formaction",
		"formenctype",
		"formmethod",
		"formnovalidate",
		"formtarget",
		"name",
		"popovertarget",
		"popovertargetaction",
		"type",
		"value"
	])],
	["canvas", new Set(["height", "width"])],
	["caption", new Set(["align"])],
	["col", new Set([
		"align",
		"char",
		"charoff",
		"span",
		"valign",
		"width"
	])],
	["colgroup", new Set([
		"align",
		"char",
		"charoff",
		"span",
		"valign",
		"width"
	])],
	["data", new Set(["value"])],
	["del", new Set(["cite", "datetime"])],
	["details", new Set(["name", "open"])],
	["dialog", new Set(["closedby", "open"])],
	["dir", new Set(["compact"])],
	["div", new Set(["align"])],
	["dl", new Set(["compact"])],
	["embed", new Set([
		"height",
		"src",
		"type",
		"width"
	])],
	["fieldset", new Set([
		"disabled",
		"form",
		"name"
	])],
	["font", new Set([
		"color",
		"face",
		"size"
	])],
	["form", new Set([
		"accept",
		"accept-charset",
		"action",
		"autocomplete",
		"enctype",
		"method",
		"name",
		"novalidate",
		"target"
	])],
	["frame", new Set([
		"frameborder",
		"longdesc",
		"marginheight",
		"marginwidth",
		"name",
		"noresize",
		"scrolling",
		"src"
	])],
	["frameset", new Set(["cols", "rows"])],
	["h1", new Set(["align"])],
	["h2", new Set(["align"])],
	["h3", new Set(["align"])],
	["h4", new Set(["align"])],
	["h5", new Set(["align"])],
	["h6", new Set(["align"])],
	["head", new Set(["profile"])],
	["hr", new Set([
		"align",
		"noshade",
		"size",
		"width"
	])],
	["html", new Set(["manifest", "version"])],
	["iframe", new Set([
		"align",
		"allow",
		"allowfullscreen",
		"allowpaymentrequest",
		"allowusermedia",
		"frameborder",
		"height",
		"loading",
		"longdesc",
		"marginheight",
		"marginwidth",
		"name",
		"referrerpolicy",
		"sandbox",
		"scrolling",
		"src",
		"srcdoc",
		"width"
	])],
	["img", new Set([
		"align",
		"alt",
		"border",
		"crossorigin",
		"decoding",
		"fetchpriority",
		"height",
		"hspace",
		"ismap",
		"loading",
		"longdesc",
		"name",
		"referrerpolicy",
		"sizes",
		"src",
		"srcset",
		"usemap",
		"vspace",
		"width"
	])],
	["input", new Set([
		"accept",
		"align",
		"alpha",
		"alt",
		"autocomplete",
		"checked",
		"colorspace",
		"dirname",
		"disabled",
		"form",
		"formaction",
		"formenctype",
		"formmethod",
		"formnovalidate",
		"formtarget",
		"height",
		"ismap",
		"list",
		"max",
		"maxlength",
		"min",
		"minlength",
		"multiple",
		"name",
		"pattern",
		"placeholder",
		"popovertarget",
		"popovertargetaction",
		"readonly",
		"required",
		"size",
		"src",
		"step",
		"type",
		"usemap",
		"value",
		"width"
	])],
	["ins", new Set(["cite", "datetime"])],
	["isindex", new Set(["prompt"])],
	["label", new Set(["for", "form"])],
	["legend", new Set(["align"])],
	["li", new Set(["type", "value"])],
	["link", new Set([
		"as",
		"blocking",
		"charset",
		"color",
		"crossorigin",
		"disabled",
		"fetchpriority",
		"href",
		"hreflang",
		"imagesizes",
		"imagesrcset",
		"integrity",
		"media",
		"referrerpolicy",
		"rel",
		"rev",
		"sizes",
		"target",
		"type"
	])],
	["map", new Set(["name"])],
	["menu", new Set(["compact"])],
	["meta", new Set([
		"charset",
		"content",
		"http-equiv",
		"media",
		"name",
		"scheme"
	])],
	["meter", new Set([
		"high",
		"low",
		"max",
		"min",
		"optimum",
		"value"
	])],
	["object", new Set([
		"align",
		"archive",
		"border",
		"classid",
		"codebase",
		"codetype",
		"data",
		"declare",
		"form",
		"height",
		"hspace",
		"name",
		"standby",
		"type",
		"typemustmatch",
		"usemap",
		"vspace",
		"width"
	])],
	["ol", new Set([
		"compact",
		"reversed",
		"start",
		"type"
	])],
	["optgroup", new Set(["disabled", "label"])],
	["option", new Set([
		"disabled",
		"label",
		"selected",
		"value"
	])],
	["output", new Set([
		"for",
		"form",
		"name"
	])],
	["p", new Set(["align"])],
	["param", new Set([
		"name",
		"type",
		"value",
		"valuetype"
	])],
	["pre", new Set(["width"])],
	["progress", new Set(["max", "value"])],
	["q", new Set(["cite"])],
	["script", new Set([
		"async",
		"blocking",
		"charset",
		"crossorigin",
		"defer",
		"fetchpriority",
		"integrity",
		"language",
		"nomodule",
		"referrerpolicy",
		"src",
		"type"
	])],
	["select", new Set([
		"autocomplete",
		"disabled",
		"form",
		"multiple",
		"name",
		"required",
		"size"
	])],
	["slot", new Set(["name"])],
	["source", new Set([
		"height",
		"media",
		"sizes",
		"src",
		"srcset",
		"type",
		"width"
	])],
	["style", new Set([
		"blocking",
		"media",
		"type"
	])],
	["table", new Set([
		"align",
		"bgcolor",
		"border",
		"cellpadding",
		"cellspacing",
		"frame",
		"rules",
		"summary",
		"width"
	])],
	["tbody", new Set([
		"align",
		"char",
		"charoff",
		"valign"
	])],
	["td", new Set([
		"abbr",
		"align",
		"axis",
		"bgcolor",
		"char",
		"charoff",
		"colspan",
		"headers",
		"height",
		"nowrap",
		"rowspan",
		"scope",
		"valign",
		"width"
	])],
	["template", new Set([
		"shadowrootclonable",
		"shadowrootcustomelementregistry",
		"shadowrootdelegatesfocus",
		"shadowrootmode",
		"shadowrootserializable"
	])],
	["textarea", new Set([
		"autocomplete",
		"cols",
		"dirname",
		"disabled",
		"form",
		"maxlength",
		"minlength",
		"name",
		"placeholder",
		"readonly",
		"required",
		"rows",
		"wrap"
	])],
	["tfoot", new Set([
		"align",
		"char",
		"charoff",
		"valign"
	])],
	["th", new Set([
		"abbr",
		"align",
		"axis",
		"bgcolor",
		"char",
		"charoff",
		"colspan",
		"headers",
		"height",
		"nowrap",
		"rowspan",
		"scope",
		"valign",
		"width"
	])],
	["thead", new Set([
		"align",
		"char",
		"charoff",
		"valign"
	])],
	["time", new Set(["datetime"])],
	["tr", new Set([
		"align",
		"bgcolor",
		"char",
		"charoff",
		"valign"
	])],
	["track", new Set([
		"default",
		"kind",
		"label",
		"src",
		"srclang"
	])],
	["ul", new Set(["compact", "type"])],
	["video", new Set([
		"autoplay",
		"controls",
		"crossorigin",
		"height",
		"loop",
		"muted",
		"playsinline",
		"poster",
		"preload",
		"src",
		"width"
	])]
]);
var zi = new Set([
	"a",
	"abbr",
	"acronym",
	"address",
	"applet",
	"area",
	"article",
	"aside",
	"audio",
	"b",
	"base",
	"basefont",
	"bdi",
	"bdo",
	"bgsound",
	"big",
	"blink",
	"blockquote",
	"body",
	"br",
	"button",
	"canvas",
	"caption",
	"center",
	"cite",
	"code",
	"col",
	"colgroup",
	"command",
	"content",
	"data",
	"datalist",
	"dd",
	"del",
	"details",
	"dfn",
	"dialog",
	"dir",
	"div",
	"dl",
	"dt",
	"em",
	"embed",
	"fencedframe",
	"fieldset",
	"figcaption",
	"figure",
	"font",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hgroup",
	"hr",
	"html",
	"i",
	"iframe",
	"image",
	"img",
	"input",
	"ins",
	"isindex",
	"kbd",
	"keygen",
	"label",
	"legend",
	"li",
	"link",
	"listing",
	"main",
	"map",
	"mark",
	"marquee",
	"math",
	"menu",
	"menuitem",
	"meta",
	"meter",
	"multicol",
	"nav",
	"nextid",
	"nobr",
	"noembed",
	"noframes",
	"noscript",
	"object",
	"ol",
	"optgroup",
	"option",
	"output",
	"p",
	"param",
	"picture",
	"plaintext",
	"pre",
	"progress",
	"q",
	"rb",
	"rbc",
	"rp",
	"rt",
	"rtc",
	"ruby",
	"s",
	"samp",
	"script",
	"search",
	"section",
	"select",
	"selectedcontent",
	"shadow",
	"slot",
	"small",
	"source",
	"spacer",
	"span",
	"strike",
	"strong",
	"style",
	"sub",
	"summary",
	"sup",
	"svg",
	"table",
	"tbody",
	"td",
	"template",
	"textarea",
	"tfoot",
	"th",
	"thead",
	"time",
	"title",
	"tr",
	"track",
	"tt",
	"u",
	"ul",
	"var",
	"video",
	"wbr",
	"xmp"
]);
var qt$1 = {
	attrs: !0,
	children: !0,
	cases: !0,
	expression: !0
}, $i = new Set(["parent"]), re, br$1, wr$1, Be$1 = class Be {
	constructor(t = {}) {
		Dr$1(this, re);
		Ut$1(this, "kind");
		Ut$1(this, "parent");
		for (let r of new Set([...$i, ...Object.keys(t)])) this.setProperty(r, t[r]);
		if (ie$1(t)) for (let r of Object.getOwnPropertySymbols(t)) this.setProperty(r, t[r]);
	}
	setProperty(t, r) {
		if (this[t] !== r) {
			if (t in qt$1 && (r = r.map((n) => this.createChild(n))), !$i.has(t)) {
				this[t] = r;
				return;
			}
			Object.defineProperty(this, t, {
				value: r,
				enumerable: !1,
				configurable: !0
			});
		}
	}
	map(t) {
		let r;
		for (let n in qt$1) {
			let i = this[n];
			if (i) {
				let s = So$1(i, (a) => a.map(t));
				r !== i && (r || (r = new Be({ parent: this.parent })), r.setProperty(n, s));
			}
		}
		if (r) for (let n in this) n in qt$1 || (r[n] = this[n]);
		return t(r || this);
	}
	walk(t) {
		for (let r in qt$1) {
			let n = this[r];
			if (n) for (let i = 0; i < n.length; i++) n[i].walk(t);
		}
		t(this);
	}
	createChild(t) {
		let r = t instanceof Be ? t.clone() : new Be(t);
		return r.setProperty("parent", this), r;
	}
	insertChildBefore(t, r) {
		let n = this.$children;
		n.splice(n.indexOf(t), 0, this.createChild(r));
	}
	removeChild(t) {
		let r = this.$children;
		r.splice(r.indexOf(t), 1);
	}
	replaceChild(t, r) {
		let n = this.$children;
		n[n.indexOf(t)] = this.createChild(r);
	}
	clone() {
		return new Be(this);
	}
	get $children() {
		return this[Fe$1(this, re, br$1)];
	}
	set $children(t) {
		this[Fe$1(this, re, br$1)] = t;
	}
	get firstChild() {
		return this.$children?.[0];
	}
	get lastChild() {
		return M$1(1, this.$children, -1);
	}
	get prev() {
		let t = Fe$1(this, re, wr$1);
		return t[t.indexOf(this) - 1];
	}
	get next() {
		let t = Fe$1(this, re, wr$1);
		return t[t.indexOf(this) + 1];
	}
	get rawName() {
		return this.hasExplicitNamespace ? this.fullName : this.name;
	}
	get fullName() {
		return this.namespace ? this.namespace + ":" + this.name : this.name;
	}
	get attrMap() {
		return Object.fromEntries(this.attrs.map((t) => [t.fullName, t.value]));
	}
};
re = /* @__PURE__ */ new WeakSet(), br$1 = function() {
	return this.kind === "angularIcuCase" ? "expression" : this.kind === "angularIcuExpression" ? "cases" : "children";
}, wr$1 = function() {
	return this.parent?.$children ?? [];
};
var Ft$1 = Be$1;
function So$1(e, t) {
	let r = e.map(t);
	return r.some((n, i) => n !== e[i]) ? r : e;
}
var Eo = [
	{
		regex: /^(?<openingTagSuffix>\[if(?<condition>[^\]]*)\]>)(?<data>.*?)<!\s*\[endif\]$/su,
		parse: Co$1
	},
	{
		regex: /^\[if(?<condition>[^\]]*)\]><!$/u,
		parse: vo$1
	},
	{
		regex: /^<!\s*\[endif\]$/u,
		parse: To$1
	}
];
function Yi(e, t) {
	if (e.value) for (let { regex: r, parse: n } of Eo) {
		let i = e.value.match(r);
		if (i) return n(e, i, t);
	}
	return null;
}
function Co$1(e, t, r) {
	let { openingTagSuffix: n, condition: i, data: s } = t.groups, a = 4 + n.length, o = e.sourceSpan.start.moveBy(a), c = o.moveBy(s.length), [u, p] = (() => {
		try {
			return [!0, r(s, o).children];
		} catch {
			return [!1, [{
				kind: "text",
				value: s,
				sourceSpan: new h(o, c)
			}]];
		}
	})();
	return {
		kind: "ieConditionalComment",
		complete: u,
		children: p,
		condition: w$1(0, i.trim(), /\s+/gu, " "),
		sourceSpan: e.sourceSpan,
		startSourceSpan: new h(e.sourceSpan.start, o),
		endSourceSpan: new h(c, e.sourceSpan.end)
	};
}
function vo$1(e, t) {
	let { condition: r } = t.groups;
	return {
		kind: "ieConditionalStartComment",
		condition: w$1(0, r.trim(), /\s+/gu, " "),
		sourceSpan: e.sourceSpan
	};
}
function To$1(e) {
	return {
		kind: "ieConditionalEndComment",
		sourceSpan: e.sourceSpan
	};
}
var kr$1 = class extends fr$1 {
	visitExpansionCase(t, r) {
		r.parseOptions.name === "angular" && this.visitChildren(r, (n) => {
			n(t.expression);
		});
	}
	visit(t, { parseOptions: r }) {
		xo$1(t), yo$1(t, r), No$1(t, r), Ao$1(t);
	}
};
function Ki(e, t, r, n) {
	Ot(new kr$1(), e.children, { parseOptions: r }), t && e.children.unshift(t);
	let i = new Ft$1(e);
	return i.walk((s) => {
		if (s.kind === "comment") {
			let a = Yi(s, n);
			a && s.parent.replaceChild(s, a);
		}
		bo$1(s), wo$1(s), ko$1(s);
	}), i;
}
function bo$1(e) {
	if (e.kind === "block") {
		if (e.name = w$1(0, e.name.toLowerCase(), /\s+/gu, " ").trim(), e.kind = "angularControlFlowBlock", !Ne$1(e.parameters)) {
			delete e.parameters;
			return;
		}
		for (let t of e.parameters) t.kind = "angularControlFlowBlockParameter";
		e.parameters = {
			kind: "angularControlFlowBlockParameters",
			children: e.parameters,
			sourceSpan: new h(e.parameters[0].sourceSpan.start, M$1(0, e.parameters, -1).sourceSpan.end)
		};
	}
}
function wo$1(e) {
	e.kind === "letDeclaration" && (e.kind = "angularLetDeclaration", e.id = e.name, e.init = {
		kind: "angularLetDeclarationInitializer",
		sourceSpan: new h(e.valueSpan.start, e.valueSpan.end),
		value: e.value
	}, delete e.name, delete e.value);
}
function ko$1(e) {
	e.kind === "expansion" && (e.kind = "angularIcuExpression"), e.kind === "expansionCase" && (e.kind = "angularIcuCase");
}
function ji(e, t) {
	let r = e.toLowerCase();
	return t(r) ? r : e;
}
function Xi(e) {
	let t = e.name.startsWith(":") ? e.name.slice(1).split(":")[0] : null, r = e.nameSpan.toString(), n = t !== null && r.startsWith(`${t}:`);
	e.name = n ? r.slice(t.length + 1) : r, e.namespace = t, e.hasExplicitNamespace = n;
}
function xo$1(e) {
	switch (e.kind) {
		case "element":
			Xi(e);
			for (let t of e.attrs) Xi(t), t.valueSpan ? (t.value = t.valueSpan.toString(), /["']/u.test(t.value[0]) && (t.value = t.value.slice(1, -1))) : t.value = null;
			break;
		case "comment":
			e.value = e.sourceSpan.toString().slice(4, -3);
			break;
		case "text":
			e.value = e.sourceSpan.toString();
			break;
	}
}
function yo$1(e, t) {
	if (e.kind === "element") {
		let r = Oe$1(t.isTagNameCaseSensitive ? e.name : e.name.toLowerCase());
		!e.namespace || e.namespace === r.implicitNamespacePrefix || se$1(e) ? e.tagDefinition = r : e.tagDefinition = Oe$1("");
	}
}
function Ao$1(e) {
	e.sourceSpan && e.endSourceSpan && (e.sourceSpan = new h(e.sourceSpan.start, e.endSourceSpan.end));
}
function No$1(e, t) {
	if (e.kind === "element" && (t.normalizeTagName && (!e.namespace || e.namespace === e.tagDefinition.implicitNamespacePrefix || se$1(e)) && (e.name = ji(e.name, (r) => zi.has(r))), t.normalizeAttributeName)) for (let r of e.attrs) r.namespace || (r.name = ji(r.name, (n) => Bt.has(e.name) && (Bt.get("*").has(n) || Bt.get(e.name).has(n))));
}
function yr$1(e, t) {
	let { rootNodes: r, errors: n } = Rt(e, Tr$1(t));
	return n.length > 0 && xr$1(n[0]), {
		parseOptions: t,
		rootNodes: r
	};
}
function Qi(e, t) {
	let r = Tr$1(t), { rootNodes: n, errors: i } = Rt(e, r);
	if (n.some((u) => u.kind === "docType" && u.value === "html" || u.kind === "element" && u.name.toLowerCase() === "html")) return yr$1(e, Ht$1);
	let a, o = () => a ?? (a = Rt(e, {
		...r,
		getTagContentType: void 0
	})), c = (u) => {
		let { offset: p } = u.startSourceSpan.start;
		return o().rootNodes.find((d) => d.kind === "element" && d.startSourceSpan.start.offset === p) ?? u;
	};
	for (let [u, p] of n.entries()) if (p.kind === "element") {
		if (p.isVoid) i = o().errors, n[u] = c(p);
		else if (Lo$1(p)) {
			let { endSourceSpan: d, startSourceSpan: g } = p, m = o().errors.find((_) => _.span.start.offset > g.start.offset && _.span.start.offset < d.end.offset);
			m && xr$1(m), n[u] = c(p);
		}
	}
	return i.length > 0 && xr$1(i[0]), {
		parseOptions: t,
		rootNodes: n
	};
}
function Lo$1(e) {
	if (e.kind !== "element" || e.name !== "template") return !1;
	let t = e.attrs.find((r) => r.name === "lang")?.value;
	return !t || t === "html";
}
function xr$1(e) {
	let { msg: t, span: { start: r, end: n } } = e;
	throw Gi(t, {
		loc: {
			start: {
				line: r.line + 1,
				column: r.col + 1
			},
			end: {
				line: n.line + 1,
				column: n.col + 1
			}
		},
		cause: e
	});
}
function Po$1(e, t, r, n, i, s) {
	let { offset: a } = n, c = Ar$1(w$1(0, t.slice(0, a), /[^\n]/gu, " ") + r, e, {
		...i,
		shouldParseFrontMatter: !1
	}, s);
	c.sourceSpan = new h(n, M$1(0, c.children, -1).sourceSpan.end);
	let u = c.children[0];
	return u.length === a ? c.children.shift() : (u.sourceSpan = new h(u.sourceSpan.start.moveBy(a), u.sourceSpan.end), u.value = u.value.slice(a)), c;
}
function Ar$1(e, t, r, n = {}) {
	let { frontMatter: i, content: s } = r.shouldParseFrontMatter ? Xt$1(e) : { content: e }, a = new nt$1(e, n.filepath), o = new De$1(a, 0, 0, 0), c = o.moveBy(e.length), { parseOptions: u, rootNodes: p } = t(s, r), d = {
		kind: "root",
		sourceSpan: new h(o, c),
		children: p
	}, g;
	if (i) {
		let [_, T] = [i.start, i.end].map((P) => new De$1(a, P.index, P.line - 1, P.column));
		g = {
			...i,
			kind: "frontMatter",
			sourceSpan: new h(_, T)
		};
	}
	return Ki(d, g, u, (_, T) => Po$1(t, e, _, T, u, n));
}
var Ht$1 = Mt$1({
	name: "html",
	normalizeTagName: !0,
	normalizeAttributeName: !0,
	allowHtmComponentClosingTags: !0
});
function at$1(e) {
	let t = Mt$1(e), r = t.name === "vue" ? Qi : yr$1;
	return {
		parse: (n, i) => Ar$1(n, r, t, i),
		hasPragma: Zn$1,
		hasIgnorePragma: ei$1,
		astFormat: "html",
		locStart: K$1,
		locEnd: J
	};
}
var Oo$1 = at$1(Ht$1), Do$1 = new Set(["mj-style", "mj-raw"]), Io$1 = at$1({
	...Ht$1,
	name: "mjml",
	shouldParseAsRawText: (e) => Do$1.has(e)
}), Ro$1 = at$1({
	name: "angular",
	tokenizeAngularBlocks: !0,
	tokenizeAngularLetDeclaration: !0
}), Mo$1 = at$1({
	name: "vue",
	isTagNameCaseSensitive: !0,
	shouldParseAsRawText(e, t, r, n) {
		return e.toLowerCase() !== "html" && !r && (e !== "template" || n.some(({ name: i, value: s }) => i === "lang" && s !== "html" && s !== "" && s !== void 0));
	}
}), Bo$1 = at$1({
	name: "lwc",
	canSelfClose: !1
});
var qo$1 = { html: Hi };
//#endregion
//#region ../../node_modules/prettier/standalone.mjs
var Zn = Object.create;
var Mt = Object.defineProperty;
var eo = Object.getOwnPropertyDescriptor;
var to = Object.getOwnPropertyNames;
var uo = Object.getPrototypeOf, ro = Object.prototype.hasOwnProperty;
var no = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Yt = (e, t) => {
	for (var u in t) Mt(e, u, {
		get: t[u],
		enumerable: !0
	});
}, oo = (e, t, u, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (let o of to(t)) !ro.call(e, o) && o !== u && Mt(e, o, {
		get: () => t[o],
		enumerable: !(r = eo(t, o)) || r.enumerable
	});
	return e;
};
var ao = (e, t, u) => (u = e != null ? Zn(uo(e)) : {}, oo(t || !e || !e.__esModule ? Mt(u, "default", {
	value: e,
	enumerable: !0
}) : u, e));
var dn = no((of, ln) => {
	var yt, bt, At, _t, xt, $e, bu, Ke, Bt, cn, Tt, Ve, Nt = /\/(?![*\/])(?:\[(?:[^\]\\\n\r\u2028\u2029]+|\\.)*\]|[^\/\\\n\r\u2028\u2029]+|\\.)*(\/[$_\u200C\u200D\p{ID_Continue}]*|\\)?/uy, St, wt, pe, fn, Ot, Pt;
	Ve = /--|\+\+|=>|\.{3}|\??\.(?!\d)|(?:&&|\|\||\?\?|[+\-%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2}|\/(?![\/*]))=?|[?~,:;[\](){}]/y;
	yt = /(\x23?)(?=[$_\p{ID_Start}\\])(?:[$_\u200C\u200D\p{ID_Continue}]+|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+/uy;
	wt = /(['"])(?:[^'"\\\n\r]+|(?!\1)['"]|\\(?:\r\n|[^]))*(\1)?/y;
	Tt = /(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[oO][0-7](?:_?[0-7])*|0[bB][01](?:_?[01])*)n?|0n|[1-9](?:_?\d)*n|(?:(?:0(?!\d)|0\d*[89]\d*|[1-9](?:_?\d)*)(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?|0[0-7]+/y;
	pe = /[`}](?:[^`\\$]+|\\[^]|\$(?!\{))*(`|\$\{)?/y;
	Pt = /[\t\v\f\ufeff\p{Zs}]+/uy;
	Ke = /\r?\n|[\r\u2028\u2029]/y;
	Bt = /\/\*(?:[^*]+|\*(?!\/))*(\*\/)?/y;
	St = /\/\/.*/y;
	At = /[<>.:={}]|\/(?![\/*])/y;
	bt = /[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}-]*/uy;
	_t = /(['"])(?:[^'"]+|(?!\1)['"])*(\1)?/y;
	xt = /[^<>{}]+/y;
	Ot = /^(?:[\/+-]|\.{3}|\?(?:InterpolationIn(?:JSX|Template)|NoLineTerminatorHere|NonExpressionParenEnd|UnaryIncDec))?$|[{}([,;<>=*%&|^!~?:]$/;
	fn = /^(?:=>|[;\]){}]|else|\?(?:NoLineTerminatorHere|NonExpressionParenEnd))?$/;
	$e = /^(?:await|case|default|delete|do|else|instanceof|new|return|throw|typeof|void|yield)$/;
	bu = /^(?:return|throw|yield)$/;
	cn = RegExp(Ke.source);
	ln.exports = function* (e, { jsx: t = !1 } = {}) {
		var u, r, o, n, a, s, i, D, f, l, d, c, p, F;
		for ({length: s} = e, n = 0, a = "", F = [{ tag: "JS" }], u = [], d = 0, c = !1; n < s;) {
			switch (D = F[F.length - 1], D.tag) {
				case "JS":
				case "JSNonExpressionParen":
				case "InterpolationInTemplate":
				case "InterpolationInJSX":
					if (e[n] === "/" && (Ot.test(a) || $e.test(a)) && (Nt.lastIndex = n, i = Nt.exec(e))) {
						n = Nt.lastIndex, a = i[0], c = !0, yield {
							type: "RegularExpressionLiteral",
							value: i[0],
							closed: i[1] !== void 0 && i[1] !== "\\"
						};
						continue;
					}
					if (Ve.lastIndex = n, i = Ve.exec(e)) {
						switch (p = i[0], f = Ve.lastIndex, l = p, p) {
							case "(":
								a === "?NonExpressionParenKeyword" && F.push({
									tag: "JSNonExpressionParen",
									nesting: d
								}), d++, c = !1;
								break;
							case ")":
								d--, c = !0, D.tag === "JSNonExpressionParen" && d === D.nesting && (F.pop(), l = "?NonExpressionParenEnd", c = !1);
								break;
							case "{":
								Ve.lastIndex = 0, o = !fn.test(a) && (Ot.test(a) || $e.test(a)), u.push(o), c = !1;
								break;
							case "}":
								switch (D.tag) {
									case "InterpolationInTemplate":
										if (u.length === D.nesting) {
											pe.lastIndex = n, i = pe.exec(e), n = pe.lastIndex, a = i[0], i[1] === "${" ? (a = "?InterpolationInTemplate", c = !1, yield {
												type: "TemplateMiddle",
												value: i[0]
											}) : (F.pop(), c = !0, yield {
												type: "TemplateTail",
												value: i[0],
												closed: i[1] === "`"
											});
											continue;
										}
										break;
									case "InterpolationInJSX": if (u.length === D.nesting) {
										F.pop(), n += 1, a = "}", yield {
											type: "JSXPunctuator",
											value: "}"
										};
										continue;
									}
								}
								c = u.pop(), l = c ? "?ExpressionBraceEnd" : "}";
								break;
							case "]":
								c = !0;
								break;
							case "++":
							case "--":
								l = c ? "?PostfixIncDec" : "?UnaryIncDec";
								break;
							case "<":
								if (t && (Ot.test(a) || $e.test(a))) {
									F.push({ tag: "JSXTag" }), n += 1, a = "<", yield {
										type: "JSXPunctuator",
										value: p
									};
									continue;
								}
								c = !1;
								break;
							default: c = !1;
						}
						n = f, a = l, yield {
							type: "Punctuator",
							value: p
						};
						continue;
					}
					if (yt.lastIndex = n, i = yt.exec(e)) {
						switch (n = yt.lastIndex, l = i[0], i[0]) {
							case "for":
							case "if":
							case "while":
							case "with": a !== "." && a !== "?." && (l = "?NonExpressionParenKeyword");
						}
						a = l, c = !$e.test(i[0]), yield {
							type: i[1] === "#" ? "PrivateIdentifier" : "IdentifierName",
							value: i[0]
						};
						continue;
					}
					if (wt.lastIndex = n, i = wt.exec(e)) {
						n = wt.lastIndex, a = i[0], c = !0, yield {
							type: "StringLiteral",
							value: i[0],
							closed: i[2] !== void 0
						};
						continue;
					}
					if (Tt.lastIndex = n, i = Tt.exec(e)) {
						n = Tt.lastIndex, a = i[0], c = !0, yield {
							type: "NumericLiteral",
							value: i[0]
						};
						continue;
					}
					if (pe.lastIndex = n, i = pe.exec(e)) {
						n = pe.lastIndex, a = i[0], i[1] === "${" ? (a = "?InterpolationInTemplate", F.push({
							tag: "InterpolationInTemplate",
							nesting: u.length
						}), c = !1, yield {
							type: "TemplateHead",
							value: i[0]
						}) : (c = !0, yield {
							type: "NoSubstitutionTemplate",
							value: i[0],
							closed: i[1] === "`"
						});
						continue;
					}
					break;
				case "JSXTag":
				case "JSXTagEnd":
					if (At.lastIndex = n, i = At.exec(e)) {
						switch (n = At.lastIndex, l = i[0], i[0]) {
							case "<":
								F.push({ tag: "JSXTag" });
								break;
							case ">":
								F.pop(), a === "/" || D.tag === "JSXTagEnd" ? (l = "?JSX", c = !0) : F.push({ tag: "JSXChildren" });
								break;
							case "{":
								F.push({
									tag: "InterpolationInJSX",
									nesting: u.length
								}), l = "?InterpolationInJSX", c = !1;
								break;
							case "/": a === "<" && (F.pop(), F[F.length - 1].tag === "JSXChildren" && F.pop(), F.push({ tag: "JSXTagEnd" }));
						}
						a = l, yield {
							type: "JSXPunctuator",
							value: i[0]
						};
						continue;
					}
					if (bt.lastIndex = n, i = bt.exec(e)) {
						n = bt.lastIndex, a = i[0], yield {
							type: "JSXIdentifier",
							value: i[0]
						};
						continue;
					}
					if (_t.lastIndex = n, i = _t.exec(e)) {
						n = _t.lastIndex, a = i[0], yield {
							type: "JSXString",
							value: i[0],
							closed: i[2] !== void 0
						};
						continue;
					}
					break;
				case "JSXChildren":
					if (xt.lastIndex = n, i = xt.exec(e)) {
						n = xt.lastIndex, a = i[0], yield {
							type: "JSXText",
							value: i[0]
						};
						continue;
					}
					switch (e[n]) {
						case "<":
							F.push({ tag: "JSXTag" }), n++, a = "<", yield {
								type: "JSXPunctuator",
								value: "<"
							};
							continue;
						case "{":
							F.push({
								tag: "InterpolationInJSX",
								nesting: u.length
							}), n++, a = "?InterpolationInJSX", c = !1, yield {
								type: "JSXPunctuator",
								value: "{"
							};
							continue;
					}
			}
			if (Pt.lastIndex = n, i = Pt.exec(e)) {
				n = Pt.lastIndex, yield {
					type: "WhiteSpace",
					value: i[0]
				};
				continue;
			}
			if (Ke.lastIndex = n, i = Ke.exec(e)) {
				n = Ke.lastIndex, c = !1, bu.test(a) && (a = "?NoLineTerminatorHere"), yield {
					type: "LineTerminatorSequence",
					value: i[0]
				};
				continue;
			}
			if (Bt.lastIndex = n, i = Bt.exec(e)) {
				n = Bt.lastIndex, cn.test(i[0]) && (c = !1, bu.test(a) && (a = "?NoLineTerminatorHere")), yield {
					type: "MultiLineComment",
					value: i[0],
					closed: i[1] !== void 0
				};
				continue;
			}
			if (St.lastIndex = n, i = St.exec(e)) {
				n = St.lastIndex, c = !1, yield {
					type: "SingleLineComment",
					value: i[0]
				};
				continue;
			}
			r = String.fromCodePoint(e.codePointAt(n)), n += r.length, a = r, c = !1, yield {
				type: D.tag.startsWith("JSX") ? "JSXInvalid" : "Invalid",
				value: r
			};
		}
	};
});
Yt({}, {
	__debug: () => li,
	check: () => ci,
	doc: () => wu,
	format: () => Jn,
	formatWithCursor: () => zn,
	getSupportInfo: () => fi,
	util: () => Pu,
	version: () => Mn
});
var X = (e, t) => (u, r, ...o) => u | 1 && r == null ? void 0 : (t.call(r) ?? r[e]).apply(r, o);
var io = String.prototype.replaceAll ?? function(e, t) {
	return e.global ? this.replace(e, t) : this.split(e).join(t);
}, oe = X("replaceAll", function() {
	if (typeof this == "string") return io;
});
var Ne = class {
	diff(t, u, r = {}) {
		let o;
		typeof r == "function" ? (o = r, r = {}) : "callback" in r && (o = r.callback);
		let n = this.castInput(t, r), a = this.castInput(u, r), s = this.removeEmpty(this.tokenize(n, r)), i = this.removeEmpty(this.tokenize(a, r));
		return this.diffWithOptionsObj(s, i, r, o);
	}
	diffWithOptionsObj(t, u, r, o) {
		var n;
		let a = (m) => {
			if (m = this.postProcess(m, r), o) {
				setTimeout(function() {
					o(m);
				}, 0);
				return;
			} else return m;
		}, s = u.length, i = t.length, D = 1, f = s + i;
		r.maxEditLength != null && (f = Math.min(f, r.maxEditLength));
		let l = (n = r.timeout) !== null && n !== void 0 ? n : Infinity, d = Date.now() + l, c = [{
			oldPos: -1,
			lastComponent: void 0
		}], p = this.extractCommon(c[0], u, t, 0, r);
		if (c[0].oldPos + 1 >= i && p + 1 >= s) return a(this.buildValues(c[0].lastComponent, u, t));
		let F = -Infinity, C = Infinity, y = () => {
			for (let m = Math.max(F, -D); m <= Math.min(C, D); m += 2) {
				let h, E = c[m - 1], g = c[m + 1];
				E && (c[m - 1] = void 0);
				let A = !1;
				if (g) {
					let Q = g.oldPos - m;
					A = g && 0 <= Q && Q < s;
				}
				let J = E && E.oldPos + 1 < i;
				if (!A && !J) {
					c[m] = void 0;
					continue;
				}
				if (!J || A && E.oldPos < g.oldPos ? h = this.addToPath(g, !0, !1, 0, r) : h = this.addToPath(E, !1, !0, 1, r), p = this.extractCommon(h, u, t, m, r), h.oldPos + 1 >= i && p + 1 >= s) return a(this.buildValues(h.lastComponent, u, t)) || !0;
				c[m] = h, h.oldPos + 1 >= i && (C = Math.min(C, m - 1)), p + 1 >= s && (F = Math.max(F, m + 1));
			}
			D++;
		};
		if (o) (function m() {
			setTimeout(function() {
				if (D > f || Date.now() > d) return o(void 0);
				y() || m();
			}, 0);
		})();
		else for (; D <= f && Date.now() <= d;) {
			let m = y();
			if (m) return m;
		}
	}
	addToPath(t, u, r, o, n) {
		let a = t.lastComponent;
		return a && !n.oneChangePerToken && a.added === u && a.removed === r ? {
			oldPos: t.oldPos + o,
			lastComponent: {
				count: a.count + 1,
				added: u,
				removed: r,
				previousComponent: a.previousComponent
			}
		} : {
			oldPos: t.oldPos + o,
			lastComponent: {
				count: 1,
				added: u,
				removed: r,
				previousComponent: a
			}
		};
	}
	extractCommon(t, u, r, o, n) {
		let a = u.length, s = r.length, i = t.oldPos, D = i - o, f = 0;
		for (; D + 1 < a && i + 1 < s && this.equals(r[i + 1], u[D + 1], n);) D++, i++, f++, n.oneChangePerToken && (t.lastComponent = {
			count: 1,
			previousComponent: t.lastComponent,
			added: !1,
			removed: !1
		});
		return f && !n.oneChangePerToken && (t.lastComponent = {
			count: f,
			previousComponent: t.lastComponent,
			added: !1,
			removed: !1
		}), t.oldPos = i, D;
	}
	equals(t, u, r) {
		return r.comparator ? r.comparator(t, u) : t === u || !!r.ignoreCase && t.toLowerCase() === u.toLowerCase();
	}
	removeEmpty(t) {
		let u = [];
		for (let r = 0; r < t.length; r++) t[r] && u.push(t[r]);
		return u;
	}
	castInput(t, u) {
		return t;
	}
	tokenize(t, u) {
		return Array.from(t);
	}
	join(t) {
		return t.join("");
	}
	postProcess(t, u) {
		return t;
	}
	get useLongestToken() {
		return !1;
	}
	buildValues(t, u, r) {
		let o = [], n;
		for (; t;) o.push(t), n = t.previousComponent, delete t.previousComponent, t = n;
		o.reverse();
		let a = o.length, s = 0, i = 0, D = 0;
		for (; s < a; s++) {
			let f = o[s];
			if (f.removed) f.value = this.join(r.slice(D, D + f.count)), D += f.count;
			else {
				if (!f.added && this.useLongestToken) {
					let l = u.slice(i, i + f.count);
					l = l.map(function(d, c) {
						let p = r[D + c];
						return p.length > d.length ? p : d;
					}), f.value = this.join(l);
				} else f.value = this.join(u.slice(i, i + f.count));
				i += f.count, f.added || (D += f.count);
			}
		}
		return o;
	}
};
var jt = class extends Ne {
	tokenize(t) {
		return t.slice();
	}
	join(t) {
		return t;
	}
	removeEmpty(t) {
		return t;
	}
}, ku = new jt();
function Ut(e, t, u) {
	return ku.diff(e, t, u);
}
var Do = () => {}, P = Do;
var Ru = "cr", Lu = "crlf", fo = "lf", Wt = "\r", Mu = `\r
`, Je = `
`, lo = Je;
function Yu(e) {
	let t = e.indexOf(Wt);
	return t !== -1 ? e.charAt(t + 1) === Je ? Lu : Ru : fo;
}
function Se(e) {
	return e === Ru ? Wt : e === Lu ? Mu : lo;
}
var po = new Map([
	[Je, /\n/gu],
	[Wt, /\r/gu],
	[Mu, /\r\n/gu]
]);
function $t(e, t) {
	let u = po.get(t);
	return e.match(u)?.length ?? 0;
}
var Fo = /\r\n?/gu;
function ju(e) {
	return oe(0, e, Fo, Je);
}
function mo(e) {
	return this[e < 0 ? this.length + e : e];
}
var b = X("at", function() {
	if (Array.isArray(this) || typeof this == "string") return mo;
});
var G = "string", j = "array", U = "cursor", I$1 = "indent", k = "align", v = "trim", x = "group", w = "fill", B = "if-break", R = "indent-if-break", L = "line-suffix", M = "line-suffix-boundary", _ = "line", O = "label", T = "break-parent", He = new Set([
	U,
	I$1,
	k,
	v,
	x,
	w,
	B,
	R,
	L,
	M,
	_,
	O,
	T
]);
function Uu(e) {
	let t = e.length;
	for (; t > 0 && (e[t - 1] === "\r" || e[t - 1] === `
`);) t--;
	return t < e.length ? e.slice(0, t) : e;
}
function Co(e) {
	if (typeof e == "string") return G;
	if (Array.isArray(e)) return j;
	if (!e) return;
	let { type: t } = e;
	if (He.has(t)) return t;
}
var H = Co;
var ho = (e) => new Intl.ListFormat("en-US", { type: "disjunction" }).format(e);
function go(e) {
	let t = e === null ? "null" : typeof e;
	if (t !== "string" && t !== "object") return `Unexpected doc '${t}', 
Expected it to be 'string' or 'object'.`;
	if (H(e)) throw new Error("doc is valid.");
	let u = Object.prototype.toString.call(e);
	if (u !== "[object Object]") return `Unexpected doc '${u}'.`;
	let r = ho([...He].map((o) => `'${o}'`));
	return `Unexpected doc.type '${e.type}'.
Expected it to be ${r}.`;
}
var Vt = class extends Error {
	name = "InvalidDocError";
	constructor(t) {
		super(go(t)), this.doc = t;
	}
}, Z = Vt;
var Wu = {};
function yo(e, t, u, r) {
	let o = [e];
	for (; o.length > 0;) {
		let n = o.pop();
		if (n === Wu) {
			u(o.pop());
			continue;
		}
		u && o.push(n, Wu);
		let a = H(n);
		if (!a) throw new Z(n);
		if (t?.(n) !== !1) switch (a) {
			case j:
			case w: {
				let s = a === j ? n : n.parts;
				for (let D = s.length - 1; D >= 0; --D) o.push(s[D]);
				break;
			}
			case B:
				o.push(n.flatContents, n.breakContents);
				break;
			case x:
				if (r && n.expandedStates) for (let s = n.expandedStates.length, i = s - 1; i >= 0; --i) o.push(n.expandedStates[i]);
				else o.push(n.contents);
				break;
			case k:
			case I$1:
			case R:
			case O:
			case L:
				o.push(n.contents);
				break;
			case G:
			case U:
			case v:
			case M:
			case _:
			case T: break;
			default: throw new Z(n);
		}
	}
}
var we = yo;
function Pe(e, t) {
	if (typeof e == "string") return t(e);
	let u = /* @__PURE__ */ new Map();
	return r(e);
	function r(n) {
		if (u.has(n)) return u.get(n);
		let a = o(n);
		return u.set(n, a), a;
	}
	function o(n) {
		switch (H(n)) {
			case j: return t(n.map(r));
			case w: return t({
				...n,
				parts: n.parts.map(r)
			});
			case B: return t({
				...n,
				breakContents: r(n.breakContents),
				flatContents: r(n.flatContents)
			});
			case x: {
				let { expandedStates: a, contents: s } = n;
				return a ? (a = a.map(r), s = a[0]) : s = r(s), t({
					...n,
					contents: s,
					expandedStates: a
				});
			}
			case k:
			case I$1:
			case R:
			case O:
			case L: return t({
				...n,
				contents: r(n.contents)
			});
			case G:
			case U:
			case v:
			case M:
			case _:
			case T: return t(n);
			default: throw new Z(n);
		}
	}
}
function Xe(e, t, u) {
	let r = u, o = !1;
	function n(a) {
		if (o) return !1;
		let s = t(a);
		s !== void 0 && (o = !0, r = s);
	}
	return we(e, n), r;
}
function bo(e) {
	if (e.type === x && e.break || e.type === _ && e.hard || e.type === T) return !0;
}
function Ku(e) {
	return Xe(e, bo, !1);
}
function $u(e) {
	if (e.length > 0) {
		let t = b(0, e, -1);
		!t.expandedStates && !t.break && (t.break = "propagated");
	}
	return null;
}
function Gu(e) {
	let t = /* @__PURE__ */ new Set(), u = [];
	function r(n) {
		if (n.type === T && $u(u), n.type === x) {
			if (u.push(n), t.has(n)) return !1;
			t.add(n);
		}
	}
	function o(n) {
		n.type === x && u.pop().break && $u(u);
	}
	we(e, r, o, !0);
}
function Ao(e) {
	return e.type === _ && !e.hard ? e.soft ? "" : " " : e.type === B ? e.flatContents : e;
}
function zu(e) {
	return Pe(e, Ao);
}
function Vu(e) {
	for (e = [...e]; e.length >= 2 && b(0, e, -2).type === _ && b(0, e, -1).type === T;) e.length -= 2;
	if (e.length > 0) {
		let t = Oe(b(0, e, -1));
		e[e.length - 1] = t;
	}
	return e;
}
function Oe(e) {
	switch (H(e)) {
		case I$1:
		case R:
		case x:
		case L:
		case O: {
			let t = Oe(e.contents);
			return {
				...e,
				contents: t
			};
		}
		case B: return {
			...e,
			breakContents: Oe(e.breakContents),
			flatContents: Oe(e.flatContents)
		};
		case w: return {
			...e,
			parts: Vu(e.parts)
		};
		case j: return Vu(e);
		case G: return Uu(e);
		case k:
		case U:
		case v:
		case M:
		case _:
		case T: break;
		default: throw new Z(e);
	}
	return e;
}
function qe(e) {
	return Oe(xo(e));
}
function _o(e) {
	switch (H(e)) {
		case w:
			if (e.parts.every((t) => t === "")) return "";
			break;
		case x:
			if (!e.contents && !e.id && !e.break && !e.expandedStates) return "";
			if (e.contents.type === x && e.contents.id === e.id && e.contents.break === e.break && e.contents.expandedStates === e.expandedStates) return e.contents;
			break;
		case k:
		case I$1:
		case R:
		case L:
			if (!e.contents) return "";
			break;
		case B:
			if (!e.flatContents && !e.breakContents) return "";
			break;
		case j: {
			let t = [];
			for (let u of e) {
				if (!u) continue;
				let [r, ...o] = Array.isArray(u) ? u : [u];
				typeof r == "string" && typeof b(0, t, -1) == "string" ? t[t.length - 1] += r : t.push(r), t.push(...o);
			}
			return t.length === 0 ? "" : t.length === 1 ? t[0] : t;
		}
		case G:
		case U:
		case v:
		case M:
		case _:
		case O:
		case T: break;
		default: throw new Z(e);
	}
	return e;
}
function xo(e) {
	return Pe(e, (t) => _o(t));
}
function Ju(e, t = Qe) {
	return Pe(e, (u) => typeof u == "string" ? Ie(t, u.split(`
`)) : u);
}
function Bo(e) {
	if (e.type === _) return !0;
}
function Hu(e) {
	return Xe(e, Bo, !1);
}
function Ee(e, t) {
	return e.type === O ? {
		...e,
		contents: t(e.contents)
	} : t(e);
}
var N = P, Ze = P, Xu = P, qu = P;
function ae(e) {
	return N(e), {
		type: I$1,
		contents: e
	};
}
function De(e, t) {
	return qu(e), N(t), {
		type: k,
		contents: t,
		n: e
	};
}
function Qu(e) {
	return De(Number.NEGATIVE_INFINITY, e);
}
function et(e) {
	return De({ type: "root" }, e);
}
function Zu(e) {
	return De(-1, e);
}
function tt(e, t, u) {
	N(e);
	let r = e;
	if (t > 0) {
		for (let o = 0; o < Math.floor(t / u); ++o) r = ae(r);
		r = De(t % u, r), r = De(Number.NEGATIVE_INFINITY, r);
	}
	return r;
}
var ce = { type: T };
var ee = { type: U };
function er(e) {
	return Xu(e), {
		type: w,
		parts: e
	};
}
function Kt(e, t = {}) {
	return N(e), Ze(t.expandedStates, !0), {
		type: x,
		id: t.id,
		contents: e,
		break: !!t.shouldBreak,
		expandedStates: t.expandedStates
	};
}
function tr(e, t) {
	return Kt(e[0], {
		...t,
		expandedStates: e
	});
}
function ur(e, t = "", u = {}) {
	return N(e), t !== "" && N(t), {
		type: B,
		breakContents: e,
		flatContents: t,
		groupId: u.groupId
	};
}
function rr(e, t) {
	return N(e), {
		type: R,
		contents: e,
		groupId: t.groupId,
		negate: t.negate
	};
}
function Ie(e, t) {
	N(e), Ze(t);
	let u = [];
	for (let r = 0; r < t.length; r++) r !== 0 && u.push(e), u.push(t[r]);
	return u;
}
function nr(e, t) {
	return N(t), e ? {
		type: O,
		label: e,
		contents: t
	} : t;
}
var ut = { type: _ }, or = {
	type: _,
	soft: !0
}, ke = {
	type: _,
	hard: !0
}, V$1 = [ke, ce], Gt = {
	type: _,
	hard: !0,
	literal: !0
}, Qe = [Gt, ce];
function ve(e) {
	return N(e), {
		type: L,
		contents: e
	};
}
var ar = { type: M };
var ir = { type: v };
function te(e) {
	if (!e) return "";
	if (Array.isArray(e)) {
		let t = [];
		for (let u of e) if (Array.isArray(u)) t.push(...te(u));
		else {
			let r = te(u);
			r !== "" && t.push(r);
		}
		return t;
	}
	return e.type === B ? {
		...e,
		breakContents: te(e.breakContents),
		flatContents: te(e.flatContents)
	} : e.type === x ? {
		...e,
		contents: te(e.contents),
		expandedStates: e.expandedStates?.map(te)
	} : e.type === w ? {
		type: "fill",
		parts: e.parts.map(te)
	} : e.contents ? {
		...e,
		contents: te(e.contents)
	} : e;
}
function sr(e) {
	let t = Object.create(null), u = /* @__PURE__ */ new Set();
	return r(te(e));
	function r(n, a, s) {
		if (typeof n == "string") return JSON.stringify(n);
		if (Array.isArray(n)) {
			let i = n.map(r).filter(Boolean);
			return i.length === 1 ? i[0] : `[${i.join(", ")}]`;
		}
		if (n.type === _) {
			let i = s?.[a + 1]?.type === T;
			return n.literal ? i ? "literalline" : "literallineWithoutBreakParent" : n.hard ? i ? "hardline" : "hardlineWithoutBreakParent" : n.soft ? "softline" : "line";
		}
		if (n.type === T) return s?.[a - 1]?.type === _ && s[a - 1].hard ? void 0 : "breakParent";
		if (n.type === v) return "trim";
		if (n.type === I$1) return "indent(" + r(n.contents) + ")";
		if (n.type === k) return n.n === Number.NEGATIVE_INFINITY ? "dedentToRoot(" + r(n.contents) + ")" : n.n < 0 ? "dedent(" + r(n.contents) + ")" : n.n.type === "root" ? "markAsRoot(" + r(n.contents) + ")" : "align(" + JSON.stringify(n.n) + ", " + r(n.contents) + ")";
		if (n.type === B) return "ifBreak(" + r(n.breakContents) + (n.flatContents ? ", " + r(n.flatContents) : "") + (n.groupId ? (n.flatContents ? "" : ", \"\"") + `, { groupId: ${o(n.groupId)} }` : "") + ")";
		if (n.type === R) {
			let i = [];
			n.negate && i.push("negate: true"), n.groupId && i.push(`groupId: ${o(n.groupId)}`);
			let D = i.length > 0 ? `, { ${i.join(", ")} }` : "";
			return `indentIfBreak(${r(n.contents)}${D})`;
		}
		if (n.type === x) {
			let i = [];
			n.break && n.break !== "propagated" && i.push("shouldBreak: true"), n.id && i.push(`id: ${o(n.id)}`);
			let D = i.length > 0 ? `, { ${i.join(", ")} }` : "";
			return n.expandedStates ? `conditionalGroup([${n.expandedStates.map((f) => r(f)).join(",")}]${D})` : `group(${r(n.contents)}${D})`;
		}
		if (n.type === w) return `fill([${n.parts.map((i) => r(i)).join(", ")}])`;
		if (n.type === L) return "lineSuffix(" + r(n.contents) + ")";
		if (n.type === M) return "lineSuffixBoundary";
		if (n.type === O) return `label(${JSON.stringify(n.label)}, ${r(n.contents)})`;
		if (n.type === U) return "cursor";
		throw new Error("Unknown doc type " + n.type);
	}
	function o(n) {
		if (typeof n != "symbol") return JSON.stringify(String(n));
		if (n in t) return t[n];
		let a = n.description || "symbol";
		for (let s = 0;; s++) {
			let i = a + (s > 0 ? ` #${s}` : "");
			if (!u.has(i)) return u.add(i), t[n] = `Symbol.for(${JSON.stringify(i)})`;
		}
	}
}
var Dr = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E-\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED8\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDD1D\uDEEF]\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE]|[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE]|\uDEEF\u200D\uD83D\uDC69\uD83C[\uDFFB-\uDFFE])))?))?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE8A\uDE8E-\uDEC2\uDEC6\uDEC8\uDECD-\uDEDC\uDEDF-\uDEEA\uDEEF]|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC30\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3\uDE70]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF]|\uDEEF\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
function zt(e) {
	return e === 12288 || e >= 65281 && e <= 65376 || e >= 65504 && e <= 65510;
}
function Jt(e) {
	return e >= 4352 && e <= 4447 || e === 8986 || e === 8987 || e === 9001 || e === 9002 || e >= 9193 && e <= 9196 || e === 9200 || e === 9203 || e === 9725 || e === 9726 || e === 9748 || e === 9749 || e >= 9776 && e <= 9783 || e >= 9800 && e <= 9811 || e === 9855 || e >= 9866 && e <= 9871 || e === 9875 || e === 9889 || e === 9898 || e === 9899 || e === 9917 || e === 9918 || e === 9924 || e === 9925 || e === 9934 || e === 9940 || e === 9962 || e === 9970 || e === 9971 || e === 9973 || e === 9978 || e === 9981 || e === 9989 || e === 9994 || e === 9995 || e === 10024 || e === 10060 || e === 10062 || e >= 10067 && e <= 10069 || e === 10071 || e >= 10133 && e <= 10135 || e === 10160 || e === 10175 || e === 11035 || e === 11036 || e === 11088 || e === 11093 || e >= 11904 && e <= 11929 || e >= 11931 && e <= 12019 || e >= 12032 && e <= 12245 || e >= 12272 && e <= 12287 || e >= 12289 && e <= 12350 || e >= 12353 && e <= 12438 || e >= 12441 && e <= 12543 || e >= 12549 && e <= 12591 || e >= 12593 && e <= 12686 || e >= 12688 && e <= 12773 || e >= 12783 && e <= 12830 || e >= 12832 && e <= 12871 || e >= 12880 && e <= 42124 || e >= 42128 && e <= 42182 || e >= 43360 && e <= 43388 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65040 && e <= 65049 || e >= 65072 && e <= 65106 || e >= 65108 && e <= 65126 || e >= 65128 && e <= 65131 || e >= 94176 && e <= 94180 || e >= 94192 && e <= 94198 || e >= 94208 && e <= 101589 || e >= 101631 && e <= 101662 || e >= 101760 && e <= 101874 || e >= 110576 && e <= 110579 || e >= 110581 && e <= 110587 || e === 110589 || e === 110590 || e >= 110592 && e <= 110882 || e === 110898 || e >= 110928 && e <= 110930 || e === 110933 || e >= 110948 && e <= 110951 || e >= 110960 && e <= 111355 || e >= 119552 && e <= 119638 || e >= 119648 && e <= 119670 || e === 126980 || e === 127183 || e === 127374 || e >= 127377 && e <= 127386 || e >= 127488 && e <= 127490 || e >= 127504 && e <= 127547 || e >= 127552 && e <= 127560 || e === 127568 || e === 127569 || e >= 127584 && e <= 127589 || e >= 127744 && e <= 127776 || e >= 127789 && e <= 127797 || e >= 127799 && e <= 127868 || e >= 127870 && e <= 127891 || e >= 127904 && e <= 127946 || e >= 127951 && e <= 127955 || e >= 127968 && e <= 127984 || e === 127988 || e >= 127992 && e <= 128062 || e === 128064 || e >= 128066 && e <= 128252 || e >= 128255 && e <= 128317 || e >= 128331 && e <= 128334 || e >= 128336 && e <= 128359 || e === 128378 || e === 128405 || e === 128406 || e === 128420 || e >= 128507 && e <= 128591 || e >= 128640 && e <= 128709 || e === 128716 || e >= 128720 && e <= 128722 || e >= 128725 && e <= 128728 || e >= 128732 && e <= 128735 || e === 128747 || e === 128748 || e >= 128756 && e <= 128764 || e >= 128992 && e <= 129003 || e === 129008 || e >= 129292 && e <= 129338 || e >= 129340 && e <= 129349 || e >= 129351 && e <= 129535 || e >= 129648 && e <= 129660 || e >= 129664 && e <= 129674 || e >= 129678 && e <= 129734 || e === 129736 || e >= 129741 && e <= 129756 || e >= 129759 && e <= 129770 || e >= 129775 && e <= 129784 || e >= 131072 && e <= 196605 || e >= 196608 && e <= 262141;
}
var cr = "©®‼⁉™ℹ↔↕↖↗↘↙↩↪⌨⏏⏱⏲⏸⏹⏺▪▫▶◀◻◼☀☁☂☃☄☎☑☘☝☠☢☣☦☪☮☯☸☹☺♀♂♟♠♣♥♦♨♻♾⚒⚔⚕⚖⚗⚙⚛⚜⚠⚧⚰⚱⛈⛏⛑⛓⛩⛱⛷⛸⛹✂✈✉✌✍✏✒✔✖✝✡✳✴❄❇❣❤➡⤴⤵⬅⬆⬇";
var To = /[^\x20-\x7F]/u, No = new Set(cr);
function So(e) {
	if (!e) return 0;
	if (!To.test(e)) return e.length;
	e = e.replace(Dr(), (u) => No.has(u) ? " " : "  ");
	let t = 0;
	for (let u of e) {
		let r = u.codePointAt(0);
		r <= 31 || r >= 127 && r <= 159 || r >= 768 && r <= 879 || r >= 65024 && r <= 65039 || (t += zt(r) || Jt(r) ? 2 : 1);
	}
	return t;
}
var Re = So;
var wo = { type: 0 }, Oo = { type: 1 }, Ht = {
	value: "",
	length: 0,
	queue: [],
	get root() {
		return Ht;
	}
};
function fr(e, t, u) {
	let r = t.type === 1 ? e.queue.slice(0, -1) : [...e.queue, t], o = "", n = 0, a = 0, s = 0;
	for (let p of r) switch (p.type) {
		case 0:
			f(), u.useTabs ? i(1) : D(u.tabWidth);
			break;
		case 3: {
			let { string: F } = p;
			f(), o += F, n += F.length;
			break;
		}
		case 2: {
			let { width: F } = p;
			a += 1, s += F;
			break;
		}
		default: throw new Error(`Unexpected indent comment '${p.type}'.`);
	}
	return d(), {
		...e,
		value: o,
		length: n,
		queue: r
	};
	function i(p) {
		o += "	".repeat(p), n += u.tabWidth * p;
	}
	function D(p) {
		o += " ".repeat(p), n += p;
	}
	function f() {
		u.useTabs ? l() : d();
	}
	function l() {
		a > 0 && i(a), c();
	}
	function d() {
		s > 0 && D(s), c();
	}
	function c() {
		a = 0, s = 0;
	}
}
function lr(e, t, u) {
	if (!t) return e;
	if (t.type === "root") return {
		...e,
		root: e
	};
	if (t === Number.NEGATIVE_INFINITY) return e.root;
	let r;
	return typeof t == "number" ? t < 0 ? r = Oo : r = {
		type: 2,
		width: t
	} : r = {
		type: 3,
		string: t
	}, fr(e, r, u);
}
function dr(e, t) {
	return fr(e, wo, t);
}
function Po(e) {
	let t = 0;
	for (let u = e.length - 1; u >= 0; u--) {
		let r = e[u];
		if (r === " " || r === "	") t++;
		else break;
	}
	return t;
}
function Xt(e) {
	let t = Po(e);
	return {
		text: t === 0 ? e : e.slice(0, e.length - t),
		count: t
	};
}
var W = Symbol("MODE_BREAK"), q = Symbol("MODE_FLAT"), qt = Symbol("DOC_FILL_PRINTED_LENGTH");
function rt(e, t, u, r, o, n) {
	if (u === Number.POSITIVE_INFINITY) return !0;
	let a = t.length, s = !1, i = [e], D = "";
	for (; u >= 0;) {
		if (i.length === 0) {
			if (a === 0) return !0;
			i.push(t[--a]);
			continue;
		}
		let { mode: f, doc: l } = i.pop(), d = H(l);
		switch (d) {
			case G:
				l && (s && (D += " ", u -= 1, s = !1), D += l, u -= Re(l));
				break;
			case j:
			case w: {
				let c = d === j ? l : l.parts, p = l[qt] ?? 0;
				for (let F = c.length - 1; F >= p; F--) i.push({
					mode: f,
					doc: c[F]
				});
				break;
			}
			case I$1:
			case k:
			case R:
			case O:
				i.push({
					mode: f,
					doc: l.contents
				});
				break;
			case v: {
				let { text: c, count: p } = Xt(D);
				D = c, u += p;
				break;
			}
			case x: {
				if (n && l.break) return !1;
				let c = l.break ? W : f, p = l.expandedStates && c === W ? b(0, l.expandedStates, -1) : l.contents;
				i.push({
					mode: c,
					doc: p
				});
				break;
			}
			case B: {
				let p = (l.groupId ? o[l.groupId] || q : f) === W ? l.breakContents : l.flatContents;
				p && i.push({
					mode: f,
					doc: p
				});
				break;
			}
			case _:
				if (f === W || l.hard) return !0;
				l.soft || (s = !0);
				break;
			case L:
				r = !0;
				break;
			case M:
				if (r) return !1;
				break;
		}
	}
	return !1;
}
function Ce(e, t) {
	let u = Object.create(null), r = t.printWidth, o = Se(t.endOfLine), n = 0, a = [{
		indent: Ht,
		mode: W,
		doc: e
	}], s = "", i = !1, D = [], f = [], l = [], d = [], c = 0;
	for (Gu(e); a.length > 0;) {
		let { indent: m, mode: h, doc: E } = a.pop();
		switch (H(E)) {
			case G: {
				let g = o !== `
` ? oe(0, E, `
`, o) : E;
				g && (s += g, a.length > 0 && (n += Re(g)));
				break;
			}
			case j:
				for (let g = E.length - 1; g >= 0; g--) a.push({
					indent: m,
					mode: h,
					doc: E[g]
				});
				break;
			case U:
				if (f.length >= 2) throw new Error("There are too many 'cursor' in doc.");
				f.push(c + s.length);
				break;
			case I$1:
				a.push({
					indent: dr(m, t),
					mode: h,
					doc: E.contents
				});
				break;
			case k:
				a.push({
					indent: lr(m, E.n, t),
					mode: h,
					doc: E.contents
				});
				break;
			case v:
				y();
				break;
			case x:
				switch (h) {
					case q: if (!i) {
						a.push({
							indent: m,
							mode: E.break ? W : q,
							doc: E.contents
						});
						break;
					}
					case W: {
						i = !1;
						let g = {
							indent: m,
							mode: q,
							doc: E.contents
						}, A = r - n, J = D.length > 0;
						if (!E.break && rt(g, a, A, J, u)) a.push(g);
						else if (E.expandedStates) {
							let Q = b(0, E.expandedStates, -1);
							if (E.break) {
								a.push({
									indent: m,
									mode: W,
									doc: Q
								});
								break;
							} else for (let re = 1; re < E.expandedStates.length + 1; re++) if (re >= E.expandedStates.length) {
								a.push({
									indent: m,
									mode: W,
									doc: Q
								});
								break;
							} else {
								let ne = {
									indent: m,
									mode: q,
									doc: E.expandedStates[re]
								};
								if (rt(ne, a, A, J, u)) {
									a.push(ne);
									break;
								}
							}
						} else a.push({
							indent: m,
							mode: W,
							doc: E.contents
						});
						break;
					}
				}
				E.id && (u[E.id] = b(0, a, -1).mode);
				break;
			case w: {
				let g = r - n, A = E[qt] ?? 0, { parts: J } = E, Q = J.length - A;
				if (Q === 0) break;
				let re = J[A + 0], Te = J[A + 1], ne = {
					indent: m,
					mode: q,
					doc: re
				}, vt = {
					indent: m,
					mode: W,
					doc: re
				}, Rt = rt(ne, [], g, D.length > 0, u, !0);
				if (Q === 1) {
					Rt ? a.push(ne) : a.push(vt);
					break;
				}
				let Iu = {
					indent: m,
					mode: q,
					doc: Te
				}, Lt = {
					indent: m,
					mode: W,
					doc: Te
				};
				if (Q === 2) {
					Rt ? a.push(Iu, ne) : a.push(Lt, vt);
					break;
				}
				let Xn = J[A + 2], qn = {
					indent: m,
					mode: h,
					doc: {
						...E,
						[qt]: A + 2
					}
				}, Qn = rt({
					indent: m,
					mode: q,
					doc: [
						re,
						Te,
						Xn
					]
				}, [], g, D.length > 0, u, !0);
				a.push(qn), Qn ? a.push(Iu, ne) : Rt ? a.push(Lt, ne) : a.push(Lt, vt);
				break;
			}
			case B:
			case R: {
				let g = E.groupId ? u[E.groupId] : h;
				if (g === W) {
					let A = E.type === B ? E.breakContents : E.negate ? E.contents : ae(E.contents);
					A && a.push({
						indent: m,
						mode: h,
						doc: A
					});
				}
				if (g === q) {
					let A = E.type === B ? E.flatContents : E.negate ? ae(E.contents) : E.contents;
					A && a.push({
						indent: m,
						mode: h,
						doc: A
					});
				}
				break;
			}
			case L:
				D.push({
					indent: m,
					mode: h,
					doc: E.contents
				});
				break;
			case M:
				D.length > 0 && a.push({
					indent: m,
					mode: h,
					doc: ke
				});
				break;
			case _:
				switch (h) {
					case q: if (E.hard) i = !0;
					else {
						E.soft || (s += " ", n += 1);
						break;
					}
					case W:
						if (D.length > 0) {
							a.push({
								indent: m,
								mode: h,
								doc: E
							}, ...D.reverse()), D.length = 0;
							break;
						}
						E.literal ? (s += o, n = 0, m.root && (m.root.value && (s += m.root.value), n = m.root.length)) : (y(), s += o + m.value, n = m.length);
						break;
				}
				break;
			case O:
				a.push({
					indent: m,
					mode: h,
					doc: E.contents
				});
				break;
			case T: break;
			default: throw new Z(E);
		}
		a.length === 0 && D.length > 0 && (a.push(...D.reverse()), D.length = 0);
	}
	let p = l.join("") + s, F = [...d, ...f];
	if (F.length !== 2) return { formatted: p };
	let C = F[0];
	return {
		formatted: p,
		cursorNodeStart: C,
		cursorNodeText: p.slice(C, b(0, F, -1))
	};
	function y() {
		let { text: m, count: h } = Xt(s);
		m && (l.push(m), c += m.length), s = "", n -= h, f.length > 0 && (d.push(...f.map((E) => Math.min(E, c))), f.length = 0);
	}
}
function Io(e, t, u = 0) {
	let r = 0;
	for (let o = u; o < e.length; ++o) e[o] === "	" ? r = r + t - r % t : r++;
	return r;
}
var he = Io;
var Qt = class {
	constructor(t) {
		this.stack = [t];
	}
	get key() {
		let { stack: t, siblings: u } = this;
		return b(0, t, u === null ? -2 : -4) ?? null;
	}
	get index() {
		return this.siblings === null ? null : b(0, this.stack, -2);
	}
	get node() {
		return b(0, this.stack, -1);
	}
	get parent() {
		return this.getNode(1);
	}
	get grandparent() {
		return this.getNode(2);
	}
	get isInArray() {
		return this.siblings !== null;
	}
	get siblings() {
		let { stack: t } = this, u = b(0, t, -3);
		return Array.isArray(u) ? u : null;
	}
	get next() {
		let { siblings: t } = this;
		return t === null ? null : t[this.index + 1];
	}
	get previous() {
		let { siblings: t } = this;
		return t === null ? null : t[this.index - 1];
	}
	get isFirst() {
		return this.index === 0;
	}
	get isLast() {
		let { siblings: t, index: u } = this;
		return t !== null && u === t.length - 1;
	}
	get isRoot() {
		return this.stack.length === 1;
	}
	get root() {
		return this.stack[0];
	}
	get ancestors() {
		return [...this.#e()];
	}
	getName() {
		let { stack: t } = this, { length: u } = t;
		return u > 1 ? b(0, t, -2) : null;
	}
	getValue() {
		return b(0, this.stack, -1);
	}
	getNode(t = 0) {
		let u = this.#t(t);
		return u === -1 ? null : this.stack[u];
	}
	getParentNode(t = 0) {
		return this.getNode(t + 1);
	}
	#t(t) {
		let { stack: u } = this;
		for (let r = u.length - 1; r >= 0; r -= 2) if (!Array.isArray(u[r]) && --t < 0) return r;
		return -1;
	}
	call(t, ...u) {
		let { stack: r } = this, { length: o } = r, n = b(0, r, -1);
		for (let a of u) n = n?.[a], r.push(a, n);
		try {
			return t(this);
		} finally {
			r.length = o;
		}
	}
	callParent(t, u = 0) {
		let r = this.#t(u + 1), o = this.stack.splice(r + 1);
		try {
			return t(this);
		} finally {
			this.stack.push(...o);
		}
	}
	each(t, ...u) {
		let { stack: r } = this, { length: o } = r, n = b(0, r, -1);
		for (let a of u) n = n[a], r.push(a, n);
		try {
			for (let a = 0; a < n.length; ++a) r.push(a, n[a]), t(this, a, n), r.length -= 2;
		} finally {
			r.length = o;
		}
	}
	map(t, ...u) {
		let r = [];
		return this.each((o, n, a) => {
			r[n] = t(o, n, a);
		}, ...u), r;
	}
	match(...t) {
		let u = this.stack.length - 1, r = null, o = this.stack[u--];
		for (let n of t) {
			if (o === void 0) return !1;
			let a = null;
			if (typeof r == "number" && (a = r, r = this.stack[u--], o = this.stack[u--]), n && !n(o, r, a)) return !1;
			r = this.stack[u--], o = this.stack[u--];
		}
		return !0;
	}
	findAncestor(t) {
		for (let u of this.#e()) if (t(u)) return u;
	}
	hasAncestor(t) {
		for (let u of this.#e()) if (t(u)) return !0;
		return !1;
	}
	*#e() {
		let { stack: t } = this;
		for (let u = t.length - 3; u >= 0; u -= 2) {
			let r = t[u];
			Array.isArray(r) || (yield r);
		}
	}
}, pr = Qt;
function ko(e) {
	return e !== null && typeof e == "object";
}
var ge = ko;
function ye(e) {
	return (t, u, r) => {
		let o = !!r?.backwards;
		if (u === !1) return !1;
		let { length: n } = t, a = u;
		for (; a >= 0 && a < n;) {
			let s = t.charAt(a);
			if (e instanceof RegExp) {
				if (!e.test(s)) return a;
			} else if (!e.includes(s)) return a;
			o ? a-- : a++;
		}
		return a === -1 || a === n ? a : !1;
	};
}
var Fr = ye(/\s/u), Y = ye(" 	"), nt = ye(",; 	"), ot = ye(/[^\n\r]/u);
var mr = (e) => e === `
` || e === "\r" || e === "\u2028" || e === "\u2029";
function vo(e, t, u) {
	let r = !!u?.backwards;
	if (t === !1) return !1;
	let o = e.charAt(t);
	if (r) {
		if (e.charAt(t - 1) === "\r" && o === `
`) return t - 2;
		if (mr(o)) return t - 1;
	} else {
		if (o === "\r" && e.charAt(t + 1) === `
`) return t + 2;
		if (mr(o)) return t + 1;
	}
	return t;
}
var K = vo;
function Ro(e, t, u = {}) {
	let r = Y(e, u.backwards ? t - 1 : t, u);
	return r !== K(e, r, u);
}
var z = Ro;
function Lo(e) {
	return Array.isArray(e) && e.length > 0;
}
var Er = Lo;
function* be(e, t) {
	let { getVisitorKeys: u, filter: r = () => !0 } = t, o = (n) => ge(n) && r(n);
	for (let n of u(e)) {
		let a = e[n];
		if (Array.isArray(a)) for (let s of a) o(s) && (yield s);
		else o(a) && (yield a);
	}
}
function* Cr(e, t) {
	let u = [e];
	for (let r = 0; r < u.length; r++) {
		let o = u[r];
		for (let n of be(o, t)) yield n, u.push(n);
	}
}
function hr(e, t) {
	return be(e, t).next().done;
}
function gr(e, t, u) {
	let { cache: r } = u;
	if (r.has(e)) return r.get(e);
	let { filter: o } = u;
	if (!o) return [];
	let n, a = (u.getChildren?.(e, u) ?? [...be(e, { getVisitorKeys: u.getVisitorKeys })]).flatMap((D) => (n ?? (n = [e, ...t]), o(D, n) ? [D] : gr(D, n, u))), { locStart: s, locEnd: i } = u;
	return a.sort((D, f) => s(D) - s(f) || i(D) - i(f)), r.set(e, a), a;
}
var at = gr;
function Mo(e) {
	let t = e.type || e.kind || "(unknown type)", u = String(e.name || e.id && (typeof e.id == "object" ? e.id.name : e.id) || e.key && (typeof e.key == "object" ? e.key.name : e.key) || e.value && (typeof e.value == "object" ? "" : String(e.value)) || e.operator || "");
	return u.length > 20 && (u = u.slice(0, 19) + "…"), t + (u ? " " + u : "");
}
function Zt(e, t) {
	(e.comments ?? (e.comments = [])).push(t), t.printed = !1, t.nodeDescription = Mo(e);
}
function fe(e, t) {
	t.leading = !0, t.trailing = !1, Zt(e, t);
}
function ue(e, t, u) {
	t.leading = !1, t.trailing = !1, u && (t.marker = u), Zt(e, t);
}
function le(e, t) {
	t.leading = !1, t.trailing = !0, Zt(e, t);
}
var uu = /* @__PURE__ */ new WeakMap();
function br(e, t, u, r, o = []) {
	let { locStart: n, locEnd: a } = u, s = n(t), i = a(t), D = at(e, o, {
		cache: uu,
		locStart: n,
		locEnd: a,
		getVisitorKeys: u.getVisitorKeys,
		filter: u.printer.canAttachComment,
		getChildren: u.printer.getCommentChildNodes
	}), f, l, d = 0, c = D.length;
	for (; d < c;) {
		let p = d + c >> 1, F = D[p], C = n(F), y = a(F);
		if (C <= s && i <= y) return br(F, t, u, F, [F, ...o]);
		if (y <= s) {
			f = F, d = p + 1;
			continue;
		}
		if (i <= C) {
			l = F, c = p;
			continue;
		}
		throw new Error("Comment location overlaps with node location");
	}
	if (r?.type === "TemplateLiteral") {
		let { quasis: p } = r, F = tu(p, t, u);
		f && tu(p, f, u) !== F && (f = null), l && tu(p, l, u) !== F && (l = null);
	}
	return {
		enclosingNode: r,
		precedingNode: f,
		followingNode: l
	};
}
var eu = () => !1;
function Ar(e, t) {
	let { comments: u } = e;
	if (delete e.comments, !Er(u) || !t.printer.canAttachComment) return;
	let r = [], { printer: { features: { experimental_avoidAstMutation: o }, handleComments: n = {} }, originalText: a } = t, { ownLine: s = eu, endOfLine: i = eu, remaining: D = eu } = n, f = u.map((l, d) => ({
		...br(e, l, t),
		comment: l,
		text: a,
		options: t,
		ast: e,
		isLastComment: u.length - 1 === d
	}));
	for (let [l, d] of f.entries()) {
		let { comment: c, precedingNode: p, enclosingNode: F, followingNode: C, text: y, options: m, ast: h, isLastComment: E } = d, g;
		if (o ? g = [d] : (c.enclosingNode = F, c.precedingNode = p, c.followingNode = C, g = [
			c,
			y,
			m,
			h,
			E
		]), Yo(y, m, f, l)) c.placement = "ownLine", s(...g) || (C ? fe(C, c) : p ? le(p, c) : F ? ue(F, c) : ue(h, c));
		else if (jo(y, m, f, l)) c.placement = "endOfLine", i(...g) || (p ? le(p, c) : C ? fe(C, c) : F ? ue(F, c) : ue(h, c));
		else if (c.placement = "remaining", !D(...g)) if (p && C) {
			let A = r.length;
			A > 0 && r[A - 1].followingNode !== C && yr(r, m), r.push(d);
		} else p ? le(p, c) : C ? fe(C, c) : F ? ue(F, c) : ue(h, c);
	}
	if (yr(r, t), !o) for (let l of u) delete l.precedingNode, delete l.enclosingNode, delete l.followingNode;
}
var _r = (e) => !/[\S\n\u2028\u2029]/u.test(e);
function Yo(e, t, u, r) {
	let { comment: o, precedingNode: n } = u[r], { locStart: a, locEnd: s } = t, i = a(o);
	if (n) for (let D = r - 1; D >= 0; D--) {
		let { comment: f, precedingNode: l } = u[D];
		if (l !== n || !_r(e.slice(s(f), i))) break;
		i = a(f);
	}
	return z(e, i, { backwards: !0 });
}
function jo(e, t, u, r) {
	let { comment: o, followingNode: n } = u[r], { locStart: a, locEnd: s } = t, i = s(o);
	if (n) for (let D = r + 1; D < u.length; D++) {
		let { comment: f, followingNode: l } = u[D];
		if (l !== n || !_r(e.slice(i, a(f)))) break;
		i = s(f);
	}
	return z(e, i);
}
function yr(e, t) {
	let u = e.length;
	if (u === 0) return;
	let { precedingNode: r, followingNode: o } = e[0], n = t.locStart(o), a;
	for (a = u; a > 0; --a) {
		let { comment: s, precedingNode: i, followingNode: D } = e[a - 1];
		P(i, r), P(D, o);
		let f = t.originalText.slice(t.locEnd(s), n);
		if (t.printer.isGap?.(f, t) ?? /^[\s(]*$/u.test(f)) n = t.locStart(s);
		else break;
	}
	for (let [s, { comment: i }] of e.entries()) s < a ? le(r, i) : fe(o, i);
	for (let s of [r, o]) s.comments && s.comments.length > 1 && s.comments.sort((i, D) => t.locStart(i) - t.locStart(D));
	e.length = 0;
}
function tu(e, t, u) {
	let r = u.locStart(t) - 1;
	for (let o = 1; o < e.length; ++o) if (r < u.locStart(e[o])) return o - 1;
	return 0;
}
function Uo(e, t) {
	let u = t - 1;
	u = Y(e, u, { backwards: !0 }), u = K(e, u, { backwards: !0 }), u = Y(e, u, { backwards: !0 });
	let r = K(e, u, { backwards: !0 });
	return u !== r;
}
var Le = Uo;
function xr(e, t) {
	let u = e.node;
	return u.printed = !0, t.printer.printComment(e, t);
}
function Wo(e, t) {
	let u = e.node, r = [xr(e, t)], { printer: o, originalText: n, locStart: a, locEnd: s } = t;
	if (o.isBlockComment?.(u)) {
		let f = z(n, s(u)) ? z(n, a(u), { backwards: !0 }) ? V$1 : ut : " ";
		r.push(f);
	} else r.push(V$1);
	let D = K(n, Y(n, s(u)));
	return D !== !1 && z(n, D) && r.push(V$1), r;
}
function $o(e, t, u) {
	let r = e.node, o = xr(e, t), { printer: n, originalText: a, locStart: s } = t, i = n.isBlockComment?.(r);
	if (u?.hasLineSuffix && !u?.isBlock || z(a, s(r), { backwards: !0 })) return {
		doc: ve([
			V$1,
			Le(a, s(r)) ? V$1 : "",
			o
		]),
		isBlock: i,
		hasLineSuffix: !0
	};
	return !i || u?.hasLineSuffix ? {
		doc: [ve([" ", o]), ce],
		isBlock: i,
		hasLineSuffix: !0
	} : {
		doc: [" ", o],
		isBlock: i,
		hasLineSuffix: !1
	};
}
function Vo(e, t) {
	let u = e.node;
	if (!u) return {};
	let r = t[Symbol.for("printedComments")];
	if ((u.comments || []).filter((i) => !r.has(i)).length === 0) return {
		leading: "",
		trailing: ""
	};
	let n = [], a = [], s;
	return e.each(() => {
		let i = e.node;
		if (r?.has(i)) return;
		let { leading: D, trailing: f } = i;
		D ? n.push(Wo(e, t)) : f && (s = $o(e, t, s), a.push(s.doc));
	}, "comments"), {
		leading: n,
		trailing: a
	};
}
function Br(e, t, u) {
	let { leading: r, trailing: o } = Vo(e, u);
	return !r && !o ? t : Ee(t, (n) => [
		r,
		n,
		o
	]);
}
function Tr(e) {
	let { [Symbol.for("comments")]: t, [Symbol.for("printedComments")]: u } = e;
	for (let r of t) {
		if (!r.printed && !u.has(r)) throw new Error("Comment \"" + r.value.trim() + "\" was not printed. Please report this error!");
		delete r.printed;
	}
}
var Nr = () => P;
var Me = class extends Error {
	name = "ConfigError";
}, Ye = class extends Error {
	name = "UndefinedParserError";
};
var Sr = {
	checkIgnorePragma: {
		category: "Special",
		type: "boolean",
		default: !1,
		description: "Check whether the file's first docblock comment contains '@noprettier' or '@noformat' to determine if it should be formatted.",
		cliCategory: "Other"
	},
	cursorOffset: {
		category: "Special",
		type: "int",
		default: -1,
		range: {
			start: -1,
			end: Infinity,
			step: 1
		},
		description: "Print (to stderr) where a cursor at the given position would move to after formatting.",
		cliCategory: "Editor"
	},
	endOfLine: {
		category: "Global",
		type: "choice",
		default: "lf",
		description: "Which end of line characters to apply.",
		choices: [
			{
				value: "lf",
				description: "Line Feed only (\\n), common on Linux and macOS as well as inside git repos"
			},
			{
				value: "crlf",
				description: "Carriage Return + Line Feed characters (\\r\\n), common on Windows"
			},
			{
				value: "cr",
				description: "Carriage Return character only (\\r), used very rarely"
			},
			{
				value: "auto",
				description: `Maintain existing
(mixed values within one file are normalised by looking at what's used after the first line)`
			}
		]
	},
	filepath: {
		category: "Special",
		type: "path",
		description: "Specify the input filepath. This will be used to do parser inference.",
		cliName: "stdin-filepath",
		cliCategory: "Other",
		cliDescription: "Path to the file to pretend that stdin comes from."
	},
	insertPragma: {
		category: "Special",
		type: "boolean",
		default: !1,
		description: "Insert @format pragma into file's first docblock comment.",
		cliCategory: "Other"
	},
	parser: {
		category: "Global",
		type: "choice",
		default: void 0,
		description: "Which parser to use.",
		exception: (e) => typeof e == "string" || typeof e == "function",
		choices: [
			{
				value: "flow",
				description: "Flow"
			},
			{
				value: "babel",
				description: "JavaScript"
			},
			{
				value: "babel-flow",
				description: "Flow"
			},
			{
				value: "babel-ts",
				description: "TypeScript"
			},
			{
				value: "typescript",
				description: "TypeScript"
			},
			{
				value: "acorn",
				description: "JavaScript"
			},
			{
				value: "espree",
				description: "JavaScript"
			},
			{
				value: "meriyah",
				description: "JavaScript"
			},
			{
				value: "css",
				description: "CSS"
			},
			{
				value: "less",
				description: "Less"
			},
			{
				value: "scss",
				description: "SCSS"
			},
			{
				value: "json",
				description: "JSON"
			},
			{
				value: "json5",
				description: "JSON5"
			},
			{
				value: "jsonc",
				description: "JSON with Comments"
			},
			{
				value: "json-stringify",
				description: "JSON.stringify"
			},
			{
				value: "graphql",
				description: "GraphQL"
			},
			{
				value: "markdown",
				description: "Markdown"
			},
			{
				value: "mdx",
				description: "MDX"
			},
			{
				value: "vue",
				description: "Vue"
			},
			{
				value: "yaml",
				description: "YAML"
			},
			{
				value: "glimmer",
				description: "Ember / Handlebars"
			},
			{
				value: "html",
				description: "HTML"
			},
			{
				value: "angular",
				description: "Angular"
			},
			{
				value: "lwc",
				description: "Lightning Web Components"
			},
			{
				value: "mjml",
				description: "MJML"
			}
		]
	},
	plugins: {
		type: "path",
		array: !0,
		default: [{ value: [] }],
		category: "Global",
		description: "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.",
		exception: (e) => typeof e == "string" || typeof e == "object",
		cliName: "plugin",
		cliCategory: "Config"
	},
	printWidth: {
		category: "Global",
		type: "int",
		default: 80,
		description: "The line length where Prettier will try wrap.",
		range: {
			start: 0,
			end: Infinity,
			step: 1
		}
	},
	rangeEnd: {
		category: "Special",
		type: "int",
		default: Infinity,
		range: {
			start: 0,
			end: Infinity,
			step: 1
		},
		description: `Format code ending at a given character offset (exclusive).
The range will extend forwards to the end of the selected statement.`,
		cliCategory: "Editor"
	},
	rangeStart: {
		category: "Special",
		type: "int",
		default: 0,
		range: {
			start: 0,
			end: Infinity,
			step: 1
		},
		description: `Format code starting at a given character offset.
The range will extend backwards to the start of the first line containing the selected statement.`,
		cliCategory: "Editor"
	},
	requirePragma: {
		category: "Special",
		type: "boolean",
		default: !1,
		description: "Require either '@prettier' or '@format' to be present in the file's first docblock comment in order for it to be formatted.",
		cliCategory: "Other"
	},
	tabWidth: {
		type: "int",
		category: "Global",
		default: 2,
		description: "Number of spaces per indentation level.",
		range: {
			start: 0,
			end: Infinity,
			step: 1
		}
	},
	useTabs: {
		category: "Global",
		type: "boolean",
		default: !1,
		description: "Indent with tabs instead of spaces."
	},
	embeddedLanguageFormatting: {
		category: "Global",
		type: "choice",
		default: "auto",
		description: "Control how Prettier formats quoted code embedded in the file.",
		choices: [{
			value: "auto",
			description: "Format embedded code if Prettier can automatically identify it."
		}, {
			value: "off",
			description: "Never automatically format embedded code."
		}]
	}
};
function it({ plugins: e = [], showDeprecated: t = !1 } = {}) {
	let u = e.flatMap((o) => o.languages ?? []), r = [];
	for (let o of Go(Object.assign({}, ...e.map(({ options: n }) => n), Sr))) !t && o.deprecated || (Array.isArray(o.choices) && (t || (o.choices = o.choices.filter((n) => !n.deprecated)), o.name === "parser" && (o.choices = [...o.choices, ...Ko(o.choices, u, e)])), o.pluginDefaults = Object.fromEntries(e.filter((n) => n.defaultOptions?.[o.name] !== void 0).map((n) => [n.name, n.defaultOptions[o.name]])), r.push(o));
	return {
		languages: u,
		options: r
	};
}
function* Ko(e, t, u) {
	let r = new Set(e.map((o) => o.value));
	for (let o of t) if (o.parsers) {
		for (let n of o.parsers) if (!r.has(n)) {
			r.add(n);
			let a = u.find((i) => i.parsers && Object.prototype.hasOwnProperty.call(i.parsers, n)), s = o.name;
			a?.name && (s += ` (plugin: ${a.name})`), yield {
				value: n,
				description: s
			};
		}
	}
}
function Go(e) {
	let t = [];
	for (let [u, r] of Object.entries(e)) {
		let o = {
			name: u,
			...r
		};
		Array.isArray(o.default) && (o.default = b(0, o.default, -1).value), t.push(o);
	}
	return t;
}
var zo = Array.prototype.toReversed ?? function() {
	return [...this].reverse();
}, wr = X("toReversed", function() {
	if (Array.isArray(this)) return zo;
});
function Ho() {
	let e = globalThis, t = e.Deno?.build?.os;
	return typeof t == "string" ? t === "windows" : e.navigator?.platform?.startsWith("Win") ?? e.process?.platform?.startsWith("win") ?? !1;
}
var Xo = Ho();
function Or(e) {
	if (e = e instanceof URL ? e : new URL(e), e.protocol !== "file:") throw new TypeError(`URL must be a file URL: received "${e.protocol}"`);
	return e;
}
function qo(e) {
	return e = Or(e), decodeURIComponent(e.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function Qo(e) {
	e = Or(e);
	let t = decodeURIComponent(e.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
	return e.hostname !== "" && (t = `\\\\${e.hostname}${t}`), t;
}
function ru(e) {
	return Xo ? Qo(e) : qo(e);
}
var Pr = (e) => String(e).split(/[/\\]/u).pop(), Ir = (e) => String(e).startsWith("file:");
function kr(e, t) {
	if (!t) return;
	let u = Pr(t).toLowerCase();
	return e.find(({ filenames: r }) => r?.some((o) => o.toLowerCase() === u)) ?? e.find(({ extensions: r }) => r?.some((o) => u.endsWith(o)));
}
function Zo(e, t) {
	if (t) return e.find(({ name: u }) => u.toLowerCase() === t) ?? e.find(({ aliases: u }) => u?.includes(t)) ?? e.find(({ extensions: u }) => u?.includes(`.${t}`));
}
var ea = void 0;
function vr(e, t) {
	if (t) {
		if (Ir(t)) try {
			t = ru(t);
		} catch {
			return;
		}
		if (typeof t == "string") return e.find(({ isSupported: u }) => u?.({ filepath: t }));
	}
}
function ta(e, t) {
	let u = wr(0, e.plugins).flatMap((o) => o.languages ?? []);
	return (Zo(u, t.language) ?? kr(u, t.physicalFile) ?? kr(u, t.file) ?? vr(u, t.physicalFile) ?? vr(u, t.file) ?? ea?.(u, t.physicalFile))?.parsers[0];
}
var st = ta;
var ie = {
	key: (e) => /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(e) ? e : JSON.stringify(e),
	value(e) {
		if (e === null || typeof e != "object") return JSON.stringify(e);
		if (Array.isArray(e)) return `[${e.map((u) => ie.value(u)).join(", ")}]`;
		let t = Object.keys(e);
		return t.length === 0 ? "{}" : `{ ${t.map((u) => `${ie.key(u)}: ${ie.value(e[u])}`).join(", ")} }`;
	},
	pair: ({ key: e, value: t }) => ie.value({ [e]: t })
};
var nu = new Proxy(String, { get: () => nu }), $ = nu, ou = () => nu;
var Rr = (e, t, { descriptor: u }) => {
	let r = [`${$.yellow(typeof e == "string" ? u.key(e) : u.pair(e))} is deprecated`];
	return t && r.push(`we now treat it as ${$.blue(typeof t == "string" ? u.key(t) : u.pair(t))}`), r.join("; ") + ".";
};
var Dt = Symbol.for("vnopts.VALUE_NOT_EXIST"), Ae = Symbol.for("vnopts.VALUE_UNCHANGED");
var Lr = " ".repeat(2), Yr = (e, t, u) => {
	let { text: r, list: o } = u.normalizeExpectedResult(u.schemas[e].expected(u)), n = [];
	return r && n.push(Mr(e, t, r, u.descriptor)), o && n.push([Mr(e, t, o.title, u.descriptor)].concat(o.values.map((a) => jr(a, u.loggerPrintWidth))).join(`
`)), Ur(n, u.loggerPrintWidth);
};
function Mr(e, t, u, r) {
	return [
		`Invalid ${$.red(r.key(e))} value.`,
		`Expected ${$.blue(u)},`,
		`but received ${t === Dt ? $.gray("nothing") : $.red(r.value(t))}.`
	].join(" ");
}
function jr({ text: e, list: t }, u) {
	let r = [];
	return e && r.push(`- ${$.blue(e)}`), t && r.push([`- ${$.blue(t.title)}:`].concat(t.values.map((o) => jr(o, u - Lr.length).replace(/^|\n/g, `$&${Lr}`))).join(`
`)), Ur(r, u);
}
function Ur(e, t) {
	if (e.length === 1) return e[0];
	let [u, r] = e, [o, n] = e.map((a) => a.split(`
`, 1)[0].length);
	return o > t && o > n ? r : u;
}
var _e = [], au = [];
function ct(e, t, u) {
	if (e === t) return 0;
	let r = u?.maxDistance, o = e;
	e.length > t.length && (e = t, t = o);
	let n = e.length, a = t.length;
	for (; n > 0 && e.charCodeAt(~-n) === t.charCodeAt(~-a);) n--, a--;
	let s = 0;
	for (; s < n && e.charCodeAt(s) === t.charCodeAt(s);) s++;
	if (n -= s, a -= s, r !== void 0 && a - n > r) return r;
	if (n === 0) return r !== void 0 && a > r ? r : a;
	let i, D, f, l, d = 0, c = 0;
	for (; d < n;) au[d] = e.charCodeAt(s + d), _e[d] = ++d;
	for (; c < a;) {
		for (i = t.charCodeAt(s + c), f = c++, D = c, d = 0; d < n; d++) l = i === au[d] ? f : f + 1, f = _e[d], D = _e[d] = f > D ? l > D ? D + 1 : l : l > f ? f + 1 : l;
		if (r !== void 0) {
			let p = D;
			for (d = 0; d < n; d++) _e[d] < p && (p = _e[d]);
			if (p > r) return r;
		}
	}
	return _e.length = n, au.length = n, r !== void 0 && D > r ? r : D;
}
function Wr(e, t, u) {
	if (!Array.isArray(t) || t.length === 0) return;
	let r = u?.maxDistance, o = e.length;
	for (let i of t) if (i === e) return i;
	if (r === 0) return;
	let n, a = Number.POSITIVE_INFINITY, s = /* @__PURE__ */ new Set();
	for (let i of t) {
		if (s.has(i)) continue;
		s.add(i);
		let D = Math.abs(i.length - o);
		if (D >= a || r !== void 0 && D > r) continue;
		let f = Number.isFinite(a) ? r === void 0 ? a : Math.min(a, r) : r, l = f === void 0 ? ct(e, i) : ct(e, i, { maxDistance: f });
		if (r !== void 0 && l > r) continue;
		let d = l;
		if (f !== void 0 && l === f && f === r && (d = ct(e, i)), d < a && (a = d, n = i, a === 0)) break;
	}
	if (!(r !== void 0 && a > r)) return n;
}
var ft = (e, t, { descriptor: u, logger: r, schemas: o }) => {
	let n = [`Ignored unknown option ${$.yellow(u.pair({
		key: e,
		value: t
	}))}.`], a = Wr(e, Object.keys(o), { maxDistance: 3 });
	a && n.push(`Did you mean ${$.blue(u.key(a))}?`), r.warn(n.join(" "));
};
var ua = [
	"default",
	"expected",
	"validate",
	"deprecated",
	"forward",
	"redirect",
	"overlap",
	"preprocess",
	"postprocess"
];
function ra(e, t) {
	let u = new e(t), r = Object.create(u);
	for (let o of ua) o in t && (r[o] = na(t[o], u, S.prototype[o].length));
	return r;
}
var S = class {
	static create(t) {
		return ra(this, t);
	}
	constructor(t) {
		this.name = t.name;
	}
	default(t) {}
	expected(t) {
		return "nothing";
	}
	validate(t, u) {
		return !1;
	}
	deprecated(t, u) {
		return !1;
	}
	forward(t, u) {}
	redirect(t, u) {}
	overlap(t, u, r) {
		return t;
	}
	preprocess(t, u) {
		return t;
	}
	postprocess(t, u) {
		return Ae;
	}
};
function na(e, t, u) {
	return typeof e == "function" ? (...r) => e(...r.slice(0, u - 1), t, ...r.slice(u - 1)) : () => e;
}
var lt = class extends S {
	constructor(t) {
		super(t), this._sourceName = t.sourceName;
	}
	expected(t) {
		return t.schemas[this._sourceName].expected(t);
	}
	validate(t, u) {
		return u.schemas[this._sourceName].validate(t, u);
	}
	redirect(t, u) {
		return this._sourceName;
	}
};
var dt = class extends S {
	expected() {
		return "anything";
	}
	validate() {
		return !0;
	}
};
var pt = class extends S {
	constructor({ valueSchema: t, name: u = t.name, ...r }) {
		super({
			...r,
			name: u
		}), this._valueSchema = t;
	}
	expected(t) {
		let { text: u, list: r } = t.normalizeExpectedResult(this._valueSchema.expected(t));
		return {
			text: u && `an array of ${u}`,
			list: r && {
				title: "an array of the following values",
				values: [{ list: r }]
			}
		};
	}
	validate(t, u) {
		if (!Array.isArray(t)) return !1;
		let r = [];
		for (let o of t) {
			let n = u.normalizeValidateResult(this._valueSchema.validate(o, u), o);
			n !== !0 && r.push(n.value);
		}
		return r.length === 0 ? !0 : { value: r };
	}
	deprecated(t, u) {
		let r = [];
		for (let o of t) {
			let n = u.normalizeDeprecatedResult(this._valueSchema.deprecated(o, u), o);
			n !== !1 && r.push(...n.map(({ value: a }) => ({ value: [a] })));
		}
		return r;
	}
	forward(t, u) {
		let r = [];
		for (let o of t) {
			let n = u.normalizeForwardResult(this._valueSchema.forward(o, u), o);
			r.push(...n.map($r));
		}
		return r;
	}
	redirect(t, u) {
		let r = [], o = [];
		for (let n of t) {
			let a = u.normalizeRedirectResult(this._valueSchema.redirect(n, u), n);
			"remain" in a && r.push(a.remain), o.push(...a.redirect.map($r));
		}
		return r.length === 0 ? { redirect: o } : {
			redirect: o,
			remain: r
		};
	}
	overlap(t, u) {
		return t.concat(u);
	}
};
function $r({ from: e, to: t }) {
	return {
		from: [e],
		to: t
	};
}
var Ft = class extends S {
	expected() {
		return "true or false";
	}
	validate(t) {
		return typeof t == "boolean";
	}
};
function Kr(e, t) {
	let u = Object.create(null);
	for (let r of e) {
		let o = r[t];
		if (u[o]) throw new Error(`Duplicate ${t} ${JSON.stringify(o)}`);
		u[o] = r;
	}
	return u;
}
function Gr(e, t) {
	let u = /* @__PURE__ */ new Map();
	for (let r of e) {
		let o = r[t];
		if (u.has(o)) throw new Error(`Duplicate ${t} ${JSON.stringify(o)}`);
		u.set(o, r);
	}
	return u;
}
function zr() {
	let e = Object.create(null);
	return (t) => {
		let u = JSON.stringify(t);
		return e[u] ? !0 : (e[u] = !0, !1);
	};
}
function Jr(e, t) {
	let u = [], r = [];
	for (let o of e) t(o) ? u.push(o) : r.push(o);
	return [u, r];
}
function Hr(e) {
	return e === Math.floor(e);
}
function Xr(e, t) {
	if (e === t) return 0;
	let u = typeof e, r = typeof t, o = [
		"undefined",
		"object",
		"boolean",
		"number",
		"string"
	];
	return u !== r ? o.indexOf(u) - o.indexOf(r) : u !== "string" ? Number(e) - Number(t) : e.localeCompare(t);
}
function qr(e) {
	return (...t) => {
		let u = e(...t);
		return typeof u == "string" ? new Error(u) : u;
	};
}
function iu(e) {
	return e === void 0 ? {} : e;
}
function su(e) {
	if (typeof e == "string") return { text: e };
	let { text: t, list: u } = e;
	return oa((t || u) !== void 0, "Unexpected `expected` result, there should be at least one field."), u ? {
		text: t,
		list: {
			title: u.title,
			values: u.values.map(su)
		}
	} : { text: t };
}
function Du(e, t) {
	return e === !0 ? !0 : e === !1 ? { value: t } : e;
}
function cu(e, t, u = !1) {
	return e === !1 ? !1 : e === !0 ? u ? !0 : [{ value: t }] : "value" in e ? [e] : e.length === 0 ? !1 : e;
}
function Vr(e, t) {
	return typeof e == "string" || "key" in e ? {
		from: t,
		to: e
	} : "from" in e ? {
		from: e.from,
		to: e.to
	} : {
		from: t,
		to: e.to
	};
}
function mt(e, t) {
	return e === void 0 ? [] : Array.isArray(e) ? e.map((u) => Vr(u, t)) : [Vr(e, t)];
}
function fu(e, t) {
	let u = mt(typeof e == "object" && "redirect" in e ? e.redirect : e, t);
	return u.length === 0 ? {
		remain: t,
		redirect: u
	} : typeof e == "object" && "remain" in e ? {
		remain: e.remain,
		redirect: u
	} : { redirect: u };
}
function oa(e, t) {
	if (!e) throw new Error(t);
}
var Et = class extends S {
	constructor(t) {
		super(t), this._choices = Gr(t.choices.map((u) => u && typeof u == "object" ? u : { value: u }), "value");
	}
	expected({ descriptor: t }) {
		let u = Array.from(this._choices.keys()).map((a) => this._choices.get(a)).filter(({ hidden: a }) => !a).map((a) => a.value).sort(Xr).map(t.value), r = u.slice(0, -2), o = u.slice(-2);
		return {
			text: r.concat(o.join(" or ")).join(", "),
			list: {
				title: "one of the following values",
				values: u
			}
		};
	}
	validate(t) {
		return this._choices.has(t);
	}
	deprecated(t) {
		let u = this._choices.get(t);
		return u && u.deprecated ? { value: t } : !1;
	}
	forward(t) {
		let u = this._choices.get(t);
		return u ? u.forward : void 0;
	}
	redirect(t) {
		let u = this._choices.get(t);
		return u ? u.redirect : void 0;
	}
};
var Ct = class extends S {
	expected() {
		return "a number";
	}
	validate(t, u) {
		return typeof t == "number";
	}
};
var ht = class extends Ct {
	expected() {
		return "an integer";
	}
	validate(t, u) {
		return u.normalizeValidateResult(super.validate(t, u), t) === !0 && Hr(t);
	}
};
var je = class extends S {
	expected() {
		return "a string";
	}
	validate(t) {
		return typeof t == "string";
	}
};
var Qr = ie, Zr = ft, en = Yr, tn = Rr;
var gt = class {
	constructor(t, u) {
		let { logger: r = console, loggerPrintWidth: o = 80, descriptor: n = Qr, unknown: a = Zr, invalid: s = en, deprecated: i = tn, missing: D = () => !1, required: f = () => !1, preprocess: l = (c) => c, postprocess: d = () => Ae } = u || {};
		this._utils = {
			descriptor: n,
			logger: r || { warn: () => {} },
			loggerPrintWidth: o,
			schemas: Kr(t, "name"),
			normalizeDefaultResult: iu,
			normalizeExpectedResult: su,
			normalizeDeprecatedResult: cu,
			normalizeForwardResult: mt,
			normalizeRedirectResult: fu,
			normalizeValidateResult: Du
		}, this._unknownHandler = a, this._invalidHandler = qr(s), this._deprecatedHandler = i, this._identifyMissing = (c, p) => !(c in p) || D(c, p), this._identifyRequired = f, this._preprocess = l, this._postprocess = d, this.cleanHistory();
	}
	cleanHistory() {
		this._hasDeprecationWarned = zr();
	}
	normalize(t) {
		let u = {}, o = [this._preprocess(t, this._utils)], n = () => {
			for (; o.length !== 0;) {
				let a = o.shift(), s = this._applyNormalization(a, u);
				o.push(...s);
			}
		};
		n();
		for (let a of Object.keys(this._utils.schemas)) {
			let s = this._utils.schemas[a];
			if (!(a in u)) {
				let i = iu(s.default(this._utils));
				"value" in i && o.push({ [a]: i.value });
			}
		}
		n();
		for (let a of Object.keys(this._utils.schemas)) {
			if (!(a in u)) continue;
			let s = this._utils.schemas[a], i = u[a], D = s.postprocess(i, this._utils);
			D !== Ae && (this._applyValidation(D, a, s), u[a] = D);
		}
		return this._applyPostprocess(u), this._applyRequiredCheck(u), u;
	}
	_applyNormalization(t, u) {
		let r = [], { knownKeys: o, unknownKeys: n } = this._partitionOptionKeys(t);
		for (let a of o) {
			let s = this._utils.schemas[a], i = s.preprocess(t[a], this._utils);
			this._applyValidation(i, a, s);
			let D = ({ from: c, to: p }) => {
				r.push(typeof p == "string" ? { [p]: c } : { [p.key]: p.value });
			}, f = ({ value: c, redirectTo: p }) => {
				let F = cu(s.deprecated(c, this._utils), i, !0);
				if (F !== !1) if (F === !0) this._hasDeprecationWarned(a) || this._utils.logger.warn(this._deprecatedHandler(a, p, this._utils));
				else for (let { value: C } of F) {
					let y = {
						key: a,
						value: C
					};
					if (!this._hasDeprecationWarned(y)) {
						let m = typeof p == "string" ? {
							key: p,
							value: C
						} : p;
						this._utils.logger.warn(this._deprecatedHandler(y, m, this._utils));
					}
				}
			};
			mt(s.forward(i, this._utils), i).forEach(D);
			let d = fu(s.redirect(i, this._utils), i);
			if (d.redirect.forEach(D), "remain" in d) {
				let c = d.remain;
				u[a] = a in u ? s.overlap(u[a], c, this._utils) : c, f({ value: c });
			}
			for (let { from: c, to: p } of d.redirect) f({
				value: c,
				redirectTo: p
			});
		}
		for (let a of n) {
			let s = t[a];
			this._applyUnknownHandler(a, s, u, (i, D) => {
				r.push({ [i]: D });
			});
		}
		return r;
	}
	_applyRequiredCheck(t) {
		for (let u of Object.keys(this._utils.schemas)) if (this._identifyMissing(u, t) && this._identifyRequired(u)) throw this._invalidHandler(u, Dt, this._utils);
	}
	_partitionOptionKeys(t) {
		let [u, r] = Jr(Object.keys(t).filter((o) => !this._identifyMissing(o, t)), (o) => o in this._utils.schemas);
		return {
			knownKeys: u,
			unknownKeys: r
		};
	}
	_applyValidation(t, u, r) {
		let o = Du(r.validate(t, this._utils), t);
		if (o !== !0) throw this._invalidHandler(u, o.value, this._utils);
	}
	_applyUnknownHandler(t, u, r, o) {
		let n = this._unknownHandler(t, u, this._utils);
		if (n) for (let a of Object.keys(n)) {
			if (this._identifyMissing(a, n)) continue;
			let s = n[a];
			a in this._utils.schemas ? o(a, s) : r[a] = s;
		}
	}
	_applyPostprocess(t) {
		let u = this._postprocess(t, this._utils);
		if (u !== Ae) {
			if (u.delete) for (let r of u.delete) delete t[r];
			if (u.override) {
				let { knownKeys: r, unknownKeys: o } = this._partitionOptionKeys(u.override);
				for (let n of r) {
					let a = u.override[n];
					this._applyValidation(a, n, this._utils.schemas[n]), t[n] = a;
				}
				for (let n of o) {
					let a = u.override[n];
					this._applyUnknownHandler(n, a, t, (s, i) => {
						let D = this._utils.schemas[s];
						this._applyValidation(i, s, D), t[s] = i;
					});
				}
			}
		}
	}
};
var lu;
function ia(e, t, { logger: u = !1, isCLI: r = !1, passThrough: o = !1, FlagSchema: n, descriptor: a } = {}) {
	if (r) {
		if (!n) throw new Error("'FlagSchema' option is required.");
		if (!a) throw new Error("'descriptor' option is required.");
	} else a = ie;
	let s = o ? Array.isArray(o) ? (d, c) => o.includes(d) ? { [d]: c } : void 0 : (d, c) => ({ [d]: c }) : (d, c, p) => {
		let { _: F, ...C } = p.schemas;
		return ft(d, c, {
			...p,
			schemas: C
		});
	}, D = new gt(sa(t, {
		isCLI: r,
		FlagSchema: n
	}), {
		logger: u,
		unknown: s,
		descriptor: a
	}), f = u !== !1;
	f && lu && (D._hasDeprecationWarned = lu);
	let l = D.normalize(e);
	return f && (lu = D._hasDeprecationWarned), l;
}
function sa(e, { isCLI: t, FlagSchema: u }) {
	let r = [];
	t && r.push(dt.create({ name: "_" }));
	for (let o of e) r.push(Da(o, {
		isCLI: t,
		optionInfos: e,
		FlagSchema: u
	})), o.alias && t && r.push(lt.create({
		name: o.alias,
		sourceName: o.name
	}));
	return r;
}
function Da(e, { isCLI: t, optionInfos: u, FlagSchema: r }) {
	let { name: o } = e, n = { name: o }, a, s = {};
	switch (e.type) {
		case "int":
			a = ht, t && (n.preprocess = Number);
			break;
		case "string":
			a = je;
			break;
		case "choice":
			a = Et, n.choices = e.choices.map((i) => i?.redirect ? {
				...i,
				redirect: { to: {
					key: e.name,
					value: i.redirect
				} }
			} : i);
			break;
		case "boolean":
			a = Ft;
			break;
		case "flag":
			a = r, n.flags = u.flatMap((i) => [
				i.alias,
				i.description && i.name,
				i.oppositeDescription && `no-${i.name}`
			].filter(Boolean));
			break;
		case "path":
			a = je;
			break;
		default: throw new Error(`Unexpected type ${e.type}`);
	}
	if (e.exception ? n.validate = (i, D, f) => e.exception(i) || D.validate(i, f) : n.validate = (i, D, f) => i === void 0 || D.validate(i, f), e.redirect && (s.redirect = (i) => i ? { to: typeof e.redirect == "string" ? e.redirect : {
		key: e.redirect.option,
		value: e.redirect.value
	} } : void 0), e.deprecated && (s.deprecated = !0), t && !e.array) {
		let i = n.preprocess || ((D) => D);
		n.preprocess = (D, f, l) => f.preprocess(i(Array.isArray(D) ? b(0, D, -1) : D), l);
	}
	return e.array ? pt.create({
		...t ? { preprocess: (i) => Array.isArray(i) ? i : [i] } : {},
		...s,
		valueSchema: a.create(n)
	}) : a.create({
		...n,
		...s
	});
}
var un = ia;
var ca = Array.prototype.findLast ?? function(e) {
	for (let t = this.length - 1; t >= 0; t--) {
		let u = this[t];
		if (e(u, t, this)) return u;
	}
}, du = X("findLast", function() {
	if (Array.isArray(this)) return ca;
});
var rn = Symbol.for("PRETTIER_IS_FRONT_MATTER"), pu = [];
function la(e) {
	return !!e?.[rn];
}
var de = la;
var nn = new Set(["yaml", "toml"]), Ue = ({ node: e }) => de(e) && nn.has(e.language);
async function Fu(e, t, u, r) {
	let { node: o } = u, { language: n } = o;
	if (!nn.has(n)) return;
	let a = o.value.trim(), s;
	if (a) {
		let i = n === "yaml" ? n : st(r, { language: n });
		if (!i) return;
		s = a ? await e(a, { parser: i }) : "";
	} else s = a;
	return et([
		o.startDelimiter,
		o.explicitLanguage ?? "",
		V$1,
		s,
		s ? V$1 : "",
		o.endDelimiter
	]);
}
function da(e, t) {
	return Ue({ node: e }) && (delete t.end, delete t.raw, delete t.value), t;
}
var mu = da;
function pa({ node: e }) {
	return e.raw;
}
var Eu = pa;
var on = new Set([
	"tokens",
	"comments",
	"parent",
	"enclosingNode",
	"precedingNode",
	"followingNode"
]), Fa = (e) => Object.keys(e).filter((t) => !on.has(t));
function ma(e, t) {
	let u = e ? (r) => e(r, on) : Fa;
	return t ? new Proxy(u, { apply: (r, o, n) => de(n[0]) ? pu : Reflect.apply(r, o, n) }) : u;
}
var Cu = ma;
function gu(e, t) {
	if (!t) throw new Error("parserName is required.");
	let u = du(0, e, (o) => o.parsers && Object.prototype.hasOwnProperty.call(o.parsers, t));
	if (u) return u;
	let r = `Couldn't resolve parser "${t}".`;
	throw r += " Plugins must be explicitly added to the standalone bundle.", new Me(r);
}
function an(e, t) {
	if (!t) throw new Error("astFormat is required.");
	let u = du(0, e, (o) => o.printers && Object.prototype.hasOwnProperty.call(o.printers, t));
	if (u) return u;
	let r = `Couldn't find plugin for AST format "${t}".`;
	throw r += " Plugins must be explicitly added to the standalone bundle.", new Me(r);
}
function We({ plugins: e, parser: t }) {
	return yu(gu(e, t), t);
}
function yu(e, t) {
	let u = e.parsers[t];
	return typeof u == "function" ? u() : u;
}
async function sn(e, t) {
	let u = e.printers[t];
	return Ea(typeof u == "function" ? await u() : u);
}
var hu = /* @__PURE__ */ new WeakMap();
function Ea(e) {
	if (hu.has(e)) return hu.get(e);
	let { features: t, getVisitorKeys: u, embed: r, massageAstNode: o, print: n, ...a } = e;
	t = ya(t);
	let s = t.experimental_frontMatterSupport;
	u = Cu(u, s.massageAstNode || s.embed || s.print);
	let i = o;
	o && s.massageAstNode && (i = new Proxy(o, { apply(d, c, p) {
		return mu(...p), Reflect.apply(d, c, p);
	} }));
	let D = r;
	if (r) {
		let d;
		D = new Proxy(r, {
			get(c, p, F) {
				return p === "getVisitorKeys" ? (d ?? (d = r.getVisitorKeys ? Cu(r.getVisitorKeys, s.massageAstNode || s.embed) : u), d) : Reflect.get(c, p, F);
			},
			apply: (c, p, F) => s.embed && Ue(...F) ? Fu : Reflect.apply(c, p, F)
		});
	}
	let f = n;
	s.print && (f = new Proxy(n, { apply(d, c, p) {
		let [F] = p;
		return de(F.node) ? Eu(F) : Reflect.apply(d, c, p);
	} }));
	let l = {
		features: t,
		getVisitorKeys: u,
		embed: D,
		massageAstNode: i,
		print: f,
		...a
	};
	return hu.set(e, l), l;
}
var ha = Object.fromEntries([
	"clean",
	"embed",
	"print"
].map((e) => [e, !1]));
function ga(e) {
	return {
		...ha,
		...e
	};
}
function ya(e) {
	return {
		experimental_avoidAstMutation: !1,
		...e,
		experimental_frontMatterSupport: ga(e?.experimental_frontMatterSupport)
	};
}
var Dn = {
	astFormat: "estree",
	printer: {},
	originalText: void 0,
	locStart: null,
	locEnd: null,
	getVisitorKeys: null
};
async function ba(e, t = {}) {
	let u = { ...e };
	if (!u.parser) if (u.filepath) {
		if (u.parser = st(u, { physicalFile: u.filepath }), !u.parser) throw new Ye(`No parser could be inferred for file "${u.filepath}".`);
	} else throw new Ye("No parser and no file path given, couldn't infer a parser.");
	let r = it({
		plugins: e.plugins,
		showDeprecated: !0
	}).options, o = {
		...Dn,
		...Object.fromEntries(r.filter((l) => l.default !== void 0).map((l) => [l.name, l.default]))
	}, n = gu(u.plugins, u.parser), a = await yu(n, u.parser);
	u.astFormat = a.astFormat, u.locEnd = a.locEnd, u.locStart = a.locStart;
	let s = n.printers?.[a.astFormat] ? n : an(u.plugins, a.astFormat), i = await sn(s, a.astFormat);
	u.printer = i, u.getVisitorKeys = i.getVisitorKeys;
	let D = s.defaultOptions ? Object.fromEntries(Object.entries(s.defaultOptions).filter(([, l]) => l !== void 0)) : {}, f = {
		...o,
		...D
	};
	for (let [l, d] of Object.entries(f)) (u[l] === null || u[l] === void 0) && (u[l] = d);
	return u.parser === "json" && (u.trailingComma = "none"), un(u, r, {
		passThrough: Object.keys(Dn),
		...t
	});
}
var se = ba;
ao(dn(), 1);
var Au = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-࢏ࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚ౜ౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ೜-ೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-Ƛ꟱-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ", pn = "·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࢗ-࢟࣊-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄ఼ా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ೳഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-໎໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜕ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠏-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿ-᫝᫠-᫫ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷿‌‍‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯・꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿･";
new RegExp("[" + Au + "]");
new RegExp("[" + Au + pn + "]");
Au = pn = null;
var _u = {
	keyword: [
		"break",
		"case",
		"catch",
		"continue",
		"debugger",
		"default",
		"do",
		"else",
		"finally",
		"for",
		"function",
		"if",
		"return",
		"switch",
		"throw",
		"try",
		"var",
		"const",
		"while",
		"with",
		"new",
		"this",
		"super",
		"class",
		"extends",
		"export",
		"import",
		"null",
		"true",
		"false",
		"in",
		"instanceof",
		"typeof",
		"void",
		"delete"
	],
	strict: [
		"implements",
		"interface",
		"let",
		"package",
		"private",
		"protected",
		"public",
		"static",
		"yield"
	],
	strictBind: ["eval", "arguments"]
};
new Set(_u.keyword);
new Set(_u.strict);
new Set(_u.strictBind);
var It = (e, t) => (u) => e(t(u));
function mn(e) {
	return {
		keyword: e.cyan,
		capitalized: e.yellow,
		jsxIdentifier: e.yellow,
		punctuator: e.yellow,
		number: e.magenta,
		string: e.green,
		regex: e.magenta,
		comment: e.gray,
		invalid: It(It(e.white, e.bgRed), e.bold),
		gutter: e.gray,
		marker: It(e.red, e.bold),
		message: It(e.red, e.bold),
		reset: e.reset
	};
}
mn(ou(!0));
mn(ou(!1));
function _a$1() {
	return new Proxy({}, { get: () => (e) => e });
}
var Fn = /\r\n|[\n\r\u2028\u2029]/;
function xa(e, t, u) {
	let r = Object.assign({
		column: 0,
		line: -1
	}, e.start), o = Object.assign({}, r, e.end), { linesAbove: n = 2, linesBelow: a = 3 } = u || {}, s = r.line, i = r.column, D = o.line, f = o.column, l = Math.max(s - (n + 1), 0), d = Math.min(t.length, D + a);
	s === -1 && (l = 0), D === -1 && (d = t.length);
	let c = D - s, p = {};
	if (c) for (let F = 0; F <= c; F++) {
		let C = F + s;
		if (!i) p[C] = !0;
		else if (F === 0) p[C] = [i, t[C - 1].length - i + 1];
		else if (F === c) p[C] = [0, f];
		else p[C] = [0, t[C - F].length];
	}
	else i === f ? i ? p[s] = [i, 0] : p[s] = !0 : p[s] = [i, f - i];
	return {
		start: l,
		end: d,
		markerLines: p
	};
}
function En(e, t, u = {}) {
	let o = _a$1(!1), { start: a, end: s, markerLines: i } = xa(t, e.split(Fn), u), D = t.start && typeof t.start.column == "number", f = String(s).length, d = e.split(Fn, s).slice(a, s).map((c, p) => {
		let F = a + 1 + p, y = ` ${` ${F}`.slice(-f)} |`, m = i[F], h = !i[F + 1];
		if (m) {
			let E = "";
			if (Array.isArray(m)) {
				let g = c.slice(0, Math.max(m[0] - 1, 0)).replace(/[^\t]/g, " "), A = m[1] || 1;
				E = [
					`
 `,
					o.gutter(y.replace(/\d/g, " ")),
					" ",
					g,
					o.marker("^").repeat(A)
				].join(""), h && u.message && (E += " " + o.message(u.message));
			}
			return [
				o.marker(">"),
				o.gutter(y),
				c.length > 0 ? ` ${c}` : "",
				E
			].join("");
		} else return ` ${o.gutter(y)}${c.length > 0 ? ` ${c}` : ""}`;
	}).join(`
`);
	return u.message && !D && (d = `${" ".repeat(f + 1)}${u.message}
${d}`), d;
}
async function Ba(e, t) {
	let u = await We(t), r = u.preprocess ? await u.preprocess(e, t) : e;
	t.originalText = r;
	let o;
	try {
		o = await u.parse(r, t, t);
	} catch (n) {
		Ta(n, e);
	}
	return {
		text: r,
		ast: o
	};
}
function Ta(e, t) {
	let { loc: u } = e;
	if (u) {
		let r = En(t, u, { highlightCode: !0 });
		throw e.message += `
` + r, e.codeFrame = r, e;
	}
	throw e;
}
var Fe = Ba;
async function Cn(e, t, u, r, o) {
	if (u.embeddedLanguageFormatting !== "auto") return;
	let { printer: n } = u, { embed: a } = n;
	if (!a) return;
	if (a.length > 2) throw new Error("printer.embed has too many parameters. The API changed in Prettier v3. Please update your plugin. See https://prettier.io/docs/plugins#optional-embed");
	let { hasPrettierIgnore: s } = n, { getVisitorKeys: i } = a, D = [];
	d();
	let f = e.stack;
	for (let { print: c, node: p, pathStack: F } of D) try {
		e.stack = F;
		let C = await c(l, t, e, u);
		C && o.set(p, C);
	} catch (C) {
		if (globalThis.PRETTIER_DEBUG) throw C;
	}
	e.stack = f;
	function l(c, p) {
		return Na(c, p, u, r);
	}
	function d() {
		let { node: c } = e;
		if (c === null || typeof c != "object" || s?.(e)) return;
		for (let F of i(c)) Array.isArray(c[F]) ? e.each(d, F) : e.call(d, F);
		let p = a(e, u);
		if (p) {
			if (typeof p == "function") {
				D.push({
					print: p,
					node: c,
					pathStack: [...e.stack]
				});
				return;
			}
			o.set(c, p);
		}
	}
}
async function Na(e, t, u, r) {
	let o = await se({
		...u,
		...t,
		parentParser: u.parser,
		originalText: e,
		cursorOffset: void 0,
		rangeStart: void 0,
		rangeEnd: void 0
	}, { passThrough: !0 }), { ast: n } = await Fe(e, o);
	return qe(await r(n, o));
}
function Sa(e, t, u, r) {
	let { originalText: o, [Symbol.for("comments")]: n, locStart: a, locEnd: s, [Symbol.for("printedComments")]: i } = t, { node: D } = e, f = a(D), l = s(D);
	for (let c of n) a(c) >= f && s(c) <= l && i.add(c);
	let { printPrettierIgnored: d } = t.printer;
	return d ? d(e, t, u, r) : o.slice(f, l);
}
var hn = Sa;
async function Ge(e, t) {
	({ast: e} = await xu(e, t));
	let u = /* @__PURE__ */ new Map(), r = new pr(e), o = Nr(t), n = /* @__PURE__ */ new Map();
	await Cn(r, s, t, Ge, n);
	let a = await gn(r, t, s, void 0, n);
	if (Tr(t), t.cursorOffset >= 0) {
		if (t.nodeAfterCursor && !t.nodeBeforeCursor) return [ee, a];
		if (t.nodeBeforeCursor && !t.nodeAfterCursor) return [a, ee];
	}
	return a;
	function s(D, f) {
		return D === void 0 || D === r ? i(f) : Array.isArray(D) ? r.call(() => i(f), ...D) : r.call(() => i(f), D);
	}
	function i(D) {
		o(r);
		let f = r.node;
		if (f == null) return "";
		let l = ge(f) && D === void 0;
		if (l && u.has(f)) return u.get(f);
		let d = gn(r, t, s, D, n);
		return l && u.set(f, d), d;
	}
}
function gn(e, t, u, r, o) {
	let { node: n } = e, { printer: a } = t, s;
	switch (a.hasPrettierIgnore?.(e) ? s = hn(e, t, u, r) : o.has(n) ? s = o.get(n) : s = a.print(e, t, u, r), n) {
		case t.cursorNode:
			s = Ee(s, (i) => [
				ee,
				i,
				ee
			]);
			break;
		case t.nodeBeforeCursor:
			s = Ee(s, (i) => [i, ee]);
			break;
		case t.nodeAfterCursor:
			s = Ee(s, (i) => [ee, i]);
			break;
	}
	return a.printComment && !a.willPrintOwnComments?.(e, t) && (s = Br(e, s, t)), s;
}
async function xu(e, t) {
	let u = e.comments ?? [];
	t[Symbol.for("comments")] = u, t[Symbol.for("printedComments")] = /* @__PURE__ */ new Set(), Ar(e, t);
	let { printer: { preprocess: r } } = t;
	return e = r ? await r(e, t) : e, {
		ast: e,
		comments: u
	};
}
function wa(e, t) {
	let { cursorOffset: u, locStart: r, locEnd: o, getVisitorKeys: n } = t, a = (c) => r(c) <= u && o(c) >= u, s = e, i = [e];
	for (let c of Cr(e, {
		getVisitorKeys: n,
		filter: a
	})) i.push(c), s = c;
	if (hr(s, { getVisitorKeys: n })) return { cursorNode: s };
	let D, f, l = -1, d = Number.POSITIVE_INFINITY;
	for (; i.length > 0 && (D === void 0 || f === void 0);) {
		s = i.pop();
		let c = D !== void 0, p = f !== void 0;
		for (let F of be(s, { getVisitorKeys: n })) {
			if (!c) {
				let C = o(F);
				C <= u && C > l && (D = F, l = C);
			}
			if (!p) {
				let C = r(F);
				C >= u && C < d && (f = F, d = C);
			}
		}
	}
	return {
		nodeBeforeCursor: D,
		nodeAfterCursor: f
	};
}
var Bu = wa;
function Oa(e, t) {
	let { printer: u } = t, r = u.massageAstNode;
	if (!r) return e;
	let { getVisitorKeys: o } = u, { ignoredProperties: n } = r;
	return a(e);
	function a(s, i) {
		if (!ge(s)) return s;
		if (Array.isArray(s)) return s.map((d) => a(d, i)).filter(Boolean);
		let D = {}, f = new Set(o(s));
		for (let d in s) !Object.prototype.hasOwnProperty.call(s, d) || n?.has(d) || (f.has(d) ? D[d] = a(s[d], s) : D[d] = s[d]);
		let l = r(s, D, i);
		if (l !== null) return l ?? D;
	}
}
var yn = Oa;
var Pa = Array.prototype.findLastIndex ?? function(e) {
	for (let t = this.length - 1; t >= 0; t--) {
		let u = this[t];
		if (e(u, t, this)) return t;
	}
	return -1;
}, bn = X("findLastIndex", function() {
	if (Array.isArray(this)) return Pa;
});
var ka = ({ parser: e }) => e === "json" || e === "json5" || e === "jsonc" || e === "json-stringify";
function va(e, t) {
	return t = new Set(t), e.find((u) => xn.has(u.type) && t.has(u));
}
function An(e) {
	let t = bn(0, e, (u) => u.type !== "Program" && u.type !== "File");
	return t === -1 ? e : e.slice(0, t + 1);
}
function Ra(e, t, { locStart: u, locEnd: r }) {
	let [o, ...n] = e, [a, ...s] = t;
	if (o === a) return [o, a];
	let i = u(o);
	for (let f of An(s)) if (u(f) >= i) a = f;
	else break;
	let D = r(a);
	for (let f of An(n)) {
		if (r(f) <= D) o = f;
		else break;
		if (o === a) break;
	}
	return [o, a];
}
function Tu(e, t, u, r, o = [], n) {
	let { locStart: a, locEnd: s } = u, i = a(e), D = s(e);
	if (t > D || t < i || n === "rangeEnd" && t === i || n === "rangeStart" && t === D) return;
	let f = [e, ...o], l = at(e, f, {
		cache: uu,
		locStart: a,
		locEnd: s,
		getVisitorKeys: u.getVisitorKeys,
		filter: u.printer.canAttachComment,
		getChildren: u.printer.getCommentChildNodes
	});
	for (let d of l) {
		let c = Tu(d, t, u, r, f, n);
		if (c) return c;
	}
	if (r(e, o[0])) return f;
}
function La(e, t) {
	return t !== "DeclareExportDeclaration" && e !== "TypeParameterDeclaration" && (e === "Directive" || e === "TypeAlias" || e === "TSExportAssignment" || e.startsWith("Declare") || e.startsWith("TSDeclare") || e.endsWith("Statement") || e.endsWith("Declaration"));
}
var xn = new Set([
	"JsonRoot",
	"ObjectExpression",
	"ArrayExpression",
	"StringLiteral",
	"NumericLiteral",
	"BooleanLiteral",
	"NullLiteral",
	"UnaryExpression",
	"TemplateLiteral"
]), Ma = new Set([
	"OperationDefinition",
	"FragmentDefinition",
	"VariableDefinition",
	"TypeExtensionDefinition",
	"ObjectTypeDefinition",
	"FieldDefinition",
	"DirectiveDefinition",
	"EnumTypeDefinition",
	"EnumValueDefinition",
	"InputValueDefinition",
	"InputObjectTypeDefinition",
	"SchemaDefinition",
	"OperationTypeDefinition",
	"InterfaceTypeDefinition",
	"UnionTypeDefinition",
	"ScalarTypeDefinition"
]);
function _n(e, t, u) {
	if (!t) return !1;
	switch (e.parser) {
		case "flow":
		case "hermes":
		case "babel":
		case "babel-flow":
		case "babel-ts":
		case "typescript":
		case "acorn":
		case "espree":
		case "meriyah":
		case "oxc":
		case "oxc-ts":
		case "__babel_estree": return La(t.type, u?.type);
		case "json":
		case "json5":
		case "jsonc":
		case "json-stringify": return xn.has(t.type);
		case "graphql": return Ma.has(t.kind);
		case "vue": return t.tag !== "root";
	}
	return !1;
}
function Bn(e, t, u) {
	let { rangeStart: r, rangeEnd: o, locStart: n, locEnd: a } = t;
	P(o > r);
	let s = e.slice(r, o).search(/\S/u), i = s === -1;
	if (!i) for (r += s; o > r && !/\S/u.test(e[o - 1]); --o);
	let D = Tu(u, r, t, (c, p) => _n(t, c, p), [], "rangeStart");
	if (!D) return;
	let f = i ? D : Tu(u, o, t, (c) => _n(t, c), [], "rangeEnd");
	if (!f) return;
	let l, d;
	if (ka(t)) {
		let c = va(D, f);
		l = c, d = c;
	} else [l, d] = Ra(D, f, t);
	return [Math.min(n(l), n(d)), Math.max(a(l), a(d))];
}
var wn = "﻿", Tn = Symbol("cursor");
async function On(e, t, u = 0) {
	if (!e || e.trim().length === 0) return {
		formatted: "",
		cursorOffset: -1,
		comments: []
	};
	let { ast: r, text: o } = await Fe(e, t);
	t.cursorOffset >= 0 && (t = {
		...t,
		...Bu(r, t)
	});
	let n = await Ge(r, t, u);
	u > 0 && (n = tt([V$1, n], u, t.tabWidth));
	let a = Ce(n, t);
	if (u > 0) {
		let i = a.formatted.trim();
		a.cursorNodeStart !== void 0 && (a.cursorNodeStart -= a.formatted.indexOf(i), a.cursorNodeStart < 0 && (a.cursorNodeStart = 0, a.cursorNodeText = a.cursorNodeText.trimStart()), a.cursorNodeStart + a.cursorNodeText.length > i.length && (a.cursorNodeText = a.cursorNodeText.trimEnd())), a.formatted = i + Se(t.endOfLine);
	}
	let s = t[Symbol.for("comments")];
	if (t.cursorOffset >= 0) {
		let i, D, f, l;
		if ((t.cursorNode || t.nodeBeforeCursor || t.nodeAfterCursor) && a.cursorNodeText) if (f = a.cursorNodeStart, l = a.cursorNodeText, t.cursorNode) i = t.locStart(t.cursorNode), D = o.slice(i, t.locEnd(t.cursorNode));
		else {
			if (!t.nodeBeforeCursor && !t.nodeAfterCursor) throw new Error("Cursor location must contain at least one of cursorNode, nodeBeforeCursor, nodeAfterCursor");
			i = t.nodeBeforeCursor ? t.locEnd(t.nodeBeforeCursor) : 0;
			let y = t.nodeAfterCursor ? t.locStart(t.nodeAfterCursor) : o.length;
			D = o.slice(i, y);
		}
		else i = 0, D = o, f = 0, l = a.formatted;
		let d = t.cursorOffset - i;
		if (D === l) return {
			formatted: a.formatted,
			cursorOffset: f + d,
			comments: s
		};
		let c = D.split("");
		c.splice(d, 0, Tn);
		let F = Ut(c, l.split("")), C = f;
		for (let y of F) if (y.removed) {
			if (y.value.includes(Tn)) break;
		} else C += y.count;
		return {
			formatted: a.formatted,
			cursorOffset: C,
			comments: s
		};
	}
	return {
		formatted: a.formatted,
		cursorOffset: -1,
		comments: s
	};
}
async function Ya(e, t) {
	let { ast: u, text: r } = await Fe(e, t), [o, n] = Bn(r, t, u) ?? [0, 0], a = r.slice(o, n), s = Math.min(o, r.lastIndexOf(`
`, o) + 1), i = r.slice(s, o).match(/^\s*/u)[0], D = he(i, t.tabWidth), f = await On(a, {
		...t,
		rangeStart: 0,
		rangeEnd: Number.POSITIVE_INFINITY,
		cursorOffset: t.cursorOffset > o && t.cursorOffset <= n ? t.cursorOffset - o : -1,
		endOfLine: "lf"
	}, D), l = f.formatted.trimEnd(), { cursorOffset: d } = t;
	d > n ? d += l.length - a.length : f.cursorOffset >= 0 && (d = f.cursorOffset + o);
	let c = r.slice(0, o) + l + r.slice(n);
	if (t.endOfLine !== "lf") {
		let p = Se(t.endOfLine);
		d >= 0 && p === `\r
` && (d += $t(c.slice(0, d), `
`)), c = oe(0, c, `
`, p);
	}
	return {
		formatted: c,
		cursorOffset: d,
		comments: f.comments
	};
}
function Nu(e, t, u) {
	return typeof t != "number" || Number.isNaN(t) || t < 0 || t > e.length ? u : t;
}
function Nn(e, t) {
	let { cursorOffset: u, rangeStart: r, rangeEnd: o } = t;
	return u = Nu(e, u, -1), r = Nu(e, r, 0), o = Nu(e, o, e.length), {
		...t,
		cursorOffset: u,
		rangeStart: r,
		rangeEnd: o
	};
}
function Pn(e, t) {
	let { cursorOffset: u, rangeStart: r, rangeEnd: o, endOfLine: n } = Nn(e, t), a = e.charAt(0) === wn;
	if (a && (e = e.slice(1), u--, r--, o--), n === "auto" && (n = Yu(e)), e.includes("\r")) {
		let s = (i) => $t(e.slice(0, Math.max(i, 0)), `\r
`);
		u -= s(u), r -= s(r), o -= s(o), e = ju(e);
	}
	return {
		hasBOM: a,
		text: e,
		options: Nn(e, {
			...t,
			cursorOffset: u,
			rangeStart: r,
			rangeEnd: o,
			endOfLine: n
		})
	};
}
async function Sn(e, t) {
	let u = await We(t);
	return !u.hasPragma || u.hasPragma(e);
}
async function ja(e, t) {
	return (await We(t)).hasIgnorePragma?.(e);
}
async function Su(e, t) {
	let { hasBOM: u, text: r, options: o } = Pn(e, await se(t));
	if (o.rangeStart >= o.rangeEnd && r !== "" || o.requirePragma && !await Sn(r, o) || o.checkIgnorePragma && await ja(r, o)) return {
		formatted: e,
		cursorOffset: t.cursorOffset,
		comments: []
	};
	let n;
	return o.rangeStart > 0 || o.rangeEnd < r.length ? n = await Ya(r, o) : (!o.requirePragma && o.insertPragma && o.printer.insertPragma && !await Sn(r, o) && (r = o.printer.insertPragma(r)), n = await On(r, o)), u && (n.formatted = wn + n.formatted, n.cursorOffset >= 0 && n.cursorOffset++), n;
}
async function In(e, t, u) {
	let { text: r, options: o } = Pn(e, await se(t)), n = await Fe(r, o);
	return u && (u.preprocessForPrint && (n.ast = await xu(n.ast, o)), u.massage && (n.ast = yn(n.ast, o))), n;
}
async function kn(e, t) {
	t = await se(t);
	return Ce(await Ge(e, t), t);
}
async function vn(e, t) {
	let { formatted: r } = await Su(sr(e), {
		...t,
		parser: "__js_expression"
	});
	return r;
}
async function Rn(e, t) {
	t = await se(t);
	let { ast: u } = await Fe(e, t);
	return t.cursorOffset >= 0 && (t = {
		...t,
		...Bu(u, t)
	}), Ge(u, t);
}
async function Ln(e, t) {
	return Ce(e, await se(t));
}
var wu = {};
Yt(wu, {
	builders: () => Wa,
	printer: () => $a,
	utils: () => Va
});
var Wa = {
	join: Ie,
	line: ut,
	softline: or,
	hardline: V$1,
	literalline: Qe,
	group: Kt,
	conditionalGroup: tr,
	fill: er,
	lineSuffix: ve,
	lineSuffixBoundary: ar,
	cursor: ee,
	breakParent: ce,
	ifBreak: ur,
	trim: ir,
	indent: ae,
	indentIfBreak: rr,
	align: De,
	addAlignmentToDoc: tt,
	markAsRoot: et,
	dedentToRoot: Qu,
	dedent: Zu,
	hardlineWithoutBreakParent: ke,
	literallineWithoutBreakParent: Gt,
	label: nr,
	concat: (e) => e
}, $a = { printDocToString: Ce }, Va = {
	willBreak: Ku,
	traverseDoc: we,
	findInDoc: Xe,
	mapDoc: Pe,
	removeLines: zu,
	stripTrailingHardline: qe,
	replaceEndOfLine: Ju,
	canBreak: Hu
};
var Mn = "3.8.3";
var Pu = {};
Yt(Pu, {
	addDanglingComment: () => ue,
	addLeadingComment: () => fe,
	addTrailingComment: () => le,
	getAlignmentSize: () => he,
	getIndentSize: () => Yn,
	getMaxContinuousCount: () => jn,
	getNextNonSpaceNonCommentCharacter: () => Un,
	getNextNonSpaceNonCommentCharacterIndex: () => ni,
	getPreferredQuote: () => Vn,
	getStringWidth: () => Re,
	hasNewline: () => z,
	hasNewlineInRange: () => Kn,
	hasSpaces: () => Gn,
	isNextLineEmpty: () => Di,
	isNextLineEmptyAfterIndex: () => kt,
	isPreviousLineEmpty: () => ai,
	makeString: () => si,
	skip: () => ye,
	skipEverythingButNewLine: () => ot,
	skipInlineComment: () => xe,
	skipNewline: () => K,
	skipSpaces: () => Y,
	skipToLineEnd: () => nt,
	skipTrailingComment: () => Be,
	skipWhitespace: () => Fr
});
function Ka(e, t) {
	if (t === !1) return !1;
	if (e.charAt(t) === "/" && e.charAt(t + 1) === "*") {
		for (let u = t + 2; u < e.length; ++u) if (e.charAt(u) === "*" && e.charAt(u + 1) === "/") return u + 2;
	}
	return t;
}
var xe = Ka;
function Ga(e, t) {
	return t === !1 ? !1 : e.charAt(t) === "/" && e.charAt(t + 1) === "/" ? ot(e, t) : t;
}
var Be = Ga;
function za(e, t) {
	let u = null, r = t;
	for (; r !== u;) u = r, r = Y(e, r), r = xe(e, r), r = Be(e, r), r = K(e, r);
	return r;
}
var ze = za;
function Ja(e, t) {
	let u = null, r = t;
	for (; r !== u;) u = r, r = nt(e, r), r = xe(e, r), r = Y(e, r);
	return r = Be(e, r), r = K(e, r), r !== !1 && z(e, r);
}
var kt = Ja;
function Ha(e, t) {
	let u = e.lastIndexOf(`
`);
	return u === -1 ? 0 : he(e.slice(u + 1).match(/^[\t ]*/u)[0], t);
}
var Yn = Ha;
function Ou(e) {
	if (typeof e != "string") throw new TypeError("Expected a string");
	return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Xa(e, t) {
	let u = e.matchAll(new RegExp(`(?:${Ou(t)})+`, "gu"));
	return u.reduce || (u = [...u]), u.reduce((r, [o]) => Math.max(r, o.length), 0) / t.length;
}
var jn = Xa;
function qa(e, t) {
	let u = ze(e, t);
	return u === !1 ? "" : e.charAt(u);
}
var Un = qa;
var Wn = Object.freeze({
	character: "'",
	codePoint: 39
}), $n = Object.freeze({
	character: "\"",
	codePoint: 34
}), Qa = Object.freeze({
	preferred: Wn,
	alternate: $n
}), Za = Object.freeze({
	preferred: $n,
	alternate: Wn
});
function ei(e, t) {
	let { preferred: u, alternate: r } = t === !0 || t === "'" ? Qa : Za, { length: o } = e, n = 0, a = 0;
	for (let s = 0; s < o; s++) {
		let i = e.charCodeAt(s);
		i === u.codePoint ? n++ : i === r.codePoint && a++;
	}
	return (n > a ? r : u).character;
}
var Vn = ei;
function ti(e, t, u) {
	for (let r = t; r < u; ++r) if (e.charAt(r) === `
`) return !0;
	return !1;
}
var Kn = ti;
function ui(e, t, u = {}) {
	return Y(e, u.backwards ? t - 1 : t, u) !== t;
}
var Gn = ui;
function ri(e, t, u) {
	return ze(e, u(t));
}
function ni(e, t) {
	return arguments.length === 2 || typeof t == "number" ? ze(e, t) : ri(...arguments);
}
function oi(e, t, u) {
	return Le(e, u(t));
}
function ai(e, t) {
	return arguments.length === 2 || typeof t == "number" ? Le(e, t) : oi(...arguments);
}
function ii(e, t, u) {
	return kt(e, u(t));
}
function si(e, t, u) {
	let r = t === "\"" ? "'" : "\"";
	return t + oe(0, e, /\\(.)|(["'])/gsu, (a, s, i) => s === r ? s : i === t ? "\\" + i : i || (u && /^[^\n\r"'0-7\\bfnrt-vx\u2028\u2029]$/u.test(s) ? s : "\\" + s)) + t;
}
function Di(e, t) {
	return arguments.length === 2 || typeof t == "number" ? kt(e, t) : ii(...arguments);
}
function me(e, t = 1) {
	return async (...u) => {
		let r = u[t] ?? {}, o = r.plugins ?? [];
		return u[t] = {
			...r,
			plugins: Array.isArray(o) ? o : Object.values(o)
		}, e(...u);
	};
}
var zn = me(Su);
async function Jn(e, t) {
	let { formatted: u } = await zn(e, {
		...t,
		cursorOffset: -1
	});
	return u;
}
async function ci(e, t) {
	return await Jn(e, t) === e;
}
var fi = me(it, 0), li = {
	parse: me(In),
	formatAST: me(kn),
	formatDoc: me(vn),
	printToDoc: me(Rn),
	printDocToString: me(Ln)
};
//#endregion
//#region ../../node_modules/domelementtype/lib/esm/index.js
/** Types of elements found in htmlparser2's DOM */
var ElementType;
(function(ElementType) {
	/** Type for the root element of a document */
	ElementType["Root"] = "root";
	/** Type for Text */
	ElementType["Text"] = "text";
	/** Type for <? ... ?> */
	ElementType["Directive"] = "directive";
	/** Type for <!-- ... --> */
	ElementType["Comment"] = "comment";
	/** Type for <script> tags */
	ElementType["Script"] = "script";
	/** Type for <style> tags */
	ElementType["Style"] = "style";
	/** Type for Any tag */
	ElementType["Tag"] = "tag";
	/** Type for <![CDATA[ ... ]]> */
	ElementType["CDATA"] = "cdata";
	/** Type for <!doctype ...> */
	ElementType["Doctype"] = "doctype";
})(ElementType || (ElementType = {}));
/**
* Tests whether an element is a tag or not.
*
* @param elem Element to test
*/
function isTag$1(elem) {
	return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
/** Type for the root element of a document */
const Root = ElementType.Root;
/** Type for Text */
const Text$1 = ElementType.Text;
/** Type for <? ... ?> */
const Directive = ElementType.Directive;
/** Type for <!-- ... --> */
const Comment$1 = ElementType.Comment;
/** Type for <script> tags */
const Script = ElementType.Script;
/** Type for <style> tags */
const Style = ElementType.Style;
/** Type for Any tag */
const Tag = ElementType.Tag;
/** Type for <![CDATA[ ... ]]> */
const CDATA$1 = ElementType.CDATA;
/** Type for <!doctype ...> */
const Doctype = ElementType.Doctype;
//#endregion
//#region ../../node_modules/domhandler/lib/esm/node.js
/**
* This object will be used as the prototype for Nodes when creating a
* DOM-Level-1-compliant structure.
*/
var Node = class {
	constructor() {
		/** Parent of the node */
		this.parent = null;
		/** Previous sibling */
		this.prev = null;
		/** Next sibling */
		this.next = null;
		/** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
		this.startIndex = null;
		/** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
		this.endIndex = null;
	}
	/**
	* Same as {@link parent}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get parentNode() {
		return this.parent;
	}
	set parentNode(parent) {
		this.parent = parent;
	}
	/**
	* Same as {@link prev}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get previousSibling() {
		return this.prev;
	}
	set previousSibling(prev) {
		this.prev = prev;
	}
	/**
	* Same as {@link next}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get nextSibling() {
		return this.next;
	}
	set nextSibling(next) {
		this.next = next;
	}
	/**
	* Clone this node, and optionally its children.
	*
	* @param recursive Clone child nodes as well.
	* @returns A clone of the node.
	*/
	cloneNode(recursive = false) {
		return cloneNode(this, recursive);
	}
};
/**
* A node that contains some data.
*/
var DataNode = class extends Node {
	/**
	* @param data The content of the data node
	*/
	constructor(data) {
		super();
		this.data = data;
	}
	/**
	* Same as {@link data}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get nodeValue() {
		return this.data;
	}
	set nodeValue(data) {
		this.data = data;
	}
};
/**
* Text within the document.
*/
var Text = class extends DataNode {
	constructor() {
		super(...arguments);
		this.type = ElementType.Text;
	}
	get nodeType() {
		return 3;
	}
};
/**
* Comments within the document.
*/
var Comment = class extends DataNode {
	constructor() {
		super(...arguments);
		this.type = ElementType.Comment;
	}
	get nodeType() {
		return 8;
	}
};
/**
* Processing instructions, including doc types.
*/
var ProcessingInstruction = class extends DataNode {
	constructor(name, data) {
		super(data);
		this.name = name;
		this.type = ElementType.Directive;
	}
	get nodeType() {
		return 1;
	}
};
/**
* A `Node` that can have children.
*/
var NodeWithChildren = class extends Node {
	/**
	* @param children Children of the node. Only certain node types can have children.
	*/
	constructor(children) {
		super();
		this.children = children;
	}
	/** First child of the node. */
	get firstChild() {
		var _a;
		return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
	}
	/** Last child of the node. */
	get lastChild() {
		return this.children.length > 0 ? this.children[this.children.length - 1] : null;
	}
	/**
	* Same as {@link children}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get childNodes() {
		return this.children;
	}
	set childNodes(children) {
		this.children = children;
	}
};
var CDATA = class extends NodeWithChildren {
	constructor() {
		super(...arguments);
		this.type = ElementType.CDATA;
	}
	get nodeType() {
		return 4;
	}
};
/**
* The root node of the document.
*/
var Document = class extends NodeWithChildren {
	constructor() {
		super(...arguments);
		this.type = ElementType.Root;
	}
	get nodeType() {
		return 9;
	}
};
/**
* An element within the DOM.
*/
var Element = class extends NodeWithChildren {
	/**
	* @param name Name of the tag, eg. `div`, `span`.
	* @param attribs Object mapping attribute names to attribute values.
	* @param children Children of the node.
	*/
	constructor(name, attribs, children = [], type = name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag) {
		super(children);
		this.name = name;
		this.attribs = attribs;
		this.type = type;
	}
	get nodeType() {
		return 1;
	}
	/**
	* Same as {@link name}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get tagName() {
		return this.name;
	}
	set tagName(name) {
		this.name = name;
	}
	get attributes() {
		return Object.keys(this.attribs).map((name) => {
			var _a, _b;
			return {
				name,
				value: this.attribs[name],
				namespace: (_a = this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
				prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
			};
		});
	}
};
/**
* @param node Node to check.
* @returns `true` if the node is a `Element`, `false` otherwise.
*/
function isTag(node) {
	return isTag$1(node);
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `CDATA`, `false` otherwise.
*/
function isCDATA(node) {
	return node.type === ElementType.CDATA;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `Text`, `false` otherwise.
*/
function isText(node) {
	return node.type === ElementType.Text;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `Comment`, `false` otherwise.
*/
function isComment(node) {
	return node.type === ElementType.Comment;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
*/
function isDirective(node) {
	return node.type === ElementType.Directive;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
*/
function isDocument(node) {
	return node.type === ElementType.Root;
}
/**
* Clone a node, and optionally its children.
*
* @param recursive Clone child nodes as well.
* @returns A clone of the node.
*/
function cloneNode(node, recursive = false) {
	let result;
	if (isText(node)) result = new Text(node.data);
	else if (isComment(node)) result = new Comment(node.data);
	else if (isTag(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new Element(node.name, { ...node.attribs }, children);
		children.forEach((child) => child.parent = clone);
		if (node.namespace != null) clone.namespace = node.namespace;
		if (node["x-attribsNamespace"]) clone["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
		if (node["x-attribsPrefix"]) clone["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
		result = clone;
	} else if (isCDATA(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new CDATA(children);
		children.forEach((child) => child.parent = clone);
		result = clone;
	} else if (isDocument(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new Document(children);
		children.forEach((child) => child.parent = clone);
		if (node["x-mode"]) clone["x-mode"] = node["x-mode"];
		result = clone;
	} else if (isDirective(node)) {
		const instruction = new ProcessingInstruction(node.name, node.data);
		if (node["x-name"] != null) {
			instruction["x-name"] = node["x-name"];
			instruction["x-publicId"] = node["x-publicId"];
			instruction["x-systemId"] = node["x-systemId"];
		}
		result = instruction;
	} else throw new Error(`Not implemented yet: ${node.type}`);
	result.startIndex = node.startIndex;
	result.endIndex = node.endIndex;
	if (node.sourceCodeLocation != null) result.sourceCodeLocation = node.sourceCodeLocation;
	return result;
}
function cloneChildren(childs) {
	const children = childs.map((child) => cloneNode(child, true));
	for (let i = 1; i < children.length; i++) {
		children[i].prev = children[i - 1];
		children[i - 1].next = children[i];
	}
	return children;
}
//#endregion
//#region ../../node_modules/domhandler/lib/esm/index.js
const defaultOpts = {
	withStartIndices: false,
	withEndIndices: false,
	xmlMode: false
};
var DomHandler = class {
	/**
	* @param callback Called once parsing has completed.
	* @param options Settings for the handler.
	* @param elementCB Callback whenever a tag is closed.
	*/
	constructor(callback, options, elementCB) {
		/** The elements of the DOM */
		this.dom = [];
		/** The root element for the DOM */
		this.root = new Document(this.dom);
		/** Indicated whether parsing has been completed. */
		this.done = false;
		/** Stack of open tags. */
		this.tagStack = [this.root];
		/** A data node that is still being written to. */
		this.lastNode = null;
		/** Reference to the parser instance. Used for location information. */
		this.parser = null;
		if (typeof options === "function") {
			elementCB = options;
			options = defaultOpts;
		}
		if (typeof callback === "object") {
			options = callback;
			callback = void 0;
		}
		this.callback = callback !== null && callback !== void 0 ? callback : null;
		this.options = options !== null && options !== void 0 ? options : defaultOpts;
		this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
	}
	onparserinit(parser) {
		this.parser = parser;
	}
	onreset() {
		this.dom = [];
		this.root = new Document(this.dom);
		this.done = false;
		this.tagStack = [this.root];
		this.lastNode = null;
		this.parser = null;
	}
	onend() {
		if (this.done) return;
		this.done = true;
		this.parser = null;
		this.handleCallback(null);
	}
	onerror(error) {
		this.handleCallback(error);
	}
	onclosetag() {
		this.lastNode = null;
		const elem = this.tagStack.pop();
		if (this.options.withEndIndices) elem.endIndex = this.parser.endIndex;
		if (this.elementCB) this.elementCB(elem);
	}
	onopentag(name, attribs) {
		const element = new Element(name, attribs, void 0, this.options.xmlMode ? ElementType.Tag : void 0);
		this.addNode(element);
		this.tagStack.push(element);
	}
	ontext(data) {
		const { lastNode } = this;
		if (lastNode && lastNode.type === ElementType.Text) {
			lastNode.data += data;
			if (this.options.withEndIndices) lastNode.endIndex = this.parser.endIndex;
		} else {
			const node = new Text(data);
			this.addNode(node);
			this.lastNode = node;
		}
	}
	oncomment(data) {
		if (this.lastNode && this.lastNode.type === ElementType.Comment) {
			this.lastNode.data += data;
			return;
		}
		const node = new Comment(data);
		this.addNode(node);
		this.lastNode = node;
	}
	oncommentend() {
		this.lastNode = null;
	}
	oncdatastart() {
		const text = new Text("");
		const node = new CDATA([text]);
		this.addNode(node);
		text.parent = node;
		this.lastNode = text;
	}
	oncdataend() {
		this.lastNode = null;
	}
	onprocessinginstruction(name, data) {
		const node = new ProcessingInstruction(name, data);
		this.addNode(node);
	}
	handleCallback(error) {
		if (typeof this.callback === "function") this.callback(error, this.dom);
		else if (error) throw error;
	}
	addNode(node) {
		const parent = this.tagStack[this.tagStack.length - 1];
		const previousSibling = parent.children[parent.children.length - 1];
		if (this.options.withStartIndices) node.startIndex = this.parser.startIndex;
		if (this.options.withEndIndices) node.endIndex = this.parser.endIndex;
		parent.children.push(node);
		if (previousSibling) {
			node.prev = previousSibling;
			previousSibling.next = node;
		}
		node.parent = parent;
		this.lastNode = null;
	}
};
//#endregion
//#region ../../node_modules/leac/lib/leac.mjs
const e = /\n/g;
function n(n) {
	const o = [...n.matchAll(e)].map(((e) => e.index || 0));
	o.unshift(-1);
	const s = t(o, 0, o.length);
	return (e) => r(s, e);
}
function t(e, n, r) {
	if (r - n == 1) return {
		offset: e[n],
		index: n + 1
	};
	const o = Math.ceil((n + r) / 2), s = t(e, n, o), l = t(e, o, r);
	return {
		offset: s.offset,
		low: s,
		high: l
	};
}
function r(e, n) {
	return function(e) {
		return Object.prototype.hasOwnProperty.call(e, "index");
	}(e) ? {
		line: e.index,
		column: n - e.offset
	} : r(e.high.offset < n ? e.high : e.low, n);
}
function o(e, t = "", r = {}) {
	const o = "string" != typeof t ? t : r, l = "string" == typeof t ? t : "", c = e.map(s), f = !!o.lineNumbers;
	return function(e, t = 0) {
		const r = f ? n(e) : () => ({
			line: 0,
			column: 0
		});
		let o = t;
		const s = [];
		e: for (; o < e.length;) {
			let n = !1;
			for (const t of c) {
				t.regex.lastIndex = o;
				const c = t.regex.exec(e);
				if (c && c[0].length > 0) {
					if (!t.discard) {
						const e = r(o), n = "string" == typeof t.replace ? c[0].replace(new RegExp(t.regex.source, t.regex.flags), t.replace) : c[0];
						s.push({
							state: l,
							name: t.name,
							text: n,
							offset: o,
							len: c[0].length,
							line: e.line,
							column: e.column
						});
					}
					if (o = t.regex.lastIndex, n = !0, t.push) {
						const n = t.push(e, o);
						s.push(...n.tokens), o = n.offset;
					}
					if (t.pop) break e;
					break;
				}
			}
			if (!n) break;
		}
		return {
			tokens: s,
			offset: o,
			complete: e.length <= o
		};
	};
}
function s(e, n) {
	return {
		...e,
		regex: l(e, n)
	};
}
function l(e, n) {
	if (0 === e.name.length) throw new Error(`Rule #${n} has empty name, which is not allowed.`);
	if (function(e) {
		return Object.prototype.hasOwnProperty.call(e, "regex");
	}(e)) return function(e) {
		if (e.global) throw new Error(`Regular expression /${e.source}/${e.flags} contains the global flag, which is not allowed.`);
		return e.sticky ? e : new RegExp(e.source, e.flags + "y");
	}(e.regex);
	if (function(e) {
		return Object.prototype.hasOwnProperty.call(e, "str");
	}(e)) {
		if (0 === e.str.length) throw new Error(`Rule #${n} ("${e.name}") has empty "str" property, which is not allowed.`);
		return new RegExp(c(e.str), "y");
	}
	return new RegExp(c(e.name), "y");
}
function c(e) {
	return e.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, "\\$&");
}
//#endregion
//#region ../../node_modules/peberminta/lib/core.mjs
function token(onToken, onEnd) {
	return (data, i) => {
		let position = i;
		let value = void 0;
		if (i < data.tokens.length) {
			value = onToken(data.tokens[i], data, i);
			if (value !== void 0) position++;
		} else onEnd?.(data, i);
		return value === void 0 ? { matched: false } : {
			matched: true,
			position,
			value
		};
	};
}
function mapInner(r, f) {
	return r.matched ? {
		matched: true,
		position: r.position,
		value: f(r.value, r.position)
	} : r;
}
function mapOuter(r, f) {
	return r.matched ? f(r) : r;
}
function map(p, mapper) {
	return (data, i) => mapInner(p(data, i), (v, j) => mapper(v, data, i, j));
}
function option(p, def) {
	return (data, i) => {
		const r = p(data, i);
		return r.matched ? r : {
			matched: true,
			position: i,
			value: def
		};
	};
}
function choice(...ps) {
	return (data, i) => {
		for (const p of ps) {
			const result = p(data, i);
			if (result.matched) return result;
		}
		return { matched: false };
	};
}
function otherwise(pa, pb) {
	return (data, i) => {
		const r1 = pa(data, i);
		return r1.matched ? r1 : pb(data, i);
	};
}
function takeWhile(p, test) {
	return (data, i) => {
		const values = [];
		let success = true;
		do {
			const r = p(data, i);
			if (r.matched && test(r.value, values.length + 1, data, i, r.position)) {
				values.push(r.value);
				i = r.position;
			} else success = false;
		} while (success);
		return {
			matched: true,
			position: i,
			value: values
		};
	};
}
function many(p) {
	return takeWhile(p, () => true);
}
function many1(p) {
	return ab(p, many(p), (head, tail) => [head, ...tail]);
}
function ab(pa, pb, join) {
	return (data, i) => mapOuter(pa(data, i), (ma) => mapInner(pb(data, ma.position), (vb, j) => join(ma.value, vb, data, i, j)));
}
function left(pa, pb) {
	return ab(pa, pb, (va) => va);
}
function right(pa, pb) {
	return ab(pa, pb, (va, vb) => vb);
}
function abc(pa, pb, pc, join) {
	return (data, i) => mapOuter(pa(data, i), (ma) => mapOuter(pb(data, ma.position), (mb) => mapInner(pc(data, mb.position), (vc, j) => join(ma.value, mb.value, vc, data, i, j))));
}
function middle(pa, pb, pc) {
	return abc(pa, pb, pc, (ra, rb) => rb);
}
function all(...ps) {
	return (data, i) => {
		const result = [];
		let position = i;
		for (const p of ps) {
			const r1 = p(data, position);
			if (r1.matched) {
				result.push(r1.value);
				position = r1.position;
			} else return { matched: false };
		}
		return {
			matched: true,
			position,
			value: result
		};
	};
}
function flatten(...ps) {
	return flatten1(all(...ps));
}
function flatten1(p) {
	return map(p, (vs) => vs.flatMap((v) => v));
}
function chainReduce(acc, f) {
	return (data, i) => {
		let loop = true;
		let acc1 = acc;
		let pos = i;
		do {
			const r = f(acc1, data, pos)(data, pos);
			if (r.matched) {
				acc1 = r.value;
				pos = r.position;
			} else loop = false;
		} while (loop);
		return {
			matched: true,
			position: pos,
			value: acc1
		};
	};
}
function reduceLeft(acc, p, reducer) {
	return chainReduce(acc, (acc) => map(p, (v, data, i, j) => reducer(acc, v, data, i, j)));
}
function leftAssoc2(pLeft, pOper, pRight) {
	return chain(pLeft, (v0) => reduceLeft(v0, ab(pOper, pRight, (f, y) => [f, y]), (acc, [f, y]) => f(acc, y)));
}
function chain(p, f) {
	return (data, i) => mapOuter(p(data, i), (m1) => f(m1.value, data, i, m1.position)(data, m1.position));
}
//#endregion
//#region ../../node_modules/parseley/lib/parseley.mjs
const ws = `(?:[ \\t\\r\\n\\f]*)`;
const nl = `(?:\\n|\\r\\n|\\r|\\f)`;
const nonascii = `[^\\x00-\\x7F]`;
const unicode = `(?:\\\\[0-9a-f]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?)`;
const escape = `(?:\\\\[^\\n\\r\\f0-9a-f])`;
const nmstart = `(?:[_a-z]|${nonascii}|${unicode}|${escape})`;
const nmchar = `(?:[_a-z0-9-]|${nonascii}|${unicode}|${escape})`;
const name = `(?:${nmchar}+)`;
const ident = `(?:[-]?${nmstart}${nmchar}*)`;
const string1 = `'([^\\n\\r\\f\\\\']|\\\\${nl}|${nonascii}|${unicode}|${escape})*'`;
const string2 = `"([^\\n\\r\\f\\\\"]|\\\\${nl}|${nonascii}|${unicode}|${escape})*"`;
const lexSelector = o([
	{
		name: "ws",
		regex: new RegExp(ws)
	},
	{
		name: "hash",
		regex: new RegExp(`#${name}`, "i")
	},
	{
		name: "ident",
		regex: new RegExp(ident, "i")
	},
	{
		name: "str1",
		regex: new RegExp(string1, "i")
	},
	{
		name: "str2",
		regex: new RegExp(string2, "i")
	},
	{ name: "*" },
	{ name: "." },
	{ name: "," },
	{ name: "[" },
	{ name: "]" },
	{ name: "=" },
	{ name: ">" },
	{ name: "|" },
	{ name: "+" },
	{ name: "~" },
	{ name: "^" },
	{ name: "$" }
]);
const lexEscapedString = o([
	{
		name: "unicode",
		regex: new RegExp(unicode, "i")
	},
	{
		name: "escape",
		regex: new RegExp(escape, "i")
	},
	{
		name: "any",
		regex: /* @__PURE__ */ new RegExp("[\\s\\S]", "i")
	}
]);
function sumSpec([a0, a1, a2], [b0, b1, b2]) {
	return [
		a0 + b0,
		a1 + b1,
		a2 + b2
	];
}
function sumAllSpec(ss) {
	return ss.reduce(sumSpec, [
		0,
		0,
		0
	]);
}
const escapedString_ = map(many(choice(token((t) => t.name === "unicode" ? String.fromCodePoint(parseInt(t.text.slice(1), 16)) : void 0), token((t) => t.name === "escape" ? t.text.slice(1) : void 0), token((t) => t.name === "any" ? t.text : void 0))), (cs) => cs.join(""));
function unescape(escapedString) {
	return escapedString_({
		tokens: lexEscapedString(escapedString).tokens,
		options: void 0
	}, 0).value;
}
function literal(name) {
	return token((t) => t.name === name ? true : void 0);
}
const whitespace_ = token((t) => t.name === "ws" ? null : void 0);
const optionalWhitespace_ = option(whitespace_, null);
function optionallySpaced(parser) {
	return middle(optionalWhitespace_, parser, optionalWhitespace_);
}
const identifier_ = token((t) => t.name === "ident" ? unescape(t.text) : void 0);
const hashId_ = token((t) => t.name === "hash" ? unescape(t.text.slice(1)) : void 0);
const string_ = token((t) => t.name.startsWith("str") ? unescape(t.text.slice(1, -1)) : void 0);
const namespace_ = left(option(identifier_, ""), literal("|"));
const qualifiedName_ = otherwise(ab(namespace_, identifier_, (ns, name) => ({
	name,
	namespace: ns
})), map(identifier_, (name) => ({
	name,
	namespace: null
})));
const uniSelector_ = otherwise(ab(namespace_, literal("*"), (ns) => ({
	type: "universal",
	namespace: ns,
	specificity: [
		0,
		0,
		0
	]
})), map(literal("*"), () => ({
	type: "universal",
	namespace: null,
	specificity: [
		0,
		0,
		0
	]
})));
const tagSelector_ = map(qualifiedName_, ({ name, namespace }) => ({
	type: "tag",
	name,
	namespace,
	specificity: [
		0,
		0,
		1
	]
}));
const classSelector_ = ab(literal("."), identifier_, (fullstop, name) => ({
	type: "class",
	name,
	specificity: [
		0,
		1,
		0
	]
}));
const idSelector_ = map(hashId_, (name) => ({
	type: "id",
	name,
	specificity: [
		1,
		0,
		0
	]
}));
const attrModifier_ = token((t) => {
	if (t.name === "ident") {
		if (t.text === "i" || t.text === "I") return "i";
		if (t.text === "s" || t.text === "S") return "s";
	}
});
const attrValue_ = otherwise(ab(string_, option(right(optionalWhitespace_, attrModifier_), null), (v, mod) => ({
	value: v,
	modifier: mod
})), ab(identifier_, option(right(whitespace_, attrModifier_), null), (v, mod) => ({
	value: v,
	modifier: mod
})));
const attrMatcher_ = choice(map(literal("="), () => "="), ab(literal("~"), literal("="), () => "~="), ab(literal("|"), literal("="), () => "|="), ab(literal("^"), literal("="), () => "^="), ab(literal("$"), literal("="), () => "$="), ab(literal("*"), literal("="), () => "*="));
const attrSelector_ = otherwise(abc(literal("["), optionallySpaced(qualifiedName_), literal("]"), (lbr, { name, namespace }) => ({
	type: "attrPresence",
	name,
	namespace,
	specificity: [
		0,
		1,
		0
	]
})), middle(literal("["), abc(optionallySpaced(qualifiedName_), attrMatcher_, optionallySpaced(attrValue_), ({ name, namespace }, matcher, { value, modifier }) => ({
	type: "attrValue",
	name,
	namespace,
	matcher,
	value,
	modifier,
	specificity: [
		0,
		1,
		0
	]
})), literal("]")));
const typeSelector_ = otherwise(uniSelector_, tagSelector_);
const subclassSelector_ = choice(idSelector_, classSelector_, attrSelector_);
const compoundSelector_ = map(otherwise(flatten(typeSelector_, many(subclassSelector_)), many1(subclassSelector_)), (ss) => {
	return {
		type: "compound",
		list: ss,
		specificity: sumAllSpec(ss.map((s) => s.specificity))
	};
});
const complexSelector_ = leftAssoc2(compoundSelector_, map(otherwise(optionallySpaced(choice(map(literal(">"), () => ">"), map(literal("+"), () => "+"), map(literal("~"), () => "~"), ab(literal("|"), literal("|"), () => "||"))), map(whitespace_, () => " ")), (c) => (left, right) => ({
	type: "compound",
	list: [...right.list, {
		type: "combinator",
		combinator: c,
		left,
		specificity: left.specificity
	}],
	specificity: sumSpec(left.specificity, right.specificity)
})), compoundSelector_);
leftAssoc2(map(complexSelector_, (s) => ({
	type: "list",
	list: [s]
})), map(optionallySpaced(literal(",")), () => (acc, next) => ({
	type: "list",
	list: [...acc.list, next]
})), complexSelector_);
function parse_(parser, str) {
	if (!(typeof str === "string" || str instanceof String)) throw new Error("Expected a selector string. Actual input is not a string!");
	const lexerResult = lexSelector(str);
	if (!lexerResult.complete) throw new Error(`The input "${str}" was only partially tokenized, stopped at offset ${lexerResult.offset}!\n` + prettyPrintPosition(str, lexerResult.offset));
	const result = optionallySpaced(parser)({
		tokens: lexerResult.tokens,
		options: void 0
	}, 0);
	if (!result.matched) throw new Error(`No match for "${str}" input!`);
	if (result.position < lexerResult.tokens.length) {
		const token = lexerResult.tokens[result.position];
		throw new Error(`The input "${str}" was only partially parsed, stopped at offset ${token.offset}!\n` + prettyPrintPosition(str, token.offset, token.len));
	}
	return result.value;
}
function prettyPrintPosition(str, offset, len = 1) {
	return `${str.replace(/(\t)|(\r)|(\n)/g, (m, t, r) => t ? "␉" : r ? "␍" : "␊")}\n${"".padEnd(offset)}${"^".repeat(len)}`;
}
function parse1(str) {
	return parse_(complexSelector_, str);
}
function serialize(selector) {
	if (!selector.type) throw new Error("This is not an AST node.");
	switch (selector.type) {
		case "universal": return _serNs(selector.namespace) + "*";
		case "tag": return _serNs(selector.namespace) + _serIdent(selector.name);
		case "class": return "." + _serIdent(selector.name);
		case "id": return "#" + _serIdent(selector.name);
		case "attrPresence": return `[${_serNs(selector.namespace)}${_serIdent(selector.name)}]`;
		case "attrValue": return `[${_serNs(selector.namespace)}${_serIdent(selector.name)}${selector.matcher}"${_serStr(selector.value)}"${selector.modifier ? selector.modifier : ""}]`;
		case "combinator": return serialize(selector.left) + selector.combinator;
		case "compound": return selector.list.reduce((acc, node) => {
			if (node.type === "combinator") return serialize(node) + acc;
			else return acc + serialize(node);
		}, "");
		case "list": return selector.list.map(serialize).join(",");
	}
}
function _serNs(ns) {
	return ns || ns === "" ? _serIdent(ns) + "|" : "";
}
function _codePoint(char) {
	return `\\${char.codePointAt(0).toString(16)} `;
}
function _serIdent(str) {
	return str.replace(/(^[0-9])|(^-[0-9])|(^-$)|([-0-9a-zA-Z_]|[^\x00-\x7F])|(\x00)|([\x01-\x1f]|\x7f)|([\s\S])/g, (m, d1, d2, hy, safe, nl, ctrl, other) => d1 ? _codePoint(d1) : d2 ? "-" + _codePoint(d2.slice(1)) : hy ? "\\-" : safe ? safe : nl ? "�" : ctrl ? _codePoint(ctrl) : "\\" + other);
}
function _serStr(str) {
	return str.replace(/(")|(\\)|(\x00)|([\x01-\x1f]|\x7f)/g, (m, dq, bs, nl, ctrl) => dq ? "\\\"" : bs ? "\\\\" : nl ? "�" : _codePoint(ctrl));
}
function normalize(selector) {
	if (!selector.type) throw new Error("This is not an AST node.");
	switch (selector.type) {
		case "compound":
			selector.list.forEach(normalize);
			selector.list.sort((a, b) => _compareArrays(_getSelectorPriority(a), _getSelectorPriority(b)));
			break;
		case "combinator":
			normalize(selector.left);
			break;
		case "list":
			selector.list.forEach(normalize);
			selector.list.sort((a, b) => serialize(a) < serialize(b) ? -1 : 1);
			break;
	}
	return selector;
}
function _getSelectorPriority(selector) {
	switch (selector.type) {
		case "universal": return [1];
		case "tag": return [1];
		case "id": return [2];
		case "class": return [3, selector.name];
		case "attrPresence": return [4, serialize(selector)];
		case "attrValue": return [5, serialize(selector)];
		case "combinator": return [15, serialize(selector)];
	}
}
function compareSpecificity(a, b) {
	return _compareArrays(a, b);
}
function _compareArrays(a, b) {
	if (!Array.isArray(a) || !Array.isArray(b)) throw new Error("Arguments must be arrays.");
	const shorter = a.length < b.length ? a.length : b.length;
	for (let i = 0; i < shorter; i++) {
		if (a[i] === b[i]) continue;
		return a[i] < b[i] ? -1 : 1;
	}
	return a.length - b.length;
}
//#endregion
//#region ../../node_modules/selderee/lib/selderee.mjs
var DecisionTree = class {
	constructor(input) {
		this.branches = weave(toAstTerminalPairs(input));
	}
	build(builder) {
		return builder(this.branches);
	}
};
function toAstTerminalPairs(array) {
	const len = array.length;
	const results = new Array(len);
	for (let i = 0; i < len; i++) {
		const [selectorString, val] = array[i];
		const ast = preprocess(parse1(selectorString));
		results[i] = {
			ast,
			terminal: {
				type: "terminal",
				valueContainer: {
					index: i,
					value: val,
					specificity: ast.specificity
				}
			}
		};
	}
	return results;
}
function preprocess(ast) {
	reduceSelectorVariants(ast);
	normalize(ast);
	return ast;
}
function reduceSelectorVariants(ast) {
	const newList = [];
	ast.list.forEach((sel) => {
		switch (sel.type) {
			case "class":
				newList.push({
					matcher: "~=",
					modifier: null,
					name: "class",
					namespace: null,
					specificity: sel.specificity,
					type: "attrValue",
					value: sel.name
				});
				break;
			case "id":
				newList.push({
					matcher: "=",
					modifier: null,
					name: "id",
					namespace: null,
					specificity: sel.specificity,
					type: "attrValue",
					value: sel.name
				});
				break;
			case "combinator":
				reduceSelectorVariants(sel.left);
				newList.push(sel);
				break;
			case "universal": break;
			default:
				newList.push(sel);
				break;
		}
	});
	ast.list = newList;
}
function weave(items) {
	const branches = [];
	while (items.length) {
		const topKind = findTopKey(items, (sel) => true, getSelectorKind);
		const { matches, nonmatches, empty } = breakByKind(items, topKind);
		items = nonmatches;
		if (matches.length) branches.push(branchOfKind(topKind, matches));
		if (empty.length) branches.push(...terminate(empty));
	}
	return branches;
}
function terminate(items) {
	const results = [];
	for (const item of items) {
		const terminal = item.terminal;
		if (terminal.type === "terminal") results.push(terminal);
		else {
			const { matches, rest } = partition(terminal.cont, (node) => node.type === "terminal");
			matches.forEach((node) => results.push(node));
			if (rest.length) {
				terminal.cont = rest;
				results.push(terminal);
			}
		}
	}
	return results;
}
function breakByKind(items, selectedKind) {
	const matches = [];
	const nonmatches = [];
	const empty = [];
	for (const item of items) {
		const simpsels = item.ast.list;
		if (simpsels.length) (simpsels.some((node) => getSelectorKind(node) === selectedKind) ? matches : nonmatches).push(item);
		else empty.push(item);
	}
	return {
		matches,
		nonmatches,
		empty
	};
}
function getSelectorKind(sel) {
	switch (sel.type) {
		case "attrPresence": return `attrPresence ${sel.name}`;
		case "attrValue": return `attrValue ${sel.name}`;
		case "combinator": return `combinator ${sel.combinator}`;
		default: return sel.type;
	}
}
function branchOfKind(kind, items) {
	if (kind === "tag") return tagNameBranch(items);
	if (kind.startsWith("attrValue ")) return attrValueBranch(kind.substring(10), items);
	if (kind.startsWith("attrPresence ")) return attrPresenceBranch(kind.substring(13), items);
	if (kind === "combinator >") return combinatorBranch(">", items);
	if (kind === "combinator +") return combinatorBranch("+", items);
	throw new Error(`Unsupported selector kind: ${kind}`);
}
function tagNameBranch(items) {
	const groups = spliceAndGroup(items, (x) => x.type === "tag", (x) => x.name);
	return {
		type: "tagName",
		variants: Object.entries(groups).map(([name, group]) => ({
			type: "variant",
			value: name,
			cont: weave(group.items)
		}))
	};
}
function attrPresenceBranch(name, items) {
	for (const item of items) spliceSimpleSelector(item, (x) => x.type === "attrPresence" && x.name === name);
	return {
		type: "attrPresence",
		name,
		cont: weave(items)
	};
}
function attrValueBranch(name, items) {
	const groups = spliceAndGroup(items, (x) => x.type === "attrValue" && x.name === name, (x) => `${x.matcher} ${x.modifier || ""} ${x.value}`);
	const matchers = [];
	for (const group of Object.values(groups)) {
		const sel = group.oneSimpleSelector;
		const predicate = getAttrPredicate(sel);
		const continuation = weave(group.items);
		matchers.push({
			type: "matcher",
			matcher: sel.matcher,
			modifier: sel.modifier,
			value: sel.value,
			predicate,
			cont: continuation
		});
	}
	return {
		type: "attrValue",
		name,
		matchers
	};
}
function getAttrPredicate(sel) {
	if (sel.modifier === "i") {
		const expected = sel.value.toLowerCase();
		switch (sel.matcher) {
			case "=": return (actual) => expected === actual.toLowerCase();
			case "~=": return (actual) => actual.toLowerCase().split(/[ \t]+/).includes(expected);
			case "^=": return (actual) => actual.toLowerCase().startsWith(expected);
			case "$=": return (actual) => actual.toLowerCase().endsWith(expected);
			case "*=": return (actual) => actual.toLowerCase().includes(expected);
			case "|=": return (actual) => {
				const lower = actual.toLowerCase();
				return expected === lower || lower.startsWith(expected) && lower[expected.length] === "-";
			};
		}
	} else {
		const expected = sel.value;
		switch (sel.matcher) {
			case "=": return (actual) => expected === actual;
			case "~=": return (actual) => actual.split(/[ \t]+/).includes(expected);
			case "^=": return (actual) => actual.startsWith(expected);
			case "$=": return (actual) => actual.endsWith(expected);
			case "*=": return (actual) => actual.includes(expected);
			case "|=": return (actual) => expected === actual || actual.startsWith(expected) && actual[expected.length] === "-";
		}
	}
}
function combinatorBranch(combinator, items) {
	const groups = spliceAndGroup(items, (x) => x.type === "combinator" && x.combinator === combinator, (x) => serialize(x.left));
	const leftItems = [];
	for (const group of Object.values(groups)) {
		const rightCont = weave(group.items);
		const leftAst = group.oneSimpleSelector.left;
		leftItems.push({
			ast: leftAst,
			terminal: {
				type: "popElement",
				cont: rightCont
			}
		});
	}
	return {
		type: "pushElement",
		combinator,
		cont: weave(leftItems)
	};
}
function spliceAndGroup(items, predicate, keyCallback) {
	const groups = {};
	while (items.length) {
		const bestKey = findTopKey(items, predicate, keyCallback);
		const bestKeyPredicate = (sel) => predicate(sel) && keyCallback(sel) === bestKey;
		const hasBestKeyPredicate = (item) => item.ast.list.some(bestKeyPredicate);
		const { matches, rest } = partition1(items, hasBestKeyPredicate);
		let oneSimpleSelector = null;
		for (const item of matches) {
			const splicedNode = spliceSimpleSelector(item, bestKeyPredicate);
			if (!oneSimpleSelector) oneSimpleSelector = splicedNode;
		}
		if (oneSimpleSelector == null) throw new Error("No simple selector is found.");
		groups[bestKey] = {
			oneSimpleSelector,
			items: matches
		};
		items = rest;
	}
	return groups;
}
function spliceSimpleSelector(item, predicate) {
	const simpsels = item.ast.list;
	const matches = new Array(simpsels.length);
	let firstIndex = -1;
	for (let i = simpsels.length; i-- > 0;) if (predicate(simpsels[i])) {
		matches[i] = true;
		firstIndex = i;
	}
	if (firstIndex == -1) throw new Error(`Couldn't find the required simple selector.`);
	const result = simpsels[firstIndex];
	item.ast.list = simpsels.filter((sel, i) => !matches[i]);
	return result;
}
function findTopKey(items, predicate, keyCallback) {
	const candidates = {};
	for (const item of items) {
		const candidates1 = {};
		for (const node of item.ast.list.filter(predicate)) candidates1[keyCallback(node)] = true;
		for (const key of Object.keys(candidates1)) if (candidates[key]) candidates[key]++;
		else candidates[key] = 1;
	}
	let topKind = "";
	let topCounter = 0;
	for (const entry of Object.entries(candidates)) if (entry[1] > topCounter) {
		topKind = entry[0];
		topCounter = entry[1];
	}
	return topKind;
}
function partition(src, predicate) {
	const matches = [];
	const rest = [];
	for (const x of src) if (predicate(x)) matches.push(x);
	else rest.push(x);
	return {
		matches,
		rest
	};
}
function partition1(src, predicate) {
	const matches = [];
	const rest = [];
	for (const x of src) if (predicate(x)) matches.push(x);
	else rest.push(x);
	return {
		matches,
		rest
	};
}
var Picker = class {
	constructor(f) {
		this.f = f;
	}
	pickAll(el) {
		return this.f(el);
	}
	pick1(el, preferFirst = false) {
		const results = this.f(el);
		const len = results.length;
		if (len === 0) return null;
		if (len === 1) return results[0].value;
		const comparator = preferFirst ? comparatorPreferFirst : comparatorPreferLast;
		let result = results[0];
		for (let i = 1; i < len; i++) {
			const next = results[i];
			if (comparator(result, next)) result = next;
		}
		return result.value;
	}
};
function comparatorPreferFirst(acc, next) {
	const diff = compareSpecificity(next.specificity, acc.specificity);
	return diff > 0 || diff === 0 && next.index < acc.index;
}
function comparatorPreferLast(acc, next) {
	const diff = compareSpecificity(next.specificity, acc.specificity);
	return diff > 0 || diff === 0 && next.index > acc.index;
}
//#endregion
//#region ../../node_modules/@selderee/plugin-htmlparser2/lib/hp2-builder.mjs
function hp2Builder(nodes) {
	return new Picker(handleArray(nodes));
}
function handleArray(nodes) {
	const matchers = nodes.map(handleNode);
	return (el, ...tail) => matchers.flatMap((m) => m(el, ...tail));
}
function handleNode(node) {
	switch (node.type) {
		case "terminal": {
			const result = [node.valueContainer];
			return (el, ...tail) => result;
		}
		case "tagName": return handleTagName(node);
		case "attrValue": return handleAttrValueName(node);
		case "attrPresence": return handleAttrPresenceName(node);
		case "pushElement": return handlePushElementNode(node);
		case "popElement": return handlePopElementNode(node);
	}
}
function handleTagName(node) {
	const variants = {};
	for (const variant of node.variants) variants[variant.value] = handleArray(variant.cont);
	return (el, ...tail) => {
		const continuation = variants[el.name];
		return continuation ? continuation(el, ...tail) : [];
	};
}
function handleAttrPresenceName(node) {
	const attrName = node.name;
	const continuation = handleArray(node.cont);
	return (el, ...tail) => Object.prototype.hasOwnProperty.call(el.attribs, attrName) ? continuation(el, ...tail) : [];
}
function handleAttrValueName(node) {
	const callbacks = [];
	for (const matcher of node.matchers) {
		const predicate = matcher.predicate;
		const continuation = handleArray(matcher.cont);
		callbacks.push((attr, el, ...tail) => predicate(attr) ? continuation(el, ...tail) : []);
	}
	const attrName = node.name;
	return (el, ...tail) => {
		const attr = el.attribs[attrName];
		return attr || attr === "" ? callbacks.flatMap((cb) => cb(attr, el, ...tail)) : [];
	};
}
function handlePushElementNode(node) {
	const continuation = handleArray(node.cont);
	const leftElementGetter = node.combinator === "+" ? getPrecedingElement : getParentElement;
	return (el, ...tail) => {
		const next = leftElementGetter(el);
		if (next === null) return [];
		return continuation(next, el, ...tail);
	};
}
const getPrecedingElement = (el) => {
	const prev = el.prev;
	if (prev === null) return null;
	return isTag(prev) ? prev : getPrecedingElement(prev);
};
const getParentElement = (el) => {
	const parent = el.parent;
	return parent && isTag(parent) ? parent : null;
};
function handlePopElementNode(node) {
	const continuation = handleArray(node.cont);
	return (el, next, ...tail) => continuation(next, ...tail);
}
//#endregion
//#region ../../node_modules/entities/lib/esm/generated/decode-data-html.js
var decode_data_html_default = new Uint16Array("ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻\"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻\xA0ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌".split("").map((c) => c.charCodeAt(0)));
//#endregion
//#region ../../node_modules/entities/lib/esm/generated/decode-data-xml.js
var decode_data_xml_default = new Uint16Array("Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((c) => c.charCodeAt(0)));
//#endregion
//#region ../../node_modules/entities/lib/esm/decode_codepoint.js
var _a;
const decodeMap = new Map([
	[0, 65533],
	[128, 8364],
	[130, 8218],
	[131, 402],
	[132, 8222],
	[133, 8230],
	[134, 8224],
	[135, 8225],
	[136, 710],
	[137, 8240],
	[138, 352],
	[139, 8249],
	[140, 338],
	[142, 381],
	[145, 8216],
	[146, 8217],
	[147, 8220],
	[148, 8221],
	[149, 8226],
	[150, 8211],
	[151, 8212],
	[152, 732],
	[153, 8482],
	[154, 353],
	[155, 8250],
	[156, 339],
	[158, 382],
	[159, 376]
]);
/**
* Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
*/
const fromCodePoint = (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
	let output = "";
	if (codePoint > 65535) {
		codePoint -= 65536;
		output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
		codePoint = 56320 | codePoint & 1023;
	}
	output += String.fromCharCode(codePoint);
	return output;
};
/**
* Replace the given code point with a replacement character if it is a
* surrogate or is outside the valid range. Otherwise return the code
* point unchanged.
*/
function replaceCodePoint(codePoint) {
	var _a;
	if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) return 65533;
	return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
}
//#endregion
//#region ../../node_modules/entities/lib/esm/decode.js
var CharCodes$1;
(function(CharCodes) {
	CharCodes[CharCodes["NUM"] = 35] = "NUM";
	CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
	CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
	CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
	CharCodes[CharCodes["NINE"] = 57] = "NINE";
	CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
	CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
	CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
	CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
	CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
	CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
	CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes$1 || (CharCodes$1 = {}));
/** Bit that needs to be set to convert an upper case ASCII character to lower case */
const TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags) {
	BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
	BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
	BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber$1(code) {
	return code >= CharCodes$1.ZERO && code <= CharCodes$1.NINE;
}
function isHexadecimalCharacter(code) {
	return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_F || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
	return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_Z || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_Z || isNumber$1(code);
}
/**
* Checks if the given character is a valid end character for an entity in an attribute.
*
* Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
* See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
*/
function isEntityInAttributeInvalidEnd(code) {
	return code === CharCodes$1.EQUALS || isAsciiAlphaNumeric(code);
}
var EntityDecoderState;
(function(EntityDecoderState) {
	EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
	EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
	EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
	EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
	EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode) {
	/** Entities in text nodes that can end with any character. */
	DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
	/** Only allow entities terminated with a semicolon. */
	DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
	/** Entities in attributes have limitations on ending characters. */
	DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
/**
* Token decoder with support of writing partial entities.
*/
var EntityDecoder = class {
	constructor(decodeTree, emitCodePoint, errors) {
		this.decodeTree = decodeTree;
		this.emitCodePoint = emitCodePoint;
		this.errors = errors;
		/** The current state of the decoder. */
		this.state = EntityDecoderState.EntityStart;
		/** Characters that were consumed while parsing an entity. */
		this.consumed = 1;
		/**
		* The result of the entity.
		*
		* Either the result index of a numeric entity, or the codepoint of a
		* numeric entity.
		*/
		this.result = 0;
		/** The current index in the decode tree. */
		this.treeIndex = 0;
		/** The number of characters that were consumed in excess. */
		this.excess = 1;
		/** The mode in which the decoder is operating. */
		this.decodeMode = DecodingMode.Strict;
	}
	/** Resets the instance to make it reusable. */
	startEntity(decodeMode) {
		this.decodeMode = decodeMode;
		this.state = EntityDecoderState.EntityStart;
		this.result = 0;
		this.treeIndex = 0;
		this.excess = 1;
		this.consumed = 1;
	}
	/**
	* Write an entity to the decoder. This can be called multiple times with partial entities.
	* If the entity is incomplete, the decoder will return -1.
	*
	* Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
	* entity is incomplete, and resume when the next string is written.
	*
	* @param string The string containing the entity (or a continuation of the entity).
	* @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	write(str, offset) {
		switch (this.state) {
			case EntityDecoderState.EntityStart:
				if (str.charCodeAt(offset) === CharCodes$1.NUM) {
					this.state = EntityDecoderState.NumericStart;
					this.consumed += 1;
					return this.stateNumericStart(str, offset + 1);
				}
				this.state = EntityDecoderState.NamedEntity;
				return this.stateNamedEntity(str, offset);
			case EntityDecoderState.NumericStart: return this.stateNumericStart(str, offset);
			case EntityDecoderState.NumericDecimal: return this.stateNumericDecimal(str, offset);
			case EntityDecoderState.NumericHex: return this.stateNumericHex(str, offset);
			case EntityDecoderState.NamedEntity: return this.stateNamedEntity(str, offset);
		}
	}
	/**
	* Switches between the numeric decimal and hexadecimal states.
	*
	* Equivalent to the `Numeric character reference state` in the HTML spec.
	*
	* @param str The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericStart(str, offset) {
		if (offset >= str.length) return -1;
		if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes$1.LOWER_X) {
			this.state = EntityDecoderState.NumericHex;
			this.consumed += 1;
			return this.stateNumericHex(str, offset + 1);
		}
		this.state = EntityDecoderState.NumericDecimal;
		return this.stateNumericDecimal(str, offset);
	}
	addToNumericResult(str, start, end, base) {
		if (start !== end) {
			const digitCount = end - start;
			this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
			this.consumed += digitCount;
		}
	}
	/**
	* Parses a hexadecimal numeric entity.
	*
	* Equivalent to the `Hexademical character reference state` in the HTML spec.
	*
	* @param str The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericHex(str, offset) {
		const startIdx = offset;
		while (offset < str.length) {
			const char = str.charCodeAt(offset);
			if (isNumber$1(char) || isHexadecimalCharacter(char)) offset += 1;
			else {
				this.addToNumericResult(str, startIdx, offset, 16);
				return this.emitNumericEntity(char, 3);
			}
		}
		this.addToNumericResult(str, startIdx, offset, 16);
		return -1;
	}
	/**
	* Parses a decimal numeric entity.
	*
	* Equivalent to the `Decimal character reference state` in the HTML spec.
	*
	* @param str The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericDecimal(str, offset) {
		const startIdx = offset;
		while (offset < str.length) {
			const char = str.charCodeAt(offset);
			if (isNumber$1(char)) offset += 1;
			else {
				this.addToNumericResult(str, startIdx, offset, 10);
				return this.emitNumericEntity(char, 2);
			}
		}
		this.addToNumericResult(str, startIdx, offset, 10);
		return -1;
	}
	/**
	* Validate and emit a numeric entity.
	*
	* Implements the logic from the `Hexademical character reference start
	* state` and `Numeric character reference end state` in the HTML spec.
	*
	* @param lastCp The last code point of the entity. Used to see if the
	*               entity was terminated with a semicolon.
	* @param expectedLength The minimum number of characters that should be
	*                       consumed. Used to validate that at least one digit
	*                       was consumed.
	* @returns The number of characters that were consumed.
	*/
	emitNumericEntity(lastCp, expectedLength) {
		var _a;
		if (this.consumed <= expectedLength) {
			(_a = this.errors) === null || _a === void 0 || _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
			return 0;
		}
		if (lastCp === CharCodes$1.SEMI) this.consumed += 1;
		else if (this.decodeMode === DecodingMode.Strict) return 0;
		this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
		if (this.errors) {
			if (lastCp !== CharCodes$1.SEMI) this.errors.missingSemicolonAfterCharacterReference();
			this.errors.validateNumericCharacterReference(this.result);
		}
		return this.consumed;
	}
	/**
	* Parses a named entity.
	*
	* Equivalent to the `Named character reference state` in the HTML spec.
	*
	* @param str The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNamedEntity(str, offset) {
		const { decodeTree } = this;
		let current = decodeTree[this.treeIndex];
		let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
		for (; offset < str.length; offset++, this.excess++) {
			const char = str.charCodeAt(offset);
			this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
			if (this.treeIndex < 0) return this.result === 0 || this.decodeMode === DecodingMode.Attribute && (valueLength === 0 || isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
			current = decodeTree[this.treeIndex];
			valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
			if (valueLength !== 0) {
				if (char === CharCodes$1.SEMI) return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
				if (this.decodeMode !== DecodingMode.Strict) {
					this.result = this.treeIndex;
					this.consumed += this.excess;
					this.excess = 0;
				}
			}
		}
		return -1;
	}
	/**
	* Emit a named entity that was not terminated with a semicolon.
	*
	* @returns The number of characters consumed.
	*/
	emitNotTerminatedNamedEntity() {
		var _a;
		const { result, decodeTree } = this;
		const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
		this.emitNamedEntityData(result, valueLength, this.consumed);
		(_a = this.errors) === null || _a === void 0 || _a.missingSemicolonAfterCharacterReference();
		return this.consumed;
	}
	/**
	* Emit a named entity.
	*
	* @param result The index of the entity in the decode tree.
	* @param valueLength The number of bytes in the entity.
	* @param consumed The number of characters consumed.
	*
	* @returns The number of characters consumed.
	*/
	emitNamedEntityData(result, valueLength, consumed) {
		const { decodeTree } = this;
		this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
		if (valueLength === 3) this.emitCodePoint(decodeTree[result + 2], consumed);
		return consumed;
	}
	/**
	* Signal to the parser that the end of the input was reached.
	*
	* Remaining data will be emitted and relevant errors will be produced.
	*
	* @returns The number of characters consumed.
	*/
	end() {
		var _a;
		switch (this.state) {
			case EntityDecoderState.NamedEntity: return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
			case EntityDecoderState.NumericDecimal: return this.emitNumericEntity(0, 2);
			case EntityDecoderState.NumericHex: return this.emitNumericEntity(0, 3);
			case EntityDecoderState.NumericStart:
				(_a = this.errors) === null || _a === void 0 || _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
				return 0;
			case EntityDecoderState.EntityStart: return 0;
		}
	}
};
/**
* Creates a function that decodes entities in a string.
*
* @param decodeTree The decode tree.
* @returns A function that decodes entities in a string.
*/
function getDecoder(decodeTree) {
	let ret = "";
	const decoder = new EntityDecoder(decodeTree, (str) => ret += fromCodePoint(str));
	return function decodeWithTrie(str, decodeMode) {
		let lastIndex = 0;
		let offset = 0;
		while ((offset = str.indexOf("&", offset)) >= 0) {
			ret += str.slice(lastIndex, offset);
			decoder.startEntity(decodeMode);
			const len = decoder.write(str, offset + 1);
			if (len < 0) {
				lastIndex = offset + decoder.end();
				break;
			}
			lastIndex = offset + len;
			offset = len === 0 ? lastIndex + 1 : lastIndex;
		}
		const result = ret + str.slice(lastIndex);
		ret = "";
		return result;
	};
}
/**
* Determines the branch of the current node that is taken given the current
* character. This function is used to traverse the trie.
*
* @param decodeTree The trie.
* @param current The current node.
* @param nodeIdx The index right after the current node and its value.
* @param char The current character.
* @returns The index of the next node, or -1 if no branch is taken.
*/
function determineBranch(decodeTree, current, nodeIdx, char) {
	const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
	const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
	if (branchCount === 0) return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
	if (jumpOffset) {
		const value = char - jumpOffset;
		return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
	}
	let lo = nodeIdx;
	let hi = lo + branchCount - 1;
	while (lo <= hi) {
		const mid = lo + hi >>> 1;
		const midVal = decodeTree[mid];
		if (midVal < char) lo = mid + 1;
		else if (midVal > char) hi = mid - 1;
		else return decodeTree[mid + branchCount];
	}
	return -1;
}
getDecoder(decode_data_html_default);
getDecoder(decode_data_xml_default);
//#endregion
//#region ../../node_modules/htmlparser2/lib/esm/Tokenizer.js
var CharCodes;
(function(CharCodes) {
	CharCodes[CharCodes["Tab"] = 9] = "Tab";
	CharCodes[CharCodes["NewLine"] = 10] = "NewLine";
	CharCodes[CharCodes["FormFeed"] = 12] = "FormFeed";
	CharCodes[CharCodes["CarriageReturn"] = 13] = "CarriageReturn";
	CharCodes[CharCodes["Space"] = 32] = "Space";
	CharCodes[CharCodes["ExclamationMark"] = 33] = "ExclamationMark";
	CharCodes[CharCodes["Number"] = 35] = "Number";
	CharCodes[CharCodes["Amp"] = 38] = "Amp";
	CharCodes[CharCodes["SingleQuote"] = 39] = "SingleQuote";
	CharCodes[CharCodes["DoubleQuote"] = 34] = "DoubleQuote";
	CharCodes[CharCodes["Dash"] = 45] = "Dash";
	CharCodes[CharCodes["Slash"] = 47] = "Slash";
	CharCodes[CharCodes["Zero"] = 48] = "Zero";
	CharCodes[CharCodes["Nine"] = 57] = "Nine";
	CharCodes[CharCodes["Semi"] = 59] = "Semi";
	CharCodes[CharCodes["Lt"] = 60] = "Lt";
	CharCodes[CharCodes["Eq"] = 61] = "Eq";
	CharCodes[CharCodes["Gt"] = 62] = "Gt";
	CharCodes[CharCodes["Questionmark"] = 63] = "Questionmark";
	CharCodes[CharCodes["UpperA"] = 65] = "UpperA";
	CharCodes[CharCodes["LowerA"] = 97] = "LowerA";
	CharCodes[CharCodes["UpperF"] = 70] = "UpperF";
	CharCodes[CharCodes["LowerF"] = 102] = "LowerF";
	CharCodes[CharCodes["UpperZ"] = 90] = "UpperZ";
	CharCodes[CharCodes["LowerZ"] = 122] = "LowerZ";
	CharCodes[CharCodes["LowerX"] = 120] = "LowerX";
	CharCodes[CharCodes["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
})(CharCodes || (CharCodes = {}));
/** All the states the tokenizer can be in. */
var State;
(function(State) {
	State[State["Text"] = 1] = "Text";
	State[State["BeforeTagName"] = 2] = "BeforeTagName";
	State[State["InTagName"] = 3] = "InTagName";
	State[State["InSelfClosingTag"] = 4] = "InSelfClosingTag";
	State[State["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
	State[State["InClosingTagName"] = 6] = "InClosingTagName";
	State[State["AfterClosingTagName"] = 7] = "AfterClosingTagName";
	State[State["BeforeAttributeName"] = 8] = "BeforeAttributeName";
	State[State["InAttributeName"] = 9] = "InAttributeName";
	State[State["AfterAttributeName"] = 10] = "AfterAttributeName";
	State[State["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
	State[State["InAttributeValueDq"] = 12] = "InAttributeValueDq";
	State[State["InAttributeValueSq"] = 13] = "InAttributeValueSq";
	State[State["InAttributeValueNq"] = 14] = "InAttributeValueNq";
	State[State["BeforeDeclaration"] = 15] = "BeforeDeclaration";
	State[State["InDeclaration"] = 16] = "InDeclaration";
	State[State["InProcessingInstruction"] = 17] = "InProcessingInstruction";
	State[State["BeforeComment"] = 18] = "BeforeComment";
	State[State["CDATASequence"] = 19] = "CDATASequence";
	State[State["InSpecialComment"] = 20] = "InSpecialComment";
	State[State["InCommentLike"] = 21] = "InCommentLike";
	State[State["BeforeSpecialS"] = 22] = "BeforeSpecialS";
	State[State["SpecialStartSequence"] = 23] = "SpecialStartSequence";
	State[State["InSpecialTag"] = 24] = "InSpecialTag";
	State[State["BeforeEntity"] = 25] = "BeforeEntity";
	State[State["BeforeNumericEntity"] = 26] = "BeforeNumericEntity";
	State[State["InNamedEntity"] = 27] = "InNamedEntity";
	State[State["InNumericEntity"] = 28] = "InNumericEntity";
	State[State["InHexEntity"] = 29] = "InHexEntity";
})(State || (State = {}));
function isWhitespace(c) {
	return c === CharCodes.Space || c === CharCodes.NewLine || c === CharCodes.Tab || c === CharCodes.FormFeed || c === CharCodes.CarriageReturn;
}
function isEndOfTagSection(c) {
	return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c);
}
function isNumber(c) {
	return c >= CharCodes.Zero && c <= CharCodes.Nine;
}
function isASCIIAlpha(c) {
	return c >= CharCodes.LowerA && c <= CharCodes.LowerZ || c >= CharCodes.UpperA && c <= CharCodes.UpperZ;
}
function isHexDigit(c) {
	return c >= CharCodes.UpperA && c <= CharCodes.UpperF || c >= CharCodes.LowerA && c <= CharCodes.LowerF;
}
var QuoteType;
(function(QuoteType) {
	QuoteType[QuoteType["NoValue"] = 0] = "NoValue";
	QuoteType[QuoteType["Unquoted"] = 1] = "Unquoted";
	QuoteType[QuoteType["Single"] = 2] = "Single";
	QuoteType[QuoteType["Double"] = 3] = "Double";
})(QuoteType || (QuoteType = {}));
/**
* Sequences used to match longer strings.
*
* We don't have `Script`, `Style`, or `Title` here. Instead, we re-use the *End
* sequences with an increased offset.
*/
const Sequences = {
	Cdata: new Uint8Array([
		67,
		68,
		65,
		84,
		65,
		91
	]),
	CdataEnd: new Uint8Array([
		93,
		93,
		62
	]),
	CommentEnd: new Uint8Array([
		45,
		45,
		62
	]),
	ScriptEnd: new Uint8Array([
		60,
		47,
		115,
		99,
		114,
		105,
		112,
		116
	]),
	StyleEnd: new Uint8Array([
		60,
		47,
		115,
		116,
		121,
		108,
		101
	]),
	TitleEnd: new Uint8Array([
		60,
		47,
		116,
		105,
		116,
		108,
		101
	])
};
var Tokenizer = class {
	constructor({ xmlMode = false, decodeEntities = true }, cbs) {
		this.cbs = cbs;
		/** The current state the tokenizer is in. */
		this.state = State.Text;
		/** The read buffer. */
		this.buffer = "";
		/** The beginning of the section that is currently being read. */
		this.sectionStart = 0;
		/** The index within the buffer that we are currently looking at. */
		this.index = 0;
		/** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */
		this.baseState = State.Text;
		/** For special parsing behavior inside of script and style tags. */
		this.isSpecial = false;
		/** Indicates whether the tokenizer has been paused. */
		this.running = true;
		/** The offset of the current buffer. */
		this.offset = 0;
		this.currentSequence = void 0;
		this.sequenceIndex = 0;
		this.trieIndex = 0;
		this.trieCurrent = 0;
		/** For named entities, the index of the value. For numeric entities, the code point. */
		this.entityResult = 0;
		this.entityExcess = 0;
		this.xmlMode = xmlMode;
		this.decodeEntities = decodeEntities;
		this.entityTrie = xmlMode ? decode_data_xml_default : decode_data_html_default;
	}
	reset() {
		this.state = State.Text;
		this.buffer = "";
		this.sectionStart = 0;
		this.index = 0;
		this.baseState = State.Text;
		this.currentSequence = void 0;
		this.running = true;
		this.offset = 0;
	}
	write(chunk) {
		this.offset += this.buffer.length;
		this.buffer = chunk;
		this.parse();
	}
	end() {
		if (this.running) this.finish();
	}
	pause() {
		this.running = false;
	}
	resume() {
		this.running = true;
		if (this.index < this.buffer.length + this.offset) this.parse();
	}
	/**
	* The current index within all of the written data.
	*/
	getIndex() {
		return this.index;
	}
	/**
	* The start of the current section.
	*/
	getSectionStart() {
		return this.sectionStart;
	}
	stateText(c) {
		if (c === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
			if (this.index > this.sectionStart) this.cbs.ontext(this.sectionStart, this.index);
			this.state = State.BeforeTagName;
			this.sectionStart = this.index;
		} else if (this.decodeEntities && c === CharCodes.Amp) this.state = State.BeforeEntity;
	}
	stateSpecialStartSequence(c) {
		const isEnd = this.sequenceIndex === this.currentSequence.length;
		if (!(isEnd ? isEndOfTagSection(c) : (c | 32) === this.currentSequence[this.sequenceIndex])) this.isSpecial = false;
		else if (!isEnd) {
			this.sequenceIndex++;
			return;
		}
		this.sequenceIndex = 0;
		this.state = State.InTagName;
		this.stateInTagName(c);
	}
	/** Look for an end tag. For <title> tags, also decode entities. */
	stateInSpecialTag(c) {
		if (this.sequenceIndex === this.currentSequence.length) {
			if (c === CharCodes.Gt || isWhitespace(c)) {
				const endOfText = this.index - this.currentSequence.length;
				if (this.sectionStart < endOfText) {
					const actualIndex = this.index;
					this.index = endOfText;
					this.cbs.ontext(this.sectionStart, endOfText);
					this.index = actualIndex;
				}
				this.isSpecial = false;
				this.sectionStart = endOfText + 2;
				this.stateInClosingTagName(c);
				return;
			}
			this.sequenceIndex = 0;
		}
		if ((c | 32) === this.currentSequence[this.sequenceIndex]) this.sequenceIndex += 1;
		else if (this.sequenceIndex === 0) {
			if (this.currentSequence === Sequences.TitleEnd) {
				if (this.decodeEntities && c === CharCodes.Amp) this.state = State.BeforeEntity;
			} else if (this.fastForwardTo(CharCodes.Lt)) this.sequenceIndex = 1;
		} else this.sequenceIndex = Number(c === CharCodes.Lt);
	}
	stateCDATASequence(c) {
		if (c === Sequences.Cdata[this.sequenceIndex]) {
			if (++this.sequenceIndex === Sequences.Cdata.length) {
				this.state = State.InCommentLike;
				this.currentSequence = Sequences.CdataEnd;
				this.sequenceIndex = 0;
				this.sectionStart = this.index + 1;
			}
		} else {
			this.sequenceIndex = 0;
			this.state = State.InDeclaration;
			this.stateInDeclaration(c);
		}
	}
	/**
	* When we wait for one specific character, we can speed things up
	* by skipping through the buffer until we find it.
	*
	* @returns Whether the character was found.
	*/
	fastForwardTo(c) {
		while (++this.index < this.buffer.length + this.offset) if (this.buffer.charCodeAt(this.index - this.offset) === c) return true;
		this.index = this.buffer.length + this.offset - 1;
		return false;
	}
	/**
	* Comments and CDATA end with `-->` and `]]>`.
	*
	* Their common qualities are:
	* - Their end sequences have a distinct character they start with.
	* - That character is then repeated, so we have to check multiple repeats.
	* - All characters but the start character of the sequence can be skipped.
	*/
	stateInCommentLike(c) {
		if (c === this.currentSequence[this.sequenceIndex]) {
			if (++this.sequenceIndex === this.currentSequence.length) {
				if (this.currentSequence === Sequences.CdataEnd) this.cbs.oncdata(this.sectionStart, this.index, 2);
				else this.cbs.oncomment(this.sectionStart, this.index, 2);
				this.sequenceIndex = 0;
				this.sectionStart = this.index + 1;
				this.state = State.Text;
			}
		} else if (this.sequenceIndex === 0) {
			if (this.fastForwardTo(this.currentSequence[0])) this.sequenceIndex = 1;
		} else if (c !== this.currentSequence[this.sequenceIndex - 1]) this.sequenceIndex = 0;
	}
	/**
	* HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
	*
	* XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
	* We allow anything that wouldn't end the tag.
	*/
	isTagStartChar(c) {
		return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
	}
	startSpecial(sequence, offset) {
		this.isSpecial = true;
		this.currentSequence = sequence;
		this.sequenceIndex = offset;
		this.state = State.SpecialStartSequence;
	}
	stateBeforeTagName(c) {
		if (c === CharCodes.ExclamationMark) {
			this.state = State.BeforeDeclaration;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.Questionmark) {
			this.state = State.InProcessingInstruction;
			this.sectionStart = this.index + 1;
		} else if (this.isTagStartChar(c)) {
			const lower = c | 32;
			this.sectionStart = this.index;
			if (!this.xmlMode && lower === Sequences.TitleEnd[2]) this.startSpecial(Sequences.TitleEnd, 3);
			else this.state = !this.xmlMode && lower === Sequences.ScriptEnd[2] ? State.BeforeSpecialS : State.InTagName;
		} else if (c === CharCodes.Slash) this.state = State.BeforeClosingTagName;
		else {
			this.state = State.Text;
			this.stateText(c);
		}
	}
	stateInTagName(c) {
		if (isEndOfTagSection(c)) {
			this.cbs.onopentagname(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		}
	}
	stateBeforeClosingTagName(c) {
		if (isWhitespace(c)) {} else if (c === CharCodes.Gt) this.state = State.Text;
		else {
			this.state = this.isTagStartChar(c) ? State.InClosingTagName : State.InSpecialComment;
			this.sectionStart = this.index;
		}
	}
	stateInClosingTagName(c) {
		if (c === CharCodes.Gt || isWhitespace(c)) {
			this.cbs.onclosetag(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.state = State.AfterClosingTagName;
			this.stateAfterClosingTagName(c);
		}
	}
	stateAfterClosingTagName(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.state = State.Text;
			this.baseState = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeAttributeName(c) {
		if (c === CharCodes.Gt) {
			this.cbs.onopentagend(this.index);
			if (this.isSpecial) {
				this.state = State.InSpecialTag;
				this.sequenceIndex = 0;
			} else this.state = State.Text;
			this.baseState = this.state;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.Slash) this.state = State.InSelfClosingTag;
		else if (!isWhitespace(c)) {
			this.state = State.InAttributeName;
			this.sectionStart = this.index;
		}
	}
	stateInSelfClosingTag(c) {
		if (c === CharCodes.Gt) {
			this.cbs.onselfclosingtag(this.index);
			this.state = State.Text;
			this.baseState = State.Text;
			this.sectionStart = this.index + 1;
			this.isSpecial = false;
		} else if (!isWhitespace(c)) {
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		}
	}
	stateInAttributeName(c) {
		if (c === CharCodes.Eq || isEndOfTagSection(c)) {
			this.cbs.onattribname(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.state = State.AfterAttributeName;
			this.stateAfterAttributeName(c);
		}
	}
	stateAfterAttributeName(c) {
		if (c === CharCodes.Eq) this.state = State.BeforeAttributeValue;
		else if (c === CharCodes.Slash || c === CharCodes.Gt) {
			this.cbs.onattribend(QuoteType.NoValue, this.index);
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		} else if (!isWhitespace(c)) {
			this.cbs.onattribend(QuoteType.NoValue, this.index);
			this.state = State.InAttributeName;
			this.sectionStart = this.index;
		}
	}
	stateBeforeAttributeValue(c) {
		if (c === CharCodes.DoubleQuote) {
			this.state = State.InAttributeValueDq;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.SingleQuote) {
			this.state = State.InAttributeValueSq;
			this.sectionStart = this.index + 1;
		} else if (!isWhitespace(c)) {
			this.sectionStart = this.index;
			this.state = State.InAttributeValueNq;
			this.stateInAttributeValueNoQuotes(c);
		}
	}
	handleInAttributeValue(c, quote) {
		if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
			this.cbs.onattribdata(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index);
			this.state = State.BeforeAttributeName;
		} else if (this.decodeEntities && c === CharCodes.Amp) {
			this.baseState = this.state;
			this.state = State.BeforeEntity;
		}
	}
	stateInAttributeValueDoubleQuotes(c) {
		this.handleInAttributeValue(c, CharCodes.DoubleQuote);
	}
	stateInAttributeValueSingleQuotes(c) {
		this.handleInAttributeValue(c, CharCodes.SingleQuote);
	}
	stateInAttributeValueNoQuotes(c) {
		if (isWhitespace(c) || c === CharCodes.Gt) {
			this.cbs.onattribdata(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.cbs.onattribend(QuoteType.Unquoted, this.index);
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		} else if (this.decodeEntities && c === CharCodes.Amp) {
			this.baseState = this.state;
			this.state = State.BeforeEntity;
		}
	}
	stateBeforeDeclaration(c) {
		if (c === CharCodes.OpeningSquareBracket) {
			this.state = State.CDATASequence;
			this.sequenceIndex = 0;
		} else this.state = c === CharCodes.Dash ? State.BeforeComment : State.InDeclaration;
	}
	stateInDeclaration(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.ondeclaration(this.sectionStart, this.index);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateInProcessingInstruction(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.onprocessinginstruction(this.sectionStart, this.index);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeComment(c) {
		if (c === CharCodes.Dash) {
			this.state = State.InCommentLike;
			this.currentSequence = Sequences.CommentEnd;
			this.sequenceIndex = 2;
			this.sectionStart = this.index + 1;
		} else this.state = State.InDeclaration;
	}
	stateInSpecialComment(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.oncomment(this.sectionStart, this.index, 0);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeSpecialS(c) {
		const lower = c | 32;
		if (lower === Sequences.ScriptEnd[3]) this.startSpecial(Sequences.ScriptEnd, 4);
		else if (lower === Sequences.StyleEnd[3]) this.startSpecial(Sequences.StyleEnd, 4);
		else {
			this.state = State.InTagName;
			this.stateInTagName(c);
		}
	}
	stateBeforeEntity(c) {
		this.entityExcess = 1;
		this.entityResult = 0;
		if (c === CharCodes.Number) this.state = State.BeforeNumericEntity;
		else if (c === CharCodes.Amp) {} else {
			this.trieIndex = 0;
			this.trieCurrent = this.entityTrie[0];
			this.state = State.InNamedEntity;
			this.stateInNamedEntity(c);
		}
	}
	stateInNamedEntity(c) {
		this.entityExcess += 1;
		this.trieIndex = determineBranch(this.entityTrie, this.trieCurrent, this.trieIndex + 1, c);
		if (this.trieIndex < 0) {
			this.emitNamedEntity();
			this.index--;
			return;
		}
		this.trieCurrent = this.entityTrie[this.trieIndex];
		const masked = this.trieCurrent & BinTrieFlags.VALUE_LENGTH;
		if (masked) {
			const valueLength = (masked >> 14) - 1;
			if (!this.allowLegacyEntity() && c !== CharCodes.Semi) this.trieIndex += valueLength;
			else {
				const entityStart = this.index - this.entityExcess + 1;
				if (entityStart > this.sectionStart) this.emitPartial(this.sectionStart, entityStart);
				this.entityResult = this.trieIndex;
				this.trieIndex += valueLength;
				this.entityExcess = 0;
				this.sectionStart = this.index + 1;
				if (valueLength === 0) this.emitNamedEntity();
			}
		}
	}
	emitNamedEntity() {
		this.state = this.baseState;
		if (this.entityResult === 0) return;
		switch ((this.entityTrie[this.entityResult] & BinTrieFlags.VALUE_LENGTH) >> 14) {
			case 1:
				this.emitCodePoint(this.entityTrie[this.entityResult] & ~BinTrieFlags.VALUE_LENGTH);
				break;
			case 2:
				this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
				break;
			case 3:
				this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
				this.emitCodePoint(this.entityTrie[this.entityResult + 2]);
		}
	}
	stateBeforeNumericEntity(c) {
		if ((c | 32) === CharCodes.LowerX) {
			this.entityExcess++;
			this.state = State.InHexEntity;
		} else {
			this.state = State.InNumericEntity;
			this.stateInNumericEntity(c);
		}
	}
	emitNumericEntity(strict) {
		const entityStart = this.index - this.entityExcess - 1;
		if (entityStart + 2 + Number(this.state === State.InHexEntity) !== this.index) {
			if (entityStart > this.sectionStart) this.emitPartial(this.sectionStart, entityStart);
			this.sectionStart = this.index + Number(strict);
			this.emitCodePoint(replaceCodePoint(this.entityResult));
		}
		this.state = this.baseState;
	}
	stateInNumericEntity(c) {
		if (c === CharCodes.Semi) this.emitNumericEntity(true);
		else if (isNumber(c)) {
			this.entityResult = this.entityResult * 10 + (c - CharCodes.Zero);
			this.entityExcess++;
		} else {
			if (this.allowLegacyEntity()) this.emitNumericEntity(false);
			else this.state = this.baseState;
			this.index--;
		}
	}
	stateInHexEntity(c) {
		if (c === CharCodes.Semi) this.emitNumericEntity(true);
		else if (isNumber(c)) {
			this.entityResult = this.entityResult * 16 + (c - CharCodes.Zero);
			this.entityExcess++;
		} else if (isHexDigit(c)) {
			this.entityResult = this.entityResult * 16 + ((c | 32) - CharCodes.LowerA + 10);
			this.entityExcess++;
		} else {
			if (this.allowLegacyEntity()) this.emitNumericEntity(false);
			else this.state = this.baseState;
			this.index--;
		}
	}
	allowLegacyEntity() {
		return !this.xmlMode && (this.baseState === State.Text || this.baseState === State.InSpecialTag);
	}
	/**
	* Remove data that has already been consumed from the buffer.
	*/
	cleanup() {
		if (this.running && this.sectionStart !== this.index) {
			if (this.state === State.Text || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
				this.cbs.ontext(this.sectionStart, this.index);
				this.sectionStart = this.index;
			} else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
				this.cbs.onattribdata(this.sectionStart, this.index);
				this.sectionStart = this.index;
			}
		}
	}
	shouldContinue() {
		return this.index < this.buffer.length + this.offset && this.running;
	}
	/**
	* Iterates through the buffer, calling the function corresponding to the current state.
	*
	* States that are more likely to be hit are higher up, as a performance improvement.
	*/
	parse() {
		while (this.shouldContinue()) {
			const c = this.buffer.charCodeAt(this.index - this.offset);
			switch (this.state) {
				case State.Text:
					this.stateText(c);
					break;
				case State.SpecialStartSequence:
					this.stateSpecialStartSequence(c);
					break;
				case State.InSpecialTag:
					this.stateInSpecialTag(c);
					break;
				case State.CDATASequence:
					this.stateCDATASequence(c);
					break;
				case State.InAttributeValueDq:
					this.stateInAttributeValueDoubleQuotes(c);
					break;
				case State.InAttributeName:
					this.stateInAttributeName(c);
					break;
				case State.InCommentLike:
					this.stateInCommentLike(c);
					break;
				case State.InSpecialComment:
					this.stateInSpecialComment(c);
					break;
				case State.BeforeAttributeName:
					this.stateBeforeAttributeName(c);
					break;
				case State.InTagName:
					this.stateInTagName(c);
					break;
				case State.InClosingTagName:
					this.stateInClosingTagName(c);
					break;
				case State.BeforeTagName:
					this.stateBeforeTagName(c);
					break;
				case State.AfterAttributeName:
					this.stateAfterAttributeName(c);
					break;
				case State.InAttributeValueSq:
					this.stateInAttributeValueSingleQuotes(c);
					break;
				case State.BeforeAttributeValue:
					this.stateBeforeAttributeValue(c);
					break;
				case State.BeforeClosingTagName:
					this.stateBeforeClosingTagName(c);
					break;
				case State.AfterClosingTagName:
					this.stateAfterClosingTagName(c);
					break;
				case State.BeforeSpecialS:
					this.stateBeforeSpecialS(c);
					break;
				case State.InAttributeValueNq:
					this.stateInAttributeValueNoQuotes(c);
					break;
				case State.InSelfClosingTag:
					this.stateInSelfClosingTag(c);
					break;
				case State.InDeclaration:
					this.stateInDeclaration(c);
					break;
				case State.BeforeDeclaration:
					this.stateBeforeDeclaration(c);
					break;
				case State.BeforeComment:
					this.stateBeforeComment(c);
					break;
				case State.InProcessingInstruction:
					this.stateInProcessingInstruction(c);
					break;
				case State.InNamedEntity:
					this.stateInNamedEntity(c);
					break;
				case State.BeforeEntity:
					this.stateBeforeEntity(c);
					break;
				case State.InHexEntity:
					this.stateInHexEntity(c);
					break;
				case State.InNumericEntity:
					this.stateInNumericEntity(c);
					break;
				default: this.stateBeforeNumericEntity(c);
			}
			this.index++;
		}
		this.cleanup();
	}
	finish() {
		if (this.state === State.InNamedEntity) this.emitNamedEntity();
		if (this.sectionStart < this.index) this.handleTrailingData();
		this.cbs.onend();
	}
	/** Handle any trailing data. */
	handleTrailingData() {
		const endIndex = this.buffer.length + this.offset;
		if (this.state === State.InCommentLike) if (this.currentSequence === Sequences.CdataEnd) this.cbs.oncdata(this.sectionStart, endIndex, 0);
		else this.cbs.oncomment(this.sectionStart, endIndex, 0);
		else if (this.state === State.InNumericEntity && this.allowLegacyEntity()) this.emitNumericEntity(false);
		else if (this.state === State.InHexEntity && this.allowLegacyEntity()) this.emitNumericEntity(false);
		else if (this.state === State.InTagName || this.state === State.BeforeAttributeName || this.state === State.BeforeAttributeValue || this.state === State.AfterAttributeName || this.state === State.InAttributeName || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueDq || this.state === State.InAttributeValueNq || this.state === State.InClosingTagName) {} else this.cbs.ontext(this.sectionStart, endIndex);
	}
	emitPartial(start, endIndex) {
		if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) this.cbs.onattribdata(start, endIndex);
		else this.cbs.ontext(start, endIndex);
	}
	emitCodePoint(cp) {
		if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) this.cbs.onattribentity(cp);
		else this.cbs.ontextentity(cp);
	}
};
//#endregion
//#region ../../node_modules/htmlparser2/lib/esm/Parser.js
const formTags = new Set([
	"input",
	"option",
	"optgroup",
	"select",
	"button",
	"datalist",
	"textarea"
]);
const pTag = new Set(["p"]);
const tableSectionTags = new Set(["thead", "tbody"]);
const ddtTags = new Set(["dd", "dt"]);
const rtpTags = new Set(["rt", "rp"]);
const openImpliesClose = new Map([
	["tr", new Set([
		"tr",
		"th",
		"td"
	])],
	["th", new Set(["th"])],
	["td", new Set([
		"thead",
		"th",
		"td"
	])],
	["body", new Set([
		"head",
		"link",
		"script"
	])],
	["li", new Set(["li"])],
	["p", pTag],
	["h1", pTag],
	["h2", pTag],
	["h3", pTag],
	["h4", pTag],
	["h5", pTag],
	["h6", pTag],
	["select", formTags],
	["input", formTags],
	["output", formTags],
	["button", formTags],
	["datalist", formTags],
	["textarea", formTags],
	["option", new Set(["option"])],
	["optgroup", new Set(["optgroup", "option"])],
	["dd", ddtTags],
	["dt", ddtTags],
	["address", pTag],
	["article", pTag],
	["aside", pTag],
	["blockquote", pTag],
	["details", pTag],
	["div", pTag],
	["dl", pTag],
	["fieldset", pTag],
	["figcaption", pTag],
	["figure", pTag],
	["footer", pTag],
	["form", pTag],
	["header", pTag],
	["hr", pTag],
	["main", pTag],
	["nav", pTag],
	["ol", pTag],
	["pre", pTag],
	["section", pTag],
	["table", pTag],
	["ul", pTag],
	["rt", rtpTags],
	["rp", rtpTags],
	["tbody", tableSectionTags],
	["tfoot", tableSectionTags]
]);
const voidElements = new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
const foreignContextElements = new Set(["math", "svg"]);
const htmlIntegrationElements = new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignobject",
	"desc",
	"title"
]);
const reNameEnd = /\s|\//;
var Parser = class {
	constructor(cbs, options = {}) {
		var _a, _b, _c, _d, _e;
		this.options = options;
		/** The start index of the last event. */
		this.startIndex = 0;
		/** The end index of the last event. */
		this.endIndex = 0;
		/**
		* Store the start index of the current open tag,
		* so we can update the start index for attributes.
		*/
		this.openTagStart = 0;
		this.tagname = "";
		this.attribname = "";
		this.attribvalue = "";
		this.attribs = null;
		this.stack = [];
		this.foreignContext = [];
		this.buffers = [];
		this.bufferOffset = 0;
		/** The index of the last written buffer. Used when resuming after a `pause()`. */
		this.writeIndex = 0;
		/** Indicates whether the parser has finished running / `.end` has been called. */
		this.ended = false;
		this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
		this.lowerCaseTagNames = (_a = options.lowerCaseTags) !== null && _a !== void 0 ? _a : !options.xmlMode;
		this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : !options.xmlMode;
		this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer)(this.options, this);
		(_e = (_d = this.cbs).onparserinit) === null || _e === void 0 || _e.call(_d, this);
	}
	/** @internal */
	ontext(start, endIndex) {
		var _a, _b;
		const data = this.getSlice(start, endIndex);
		this.endIndex = endIndex - 1;
		(_b = (_a = this.cbs).ontext) === null || _b === void 0 || _b.call(_a, data);
		this.startIndex = endIndex;
	}
	/** @internal */
	ontextentity(cp) {
		var _a, _b;
		const index = this.tokenizer.getSectionStart();
		this.endIndex = index - 1;
		(_b = (_a = this.cbs).ontext) === null || _b === void 0 || _b.call(_a, fromCodePoint(cp));
		this.startIndex = index;
	}
	isVoidElement(name) {
		return !this.options.xmlMode && voidElements.has(name);
	}
	/** @internal */
	onopentagname(start, endIndex) {
		this.endIndex = endIndex;
		let name = this.getSlice(start, endIndex);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		this.emitOpenTag(name);
	}
	emitOpenTag(name) {
		var _a, _b, _c, _d;
		this.openTagStart = this.startIndex;
		this.tagname = name;
		const impliesClose = !this.options.xmlMode && openImpliesClose.get(name);
		if (impliesClose) while (this.stack.length > 0 && impliesClose.has(this.stack[this.stack.length - 1])) {
			const element = this.stack.pop();
			(_b = (_a = this.cbs).onclosetag) === null || _b === void 0 || _b.call(_a, element, true);
		}
		if (!this.isVoidElement(name)) {
			this.stack.push(name);
			if (foreignContextElements.has(name)) this.foreignContext.push(true);
			else if (htmlIntegrationElements.has(name)) this.foreignContext.push(false);
		}
		(_d = (_c = this.cbs).onopentagname) === null || _d === void 0 || _d.call(_c, name);
		if (this.cbs.onopentag) this.attribs = {};
	}
	endOpenTag(isImplied) {
		var _a, _b;
		this.startIndex = this.openTagStart;
		if (this.attribs) {
			(_b = (_a = this.cbs).onopentag) === null || _b === void 0 || _b.call(_a, this.tagname, this.attribs, isImplied);
			this.attribs = null;
		}
		if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) this.cbs.onclosetag(this.tagname, true);
		this.tagname = "";
	}
	/** @internal */
	onopentagend(endIndex) {
		this.endIndex = endIndex;
		this.endOpenTag(false);
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onclosetag(start, endIndex) {
		var _a, _b, _c, _d, _e, _f;
		this.endIndex = endIndex;
		let name = this.getSlice(start, endIndex);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		if (foreignContextElements.has(name) || htmlIntegrationElements.has(name)) this.foreignContext.pop();
		if (!this.isVoidElement(name)) {
			const pos = this.stack.lastIndexOf(name);
			if (pos !== -1) if (this.cbs.onclosetag) {
				let count = this.stack.length - pos;
				while (count--) this.cbs.onclosetag(this.stack.pop(), count !== 0);
			} else this.stack.length = pos;
			else if (!this.options.xmlMode && name === "p") {
				this.emitOpenTag("p");
				this.closeCurrentTag(true);
			}
		} else if (!this.options.xmlMode && name === "br") {
			(_b = (_a = this.cbs).onopentagname) === null || _b === void 0 || _b.call(_a, "br");
			(_d = (_c = this.cbs).onopentag) === null || _d === void 0 || _d.call(_c, "br", {}, true);
			(_f = (_e = this.cbs).onclosetag) === null || _f === void 0 || _f.call(_e, "br", false);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onselfclosingtag(endIndex) {
		this.endIndex = endIndex;
		if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
			this.closeCurrentTag(false);
			this.startIndex = endIndex + 1;
		} else this.onopentagend(endIndex);
	}
	closeCurrentTag(isOpenImplied) {
		var _a, _b;
		const name = this.tagname;
		this.endOpenTag(isOpenImplied);
		if (this.stack[this.stack.length - 1] === name) {
			(_b = (_a = this.cbs).onclosetag) === null || _b === void 0 || _b.call(_a, name, !isOpenImplied);
			this.stack.pop();
		}
	}
	/** @internal */
	onattribname(start, endIndex) {
		this.startIndex = start;
		const name = this.getSlice(start, endIndex);
		this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
	}
	/** @internal */
	onattribdata(start, endIndex) {
		this.attribvalue += this.getSlice(start, endIndex);
	}
	/** @internal */
	onattribentity(cp) {
		this.attribvalue += fromCodePoint(cp);
	}
	/** @internal */
	onattribend(quote, endIndex) {
		var _a, _b;
		this.endIndex = endIndex;
		(_b = (_a = this.cbs).onattribute) === null || _b === void 0 || _b.call(_a, this.attribname, this.attribvalue, quote === QuoteType.Double ? "\"" : quote === QuoteType.Single ? "'" : quote === QuoteType.NoValue ? void 0 : null);
		if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) this.attribs[this.attribname] = this.attribvalue;
		this.attribvalue = "";
	}
	getInstructionName(value) {
		const index = value.search(reNameEnd);
		let name = index < 0 ? value : value.substr(0, index);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		return name;
	}
	/** @internal */
	ondeclaration(start, endIndex) {
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex);
		if (this.cbs.onprocessinginstruction) {
			const name = this.getInstructionName(value);
			this.cbs.onprocessinginstruction(`!${name}`, `!${value}`);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onprocessinginstruction(start, endIndex) {
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex);
		if (this.cbs.onprocessinginstruction) {
			const name = this.getInstructionName(value);
			this.cbs.onprocessinginstruction(`?${name}`, `?${value}`);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	oncomment(start, endIndex, offset) {
		var _a, _b, _c, _d;
		this.endIndex = endIndex;
		(_b = (_a = this.cbs).oncomment) === null || _b === void 0 || _b.call(_a, this.getSlice(start, endIndex - offset));
		(_d = (_c = this.cbs).oncommentend) === null || _d === void 0 || _d.call(_c);
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	oncdata(start, endIndex, offset) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex - offset);
		if (this.options.xmlMode || this.options.recognizeCDATA) {
			(_b = (_a = this.cbs).oncdatastart) === null || _b === void 0 || _b.call(_a);
			(_d = (_c = this.cbs).ontext) === null || _d === void 0 || _d.call(_c, value);
			(_f = (_e = this.cbs).oncdataend) === null || _f === void 0 || _f.call(_e);
		} else {
			(_h = (_g = this.cbs).oncomment) === null || _h === void 0 || _h.call(_g, `[CDATA[${value}]]`);
			(_k = (_j = this.cbs).oncommentend) === null || _k === void 0 || _k.call(_j);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onend() {
		var _a, _b;
		if (this.cbs.onclosetag) {
			this.endIndex = this.startIndex;
			for (let index = this.stack.length; index > 0; this.cbs.onclosetag(this.stack[--index], true));
		}
		(_b = (_a = this.cbs).onend) === null || _b === void 0 || _b.call(_a);
	}
	/**
	* Resets the parser to a blank state, ready to parse a new HTML document
	*/
	reset() {
		var _a, _b, _c, _d;
		(_b = (_a = this.cbs).onreset) === null || _b === void 0 || _b.call(_a);
		this.tokenizer.reset();
		this.tagname = "";
		this.attribname = "";
		this.attribs = null;
		this.stack.length = 0;
		this.startIndex = 0;
		this.endIndex = 0;
		(_d = (_c = this.cbs).onparserinit) === null || _d === void 0 || _d.call(_c, this);
		this.buffers.length = 0;
		this.bufferOffset = 0;
		this.writeIndex = 0;
		this.ended = false;
	}
	/**
	* Resets the parser, then parses a complete document and
	* pushes it to the handler.
	*
	* @param data Document to parse.
	*/
	parseComplete(data) {
		this.reset();
		this.end(data);
	}
	getSlice(start, end) {
		while (start - this.bufferOffset >= this.buffers[0].length) this.shiftBuffer();
		let slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
		while (end - this.bufferOffset > this.buffers[0].length) {
			this.shiftBuffer();
			slice += this.buffers[0].slice(0, end - this.bufferOffset);
		}
		return slice;
	}
	shiftBuffer() {
		this.bufferOffset += this.buffers[0].length;
		this.writeIndex--;
		this.buffers.shift();
	}
	/**
	* Parses a chunk of data and calls the corresponding callbacks.
	*
	* @param chunk Chunk to parse.
	*/
	write(chunk) {
		var _a, _b;
		if (this.ended) {
			(_b = (_a = this.cbs).onerror) === null || _b === void 0 || _b.call(_a, /* @__PURE__ */ new Error(".write() after done!"));
			return;
		}
		this.buffers.push(chunk);
		if (this.tokenizer.running) {
			this.tokenizer.write(chunk);
			this.writeIndex++;
		}
	}
	/**
	* Parses the end of the buffer and clears the stack, calls onend.
	*
	* @param chunk Optional final chunk to parse.
	*/
	end(chunk) {
		var _a, _b;
		if (this.ended) {
			(_b = (_a = this.cbs).onerror) === null || _b === void 0 || _b.call(_a, /* @__PURE__ */ new Error(".end() after done!"));
			return;
		}
		if (chunk) this.write(chunk);
		this.ended = true;
		this.tokenizer.end();
	}
	/**
	* Pauses parsing. The parser won't emit events until `resume` is called.
	*/
	pause() {
		this.tokenizer.pause();
	}
	/**
	* Resumes parsing after `pause` was called.
	*/
	resume() {
		this.tokenizer.resume();
		while (this.tokenizer.running && this.writeIndex < this.buffers.length) this.tokenizer.write(this.buffers[this.writeIndex++]);
		if (this.ended) this.tokenizer.end();
	}
	/**
	* Alias of `write`, for backwards compatibility.
	*
	* @param chunk Chunk to parse.
	* @deprecated
	*/
	parseChunk(chunk) {
		this.write(chunk);
	}
	/**
	* Alias of `end`, for backwards compatibility.
	*
	* @param chunk Optional final chunk to parse.
	* @deprecated
	*/
	done(chunk) {
		this.end(chunk);
	}
};
//#endregion
//#region ../../node_modules/entities/lib/esm/escape.js
const xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
const xmlCodeMap = new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[39, "&apos;"],
	[60, "&lt;"],
	[62, "&gt;"]
]);
const getCodePoint = String.prototype.codePointAt != null ? (str, index) => str.codePointAt(index) : (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index);
/**
* Encodes all non-ASCII characters, as well as characters not valid in XML
* documents using XML entities.
*
* If a character has no equivalent entity, a
* numeric hexadecimal reference (eg. `&#xfc;`) will be used.
*/
function encodeXML(str) {
	let ret = "";
	let lastIdx = 0;
	let match;
	while ((match = xmlReplacer.exec(str)) !== null) {
		const i = match.index;
		const char = str.charCodeAt(i);
		const next = xmlCodeMap.get(char);
		if (next !== void 0) {
			ret += str.substring(lastIdx, i) + next;
			lastIdx = i + 1;
		} else {
			ret += `${str.substring(lastIdx, i)}&#x${getCodePoint(str, i).toString(16)};`;
			lastIdx = xmlReplacer.lastIndex += Number((char & 64512) === 55296);
		}
	}
	return ret + str.substr(lastIdx);
}
/**
* Creates a function that escapes all characters matched by the given regular
* expression using the given map of characters to escape to their entities.
*
* @param regex Regular expression to match characters to escape.
* @param map Map of characters to escape to their entities.
*
* @returns Function that escapes all characters matched by the given regular
* expression using the given map of characters to escape to their entities.
*/
function getEscaper(regex, map) {
	return function escape(data) {
		let match;
		let lastIdx = 0;
		let result = "";
		while (match = regex.exec(data)) {
			if (lastIdx !== match.index) result += data.substring(lastIdx, match.index);
			result += map.get(match[0].charCodeAt(0));
			lastIdx = match.index + 1;
		}
		return result + data.substring(lastIdx);
	};
}
getEscaper(/[&<>'"]/g, xmlCodeMap);
/**
* Encodes all characters that have to be escaped in HTML attributes,
* following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
*
* @param data String to escape.
*/
const escapeAttribute = getEscaper(/["&\u00A0]/g, new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[160, "&nbsp;"]
]));
/**
* Encodes all characters that have to be escaped in HTML text,
* following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
*
* @param data String to escape.
*/
const escapeText = getEscaper(/[&<>\u00A0]/g, new Map([
	[38, "&amp;"],
	[60, "&lt;"],
	[62, "&gt;"],
	[160, "&nbsp;"]
]));
//#endregion
//#region ../../node_modules/dom-serializer/lib/esm/foreignNames.js
const elementNames = new Map([
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"clipPath",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"foreignObject",
	"glyphRef",
	"linearGradient",
	"radialGradient",
	"textPath"
].map((val) => [val.toLowerCase(), val]));
const attributeNames = new Map([
	"definitionURL",
	"attributeName",
	"attributeType",
	"baseFrequency",
	"baseProfile",
	"calcMode",
	"clipPathUnits",
	"diffuseConstant",
	"edgeMode",
	"filterUnits",
	"glyphRef",
	"gradientTransform",
	"gradientUnits",
	"kernelMatrix",
	"kernelUnitLength",
	"keyPoints",
	"keySplines",
	"keyTimes",
	"lengthAdjust",
	"limitingConeAngle",
	"markerHeight",
	"markerUnits",
	"markerWidth",
	"maskContentUnits",
	"maskUnits",
	"numOctaves",
	"pathLength",
	"patternContentUnits",
	"patternTransform",
	"patternUnits",
	"pointsAtX",
	"pointsAtY",
	"pointsAtZ",
	"preserveAlpha",
	"preserveAspectRatio",
	"primitiveUnits",
	"refX",
	"refY",
	"repeatCount",
	"repeatDur",
	"requiredExtensions",
	"requiredFeatures",
	"specularConstant",
	"specularExponent",
	"spreadMethod",
	"startOffset",
	"stdDeviation",
	"stitchTiles",
	"surfaceScale",
	"systemLanguage",
	"tableValues",
	"targetX",
	"targetY",
	"textLength",
	"viewBox",
	"viewTarget",
	"xChannelSelector",
	"yChannelSelector",
	"zoomAndPan"
].map((val) => [val.toLowerCase(), val]));
//#endregion
//#region ../../node_modules/dom-serializer/lib/esm/index.js
/**
* Mixed-case SVG and MathML tags & attributes
* recognized by the HTML parser.
*
* @see https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
*/
const unencodedElements = new Set([
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
]);
function replaceQuotes(value) {
	return value.replace(/"/g, "&quot;");
}
/**
* Format attributes
*/
function formatAttributes(attributes, opts) {
	var _a;
	if (!attributes) return;
	const encode = ((_a = opts.encodeEntities) !== null && _a !== void 0 ? _a : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute;
	return Object.keys(attributes).map((key) => {
		var _a, _b;
		const value = (_a = attributes[key]) !== null && _a !== void 0 ? _a : "";
		if (opts.xmlMode === "foreign") key = (_b = attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
		if (!opts.emptyAttrs && !opts.xmlMode && value === "") return key;
		return `${key}="${encode(value)}"`;
	}).join(" ");
}
/**
* Self-enclosing tags
*/
const singleTag = new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
/**
* Renders a DOM node or an array of DOM nodes to a string.
*
* Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
*
* @param node Node to be rendered.
* @param options Changes serialization behavior
*/
function render$1(node, options = {}) {
	const nodes = "length" in node ? node : [node];
	let output = "";
	for (let i = 0; i < nodes.length; i++) output += renderNode(nodes[i], options);
	return output;
}
function renderNode(node, options) {
	switch (node.type) {
		case Root: return render$1(node.children, options);
		case Doctype:
		case Directive: return renderDirective(node);
		case Comment$1: return renderComment(node);
		case CDATA$1: return renderCdata(node);
		case Script:
		case Style:
		case Tag: return renderTag(node, options);
		case Text$1: return renderText(node, options);
	}
}
const foreignModeIntegrationPoints = new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignObject",
	"desc",
	"title"
]);
const foreignElements = new Set(["svg", "math"]);
function renderTag(elem, opts) {
	var _a;
	if (opts.xmlMode === "foreign") {
		elem.name = (_a = elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
		if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) opts = {
			...opts,
			xmlMode: false
		};
	}
	if (!opts.xmlMode && foreignElements.has(elem.name)) opts = {
		...opts,
		xmlMode: "foreign"
	};
	let tag = `<${elem.name}`;
	const attribs = formatAttributes(elem.attribs, opts);
	if (attribs) tag += ` ${attribs}`;
	if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
		if (!opts.xmlMode) tag += " ";
		tag += "/>";
	} else {
		tag += ">";
		if (elem.children.length > 0) tag += render$1(elem.children, opts);
		if (opts.xmlMode || !singleTag.has(elem.name)) tag += `</${elem.name}>`;
	}
	return tag;
}
function renderDirective(elem) {
	return `<${elem.data}>`;
}
function renderText(elem, opts) {
	var _a;
	let data = elem.data || "";
	if (((_a = opts.encodeEntities) !== null && _a !== void 0 ? _a : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) data = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data) : escapeText(data);
	return data;
}
function renderCdata(elem) {
	return `<![CDATA[${elem.children[0].data}]]>`;
}
function renderComment(elem) {
	return `<!--${elem.data}-->`;
}
//#endregion
//#region ../../node_modules/htmlparser2/lib/esm/index.js
/**
* Parses the data, returns the resulting document.
*
* @param data The data that should be parsed.
* @param options Optional options for the parser and DOM builder.
*/
function parseDocument(data, options) {
	const handler = new DomHandler(void 0, options);
	new Parser(handler, options).end(data);
	return handler.root;
}
//#endregion
//#region ../../node_modules/html-to-text/lib/html-to-text.mjs
var import_cjs = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value) && !isSpecial(value);
	};
	function isNonNullObject(value) {
		return !!value && typeof value === "object";
	}
	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);
		return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
	}
	var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.element") : 60103;
	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE;
	}
	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {};
	}
	function cloneUnlessOtherwiseSpecified(value, options) {
		return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
	}
	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options);
		});
	}
	function getMergeFunction(key, options) {
		if (!options.customMerge) return deepmerge;
		var customMerge = options.customMerge(key);
		return typeof customMerge === "function" ? customMerge : deepmerge;
	}
	function getEnumerableOwnPropertySymbols(target) {
		return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol);
		}) : [];
	}
	function getKeys(target) {
		return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
	}
	function propertyIsOnObject(object, property) {
		try {
			return property in object;
		} catch (_) {
			return false;
		}
	}
	function propertyIsUnsafe(target, key) {
		return propertyIsOnObject(target, key) && !(Object.hasOwnProperty.call(target, key) && Object.propertyIsEnumerable.call(target, key));
	}
	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
		getKeys(source).forEach(function(key) {
			if (propertyIsUnsafe(target, key)) return;
			if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
			else destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		});
		return destination;
	}
	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;
		options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
		var sourceIsArray = Array.isArray(source);
		if (!(sourceIsArray === Array.isArray(target))) return cloneUnlessOtherwiseSpecified(source, options);
		else if (sourceIsArray) return options.arrayMerge(target, source, options);
		else return mergeObject(target, source, options);
	}
	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) throw new Error("first argument should be an array");
		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options);
		}, {});
	};
	module.exports = deepmerge;
})))(), 1);
/**
* Make a recursive function that will only run to a given depth
* and switches to an alternative function at that depth. \
* No limitation if `n` is `undefined` (Just wraps `f` in that case).
*
* @param   { number | undefined } n   Allowed depth of recursion. `undefined` for no limitation.
* @param   { Function }           f   Function that accepts recursive callback as the first argument.
* @param   { Function }           [g] Function to run instead, when maximum depth was reached. Do nothing by default.
* @returns { Function }
*/
function limitedDepthRecursive(n, f, g = () => void 0) {
	if (n === void 0) {
		const f1 = function(...args) {
			return f(f1, ...args);
		};
		return f1;
	}
	if (n >= 0) return function(...args) {
		return f(limitedDepthRecursive(n - 1, f, g), ...args);
	};
	return g;
}
/**
* Return the same string or a substring with
* the given character occurrences removed from each side.
*
* @param   { string } str  A string to trim.
* @param   { string } char A character to be trimmed.
* @returns { string }
*/
function trimCharacter(str, char) {
	let start = 0;
	let end = str.length;
	while (start < end && str[start] === char) ++start;
	while (end > start && str[end - 1] === char) --end;
	return start > 0 || end < str.length ? str.substring(start, end) : str;
}
/**
* Return the same string or a substring with
* the given character occurrences removed from the end only.
*
* @param   { string } str  A string to trim.
* @param   { string } char A character to be trimmed.
* @returns { string }
*/
function trimCharacterEnd(str, char) {
	let end = str.length;
	while (end > 0 && str[end - 1] === char) --end;
	return end < str.length ? str.substring(0, end) : str;
}
/**
* Return a new string will all characters replaced with unicode escape sequences.
* This extreme kind of escaping can used to be safely compose regular expressions.
*
* @param { string } str A string to escape.
* @returns { string } A string of unicode escape sequences.
*/
function unicodeEscape(str) {
	return str.replace(/[\s\S]/g, (c) => "\\u" + c.charCodeAt().toString(16).padStart(4, "0"));
}
/**
* Deduplicate an array by a given key callback.
* Item properties are merged recursively and with the preference for last defined values.
* Of items with the same key, merged item takes the place of the last item,
* others are omitted.
*
* @param { any[] } items An array to deduplicate.
* @param { (x: any) => string } getKey Callback to get a value that distinguishes unique items.
* @returns { any[] }
*/
function mergeDuplicatesPreferLast(items, getKey) {
	const map = /* @__PURE__ */ new Map();
	for (let i = items.length; i-- > 0;) {
		const item = items[i];
		const key = getKey(item);
		map.set(key, map.has(key) ? (0, import_cjs.default)(item, map.get(key), { arrayMerge: overwriteMerge$1 }) : item);
	}
	return [...map.values()].reverse();
}
const overwriteMerge$1 = (acc, src, options) => [...src];
/**
* Get a nested property from an object.
*
* @param   { object }   obj  The object to query for the value.
* @param   { string[] } path The path to the property.
* @returns { any }
*/
function get(obj, path) {
	for (const key of path) {
		if (!obj) return;
		obj = obj[key];
	}
	return obj;
}
/**
* Convert a number into alphabetic sequence representation (Sequence without zeroes).
*
* For example: `a, ..., z, aa, ..., zz, aaa, ...`.
*
* @param   { number } num              Number to convert. Must be >= 1.
* @param   { string } [baseChar = 'a'] Character for 1 in the sequence.
* @param   { number } [base = 26]      Number of characters in the sequence.
* @returns { string }
*/
function numberToLetterSequence(num, baseChar = "a", base = 26) {
	const digits = [];
	do {
		num -= 1;
		digits.push(num % base);
		num = num / base >> 0;
	} while (num > 0);
	const baseCode = baseChar.charCodeAt(0);
	return digits.reverse().map((n) => String.fromCharCode(baseCode + n)).join("");
}
const I = [
	"I",
	"X",
	"C",
	"M"
];
const V = [
	"V",
	"L",
	"D"
];
/**
* Convert a number to it's Roman representation. No large numbers extension.
*
* @param   { number } num Number to convert. `0 < num <= 3999`.
* @returns { string }
*/
function numberToRoman(num) {
	return [...num + ""].map((n) => +n).reverse().map((v, i) => v % 5 < 4 ? (v < 5 ? "" : V[i]) + I[i].repeat(v % 5) : I[i] + (v < 5 ? V[i] : I[i + 1])).reverse().join("");
}
/**
* Helps to build text from words.
*/
var InlineTextBuilder = class {
	/**
	* Creates an instance of InlineTextBuilder.
	*
	* If `maxLineLength` is not provided then it is either `options.wordwrap` or unlimited.
	*
	* @param { Options } options           HtmlToText options.
	* @param { number }  [ maxLineLength ] This builder will try to wrap text to fit this line length.
	*/
	constructor(options, maxLineLength = void 0) {
		/** @type { string[][] } */
		this.lines = [];
		/** @type { string[] }   */
		this.nextLineWords = [];
		this.maxLineLength = maxLineLength || options.wordwrap || Number.MAX_VALUE;
		this.nextLineAvailableChars = this.maxLineLength;
		this.wrapCharacters = get(options, ["longWordSplit", "wrapCharacters"]) || [];
		this.forceWrapOnLimit = get(options, ["longWordSplit", "forceWrapOnLimit"]) || false;
		this.stashedSpace = false;
		this.wordBreakOpportunity = false;
	}
	/**
	* Add a new word.
	*
	* @param { string } word A word to add.
	* @param { boolean } [noWrap] Don't wrap text even if the line is too long.
	*/
	pushWord(word, noWrap = false) {
		if (this.nextLineAvailableChars <= 0 && !noWrap) this.startNewLine();
		const isLineStart = this.nextLineWords.length === 0;
		const cost = word.length + (isLineStart ? 0 : 1);
		if (cost <= this.nextLineAvailableChars || noWrap) {
			this.nextLineWords.push(word);
			this.nextLineAvailableChars -= cost;
		} else {
			const [first, ...rest] = this.splitLongWord(word);
			if (!isLineStart) this.startNewLine();
			this.nextLineWords.push(first);
			this.nextLineAvailableChars -= first.length;
			for (const part of rest) {
				this.startNewLine();
				this.nextLineWords.push(part);
				this.nextLineAvailableChars -= part.length;
			}
		}
	}
	/**
	* Pop a word from the currently built line.
	* This doesn't affect completed lines.
	*
	* @returns { string }
	*/
	popWord() {
		const lastWord = this.nextLineWords.pop();
		if (lastWord !== void 0) {
			const isLineStart = this.nextLineWords.length === 0;
			const cost = lastWord.length + (isLineStart ? 0 : 1);
			this.nextLineAvailableChars += cost;
		}
		return lastWord;
	}
	/**
	* Concat a word to the last word already in the builder.
	* Adds a new word in case there are no words yet in the last line.
	*
	* @param { string } word A word to be concatenated.
	* @param { boolean } [noWrap] Don't wrap text even if the line is too long.
	*/
	concatWord(word, noWrap = false) {
		if (this.wordBreakOpportunity && word.length > this.nextLineAvailableChars) {
			this.pushWord(word, noWrap);
			this.wordBreakOpportunity = false;
		} else {
			const lastWord = this.popWord();
			this.pushWord(lastWord ? lastWord.concat(word) : word, noWrap);
		}
	}
	/**
	* Add current line (and more empty lines if provided argument > 1) to the list of complete lines and start a new one.
	*
	* @param { number } n Number of line breaks that will be added to the resulting string.
	*/
	startNewLine(n = 1) {
		this.lines.push(this.nextLineWords);
		if (n > 1) this.lines.push(...Array.from({ length: n - 1 }, () => []));
		this.nextLineWords = [];
		this.nextLineAvailableChars = this.maxLineLength;
	}
	/**
	* No words in this builder.
	*
	* @returns { boolean }
	*/
	isEmpty() {
		return this.lines.length === 0 && this.nextLineWords.length === 0;
	}
	clear() {
		this.lines.length = 0;
		this.nextLineWords.length = 0;
		this.nextLineAvailableChars = this.maxLineLength;
	}
	/**
	* Join all lines of words inside the InlineTextBuilder into a complete string.
	*
	* @returns { string }
	*/
	toString() {
		return [...this.lines, this.nextLineWords].map((words) => words.join(" ")).join("\n");
	}
	/**
	* Split a long word up to fit within the word wrap limit.
	* Use either a character to split looking back from the word wrap limit,
	* or truncate to the word wrap limit.
	*
	* @param   { string }   word Input word.
	* @returns { string[] }      Parts of the word.
	*/
	splitLongWord(word) {
		const parts = [];
		let idx = 0;
		while (word.length > this.maxLineLength) {
			const firstLine = word.substring(0, this.maxLineLength);
			const remainingChars = word.substring(this.maxLineLength);
			const splitIndex = firstLine.lastIndexOf(this.wrapCharacters[idx]);
			if (splitIndex > -1) {
				word = firstLine.substring(splitIndex + 1) + remainingChars;
				parts.push(firstLine.substring(0, splitIndex + 1));
			} else {
				idx++;
				if (idx < this.wrapCharacters.length) word = firstLine + remainingChars;
				else {
					if (this.forceWrapOnLimit) {
						parts.push(firstLine);
						word = remainingChars;
						if (word.length > this.maxLineLength) continue;
					} else word = firstLine + remainingChars;
					break;
				}
			}
		}
		parts.push(word);
		return parts;
	}
};
var StackItem = class {
	constructor(next = null) {
		this.next = next;
	}
	getRoot() {
		return this.next ? this.next : this;
	}
};
var BlockStackItem = class extends StackItem {
	constructor(options, next = null, leadingLineBreaks = 1, maxLineLength = void 0) {
		super(next);
		this.leadingLineBreaks = leadingLineBreaks;
		this.inlineTextBuilder = new InlineTextBuilder(options, maxLineLength);
		this.rawText = "";
		this.stashedLineBreaks = 0;
		this.isPre = next && next.isPre;
		this.isNoWrap = next && next.isNoWrap;
	}
};
var ListStackItem = class extends BlockStackItem {
	constructor(options, next = null, { interRowLineBreaks = 1, leadingLineBreaks = 2, maxLineLength = void 0, maxPrefixLength = 0, prefixAlign = "left" } = {}) {
		super(options, next, leadingLineBreaks, maxLineLength);
		this.maxPrefixLength = maxPrefixLength;
		this.prefixAlign = prefixAlign;
		this.interRowLineBreaks = interRowLineBreaks;
	}
};
var ListItemStackItem = class extends BlockStackItem {
	constructor(options, next = null, { leadingLineBreaks = 1, maxLineLength = void 0, prefix = "" } = {}) {
		super(options, next, leadingLineBreaks, maxLineLength);
		this.prefix = prefix;
	}
};
var TableStackItem = class extends StackItem {
	constructor(next = null) {
		super(next);
		this.rows = [];
		this.isPre = next && next.isPre;
		this.isNoWrap = next && next.isNoWrap;
	}
};
var TableRowStackItem = class extends StackItem {
	constructor(next = null) {
		super(next);
		this.cells = [];
		this.isPre = next && next.isPre;
		this.isNoWrap = next && next.isNoWrap;
	}
};
var TableCellStackItem = class extends StackItem {
	constructor(options, next = null, maxColumnWidth = void 0) {
		super(next);
		this.inlineTextBuilder = new InlineTextBuilder(options, maxColumnWidth);
		this.rawText = "";
		this.stashedLineBreaks = 0;
		this.isPre = next && next.isPre;
		this.isNoWrap = next && next.isNoWrap;
	}
};
var TransformerStackItem = class extends StackItem {
	constructor(next = null, transform) {
		super(next);
		this.transform = transform;
	}
};
function charactersToCodes(str) {
	return [...str].map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("");
}
/**
* Helps to handle HTML whitespaces.
*
* @class WhitespaceProcessor
*/
var WhitespaceProcessor = class {
	/**
	* Creates an instance of WhitespaceProcessor.
	*
	* @param { Options } options    HtmlToText options.
	* @memberof WhitespaceProcessor
	*/
	constructor(options) {
		this.whitespaceChars = options.preserveNewlines ? options.whitespaceCharacters.replace(/\n/g, "") : options.whitespaceCharacters;
		const whitespaceCodes = charactersToCodes(this.whitespaceChars);
		this.leadingWhitespaceRe = new RegExp(`^[${whitespaceCodes}]`);
		this.trailingWhitespaceRe = new RegExp(`[${whitespaceCodes}]$`);
		this.allWhitespaceOrEmptyRe = new RegExp(`^[${whitespaceCodes}]*$`);
		this.newlineOrNonWhitespaceRe = new RegExp(`(\\n|[^\\n${whitespaceCodes}])`, "g");
		this.newlineOrNonNewlineStringRe = new RegExp(`(\\n|[^\\n]+)`, "g");
		if (options.preserveNewlines) {
			const wordOrNewlineRe = new RegExp(`\\n|[^\\n${whitespaceCodes}]+`, "gm");
			/**
			* Shrink whitespaces and wrap text, add to the builder.
			*
			* @param { string }                  text              Input text.
			* @param { InlineTextBuilder }       inlineTextBuilder A builder to receive processed text.
			* @param { (str: string) => string } [ transform ]     A transform to be applied to words.
			* @param { boolean }                 [noWrap] Don't wrap text even if the line is too long.
			*/
			this.shrinkWrapAdd = function(text, inlineTextBuilder, transform = ((str) => str), noWrap = false) {
				if (!text) return;
				const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
				let anyMatch = false;
				let m = wordOrNewlineRe.exec(text);
				if (m) {
					anyMatch = true;
					if (m[0] === "\n") inlineTextBuilder.startNewLine();
					else if (previouslyStashedSpace || this.testLeadingWhitespace(text)) inlineTextBuilder.pushWord(transform(m[0]), noWrap);
					else inlineTextBuilder.concatWord(transform(m[0]), noWrap);
					while ((m = wordOrNewlineRe.exec(text)) !== null) if (m[0] === "\n") inlineTextBuilder.startNewLine();
					else inlineTextBuilder.pushWord(transform(m[0]), noWrap);
				}
				inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch || this.testTrailingWhitespace(text);
			};
		} else {
			const wordRe = new RegExp(`[^${whitespaceCodes}]+`, "g");
			this.shrinkWrapAdd = function(text, inlineTextBuilder, transform = ((str) => str), noWrap = false) {
				if (!text) return;
				const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
				let anyMatch = false;
				let m = wordRe.exec(text);
				if (m) {
					anyMatch = true;
					if (previouslyStashedSpace || this.testLeadingWhitespace(text)) inlineTextBuilder.pushWord(transform(m[0]), noWrap);
					else inlineTextBuilder.concatWord(transform(m[0]), noWrap);
					while ((m = wordRe.exec(text)) !== null) inlineTextBuilder.pushWord(transform(m[0]), noWrap);
				}
				inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch || this.testTrailingWhitespace(text);
			};
		}
	}
	/**
	* Add text with only minimal processing.
	* Everything between newlines considered a single word.
	* No whitespace is trimmed.
	* Not affected by preserveNewlines option - `\n` always starts a new line.
	*
	* `noWrap` argument is `true` by default - this won't start a new line
	* even if there is not enough space left in the current line.
	*
	* @param { string }            text              Input text.
	* @param { InlineTextBuilder } inlineTextBuilder A builder to receive processed text.
	* @param { boolean }           [noWrap] Don't wrap text even if the line is too long.
	*/
	addLiteral(text, inlineTextBuilder, noWrap = true) {
		if (!text) return;
		const previouslyStashedSpace = inlineTextBuilder.stashedSpace;
		let anyMatch = false;
		let m = this.newlineOrNonNewlineStringRe.exec(text);
		if (m) {
			anyMatch = true;
			if (m[0] === "\n") inlineTextBuilder.startNewLine();
			else if (previouslyStashedSpace) inlineTextBuilder.pushWord(m[0], noWrap);
			else inlineTextBuilder.concatWord(m[0], noWrap);
			while ((m = this.newlineOrNonNewlineStringRe.exec(text)) !== null) if (m[0] === "\n") inlineTextBuilder.startNewLine();
			else inlineTextBuilder.pushWord(m[0], noWrap);
		}
		inlineTextBuilder.stashedSpace = previouslyStashedSpace && !anyMatch;
	}
	/**
	* Test whether the given text starts with HTML whitespace character.
	*
	* @param   { string }  text  The string to test.
	* @returns { boolean }
	*/
	testLeadingWhitespace(text) {
		return this.leadingWhitespaceRe.test(text);
	}
	/**
	* Test whether the given text ends with HTML whitespace character.
	*
	* @param   { string }  text  The string to test.
	* @returns { boolean }
	*/
	testTrailingWhitespace(text) {
		return this.trailingWhitespaceRe.test(text);
	}
	/**
	* Test whether the given text contains any non-whitespace characters.
	*
	* @param   { string }  text  The string to test.
	* @returns { boolean }
	*/
	testContainsWords(text) {
		return !this.allWhitespaceOrEmptyRe.test(text);
	}
	/**
	* Return the number of newlines if there are no words.
	*
	* If any word is found then return zero regardless of the actual number of newlines.
	*
	* @param   { string }  text  Input string.
	* @returns { number }
	*/
	countNewlinesNoWords(text) {
		this.newlineOrNonWhitespaceRe.lastIndex = 0;
		let counter = 0;
		let match;
		while ((match = this.newlineOrNonWhitespaceRe.exec(text)) !== null) if (match[0] === "\n") counter++;
		else return 0;
		return counter;
	}
};
/**
* Helps to build text from inline and block elements.
*
* @class BlockTextBuilder
*/
var BlockTextBuilder = class {
	/**
	* Creates an instance of BlockTextBuilder.
	*
	* @param { Options } options HtmlToText options.
	* @param { import('selderee').Picker<DomNode, TagDefinition> } picker Selectors decision tree picker.
	* @param { any} [metadata] Optional metadata for HTML document, for use in formatters.
	*/
	constructor(options, picker, metadata = void 0) {
		this.options = options;
		this.picker = picker;
		this.metadata = metadata;
		this.whitespaceProcessor = new WhitespaceProcessor(options);
		/** @type { StackItem } */
		this._stackItem = new BlockStackItem(options);
		/** @type { TransformerStackItem } */
		this._wordTransformer = void 0;
	}
	/**
	* Put a word-by-word transform function onto the transformations stack.
	*
	* Mainly used for uppercasing. Can be bypassed to add unformatted text such as URLs.
	*
	* Word transformations applied before wrapping.
	*
	* @param { (str: string) => string } wordTransform Word transformation function.
	*/
	pushWordTransform(wordTransform) {
		this._wordTransformer = new TransformerStackItem(this._wordTransformer, wordTransform);
	}
	/**
	* Remove a function from the word transformations stack.
	*
	* @returns { (str: string) => string } A function that was removed.
	*/
	popWordTransform() {
		if (!this._wordTransformer) return;
		const transform = this._wordTransformer.transform;
		this._wordTransformer = this._wordTransformer.next;
		return transform;
	}
	/**
	* Ignore wordwrap option in followup inline additions and disable automatic wrapping.
	*/
	startNoWrap() {
		this._stackItem.isNoWrap = true;
	}
	/**
	* Return automatic wrapping to behavior defined by options.
	*/
	stopNoWrap() {
		this._stackItem.isNoWrap = false;
	}
	/** @returns { (str: string) => string } */
	_getCombinedWordTransformer() {
		const wt = this._wordTransformer ? ((str) => applyTransformer(str, this._wordTransformer)) : void 0;
		const ce = this.options.encodeCharacters;
		return wt ? ce ? (str) => ce(wt(str)) : wt : ce;
	}
	_popStackItem() {
		const item = this._stackItem;
		this._stackItem = item.next;
		return item;
	}
	/**
	* Add a line break into currently built block.
	*/
	addLineBreak() {
		if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) return;
		if (this._stackItem.isPre) this._stackItem.rawText += "\n";
		else this._stackItem.inlineTextBuilder.startNewLine();
	}
	/**
	* Allow to break line in case directly following text will not fit.
	*/
	addWordBreakOpportunity() {
		if (this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem) this._stackItem.inlineTextBuilder.wordBreakOpportunity = true;
	}
	/**
	* Add a node inline into the currently built block.
	*
	* @param { string } str
	* Text content of a node to add.
	*
	* @param { object } [param1]
	* Object holding the parameters of the operation.
	*
	* @param { boolean } [param1.noWordTransform]
	* Ignore word transformers if there are any.
	* Don't encode characters as well.
	* (Use this for things like URL addresses).
	*/
	addInline(str, { noWordTransform = false } = {}) {
		if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) return;
		if (this._stackItem.isPre) {
			this._stackItem.rawText += str;
			return;
		}
		if (str.length === 0 || this._stackItem.stashedLineBreaks && !this.whitespaceProcessor.testContainsWords(str)) return;
		if (this.options.preserveNewlines) {
			const newlinesNumber = this.whitespaceProcessor.countNewlinesNoWords(str);
			if (newlinesNumber > 0) {
				this._stackItem.inlineTextBuilder.startNewLine(newlinesNumber);
				return;
			}
		}
		if (this._stackItem.stashedLineBreaks) this._stackItem.inlineTextBuilder.startNewLine(this._stackItem.stashedLineBreaks);
		this.whitespaceProcessor.shrinkWrapAdd(str, this._stackItem.inlineTextBuilder, noWordTransform ? void 0 : this._getCombinedWordTransformer(), this._stackItem.isNoWrap);
		this._stackItem.stashedLineBreaks = 0;
	}
	/**
	* Add a string inline into the currently built block.
	*
	* Use this for markup elements that don't have to adhere
	* to text layout rules.
	*
	* @param { string } str Text to add.
	*/
	addLiteral(str) {
		if (!(this._stackItem instanceof BlockStackItem || this._stackItem instanceof ListItemStackItem || this._stackItem instanceof TableCellStackItem)) return;
		if (str.length === 0) return;
		if (this._stackItem.isPre) {
			this._stackItem.rawText += str;
			return;
		}
		if (this._stackItem.stashedLineBreaks) this._stackItem.inlineTextBuilder.startNewLine(this._stackItem.stashedLineBreaks);
		this.whitespaceProcessor.addLiteral(str, this._stackItem.inlineTextBuilder, this._stackItem.isNoWrap);
		this._stackItem.stashedLineBreaks = 0;
	}
	/**
	* Start building a new block.
	*
	* @param { object } [param0]
	* Object holding the parameters of the block.
	*
	* @param { number } [param0.leadingLineBreaks]
	* This block should have at least this number of line breaks to separate it from any preceding block.
	*
	* @param { number }  [param0.reservedLineLength]
	* Reserve this number of characters on each line for block markup.
	*
	* @param { boolean } [param0.isPre]
	* Should HTML whitespace be preserved inside this block.
	*/
	openBlock({ leadingLineBreaks = 1, reservedLineLength = 0, isPre = false } = {}) {
		const maxLineLength = Math.max(20, this._stackItem.inlineTextBuilder.maxLineLength - reservedLineLength);
		this._stackItem = new BlockStackItem(this.options, this._stackItem, leadingLineBreaks, maxLineLength);
		if (isPre) this._stackItem.isPre = true;
	}
	/**
	* Finalize currently built block, add it's content to the parent block.
	*
	* @param { object } [param0]
	* Object holding the parameters of the block.
	*
	* @param { number } [param0.trailingLineBreaks]
	* This block should have at least this number of line breaks to separate it from any following block.
	*
	* @param { (str: string) => string } [param0.blockTransform]
	* A function to transform the block text before adding to the parent block.
	* This happens after word wrap and should be used in combination with reserved line length
	* in order to keep line lengths correct.
	* Used for whole block markup.
	*/
	closeBlock({ trailingLineBreaks = 1, blockTransform = void 0 } = {}) {
		const block = this._popStackItem();
		const blockText = blockTransform ? blockTransform(getText(block)) : getText(block);
		addText(this._stackItem, blockText, block.leadingLineBreaks, Math.max(block.stashedLineBreaks, trailingLineBreaks));
	}
	/**
	* Start building a new list.
	*
	* @param { object } [param0]
	* Object holding the parameters of the list.
	*
	* @param { number } [param0.maxPrefixLength]
	* Length of the longest list item prefix.
	* If not supplied or too small then list items won't be aligned properly.
	*
	* @param { 'left' | 'right' } [param0.prefixAlign]
	* Specify how prefixes of different lengths have to be aligned
	* within a column.
	*
	* @param { number } [param0.interRowLineBreaks]
	* Minimum number of line breaks between list items.
	*
	* @param { number } [param0.leadingLineBreaks]
	* This list should have at least this number of line breaks to separate it from any preceding block.
	*/
	openList({ maxPrefixLength = 0, prefixAlign = "left", interRowLineBreaks = 1, leadingLineBreaks = 2 } = {}) {
		this._stackItem = new ListStackItem(this.options, this._stackItem, {
			interRowLineBreaks,
			leadingLineBreaks,
			maxLineLength: this._stackItem.inlineTextBuilder.maxLineLength,
			maxPrefixLength,
			prefixAlign
		});
	}
	/**
	* Start building a new list item.
	*
	* @param {object} param0
	* Object holding the parameters of the list item.
	*
	* @param { string } [param0.prefix]
	* Prefix for this list item (item number, bullet point, etc).
	*/
	openListItem({ prefix = "" } = {}) {
		if (!(this._stackItem instanceof ListStackItem)) throw new Error("Can't add a list item to something that is not a list! Check the formatter.");
		const list = this._stackItem;
		const prefixLength = Math.max(prefix.length, list.maxPrefixLength);
		const maxLineLength = Math.max(20, list.inlineTextBuilder.maxLineLength - prefixLength);
		this._stackItem = new ListItemStackItem(this.options, list, {
			prefix,
			maxLineLength,
			leadingLineBreaks: list.interRowLineBreaks
		});
	}
	/**
	* Finalize currently built list item, add it's content to the parent list.
	*/
	closeListItem() {
		const listItem = this._popStackItem();
		const list = listItem.next;
		const prefixLength = Math.max(listItem.prefix.length, list.maxPrefixLength);
		const spacing = "\n" + " ".repeat(prefixLength);
		addText(list, (list.prefixAlign === "right" ? listItem.prefix.padStart(prefixLength) : listItem.prefix.padEnd(prefixLength)) + getText(listItem).replace(/\n/g, spacing), listItem.leadingLineBreaks, Math.max(listItem.stashedLineBreaks, list.interRowLineBreaks));
	}
	/**
	* Finalize currently built list, add it's content to the parent block.
	*
	* @param { object } param0
	* Object holding the parameters of the list.
	*
	* @param { number } [param0.trailingLineBreaks]
	* This list should have at least this number of line breaks to separate it from any following block.
	*/
	closeList({ trailingLineBreaks = 2 } = {}) {
		const list = this._popStackItem();
		const text = getText(list);
		if (text) addText(this._stackItem, text, list.leadingLineBreaks, trailingLineBreaks);
	}
	/**
	* Start building a table.
	*/
	openTable() {
		this._stackItem = new TableStackItem(this._stackItem);
	}
	/**
	* Start building a table row.
	*/
	openTableRow() {
		if (!(this._stackItem instanceof TableStackItem)) throw new Error("Can't add a table row to something that is not a table! Check the formatter.");
		this._stackItem = new TableRowStackItem(this._stackItem);
	}
	/**
	* Start building a table cell.
	*
	* @param { object } [param0]
	* Object holding the parameters of the cell.
	*
	* @param { number } [param0.maxColumnWidth]
	* Wrap cell content to this width. Fall back to global wordwrap value if undefined.
	*/
	openTableCell({ maxColumnWidth = void 0 } = {}) {
		if (!(this._stackItem instanceof TableRowStackItem)) throw new Error("Can't add a table cell to something that is not a table row! Check the formatter.");
		this._stackItem = new TableCellStackItem(this.options, this._stackItem, maxColumnWidth);
	}
	/**
	* Finalize currently built table cell and add it to parent table row's cells.
	*
	* @param { object } [param0]
	* Object holding the parameters of the cell.
	*
	* @param { number } [param0.colspan] How many columns this cell should occupy.
	* @param { number } [param0.rowspan] How many rows this cell should occupy.
	*/
	closeTableCell({ colspan = 1, rowspan = 1 } = {}) {
		const cell = this._popStackItem();
		const text = trimCharacter(getText(cell), "\n");
		cell.next.cells.push({
			colspan,
			rowspan,
			text
		});
	}
	/**
	* Finalize currently built table row and add it to parent table's rows.
	*/
	closeTableRow() {
		const row = this._popStackItem();
		row.next.rows.push(row.cells);
	}
	/**
	* Finalize currently built table and add the rendered text to the parent block.
	*
	* @param { object } param0
	* Object holding the parameters of the table.
	*
	* @param { TablePrinter } param0.tableToString
	* A function to convert a table of stringified cells into a complete table.
	*
	* @param { number } [param0.leadingLineBreaks]
	* This table should have at least this number of line breaks to separate if from any preceding block.
	*
	* @param { number } [param0.trailingLineBreaks]
	* This table should have at least this number of line breaks to separate it from any following block.
	*/
	closeTable({ tableToString, leadingLineBreaks = 2, trailingLineBreaks = 2 }) {
		const output = tableToString(this._popStackItem().rows);
		if (output) addText(this._stackItem, output, leadingLineBreaks, trailingLineBreaks);
	}
	/**
	* Return the rendered text content of this builder.
	*
	* @returns { string }
	*/
	toString() {
		return getText(this._stackItem.getRoot());
	}
};
function getText(stackItem) {
	if (!(stackItem instanceof BlockStackItem || stackItem instanceof ListItemStackItem || stackItem instanceof TableCellStackItem)) throw new Error("Only blocks, list items and table cells can be requested for text contents.");
	return stackItem.inlineTextBuilder.isEmpty() ? stackItem.rawText : stackItem.rawText + stackItem.inlineTextBuilder.toString();
}
function addText(stackItem, text, leadingLineBreaks, trailingLineBreaks) {
	if (!(stackItem instanceof BlockStackItem || stackItem instanceof ListItemStackItem || stackItem instanceof TableCellStackItem)) throw new Error("Only blocks, list items and table cells can contain text.");
	const parentText = getText(stackItem);
	const lineBreaks = Math.max(stackItem.stashedLineBreaks, leadingLineBreaks);
	stackItem.inlineTextBuilder.clear();
	if (parentText) stackItem.rawText = parentText + "\n".repeat(lineBreaks) + text;
	else {
		stackItem.rawText = text;
		stackItem.leadingLineBreaks = lineBreaks;
	}
	stackItem.stashedLineBreaks = trailingLineBreaks;
}
/**
* @param { string } str A string to transform.
* @param { TransformerStackItem } transformer A transformer item (with possible continuation).
* @returns { string }
*/
function applyTransformer(str, transformer) {
	return transformer ? applyTransformer(transformer.transform(str), transformer.next) : str;
}
/**
* Compile selectors into a decision tree,
* return a function intended for batch processing.
*
* @param   { Options } [options = {}]   HtmlToText options (defaults, formatters, user options merged, deduplicated).
* @returns { (html: string, metadata?: any) => string } Pre-configured converter function.
* @static
*/
function compile$1(options = {}) {
	const selectorsWithoutFormat = options.selectors.filter((s) => !s.format);
	if (selectorsWithoutFormat.length) throw new Error("Following selectors have no specified format: " + selectorsWithoutFormat.map((s) => `\`${s.selector}\``).join(", "));
	const picker = new DecisionTree(options.selectors.map((s) => [s.selector, s])).build(hp2Builder);
	if (typeof options.encodeCharacters !== "function") options.encodeCharacters = makeReplacerFromDict(options.encodeCharacters);
	const baseSelectorsPicker = new DecisionTree(options.baseElements.selectors.map((s, i) => [s, i + 1])).build(hp2Builder);
	function findBaseElements(dom) {
		return findBases(dom, options, baseSelectorsPicker);
	}
	const limitedWalk = limitedDepthRecursive(options.limits.maxDepth, recursiveWalk, function(dom, builder) {
		builder.addInline(options.limits.ellipsis || "");
	});
	return function(html, metadata = void 0) {
		return process$1(html, metadata, options, picker, findBaseElements, limitedWalk);
	};
}
/**
* Convert given HTML according to preprocessed options.
*
* @param { string } html HTML content to convert.
* @param { any } metadata Optional metadata for HTML document, for use in formatters.
* @param { Options } options HtmlToText options (preprocessed).
* @param { import('selderee').Picker<DomNode, TagDefinition> } picker
* Tag definition picker for DOM nodes processing.
* @param { (dom: DomNode[]) => DomNode[] } findBaseElements
* Function to extract elements from HTML DOM
* that will only be present in the output text.
* @param { RecursiveCallback } walk Recursive callback.
* @returns { string }
*/
function process$1(html, metadata, options, picker, findBaseElements, walk) {
	const maxInputLength = options.limits.maxInputLength;
	if (maxInputLength && html && html.length > maxInputLength) {
		console.warn(`Input length ${html.length} is above allowed limit of ${maxInputLength}. Truncating without ellipsis.`);
		html = html.substring(0, maxInputLength);
	}
	const bases = findBaseElements(parseDocument(html, { decodeEntities: options.decodeEntities }).children);
	const builder = new BlockTextBuilder(options, picker, metadata);
	walk(bases, builder);
	return builder.toString();
}
function findBases(dom, options, baseSelectorsPicker) {
	const results = [];
	function recursiveWalk(walk, dom) {
		dom = dom.slice(0, options.limits.maxChildNodes);
		for (const elem of dom) {
			if (elem.type !== "tag") continue;
			const pickedSelectorIndex = baseSelectorsPicker.pick1(elem);
			if (pickedSelectorIndex > 0) results.push({
				selectorIndex: pickedSelectorIndex,
				element: elem
			});
			else if (elem.children) walk(elem.children);
			if (results.length >= options.limits.maxBaseElements) return;
		}
	}
	limitedDepthRecursive(options.limits.maxDepth, recursiveWalk)(dom);
	if (options.baseElements.orderBy !== "occurrence") results.sort((a, b) => a.selectorIndex - b.selectorIndex);
	return options.baseElements.returnDomByDefault && results.length === 0 ? dom : results.map((x) => x.element);
}
/**
* Function to walk through DOM nodes and accumulate their string representations.
*
* @param   { RecursiveCallback } walk    Recursive callback.
* @param   { DomNode[] }         [dom]   Nodes array to process.
* @param   { BlockTextBuilder }  builder Passed around to accumulate output text.
* @private
*/
function recursiveWalk(walk, dom, builder) {
	if (!dom) return;
	const options = builder.options;
	if (dom.length > options.limits.maxChildNodes) {
		dom = dom.slice(0, options.limits.maxChildNodes);
		dom.push({
			data: options.limits.ellipsis,
			type: "text"
		});
	}
	for (const elem of dom) switch (elem.type) {
		case "text":
			builder.addInline(elem.data);
			break;
		case "tag": {
			const tagDefinition = builder.picker.pick1(elem);
			const format = options.formatters[tagDefinition.format];
			format(elem, walk, builder, tagDefinition.options || {});
			break;
		}
	}
}
/**
* @param { Object<string,string | false> } dict
* A dictionary where keys are characters to replace
* and values are replacement strings.
*
* First code point from dict keys is used.
* Compound emojis with ZWJ are not supported (not until Node 16).
*
* @returns { ((str: string) => string) | undefined }
*/
function makeReplacerFromDict(dict) {
	if (!dict || Object.keys(dict).length === 0) return;
	/** @type { [string, string][] } */
	const entries = Object.entries(dict).filter(([, v]) => v !== false);
	const regex = new RegExp(entries.map(([c]) => `(${unicodeEscape([...c][0])})`).join("|"), "g");
	const values = entries.map(([, v]) => v);
	const replacer = (m, ...cgs) => values[cgs.findIndex((cg) => cg)];
	return (str) => str.replace(regex, replacer);
}
/**
* Dummy formatter that discards the input and does nothing.
*
* @type { FormatCallback }
*/
function formatSkip(elem, walk, builder, formatOptions) {}
/**
* Insert the given string literal inline instead of a tag.
*
* @type { FormatCallback }
*/
function formatInlineString(elem, walk, builder, formatOptions) {
	builder.addLiteral(formatOptions.string || "");
}
/**
* Insert a block with the given string literal instead of a tag.
*
* @type { FormatCallback }
*/
function formatBlockString(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	builder.addLiteral(formatOptions.string || "");
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Process an inline-level element.
*
* @type { FormatCallback }
*/
function formatInline(elem, walk, builder, formatOptions) {
	walk(elem.children, builder);
}
/**
* Process a block-level container.
*
* @type { FormatCallback }
*/
function formatBlock$1(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	walk(elem.children, builder);
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
function renderOpenTag(elem) {
	const attrs = elem.attribs && elem.attribs.length ? " " + Object.entries(elem.attribs).map(([k, v]) => v === "" ? k : `${k}=${v.replace(/"/g, "&quot;")}`).join(" ") : "";
	return `<${elem.name}${attrs}>`;
}
function renderCloseTag(elem) {
	return `</${elem.name}>`;
}
/**
* Render an element as inline HTML tag, walk through it's children.
*
* @type { FormatCallback }
*/
function formatInlineTag(elem, walk, builder, formatOptions) {
	builder.startNoWrap();
	builder.addLiteral(renderOpenTag(elem));
	builder.stopNoWrap();
	walk(elem.children, builder);
	builder.startNoWrap();
	builder.addLiteral(renderCloseTag(elem));
	builder.stopNoWrap();
}
/**
* Render an element as HTML block bag, walk through it's children.
*
* @type { FormatCallback }
*/
function formatBlockTag(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	builder.startNoWrap();
	builder.addLiteral(renderOpenTag(elem));
	builder.stopNoWrap();
	walk(elem.children, builder);
	builder.startNoWrap();
	builder.addLiteral(renderCloseTag(elem));
	builder.stopNoWrap();
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Render an element with all it's children as inline HTML.
*
* @type { FormatCallback }
*/
function formatInlineHtml(elem, walk, builder, formatOptions) {
	builder.startNoWrap();
	builder.addLiteral(render$1(elem, { decodeEntities: builder.options.decodeEntities }));
	builder.stopNoWrap();
}
/**
* Render an element with all it's children as HTML block.
*
* @type { FormatCallback }
*/
function formatBlockHtml(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	builder.startNoWrap();
	builder.addLiteral(render$1(elem, { decodeEntities: builder.options.decodeEntities }));
	builder.stopNoWrap();
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Render inline element wrapped with given strings.
*
* @type { FormatCallback }
*/
function formatInlineSurround(elem, walk, builder, formatOptions) {
	builder.addLiteral(formatOptions.prefix || "");
	walk(elem.children, builder);
	builder.addLiteral(formatOptions.suffix || "");
}
var genericFormatters = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	block: formatBlock$1,
	blockHtml: formatBlockHtml,
	blockString: formatBlockString,
	blockTag: formatBlockTag,
	inline: formatInline,
	inlineHtml: formatInlineHtml,
	inlineString: formatInlineString,
	inlineSurround: formatInlineSurround,
	inlineTag: formatInlineTag,
	skip: formatSkip
});
function getRow(matrix, j) {
	if (!matrix[j]) matrix[j] = [];
	return matrix[j];
}
function findFirstVacantIndex(row, x = 0) {
	while (row[x]) x++;
	return x;
}
function transposeInPlace(matrix, maxSize) {
	for (let i = 0; i < maxSize; i++) {
		const rowI = getRow(matrix, i);
		for (let j = 0; j < i; j++) {
			const rowJ = getRow(matrix, j);
			if (rowI[j] || rowJ[i]) {
				const temp = rowI[j];
				rowI[j] = rowJ[i];
				rowJ[i] = temp;
			}
		}
	}
}
function putCellIntoLayout(cell, layout, baseRow, baseCol) {
	for (let r = 0; r < cell.rowspan; r++) {
		const layoutRow = getRow(layout, baseRow + r);
		for (let c = 0; c < cell.colspan; c++) layoutRow[baseCol + c] = cell;
	}
}
function getOrInitOffset(offsets, index) {
	if (offsets[index] === void 0) offsets[index] = index === 0 ? 0 : 1 + getOrInitOffset(offsets, index - 1);
	return offsets[index];
}
function updateOffset(offsets, base, span, value) {
	offsets[base + span] = Math.max(getOrInitOffset(offsets, base + span), getOrInitOffset(offsets, base) + value);
}
/**
* Render a table into a string.
* Cells can contain multiline text and span across multiple rows and columns.
*
* Modifies cells to add lines array.
*
* @param { TablePrinterCell[][] } tableRows Table to render.
* @param { number } rowSpacing Number of spaces between columns.
* @param { number } colSpacing Number of empty lines between rows.
* @returns { string }
*/
function tableToString(tableRows, rowSpacing, colSpacing) {
	const layout = [];
	let colNumber = 0;
	const rowNumber = tableRows.length;
	const rowOffsets = [0];
	for (let j = 0; j < rowNumber; j++) {
		const layoutRow = getRow(layout, j);
		const cells = tableRows[j];
		let x = 0;
		for (let i = 0; i < cells.length; i++) {
			const cell = cells[i];
			x = findFirstVacantIndex(layoutRow, x);
			putCellIntoLayout(cell, layout, j, x);
			x += cell.colspan;
			cell.lines = cell.text.split("\n");
			const cellHeight = cell.lines.length;
			updateOffset(rowOffsets, j, cell.rowspan, cellHeight + rowSpacing);
		}
		colNumber = layoutRow.length > colNumber ? layoutRow.length : colNumber;
	}
	transposeInPlace(layout, rowNumber > colNumber ? rowNumber : colNumber);
	const outputLines = [];
	const colOffsets = [0];
	for (let x = 0; x < colNumber; x++) {
		let y = 0;
		let cell;
		const rowsInThisColumn = Math.min(rowNumber, layout[x].length);
		while (y < rowsInThisColumn) {
			cell = layout[x][y];
			if (cell) {
				if (!cell.rendered) {
					let cellWidth = 0;
					for (let j = 0; j < cell.lines.length; j++) {
						const line = cell.lines[j];
						const lineOffset = rowOffsets[y] + j;
						outputLines[lineOffset] = (outputLines[lineOffset] || "").padEnd(colOffsets[x]) + line;
						cellWidth = line.length > cellWidth ? line.length : cellWidth;
					}
					updateOffset(colOffsets, x, cell.colspan, cellWidth + colSpacing);
					cell.rendered = true;
				}
				y += cell.rowspan;
			} else {
				const lineOffset = rowOffsets[y];
				outputLines[lineOffset] = outputLines[lineOffset] || "";
				y++;
			}
		}
	}
	return outputLines.join("\n");
}
/**
* Process a line-break.
*
* @type { FormatCallback }
*/
function formatLineBreak(elem, walk, builder, formatOptions) {
	builder.addLineBreak();
}
/**
* Process a `wbr` tag (word break opportunity).
*
* @type { FormatCallback }
*/
function formatWbr(elem, walk, builder, formatOptions) {
	builder.addWordBreakOpportunity();
}
/**
* Process a horizontal line.
*
* @type { FormatCallback }
*/
function formatHorizontalLine(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	builder.addInline("-".repeat(formatOptions.length || builder.options.wordwrap || 40));
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Process a paragraph.
*
* @type { FormatCallback }
*/
function formatParagraph(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	walk(elem.children, builder);
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Process a preformatted content.
*
* @type { FormatCallback }
*/
function formatPre(elem, walk, builder, formatOptions) {
	builder.openBlock({
		isPre: true,
		leadingLineBreaks: formatOptions.leadingLineBreaks || 2
	});
	walk(elem.children, builder);
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Process a heading.
*
* @type { FormatCallback }
*/
function formatHeading(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks || 2 });
	if (formatOptions.uppercase !== false) {
		builder.pushWordTransform((str) => str.toUpperCase());
		walk(elem.children, builder);
		builder.popWordTransform();
	} else walk(elem.children, builder);
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks || 2 });
}
/**
* Process a blockquote.
*
* @type { FormatCallback }
*/
function formatBlockquote(elem, walk, builder, formatOptions) {
	builder.openBlock({
		leadingLineBreaks: formatOptions.leadingLineBreaks || 2,
		reservedLineLength: 2
	});
	walk(elem.children, builder);
	builder.closeBlock({
		trailingLineBreaks: formatOptions.trailingLineBreaks || 2,
		blockTransform: (str) => (formatOptions.trimEmptyLines !== false ? trimCharacter(str, "\n") : str).split("\n").map((line) => "> " + line).join("\n")
	});
}
function withBrackets(str, brackets) {
	if (!brackets) return str;
	const lbr = typeof brackets[0] === "string" ? brackets[0] : "[";
	const rbr = typeof brackets[1] === "string" ? brackets[1] : "]";
	return lbr + str + rbr;
}
function pathRewrite(path, rewriter, baseUrl, metadata, elem) {
	const modifiedPath = typeof rewriter === "function" ? rewriter(path, metadata, elem) : path;
	return modifiedPath[0] === "/" && baseUrl ? trimCharacterEnd(baseUrl, "/") + modifiedPath : modifiedPath;
}
/**
* Process an image.
*
* @type { FormatCallback }
*/
function formatImage(elem, walk, builder, formatOptions) {
	const attribs = elem.attribs || {};
	const alt = attribs.alt ? attribs.alt : "";
	const src = !attribs.src ? "" : pathRewrite(attribs.src, formatOptions.pathRewrite, formatOptions.baseUrl, builder.metadata, elem);
	const text = !src ? alt : !alt ? withBrackets(src, formatOptions.linkBrackets) : alt + " " + withBrackets(src, formatOptions.linkBrackets);
	builder.addInline(text, { noWordTransform: true });
}
/**
* Process an anchor.
*
* @type { FormatCallback }
*/
function formatAnchor(elem, walk, builder, formatOptions) {
	function getHref() {
		if (formatOptions.ignoreHref) return "";
		if (!elem.attribs || !elem.attribs.href) return "";
		let href = elem.attribs.href.replace(/^mailto:/, "");
		if (formatOptions.noAnchorUrl && href[0] === "#") return "";
		href = pathRewrite(href, formatOptions.pathRewrite, formatOptions.baseUrl, builder.metadata, elem);
		return href;
	}
	const href = getHref();
	if (!href) walk(elem.children, builder);
	else {
		let text = "";
		builder.pushWordTransform((str) => {
			if (str) text += str;
			return str;
		});
		walk(elem.children, builder);
		builder.popWordTransform();
		if (!(formatOptions.hideLinkHrefIfSameAsText && href === text)) builder.addInline(!text ? href : " " + withBrackets(href, formatOptions.linkBrackets), { noWordTransform: true });
	}
}
/**
* @param { DomNode }           elem               List items with their prefixes.
* @param { RecursiveCallback } walk               Recursive callback to process child nodes.
* @param { BlockTextBuilder }  builder            Passed around to accumulate output text.
* @param { FormatOptions }     formatOptions      Options specific to a formatter.
* @param { () => string }      nextPrefixCallback Function that returns increasing index each time it is called.
*/
function formatList(elem, walk, builder, formatOptions, nextPrefixCallback) {
	const isNestedList = get(elem, ["parent", "name"]) === "li";
	let maxPrefixLength = 0;
	const listItems = (elem.children || []).filter((child) => child.type !== "text" || !/^\s*$/.test(child.data)).map(function(child) {
		if (child.name !== "li") return {
			node: child,
			prefix: ""
		};
		const prefix = isNestedList ? nextPrefixCallback().trimStart() : nextPrefixCallback();
		if (prefix.length > maxPrefixLength) maxPrefixLength = prefix.length;
		return {
			node: child,
			prefix
		};
	});
	if (!listItems.length) return;
	builder.openList({
		interRowLineBreaks: 1,
		leadingLineBreaks: isNestedList ? 1 : formatOptions.leadingLineBreaks || 2,
		maxPrefixLength,
		prefixAlign: "left"
	});
	for (const { node, prefix } of listItems) {
		builder.openListItem({ prefix });
		walk([node], builder);
		builder.closeListItem();
	}
	builder.closeList({ trailingLineBreaks: isNestedList ? 1 : formatOptions.trailingLineBreaks || 2 });
}
/**
* Process an unordered list.
*
* @type { FormatCallback }
*/
function formatUnorderedList(elem, walk, builder, formatOptions) {
	const prefix = formatOptions.itemPrefix || " * ";
	return formatList(elem, walk, builder, formatOptions, () => prefix);
}
/**
* Process an ordered list.
*
* @type { FormatCallback }
*/
function formatOrderedList(elem, walk, builder, formatOptions) {
	let nextIndex = Number(elem.attribs.start || "1");
	const indexFunction = getOrderedListIndexFunction(elem.attribs.type);
	const nextPrefixCallback = () => " " + indexFunction(nextIndex++) + ". ";
	return formatList(elem, walk, builder, formatOptions, nextPrefixCallback);
}
/**
* Return a function that can be used to generate index markers of a specified format.
*
* @param   { string } [olType='1'] Marker type.
* @returns { (i: number) => string }
*/
function getOrderedListIndexFunction(olType = "1") {
	switch (olType) {
		case "a": return (i) => numberToLetterSequence(i, "a");
		case "A": return (i) => numberToLetterSequence(i, "A");
		case "i": return (i) => numberToRoman(i).toLowerCase();
		case "I": return (i) => numberToRoman(i);
		default: return (i) => i.toString();
	}
}
/**
* Given a list of class and ID selectors (prefixed with '.' and '#'),
* return them as separate lists of names without prefixes.
*
* @param { string[] } selectors Class and ID selectors (`[".class", "#id"]` etc).
* @returns { { classes: string[], ids: string[] } }
*/
function splitClassesAndIds(selectors) {
	const classes = [];
	const ids = [];
	for (const selector of selectors) if (selector.startsWith(".")) classes.push(selector.substring(1));
	else if (selector.startsWith("#")) ids.push(selector.substring(1));
	return {
		classes,
		ids
	};
}
function isDataTable(attr, tables) {
	if (tables === true) return true;
	if (!attr) return false;
	const { classes, ids } = splitClassesAndIds(tables);
	const attrClasses = (attr["class"] || "").split(" ");
	const attrIds = (attr["id"] || "").split(" ");
	return attrClasses.some((x) => classes.includes(x)) || attrIds.some((x) => ids.includes(x));
}
/**
* Process a table (either as a container or as a data table, depending on options).
*
* @type { FormatCallback }
*/
function formatTable(elem, walk, builder, formatOptions) {
	return isDataTable(elem.attribs, builder.options.tables) ? formatDataTable(elem, walk, builder, formatOptions) : formatBlock(elem, walk, builder, formatOptions);
}
function formatBlock(elem, walk, builder, formatOptions) {
	builder.openBlock({ leadingLineBreaks: formatOptions.leadingLineBreaks });
	walk(elem.children, builder);
	builder.closeBlock({ trailingLineBreaks: formatOptions.trailingLineBreaks });
}
/**
* Process a data table.
*
* @type { FormatCallback }
*/
function formatDataTable(elem, walk, builder, formatOptions) {
	builder.openTable();
	elem.children.forEach(walkTable);
	builder.closeTable({
		tableToString: (rows) => tableToString(rows, formatOptions.rowSpacing ?? 0, formatOptions.colSpacing ?? 3),
		leadingLineBreaks: formatOptions.leadingLineBreaks,
		trailingLineBreaks: formatOptions.trailingLineBreaks
	});
	function formatCell(cellNode) {
		const colspan = +get(cellNode, ["attribs", "colspan"]) || 1;
		const rowspan = +get(cellNode, ["attribs", "rowspan"]) || 1;
		builder.openTableCell({ maxColumnWidth: formatOptions.maxColumnWidth });
		walk(cellNode.children, builder);
		builder.closeTableCell({
			colspan,
			rowspan
		});
	}
	function walkTable(elem) {
		if (elem.type !== "tag") return;
		const formatHeaderCell = formatOptions.uppercaseHeaderCells !== false ? (cellNode) => {
			builder.pushWordTransform((str) => str.toUpperCase());
			formatCell(cellNode);
			builder.popWordTransform();
		} : formatCell;
		switch (elem.name) {
			case "thead":
			case "tbody":
			case "tfoot":
			case "center":
				elem.children.forEach(walkTable);
				return;
			case "tr":
				builder.openTableRow();
				for (const childOfTr of elem.children) {
					if (childOfTr.type !== "tag") continue;
					switch (childOfTr.name) {
						case "th":
							formatHeaderCell(childOfTr);
							break;
						case "td":
							formatCell(childOfTr);
							break;
					}
				}
				builder.closeTableRow();
				break;
		}
	}
}
var textFormatters = /* @__PURE__ */ Object.freeze({
	__proto__: null,
	anchor: formatAnchor,
	blockquote: formatBlockquote,
	dataTable: formatDataTable,
	heading: formatHeading,
	horizontalLine: formatHorizontalLine,
	image: formatImage,
	lineBreak: formatLineBreak,
	orderedList: formatOrderedList,
	paragraph: formatParagraph,
	pre: formatPre,
	table: formatTable,
	unorderedList: formatUnorderedList,
	wbr: formatWbr
});
/**
* Default options.
*
* @constant
* @type { Options }
* @default
* @private
*/
const DEFAULT_OPTIONS = {
	baseElements: {
		selectors: ["body"],
		orderBy: "selectors",
		returnDomByDefault: true
	},
	decodeEntities: true,
	encodeCharacters: {},
	formatters: {},
	limits: {
		ellipsis: "...",
		maxBaseElements: void 0,
		maxChildNodes: void 0,
		maxDepth: void 0,
		maxInputLength: 1 << 24
	},
	longWordSplit: {
		forceWrapOnLimit: false,
		wrapCharacters: []
	},
	preserveNewlines: false,
	selectors: [
		{
			selector: "*",
			format: "inline"
		},
		{
			selector: "a",
			format: "anchor",
			options: {
				baseUrl: null,
				hideLinkHrefIfSameAsText: false,
				ignoreHref: false,
				linkBrackets: ["[", "]"],
				noAnchorUrl: true
			}
		},
		{
			selector: "article",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "aside",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "blockquote",
			format: "blockquote",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2,
				trimEmptyLines: true
			}
		},
		{
			selector: "br",
			format: "lineBreak"
		},
		{
			selector: "div",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "footer",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "form",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "h1",
			format: "heading",
			options: {
				leadingLineBreaks: 3,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "h2",
			format: "heading",
			options: {
				leadingLineBreaks: 3,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "h3",
			format: "heading",
			options: {
				leadingLineBreaks: 3,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "h4",
			format: "heading",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "h5",
			format: "heading",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "h6",
			format: "heading",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2,
				uppercase: true
			}
		},
		{
			selector: "header",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "hr",
			format: "horizontalLine",
			options: {
				leadingLineBreaks: 2,
				length: void 0,
				trailingLineBreaks: 2
			}
		},
		{
			selector: "img",
			format: "image",
			options: {
				baseUrl: null,
				linkBrackets: ["[", "]"]
			}
		},
		{
			selector: "main",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "nav",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "ol",
			format: "orderedList",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2
			}
		},
		{
			selector: "p",
			format: "paragraph",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2
			}
		},
		{
			selector: "pre",
			format: "pre",
			options: {
				leadingLineBreaks: 2,
				trailingLineBreaks: 2
			}
		},
		{
			selector: "section",
			format: "block",
			options: {
				leadingLineBreaks: 1,
				trailingLineBreaks: 1
			}
		},
		{
			selector: "table",
			format: "table",
			options: {
				colSpacing: 3,
				leadingLineBreaks: 2,
				maxColumnWidth: 60,
				rowSpacing: 0,
				trailingLineBreaks: 2,
				uppercaseHeaderCells: true
			}
		},
		{
			selector: "ul",
			format: "unorderedList",
			options: {
				itemPrefix: " * ",
				leadingLineBreaks: 2,
				trailingLineBreaks: 2
			}
		},
		{
			selector: "wbr",
			format: "wbr"
		}
	],
	tables: [],
	whitespaceCharacters: " 	\r\n\f​",
	wordwrap: 80
};
const concatMerge = (acc, src, options) => [...acc, ...src];
const overwriteMerge = (acc, src, options) => [...src];
const selectorsMerge = (acc, src, options) => acc.some((s) => typeof s === "object") ? concatMerge(acc, src) : overwriteMerge(acc, src);
/**
* Preprocess options, compile selectors into a decision tree,
* return a function intended for batch processing.
*
* @param   { Options } [options = {}]   HtmlToText options.
* @returns { (html: string, metadata?: any) => string } Pre-configured converter function.
* @static
*/
function compile(options = {}) {
	options = (0, import_cjs.default)(DEFAULT_OPTIONS, options, {
		arrayMerge: overwriteMerge,
		customMerge: (key) => key === "selectors" ? selectorsMerge : void 0
	});
	options.formatters = Object.assign({}, genericFormatters, textFormatters, options.formatters);
	options.selectors = mergeDuplicatesPreferLast(options.selectors, ((s) => s.selector));
	handleDeprecatedOptions(options);
	return compile$1(options);
}
/**
* Convert given HTML content to plain text string.
*
* @param   { string }  html           HTML content to convert.
* @param   { Options } [options = {}] HtmlToText options.
* @param   { any }     [metadata]     Optional metadata for HTML document, for use in formatters.
* @returns { string }                 Plain text string.
* @static
*
* @example
* const { convert } = require('html-to-text');
* const text = convert('<h1>Hello World</h1>', {
*   wordwrap: 130
* });
* console.log(text); // HELLO WORLD
*/
function convert(html, options = {}, metadata = void 0) {
	return compile(options)(html, metadata);
}
/**
* Map previously existing and now deprecated options to the new options layout.
* This is a subject for cleanup in major releases.
*
* @param { Options } options HtmlToText options.
*/
function handleDeprecatedOptions(options) {
	if (options.tags) {
		const tagDefinitions = Object.entries(options.tags).map(([selector, definition]) => ({
			...definition,
			selector: selector || "*"
		}));
		options.selectors.push(...tagDefinitions);
		options.selectors = mergeDuplicatesPreferLast(options.selectors, ((s) => s.selector));
	}
	function set(obj, path, value) {
		const valueKey = path.pop();
		for (const key of path) {
			let nested = obj[key];
			if (!nested) {
				nested = {};
				obj[key] = nested;
			}
			obj = nested;
		}
		obj[valueKey] = value;
	}
	if (options["baseElement"]) {
		const baseElement = options["baseElement"];
		set(options, ["baseElements", "selectors"], Array.isArray(baseElement) ? baseElement : [baseElement]);
	}
	if (options["returnDomByDefault"] !== void 0) set(options, ["baseElements", "returnDomByDefault"], options["returnDomByDefault"]);
	for (const definition of options.selectors) if (definition.format === "anchor" && get(definition, ["options", "noLinkBrackets"])) set(definition, ["options", "linkBrackets"], false);
}
//#endregion
//#region ../../node_modules/@react-email/render/dist/node/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function getHtmlNode(path) {
	const topNode = path.node;
	if (topNode) return topNode;
	return path.stack?.[path.stack.length - 1];
}
function recursivelyMapDoc(doc, callback) {
	if (Array.isArray(doc)) return doc.map((innerDoc) => recursivelyMapDoc(innerDoc, callback));
	if (typeof doc === "object") {
		if (doc.type === "line") return callback(doc.soft ? "" : " ");
		if (doc.type === "group") return {
			...doc,
			contents: recursivelyMapDoc(doc.contents, callback),
			expandedStates: recursivelyMapDoc(doc.expandedStates, callback)
		};
		if ("contents" in doc) return {
			...doc,
			contents: recursivelyMapDoc(doc.contents, callback)
		};
		if ("parts" in doc) return {
			...doc,
			parts: recursivelyMapDoc(doc.parts, callback)
		};
		if (doc.type === "if-break") return {
			...doc,
			breakContents: recursivelyMapDoc(doc.breakContents, callback),
			flatContents: recursivelyMapDoc(doc.flatContents, callback)
		};
		const nextDoc = { ...doc };
		for (const [key, value] of Object.entries(nextDoc)) if (value && typeof value === "object") nextDoc[key] = recursivelyMapDoc(value, callback);
		return nextDoc;
	}
	return callback(doc);
}
const modifiedHtml = { ...html_exports };
if (modifiedHtml.printers) {
	const previousPrint = modifiedHtml.printers.html.print;
	modifiedHtml.printers.html.print = (path, options, print, args) => {
		const node = getHtmlNode(path);
		const rawPrintingResult = previousPrint(path, options, print, args);
		if (node?.type === "ieConditionalComment" || node?.kind === "ieConditionalComment") return recursivelyMapDoc(rawPrintingResult, (doc) => {
			if (typeof doc === "object" && doc.type === "line") return doc.soft ? "" : " ";
			return doc;
		});
		return rawPrintingResult;
	};
}
const defaults = {
	endOfLine: "lf",
	tabWidth: 2,
	plugins: [modifiedHtml],
	bracketSameLine: true,
	parser: "html"
};
const pretty = (str, options = {}) => {
	return Jn(str.replaceAll("\0", ""), {
		...defaults,
		...options
	});
};
const plainTextSelectors = [
	{
		selector: "img",
		format: "skip"
	},
	{
		selector: "[data-skip-in-text=true]",
		format: "skip"
	},
	{
		selector: "a",
		options: {
			linkBrackets: false,
			hideLinkHrefIfSameAsText: true
		}
	}
];
function toPlainText(html, options) {
	return convert(html, {
		wordwrap: false,
		...options,
		selectors: [...plainTextSelectors, ...options?.selectors ?? []]
	});
}
function createErrorBoundary(reject) {
	if (!import_react.Component) return (props) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: props.children });
	return class ErrorBoundary extends import_react.Component {
		componentDidCatch(error) {
			reject(error);
		}
		render() {
			return this.props.children;
		}
	};
}
const readStream = async (stream) => {
	let result = "";
	const decoder = new TextDecoder("utf-8");
	if ("pipeTo" in stream) {
		const writableStream = new WritableStream({
			write(chunk) {
				result += decoder.decode(chunk, { stream: true });
			},
			close() {
				result += decoder.decode();
			}
		});
		await stream.pipeTo(writableStream);
	} else {
		const writable = new Writable({
			write(chunk, _encoding, callback) {
				result += decoder.decode(chunk, { stream: true });
				callback();
			},
			final(callback) {
				result += decoder.decode();
				callback();
			}
		});
		await new Promise((resolve, reject) => {
			writable.on("pipe", (source) => {
				source.on("error", (err) => {
					writable.destroy(err);
				});
			});
			writable.on("error", reject);
			writable.on("close", () => {
				resolve();
			});
			stream.pipe(writable);
		});
	}
	return result;
};
const render = async (node, options) => {
	const reactDOMServer = await import("./server.node-D6AE3Za3.mjs").then((m) => /* @__PURE__ */ __toESM(m.default, 1)).then((m) => {
		if ("default" in m) return m.default;
		return m;
	});
	let html;
	await new Promise((resolve, reject) => {
		if (Object.hasOwn(reactDOMServer, "renderToReadableStream") && typeof WritableStream !== "undefined") {
			const ErrorBoundary = createErrorBoundary(reject);
			reactDOMServer.renderToReadableStream(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { children: node }) }), {
				progressiveChunkSize: Number.POSITIVE_INFINITY,
				onError(error) {
					reject(error);
				}
			}).then(async (stream) => {
				await stream.allReady;
				return readStream(stream);
			}).then((result) => {
				html = result;
				resolve();
			}).catch(reject);
		} else {
			const ErrorBoundary = createErrorBoundary(reject);
			const stream = reactDOMServer.renderToPipeableStream(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { children: node }) }), {
				async onAllReady() {
					html = await readStream(stream).then((s) => {
						return s.replaceAll("\0", "");
					});
					resolve();
				},
				onError(error) {
					reject(error);
				},
				progressiveChunkSize: Number.POSITIVE_INFINITY
			});
		}
	});
	if (options?.plainText) return toPlainText(html, options.htmlToTextOptions);
	const document = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">${html.replace(/<!DOCTYPE.*?>/, "")}`;
	if (options?.pretty) return pretty(document);
	return document;
};
//#endregion
export { require_jsx_runtime as a, toPlainText as i, pretty as n, render as r, plainTextSelectors as t };

//# sourceMappingURL=node-BivvR2_8.mjs.map