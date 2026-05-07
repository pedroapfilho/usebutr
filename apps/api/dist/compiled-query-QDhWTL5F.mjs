import { A as isBoolean, D as asArray, E as IdentifierNode, F as isNumber, I as isObject, L as isReadonlyArray, N as isFunction, O as freeze, P as isNull, R as isString, S as AliasNode, _ as isJSONOperator, a as SetOperationNode, b as AndNode, c as WhenNode, d as InsertQueryNode, f as ParensNode, g as OperatorNode, h as OPERATORS, k as isBigInt, l as UsingNode, m as RawNode, o as WithSchemaPlugin, p as logOnce, u as ListNode, v as JoinNode, x as TableNode, y as OrNode, z as isUndefined } from "./migrator-CVfj9o-J.mjs";
//#region ../../node_modules/kysely/dist/esm/operation-node/operation-node-source.js
function isOperationNodeSource(obj) {
	return isObject(obj) && isFunction(obj.toOperationNode);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/expression/expression.js
function isExpression(obj) {
	return isObject(obj) && "expressionType" in obj && isOperationNodeSource(obj);
}
function isAliasedExpression(obj) {
	return isObject(obj) && "expression" in obj && isString(obj.alias) && isOperationNodeSource(obj);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/select-modifier-node.js
/**
* @internal
*/
const SelectModifierNode = freeze({
	is(node) {
		return node.kind === "SelectModifierNode";
	},
	create(modifier, of) {
		return freeze({
			kind: "SelectModifierNode",
			modifier,
			of
		});
	},
	createWithExpression(modifier) {
		return freeze({
			kind: "SelectModifierNode",
			rawModifier: modifier
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/binary-operation-node.js
/**
* @internal
*/
const BinaryOperationNode = freeze({
	is(node) {
		return node.kind === "BinaryOperationNode";
	},
	create(leftOperand, operator, rightOperand) {
		return freeze({
			kind: "BinaryOperationNode",
			leftOperand,
			operator,
			rightOperand
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/column-node.js
/**
* @internal
*/
const ColumnNode = freeze({
	is(node) {
		return node.kind === "ColumnNode";
	},
	create(column) {
		return freeze({
			kind: "ColumnNode",
			column: IdentifierNode.create(column)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/select-all-node.js
/**
* @internal
*/
const SelectAllNode = freeze({
	is(node) {
		return node.kind === "SelectAllNode";
	},
	create() {
		return freeze({ kind: "SelectAllNode" });
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/reference-node.js
/**
* @internal
*/
const ReferenceNode = freeze({
	is(node) {
		return node.kind === "ReferenceNode";
	},
	create(column, table) {
		return freeze({
			kind: "ReferenceNode",
			table,
			column
		});
	},
	createSelectAll(table) {
		return freeze({
			kind: "ReferenceNode",
			table,
			column: SelectAllNode.create()
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/dynamic/dynamic-reference-builder.js
var DynamicReferenceBuilder = class {
	#dynamicReference;
	get dynamicReference() {
		return this.#dynamicReference;
	}
	/**
	* @private
	*
	* This needs to be here just so that the typings work. Without this
	* the generated .d.ts file contains no reference to the type param R
	* which causes this type to be equal to DynamicReferenceBuilder with
	* any R.
	*/
	get refType() {}
	constructor(reference) {
		this.#dynamicReference = reference;
	}
	toOperationNode() {
		return parseSimpleReferenceExpression(this.#dynamicReference);
	}
};
function isDynamicReferenceBuilder(obj) {
	return isObject(obj) && isOperationNodeSource(obj) && isString(obj.dynamicReference);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/order-by-item-node.js
/**
* @internal
*/
const OrderByItemNode = freeze({
	is(node) {
		return node.kind === "OrderByItemNode";
	},
	create(orderBy, direction) {
		return freeze({
			kind: "OrderByItemNode",
			orderBy,
			direction
		});
	},
	cloneWith(node, props) {
		return freeze({
			...node,
			...props
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/collate-node.js
/**
* @internal
*/
const CollateNode = freeze({
	is(node) {
		return node.kind === "CollateNode";
	},
	create(collation) {
		return freeze({
			kind: "CollateNode",
			collation: IdentifierNode.create(collation)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/order-by-item-builder.js
var OrderByItemBuilder = class OrderByItemBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Adds `desc` to the `order by` item.
	*
	* See {@link asc} for the opposite.
	*/
	desc() {
		return new OrderByItemBuilder({ node: OrderByItemNode.cloneWith(this.#props.node, { direction: RawNode.createWithSql("desc") }) });
	}
	/**
	* Adds `asc` to the `order by` item.
	*
	* See {@link desc} for the opposite.
	*/
	asc() {
		return new OrderByItemBuilder({ node: OrderByItemNode.cloneWith(this.#props.node, { direction: RawNode.createWithSql("asc") }) });
	}
	/**
	* Adds `nulls last` to the `order by` item.
	*
	* This is only supported by some dialects like PostgreSQL and SQLite.
	*
	* See {@link nullsFirst} for the opposite.
	*/
	nullsLast() {
		return new OrderByItemBuilder({ node: OrderByItemNode.cloneWith(this.#props.node, { nulls: "last" }) });
	}
	/**
	* Adds `nulls first` to the `order by` item.
	*
	* This is only supported by some dialects like PostgreSQL and SQLite.
	*
	* See {@link nullsLast} for the opposite.
	*/
	nullsFirst() {
		return new OrderByItemBuilder({ node: OrderByItemNode.cloneWith(this.#props.node, { nulls: "first" }) });
	}
	/**
	* Adds `collate <collationName>` to the `order by` item.
	*/
	collate(collation) {
		return new OrderByItemBuilder({ node: OrderByItemNode.cloneWith(this.#props.node, { collation: CollateNode.create(collation) }) });
	}
	toOperationNode() {
		return this.#props.node;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/order-by-parser.js
function isOrderByDirection(thing) {
	return thing === "asc" || thing === "desc";
}
function parseOrderBy(args) {
	if (args.length === 2) return [parseOrderByItem(args[0], args[1])];
	if (args.length === 1) {
		const [orderBy] = args;
		if (Array.isArray(orderBy)) {
			logOnce("orderBy(array) is deprecated, use multiple orderBy calls instead.");
			return orderBy.map((item) => parseOrderByItem(item));
		}
		return [parseOrderByItem(orderBy)];
	}
	throw new Error(`Invalid number of arguments at order by! expected 1-2, received ${args.length}`);
}
function parseOrderByItem(expr, modifiers) {
	const parsedRef = parseOrderByExpression(expr);
	if (OrderByItemNode.is(parsedRef)) {
		if (modifiers) throw new Error("Cannot specify direction twice!");
		return parsedRef;
	}
	return parseOrderByWithModifiers(parsedRef, modifiers);
}
function parseOrderByExpression(expr) {
	if (isExpressionOrFactory(expr)) return parseExpression(expr);
	if (isDynamicReferenceBuilder(expr)) return expr.toOperationNode();
	const [ref, direction] = expr.split(" ");
	if (direction) {
		logOnce("`orderBy('column asc')` is deprecated. Use `orderBy('column', 'asc')` instead.");
		return parseOrderByWithModifiers(parseStringReference(ref), direction);
	}
	return parseStringReference(expr);
}
function parseOrderByWithModifiers(expr, modifiers) {
	if (typeof modifiers === "string") {
		if (!isOrderByDirection(modifiers)) throw new Error(`Invalid order by direction: ${modifiers}`);
		return OrderByItemNode.create(expr, RawNode.createWithSql(modifiers));
	}
	if (isExpression(modifiers)) {
		logOnce("`orderBy(..., expr)` is deprecated. Use `orderBy(..., 'asc')` or `orderBy(..., (ob) => ...)` instead.");
		return OrderByItemNode.create(expr, modifiers.toOperationNode());
	}
	const node = OrderByItemNode.create(expr);
	if (!modifiers) return node;
	return modifiers(new OrderByItemBuilder({ node })).toOperationNode();
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/json-reference-node.js
/**
* @internal
*/
const JSONReferenceNode = freeze({
	is(node) {
		return node.kind === "JSONReferenceNode";
	},
	create(reference, traversal) {
		return freeze({
			kind: "JSONReferenceNode",
			reference,
			traversal
		});
	},
	cloneWithTraversal(node, traversal) {
		return freeze({
			...node,
			traversal
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/json-operator-chain-node.js
/**
* @internal
*/
const JSONOperatorChainNode = freeze({
	is(node) {
		return node.kind === "JSONOperatorChainNode";
	},
	create(operator) {
		return freeze({
			kind: "JSONOperatorChainNode",
			operator,
			values: freeze([])
		});
	},
	cloneWithValue(node, value) {
		return freeze({
			...node,
			values: freeze([...node.values, value])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/json-path-node.js
/**
* @internal
*/
const JSONPathNode = freeze({
	is(node) {
		return node.kind === "JSONPathNode";
	},
	create(inOperator) {
		return freeze({
			kind: "JSONPathNode",
			inOperator,
			pathLegs: freeze([])
		});
	},
	cloneWithLeg(jsonPathNode, pathLeg) {
		return freeze({
			...jsonPathNode,
			pathLegs: freeze([...jsonPathNode.pathLegs, pathLeg])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/reference-parser.js
function parseSimpleReferenceExpression(exp) {
	if (isString(exp)) return parseStringReference(exp);
	return exp.toOperationNode();
}
function parseReferenceExpressionOrList(arg) {
	if (isReadonlyArray(arg)) return arg.map((it) => parseReferenceExpression(it));
	else return [parseReferenceExpression(arg)];
}
function parseReferenceExpression(exp) {
	if (isExpressionOrFactory(exp)) return parseExpression(exp);
	return parseSimpleReferenceExpression(exp);
}
function parseJSONReference(ref, op) {
	const referenceNode = parseStringReference(ref);
	if (isJSONOperator(op)) return JSONReferenceNode.create(referenceNode, JSONOperatorChainNode.create(OperatorNode.create(op)));
	const opWithoutLastChar = op.slice(0, -1);
	if (isJSONOperator(opWithoutLastChar)) return JSONReferenceNode.create(referenceNode, JSONPathNode.create(OperatorNode.create(opWithoutLastChar)));
	throw new Error(`Invalid JSON operator: ${op}`);
}
function parseStringReference(ref) {
	const COLUMN_SEPARATOR = ".";
	if (!ref.includes(COLUMN_SEPARATOR)) return ReferenceNode.create(ColumnNode.create(ref));
	const parts = ref.split(COLUMN_SEPARATOR).map(trim$1);
	if (parts.length === 3) return parseStringReferenceWithTableAndSchema(parts);
	if (parts.length === 2) return parseStringReferenceWithTable(parts);
	throw new Error(`invalid column reference ${ref}`);
}
function parseAliasedStringReference(ref) {
	const ALIAS_SEPARATOR = " as ";
	if (ref.includes(ALIAS_SEPARATOR)) {
		const [columnRef, alias] = ref.split(ALIAS_SEPARATOR).map(trim$1);
		return AliasNode.create(parseStringReference(columnRef), IdentifierNode.create(alias));
	} else return parseStringReference(ref);
}
function parseColumnName(column) {
	return ColumnNode.create(column);
}
function parseOrderedColumnName(column) {
	const ORDER_SEPARATOR = " ";
	if (column.includes(ORDER_SEPARATOR)) {
		const [columnName, order] = column.split(ORDER_SEPARATOR).map(trim$1);
		if (!isOrderByDirection(order)) throw new Error(`invalid order direction "${order}" next to "${columnName}"`);
		return parseOrderBy([columnName, order])[0];
	} else return parseColumnName(column);
}
function parseStringReferenceWithTableAndSchema(parts) {
	const [schema, table, column] = parts;
	return ReferenceNode.create(ColumnNode.create(column), TableNode.createWithSchema(schema, table));
}
function parseStringReferenceWithTable(parts) {
	const [table, column] = parts;
	return ReferenceNode.create(ColumnNode.create(column), TableNode.create(table));
}
function trim$1(str) {
	return str.trim();
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/primitive-value-list-node.js
/**
* @internal
*/
const PrimitiveValueListNode = freeze({
	is(node) {
		return node.kind === "PrimitiveValueListNode";
	},
	create(values) {
		return freeze({
			kind: "PrimitiveValueListNode",
			values: freeze([...values])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/value-list-node.js
/**
* @internal
*/
const ValueListNode = freeze({
	is(node) {
		return node.kind === "ValueListNode";
	},
	create(values) {
		return freeze({
			kind: "ValueListNode",
			values: freeze(values)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/value-node.js
/**
* @internal
*/
const ValueNode = freeze({
	is(node) {
		return node.kind === "ValueNode";
	},
	create(value) {
		return freeze({
			kind: "ValueNode",
			value
		});
	},
	createImmediate(value) {
		return freeze({
			kind: "ValueNode",
			value,
			immediate: true
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/value-parser.js
function parseValueExpressionOrList(arg) {
	if (isReadonlyArray(arg)) return parseValueExpressionList(arg);
	return parseValueExpression(arg);
}
function parseValueExpression(exp) {
	if (isExpressionOrFactory(exp)) return parseExpression(exp);
	return ValueNode.create(exp);
}
function isSafeImmediateValue(value) {
	return isNumber(value) || isBoolean(value) || isNull(value);
}
function parseSafeImmediateValue(value) {
	if (!isSafeImmediateValue(value)) throw new Error(`unsafe immediate value ${JSON.stringify(value)}`);
	return ValueNode.createImmediate(value);
}
function parseValueExpressionList(arg) {
	if (arg.some(isExpressionOrFactory)) return ValueListNode.create(arg.map((it) => parseValueExpression(it)));
	return PrimitiveValueListNode.create(arg);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/binary-operation-parser.js
function parseValueBinaryOperationOrExpression(args) {
	if (args.length === 3) return parseValueBinaryOperation(args[0], args[1], args[2]);
	else if (args.length === 1) return parseValueExpression(args[0]);
	throw new Error(`invalid arguments: ${JSON.stringify(args)}`);
}
function parseValueBinaryOperation(left, operator, right) {
	if (isIsOperator(operator) && needsIsOperator(right)) return BinaryOperationNode.create(parseReferenceExpression(left), parseOperator(operator), ValueNode.createImmediate(right));
	return BinaryOperationNode.create(parseReferenceExpression(left), parseOperator(operator), parseValueExpressionOrList(right));
}
function parseReferentialBinaryOperation(left, operator, right) {
	return BinaryOperationNode.create(parseReferenceExpression(left), parseOperator(operator), parseReferenceExpression(right));
}
function parseFilterObject(obj, combinator) {
	return parseFilterList(Object.entries(obj).filter(([, v]) => !isUndefined(v)).map(([k, v]) => parseValueBinaryOperation(k, needsIsOperator(v) ? "is" : "=", v)), combinator);
}
function parseFilterList(list, combinator, withParens = true) {
	const combine = combinator === "and" ? AndNode.create : OrNode.create;
	if (list.length === 0) return BinaryOperationNode.create(ValueNode.createImmediate(1), OperatorNode.create("="), ValueNode.createImmediate(combinator === "and" ? 1 : 0));
	let node = toOperationNode(list[0]);
	for (let i = 1; i < list.length; ++i) node = combine(node, toOperationNode(list[i]));
	if (list.length > 1 && withParens) return ParensNode.create(node);
	return node;
}
function isIsOperator(operator) {
	return operator === "is" || operator === "is not";
}
function needsIsOperator(value) {
	return isNull(value) || isBoolean(value);
}
function parseOperator(operator) {
	if (isString(operator) && OPERATORS.includes(operator)) return OperatorNode.create(operator);
	if (isOperationNodeSource(operator)) return operator.toOperationNode();
	throw new Error(`invalid operator ${JSON.stringify(operator)}`);
}
function toOperationNode(nodeOrSource) {
	return isOperationNodeSource(nodeOrSource) ? nodeOrSource.toOperationNode() : nodeOrSource;
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/order-by-node.js
/**
* @internal
*/
const OrderByNode = freeze({
	is(node) {
		return node.kind === "OrderByNode";
	},
	create(items) {
		return freeze({
			kind: "OrderByNode",
			items: freeze([...items])
		});
	},
	cloneWithItems(orderBy, items) {
		return freeze({
			...orderBy,
			items: freeze([...orderBy.items, ...items])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/partition-by-node.js
/**
* @internal
*/
const PartitionByNode = freeze({
	is(node) {
		return node.kind === "PartitionByNode";
	},
	create(items) {
		return freeze({
			kind: "PartitionByNode",
			items: freeze(items)
		});
	},
	cloneWithItems(partitionBy, items) {
		return freeze({
			...partitionBy,
			items: freeze([...partitionBy.items, ...items])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/over-node.js
/**
* @internal
*/
const OverNode = freeze({
	is(node) {
		return node.kind === "OverNode";
	},
	create() {
		return freeze({ kind: "OverNode" });
	},
	cloneWithOrderByItems(overNode, items) {
		return freeze({
			...overNode,
			orderBy: overNode.orderBy ? OrderByNode.cloneWithItems(overNode.orderBy, items) : OrderByNode.create(items)
		});
	},
	cloneWithPartitionByItems(overNode, items) {
		return freeze({
			...overNode,
			partitionBy: overNode.partitionBy ? PartitionByNode.cloneWithItems(overNode.partitionBy, items) : PartitionByNode.create(items)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/from-node.js
/**
* @internal
*/
const FromNode = freeze({
	is(node) {
		return node.kind === "FromNode";
	},
	create(froms) {
		return freeze({
			kind: "FromNode",
			froms: freeze(froms)
		});
	},
	cloneWithFroms(from, froms) {
		return freeze({
			...from,
			froms: freeze([...from.froms, ...froms])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/group-by-node.js
/**
* @internal
*/
const GroupByNode = freeze({
	is(node) {
		return node.kind === "GroupByNode";
	},
	create(items) {
		return freeze({
			kind: "GroupByNode",
			items: freeze(items)
		});
	},
	cloneWithItems(groupBy, items) {
		return freeze({
			...groupBy,
			items: freeze([...groupBy.items, ...items])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/having-node.js
/**
* @internal
*/
const HavingNode = freeze({
	is(node) {
		return node.kind === "HavingNode";
	},
	create(filter) {
		return freeze({
			kind: "HavingNode",
			having: filter
		});
	},
	cloneWithOperation(havingNode, operator, operation) {
		return freeze({
			...havingNode,
			having: operator === "And" ? AndNode.create(havingNode.having, operation) : OrNode.create(havingNode.having, operation)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/update-query-node.js
/**
* @internal
*/
const UpdateQueryNode = freeze({
	is(node) {
		return node.kind === "UpdateQueryNode";
	},
	create(tables, withNode) {
		return freeze({
			kind: "UpdateQueryNode",
			table: tables.length === 1 ? tables[0] : ListNode.create(tables),
			...withNode && { with: withNode }
		});
	},
	createWithoutTable() {
		return freeze({ kind: "UpdateQueryNode" });
	},
	cloneWithFromItems(updateQuery, fromItems) {
		return freeze({
			...updateQuery,
			from: updateQuery.from ? FromNode.cloneWithFroms(updateQuery.from, fromItems) : FromNode.create(fromItems)
		});
	},
	cloneWithUpdates(updateQuery, updates) {
		return freeze({
			...updateQuery,
			updates: updateQuery.updates ? freeze([...updateQuery.updates, ...updates]) : updates
		});
	},
	cloneWithLimit(updateQuery, limit) {
		return freeze({
			...updateQuery,
			limit
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/delete-query-node.js
/**
* @internal
*/
const DeleteQueryNode = freeze({
	is(node) {
		return node.kind === "DeleteQueryNode";
	},
	create(fromItems, withNode) {
		return freeze({
			kind: "DeleteQueryNode",
			from: FromNode.create(fromItems),
			...withNode && { with: withNode }
		});
	},
	/**
	* @deprecated Use `QueryNode.cloneWithoutOrderBy` instead.
	*/
	cloneWithOrderByItems: (node, items) => QueryNode.cloneWithOrderByItems(node, items),
	/**
	* @deprecated Use `QueryNode.cloneWithoutOrderBy` instead.
	*/
	cloneWithoutOrderBy: (node) => QueryNode.cloneWithoutOrderBy(node),
	cloneWithLimit(deleteNode, limit) {
		return freeze({
			...deleteNode,
			limit
		});
	},
	cloneWithoutLimit(deleteNode) {
		return freeze({
			...deleteNode,
			limit: void 0
		});
	},
	cloneWithUsing(deleteNode, tables) {
		return freeze({
			...deleteNode,
			using: deleteNode.using !== void 0 ? UsingNode.cloneWithTables(deleteNode.using, tables) : UsingNode.create(tables)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/where-node.js
/**
* @internal
*/
const WhereNode = freeze({
	is(node) {
		return node.kind === "WhereNode";
	},
	create(filter) {
		return freeze({
			kind: "WhereNode",
			where: filter
		});
	},
	cloneWithOperation(whereNode, operator, operation) {
		return freeze({
			...whereNode,
			where: operator === "And" ? AndNode.create(whereNode.where, operation) : OrNode.create(whereNode.where, operation)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/returning-node.js
/**
* @internal
*/
const ReturningNode = freeze({
	is(node) {
		return node.kind === "ReturningNode";
	},
	create(selections) {
		return freeze({
			kind: "ReturningNode",
			selections: freeze(selections)
		});
	},
	cloneWithSelections(returning, selections) {
		return freeze({
			...returning,
			selections: returning.selections ? freeze([...returning.selections, ...selections]) : freeze(selections)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/explain-node.js
/**
* @internal
*/
const ExplainNode = freeze({
	is(node) {
		return node.kind === "ExplainNode";
	},
	create(format, options) {
		return freeze({
			kind: "ExplainNode",
			format,
			options
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/merge-query-node.js
/**
* @internal
*/
const MergeQueryNode = freeze({
	is(node) {
		return node.kind === "MergeQueryNode";
	},
	create(into, withNode) {
		return freeze({
			kind: "MergeQueryNode",
			into,
			...withNode && { with: withNode }
		});
	},
	cloneWithUsing(mergeNode, using) {
		return freeze({
			...mergeNode,
			using
		});
	},
	cloneWithWhen(mergeNode, when) {
		return freeze({
			...mergeNode,
			whens: mergeNode.whens ? freeze([...mergeNode.whens, when]) : freeze([when])
		});
	},
	cloneWithThen(mergeNode, then) {
		return freeze({
			...mergeNode,
			whens: mergeNode.whens ? freeze([...mergeNode.whens.slice(0, -1), WhenNode.cloneWithResult(mergeNode.whens[mergeNode.whens.length - 1], then)]) : void 0
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/output-node.js
/**
* @internal
*/
const OutputNode = freeze({
	is(node) {
		return node.kind === "OutputNode";
	},
	create(selections) {
		return freeze({
			kind: "OutputNode",
			selections: freeze(selections)
		});
	},
	cloneWithSelections(output, selections) {
		return freeze({
			...output,
			selections: output.selections ? freeze([...output.selections, ...selections]) : freeze(selections)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/query-node.js
/**
* @internal
*/
const QueryNode = freeze({
	is(node) {
		return SelectQueryNode.is(node) || InsertQueryNode.is(node) || UpdateQueryNode.is(node) || DeleteQueryNode.is(node) || MergeQueryNode.is(node);
	},
	cloneWithEndModifier(node, modifier) {
		return freeze({
			...node,
			endModifiers: node.endModifiers ? freeze([...node.endModifiers, modifier]) : freeze([modifier])
		});
	},
	cloneWithWhere(node, operation) {
		return freeze({
			...node,
			where: node.where ? WhereNode.cloneWithOperation(node.where, "And", operation) : WhereNode.create(operation)
		});
	},
	cloneWithJoin(node, join) {
		return freeze({
			...node,
			joins: node.joins ? freeze([...node.joins, join]) : freeze([join])
		});
	},
	cloneWithReturning(node, selections) {
		return freeze({
			...node,
			returning: node.returning ? ReturningNode.cloneWithSelections(node.returning, selections) : ReturningNode.create(selections)
		});
	},
	cloneWithoutReturning(node) {
		return freeze({
			...node,
			returning: void 0
		});
	},
	cloneWithoutWhere(node) {
		return freeze({
			...node,
			where: void 0
		});
	},
	cloneWithExplain(node, format, options) {
		return freeze({
			...node,
			explain: ExplainNode.create(format, options?.toOperationNode())
		});
	},
	cloneWithTop(node, top) {
		return freeze({
			...node,
			top
		});
	},
	cloneWithOutput(node, selections) {
		return freeze({
			...node,
			output: node.output ? OutputNode.cloneWithSelections(node.output, selections) : OutputNode.create(selections)
		});
	},
	cloneWithOrderByItems(node, items) {
		return freeze({
			...node,
			orderBy: node.orderBy ? OrderByNode.cloneWithItems(node.orderBy, items) : OrderByNode.create(items)
		});
	},
	cloneWithoutOrderBy(node) {
		return freeze({
			...node,
			orderBy: void 0
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/select-query-node.js
/**
* @internal
*/
const SelectQueryNode = freeze({
	is(node) {
		return node.kind === "SelectQueryNode";
	},
	create(withNode) {
		return freeze({
			kind: "SelectQueryNode",
			...withNode && { with: withNode }
		});
	},
	createFrom(fromItems, withNode) {
		return freeze({
			kind: "SelectQueryNode",
			from: FromNode.create(fromItems),
			...withNode && { with: withNode }
		});
	},
	cloneWithSelections(select, selections) {
		return freeze({
			...select,
			selections: select.selections ? freeze([...select.selections, ...selections]) : freeze(selections)
		});
	},
	cloneWithDistinctOn(select, expressions) {
		return freeze({
			...select,
			distinctOn: select.distinctOn ? freeze([...select.distinctOn, ...expressions]) : freeze(expressions)
		});
	},
	cloneWithFrontModifier(select, modifier) {
		return freeze({
			...select,
			frontModifiers: select.frontModifiers ? freeze([...select.frontModifiers, modifier]) : freeze([modifier])
		});
	},
	/**
	* @deprecated Use `QueryNode.cloneWithoutOrderBy` instead.
	*/
	cloneWithOrderByItems: (node, items) => QueryNode.cloneWithOrderByItems(node, items),
	cloneWithGroupByItems(selectNode, items) {
		return freeze({
			...selectNode,
			groupBy: selectNode.groupBy ? GroupByNode.cloneWithItems(selectNode.groupBy, items) : GroupByNode.create(items)
		});
	},
	cloneWithLimit(selectNode, limit) {
		return freeze({
			...selectNode,
			limit
		});
	},
	cloneWithOffset(selectNode, offset) {
		return freeze({
			...selectNode,
			offset
		});
	},
	cloneWithFetch(selectNode, fetch) {
		return freeze({
			...selectNode,
			fetch
		});
	},
	cloneWithHaving(selectNode, operation) {
		return freeze({
			...selectNode,
			having: selectNode.having ? HavingNode.cloneWithOperation(selectNode.having, "And", operation) : HavingNode.create(operation)
		});
	},
	cloneWithSetOperations(selectNode, setOperations) {
		return freeze({
			...selectNode,
			setOperations: selectNode.setOperations ? freeze([...selectNode.setOperations, ...setOperations]) : freeze([...setOperations])
		});
	},
	cloneWithoutSelections(select) {
		return freeze({
			...select,
			selections: []
		});
	},
	cloneWithoutLimit(select) {
		return freeze({
			...select,
			limit: void 0
		});
	},
	cloneWithoutOffset(select) {
		return freeze({
			...select,
			offset: void 0
		});
	},
	/**
	* @deprecated Use `QueryNode.cloneWithoutOrderBy` instead.
	*/
	cloneWithoutOrderBy: (node) => QueryNode.cloneWithoutOrderBy(node),
	cloneWithoutGroupBy(select) {
		return freeze({
			...select,
			groupBy: void 0
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/join-builder.js
var JoinBuilder = class JoinBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	on(...args) {
		return new JoinBuilder({
			...this.#props,
			joinNode: JoinNode.cloneWithOn(this.#props.joinNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	/**
	* Just like {@link WhereInterface.whereRef} but adds an item to the join's
	* `on` clause instead.
	*
	* See {@link WhereInterface.whereRef} for documentation and examples.
	*/
	onRef(lhs, op, rhs) {
		return new JoinBuilder({
			...this.#props,
			joinNode: JoinNode.cloneWithOn(this.#props.joinNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	/**
	* Adds `on true`.
	*/
	onTrue() {
		return new JoinBuilder({
			...this.#props,
			joinNode: JoinNode.cloneWithOn(this.#props.joinNode, RawNode.createWithSql("true"))
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*/
	$call(func) {
		return func(this);
	}
	toOperationNode() {
		return this.#props.joinNode;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/partition-by-item-node.js
/**
* @internal
*/
const PartitionByItemNode = freeze({
	is(node) {
		return node.kind === "PartitionByItemNode";
	},
	create(partitionBy) {
		return freeze({
			kind: "PartitionByItemNode",
			partitionBy
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/partition-by-parser.js
function parsePartitionBy(partitionBy) {
	return parseReferenceExpressionOrList(partitionBy).map(PartitionByItemNode.create);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/over-builder.js
var OverBuilder = class OverBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	orderBy(...args) {
		return new OverBuilder({ overNode: OverNode.cloneWithOrderByItems(this.#props.overNode, parseOrderBy(args)) });
	}
	clearOrderBy() {
		return new OverBuilder({ overNode: QueryNode.cloneWithoutOrderBy(this.#props.overNode) });
	}
	partitionBy(partitionBy) {
		return new OverBuilder({ overNode: OverNode.cloneWithPartitionByItems(this.#props.overNode, parsePartitionBy(partitionBy)) });
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*/
	$call(func) {
		return func(this);
	}
	toOperationNode() {
		return this.#props.overNode;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/selection-node.js
/**
* @internal
*/
const SelectionNode = freeze({
	is(node) {
		return node.kind === "SelectionNode";
	},
	create(selection) {
		return freeze({
			kind: "SelectionNode",
			selection
		});
	},
	createSelectAll() {
		return freeze({
			kind: "SelectionNode",
			selection: SelectAllNode.create()
		});
	},
	createSelectAllFromTable(table) {
		return freeze({
			kind: "SelectionNode",
			selection: ReferenceNode.createSelectAll(table)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/select-parser.js
function parseSelectArg(selection) {
	if (isFunction(selection)) return parseSelectArg(selection(expressionBuilder()));
	else if (isReadonlyArray(selection)) return selection.map((it) => parseSelectExpression(it));
	else return [parseSelectExpression(selection)];
}
function parseSelectExpression(selection) {
	if (isString(selection)) return SelectionNode.create(parseAliasedStringReference(selection));
	else if (isDynamicReferenceBuilder(selection)) return SelectionNode.create(selection.toOperationNode());
	else return SelectionNode.create(parseAliasedExpression(selection));
}
function parseSelectAll(table) {
	if (!table) return [SelectionNode.createSelectAll()];
	else if (Array.isArray(table)) return table.map(parseSelectAllArg);
	else return [parseSelectAllArg(table)];
}
function parseSelectAllArg(table) {
	if (isString(table)) return SelectionNode.createSelectAllFromTable(parseTable(table));
	throw new Error(`invalid value selectAll expression: ${JSON.stringify(table)}`);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/values-node.js
/**
* @internal
*/
const ValuesNode = freeze({
	is(node) {
		return node.kind === "ValuesNode";
	},
	create(values) {
		return freeze({
			kind: "ValuesNode",
			values: freeze(values)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/default-insert-value-node.js
/**
* @internal
*/
const DefaultInsertValueNode = freeze({
	is(node) {
		return node.kind === "DefaultInsertValueNode";
	},
	create() {
		return freeze({ kind: "DefaultInsertValueNode" });
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/insert-values-parser.js
function parseInsertExpression(arg) {
	const objectOrList = isFunction(arg) ? arg(expressionBuilder()) : arg;
	return parseInsertColumnsAndValues(isReadonlyArray(objectOrList) ? objectOrList : freeze([objectOrList]));
}
function parseInsertColumnsAndValues(rows) {
	const columns = parseColumnNamesAndIndexes(rows);
	return [freeze([...columns.keys()].map(ColumnNode.create)), ValuesNode.create(rows.map((row) => parseRowValues(row, columns)))];
}
function parseColumnNamesAndIndexes(rows) {
	const columns = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const cols = Object.keys(row);
		for (const col of cols) if (!columns.has(col) && row[col] !== void 0) columns.set(col, columns.size);
	}
	return columns;
}
function parseRowValues(row, columns) {
	const rowColumns = Object.keys(row);
	const rowValues = Array.from({ length: columns.size });
	let hasUndefinedOrComplexColumns = false;
	let indexedRowColumns = rowColumns.length;
	for (const col of rowColumns) {
		const columnIdx = columns.get(col);
		if (isUndefined(columnIdx)) {
			indexedRowColumns--;
			continue;
		}
		const value = row[col];
		if (isUndefined(value) || isExpressionOrFactory(value)) hasUndefinedOrComplexColumns = true;
		rowValues[columnIdx] = value;
	}
	if (indexedRowColumns < columns.size || hasUndefinedOrComplexColumns) {
		const defaultValue = DefaultInsertValueNode.create();
		return ValueListNode.create(rowValues.map((it) => isUndefined(it) ? defaultValue : parseValueExpression(it)));
	}
	return PrimitiveValueListNode.create(rowValues);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/column-update-node.js
/**
* @internal
*/
const ColumnUpdateNode = freeze({
	is(node) {
		return node.kind === "ColumnUpdateNode";
	},
	create(column, value) {
		return freeze({
			kind: "ColumnUpdateNode",
			column,
			value
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/update-set-parser.js
function parseUpdate(...args) {
	if (args.length === 2) return [ColumnUpdateNode.create(parseReferenceExpression(args[0]), parseValueExpression(args[1]))];
	return parseUpdateObjectExpression(args[0]);
}
function parseUpdateObjectExpression(update) {
	const updateObj = isFunction(update) ? update(expressionBuilder()) : update;
	return Object.entries(updateObj).filter(([_, value]) => value !== void 0).map(([key, value]) => {
		return ColumnUpdateNode.create(ColumnNode.create(key), parseValueExpression(value));
	});
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/on-duplicate-key-node.js
/**
* @internal
*/
const OnDuplicateKeyNode = freeze({
	is(node) {
		return node.kind === "OnDuplicateKeyNode";
	},
	create(updates) {
		return freeze({
			kind: "OnDuplicateKeyNode",
			updates
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/insert-result.js
/**
* The result of an insert query.
*
* If the table has an auto incrementing primary key {@link insertId} will hold
* the generated id on dialects that support it. For example PostgreSQL doesn't
* return the id by default and {@link insertId} is undefined. On PostgreSQL you
* need to use {@link ReturningInterface.returning} or {@link ReturningInterface.returningAll}
* to get out the inserted id.
*
* {@link numInsertedOrUpdatedRows} holds the number of (actually) inserted rows.
* On MySQL, updated rows are counted twice when using `on duplicate key update`.
*
* ### Examples
*
* ```ts
* import type { NewPerson } from 'type-editor' // imaginary module
*
* async function insertPerson(person: NewPerson) {
*   const result = await db
*     .insertInto('person')
*     .values(person)
*     .executeTakeFirstOrThrow()
*
*   console.log(result.insertId) // relevant on MySQL
*   console.log(result.numInsertedOrUpdatedRows) // always relevant
* }
* ```
*/
var InsertResult = class {
	/**
	* The auto incrementing primary key of the inserted row.
	*
	* This property can be undefined when the query contains an `on conflict`
	* clause that makes the query succeed even when nothing gets inserted.
	*
	* This property is always undefined on dialects like PostgreSQL that
	* don't return the inserted id by default. On those dialects you need
	* to use the {@link ReturningInterface.returning | returning} method.
	*/
	insertId;
	/**
	* Affected rows count.
	*/
	numInsertedOrUpdatedRows;
	constructor(insertId, numInsertedOrUpdatedRows) {
		this.insertId = insertId;
		this.numInsertedOrUpdatedRows = numInsertedOrUpdatedRows;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/no-result-error.js
var NoResultError = class extends Error {
	/**
	* The operation node tree of the query that was executed.
	*/
	node;
	constructor(node) {
		super("no result");
		this.node = node;
	}
};
function isNoResultErrorConstructor(fn) {
	return Object.prototype.hasOwnProperty.call(fn, "prototype");
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/on-conflict-node.js
/**
* @internal
*/
const OnConflictNode = freeze({
	is(node) {
		return node.kind === "OnConflictNode";
	},
	create() {
		return freeze({ kind: "OnConflictNode" });
	},
	cloneWith(node, props) {
		return freeze({
			...node,
			...props
		});
	},
	cloneWithIndexWhere(node, operation) {
		return freeze({
			...node,
			indexWhere: node.indexWhere ? WhereNode.cloneWithOperation(node.indexWhere, "And", operation) : WhereNode.create(operation)
		});
	},
	cloneWithIndexOrWhere(node, operation) {
		return freeze({
			...node,
			indexWhere: node.indexWhere ? WhereNode.cloneWithOperation(node.indexWhere, "Or", operation) : WhereNode.create(operation)
		});
	},
	cloneWithUpdateWhere(node, operation) {
		return freeze({
			...node,
			updateWhere: node.updateWhere ? WhereNode.cloneWithOperation(node.updateWhere, "And", operation) : WhereNode.create(operation)
		});
	},
	cloneWithUpdateOrWhere(node, operation) {
		return freeze({
			...node,
			updateWhere: node.updateWhere ? WhereNode.cloneWithOperation(node.updateWhere, "Or", operation) : WhereNode.create(operation)
		});
	},
	cloneWithoutIndexWhere(node) {
		return freeze({
			...node,
			indexWhere: void 0
		});
	},
	cloneWithoutUpdateWhere(node) {
		return freeze({
			...node,
			updateWhere: void 0
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/on-conflict-builder.js
var OnConflictBuilder = class OnConflictBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Specify a single column as the conflict target.
	*
	* Also see the {@link columns}, {@link constraint} and {@link expression}
	* methods for alternative ways to specify the conflict target.
	*/
	column(column) {
		const columnNode = ColumnNode.create(column);
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { columns: this.#props.onConflictNode.columns ? freeze([...this.#props.onConflictNode.columns, columnNode]) : freeze([columnNode]) })
		});
	}
	/**
	* Specify a list of columns as the conflict target.
	*
	* Also see the {@link column}, {@link constraint} and {@link expression}
	* methods for alternative ways to specify the conflict target.
	*/
	columns(columns) {
		const columnNodes = columns.map(ColumnNode.create);
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { columns: this.#props.onConflictNode.columns ? freeze([...this.#props.onConflictNode.columns, ...columnNodes]) : freeze(columnNodes) })
		});
	}
	/**
	* Specify a specific constraint by name as the conflict target.
	*
	* Also see the {@link column}, {@link columns} and {@link expression}
	* methods for alternative ways to specify the conflict target.
	*/
	constraint(constraintName) {
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { constraint: IdentifierNode.create(constraintName) })
		});
	}
	/**
	* Specify an expression as the conflict target.
	*
	* This can be used if the unique index is an expression index.
	*
	* Also see the {@link column}, {@link columns} and {@link constraint}
	* methods for alternative ways to specify the conflict target.
	*/
	expression(expression) {
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { indexExpression: expression.toOperationNode() })
		});
	}
	where(...args) {
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithIndexWhere(this.#props.onConflictNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	whereRef(lhs, op, rhs) {
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithIndexWhere(this.#props.onConflictNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	clearWhere() {
		return new OnConflictBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithoutIndexWhere(this.#props.onConflictNode)
		});
	}
	/**
	* Adds the "do nothing" conflict action.
	*
	* ### Examples
	*
	* ```ts
	* const id = 1
	* const first_name = 'John'
	*
	* await db
	*   .insertInto('person')
	*   .values({ first_name, id })
	*   .onConflict((oc) => oc
	*     .column('id')
	*     .doNothing()
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "id")
	* values ($1, $2)
	* on conflict ("id") do nothing
	* ```
	*/
	doNothing() {
		return new OnConflictDoNothingBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { doNothing: true })
		});
	}
	/**
	* Adds the "do update set" conflict action.
	*
	* ### Examples
	*
	* ```ts
	* const id = 1
	* const first_name = 'John'
	*
	* await db
	*   .insertInto('person')
	*   .values({ first_name, id })
	*   .onConflict((oc) => oc
	*     .column('id')
	*     .doUpdateSet({ first_name })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "id")
	* values ($1, $2)
	* on conflict ("id")
	* do update set "first_name" = $3
	* ```
	*
	* In the next example we use the `ref` method to reference
	* columns of the virtual table `excluded` in a type-safe way
	* to create an upsert operation:
	*
	* ```ts
	* import type { NewPerson } from 'type-editor' // imaginary module
	*
	* async function upsertPerson(person: NewPerson): Promise<void> {
	*   await db.insertInto('person')
	*     .values(person)
	*     .onConflict((oc) => oc
	*       .column('id')
	*       .doUpdateSet((eb) => ({
	*         first_name: eb.ref('excluded.first_name'),
	*         last_name: eb.ref('excluded.last_name')
	*       })
	*     )
	*   )
	*   .execute()
	* }
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "last_name")
	* values ($1, $2)
	* on conflict ("id")
	* do update set
	*  "first_name" = excluded."first_name",
	*  "last_name" = excluded."last_name"
	* ```
	*/
	doUpdateSet(update) {
		return new OnConflictUpdateBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWith(this.#props.onConflictNode, { updates: parseUpdateObjectExpression(update) })
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*/
	$call(func) {
		return func(this);
	}
};
var OnConflictDoNothingBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	toOperationNode() {
		return this.#props.onConflictNode;
	}
};
var OnConflictUpdateBuilder = class OnConflictUpdateBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	where(...args) {
		return new OnConflictUpdateBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithUpdateWhere(this.#props.onConflictNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	/**
	* Specify a where condition for the update operation.
	*
	* See {@link WhereInterface.whereRef} for more info.
	*/
	whereRef(lhs, op, rhs) {
		return new OnConflictUpdateBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithUpdateWhere(this.#props.onConflictNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	clearWhere() {
		return new OnConflictUpdateBuilder({
			...this.#props,
			onConflictNode: OnConflictNode.cloneWithoutUpdateWhere(this.#props.onConflictNode)
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*/
	$call(func) {
		return func(this);
	}
	toOperationNode() {
		return this.#props.onConflictNode;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/top-node.js
/**
* @internal
*/
const TopNode = freeze({
	is(node) {
		return node.kind === "TopNode";
	},
	create(expression, modifiers) {
		return freeze({
			kind: "TopNode",
			expression,
			modifiers
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/top-parser.js
function parseTop(expression, modifiers) {
	if (!isNumber(expression) && !isBigInt(expression)) throw new Error(`Invalid top expression: ${expression}`);
	if (!isUndefined(modifiers) && !isTopModifiers(modifiers)) throw new Error(`Invalid top modifiers: ${modifiers}`);
	return TopNode.create(expression, modifiers);
}
function isTopModifiers(modifiers) {
	return modifiers === "percent" || modifiers === "with ties" || modifiers === "percent with ties";
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/or-action-node.js
/**
* @internal
*/
const OrActionNode = freeze({
	is(node) {
		return node.kind === "OrActionNode";
	},
	create(action) {
		return freeze({
			kind: "OrActionNode",
			action
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/insert-query-builder.js
var InsertQueryBuilder = class InsertQueryBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Sets the values to insert for an {@link Kysely.insertInto | insert} query.
	*
	* This method takes an object whose keys are column names and values are
	* values to insert. In addition to the column's type, the values can be
	* raw {@link sql} snippets or select queries.
	*
	* You must provide all fields you haven't explicitly marked as nullable
	* or optional using {@link Generated} or {@link ColumnType}.
	*
	* The return value of an `insert` query is an instance of {@link InsertResult}. The
	* {@link InsertResult.insertId | insertId} field holds the auto incremented primary
	* key if the database returned one.
	*
	* On PostgreSQL and some other dialects, you need to call `returning` to get
	* something out of the query.
	*
	* Also see the {@link expression} method for inserting the result of a select
	* query or any other expression.
	*
	* ### Examples
	*
	* <!-- siteExample("insert", "Single row", 10) -->
	*
	* Insert a single row:
	*
	* ```ts
	* const result = await db
	*   .insertInto('person')
	*   .values({
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston',
	*     age: 40
	*   })
	*   .executeTakeFirst()
	*
	* // `insertId` is only available on dialects that
	* // automatically return the id of the inserted row
	* // such as MySQL and SQLite. On PostgreSQL, for example,
	* // you need to add a `returning` clause to the query to
	* // get anything out. See the "returning data" example.
	* console.log(result.insertId)
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* insert into `person` (`first_name`, `last_name`, `age`) values (?, ?, ?)
	* ```
	*
	* <!-- siteExample("insert", "Multiple rows", 20) -->
	*
	* On dialects that support it (for example PostgreSQL) you can insert multiple
	* rows by providing an array. Note that the return value is once again very
	* dialect-specific. Some databases may only return the id of the *last* inserted
	* row and some return nothing at all unless you call `returning`.
	*
	* ```ts
	* await db
	*   .insertInto('person')
	*   .values([{
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston',
	*     age: 40,
	*   }, {
	*     first_name: 'Arnold',
	*     last_name: 'Schwarzenegger',
	*     age: 70,
	*   }])
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "last_name", "age") values (($1, $2, $3), ($4, $5, $6))
	* ```
	*
	* <!-- siteExample("insert", "Returning data", 30) -->
	*
	* On supported dialects like PostgreSQL you need to chain `returning` to the query to get
	* the inserted row's columns (or any other expression) as the return value. `returning`
	* works just like `select`. Refer to `select` method's examples and documentation for
	* more info.
	*
	* ```ts
	* const result = await db
	*   .insertInto('person')
	*   .values({
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston',
	*     age: 40,
	*   })
	*   .returning(['id', 'first_name as name'])
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "last_name", "age") values ($1, $2, $3) returning "id", "first_name" as "name"
	* ```
	*
	* <!-- siteExample("insert", "Complex values", 40) -->
	*
	* In addition to primitives, the values can also be arbitrary expressions.
	* You can build the expressions by using a callback and calling the methods
	* on the expression builder passed to it:
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* const ani = "Ani"
	* const ston = "ston"
	*
	* const result = await db
	*   .insertInto('person')
	*   .values(({ ref, selectFrom, fn }) => ({
	*     first_name: 'Jennifer',
	*     last_name: sql<string>`concat(${ani}, ${ston})`,
	*     middle_name: ref('first_name'),
	*     age: selectFrom('person')
	*       .select(fn.avg<number>('age').as('avg_age')),
	*   }))
	*   .executeTakeFirst()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" (
	*   "first_name",
	*   "last_name",
	*   "middle_name",
	*   "age"
	* )
	* values (
	*   $1,
	*   concat($2, $3),
	*   "first_name",
	*   (select avg("age") as "avg_age" from "person")
	* )
	* ```
	*
	* You can also use the callback version of subqueries or raw expressions:
	*
	* ```ts
	* await db.with('jennifer', (db) => db
	*   .selectFrom('person')
	*   .where('first_name', '=', 'Jennifer')
	*   .select(['id', 'first_name', 'gender'])
	*   .limit(1)
	* ).insertInto('pet').values((eb) => ({
	*   owner_id: eb.selectFrom('jennifer').select('id'),
	*   name: eb.selectFrom('jennifer').select('first_name'),
	*   species: 'cat',
	* }))
	* .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* with "jennifer" as (
	*   select "id", "first_name", "gender"
	*   from "person"
	*   where "first_name" = $1
	*   limit $2
	* )
	* insert into "pet" ("owner_id", "name", "species")
	* values (
	*  (select "id" from "jennifer"),
	*  (select "first_name" from "jennifer"),
	*  $3
	* )
	* ```
	*/
	values(insert) {
		const [columns, values] = parseInsertExpression(insert);
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, {
				columns,
				values
			})
		});
	}
	/**
	* Sets the columns to insert.
	*
	* The {@link values} method sets both the columns and the values and this method
	* is not needed. But if you are using the {@link expression} method, you can use
	* this method to set the columns to insert.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .columns(['first_name'])
	*   .expression((eb) => eb.selectFrom('pet').select('pet.name'))
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name")
	* select "pet"."name" from "pet"
	* ```
	*/
	columns(columns) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { columns: freeze(columns.map(ColumnNode.create)) })
		});
	}
	/**
	* Insert an arbitrary expression. For example the result of a select query.
	*
	* ### Examples
	*
	* <!-- siteExample("insert", "Insert subquery", 50) -->
	*
	* You can create an `INSERT INTO SELECT FROM` query using the `expression` method.
	* This API doesn't follow our WYSIWYG principles and might be a bit difficult to
	* remember. The reasons for this design stem from implementation difficulties.
	*
	* ```ts
	* const result = await db.insertInto('person')
	*   .columns(['first_name', 'last_name', 'age'])
	*   .expression((eb) => eb
	*     .selectFrom('pet')
	*     .select((eb) => [
	*       'pet.name',
	*       eb.val('Petson').as('last_name'),
	*       eb.lit(7).as('age'),
	*     ])
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "last_name", "age")
	* select "pet"."name", $1 as "last_name", 7 as "age from "pet"
	* ```
	*/
	expression(expression) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { values: parseExpression(expression) })
		});
	}
	/**
	* Creates an `insert into "person" default values` query.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .defaultValues()
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" default values
	* ```
	*/
	defaultValues() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { defaultValues: true })
		});
	}
	/**
	* This can be used to add any additional SQL to the end of the query.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db.insertInto('person')
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'male',
	*   })
	*   .modifyEnd(sql`-- This is a comment`)
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* insert into `person` ("first_name", "last_name", "gender")
	* values (?, ?, ?) -- This is a comment
	* ```
	*/
	modifyEnd(modifier) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, modifier.toOperationNode())
		});
	}
	/**
	* Changes an `insert into` query to an `insert ignore into` query.
	*
	* This is only supported by some dialects like MySQL.
	*
	* To avoid a footgun, when invoked with the SQLite dialect, this method will
	* be handled like {@link orIgnore}. See also, {@link orAbort}, {@link orFail},
	* {@link orReplace}, and {@link orRollback}.
	*
	* If you use the ignore modifier, ignorable errors that occur while executing the
	* insert statement are ignored. For example, without ignore, a row that duplicates
	* an existing unique index or primary key value in the table causes a duplicate-key
	* error and the statement is aborted. With ignore, the row is discarded and no error
	* occurs.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .ignore()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* insert ignore into `person` (`first_name`, `last_name`, `gender`) values (?, ?, ?)
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or ignore into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*/
	ignore() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("ignore") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert or ignore into` query.
	*
	* This is only supported by some dialects like SQLite.
	*
	* To avoid a footgun, when invoked with the MySQL dialect, this method will
	* be handled like {@link ignore}.
	*
	* See also, {@link orAbort}, {@link orFail}, {@link orReplace}, and {@link orRollback}.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .orIgnore()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or ignore into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* insert ignore into `person` (`first_name`, `last_name`, `gender`) values (?, ?, ?)
	* ```
	*/
	orIgnore() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("ignore") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert or abort into` query.
	*
	* This is only supported by some dialects like SQLite.
	*
	* See also, {@link orIgnore}, {@link orFail}, {@link orReplace}, and {@link orRollback}.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .orAbort()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or abort into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*/
	orAbort() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("abort") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert or fail into` query.
	*
	* This is only supported by some dialects like SQLite.
	*
	* See also, {@link orIgnore}, {@link orAbort}, {@link orReplace}, and {@link orRollback}.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .orFail()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or fail into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*/
	orFail() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("fail") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert or replace into` query.
	*
	* This is only supported by some dialects like SQLite.
	*
	* You can also use {@link Kysely.replaceInto} to achieve the same result.
	*
	* See also, {@link orIgnore}, {@link orAbort}, {@link orFail}, and {@link orRollback}.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .orReplace()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or replace into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*/
	orReplace() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("replace") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert or rollback into` query.
	*
	* This is only supported by some dialects like SQLite.
	*
	* See also, {@link orIgnore}, {@link orAbort}, {@link orFail}, and {@link orReplace}.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .orRollback()
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'female',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* insert or rollback into "person" ("first_name", "last_name", "gender") values (?, ?, ?)
	* ```
	*/
	orRollback() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { orAction: OrActionNode.create("rollback") })
		});
	}
	/**
	* Changes an `insert into` query to an `insert top into` query.
	*
	* `top` clause is only supported by some dialects like MS SQL Server.
	*
	* ### Examples
	*
	* Insert the first 5 rows:
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db.insertInto('person')
	*   .top(5)
	*   .columns(['first_name', 'gender'])
	*   .expression(
	*     (eb) => eb.selectFrom('pet').select(['name', sql.lit('other').as('gender')])
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* insert top(5) into "person" ("first_name", "gender") select "name", 'other' as "gender" from "pet"
	* ```
	*
	* Insert the first 50 percent of rows:
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db.insertInto('person')
	*   .top(50, 'percent')
	*   .columns(['first_name', 'gender'])
	*   .expression(
	*     (eb) => eb.selectFrom('pet').select(['name', sql.lit('other').as('gender')])
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* insert top(50) percent into "person" ("first_name", "gender") select "name", 'other' as "gender" from "pet"
	* ```
	*/
	top(expression, modifiers) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	/**
	* Adds an `on conflict` clause to the query.
	*
	* `on conflict` is only supported by some dialects like PostgreSQL and SQLite. On MySQL
	* you can use {@link ignore} and {@link onDuplicateKeyUpdate} to achieve similar results.
	*
	* ### Examples
	*
	* ```ts
	* await db
	*   .insertInto('pet')
	*   .values({
	*     name: 'Catto',
	*     species: 'cat',
	*     owner_id: 3,
	*   })
	*   .onConflict((oc) => oc
	*     .column('name')
	*     .doUpdateSet({ species: 'hamster' })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "pet" ("name", "species", "owner_id")
	* values ($1, $2, $3)
	* on conflict ("name")
	* do update set "species" = $4
	* ```
	*
	* You can provide the name of the constraint instead of a column name:
	*
	* ```ts
	* await db
	*   .insertInto('pet')
	*   .values({
	*     name: 'Catto',
	*     species: 'cat',
	*     owner_id: 3,
	*   })
	*   .onConflict((oc) => oc
	*     .constraint('pet_name_key')
	*     .doUpdateSet({ species: 'hamster' })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "pet" ("name", "species", "owner_id")
	* values ($1, $2, $3)
	* on conflict on constraint "pet_name_key"
	* do update set "species" = $4
	* ```
	*
	* You can also specify an expression as the conflict target in case
	* the unique index is an expression index:
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db
	*   .insertInto('pet')
	*   .values({
	*     name: 'Catto',
	*     species: 'cat',
	*     owner_id: 3,
	*   })
	*   .onConflict((oc) => oc
	*     .expression(sql<string>`lower(name)`)
	*     .doUpdateSet({ species: 'hamster' })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "pet" ("name", "species", "owner_id")
	* values ($1, $2, $3)
	* on conflict (lower(name))
	* do update set "species" = $4
	* ```
	*
	* You can add a filter for the update statement like this:
	*
	* ```ts
	* await db
	*   .insertInto('pet')
	*   .values({
	*     name: 'Catto',
	*     species: 'cat',
	*     owner_id: 3,
	*   })
	*   .onConflict((oc) => oc
	*     .column('name')
	*     .doUpdateSet({ species: 'hamster' })
	*     .where('excluded.name', '!=', 'Catto')
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "pet" ("name", "species", "owner_id")
	* values ($1, $2, $3)
	* on conflict ("name")
	* do update set "species" = $4
	* where "excluded"."name" != $5
	* ```
	*
	* You can create an `on conflict do nothing` clauses like this:
	*
	* ```ts
	* await db
	*   .insertInto('pet')
	*   .values({
	*     name: 'Catto',
	*     species: 'cat',
	*     owner_id: 3,
	*   })
	*   .onConflict((oc) => oc
	*     .column('name')
	*     .doNothing()
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "pet" ("name", "species", "owner_id")
	* values ($1, $2, $3)
	* on conflict ("name") do nothing
	* ```
	*
	* You can refer to the columns of the virtual `excluded` table
	* in a type-safe way using a callback and the `ref` method of
	* `ExpressionBuilder`:
	*
	* ```ts
	* await db.insertInto('person')
	*   .values({
	*     id: 1,
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'male',
	*   })
	*   .onConflict(oc => oc
	*     .column('id')
	*     .doUpdateSet({
	*       first_name: (eb) => eb.ref('excluded.first_name'),
	*       last_name: (eb) => eb.ref('excluded.last_name')
	*     })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* insert into "person" ("id", "first_name", "last_name", "gender")
	* values ($1, $2, $3, $4)
	* on conflict ("id")
	* do update set
	*  "first_name" = "excluded"."first_name",
	*  "last_name" = "excluded"."last_name"
	* ```
	*/
	onConflict(callback) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { onConflict: callback(new OnConflictBuilder({ onConflictNode: OnConflictNode.create() })).toOperationNode() })
		});
	}
	/**
	* Adds `on duplicate key update` to the query.
	*
	* If you specify `on duplicate key update`, and a row is inserted that would cause
	* a duplicate value in a unique index or primary key, an update of the old row occurs.
	*
	* This is only implemented by some dialects like MySQL. On most dialects you should
	* use {@link onConflict} instead.
	*
	* ### Examples
	*
	* ```ts
	* await db
	*   .insertInto('person')
	*   .values({
	*     id: 1,
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'male',
	*   })
	*   .onDuplicateKeyUpdate({ updated_at: new Date().toISOString() })
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* insert into `person` (`id`, `first_name`, `last_name`, `gender`)
	* values (?, ?, ?, ?)
	* on duplicate key update `updated_at` = ?
	* ```
	*/
	onDuplicateKeyUpdate(update) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: InsertQueryNode.cloneWith(this.#props.queryNode, { onDuplicateKey: OnDuplicateKeyNode.create(parseUpdateObjectExpression(update)) })
		});
	}
	returning(selection) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectArg(selection))
		});
	}
	returningAll() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectAll())
		});
	}
	output(args) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectArg(args))
		});
	}
	outputAll(table) {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectAll(table))
		});
	}
	/**
	* Clears all `returning` clauses from the query.
	*
	* ### Examples
	*
	* ```ts
	* await db.insertInto('person')
	*   .values({ first_name: 'James', last_name: 'Smith', gender: 'male' })
	*   .returning(['first_name'])
	*   .clearReturning()
	*   .execute()
	* ```
	*
	* The generated SQL(PostgreSQL):
	*
	* ```sql
	* insert into "person" ("first_name", "last_name", "gender") values ($1, $2, $3)
	* ```
	*/
	clearReturning() {
		return new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithoutReturning(this.#props.queryNode)
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*
	* If you want to conditionally call a method on `this`, see
	* the {@link $if} method.
	*
	* ### Examples
	*
	* The next example uses a helper function `log` to log a query:
	*
	* ```ts
	* import type { Compilable } from 'kysely'
	*
	* function log<T extends Compilable>(qb: T): T {
	*   console.log(qb.compile())
	*   return qb
	* }
	*
	* await db.insertInto('person')
	*   .values({ first_name: 'John', last_name: 'Doe', gender: 'male' })
	*   .$call(log)
	*   .execute()
	* ```
	*/
	$call(func) {
		return func(this);
	}
	/**
	* Call `func(this)` if `condition` is true.
	*
	* This method is especially handy with optional selects. Any `returning` or `returningAll`
	* method calls add columns as optional fields to the output type when called inside
	* the `func` callback. This is because we can't know if those selections were actually
	* made before running the code.
	*
	* You can also call any other methods inside the callback.
	*
	* ### Examples
	*
	* ```ts
	* import type { NewPerson } from 'type-editor' // imaginary module
	*
	* async function insertPerson(values: NewPerson, returnLastName: boolean) {
	*   return await db
	*     .insertInto('person')
	*     .values(values)
	*     .returning(['id', 'first_name'])
	*     .$if(returnLastName, (qb) => qb.returning('last_name'))
	*     .executeTakeFirstOrThrow()
	* }
	* ```
	*
	* Any selections added inside the `if` callback will be added as optional fields to the
	* output type since we can't know if the selections were actually made before running
	* the code. In the example above the return type of the `insertPerson` function is:
	*
	* ```ts
	* Promise<{
	*   id: number
	*   first_name: string
	*   last_name?: string
	* }>
	* ```
	*/
	$if(condition, func) {
		if (condition) return func(this);
		return new InsertQueryBuilder({ ...this.#props });
	}
	/**
	* Change the output type of the query.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `InsertQueryBuilder` with a new output type.
	*/
	$castTo() {
		return new InsertQueryBuilder(this.#props);
	}
	/**
	* Narrows (parts of) the output type of the query.
	*
	* Kysely tries to be as type-safe as possible, but in some cases we have to make
	* compromises for better maintainability and compilation performance. At present,
	* Kysely doesn't narrow the output type of the query based on {@link values} input
	* when using {@link returning} or {@link returningAll}.
	*
	* This utility method is very useful for these situations, as it removes unncessary
	* runtime assertion/guard code. Its input type is limited to the output type
	* of the query, so you can't add a column that doesn't exist, or change a column's
	* type to something that doesn't exist in its union type.
	*
	* ### Examples
	*
	* Turn this code:
	*
	* ```ts
	* import type { Person } from 'type-editor' // imaginary module
	*
	* const person = await db.insertInto('person')
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'male',
	*     nullable_column: 'hell yeah!'
	*   })
	*   .returningAll()
	*   .executeTakeFirstOrThrow()
	*
	* if (isWithNoNullValue(person)) {
	*   functionThatExpectsPersonWithNonNullValue(person)
	* }
	*
	* function isWithNoNullValue(person: Person): person is Person & { nullable_column: string } {
	*   return person.nullable_column != null
	* }
	* ```
	*
	* Into this:
	*
	* ```ts
	* import type { NotNull } from 'kysely'
	*
	* const person = await db.insertInto('person')
	*   .values({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*     gender: 'male',
	*     nullable_column: 'hell yeah!'
	*   })
	*   .returningAll()
	*   .$narrowType<{ nullable_column: NotNull }>()
	*   .executeTakeFirstOrThrow()
	*
	* functionThatExpectsPersonWithNonNullValue(person)
	* ```
	*/
	$narrowType() {
		return new InsertQueryBuilder(this.#props);
	}
	/**
	* Asserts that query's output row type equals the given type `T`.
	*
	* This method can be used to simplify excessively complex types to make TypeScript happy
	* and much faster.
	*
	* Kysely uses complex type magic to achieve its type safety. This complexity is sometimes too much
	* for TypeScript and you get errors like this:
	*
	* ```
	* error TS2589: Type instantiation is excessively deep and possibly infinite.
	* ```
	*
	* In these case you can often use this method to help TypeScript a little bit. When you use this
	* method to assert the output type of a query, Kysely can drop the complex output type that
	* consists of multiple nested helper types and replace it with the simple asserted type.
	*
	* Using this method doesn't reduce type safety at all. You have to pass in a type that is
	* structurally equal to the current type.
	*
	* ### Examples
	*
	* ```ts
	* import type { NewPerson, NewPet, Species } from 'type-editor' // imaginary module
	*
	* async function insertPersonAndPet(person: NewPerson, pet: Omit<NewPet, 'owner_id'>) {
	*   return await db
	*     .with('new_person', (qb) => qb
	*       .insertInto('person')
	*       .values(person)
	*       .returning('id')
	*       .$assertType<{ id: number }>()
	*     )
	*     .with('new_pet', (qb) => qb
	*       .insertInto('pet')
	*       .values((eb) => ({
	*         owner_id: eb.selectFrom('new_person').select('id'),
	*         ...pet
	*       }))
	*       .returning(['name as pet_name', 'species'])
	*       .$assertType<{ pet_name: string, species: Species }>()
	*     )
	*     .selectFrom(['new_person', 'new_pet'])
	*     .selectAll()
	*     .executeTakeFirstOrThrow()
	* }
	* ```
	*/
	$assertType() {
		return new InsertQueryBuilder(this.#props);
	}
	/**
	* Returns a copy of this InsertQueryBuilder instance with the given plugin installed.
	*/
	withPlugin(plugin) {
		return new InsertQueryBuilder({
			...this.#props,
			executor: this.#props.executor.withPlugin(plugin)
		});
	}
	toOperationNode() {
		return this.#props.executor.transformQuery(this.#props.queryNode, this.#props.queryId);
	}
	compile() {
		return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
	}
	/**
	* Executes the query and returns an array of rows.
	*
	* Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow} methods.
	*/
	async execute() {
		const compiledQuery = this.compile();
		const result = await this.#props.executor.executeQuery(compiledQuery);
		const { adapter } = this.#props.executor;
		const query = compiledQuery.query;
		if (query.returning && adapter.supportsReturning || query.output && adapter.supportsOutput) return result.rows;
		return [new InsertResult(result.insertId, result.numAffectedRows ?? BigInt(0))];
	}
	/**
	* Executes the query and returns the first result or undefined if
	* the query returned no result.
	*/
	async executeTakeFirst() {
		const [result] = await this.execute();
		return result;
	}
	/**
	* Executes the query and returns the first result or throws if
	* the query returned no result.
	*
	* By default an instance of {@link NoResultError} is thrown, but you can
	* provide a custom error class, or callback as the only argument to throw a different
	* error.
	*/
	async executeTakeFirstOrThrow(errorConstructor = NoResultError) {
		const result = await this.executeTakeFirst();
		if (result === void 0) throw isNoResultErrorConstructor(errorConstructor) ? new errorConstructor(this.toOperationNode()) : errorConstructor(this.toOperationNode());
		return result;
	}
	async *stream(chunkSize = 100) {
		const compiledQuery = this.compile();
		const stream = this.#props.executor.stream(compiledQuery, chunkSize);
		for await (const item of stream) yield* item.rows;
	}
	async explain(format, options) {
		return await new InsertQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithExplain(this.#props.queryNode, format, options)
		}).execute();
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/delete-result.js
var DeleteResult = class {
	numDeletedRows;
	constructor(numDeletedRows) {
		this.numDeletedRows = numDeletedRows;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/limit-node.js
/**
* @internal
*/
const LimitNode = freeze({
	is(node) {
		return node.kind === "LimitNode";
	},
	create(limit) {
		return freeze({
			kind: "LimitNode",
			limit
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/delete-query-builder.js
var _a$2;
var DeleteQueryBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	where(...args) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	whereRef(lhs, op, rhs) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	clearWhere() {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithoutWhere(this.#props.queryNode)
		});
	}
	/**
	* Changes a `delete from` query into a `delete top from` query.
	*
	* `top` clause is only supported by some dialects like MS SQL Server.
	*
	* ### Examples
	*
	* Delete the first 5 rows:
	*
	* ```ts
	* await db
	*   .deleteFrom('person')
	*   .top(5)
	*   .where('age', '>', 18)
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* delete top(5) from "person" where "age" > @1
	* ```
	*
	* Delete the first 50% of rows:
	*
	* ```ts
	* await db
	*   .deleteFrom('person')
	*   .top(50, 'percent')
	*   .where('age', '>', 18)
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* delete top(50) percent from "person" where "age" > @1
	* ```
	*/
	top(expression, modifiers) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	using(tables) {
		return new _a$2({
			...this.#props,
			queryNode: DeleteQueryNode.cloneWithUsing(this.#props.queryNode, parseTableExpressionOrList(tables))
		});
	}
	innerJoin(...args) {
		return this.#join("InnerJoin", args);
	}
	leftJoin(...args) {
		return this.#join("LeftJoin", args);
	}
	rightJoin(...args) {
		return this.#join("RightJoin", args);
	}
	fullJoin(...args) {
		return this.#join("FullJoin", args);
	}
	#join(joinType, args) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithJoin(this.#props.queryNode, parseJoin(joinType, args))
		});
	}
	returning(selection) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectArg(selection))
		});
	}
	returningAll(table) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectAll(table))
		});
	}
	output(args) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectArg(args))
		});
	}
	outputAll(table) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectAll(table))
		});
	}
	/**
	* Clears all `returning` clauses from the query.
	*
	* ### Examples
	*
	* ```ts
	* await db.deleteFrom('pet')
	*   .returningAll()
	*   .where('name', '=', 'Max')
	*   .clearReturning()
	*   .execute()
	* ```
	*
	* The generated SQL(PostgreSQL):
	*
	* ```sql
	* delete from "pet" where "name" = "Max"
	* ```
	*/
	clearReturning() {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithoutReturning(this.#props.queryNode)
		});
	}
	/**
	* Clears the `limit` clause from the query.
	*
	* ### Examples
	*
	* ```ts
	* await db.deleteFrom('pet')
	*   .returningAll()
	*   .where('name', '=', 'Max')
	*   .limit(5)
	*   .clearLimit()
	*   .execute()
	* ```
	*
	* The generated SQL(PostgreSQL):
	*
	* ```sql
	* delete from "pet" where "name" = "Max" returning *
	* ```
	*/
	clearLimit() {
		return new _a$2({
			...this.#props,
			queryNode: DeleteQueryNode.cloneWithoutLimit(this.#props.queryNode)
		});
	}
	orderBy(...args) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithOrderByItems(this.#props.queryNode, parseOrderBy(args))
		});
	}
	clearOrderBy() {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithoutOrderBy(this.#props.queryNode)
		});
	}
	/**
	* Adds a limit clause to the query.
	*
	* A limit clause in a delete query is only supported by some dialects
	* like MySQL.
	*
	* ### Examples
	*
	* Delete 5 oldest items in a table:
	*
	* ```ts
	* await db
	*   .deleteFrom('pet')
	*   .orderBy('created_at')
	*   .limit(5)
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* delete from `pet` order by `created_at` limit ?
	* ```
	*/
	limit(limit) {
		return new _a$2({
			...this.#props,
			queryNode: DeleteQueryNode.cloneWithLimit(this.#props.queryNode, LimitNode.create(parseValueExpression(limit)))
		});
	}
	/**
	* This can be used to add any additional SQL to the end of the query.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db.deleteFrom('person')
	*   .where('first_name', '=', 'John')
	*   .modifyEnd(sql`-- This is a comment`)
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* delete from `person`
	* where `first_name` = "John" -- This is a comment
	* ```
	*/
	modifyEnd(modifier) {
		return new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, modifier.toOperationNode())
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*
	* If you want to conditionally call a method on `this`, see
	* the {@link $if} method.
	*
	* ### Examples
	*
	* The next example uses a helper function `log` to log a query:
	*
	* ```ts
	* import type { Compilable } from 'kysely'
	*
	* function log<T extends Compilable>(qb: T): T {
	*   console.log(qb.compile())
	*   return qb
	* }
	*
	* await db.deleteFrom('person')
	*   .$call(log)
	*   .execute()
	* ```
	*/
	$call(func) {
		return func(this);
	}
	/**
	* Call `func(this)` if `condition` is true.
	*
	* This method is especially handy with optional selects. Any `returning` or `returningAll`
	* method calls add columns as optional fields to the output type when called inside
	* the `func` callback. This is because we can't know if those selections were actually
	* made before running the code.
	*
	* You can also call any other methods inside the callback.
	*
	* ### Examples
	*
	* ```ts
	* async function deletePerson(id: number, returnLastName: boolean) {
	*   return await db
	*     .deleteFrom('person')
	*     .where('id', '=', id)
	*     .returning(['id', 'first_name'])
	*     .$if(returnLastName, (qb) => qb.returning('last_name'))
	*     .executeTakeFirstOrThrow()
	* }
	* ```
	*
	* Any selections added inside the `if` callback will be added as optional fields to the
	* output type since we can't know if the selections were actually made before running
	* the code. In the example above the return type of the `deletePerson` function is:
	*
	* ```ts
	* Promise<{
	*   id: number
	*   first_name: string
	*   last_name?: string
	* }>
	* ```
	*/
	$if(condition, func) {
		if (condition) return func(this);
		return new _a$2({ ...this.#props });
	}
	/**
	* Change the output type of the query.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `DeleteQueryBuilder` with a new output type.
	*/
	$castTo() {
		return new _a$2(this.#props);
	}
	/**
	* Narrows (parts of) the output type of the query.
	*
	* Kysely tries to be as type-safe as possible, but in some cases we have to make
	* compromises for better maintainability and compilation performance. At present,
	* Kysely doesn't narrow the output type of the query when using {@link where} and {@link returning} or {@link returningAll}.
	*
	* This utility method is very useful for these situations, as it removes unncessary
	* runtime assertion/guard code. Its input type is limited to the output type
	* of the query, so you can't add a column that doesn't exist, or change a column's
	* type to something that doesn't exist in its union type.
	*
	* ### Examples
	*
	* Turn this code:
	*
	* ```ts
	* import type { Person } from 'type-editor' // imaginary module
	*
	* const person = await db.deleteFrom('person')
	*   .where('id', '=', 3)
	*   .where('nullable_column', 'is not', null)
	*   .returningAll()
	*   .executeTakeFirstOrThrow()
	*
	* if (isWithNoNullValue(person)) {
	*   functionThatExpectsPersonWithNonNullValue(person)
	* }
	*
	* function isWithNoNullValue(person: Person): person is Person & { nullable_column: string } {
	*   return person.nullable_column != null
	* }
	* ```
	*
	* Into this:
	*
	* ```ts
	* import type { NotNull } from 'kysely'
	*
	* const person = await db.deleteFrom('person')
	*   .where('id', '=', 3)
	*   .where('nullable_column', 'is not', null)
	*   .returningAll()
	*   .$narrowType<{ nullable_column: NotNull }>()
	*   .executeTakeFirstOrThrow()
	*
	* functionThatExpectsPersonWithNonNullValue(person)
	* ```
	*/
	$narrowType() {
		return new _a$2(this.#props);
	}
	/**
	* Asserts that query's output row type equals the given type `T`.
	*
	* This method can be used to simplify excessively complex types to make TypeScript happy
	* and much faster.
	*
	* Kysely uses complex type magic to achieve its type safety. This complexity is sometimes too much
	* for TypeScript and you get errors like this:
	*
	* ```
	* error TS2589: Type instantiation is excessively deep and possibly infinite.
	* ```
	*
	* In these case you can often use this method to help TypeScript a little bit. When you use this
	* method to assert the output type of a query, Kysely can drop the complex output type that
	* consists of multiple nested helper types and replace it with the simple asserted type.
	*
	* Using this method doesn't reduce type safety at all. You have to pass in a type that is
	* structurally equal to the current type.
	*
	* ### Examples
	*
	* ```ts
	* import type { Species } from 'type-editor' // imaginary module
	*
	* async function deletePersonAndPets(personId: number) {
	*   return await db
	*     .with('deleted_person', (qb) => qb
	*        .deleteFrom('person')
	*        .where('id', '=', personId)
	*        .returning('first_name')
	*        .$assertType<{ first_name: string }>()
	*     )
	*     .with('deleted_pets', (qb) => qb
	*       .deleteFrom('pet')
	*       .where('owner_id', '=', personId)
	*       .returning(['name as pet_name', 'species'])
	*       .$assertType<{ pet_name: string, species: Species }>()
	*     )
	*     .selectFrom(['deleted_person', 'deleted_pets'])
	*     .selectAll()
	*     .execute()
	* }
	* ```
	*/
	$assertType() {
		return new _a$2(this.#props);
	}
	/**
	* Returns a copy of this DeleteQueryBuilder instance with the given plugin installed.
	*/
	withPlugin(plugin) {
		return new _a$2({
			...this.#props,
			executor: this.#props.executor.withPlugin(plugin)
		});
	}
	toOperationNode() {
		return this.#props.executor.transformQuery(this.#props.queryNode, this.#props.queryId);
	}
	compile() {
		return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
	}
	/**
	* Executes the query and returns an array of rows.
	*
	* Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow} methods.
	*/
	async execute() {
		const compiledQuery = this.compile();
		const result = await this.#props.executor.executeQuery(compiledQuery);
		const { adapter } = this.#props.executor;
		const query = compiledQuery.query;
		if (query.returning && adapter.supportsReturning || query.output && adapter.supportsOutput) return result.rows;
		return [new DeleteResult(result.numAffectedRows ?? BigInt(0))];
	}
	/**
	* Executes the query and returns the first result or undefined if
	* the query returned no result.
	*/
	async executeTakeFirst() {
		const [result] = await this.execute();
		return result;
	}
	/**
	* Executes the query and returns the first result or throws if
	* the query returned no result.
	*
	* By default an instance of {@link NoResultError} is thrown, but you can
	* provide a custom error class, or callback as the only argument to throw a different
	* error.
	*/
	async executeTakeFirstOrThrow(errorConstructor = NoResultError) {
		const result = await this.executeTakeFirst();
		if (result === void 0) throw isNoResultErrorConstructor(errorConstructor) ? new errorConstructor(this.toOperationNode()) : errorConstructor(this.toOperationNode());
		return result;
	}
	async *stream(chunkSize = 100) {
		const compiledQuery = this.compile();
		const stream = this.#props.executor.stream(compiledQuery, chunkSize);
		for await (const item of stream) yield* item.rows;
	}
	async explain(format, options) {
		return await new _a$2({
			...this.#props,
			queryNode: QueryNode.cloneWithExplain(this.#props.queryNode, format, options)
		}).execute();
	}
};
_a$2 = DeleteQueryBuilder;
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/update-result.js
var UpdateResult = class {
	/**
	* The number of rows the update query updated (even if not changed).
	*/
	numUpdatedRows;
	/**
	* The number of rows the update query changed.
	*
	* This is **optional** and only supported in dialects such as MySQL.
	* You would probably use {@link numUpdatedRows} in most cases.
	*/
	numChangedRows;
	constructor(numUpdatedRows, numChangedRows) {
		this.numUpdatedRows = numUpdatedRows;
		this.numChangedRows = numChangedRows;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/update-query-builder.js
var _a$1;
var UpdateQueryBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	where(...args) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	whereRef(lhs, op, rhs) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	clearWhere() {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithoutWhere(this.#props.queryNode)
		});
	}
	/**
	* Changes an `update` query into a `update top` query.
	*
	* `top` clause is only supported by some dialects like MS SQL Server.
	*
	* ### Examples
	*
	* Update the first row:
	*
	* ```ts
	* await db.updateTable('person')
	*   .top(1)
	*   .set({ first_name: 'Foo' })
	*   .where('age', '>', 18)
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* update top(1) "person" set "first_name" = @1 where "age" > @2
	* ```
	*
	* Update the 50% first rows:
	*
	* ```ts
	* await db.updateTable('person')
	*   .top(50, 'percent')
	*   .set({ first_name: 'Foo' })
	*   .where('age', '>', 18)
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* update top(50) percent "person" set "first_name" = @1 where "age" > @2
	* ```
	*/
	top(expression, modifiers) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	from(from) {
		return new _a$1({
			...this.#props,
			queryNode: UpdateQueryNode.cloneWithFromItems(this.#props.queryNode, parseTableExpressionOrList(from))
		});
	}
	innerJoin(...args) {
		return this.#join("InnerJoin", args);
	}
	leftJoin(...args) {
		return this.#join("LeftJoin", args);
	}
	rightJoin(...args) {
		return this.#join("RightJoin", args);
	}
	fullJoin(...args) {
		return this.#join("FullJoin", args);
	}
	#join(joinType, args) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithJoin(this.#props.queryNode, parseJoin(joinType, args))
		});
	}
	orderBy(...args) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithOrderByItems(this.#props.queryNode, parseOrderBy(args))
		});
	}
	clearOrderBy() {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithoutOrderBy(this.#props.queryNode)
		});
	}
	/**
	* Adds a limit clause to the update query for supported databases, such as MySQL.
	*
	* ### Examples
	*
	* Update the first 2 rows in the 'person' table:
	*
	* ```ts
	* await db
	*   .updateTable('person')
	*   .set({ first_name: 'Foo' })
	*   .limit(2)
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* update `person` set `first_name` = ? limit ?
	* ```
	*/
	limit(limit) {
		return new _a$1({
			...this.#props,
			queryNode: UpdateQueryNode.cloneWithLimit(this.#props.queryNode, LimitNode.create(parseValueExpression(limit)))
		});
	}
	set(...args) {
		return new _a$1({
			...this.#props,
			queryNode: UpdateQueryNode.cloneWithUpdates(this.#props.queryNode, parseUpdate(...args))
		});
	}
	returning(selection) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectArg(selection))
		});
	}
	returningAll(table) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectAll(table))
		});
	}
	output(args) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectArg(args))
		});
	}
	outputAll(table) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectAll(table))
		});
	}
	/**
	* This can be used to add any additional SQL to the end of the query.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db.updateTable('person')
	*   .set({ age: 39 })
	*   .where('first_name', '=', 'John')
	*   .modifyEnd(sql.raw('-- This is a comment'))
	*   .execute()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* update `person`
	* set `age` = 39
	* where `first_name` = "John" -- This is a comment
	* ```
	*/
	modifyEnd(modifier) {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, modifier.toOperationNode())
		});
	}
	/**
	* Clears all `returning` clauses from the query.
	*
	* ### Examples
	*
	* ```ts
	* db.updateTable('person')
	*   .returningAll()
	*   .set({ age: 39 })
	*   .where('first_name', '=', 'John')
	*   .clearReturning()
	* ```
	*
	* The generated SQL(PostgreSQL):
	*
	* ```sql
	* update "person" set "age" = 39 where "first_name" = "John"
	* ```
	*/
	clearReturning() {
		return new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithoutReturning(this.#props.queryNode)
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*
	* If you want to conditionally call a method on `this`, see
	* the {@link $if} method.
	*
	* ### Examples
	*
	* The next example uses a helper function `log` to log a query:
	*
	* ```ts
	* import type { Compilable } from 'kysely'
	* import type { PersonUpdate } from 'type-editor' // imaginary module
	*
	* function log<T extends Compilable>(qb: T): T {
	*   console.log(qb.compile())
	*   return qb
	* }
	*
	* const values = {
	*   first_name: 'John',
	* } satisfies PersonUpdate
	*
	* db.updateTable('person')
	*   .set(values)
	*   .$call(log)
	*   .execute()
	* ```
	*/
	$call(func) {
		return func(this);
	}
	/**
	* Call `func(this)` if `condition` is true.
	*
	* This method is especially handy with optional selects. Any `returning` or `returningAll`
	* method calls add columns as optional fields to the output type when called inside
	* the `func` callback. This is because we can't know if those selections were actually
	* made before running the code.
	*
	* You can also call any other methods inside the callback.
	*
	* ### Examples
	*
	* ```ts
	* import type { PersonUpdate } from 'type-editor' // imaginary module
	*
	* async function updatePerson(id: number, updates: PersonUpdate, returnLastName: boolean) {
	*   return await db
	*     .updateTable('person')
	*     .set(updates)
	*     .where('id', '=', id)
	*     .returning(['id', 'first_name'])
	*     .$if(returnLastName, (qb) => qb.returning('last_name'))
	*     .executeTakeFirstOrThrow()
	* }
	* ```
	*
	* Any selections added inside the `if` callback will be added as optional fields to the
	* output type since we can't know if the selections were actually made before running
	* the code. In the example above the return type of the `updatePerson` function is:
	*
	* ```ts
	* Promise<{
	*   id: number
	*   first_name: string
	*   last_name?: string
	* }>
	* ```
	*/
	$if(condition, func) {
		if (condition) return func(this);
		return new _a$1({ ...this.#props });
	}
	/**
	* Change the output type of the query.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `UpdateQueryBuilder` with a new output type.
	*/
	$castTo() {
		return new _a$1(this.#props);
	}
	/**
	* Narrows (parts of) the output type of the query.
	*
	* Kysely tries to be as type-safe as possible, but in some cases we have to make
	* compromises for better maintainability and compilation performance. At present,
	* Kysely doesn't narrow the output type of the query based on {@link set} input
	* when using {@link where} and/or {@link returning} or {@link returningAll}.
	*
	* This utility method is very useful for these situations, as it removes unncessary
	* runtime assertion/guard code. Its input type is limited to the output type
	* of the query, so you can't add a column that doesn't exist, or change a column's
	* type to something that doesn't exist in its union type.
	*
	* ### Examples
	*
	* Turn this code:
	*
	* ```ts
	* import type { Person } from 'type-editor' // imaginary module
	*
	* const id = 1
	* const now = new Date().toISOString()
	*
	* const person = await db.updateTable('person')
	*   .set({ deleted_at: now })
	*   .where('id', '=', id)
	*   .where('nullable_column', 'is not', null)
	*   .returningAll()
	*   .executeTakeFirstOrThrow()
	*
	* if (isWithNoNullValue(person)) {
	*   functionThatExpectsPersonWithNonNullValue(person)
	* }
	*
	* function isWithNoNullValue(person: Person): person is Person & { nullable_column: string } {
	*   return person.nullable_column != null
	* }
	* ```
	*
	* Into this:
	*
	* ```ts
	* import type { NotNull } from 'kysely'
	*
	* const id = 1
	* const now = new Date().toISOString()
	*
	* const person = await db.updateTable('person')
	*   .set({ deleted_at: now })
	*   .where('id', '=', id)
	*   .where('nullable_column', 'is not', null)
	*   .returningAll()
	*   .$narrowType<{ deleted_at: Date; nullable_column: NotNull }>()
	*   .executeTakeFirstOrThrow()
	*
	* functionThatExpectsPersonWithNonNullValue(person)
	* ```
	*/
	$narrowType() {
		return new _a$1(this.#props);
	}
	/**
	* Asserts that query's output row type equals the given type `T`.
	*
	* This method can be used to simplify excessively complex types to make TypeScript happy
	* and much faster.
	*
	* Kysely uses complex type magic to achieve its type safety. This complexity is sometimes too much
	* for TypeScript and you get errors like this:
	*
	* ```
	* error TS2589: Type instantiation is excessively deep and possibly infinite.
	* ```
	*
	* In these case you can often use this method to help TypeScript a little bit. When you use this
	* method to assert the output type of a query, Kysely can drop the complex output type that
	* consists of multiple nested helper types and replace it with the simple asserted type.
	*
	* Using this method doesn't reduce type safety at all. You have to pass in a type that is
	* structurally equal to the current type.
	*
	* ### Examples
	*
	* ```ts
	* import type { PersonUpdate, PetUpdate, Species } from 'type-editor' // imaginary module
	*
	* const person = {
	*   id: 1,
	*   gender: 'other',
	* } satisfies PersonUpdate
	*
	* const pet = {
	*   name: 'Fluffy',
	* } satisfies PetUpdate
	*
	* const result = await db
	*   .with('updated_person', (qb) => qb
	*     .updateTable('person')
	*     .set(person)
	*     .where('id', '=', person.id)
	*     .returning('first_name')
	*     .$assertType<{ first_name: string }>()
	*   )
	*   .with('updated_pet', (qb) => qb
	*     .updateTable('pet')
	*     .set(pet)
	*     .where('owner_id', '=', person.id)
	*     .returning(['name as pet_name', 'species'])
	*     .$assertType<{ pet_name: string, species: Species }>()
	*   )
	*   .selectFrom(['updated_person', 'updated_pet'])
	*   .selectAll()
	*   .executeTakeFirstOrThrow()
	* ```
	*/
	$assertType() {
		return new _a$1(this.#props);
	}
	/**
	* Returns a copy of this UpdateQueryBuilder instance with the given plugin installed.
	*/
	withPlugin(plugin) {
		return new _a$1({
			...this.#props,
			executor: this.#props.executor.withPlugin(plugin)
		});
	}
	toOperationNode() {
		return this.#props.executor.transformQuery(this.#props.queryNode, this.#props.queryId);
	}
	compile() {
		return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
	}
	/**
	* Executes the query and returns an array of rows.
	*
	* Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow} methods.
	*/
	async execute() {
		const compiledQuery = this.compile();
		const result = await this.#props.executor.executeQuery(compiledQuery);
		const { adapter } = this.#props.executor;
		const query = compiledQuery.query;
		if (query.returning && adapter.supportsReturning || query.output && adapter.supportsOutput) return result.rows;
		return [new UpdateResult(result.numAffectedRows ?? BigInt(0), result.numChangedRows)];
	}
	/**
	* Executes the query and returns the first result or undefined if
	* the query returned no result.
	*/
	async executeTakeFirst() {
		const [result] = await this.execute();
		return result;
	}
	/**
	* Executes the query and returns the first result or throws if
	* the query returned no result.
	*
	* By default an instance of {@link NoResultError} is thrown, but you can
	* provide a custom error class, or callback as the only argument to throw a different
	* error.
	*/
	async executeTakeFirstOrThrow(errorConstructor = NoResultError) {
		const result = await this.executeTakeFirst();
		if (result === void 0) throw isNoResultErrorConstructor(errorConstructor) ? new errorConstructor(this.toOperationNode()) : errorConstructor(this.toOperationNode());
		return result;
	}
	async *stream(chunkSize = 100) {
		const compiledQuery = this.compile();
		const stream = this.#props.executor.stream(compiledQuery, chunkSize);
		for await (const item of stream) yield* item.rows;
	}
	async explain(format, options) {
		return await new _a$1({
			...this.#props,
			queryNode: QueryNode.cloneWithExplain(this.#props.queryNode, format, options)
		}).execute();
	}
};
_a$1 = UpdateQueryBuilder;
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/common-table-expression-name-node.js
/**
* @internal
*/
const CommonTableExpressionNameNode = freeze({
	is(node) {
		return node.kind === "CommonTableExpressionNameNode";
	},
	create(tableName, columnNames) {
		return freeze({
			kind: "CommonTableExpressionNameNode",
			table: TableNode.create(tableName),
			columns: columnNames ? freeze(columnNames.map(ColumnNode.create)) : void 0
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/common-table-expression-node.js
/**
* @internal
*/
const CommonTableExpressionNode = freeze({
	is(node) {
		return node.kind === "CommonTableExpressionNode";
	},
	create(name, expression) {
		return freeze({
			kind: "CommonTableExpressionNode",
			name,
			expression
		});
	},
	cloneWith(node, props) {
		return freeze({
			...node,
			...props
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/cte-builder.js
var CTEBuilder = class CTEBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Makes the common table expression materialized.
	*/
	materialized() {
		return new CTEBuilder({
			...this.#props,
			node: CommonTableExpressionNode.cloneWith(this.#props.node, { materialized: true })
		});
	}
	/**
	* Makes the common table expression not materialized.
	*/
	notMaterialized() {
		return new CTEBuilder({
			...this.#props,
			node: CommonTableExpressionNode.cloneWith(this.#props.node, { materialized: false })
		});
	}
	toOperationNode() {
		return this.#props.node;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/with-parser.js
function parseCommonTableExpression(nameOrBuilderCallback, expression) {
	const expressionNode = expression(createQueryCreator()).toOperationNode();
	if (isFunction(nameOrBuilderCallback)) return nameOrBuilderCallback(cteBuilderFactory(expressionNode)).toOperationNode();
	return CommonTableExpressionNode.create(parseCommonTableExpressionName(nameOrBuilderCallback), expressionNode);
}
function cteBuilderFactory(expressionNode) {
	return (name) => {
		return new CTEBuilder({ node: CommonTableExpressionNode.create(parseCommonTableExpressionName(name), expressionNode) });
	};
}
function parseCommonTableExpressionName(name) {
	if (name.includes("(")) {
		const parts = name.split(/[\(\)]/);
		const table = parts[0];
		const columns = parts[1].split(",").map((it) => it.trim());
		return CommonTableExpressionNameNode.create(table, columns);
	} else return CommonTableExpressionNameNode.create(name);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/with-node.js
/**
* @internal
*/
const WithNode = freeze({
	is(node) {
		return node.kind === "WithNode";
	},
	create(expression, params) {
		return freeze({
			kind: "WithNode",
			expressions: freeze([expression]),
			...params
		});
	},
	cloneWithExpression(withNode, expression) {
		return freeze({
			...withNode,
			expressions: freeze([...withNode.expressions, expression])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/random-string.js
const CHARS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9"
];
function randomString(length) {
	let chars = "";
	for (let i = 0; i < length; ++i) chars += randomChar();
	return chars;
}
function randomChar() {
	return CHARS[~~(Math.random() * CHARS.length)];
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/query-id.js
function createQueryId() {
	return new LazyQueryId();
}
var LazyQueryId = class {
	#queryId;
	get queryId() {
		if (this.#queryId === void 0) this.#queryId = randomString(8);
		return this.#queryId;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/matched-node.js
/**
* @internal
*/
const MatchedNode = freeze({
	is(node) {
		return node.kind === "MatchedNode";
	},
	create(not, bySource = false) {
		return freeze({
			kind: "MatchedNode",
			not,
			bySource
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/merge-parser.js
function parseMergeWhen(type, args, refRight) {
	return WhenNode.create(parseFilterList([MatchedNode.create(!type.isMatched, type.bySource), ...args && args.length > 0 ? [args.length === 3 && refRight ? parseReferentialBinaryOperation(args[0], args[1], args[2]) : parseValueBinaryOperationOrExpression(args)] : []], "and", false));
}
function parseMergeThen(result) {
	if (isString(result)) return RawNode.create([result], []);
	if (isOperationNodeSource(result)) return result.toOperationNode();
	return result;
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/deferred.js
var Deferred = class {
	#promise;
	#resolve;
	#reject;
	constructor() {
		this.#promise = new Promise((resolve, reject) => {
			this.#reject = reject;
			this.#resolve = resolve;
		});
	}
	get promise() {
		return this.#promise;
	}
	resolve = (value) => {
		if (this.#resolve) this.#resolve(value);
	};
	reject = (reason) => {
		if (this.#reject) this.#reject(reason);
	};
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/provide-controlled-connection.js
async function provideControlledConnection(connectionProvider) {
	const connectionDefer = new Deferred();
	const connectionReleaseDefer = new Deferred();
	connectionProvider.provideConnection(async (connection) => {
		connectionDefer.resolve(connection);
		return await connectionReleaseDefer.promise;
	}).catch((ex) => connectionDefer.reject(ex));
	return freeze({
		connection: await connectionDefer.promise,
		release: connectionReleaseDefer.resolve
	});
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-executor/query-executor-base.js
const NO_PLUGINS = freeze([]);
var QueryExecutorBase = class {
	#plugins;
	constructor(plugins = NO_PLUGINS) {
		this.#plugins = plugins;
	}
	get plugins() {
		return this.#plugins;
	}
	transformQuery(node, queryId) {
		for (const plugin of this.#plugins) {
			const transformedNode = plugin.transformQuery({
				node,
				queryId
			});
			if (transformedNode.kind === node.kind) node = transformedNode;
			else throw new Error([
				`KyselyPlugin.transformQuery must return a node`,
				`of the same kind that was given to it.`,
				`The plugin was given a ${node.kind}`,
				`but it returned a ${transformedNode.kind}`
			].join(" "));
		}
		return node;
	}
	async executeQuery(compiledQuery) {
		return await this.provideConnection(async (connection) => {
			const result = await connection.executeQuery(compiledQuery);
			if ("numUpdatedOrDeletedRows" in result) logOnce("kysely:warning: outdated driver/plugin detected! `QueryResult.numUpdatedOrDeletedRows` has been replaced with `QueryResult.numAffectedRows`.");
			return await this.#transformResult(result, compiledQuery.queryId);
		});
	}
	async *stream(compiledQuery, chunkSize) {
		const { connection, release } = await provideControlledConnection(this);
		try {
			for await (const result of connection.streamQuery(compiledQuery, chunkSize)) yield await this.#transformResult(result, compiledQuery.queryId);
		} finally {
			release();
		}
	}
	async #transformResult(result, queryId) {
		for (const plugin of this.#plugins) result = await plugin.transformResult({
			result,
			queryId
		});
		return result;
	}
};
const NOOP_QUERY_EXECUTOR = new class NoopQueryExecutor extends QueryExecutorBase {
	get adapter() {
		throw new Error("this query cannot be compiled to SQL");
	}
	compileQuery() {
		throw new Error("this query cannot be compiled to SQL");
	}
	provideConnection() {
		throw new Error("this query cannot be executed");
	}
	withConnectionProvider() {
		throw new Error("this query cannot have a connection provider");
	}
	withPlugin(plugin) {
		return new NoopQueryExecutor([...this.plugins, plugin]);
	}
	withPlugins(plugins) {
		return new NoopQueryExecutor([...this.plugins, ...plugins]);
	}
	withPluginAtFront(plugin) {
		return new NoopQueryExecutor([plugin, ...this.plugins]);
	}
	withoutPlugins() {
		return new NoopQueryExecutor([]);
	}
}();
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/merge-result.js
var MergeResult = class {
	numChangedRows;
	constructor(numChangedRows) {
		this.numChangedRows = numChangedRows;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/merge-query-builder.js
var MergeQueryBuilder = class MergeQueryBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* This can be used to add any additional SQL to the end of the query.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db
	*   .mergeInto('person')
	*   .using('pet', 'pet.owner_id', 'person.id')
	*   .whenMatched()
	*   .thenDelete()
	*   .modifyEnd(sql.raw('-- this is a comment'))
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person" using "pet" on "pet"."owner_id" = "person"."id" when matched then delete -- this is a comment
	* ```
	*/
	modifyEnd(modifier) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, modifier.toOperationNode())
		});
	}
	/**
	* Changes a `merge into` query to an `merge top into` query.
	*
	* `top` clause is only supported by some dialects like MS SQL Server.
	*
	* ### Examples
	*
	* Affect 5 matched rows at most:
	*
	* ```ts
	* await db.mergeInto('person')
	*   .top(5)
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenDelete()
	*   .execute()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* merge top(5) into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   delete
	* ```
	*
	* Affect 50% of matched rows:
	*
	* ```ts
	* await db.mergeInto('person')
	*   .top(50, 'percent')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenDelete()
	*   .execute()
	* ```
	*
	* The generated SQL (MS SQL Server):
	*
	* ```sql
	* merge top(50) percent into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   delete
	* ```
	*/
	top(expression, modifiers) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	using(...args) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithUsing(this.#props.queryNode, parseJoin("Using", args))
		});
	}
	returning(args) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectArg(args))
		});
	}
	returningAll(table) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectAll(table))
		});
	}
	output(args) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectArg(args))
		});
	}
	outputAll(table) {
		return new MergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectAll(table))
		});
	}
};
var WheneableMergeQueryBuilder = class WheneableMergeQueryBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* This can be used to add any additional SQL to the end of the query.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* await db
	*   .mergeInto('person')
	*   .using('pet', 'pet.owner_id', 'person.id')
	*   .whenMatched()
	*   .thenDelete()
	*   .modifyEnd(sql.raw('-- this is a comment'))
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person" using "pet" on "pet"."owner_id" = "person"."id" when matched then delete -- this is a comment
	* ```
	*/
	modifyEnd(modifier) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, modifier.toOperationNode())
		});
	}
	/**
	* See {@link MergeQueryBuilder.top}.
	*/
	top(expression, modifiers) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	/**
	* Adds a simple `when matched` clause to the query.
	*
	* For a `when matched` clause with an `and` condition, see {@link whenMatchedAnd}.
	*
	* For a simple `when not matched` clause, see {@link whenNotMatched}.
	*
	* For a `when not matched` clause with an `and` condition, see {@link whenNotMatchedAnd}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenDelete()
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   delete
	* ```
	*/
	whenMatched() {
		return this.#whenMatched([]);
	}
	whenMatchedAnd(...args) {
		return this.#whenMatched(args);
	}
	/**
	* Adds the `when matched` clause to the query with an `and` condition. But unlike
	* {@link whenMatchedAnd}, this method accepts a column reference as the 3rd argument.
	*
	* This method is similar to {@link SelectQueryBuilder.whereRef}, so see the documentation
	* for that method for more examples.
	*/
	whenMatchedAndRef(lhs, op, rhs) {
		return this.#whenMatched([
			lhs,
			op,
			rhs
		], true);
	}
	#whenMatched(args, refRight) {
		return new MatchedThenableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithWhen(this.#props.queryNode, parseMergeWhen({ isMatched: true }, args, refRight))
		});
	}
	/**
	* Adds a simple `when not matched` clause to the query.
	*
	* For a `when not matched` clause with an `and` condition, see {@link whenNotMatchedAnd}.
	*
	* For a simple `when matched` clause, see {@link whenMatched}.
	*
	* For a `when matched` clause with an `and` condition, see {@link whenMatchedAnd}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenNotMatched()
	*   .thenInsertValues({
	*     first_name: 'John',
	*     last_name: 'Doe',
	*   })
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when not matched then
	*   insert ("first_name", "last_name") values ($1, $2)
	* ```
	*/
	whenNotMatched() {
		return this.#whenNotMatched([]);
	}
	whenNotMatchedAnd(...args) {
		return this.#whenNotMatched(args);
	}
	/**
	* Adds the `when not matched` clause to the query with an `and` condition. But unlike
	* {@link whenNotMatchedAnd}, this method accepts a column reference as the 3rd argument.
	*
	* Unlike {@link whenMatchedAndRef}, you cannot reference columns from the target table.
	*
	* This method is similar to {@link SelectQueryBuilder.whereRef}, so see the documentation
	* for that method for more examples.
	*/
	whenNotMatchedAndRef(lhs, op, rhs) {
		return this.#whenNotMatched([
			lhs,
			op,
			rhs
		], true);
	}
	/**
	* Adds a simple `when not matched by source` clause to the query.
	*
	* Supported in MS SQL Server.
	*
	* Similar to {@link whenNotMatched}, but returns a {@link MatchedThenableMergeQueryBuilder}.
	*/
	whenNotMatchedBySource() {
		return this.#whenNotMatched([], false, true);
	}
	whenNotMatchedBySourceAnd(...args) {
		return this.#whenNotMatched(args, false, true);
	}
	/**
	* Adds the `when not matched by source` clause to the query with an `and` condition.
	*
	* Similar to {@link whenNotMatchedAndRef}, but you can reference columns from
	* the target table, and not from source table and returns a {@link MatchedThenableMergeQueryBuilder}.
	*/
	whenNotMatchedBySourceAndRef(lhs, op, rhs) {
		return this.#whenNotMatched([
			lhs,
			op,
			rhs
		], true, true);
	}
	returning(args) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectArg(args))
		});
	}
	returningAll(table) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithReturning(this.#props.queryNode, parseSelectAll(table))
		});
	}
	output(args) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectArg(args))
		});
	}
	outputAll(table) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: QueryNode.cloneWithOutput(this.#props.queryNode, parseSelectAll(table))
		});
	}
	#whenNotMatched(args, refRight = false, bySource = false) {
		const props = {
			...this.#props,
			queryNode: MergeQueryNode.cloneWithWhen(this.#props.queryNode, parseMergeWhen({
				isMatched: false,
				bySource
			}, args, refRight))
		};
		return new (bySource ? MatchedThenableMergeQueryBuilder : NotMatchedThenableMergeQueryBuilder)(props);
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*
	* If you want to conditionally call a method on `this`, see
	* the {@link $if} method.
	*
	* ### Examples
	*
	* The next example uses a helper function `log` to log a query:
	*
	* ```ts
	* import type { Compilable } from 'kysely'
	*
	* function log<T extends Compilable>(qb: T): T {
	*   console.log(qb.compile())
	*   return qb
	* }
	*
	* await db.updateTable('person')
	*   .set({ first_name: 'John' })
	*   .$call(log)
	*   .execute()
	* ```
	*/
	$call(func) {
		return func(this);
	}
	/**
	* Call `func(this)` if `condition` is true.
	*
	* This method is especially handy with optional selects. Any `returning` or `returningAll`
	* method calls add columns as optional fields to the output type when called inside
	* the `func` callback. This is because we can't know if those selections were actually
	* made before running the code.
	*
	* You can also call any other methods inside the callback.
	*
	* ### Examples
	*
	* ```ts
	* import type { PersonUpdate } from 'type-editor' // imaginary module
	*
	* async function updatePerson(id: number, updates: PersonUpdate, returnLastName: boolean) {
	*   return await db
	*     .updateTable('person')
	*     .set(updates)
	*     .where('id', '=', id)
	*     .returning(['id', 'first_name'])
	*     .$if(returnLastName, (qb) => qb.returning('last_name'))
	*     .executeTakeFirstOrThrow()
	* }
	* ```
	*
	* Any selections added inside the `if` callback will be added as optional fields to the
	* output type since we can't know if the selections were actually made before running
	* the code. In the example above the return type of the `updatePerson` function is:
	*
	* ```ts
	* Promise<{
	*   id: number
	*   first_name: string
	*   last_name?: string
	* }>
	* ```
	*/
	$if(condition, func) {
		if (condition) return func(this);
		return new WheneableMergeQueryBuilder({ ...this.#props });
	}
	toOperationNode() {
		return this.#props.executor.transformQuery(this.#props.queryNode, this.#props.queryId);
	}
	compile() {
		return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
	}
	/**
	* Executes the query and returns an array of rows.
	*
	* Also see the {@link executeTakeFirst} and {@link executeTakeFirstOrThrow} methods.
	*/
	async execute() {
		const compiledQuery = this.compile();
		const result = await this.#props.executor.executeQuery(compiledQuery);
		const { adapter } = this.#props.executor;
		const query = compiledQuery.query;
		if (query.returning && adapter.supportsReturning || query.output && adapter.supportsOutput) return result.rows;
		return [new MergeResult(result.numAffectedRows)];
	}
	/**
	* Executes the query and returns the first result or undefined if
	* the query returned no result.
	*/
	async executeTakeFirst() {
		const [result] = await this.execute();
		return result;
	}
	/**
	* Executes the query and returns the first result or throws if
	* the query returned no result.
	*
	* By default an instance of {@link NoResultError} is thrown, but you can
	* provide a custom error class, or callback as the only argument to throw a different
	* error.
	*/
	async executeTakeFirstOrThrow(errorConstructor = NoResultError) {
		const result = await this.executeTakeFirst();
		if (result === void 0) throw isNoResultErrorConstructor(errorConstructor) ? new errorConstructor(this.toOperationNode()) : errorConstructor(this.toOperationNode());
		return result;
	}
};
var MatchedThenableMergeQueryBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Performs the `delete` action.
	*
	* To perform the `do nothing` action, see {@link thenDoNothing}.
	*
	* To perform the `update` action, see {@link thenUpdate} or {@link thenUpdateSet}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenDelete()
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   delete
	* ```
	*/
	thenDelete() {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithThen(this.#props.queryNode, parseMergeThen("delete"))
		});
	}
	/**
	* Performs the `do nothing` action.
	*
	* This is supported in PostgreSQL.
	*
	* To perform the `delete` action, see {@link thenDelete}.
	*
	* To perform the `update` action, see {@link thenUpdate} or {@link thenUpdateSet}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenDoNothing()
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   do nothing
	* ```
	*/
	thenDoNothing() {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithThen(this.#props.queryNode, parseMergeThen("do nothing"))
		});
	}
	/**
	* Perform an `update` operation with a full-fledged {@link UpdateQueryBuilder}.
	* This is handy when multiple `set` invocations are needed.
	*
	* For a shorthand version of this method, see {@link thenUpdateSet}.
	*
	* To perform the `delete` action, see {@link thenDelete}.
	*
	* To perform the `do nothing` action, see {@link thenDoNothing}.
	*
	* ### Examples
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenMatched()
	*   .thenUpdate((ub) => ub
	*     .set(sql`metadata['has_pets']`, 'Y')
	*     .set({
	*       updated_at: new Date().toISOString(),
	*     })
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when matched then
	*   update set metadata['has_pets'] = $1, "updated_at" = $2
	* ```
	*/
	thenUpdate(set) {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithThen(this.#props.queryNode, parseMergeThen(set(new UpdateQueryBuilder({
				queryId: this.#props.queryId,
				executor: NOOP_QUERY_EXECUTOR,
				queryNode: UpdateQueryNode.createWithoutTable()
			}))))
		});
	}
	thenUpdateSet(...args) {
		return this.thenUpdate((ub) => ub.set(...args));
	}
};
var NotMatchedThenableMergeQueryBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Performs the `do nothing` action.
	*
	* This is supported in PostgreSQL.
	*
	* To perform the `insert` action, see {@link thenInsertValues}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db.mergeInto('person')
	*   .using('pet', 'person.id', 'pet.owner_id')
	*   .whenNotMatched()
	*   .thenDoNothing()
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet" on "person"."id" = "pet"."owner_id"
	* when not matched then
	*   do nothing
	* ```
	*/
	thenDoNothing() {
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithThen(this.#props.queryNode, parseMergeThen("do nothing"))
		});
	}
	thenInsertValues(insert) {
		const [columns, values] = parseInsertExpression(insert);
		return new WheneableMergeQueryBuilder({
			...this.#props,
			queryNode: MergeQueryNode.cloneWithThen(this.#props.queryNode, parseMergeThen(InsertQueryNode.cloneWith(InsertQueryNode.createWithoutInto(), {
				columns,
				values
			})))
		});
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-creator.js
var QueryCreator = class QueryCreator {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/**
	* Creates a `select` query builder for the given table or tables.
	*
	* The tables passed to this method are built as the query's `from` clause.
	*
	* ### Examples
	*
	* Create a select query for one table:
	*
	* ```ts
	* db.selectFrom('person').selectAll()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select * from "person"
	* ```
	*
	* Create a select query for one table with an alias:
	*
	* ```ts
	* const persons = await db.selectFrom('person as p')
	*   .select(['p.id', 'first_name'])
	*   .execute()
	*
	* console.log(persons[0].id)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "p"."id", "first_name" from "person" as "p"
	* ```
	*
	* Create a select query from a subquery:
	*
	* ```ts
	* const persons = await db.selectFrom(
	*     (eb) => eb.selectFrom('person').select('person.id as identifier').as('p')
	*   )
	*   .select('p.identifier')
	*   .execute()
	*
	* console.log(persons[0].identifier)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "p"."identifier",
	* from (
	*   select "person"."id" as "identifier" from "person"
	* ) as p
	* ```
	*
	* Create a select query from raw sql:
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* const items = await db
	*   .selectFrom(sql<{ one: number }>`(select 1 as one)`.as('q'))
	*   .select('q.one')
	*   .execute()
	*
	* console.log(items[0].one)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "q"."one",
	* from (
	*   select 1 as one
	* ) as q
	* ```
	*
	* When you use the `sql` tag you need to also provide the result type of the
	* raw snippet / query so that Kysely can figure out what columns are
	* available for the rest of the query.
	*
	* The `selectFrom` method also accepts an array for multiple tables. All
	* the above examples can also be used in an array.
	*
	* ```ts
	* import { sql } from 'kysely'
	*
	* const items = await db.selectFrom([
	*     'person as p',
	*     db.selectFrom('pet').select('pet.species').as('a'),
	*     sql<{ one: number }>`(select 1 as one)`.as('q')
	*   ])
	*   .select(['p.id', 'a.species', 'q.one'])
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "p".id, "a"."species", "q"."one"
	* from
	*   "person" as "p",
	*   (select "pet"."species" from "pet") as a,
	*   (select 1 as one) as "q"
	* ```
	*/
	selectFrom(from) {
		return createSelectQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: SelectQueryNode.createFrom(parseTableExpressionOrList(from), this.#props.withNode)
		});
	}
	selectNoFrom(selection) {
		return createSelectQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: SelectQueryNode.cloneWithSelections(SelectQueryNode.create(this.#props.withNode), parseSelectArg(selection))
		});
	}
	/**
	* Creates an insert query.
	*
	* The return value of this query is an instance of {@link InsertResult}. {@link InsertResult}
	* has the {@link InsertResult.insertId | insertId} field that holds the auto incremented id of
	* the inserted row if the db returned one.
	*
	* See the {@link InsertQueryBuilder.values | values} method for more info and examples. Also see
	* the {@link ReturningInterface.returning | returning} method for a way to return columns
	* on supported databases like PostgreSQL.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db
	*   .insertInto('person')
	*   .values({
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston'
	*   })
	*   .executeTakeFirst()
	*
	* console.log(result.insertId)
	* ```
	*
	* Some databases like PostgreSQL support the `returning` method:
	*
	* ```ts
	* const { id } = await db
	*   .insertInto('person')
	*   .values({
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston'
	*   })
	*   .returning('id')
	*   .executeTakeFirstOrThrow()
	* ```
	*/
	insertInto(table) {
		return new InsertQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: InsertQueryNode.create(parseTable(table), this.#props.withNode)
		});
	}
	/**
	* Creates a "replace into" query.
	*
	* This is only supported by some dialects like MySQL or SQLite.
	*
	* Similar to MySQL's {@link InsertQueryBuilder.onDuplicateKeyUpdate} that deletes
	* and inserts values on collision instead of updating existing rows.
	*
	* An alias of SQLite's {@link InsertQueryBuilder.orReplace}.
	*
	* The return value of this query is an instance of {@link InsertResult}. {@link InsertResult}
	* has the {@link InsertResult.insertId | insertId} field that holds the auto incremented id of
	* the inserted row if the db returned one.
	*
	* See the {@link InsertQueryBuilder.values | values} method for more info and examples.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db
	*   .replaceInto('person')
	*   .values({
	*     first_name: 'Jennifer',
	*     last_name: 'Aniston'
	*   })
	*   .executeTakeFirstOrThrow()
	*
	* console.log(result.insertId)
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* replace into `person` (`first_name`, `last_name`) values (?, ?)
	* ```
	*/
	replaceInto(table) {
		return new InsertQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: InsertQueryNode.create(parseTable(table), this.#props.withNode, true)
		});
	}
	/**
	* Creates a delete query.
	*
	* See the {@link DeleteQueryBuilder.where} method for examples on how to specify
	* a where clause for the delete operation.
	*
	* The return value of the query is an instance of {@link DeleteResult}.
	*
	* ### Examples
	*
	* <!-- siteExample("delete", "Single row", 10) -->
	*
	* Delete a single row:
	*
	* ```ts
	* const result = await db
	*   .deleteFrom('person')
	*   .where('person.id', '=', 1)
	*   .executeTakeFirst()
	*
	* console.log(result.numDeletedRows)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* delete from "person" where "person"."id" = $1
	* ```
	*
	* Some databases such as MySQL support deleting from multiple tables:
	*
	* ```ts
	* const result = await db
	*   .deleteFrom(['person', 'pet'])
	*   .using('person')
	*   .innerJoin('pet', 'pet.owner_id', 'person.id')
	*   .where('person.id', '=', 1)
	*   .executeTakeFirst()
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* delete from `person`, `pet`
	* using `person`
	* inner join `pet` on `pet`.`owner_id` = `person`.`id`
	* where `person`.`id` = ?
	* ```
	*/
	deleteFrom(from) {
		return new DeleteQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: DeleteQueryNode.create(parseTableExpressionOrList(from), this.#props.withNode)
		});
	}
	/**
	* Creates an update query.
	*
	* See the {@link UpdateQueryBuilder.where} method for examples on how to specify
	* a where clause for the update operation.
	*
	* See the {@link UpdateQueryBuilder.set} method for examples on how to
	* specify the updates.
	*
	* The return value of the query is an {@link UpdateResult}.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db
	*   .updateTable('person')
	*   .set({ first_name: 'Jennifer' })
	*   .where('person.id', '=', 1)
	*   .executeTakeFirst()
	*
	* console.log(result.numUpdatedRows)
	* ```
	*/
	updateTable(tables) {
		return new UpdateQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: UpdateQueryNode.create(parseTableExpressionOrList(tables), this.#props.withNode)
		});
	}
	/**
	* Creates a merge query.
	*
	* The return value of the query is a {@link MergeResult}.
	*
	* See the {@link MergeQueryBuilder.using} method for examples on how to specify
	* the other table.
	*
	* ### Examples
	*
	* <!-- siteExample("merge", "Source row existence", 10) -->
	*
	* Update a target column based on the existence of a source row:
	*
	* ```ts
	* const result = await db
	*   .mergeInto('person as target')
	*   .using('pet as source', 'source.owner_id', 'target.id')
	*   .whenMatchedAnd('target.has_pets', '!=', 'Y')
	*   .thenUpdateSet({ has_pets: 'Y' })
	*   .whenNotMatchedBySourceAnd('target.has_pets', '=', 'Y')
	*   .thenUpdateSet({ has_pets: 'N' })
	*   .executeTakeFirstOrThrow()
	*
	* console.log(result.numChangedRows)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "person"
	* using "pet"
	* on "pet"."owner_id" = "person"."id"
	* when matched and "has_pets" != $1
	* then update set "has_pets" = $2
	* when not matched by source and "has_pets" = $3
	* then update set "has_pets" = $4
	* ```
	*
	* <!-- siteExample("merge", "Temporary changes table", 20) -->
	*
	* Merge new entries from a temporary changes table:
	*
	* ```ts
	* const result = await db
	*   .mergeInto('wine as target')
	*   .using(
	*     'wine_stock_change as source',
	*     'source.wine_name',
	*     'target.name',
	*   )
	*   .whenNotMatchedAnd('source.stock_delta', '>', 0)
	*   .thenInsertValues(({ ref }) => ({
	*     name: ref('source.wine_name'),
	*     stock: ref('source.stock_delta'),
	*   }))
	*   .whenMatchedAnd(
	*     (eb) => eb('target.stock', '+', eb.ref('source.stock_delta')),
	*     '>',
	*     0,
	*   )
	*   .thenUpdateSet('stock', (eb) =>
	*     eb('target.stock', '+', eb.ref('source.stock_delta')),
	*   )
	*   .whenMatched()
	*   .thenDelete()
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* merge into "wine" as "target"
	* using "wine_stock_change" as "source"
	* on "source"."wine_name" = "target"."name"
	* when not matched and "source"."stock_delta" > $1
	* then insert ("name", "stock") values ("source"."wine_name", "source"."stock_delta")
	* when matched and "target"."stock" + "source"."stock_delta" > $2
	* then update set "stock" = "target"."stock" + "source"."stock_delta"
	* when matched
	* then delete
	* ```
	*/
	mergeInto(targetTable) {
		return new MergeQueryBuilder({
			queryId: createQueryId(),
			executor: this.#props.executor,
			queryNode: MergeQueryNode.create(parseAliasedTable(targetTable), this.#props.withNode)
		});
	}
	/**
	* Creates a `with` query (Common Table Expression).
	*
	* ### Examples
	*
	* <!-- siteExample("cte", "Simple selects", 10) -->
	*
	* Common table expressions (CTE) are a great way to modularize complex queries.
	* Essentially they allow you to run multiple separate queries within a
	* single roundtrip to the DB.
	*
	* Since CTEs are a part of the main query, query optimizers inside DB
	* engines are able to optimize the overall query. For example, postgres
	* is able to inline the CTEs inside the using queries if it decides it's
	* faster.
	*
	* ```ts
	* const result = await db
	*   // Create a CTE called `jennifers` that selects all
	*   // persons named 'Jennifer'.
	*   .with('jennifers', (db) => db
	*     .selectFrom('person')
	*     .where('first_name', '=', 'Jennifer')
	*     .select(['id', 'age'])
	*   )
	*   // Select all rows from the `jennifers` CTE and
	*   // further filter it.
	*   .with('adult_jennifers', (db) => db
	*     .selectFrom('jennifers')
	*     .where('age', '>', 18)
	*     .select(['id', 'age'])
	*   )
	*   // Finally select all adult jennifers that are
	*   // also younger than 60.
	*   .selectFrom('adult_jennifers')
	*   .where('age', '<', 60)
	*   .selectAll()
	*   .execute()
	* ```
	*
	* <!-- siteExample("cte", "Inserts, updates and deletions", 20) -->
	*
	* Some databases like postgres also allow you to run other queries than selects
	* in CTEs. On these databases CTEs are extremely powerful:
	*
	* ```ts
	* const result = await db
	*   .with('new_person', (db) => db
	*     .insertInto('person')
	*     .values({
	*       first_name: 'Jennifer',
	*       age: 35,
	*     })
	*     .returning('id')
	*   )
	*   .with('new_pet', (db) => db
	*     .insertInto('pet')
	*     .values({
	*       name: 'Doggo',
	*       species: 'dog',
	*       is_favorite: true,
	*       // Use the id of the person we just inserted.
	*       owner_id: db
	*         .selectFrom('new_person')
	*         .select('id')
	*     })
	*     .returning('id')
	*   )
	*   .selectFrom(['new_person', 'new_pet'])
	*   .select([
	*     'new_person.id as person_id',
	*     'new_pet.id as pet_id'
	*   ])
	*   .execute()
	* ```
	*
	* The CTE name can optionally specify column names in addition to
	* a name. In that case Kysely requires the expression to retun
	* rows with the same columns.
	*
	* ```ts
	* await db
	*   .with('jennifers(id, age)', (db) => db
	*     .selectFrom('person')
	*     .where('first_name', '=', 'Jennifer')
	*     // This is ok since we return columns with the same
	*     // names as specified by `jennifers(id, age)`.
	*     .select(['id', 'age'])
	*   )
	*   .selectFrom('jennifers')
	*   .selectAll()
	*   .execute()
	* ```
	*
	* The first argument can also be a callback. The callback is passed
	* a `CTEBuilder` instance that can be used to configure the CTE:
	*
	* ```ts
	* await db
	*   .with(
	*     (cte) => cte('jennifers').materialized(),
	*     (db) => db
	*       .selectFrom('person')
	*       .where('first_name', '=', 'Jennifer')
	*       .select(['id', 'age'])
	*   )
	*   .selectFrom('jennifers')
	*   .selectAll()
	*   .execute()
	* ```
	*/
	with(nameOrBuilder, expression) {
		const cte = parseCommonTableExpression(nameOrBuilder, expression);
		return new QueryCreator({
			...this.#props,
			withNode: this.#props.withNode ? WithNode.cloneWithExpression(this.#props.withNode, cte) : WithNode.create(cte)
		});
	}
	/**
	* Creates a recursive `with` query (Common Table Expression).
	*
	* Note that recursiveness is a property of the whole `with` statement.
	* You cannot have recursive and non-recursive CTEs in a same `with` statement.
	* Therefore the recursiveness is determined by the **first** `with` or
	* `withRecusive` call you make.
	*
	* See the {@link with} method for examples and more documentation.
	*/
	withRecursive(nameOrBuilder, expression) {
		const cte = parseCommonTableExpression(nameOrBuilder, expression);
		return new QueryCreator({
			...this.#props,
			withNode: this.#props.withNode ? WithNode.cloneWithExpression(this.#props.withNode, cte) : WithNode.create(cte, { recursive: true })
		});
	}
	/**
	* Returns a copy of this query creator instance with the given plugin installed.
	*/
	withPlugin(plugin) {
		return new QueryCreator({
			...this.#props,
			executor: this.#props.executor.withPlugin(plugin)
		});
	}
	/**
	* Returns a copy of this query creator instance without any plugins.
	*/
	withoutPlugins() {
		return new QueryCreator({
			...this.#props,
			executor: this.#props.executor.withoutPlugins()
		});
	}
	/**
	* Sets the schema to be used for all table references that don't explicitly
	* specify a schema.
	*
	* This only affects the query created through the builder returned from
	* this method and doesn't modify the `db` instance.
	*
	* See [this recipe](https://github.com/kysely-org/kysely/blob/master/site/docs/recipes/0007-schemas.md)
	* for a more detailed explanation.
	*
	* ### Examples
	*
	* ```
	* await db
	*   .withSchema('mammals')
	*   .selectFrom('pet')
	*   .selectAll()
	*   .innerJoin('public.person', 'public.person.id', 'pet.owner_id')
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select * from "mammals"."pet"
	* inner join "public"."person"
	* on "public"."person"."id" = "mammals"."pet"."owner_id"
	* ```
	*
	* `withSchema` is smart enough to not add schema for aliases,
	* common table expressions or other places where the schema
	* doesn't belong to:
	*
	* ```
	* await db
	*   .withSchema('mammals')
	*   .selectFrom('pet as p')
	*   .select('p.name')
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "p"."name" from "mammals"."pet" as "p"
	* ```
	*/
	withSchema(schema) {
		return new QueryCreator({
			...this.#props,
			executor: this.#props.executor.withPluginAtFront(new WithSchemaPlugin(schema))
		});
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/parse-utils.js
function createQueryCreator() {
	return new QueryCreator({ executor: NOOP_QUERY_EXECUTOR });
}
function createJoinBuilder(joinType, table) {
	return new JoinBuilder({ joinNode: JoinNode.create(joinType, parseTableExpression(table)) });
}
function createOverBuilder() {
	return new OverBuilder({ overNode: OverNode.create() });
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/join-parser.js
function parseJoin(joinType, args) {
	if (args.length === 3) return parseSingleOnJoin(joinType, args[0], args[1], args[2]);
	else if (args.length === 2) return parseCallbackJoin(joinType, args[0], args[1]);
	else if (args.length === 1) return parseOnlessJoin(joinType, args[0]);
	else throw new Error("not implemented");
}
function parseCallbackJoin(joinType, from, callback) {
	return callback(createJoinBuilder(joinType, from)).toOperationNode();
}
function parseSingleOnJoin(joinType, from, lhsColumn, rhsColumn) {
	return JoinNode.createWithOn(joinType, parseTableExpression(from), parseReferentialBinaryOperation(lhsColumn, "=", rhsColumn));
}
function parseOnlessJoin(joinType, from) {
	return JoinNode.create(joinType, parseTableExpression(from));
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/offset-node.js
/**
* @internal
*/
const OffsetNode = freeze({
	is(node) {
		return node.kind === "OffsetNode";
	},
	create(offset) {
		return freeze({
			kind: "OffsetNode",
			offset
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/group-by-item-node.js
/**
* @internal
*/
const GroupByItemNode = freeze({
	is(node) {
		return node.kind === "GroupByItemNode";
	},
	create(groupBy) {
		return freeze({
			kind: "GroupByItemNode",
			groupBy
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/group-by-parser.js
function parseGroupBy(groupBy) {
	groupBy = isFunction(groupBy) ? groupBy(expressionBuilder()) : groupBy;
	return parseReferenceExpressionOrList(groupBy).map(GroupByItemNode.create);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/set-operation-parser.js
function parseSetOperations(operator, expression, all) {
	if (isFunction(expression)) expression = expression(createExpressionBuilder());
	if (!isReadonlyArray(expression)) expression = [expression];
	return expression.map((expr) => SetOperationNode.create(operator, parseExpression(expr), all));
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/expression/expression-wrapper.js
var ExpressionWrapper = class ExpressionWrapper {
	#node;
	constructor(node) {
		this.#node = node;
	}
	/** @private */
	get expressionType() {}
	as(alias) {
		return new AliasedExpressionWrapper(this, alias);
	}
	or(...args) {
		return new OrWrapper(OrNode.create(this.#node, parseValueBinaryOperationOrExpression(args)));
	}
	and(...args) {
		return new AndWrapper(AndNode.create(this.#node, parseValueBinaryOperationOrExpression(args)));
	}
	/**
	* Change the output type of the expression.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `ExpressionWrapper` with a new output type.
	*/
	$castTo() {
		return new ExpressionWrapper(this.#node);
	}
	/**
	* Omit null from the expression's type.
	*
	* This function can be useful in cases where you know an expression can't be
	* null, but Kysely is unable to infer it.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of `this` with a new output type.
	*/
	$notNull() {
		return new ExpressionWrapper(this.#node);
	}
	toOperationNode() {
		return this.#node;
	}
};
var AliasedExpressionWrapper = class {
	#expr;
	#alias;
	constructor(expr, alias) {
		this.#expr = expr;
		this.#alias = alias;
	}
	/** @private */
	get expression() {
		return this.#expr;
	}
	/** @private */
	get alias() {
		return this.#alias;
	}
	toOperationNode() {
		return AliasNode.create(this.#expr.toOperationNode(), isOperationNodeSource(this.#alias) ? this.#alias.toOperationNode() : IdentifierNode.create(this.#alias));
	}
};
var OrWrapper = class OrWrapper {
	#node;
	constructor(node) {
		this.#node = node;
	}
	/** @private */
	get expressionType() {}
	as(alias) {
		return new AliasedExpressionWrapper(this, alias);
	}
	or(...args) {
		return new OrWrapper(OrNode.create(this.#node, parseValueBinaryOperationOrExpression(args)));
	}
	/**
	* Change the output type of the expression.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `OrWrapper` with a new output type.
	*/
	$castTo() {
		return new OrWrapper(this.#node);
	}
	toOperationNode() {
		return ParensNode.create(this.#node);
	}
};
var AndWrapper = class AndWrapper {
	#node;
	constructor(node) {
		this.#node = node;
	}
	/** @private */
	get expressionType() {}
	as(alias) {
		return new AliasedExpressionWrapper(this, alias);
	}
	and(...args) {
		return new AndWrapper(AndNode.create(this.#node, parseValueBinaryOperationOrExpression(args)));
	}
	/**
	* Change the output type of the expression.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `AndWrapper` with a new output type.
	*/
	$castTo() {
		return new AndWrapper(this.#node);
	}
	toOperationNode() {
		return ParensNode.create(this.#node);
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/fetch-node.js
/**
* @internal
*/
const FetchNode = freeze({
	is(node) {
		return node.kind === "FetchNode";
	},
	create(rowCount, modifier) {
		return {
			kind: "FetchNode",
			rowCount: ValueNode.create(rowCount),
			modifier
		};
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/fetch-parser.js
function parseFetch(rowCount, modifier) {
	if (!isNumber(rowCount) && !isBigInt(rowCount)) throw new Error(`Invalid fetch row count: ${rowCount}`);
	if (!isFetchModifier(modifier)) throw new Error(`Invalid fetch modifier: ${modifier}`);
	return FetchNode.create(rowCount, modifier);
}
function isFetchModifier(value) {
	return value === "only" || value === "with ties";
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/select-query-builder.js
var _a;
var SelectQueryBuilderImpl = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	get expressionType() {}
	get isSelectQueryBuilder() {
		return true;
	}
	where(...args) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	whereRef(lhs, op, rhs) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithWhere(this.#props.queryNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	having(...args) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithHaving(this.#props.queryNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	havingRef(lhs, op, rhs) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithHaving(this.#props.queryNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	select(selection) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSelections(this.#props.queryNode, parseSelectArg(selection))
		});
	}
	distinctOn(selection) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithDistinctOn(this.#props.queryNode, parseReferenceExpressionOrList(selection))
		});
	}
	modifyFront(modifier) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithFrontModifier(this.#props.queryNode, SelectModifierNode.createWithExpression(modifier.toOperationNode()))
		});
	}
	modifyEnd(modifier) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.createWithExpression(modifier.toOperationNode()))
		});
	}
	distinct() {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithFrontModifier(this.#props.queryNode, SelectModifierNode.create("Distinct"))
		});
	}
	forUpdate(of) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("ForUpdate", of ? asArray(of).map(parseTable) : void 0))
		});
	}
	forShare(of) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("ForShare", of ? asArray(of).map(parseTable) : void 0))
		});
	}
	forKeyShare(of) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("ForKeyShare", of ? asArray(of).map(parseTable) : void 0))
		});
	}
	forNoKeyUpdate(of) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("ForNoKeyUpdate", of ? asArray(of).map(parseTable) : void 0))
		});
	}
	skipLocked() {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("SkipLocked"))
		});
	}
	noWait() {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithEndModifier(this.#props.queryNode, SelectModifierNode.create("NoWait"))
		});
	}
	selectAll(table) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSelections(this.#props.queryNode, parseSelectAll(table))
		});
	}
	innerJoin(...args) {
		return this.#join("InnerJoin", args);
	}
	leftJoin(...args) {
		return this.#join("LeftJoin", args);
	}
	rightJoin(...args) {
		return this.#join("RightJoin", args);
	}
	fullJoin(...args) {
		return this.#join("FullJoin", args);
	}
	crossJoin(...args) {
		return this.#join("CrossJoin", args);
	}
	innerJoinLateral(...args) {
		return this.#join("LateralInnerJoin", args);
	}
	leftJoinLateral(...args) {
		return this.#join("LateralLeftJoin", args);
	}
	crossJoinLateral(...args) {
		return this.#join("LateralCrossJoin", args);
	}
	crossApply(...args) {
		return this.#join("CrossApply", args);
	}
	outerApply(...args) {
		return this.#join("OuterApply", args);
	}
	#join(joinType, args) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithJoin(this.#props.queryNode, parseJoin(joinType, args))
		});
	}
	orderBy(...args) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithOrderByItems(this.#props.queryNode, parseOrderBy(args))
		});
	}
	groupBy(groupBy) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithGroupByItems(this.#props.queryNode, parseGroupBy(groupBy))
		});
	}
	limit(limit) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithLimit(this.#props.queryNode, LimitNode.create(parseValueExpression(limit)))
		});
	}
	offset(offset) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithOffset(this.#props.queryNode, OffsetNode.create(parseValueExpression(offset)))
		});
	}
	fetch(rowCount, modifier = "only") {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithFetch(this.#props.queryNode, parseFetch(rowCount, modifier))
		});
	}
	top(expression, modifiers) {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithTop(this.#props.queryNode, parseTop(expression, modifiers))
		});
	}
	union(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("union", expression, false))
		});
	}
	unionAll(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("union", expression, true))
		});
	}
	intersect(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("intersect", expression, false))
		});
	}
	intersectAll(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("intersect", expression, true))
		});
	}
	except(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("except", expression, false))
		});
	}
	exceptAll(expression) {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithSetOperations(this.#props.queryNode, parseSetOperations("except", expression, true))
		});
	}
	as(alias) {
		return new AliasedSelectQueryBuilderImpl(this, alias);
	}
	clearSelect() {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithoutSelections(this.#props.queryNode)
		});
	}
	clearWhere() {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithoutWhere(this.#props.queryNode)
		});
	}
	clearLimit() {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithoutLimit(this.#props.queryNode)
		});
	}
	clearOffset() {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithoutOffset(this.#props.queryNode)
		});
	}
	clearOrderBy() {
		return new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithoutOrderBy(this.#props.queryNode)
		});
	}
	clearGroupBy() {
		return new _a({
			...this.#props,
			queryNode: SelectQueryNode.cloneWithoutGroupBy(this.#props.queryNode)
		});
	}
	$call(func) {
		return func(this);
	}
	$if(condition, func) {
		if (condition) return func(this);
		return new _a({ ...this.#props });
	}
	$castTo() {
		return new _a(this.#props);
	}
	$narrowType() {
		return new _a(this.#props);
	}
	$assertType() {
		return new _a(this.#props);
	}
	$asTuple() {
		return new ExpressionWrapper(this.toOperationNode());
	}
	$asScalar() {
		return new ExpressionWrapper(this.toOperationNode());
	}
	withPlugin(plugin) {
		return new _a({
			...this.#props,
			executor: this.#props.executor.withPlugin(plugin)
		});
	}
	toOperationNode() {
		return this.#props.executor.transformQuery(this.#props.queryNode, this.#props.queryId);
	}
	compile() {
		return this.#props.executor.compileQuery(this.toOperationNode(), this.#props.queryId);
	}
	async execute() {
		const compiledQuery = this.compile();
		return (await this.#props.executor.executeQuery(compiledQuery)).rows;
	}
	async executeTakeFirst() {
		const [result] = await this.execute();
		return result;
	}
	async executeTakeFirstOrThrow(errorConstructor = NoResultError) {
		const result = await this.executeTakeFirst();
		if (result === void 0) throw isNoResultErrorConstructor(errorConstructor) ? new errorConstructor(this.toOperationNode()) : errorConstructor(this.toOperationNode());
		return result;
	}
	async *stream(chunkSize = 100) {
		const compiledQuery = this.compile();
		const stream = this.#props.executor.stream(compiledQuery, chunkSize);
		for await (const item of stream) yield* item.rows;
	}
	async explain(format, options) {
		return await new _a({
			...this.#props,
			queryNode: QueryNode.cloneWithExplain(this.#props.queryNode, format, options)
		}).execute();
	}
};
_a = SelectQueryBuilderImpl;
function createSelectQueryBuilder(props) {
	return new SelectQueryBuilderImpl(props);
}
/**
* {@link SelectQueryBuilder} with an alias. The result of calling {@link SelectQueryBuilder.as}.
*/
var AliasedSelectQueryBuilderImpl = class {
	#queryBuilder;
	#alias;
	constructor(queryBuilder, alias) {
		this.#queryBuilder = queryBuilder;
		this.#alias = alias;
	}
	get expression() {
		return this.#queryBuilder;
	}
	get alias() {
		return this.#alias;
	}
	get isAliasedSelectQueryBuilder() {
		return true;
	}
	toOperationNode() {
		return AliasNode.create(this.#queryBuilder.toOperationNode(), IdentifierNode.create(this.#alias));
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/aggregate-function-node.js
/**
* @internal
*/
const AggregateFunctionNode = freeze({
	is(node) {
		return node.kind === "AggregateFunctionNode";
	},
	create(aggregateFunction, aggregated = []) {
		return freeze({
			kind: "AggregateFunctionNode",
			func: aggregateFunction,
			aggregated
		});
	},
	cloneWithDistinct(aggregateFunctionNode) {
		return freeze({
			...aggregateFunctionNode,
			distinct: true
		});
	},
	cloneWithOrderBy(aggregateFunctionNode, orderItems, withinGroup = false) {
		const prop = withinGroup ? "withinGroup" : "orderBy";
		return freeze({
			...aggregateFunctionNode,
			[prop]: aggregateFunctionNode[prop] ? OrderByNode.cloneWithItems(aggregateFunctionNode[prop], orderItems) : OrderByNode.create(orderItems)
		});
	},
	cloneWithFilter(aggregateFunctionNode, filter) {
		return freeze({
			...aggregateFunctionNode,
			filter: aggregateFunctionNode.filter ? WhereNode.cloneWithOperation(aggregateFunctionNode.filter, "And", filter) : WhereNode.create(filter)
		});
	},
	cloneWithOrFilter(aggregateFunctionNode, filter) {
		return freeze({
			...aggregateFunctionNode,
			filter: aggregateFunctionNode.filter ? WhereNode.cloneWithOperation(aggregateFunctionNode.filter, "Or", filter) : WhereNode.create(filter)
		});
	},
	cloneWithOver(aggregateFunctionNode, over) {
		return freeze({
			...aggregateFunctionNode,
			over
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/function-node.js
/**
* @internal
*/
const FunctionNode = freeze({
	is(node) {
		return node.kind === "FunctionNode";
	},
	create(func, args) {
		return freeze({
			kind: "FunctionNode",
			func,
			arguments: args
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/aggregate-function-builder.js
var AggregateFunctionBuilder = class AggregateFunctionBuilder {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	/** @private */
	get expressionType() {}
	/**
	* Returns an aliased version of the function.
	*
	* In addition to slapping `as "the_alias"` to the end of the SQL,
	* this method also provides strict typing:
	*
	* ```ts
	* const result = await db
	*   .selectFrom('person')
	*   .select(
	*     (eb) => eb.fn.count<number>('id').as('person_count')
	*   )
	*   .executeTakeFirstOrThrow()
	*
	* // `person_count: number` field exists in the result type.
	* console.log(result.person_count)
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select count("id") as "person_count"
	* from "person"
	* ```
	*/
	as(alias) {
		return new AliasedAggregateFunctionBuilder(this, alias);
	}
	/**
	* Adds a `distinct` clause inside the function.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db
	*   .selectFrom('person')
	*   .select((eb) =>
	*     eb.fn.count<number>('first_name').distinct().as('first_name_count')
	*   )
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select count(distinct "first_name") as "first_name_count"
	* from "person"
	* ```
	*/
	distinct() {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: AggregateFunctionNode.cloneWithDistinct(this.#props.aggregateFunctionNode)
		});
	}
	orderBy(...args) {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: QueryNode.cloneWithOrderByItems(this.#props.aggregateFunctionNode, parseOrderBy(args))
		});
	}
	clearOrderBy() {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: QueryNode.cloneWithoutOrderBy(this.#props.aggregateFunctionNode)
		});
	}
	withinGroupOrderBy(...args) {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: AggregateFunctionNode.cloneWithOrderBy(this.#props.aggregateFunctionNode, parseOrderBy(args), true)
		});
	}
	filterWhere(...args) {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: AggregateFunctionNode.cloneWithFilter(this.#props.aggregateFunctionNode, parseValueBinaryOperationOrExpression(args))
		});
	}
	/**
	* Adds a `filter` clause with a nested `where` clause after the function, where
	* both sides of the operator are references to columns.
	*
	* Similar to {@link WhereInterface}'s `whereRef` method.
	*
	* ### Examples
	*
	* Count people with same first and last names versus general public:
	*
	* ```ts
	* const result = await db
	*   .selectFrom('person')
	*   .select((eb) => [
	*     eb.fn
	*       .count<number>('id')
	*       .filterWhereRef('first_name', '=', 'last_name')
	*       .as('repeat_name_count'),
	*     eb.fn.count<number>('id').as('total_count'),
	*   ])
	*   .executeTakeFirstOrThrow()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select
	*   count("id") filter(where "first_name" = "last_name") as "repeat_name_count",
	*   count("id") as "total_count"
	* from "person"
	* ```
	*/
	filterWhereRef(lhs, op, rhs) {
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: AggregateFunctionNode.cloneWithFilter(this.#props.aggregateFunctionNode, parseReferentialBinaryOperation(lhs, op, rhs))
		});
	}
	/**
	* Adds an `over` clause (window functions) after the function.
	*
	* ### Examples
	*
	* ```ts
	* const result = await db
	*   .selectFrom('person')
	*   .select(
	*     (eb) => eb.fn.avg<number>('age').over().as('average_age')
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select avg("age") over() as "average_age"
	* from "person"
	* ```
	*
	* Also supports passing a callback that returns an over builder,
	* allowing to add partition by and sort by clauses inside over.
	*
	* ```ts
	* const result = await db
	*   .selectFrom('person')
	*   .select(
	*     (eb) => eb.fn.avg<number>('age').over(
	*       ob => ob.partitionBy('last_name').orderBy('first_name', 'asc')
	*     ).as('average_age')
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select avg("age") over(partition by "last_name" order by "first_name" asc) as "average_age"
	* from "person"
	* ```
	*/
	over(over) {
		const builder = createOverBuilder();
		return new AggregateFunctionBuilder({
			...this.#props,
			aggregateFunctionNode: AggregateFunctionNode.cloneWithOver(this.#props.aggregateFunctionNode, (over ? over(builder) : builder).toOperationNode())
		});
	}
	/**
	* Simply calls the provided function passing `this` as the only argument. `$call` returns
	* what the provided function returns.
	*/
	$call(func) {
		return func(this);
	}
	/**
	* Casts the expression to the given type.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `AggregateFunctionBuilder` with a new output type.
	*/
	$castTo() {
		return new AggregateFunctionBuilder(this.#props);
	}
	/**
	* Omit null from the expression's type.
	*
	* This function can be useful in cases where you know an expression can't be
	* null, but Kysely is unable to infer it.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of `this` with a new output type.
	*/
	$notNull() {
		return new AggregateFunctionBuilder(this.#props);
	}
	toOperationNode() {
		return this.#props.aggregateFunctionNode;
	}
};
/**
* {@link AggregateFunctionBuilder} with an alias. The result of calling {@link AggregateFunctionBuilder.as}.
*/
var AliasedAggregateFunctionBuilder = class {
	#aggregateFunctionBuilder;
	#alias;
	constructor(aggregateFunctionBuilder, alias) {
		this.#aggregateFunctionBuilder = aggregateFunctionBuilder;
		this.#alias = alias;
	}
	/** @private */
	get expression() {
		return this.#aggregateFunctionBuilder;
	}
	/** @private */
	get alias() {
		return this.#alias;
	}
	toOperationNode() {
		return AliasNode.create(this.#aggregateFunctionBuilder.toOperationNode(), IdentifierNode.create(this.#alias));
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/function-module.js
function createFunctionModule() {
	const fn = (name, args) => {
		return new ExpressionWrapper(FunctionNode.create(name, parseReferenceExpressionOrList(args ?? [])));
	};
	const agg = (name, args) => {
		return new AggregateFunctionBuilder({ aggregateFunctionNode: AggregateFunctionNode.create(name, args ? parseReferenceExpressionOrList(args) : void 0) });
	};
	return Object.assign(fn, {
		agg,
		avg(column) {
			return agg("avg", [column]);
		},
		coalesce(...values) {
			return fn("coalesce", values);
		},
		count(column) {
			return agg("count", [column]);
		},
		countAll(table) {
			return new AggregateFunctionBuilder({ aggregateFunctionNode: AggregateFunctionNode.create("count", parseSelectAll(table)) });
		},
		max(column) {
			return agg("max", [column]);
		},
		min(column) {
			return agg("min", [column]);
		},
		sum(column) {
			return agg("sum", [column]);
		},
		any(column) {
			return fn("any", [column]);
		},
		jsonAgg(table) {
			return new AggregateFunctionBuilder({ aggregateFunctionNode: AggregateFunctionNode.create("json_agg", [isString(table) ? parseTable(table) : table.toOperationNode()]) });
		},
		toJson(table) {
			return new ExpressionWrapper(FunctionNode.create("to_json", [isString(table) ? parseTable(table) : table.toOperationNode()]));
		}
	});
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/unary-operation-node.js
/**
* @internal
*/
const UnaryOperationNode = freeze({
	is(node) {
		return node.kind === "UnaryOperationNode";
	},
	create(operator, operand) {
		return freeze({
			kind: "UnaryOperationNode",
			operator,
			operand
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/unary-operation-parser.js
function parseUnaryOperation(operator, operand) {
	return UnaryOperationNode.create(OperatorNode.create(operator), parseReferenceExpression(operand));
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/case-node.js
/**
* @internal
*/
const CaseNode = freeze({
	is(node) {
		return node.kind === "CaseNode";
	},
	create(value) {
		return freeze({
			kind: "CaseNode",
			value
		});
	},
	cloneWithWhen(caseNode, when) {
		return freeze({
			...caseNode,
			when: freeze(caseNode.when ? [...caseNode.when, when] : [when])
		});
	},
	cloneWithThen(caseNode, then) {
		return freeze({
			...caseNode,
			when: caseNode.when ? freeze([...caseNode.when.slice(0, -1), WhenNode.cloneWithResult(caseNode.when[caseNode.when.length - 1], then)]) : void 0
		});
	},
	cloneWith(caseNode, props) {
		return freeze({
			...caseNode,
			...props
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/case-builder.js
var CaseBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	when(...args) {
		return new CaseThenBuilder({
			...this.#props,
			node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseValueBinaryOperationOrExpression(args)))
		});
	}
};
var CaseThenBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	then(valueExpression) {
		return new CaseWhenBuilder({
			...this.#props,
			node: CaseNode.cloneWithThen(this.#props.node, isSafeImmediateValue(valueExpression) ? parseSafeImmediateValue(valueExpression) : parseValueExpression(valueExpression))
		});
	}
};
var CaseWhenBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	when(...args) {
		return new CaseThenBuilder({
			...this.#props,
			node: CaseNode.cloneWithWhen(this.#props.node, WhenNode.create(parseValueBinaryOperationOrExpression(args)))
		});
	}
	else(valueExpression) {
		return new CaseEndBuilder({
			...this.#props,
			node: CaseNode.cloneWith(this.#props.node, { else: isSafeImmediateValue(valueExpression) ? parseSafeImmediateValue(valueExpression) : parseValueExpression(valueExpression) })
		});
	}
	end() {
		return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: false }));
	}
	endCase() {
		return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: true }));
	}
};
var CaseEndBuilder = class {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	end() {
		return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: false }));
	}
	endCase() {
		return new ExpressionWrapper(CaseNode.cloneWith(this.#props.node, { isStatement: true }));
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/json-path-leg-node.js
/**
* @internal
*/
const JSONPathLegNode = freeze({
	is(node) {
		return node.kind === "JSONPathLegNode";
	},
	create(type, value) {
		return freeze({
			kind: "JSONPathLegNode",
			type,
			value
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-builder/json-path-builder.js
var JSONPathBuilder = class {
	#node;
	constructor(node) {
		this.#node = node;
	}
	/**
	* Access an element of a JSON array in a specific location.
	*
	* Since there's no guarantee an element exists in the given array location, the
	* resulting type is always nullable. If you're sure the element exists, you
	* should use {@link SelectQueryBuilder.$assertType} to narrow the type safely.
	*
	* See also {@link key} to access properties of JSON objects.
	*
	* ### Examples
	*
	* ```ts
	* await db.selectFrom('person')
	*   .select(eb =>
	*     eb.ref('nicknames', '->').at(0).as('primary_nickname')
	*   )
	*   .execute()
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "nicknames"->0 as "primary_nickname" from "person"
	*```
	*
	* Combined with {@link key}:
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('experience', '->').at(0).key('role').as('first_role')
	* )
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "experience"->0->'role' as "first_role" from "person"
	* ```
	*
	* You can use `'last'` to access the last element of the array in MySQL:
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('nicknames', '->$').at('last').as('last_nickname')
	* )
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* select `nicknames`->'$[last]' as `last_nickname` from `person`
	* ```
	*
	* Or `'#-1'` in SQLite:
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('nicknames', '->>$').at('#-1').as('last_nickname')
	* )
	* ```
	*
	* The generated SQL (SQLite):
	*
	* ```sql
	* select "nicknames"->>'$[#-1]' as `last_nickname` from `person`
	* ```
	*/
	at(index) {
		return this.#createBuilderWithPathLeg("ArrayLocation", index);
	}
	/**
	* Access a property of a JSON object.
	*
	* If a field is optional, the resulting type will be nullable.
	*
	* See also {@link at} to access elements of JSON arrays.
	*
	* ### Examples
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('address', '->').key('city').as('city')
	* )
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "address"->'city' as "city" from "person"
	* ```
	*
	* Going deeper:
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('profile', '->$').key('website').key('url').as('website_url')
	* )
	* ```
	*
	* The generated SQL (MySQL):
	*
	* ```sql
	* select `profile`->'$.website.url' as `website_url` from `person`
	* ```
	*
	* Combined with {@link at}:
	*
	* ```ts
	* db.selectFrom('person').select(eb =>
	*   eb.ref('profile', '->').key('addresses').at(0).key('city').as('city')
	* )
	* ```
	*
	* The generated SQL (PostgreSQL):
	*
	* ```sql
	* select "profile"->'addresses'->0->'city' as "city" from "person"
	* ```
	*/
	key(key) {
		return this.#createBuilderWithPathLeg("Member", key);
	}
	#createBuilderWithPathLeg(legType, value) {
		if (JSONReferenceNode.is(this.#node)) return new TraversedJSONPathBuilder(JSONReferenceNode.cloneWithTraversal(this.#node, JSONPathNode.is(this.#node.traversal) ? JSONPathNode.cloneWithLeg(this.#node.traversal, JSONPathLegNode.create(legType, value)) : JSONOperatorChainNode.cloneWithValue(this.#node.traversal, ValueNode.createImmediate(value))));
		return new TraversedJSONPathBuilder(JSONPathNode.cloneWithLeg(this.#node, JSONPathLegNode.create(legType, value)));
	}
};
var TraversedJSONPathBuilder = class TraversedJSONPathBuilder extends JSONPathBuilder {
	#node;
	constructor(node) {
		super(node);
		this.#node = node;
	}
	/** @private */
	get expressionType() {}
	as(alias) {
		return new AliasedJSONPathBuilder(this, alias);
	}
	/**
	* Change the output type of the json path.
	*
	* This method call doesn't change the SQL in any way. This methods simply
	* returns a copy of this `JSONPathBuilder` with a new output type.
	*/
	$castTo() {
		return new TraversedJSONPathBuilder(this.#node);
	}
	$notNull() {
		return new TraversedJSONPathBuilder(this.#node);
	}
	toOperationNode() {
		return this.#node;
	}
};
var AliasedJSONPathBuilder = class {
	#jsonPath;
	#alias;
	constructor(jsonPath, alias) {
		this.#jsonPath = jsonPath;
		this.#alias = alias;
	}
	/** @private */
	get expression() {
		return this.#jsonPath;
	}
	/** @private */
	get alias() {
		return this.#alias;
	}
	toOperationNode() {
		return AliasNode.create(this.#jsonPath.toOperationNode(), isOperationNodeSource(this.#alias) ? this.#alias.toOperationNode() : IdentifierNode.create(this.#alias));
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/tuple-node.js
/**
* @internal
*/
const TupleNode = freeze({
	is(node) {
		return node.kind === "TupleNode";
	},
	create(values) {
		return freeze({
			kind: "TupleNode",
			values: freeze(values)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/data-type-node.js
const SIMPLE_COLUMN_DATA_TYPES = [
	"varchar",
	"char",
	"text",
	"integer",
	"int2",
	"int4",
	"int8",
	"smallint",
	"bigint",
	"boolean",
	"real",
	"double precision",
	"float4",
	"float8",
	"decimal",
	"numeric",
	"binary",
	"bytea",
	"date",
	"datetime",
	"time",
	"timetz",
	"timestamp",
	"timestamptz",
	"serial",
	"bigserial",
	"uuid",
	"json",
	"jsonb",
	"blob",
	"varbinary",
	"int4range",
	"int4multirange",
	"int8range",
	"int8multirange",
	"numrange",
	"nummultirange",
	"tsrange",
	"tsmultirange",
	"tstzrange",
	"tstzmultirange",
	"daterange",
	"datemultirange"
];
const COLUMN_DATA_TYPE_REGEX = [
	/^varchar\(\d+\)$/,
	/^char\(\d+\)$/,
	/^decimal\(\d+, \d+\)$/,
	/^numeric\(\d+, \d+\)$/,
	/^binary\(\d+\)$/,
	/^datetime\(\d+\)$/,
	/^time\(\d+\)$/,
	/^timetz\(\d+\)$/,
	/^timestamp\(\d+\)$/,
	/^timestamptz\(\d+\)$/,
	/^varbinary\(\d+\)$/
];
/**
* @internal
*/
const DataTypeNode = freeze({
	is(node) {
		return node.kind === "DataTypeNode";
	},
	create(dataType) {
		return freeze({
			kind: "DataTypeNode",
			dataType
		});
	}
});
function isColumnDataType(dataType) {
	if (SIMPLE_COLUMN_DATA_TYPES.includes(dataType)) return true;
	if (COLUMN_DATA_TYPE_REGEX.some((r) => r.test(dataType))) return true;
	return false;
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/data-type-parser.js
function parseDataTypeExpression(dataType) {
	if (isOperationNodeSource(dataType)) return dataType.toOperationNode();
	if (isColumnDataType(dataType)) return DataTypeNode.create(dataType);
	throw new Error(`invalid column data type ${JSON.stringify(dataType)}`);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/cast-node.js
/**
* @internal
*/
const CastNode = freeze({
	is(node) {
		return node.kind === "CastNode";
	},
	create(expression, dataType) {
		return freeze({
			kind: "CastNode",
			expression,
			dataType
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/expression/expression-builder.js
function createExpressionBuilder(executor = NOOP_QUERY_EXECUTOR) {
	function binary(lhs, op, rhs) {
		return new ExpressionWrapper(parseValueBinaryOperation(lhs, op, rhs));
	}
	function unary(op, expr) {
		return new ExpressionWrapper(parseUnaryOperation(op, expr));
	}
	const eb = Object.assign(binary, {
		fn: void 0,
		eb: void 0,
		selectFrom(table) {
			return createSelectQueryBuilder({
				queryId: createQueryId(),
				executor,
				queryNode: SelectQueryNode.createFrom(parseTableExpressionOrList(table))
			});
		},
		case(reference) {
			return new CaseBuilder({ node: CaseNode.create(isUndefined(reference) ? void 0 : parseReferenceExpression(reference)) });
		},
		ref(reference, op) {
			if (isUndefined(op)) return new ExpressionWrapper(parseStringReference(reference));
			return new JSONPathBuilder(parseJSONReference(reference, op));
		},
		jsonPath() {
			return new JSONPathBuilder(JSONPathNode.create());
		},
		table(table) {
			return new ExpressionWrapper(parseTable(table));
		},
		val(value) {
			return new ExpressionWrapper(parseValueExpression(value));
		},
		refTuple(...values) {
			return new ExpressionWrapper(TupleNode.create(values.map(parseReferenceExpression)));
		},
		tuple(...values) {
			return new ExpressionWrapper(TupleNode.create(values.map(parseValueExpression)));
		},
		lit(value) {
			return new ExpressionWrapper(parseSafeImmediateValue(value));
		},
		unary,
		not(expr) {
			return unary("not", expr);
		},
		exists(expr) {
			return unary("exists", expr);
		},
		neg(expr) {
			return unary("-", expr);
		},
		between(expr, start, end) {
			return new ExpressionWrapper(BinaryOperationNode.create(parseReferenceExpression(expr), OperatorNode.create("between"), AndNode.create(parseValueExpression(start), parseValueExpression(end))));
		},
		betweenSymmetric(expr, start, end) {
			return new ExpressionWrapper(BinaryOperationNode.create(parseReferenceExpression(expr), OperatorNode.create("between symmetric"), AndNode.create(parseValueExpression(start), parseValueExpression(end))));
		},
		and(exprs) {
			if (isReadonlyArray(exprs)) return new ExpressionWrapper(parseFilterList(exprs, "and"));
			return new ExpressionWrapper(parseFilterObject(exprs, "and"));
		},
		or(exprs) {
			if (isReadonlyArray(exprs)) return new ExpressionWrapper(parseFilterList(exprs, "or"));
			return new ExpressionWrapper(parseFilterObject(exprs, "or"));
		},
		parens(...args) {
			const node = parseValueBinaryOperationOrExpression(args);
			if (ParensNode.is(node)) return new ExpressionWrapper(node);
			else return new ExpressionWrapper(ParensNode.create(node));
		},
		cast(expr, dataType) {
			return new ExpressionWrapper(CastNode.create(parseReferenceExpression(expr), parseDataTypeExpression(dataType)));
		},
		withSchema(schema) {
			return createExpressionBuilder(executor.withPluginAtFront(new WithSchemaPlugin(schema)));
		}
	});
	eb.fn = createFunctionModule();
	eb.eb = eb;
	return eb;
}
function expressionBuilder(_) {
	return createExpressionBuilder();
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/expression-parser.js
function parseExpression(exp) {
	if (isOperationNodeSource(exp)) return exp.toOperationNode();
	else if (isFunction(exp)) return exp(expressionBuilder()).toOperationNode();
	throw new Error(`invalid expression: ${JSON.stringify(exp)}`);
}
function parseAliasedExpression(exp) {
	if (isOperationNodeSource(exp)) return exp.toOperationNode();
	else if (isFunction(exp)) return exp(expressionBuilder()).toOperationNode();
	throw new Error(`invalid aliased expression: ${JSON.stringify(exp)}`);
}
function isExpressionOrFactory(obj) {
	return isExpression(obj) || isAliasedExpression(obj) || isFunction(obj);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/dynamic/dynamic-table-builder.js
var DynamicTableBuilder = class {
	#table;
	get table() {
		return this.#table;
	}
	constructor(table) {
		this.#table = table;
	}
	as(alias) {
		return new AliasedDynamicTableBuilder(this.#table, alias);
	}
};
var AliasedDynamicTableBuilder = class {
	#table;
	#alias;
	get table() {
		return this.#table;
	}
	get alias() {
		return this.#alias;
	}
	constructor(table, alias) {
		this.#table = table;
		this.#alias = alias;
	}
	toOperationNode() {
		return AliasNode.create(parseTable(this.#table), IdentifierNode.create(this.#alias));
	}
};
function isAliasedDynamicTableBuilder(obj) {
	return isObject(obj) && isOperationNodeSource(obj) && isString(obj.table) && isString(obj.alias);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/parser/table-parser.js
function parseTableExpressionOrList(table) {
	if (isReadonlyArray(table)) return table.map((it) => parseTableExpression(it));
	else return [parseTableExpression(table)];
}
function parseTableExpression(table) {
	if (isString(table)) return parseAliasedTable(table);
	else if (isAliasedDynamicTableBuilder(table)) return table.toOperationNode();
	else return parseAliasedExpression(table);
}
function parseAliasedTable(from) {
	const ALIAS_SEPARATOR = " as ";
	if (from.includes(ALIAS_SEPARATOR)) {
		const [table, alias] = from.split(ALIAS_SEPARATOR).map(trim);
		return AliasNode.create(parseTable(table), IdentifierNode.create(alias));
	} else return parseTable(from);
}
function parseTable(from) {
	const SCHEMA_SEPARATOR = ".";
	if (from.includes(SCHEMA_SEPARATOR)) {
		const [schema, table] = from.split(SCHEMA_SEPARATOR).map(trim);
		return TableNode.createWithSchema(schema, table);
	} else return TableNode.create(from);
}
function trim(str) {
	return str.trim();
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/raw-builder/raw-builder.js
var RawBuilderImpl = class RawBuilderImpl {
	#props;
	constructor(props) {
		this.#props = freeze(props);
	}
	get expressionType() {}
	get isRawBuilder() {
		return true;
	}
	as(alias) {
		return new AliasedRawBuilderImpl(this, alias);
	}
	$castTo() {
		return new RawBuilderImpl({ ...this.#props });
	}
	$notNull() {
		return new RawBuilderImpl(this.#props);
	}
	withPlugin(plugin) {
		return new RawBuilderImpl({
			...this.#props,
			plugins: this.#props.plugins !== void 0 ? freeze([...this.#props.plugins, plugin]) : freeze([plugin])
		});
	}
	toOperationNode() {
		return this.#toOperationNode(this.#getExecutor());
	}
	compile(executorProvider) {
		return this.#compile(this.#getExecutor(executorProvider));
	}
	async execute(executorProvider) {
		const executor = this.#getExecutor(executorProvider);
		return executor.executeQuery(this.#compile(executor));
	}
	#getExecutor(executorProvider) {
		const executor = executorProvider !== void 0 ? executorProvider.getExecutor() : NOOP_QUERY_EXECUTOR;
		return this.#props.plugins !== void 0 ? executor.withPlugins(this.#props.plugins) : executor;
	}
	#toOperationNode(executor) {
		return executor.transformQuery(this.#props.rawNode, this.#props.queryId);
	}
	#compile(executor) {
		return executor.compileQuery(this.#toOperationNode(executor), this.#props.queryId);
	}
};
function createRawBuilder(props) {
	return new RawBuilderImpl(props);
}
var AliasedRawBuilderImpl = class {
	#rawBuilder;
	#alias;
	constructor(rawBuilder, alias) {
		this.#rawBuilder = rawBuilder;
		this.#alias = alias;
	}
	get expression() {
		return this.#rawBuilder;
	}
	get alias() {
		return this.#alias;
	}
	get rawBuilder() {
		return this.#rawBuilder;
	}
	toOperationNode() {
		return AliasNode.create(this.#rawBuilder.toOperationNode(), isOperationNodeSource(this.#alias) ? this.#alias.toOperationNode() : IdentifierNode.create(this.#alias));
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/raw-builder/sql.js
const sql = Object.assign((sqlFragments, ...parameters) => {
	return createRawBuilder({
		queryId: createQueryId(),
		rawNode: RawNode.create(sqlFragments, parameters?.map(parseParameter) ?? [])
	});
}, {
	ref(columnReference) {
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithChild(parseStringReference(columnReference))
		});
	},
	val(value) {
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithChild(parseValueExpression(value))
		});
	},
	value(value) {
		return this.val(value);
	},
	table(tableReference) {
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithChild(parseTable(tableReference))
		});
	},
	id(...ids) {
		const fragments = new Array(ids.length + 1).fill(".");
		fragments[0] = "";
		fragments[fragments.length - 1] = "";
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.create(fragments, ids.map(IdentifierNode.create))
		});
	},
	lit(value) {
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithChild(ValueNode.createImmediate(value))
		});
	},
	literal(value) {
		return this.lit(value);
	},
	raw(sql) {
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithSql(sql)
		});
	},
	join(array, separator = sql`, `) {
		const nodes = new Array(Math.max(2 * array.length - 1, 0));
		const sep = separator.toOperationNode();
		for (let i = 0; i < array.length; ++i) {
			nodes[2 * i] = parseParameter(array[i]);
			if (i !== array.length - 1) nodes[2 * i + 1] = sep;
		}
		return createRawBuilder({
			queryId: createQueryId(),
			rawNode: RawNode.createWithChildren(nodes)
		});
	}
});
function parseParameter(param) {
	if (isOperationNodeSource(param)) return param.toOperationNode();
	return parseValueExpression(param);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-compiler/compiled-query.js
const CompiledQuery = freeze({ raw(sql, parameters = []) {
	return freeze({
		sql,
		query: RawNode.createWithSql(sql),
		parameters: freeze(parameters),
		queryId: createQueryId()
	});
} });
//#endregion
export { parseStringReference as C, isOperationNodeSource as D, ColumnNode as E, parseOrderedColumnName as S, SelectAllNode as T, QueryNode as _, parseExpression as a, ValueListNode as b, CaseNode as c, QueryExecutorBase as d, provideControlledConnection as f, SelectQueryNode as g, randomString as h, DynamicTableBuilder as i, createFunctionModule as l, createQueryId as m, sql as n, parseDataTypeExpression as o, Deferred as p, parseTable as r, CaseBuilder as s, CompiledQuery as t, QueryCreator as u, parseValueBinaryOperationOrExpression as v, DynamicReferenceBuilder as w, parseColumnName as x, ValueNode as y };

//# sourceMappingURL=compiled-query-QDhWTL5F.mjs.map