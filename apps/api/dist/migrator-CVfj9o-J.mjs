//#region ../../node_modules/kysely/dist/esm/util/object-utils.js
function isUndefined(obj) {
	return typeof obj === "undefined" || obj === void 0;
}
function isString(obj) {
	return typeof obj === "string";
}
function isNumber(obj) {
	return typeof obj === "number";
}
function isBoolean(obj) {
	return typeof obj === "boolean";
}
function isNull(obj) {
	return obj === null;
}
function isDate(obj) {
	return obj instanceof Date;
}
function isBigInt(obj) {
	return typeof obj === "bigint";
}
function isBuffer(obj) {
	return typeof Buffer !== "undefined" && Buffer.isBuffer(obj);
}
function isFunction(obj) {
	return typeof obj === "function";
}
function isObject(obj) {
	return typeof obj === "object" && obj !== null;
}
function freeze(obj) {
	return Object.freeze(obj);
}
function asArray(arg) {
	if (isReadonlyArray(arg)) return arg;
	else return [arg];
}
function isReadonlyArray(arg) {
	return Array.isArray(arg);
}
function noop(obj) {
	return obj;
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/identifier-node.js
/**
* @internal
*/
const IdentifierNode = freeze({
	is(node) {
		return node.kind === "IdentifierNode";
	},
	create(name) {
		return freeze({
			kind: "IdentifierNode",
			name
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/create-table-node.js
const ON_COMMIT_ACTIONS = [
	"preserve rows",
	"delete rows",
	"drop"
];
/**
* @internal
*/
const CreateTableNode = freeze({
	is(node) {
		return node.kind === "CreateTableNode";
	},
	create(table) {
		return freeze({
			kind: "CreateTableNode",
			table,
			columns: freeze([])
		});
	},
	cloneWithColumn(createTable, column) {
		return freeze({
			...createTable,
			columns: freeze([...createTable.columns, column])
		});
	},
	cloneWithConstraint(createTable, constraint) {
		return freeze({
			...createTable,
			constraints: createTable.constraints ? freeze([...createTable.constraints, constraint]) : freeze([constraint])
		});
	},
	cloneWithFrontModifier(createTable, modifier) {
		return freeze({
			...createTable,
			frontModifiers: createTable.frontModifiers ? freeze([...createTable.frontModifiers, modifier]) : freeze([modifier])
		});
	},
	cloneWithEndModifier(createTable, modifier) {
		return freeze({
			...createTable,
			endModifiers: createTable.endModifiers ? freeze([...createTable.endModifiers, modifier]) : freeze([modifier])
		});
	},
	cloneWith(createTable, params) {
		return freeze({
			...createTable,
			...params
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/schemable-identifier-node.js
/**
* @internal
*/
const SchemableIdentifierNode = freeze({
	is(node) {
		return node.kind === "SchemableIdentifierNode";
	},
	create(identifier) {
		return freeze({
			kind: "SchemableIdentifierNode",
			identifier: IdentifierNode.create(identifier)
		});
	},
	createWithSchema(schema, identifier) {
		return freeze({
			kind: "SchemableIdentifierNode",
			schema: IdentifierNode.create(schema),
			identifier: IdentifierNode.create(identifier)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/alias-node.js
/**
* @internal
*/
const AliasNode = freeze({
	is(node) {
		return node.kind === "AliasNode";
	},
	create(node, alias) {
		return freeze({
			kind: "AliasNode",
			node,
			alias
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/table-node.js
/**
* @internal
*/
const TableNode = freeze({
	is(node) {
		return node.kind === "TableNode";
	},
	create(table) {
		return freeze({
			kind: "TableNode",
			table: SchemableIdentifierNode.create(table)
		});
	},
	createWithSchema(schema, table) {
		return freeze({
			kind: "TableNode",
			table: SchemableIdentifierNode.createWithSchema(schema, table)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/and-node.js
/**
* @internal
*/
const AndNode = freeze({
	is(node) {
		return node.kind === "AndNode";
	},
	create(left, right) {
		return freeze({
			kind: "AndNode",
			left,
			right
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/or-node.js
/**
* @internal
*/
const OrNode = freeze({
	is(node) {
		return node.kind === "OrNode";
	},
	create(left, right) {
		return freeze({
			kind: "OrNode",
			left,
			right
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/on-node.js
/**
* @internal
*/
const OnNode = freeze({
	is(node) {
		return node.kind === "OnNode";
	},
	create(filter) {
		return freeze({
			kind: "OnNode",
			on: filter
		});
	},
	cloneWithOperation(onNode, operator, operation) {
		return freeze({
			...onNode,
			on: operator === "And" ? AndNode.create(onNode.on, operation) : OrNode.create(onNode.on, operation)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/join-node.js
/**
* @internal
*/
const JoinNode = freeze({
	is(node) {
		return node.kind === "JoinNode";
	},
	create(joinType, table) {
		return freeze({
			kind: "JoinNode",
			joinType,
			table,
			on: void 0
		});
	},
	createWithOn(joinType, table, on) {
		return freeze({
			kind: "JoinNode",
			joinType,
			table,
			on: OnNode.create(on)
		});
	},
	cloneWithOn(joinNode, operation) {
		return freeze({
			...joinNode,
			on: joinNode.on ? OnNode.cloneWithOperation(joinNode.on, "And", operation) : OnNode.create(operation)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/operator-node.js
const COMPARISON_OPERATORS = [
	"=",
	"==",
	"!=",
	"<>",
	">",
	">=",
	"<",
	"<=",
	"in",
	"not in",
	"is",
	"is not",
	"like",
	"not like",
	"match",
	"ilike",
	"not ilike",
	"@>",
	"<@",
	"^@",
	"&&",
	"?",
	"?&",
	"?|",
	"!<",
	"!>",
	"<=>",
	"!~",
	"~",
	"~*",
	"!~*",
	"@@",
	"@@@",
	"!!",
	"<->",
	"regexp",
	"is distinct from",
	"is not distinct from"
];
const ARITHMETIC_OPERATORS = [
	"+",
	"-",
	"*",
	"/",
	"%",
	"^",
	"&",
	"|",
	"#",
	"<<",
	">>"
];
const JSON_OPERATORS = ["->", "->>"];
const BINARY_OPERATORS = [
	...COMPARISON_OPERATORS,
	...ARITHMETIC_OPERATORS,
	"&&",
	"||"
];
const UNARY_OPERATORS = [
	"not",
	"-",
	...["exists", "not exists"]
];
const OPERATORS = [
	...BINARY_OPERATORS,
	...JSON_OPERATORS,
	...UNARY_OPERATORS,
	"between",
	"between symmetric"
];
/**
* @internal
*/
const OperatorNode = freeze({
	is(node) {
		return node.kind === "OperatorNode";
	},
	create(operator) {
		return freeze({
			kind: "OperatorNode",
			operator
		});
	}
});
function isJSONOperator(op) {
	return isString(op) && JSON_OPERATORS.includes(op);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/raw-node.js
/**
* @internal
*/
const RawNode = freeze({
	is(node) {
		return node.kind === "RawNode";
	},
	create(sqlFragments, parameters) {
		return freeze({
			kind: "RawNode",
			sqlFragments: freeze(sqlFragments),
			parameters: freeze(parameters)
		});
	},
	createWithSql(sql) {
		return RawNode.create([sql], []);
	},
	createWithChild(child) {
		return RawNode.create(["", ""], [child]);
	},
	createWithChildren(children) {
		return RawNode.create(new Array(children.length + 1).fill(""), children);
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/log-once.js
const LOGGED_MESSAGES = /* @__PURE__ */ new Set();
/**
* Use for system-level logging, such as deprecation messages.
* Logs a message and ensures it won't be logged again.
*/
function logOnce(message) {
	if (LOGGED_MESSAGES.has(message)) return;
	LOGGED_MESSAGES.add(message);
	console.log(message);
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/parens-node.js
/**
* @internal
*/
const ParensNode = freeze({
	is(node) {
		return node.kind === "ParensNode";
	},
	create(node) {
		return freeze({
			kind: "ParensNode",
			node
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/insert-query-node.js
/**
* @internal
*/
const InsertQueryNode = freeze({
	is(node) {
		return node.kind === "InsertQueryNode";
	},
	create(into, withNode, replace) {
		return freeze({
			kind: "InsertQueryNode",
			into,
			...withNode && { with: withNode },
			replace
		});
	},
	createWithoutInto() {
		return freeze({ kind: "InsertQueryNode" });
	},
	cloneWith(insertQuery, props) {
		return freeze({
			...insertQuery,
			...props
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/list-node.js
/**
* @internal
*/
const ListNode = freeze({
	is(node) {
		return node.kind === "ListNode";
	},
	create(items) {
		return freeze({
			kind: "ListNode",
			items: freeze(items)
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/using-node.js
/**
* @internal
*/
const UsingNode = freeze({
	is(node) {
		return node.kind === "UsingNode";
	},
	create(tables) {
		return freeze({
			kind: "UsingNode",
			tables: freeze(tables)
		});
	},
	cloneWithTables(using, tables) {
		return freeze({
			...using,
			tables: freeze([...using.tables, ...tables])
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/when-node.js
/**
* @internal
*/
const WhenNode = freeze({
	is(node) {
		return node.kind === "WhenNode";
	},
	create(condition) {
		return freeze({
			kind: "WhenNode",
			condition
		});
	},
	cloneWithResult(whenNode, result) {
		return freeze({
			...whenNode,
			result
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/util/require-all-props.js
/**
* Helper function to check listed properties according to given type. Check if all properties has been used when object is initialised.
*
* Example use:
*
* ```ts
* type SomeType = { propA: string; propB?: number; }
*
* // propB has to be mentioned even it is optional. It still should be initialized with undefined.
* const a: SomeType = requireAllProps<SomeType>({ propA: "value A", propB: undefined });
*
* // checked type is implicit for variable.
* const b = requireAllProps<SomeType>({ propA: "value A", propB: undefined });
* ```
*
* Wrong use of this helper:
*
* 1. Omit checked type - all checked properties will be expect as of type never
*
* ```ts
* type SomeType = { propA: string; propB?: number; }
* // const z: SomeType = requireAllProps({ propC: "no type will work" }); // Property 'propA' is missing in type '{ propC: string; }' but required in type 'SomeType'.
* ```
*
* 2. Apply to spreaded object - there is no way how to check in compile time if spreaded object contains all properties
*
* ```ts
* type SomeType = { propA: string; propB?: number; }
* const y: SomeType = { propA: "" }; // valid object according to SomeType declaration
* // const x = requireAllProps<SomeType>({ ...y }); // Argument of type '{ propA: string; propB?: number; }' is not assignable to parameter of type 'AllProps<SomeType>'.
* ```
*
* @param obj object to check if all properties has been used
* @returns untouched obj parameter is returned
*/
function requireAllProps(obj) {
	return obj;
}
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/operation-node-transformer.js
/**
* Transforms an operation node tree into another one.
*
* Kysely queries are expressed internally as a tree of objects (operation nodes).
* `OperationNodeTransformer` takes such a tree as its input and returns a
* transformed deep copy of it. By default the `OperationNodeTransformer`
* does nothing. You need to override one or more methods to make it do
* something.
*
* There's a method for each node type. For example if you'd like to convert
* each identifier (table name, column name, alias etc.) from camelCase to
* snake_case, you'd do something like this:
*
* ```ts
* import { type IdentifierNode, OperationNodeTransformer } from 'kysely'
* import snakeCase from 'lodash/snakeCase'
*
* class CamelCaseTransformer extends OperationNodeTransformer {
*   override transformIdentifier(node: IdentifierNode): IdentifierNode {
*     node = super.transformIdentifier(node)
*
*     return {
*       ...node,
*       name: snakeCase(node.name),
*     }
*   }
* }
*
* const transformer = new CamelCaseTransformer()
*
* const query = db.selectFrom('person').select(['first_name', 'last_name'])
*
* const tree = transformer.transformNode(query.toOperationNode())
* ```
*/
var OperationNodeTransformer = class {
	nodeStack = [];
	#transformers = freeze({
		AliasNode: this.transformAlias.bind(this),
		ColumnNode: this.transformColumn.bind(this),
		IdentifierNode: this.transformIdentifier.bind(this),
		SchemableIdentifierNode: this.transformSchemableIdentifier.bind(this),
		RawNode: this.transformRaw.bind(this),
		ReferenceNode: this.transformReference.bind(this),
		SelectQueryNode: this.transformSelectQuery.bind(this),
		SelectionNode: this.transformSelection.bind(this),
		TableNode: this.transformTable.bind(this),
		FromNode: this.transformFrom.bind(this),
		SelectAllNode: this.transformSelectAll.bind(this),
		AndNode: this.transformAnd.bind(this),
		OrNode: this.transformOr.bind(this),
		ValueNode: this.transformValue.bind(this),
		ValueListNode: this.transformValueList.bind(this),
		PrimitiveValueListNode: this.transformPrimitiveValueList.bind(this),
		ParensNode: this.transformParens.bind(this),
		JoinNode: this.transformJoin.bind(this),
		OperatorNode: this.transformOperator.bind(this),
		WhereNode: this.transformWhere.bind(this),
		InsertQueryNode: this.transformInsertQuery.bind(this),
		DeleteQueryNode: this.transformDeleteQuery.bind(this),
		ReturningNode: this.transformReturning.bind(this),
		CreateTableNode: this.transformCreateTable.bind(this),
		AddColumnNode: this.transformAddColumn.bind(this),
		ColumnDefinitionNode: this.transformColumnDefinition.bind(this),
		DropTableNode: this.transformDropTable.bind(this),
		DataTypeNode: this.transformDataType.bind(this),
		OrderByNode: this.transformOrderBy.bind(this),
		OrderByItemNode: this.transformOrderByItem.bind(this),
		GroupByNode: this.transformGroupBy.bind(this),
		GroupByItemNode: this.transformGroupByItem.bind(this),
		UpdateQueryNode: this.transformUpdateQuery.bind(this),
		ColumnUpdateNode: this.transformColumnUpdate.bind(this),
		LimitNode: this.transformLimit.bind(this),
		OffsetNode: this.transformOffset.bind(this),
		OnConflictNode: this.transformOnConflict.bind(this),
		OnDuplicateKeyNode: this.transformOnDuplicateKey.bind(this),
		CreateIndexNode: this.transformCreateIndex.bind(this),
		DropIndexNode: this.transformDropIndex.bind(this),
		ListNode: this.transformList.bind(this),
		PrimaryKeyConstraintNode: this.transformPrimaryKeyConstraint.bind(this),
		UniqueConstraintNode: this.transformUniqueConstraint.bind(this),
		ReferencesNode: this.transformReferences.bind(this),
		CheckConstraintNode: this.transformCheckConstraint.bind(this),
		WithNode: this.transformWith.bind(this),
		CommonTableExpressionNode: this.transformCommonTableExpression.bind(this),
		CommonTableExpressionNameNode: this.transformCommonTableExpressionName.bind(this),
		HavingNode: this.transformHaving.bind(this),
		CreateSchemaNode: this.transformCreateSchema.bind(this),
		DropSchemaNode: this.transformDropSchema.bind(this),
		AlterTableNode: this.transformAlterTable.bind(this),
		DropColumnNode: this.transformDropColumn.bind(this),
		RenameColumnNode: this.transformRenameColumn.bind(this),
		AlterColumnNode: this.transformAlterColumn.bind(this),
		ModifyColumnNode: this.transformModifyColumn.bind(this),
		AddConstraintNode: this.transformAddConstraint.bind(this),
		DropConstraintNode: this.transformDropConstraint.bind(this),
		RenameConstraintNode: this.transformRenameConstraint.bind(this),
		ForeignKeyConstraintNode: this.transformForeignKeyConstraint.bind(this),
		CreateViewNode: this.transformCreateView.bind(this),
		RefreshMaterializedViewNode: this.transformRefreshMaterializedView.bind(this),
		DropViewNode: this.transformDropView.bind(this),
		GeneratedNode: this.transformGenerated.bind(this),
		DefaultValueNode: this.transformDefaultValue.bind(this),
		OnNode: this.transformOn.bind(this),
		ValuesNode: this.transformValues.bind(this),
		SelectModifierNode: this.transformSelectModifier.bind(this),
		CreateTypeNode: this.transformCreateType.bind(this),
		DropTypeNode: this.transformDropType.bind(this),
		ExplainNode: this.transformExplain.bind(this),
		DefaultInsertValueNode: this.transformDefaultInsertValue.bind(this),
		AggregateFunctionNode: this.transformAggregateFunction.bind(this),
		OverNode: this.transformOver.bind(this),
		PartitionByNode: this.transformPartitionBy.bind(this),
		PartitionByItemNode: this.transformPartitionByItem.bind(this),
		SetOperationNode: this.transformSetOperation.bind(this),
		BinaryOperationNode: this.transformBinaryOperation.bind(this),
		UnaryOperationNode: this.transformUnaryOperation.bind(this),
		UsingNode: this.transformUsing.bind(this),
		FunctionNode: this.transformFunction.bind(this),
		CaseNode: this.transformCase.bind(this),
		WhenNode: this.transformWhen.bind(this),
		JSONReferenceNode: this.transformJSONReference.bind(this),
		JSONPathNode: this.transformJSONPath.bind(this),
		JSONPathLegNode: this.transformJSONPathLeg.bind(this),
		JSONOperatorChainNode: this.transformJSONOperatorChain.bind(this),
		TupleNode: this.transformTuple.bind(this),
		MergeQueryNode: this.transformMergeQuery.bind(this),
		MatchedNode: this.transformMatched.bind(this),
		AddIndexNode: this.transformAddIndex.bind(this),
		CastNode: this.transformCast.bind(this),
		FetchNode: this.transformFetch.bind(this),
		TopNode: this.transformTop.bind(this),
		OutputNode: this.transformOutput.bind(this),
		OrActionNode: this.transformOrAction.bind(this),
		CollateNode: this.transformCollate.bind(this)
	});
	transformNode(node, queryId) {
		if (!node) return node;
		this.nodeStack.push(node);
		const out = this.transformNodeImpl(node, queryId);
		this.nodeStack.pop();
		return freeze(out);
	}
	transformNodeImpl(node, queryId) {
		return this.#transformers[node.kind](node, queryId);
	}
	transformNodeList(list, queryId) {
		if (!list) return list;
		return freeze(list.map((node) => this.transformNode(node, queryId)));
	}
	transformSelectQuery(node, queryId) {
		return requireAllProps({
			kind: "SelectQueryNode",
			from: this.transformNode(node.from, queryId),
			selections: this.transformNodeList(node.selections, queryId),
			distinctOn: this.transformNodeList(node.distinctOn, queryId),
			joins: this.transformNodeList(node.joins, queryId),
			groupBy: this.transformNode(node.groupBy, queryId),
			orderBy: this.transformNode(node.orderBy, queryId),
			where: this.transformNode(node.where, queryId),
			frontModifiers: this.transformNodeList(node.frontModifiers, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			limit: this.transformNode(node.limit, queryId),
			offset: this.transformNode(node.offset, queryId),
			with: this.transformNode(node.with, queryId),
			having: this.transformNode(node.having, queryId),
			explain: this.transformNode(node.explain, queryId),
			setOperations: this.transformNodeList(node.setOperations, queryId),
			fetch: this.transformNode(node.fetch, queryId),
			top: this.transformNode(node.top, queryId)
		});
	}
	transformSelection(node, queryId) {
		return requireAllProps({
			kind: "SelectionNode",
			selection: this.transformNode(node.selection, queryId)
		});
	}
	transformColumn(node, queryId) {
		return requireAllProps({
			kind: "ColumnNode",
			column: this.transformNode(node.column, queryId)
		});
	}
	transformAlias(node, queryId) {
		return requireAllProps({
			kind: "AliasNode",
			node: this.transformNode(node.node, queryId),
			alias: this.transformNode(node.alias, queryId)
		});
	}
	transformTable(node, queryId) {
		return requireAllProps({
			kind: "TableNode",
			table: this.transformNode(node.table, queryId)
		});
	}
	transformFrom(node, queryId) {
		return requireAllProps({
			kind: "FromNode",
			froms: this.transformNodeList(node.froms, queryId)
		});
	}
	transformReference(node, queryId) {
		return requireAllProps({
			kind: "ReferenceNode",
			column: this.transformNode(node.column, queryId),
			table: this.transformNode(node.table, queryId)
		});
	}
	transformAnd(node, queryId) {
		return requireAllProps({
			kind: "AndNode",
			left: this.transformNode(node.left, queryId),
			right: this.transformNode(node.right, queryId)
		});
	}
	transformOr(node, queryId) {
		return requireAllProps({
			kind: "OrNode",
			left: this.transformNode(node.left, queryId),
			right: this.transformNode(node.right, queryId)
		});
	}
	transformValueList(node, queryId) {
		return requireAllProps({
			kind: "ValueListNode",
			values: this.transformNodeList(node.values, queryId)
		});
	}
	transformParens(node, queryId) {
		return requireAllProps({
			kind: "ParensNode",
			node: this.transformNode(node.node, queryId)
		});
	}
	transformJoin(node, queryId) {
		return requireAllProps({
			kind: "JoinNode",
			joinType: node.joinType,
			table: this.transformNode(node.table, queryId),
			on: this.transformNode(node.on, queryId)
		});
	}
	transformRaw(node, queryId) {
		return requireAllProps({
			kind: "RawNode",
			sqlFragments: freeze([...node.sqlFragments]),
			parameters: this.transformNodeList(node.parameters, queryId)
		});
	}
	transformWhere(node, queryId) {
		return requireAllProps({
			kind: "WhereNode",
			where: this.transformNode(node.where, queryId)
		});
	}
	transformInsertQuery(node, queryId) {
		return requireAllProps({
			kind: "InsertQueryNode",
			into: this.transformNode(node.into, queryId),
			columns: this.transformNodeList(node.columns, queryId),
			values: this.transformNode(node.values, queryId),
			returning: this.transformNode(node.returning, queryId),
			onConflict: this.transformNode(node.onConflict, queryId),
			onDuplicateKey: this.transformNode(node.onDuplicateKey, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			with: this.transformNode(node.with, queryId),
			ignore: node.ignore,
			orAction: this.transformNode(node.orAction, queryId),
			replace: node.replace,
			explain: this.transformNode(node.explain, queryId),
			defaultValues: node.defaultValues,
			top: this.transformNode(node.top, queryId),
			output: this.transformNode(node.output, queryId)
		});
	}
	transformValues(node, queryId) {
		return requireAllProps({
			kind: "ValuesNode",
			values: this.transformNodeList(node.values, queryId)
		});
	}
	transformDeleteQuery(node, queryId) {
		return requireAllProps({
			kind: "DeleteQueryNode",
			from: this.transformNode(node.from, queryId),
			using: this.transformNode(node.using, queryId),
			joins: this.transformNodeList(node.joins, queryId),
			where: this.transformNode(node.where, queryId),
			returning: this.transformNode(node.returning, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			with: this.transformNode(node.with, queryId),
			orderBy: this.transformNode(node.orderBy, queryId),
			limit: this.transformNode(node.limit, queryId),
			explain: this.transformNode(node.explain, queryId),
			top: this.transformNode(node.top, queryId),
			output: this.transformNode(node.output, queryId)
		});
	}
	transformReturning(node, queryId) {
		return requireAllProps({
			kind: "ReturningNode",
			selections: this.transformNodeList(node.selections, queryId)
		});
	}
	transformCreateTable(node, queryId) {
		return requireAllProps({
			kind: "CreateTableNode",
			table: this.transformNode(node.table, queryId),
			columns: this.transformNodeList(node.columns, queryId),
			constraints: this.transformNodeList(node.constraints, queryId),
			temporary: node.temporary,
			ifNotExists: node.ifNotExists,
			onCommit: node.onCommit,
			frontModifiers: this.transformNodeList(node.frontModifiers, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			selectQuery: this.transformNode(node.selectQuery, queryId)
		});
	}
	transformColumnDefinition(node, queryId) {
		return requireAllProps({
			kind: "ColumnDefinitionNode",
			column: this.transformNode(node.column, queryId),
			dataType: this.transformNode(node.dataType, queryId),
			references: this.transformNode(node.references, queryId),
			primaryKey: node.primaryKey,
			autoIncrement: node.autoIncrement,
			unique: node.unique,
			notNull: node.notNull,
			unsigned: node.unsigned,
			defaultTo: this.transformNode(node.defaultTo, queryId),
			check: this.transformNode(node.check, queryId),
			generated: this.transformNode(node.generated, queryId),
			frontModifiers: this.transformNodeList(node.frontModifiers, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			nullsNotDistinct: node.nullsNotDistinct,
			identity: node.identity,
			ifNotExists: node.ifNotExists
		});
	}
	transformAddColumn(node, queryId) {
		return requireAllProps({
			kind: "AddColumnNode",
			column: this.transformNode(node.column, queryId)
		});
	}
	transformDropTable(node, queryId) {
		return requireAllProps({
			kind: "DropTableNode",
			table: this.transformNode(node.table, queryId),
			ifExists: node.ifExists,
			cascade: node.cascade
		});
	}
	transformOrderBy(node, queryId) {
		return requireAllProps({
			kind: "OrderByNode",
			items: this.transformNodeList(node.items, queryId)
		});
	}
	transformOrderByItem(node, queryId) {
		return requireAllProps({
			kind: "OrderByItemNode",
			orderBy: this.transformNode(node.orderBy, queryId),
			direction: this.transformNode(node.direction, queryId),
			collation: this.transformNode(node.collation, queryId),
			nulls: node.nulls
		});
	}
	transformGroupBy(node, queryId) {
		return requireAllProps({
			kind: "GroupByNode",
			items: this.transformNodeList(node.items, queryId)
		});
	}
	transformGroupByItem(node, queryId) {
		return requireAllProps({
			kind: "GroupByItemNode",
			groupBy: this.transformNode(node.groupBy, queryId)
		});
	}
	transformUpdateQuery(node, queryId) {
		return requireAllProps({
			kind: "UpdateQueryNode",
			table: this.transformNode(node.table, queryId),
			from: this.transformNode(node.from, queryId),
			joins: this.transformNodeList(node.joins, queryId),
			where: this.transformNode(node.where, queryId),
			updates: this.transformNodeList(node.updates, queryId),
			returning: this.transformNode(node.returning, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			with: this.transformNode(node.with, queryId),
			explain: this.transformNode(node.explain, queryId),
			limit: this.transformNode(node.limit, queryId),
			top: this.transformNode(node.top, queryId),
			output: this.transformNode(node.output, queryId),
			orderBy: this.transformNode(node.orderBy, queryId)
		});
	}
	transformColumnUpdate(node, queryId) {
		return requireAllProps({
			kind: "ColumnUpdateNode",
			column: this.transformNode(node.column, queryId),
			value: this.transformNode(node.value, queryId)
		});
	}
	transformLimit(node, queryId) {
		return requireAllProps({
			kind: "LimitNode",
			limit: this.transformNode(node.limit, queryId)
		});
	}
	transformOffset(node, queryId) {
		return requireAllProps({
			kind: "OffsetNode",
			offset: this.transformNode(node.offset, queryId)
		});
	}
	transformOnConflict(node, queryId) {
		return requireAllProps({
			kind: "OnConflictNode",
			columns: this.transformNodeList(node.columns, queryId),
			constraint: this.transformNode(node.constraint, queryId),
			indexExpression: this.transformNode(node.indexExpression, queryId),
			indexWhere: this.transformNode(node.indexWhere, queryId),
			updates: this.transformNodeList(node.updates, queryId),
			updateWhere: this.transformNode(node.updateWhere, queryId),
			doNothing: node.doNothing
		});
	}
	transformOnDuplicateKey(node, queryId) {
		return requireAllProps({
			kind: "OnDuplicateKeyNode",
			updates: this.transformNodeList(node.updates, queryId)
		});
	}
	transformCreateIndex(node, queryId) {
		return requireAllProps({
			kind: "CreateIndexNode",
			name: this.transformNode(node.name, queryId),
			table: this.transformNode(node.table, queryId),
			columns: this.transformNodeList(node.columns, queryId),
			unique: node.unique,
			using: this.transformNode(node.using, queryId),
			ifNotExists: node.ifNotExists,
			where: this.transformNode(node.where, queryId),
			nullsNotDistinct: node.nullsNotDistinct
		});
	}
	transformList(node, queryId) {
		return requireAllProps({
			kind: "ListNode",
			items: this.transformNodeList(node.items, queryId)
		});
	}
	transformDropIndex(node, queryId) {
		return requireAllProps({
			kind: "DropIndexNode",
			name: this.transformNode(node.name, queryId),
			table: this.transformNode(node.table, queryId),
			ifExists: node.ifExists,
			cascade: node.cascade
		});
	}
	transformPrimaryKeyConstraint(node, queryId) {
		return requireAllProps({
			kind: "PrimaryKeyConstraintNode",
			columns: this.transformNodeList(node.columns, queryId),
			name: this.transformNode(node.name, queryId),
			deferrable: node.deferrable,
			initiallyDeferred: node.initiallyDeferred
		});
	}
	transformUniqueConstraint(node, queryId) {
		return requireAllProps({
			kind: "UniqueConstraintNode",
			columns: this.transformNodeList(node.columns, queryId),
			name: this.transformNode(node.name, queryId),
			nullsNotDistinct: node.nullsNotDistinct,
			deferrable: node.deferrable,
			initiallyDeferred: node.initiallyDeferred
		});
	}
	transformForeignKeyConstraint(node, queryId) {
		return requireAllProps({
			kind: "ForeignKeyConstraintNode",
			columns: this.transformNodeList(node.columns, queryId),
			references: this.transformNode(node.references, queryId),
			name: this.transformNode(node.name, queryId),
			onDelete: node.onDelete,
			onUpdate: node.onUpdate,
			deferrable: node.deferrable,
			initiallyDeferred: node.initiallyDeferred
		});
	}
	transformSetOperation(node, queryId) {
		return requireAllProps({
			kind: "SetOperationNode",
			operator: node.operator,
			expression: this.transformNode(node.expression, queryId),
			all: node.all
		});
	}
	transformReferences(node, queryId) {
		return requireAllProps({
			kind: "ReferencesNode",
			table: this.transformNode(node.table, queryId),
			columns: this.transformNodeList(node.columns, queryId),
			onDelete: node.onDelete,
			onUpdate: node.onUpdate
		});
	}
	transformCheckConstraint(node, queryId) {
		return requireAllProps({
			kind: "CheckConstraintNode",
			expression: this.transformNode(node.expression, queryId),
			name: this.transformNode(node.name, queryId)
		});
	}
	transformWith(node, queryId) {
		return requireAllProps({
			kind: "WithNode",
			expressions: this.transformNodeList(node.expressions, queryId),
			recursive: node.recursive
		});
	}
	transformCommonTableExpression(node, queryId) {
		return requireAllProps({
			kind: "CommonTableExpressionNode",
			name: this.transformNode(node.name, queryId),
			materialized: node.materialized,
			expression: this.transformNode(node.expression, queryId)
		});
	}
	transformCommonTableExpressionName(node, queryId) {
		return requireAllProps({
			kind: "CommonTableExpressionNameNode",
			table: this.transformNode(node.table, queryId),
			columns: this.transformNodeList(node.columns, queryId)
		});
	}
	transformHaving(node, queryId) {
		return requireAllProps({
			kind: "HavingNode",
			having: this.transformNode(node.having, queryId)
		});
	}
	transformCreateSchema(node, queryId) {
		return requireAllProps({
			kind: "CreateSchemaNode",
			schema: this.transformNode(node.schema, queryId),
			ifNotExists: node.ifNotExists
		});
	}
	transformDropSchema(node, queryId) {
		return requireAllProps({
			kind: "DropSchemaNode",
			schema: this.transformNode(node.schema, queryId),
			ifExists: node.ifExists,
			cascade: node.cascade
		});
	}
	transformAlterTable(node, queryId) {
		return requireAllProps({
			kind: "AlterTableNode",
			table: this.transformNode(node.table, queryId),
			renameTo: this.transformNode(node.renameTo, queryId),
			setSchema: this.transformNode(node.setSchema, queryId),
			columnAlterations: this.transformNodeList(node.columnAlterations, queryId),
			addConstraint: this.transformNode(node.addConstraint, queryId),
			dropConstraint: this.transformNode(node.dropConstraint, queryId),
			renameConstraint: this.transformNode(node.renameConstraint, queryId),
			addIndex: this.transformNode(node.addIndex, queryId),
			dropIndex: this.transformNode(node.dropIndex, queryId)
		});
	}
	transformDropColumn(node, queryId) {
		return requireAllProps({
			kind: "DropColumnNode",
			column: this.transformNode(node.column, queryId)
		});
	}
	transformRenameColumn(node, queryId) {
		return requireAllProps({
			kind: "RenameColumnNode",
			column: this.transformNode(node.column, queryId),
			renameTo: this.transformNode(node.renameTo, queryId)
		});
	}
	transformAlterColumn(node, queryId) {
		return requireAllProps({
			kind: "AlterColumnNode",
			column: this.transformNode(node.column, queryId),
			dataType: this.transformNode(node.dataType, queryId),
			dataTypeExpression: this.transformNode(node.dataTypeExpression, queryId),
			setDefault: this.transformNode(node.setDefault, queryId),
			dropDefault: node.dropDefault,
			setNotNull: node.setNotNull,
			dropNotNull: node.dropNotNull
		});
	}
	transformModifyColumn(node, queryId) {
		return requireAllProps({
			kind: "ModifyColumnNode",
			column: this.transformNode(node.column, queryId)
		});
	}
	transformAddConstraint(node, queryId) {
		return requireAllProps({
			kind: "AddConstraintNode",
			constraint: this.transformNode(node.constraint, queryId)
		});
	}
	transformDropConstraint(node, queryId) {
		return requireAllProps({
			kind: "DropConstraintNode",
			constraintName: this.transformNode(node.constraintName, queryId),
			ifExists: node.ifExists,
			modifier: node.modifier
		});
	}
	transformRenameConstraint(node, queryId) {
		return requireAllProps({
			kind: "RenameConstraintNode",
			oldName: this.transformNode(node.oldName, queryId),
			newName: this.transformNode(node.newName, queryId)
		});
	}
	transformCreateView(node, queryId) {
		return requireAllProps({
			kind: "CreateViewNode",
			name: this.transformNode(node.name, queryId),
			temporary: node.temporary,
			orReplace: node.orReplace,
			ifNotExists: node.ifNotExists,
			materialized: node.materialized,
			columns: this.transformNodeList(node.columns, queryId),
			as: this.transformNode(node.as, queryId)
		});
	}
	transformRefreshMaterializedView(node, queryId) {
		return requireAllProps({
			kind: "RefreshMaterializedViewNode",
			name: this.transformNode(node.name, queryId),
			concurrently: node.concurrently,
			withNoData: node.withNoData
		});
	}
	transformDropView(node, queryId) {
		return requireAllProps({
			kind: "DropViewNode",
			name: this.transformNode(node.name, queryId),
			ifExists: node.ifExists,
			materialized: node.materialized,
			cascade: node.cascade
		});
	}
	transformGenerated(node, queryId) {
		return requireAllProps({
			kind: "GeneratedNode",
			byDefault: node.byDefault,
			always: node.always,
			identity: node.identity,
			stored: node.stored,
			expression: this.transformNode(node.expression, queryId)
		});
	}
	transformDefaultValue(node, queryId) {
		return requireAllProps({
			kind: "DefaultValueNode",
			defaultValue: this.transformNode(node.defaultValue, queryId)
		});
	}
	transformOn(node, queryId) {
		return requireAllProps({
			kind: "OnNode",
			on: this.transformNode(node.on, queryId)
		});
	}
	transformSelectModifier(node, queryId) {
		return requireAllProps({
			kind: "SelectModifierNode",
			modifier: node.modifier,
			rawModifier: this.transformNode(node.rawModifier, queryId),
			of: this.transformNodeList(node.of, queryId)
		});
	}
	transformCreateType(node, queryId) {
		return requireAllProps({
			kind: "CreateTypeNode",
			name: this.transformNode(node.name, queryId),
			enum: this.transformNode(node.enum, queryId)
		});
	}
	transformDropType(node, queryId) {
		return requireAllProps({
			kind: "DropTypeNode",
			name: this.transformNode(node.name, queryId),
			ifExists: node.ifExists
		});
	}
	transformExplain(node, queryId) {
		return requireAllProps({
			kind: "ExplainNode",
			format: node.format,
			options: this.transformNode(node.options, queryId)
		});
	}
	transformSchemableIdentifier(node, queryId) {
		return requireAllProps({
			kind: "SchemableIdentifierNode",
			schema: this.transformNode(node.schema, queryId),
			identifier: this.transformNode(node.identifier, queryId)
		});
	}
	transformAggregateFunction(node, queryId) {
		return requireAllProps({
			kind: "AggregateFunctionNode",
			func: node.func,
			aggregated: this.transformNodeList(node.aggregated, queryId),
			distinct: node.distinct,
			orderBy: this.transformNode(node.orderBy, queryId),
			withinGroup: this.transformNode(node.withinGroup, queryId),
			filter: this.transformNode(node.filter, queryId),
			over: this.transformNode(node.over, queryId)
		});
	}
	transformOver(node, queryId) {
		return requireAllProps({
			kind: "OverNode",
			orderBy: this.transformNode(node.orderBy, queryId),
			partitionBy: this.transformNode(node.partitionBy, queryId)
		});
	}
	transformPartitionBy(node, queryId) {
		return requireAllProps({
			kind: "PartitionByNode",
			items: this.transformNodeList(node.items, queryId)
		});
	}
	transformPartitionByItem(node, queryId) {
		return requireAllProps({
			kind: "PartitionByItemNode",
			partitionBy: this.transformNode(node.partitionBy, queryId)
		});
	}
	transformBinaryOperation(node, queryId) {
		return requireAllProps({
			kind: "BinaryOperationNode",
			leftOperand: this.transformNode(node.leftOperand, queryId),
			operator: this.transformNode(node.operator, queryId),
			rightOperand: this.transformNode(node.rightOperand, queryId)
		});
	}
	transformUnaryOperation(node, queryId) {
		return requireAllProps({
			kind: "UnaryOperationNode",
			operator: this.transformNode(node.operator, queryId),
			operand: this.transformNode(node.operand, queryId)
		});
	}
	transformUsing(node, queryId) {
		return requireAllProps({
			kind: "UsingNode",
			tables: this.transformNodeList(node.tables, queryId)
		});
	}
	transformFunction(node, queryId) {
		return requireAllProps({
			kind: "FunctionNode",
			func: node.func,
			arguments: this.transformNodeList(node.arguments, queryId)
		});
	}
	transformCase(node, queryId) {
		return requireAllProps({
			kind: "CaseNode",
			value: this.transformNode(node.value, queryId),
			when: this.transformNodeList(node.when, queryId),
			else: this.transformNode(node.else, queryId),
			isStatement: node.isStatement
		});
	}
	transformWhen(node, queryId) {
		return requireAllProps({
			kind: "WhenNode",
			condition: this.transformNode(node.condition, queryId),
			result: this.transformNode(node.result, queryId)
		});
	}
	transformJSONReference(node, queryId) {
		return requireAllProps({
			kind: "JSONReferenceNode",
			reference: this.transformNode(node.reference, queryId),
			traversal: this.transformNode(node.traversal, queryId)
		});
	}
	transformJSONPath(node, queryId) {
		return requireAllProps({
			kind: "JSONPathNode",
			inOperator: this.transformNode(node.inOperator, queryId),
			pathLegs: this.transformNodeList(node.pathLegs, queryId)
		});
	}
	transformJSONPathLeg(node, _queryId) {
		return requireAllProps({
			kind: "JSONPathLegNode",
			type: node.type,
			value: node.value
		});
	}
	transformJSONOperatorChain(node, queryId) {
		return requireAllProps({
			kind: "JSONOperatorChainNode",
			operator: this.transformNode(node.operator, queryId),
			values: this.transformNodeList(node.values, queryId)
		});
	}
	transformTuple(node, queryId) {
		return requireAllProps({
			kind: "TupleNode",
			values: this.transformNodeList(node.values, queryId)
		});
	}
	transformMergeQuery(node, queryId) {
		return requireAllProps({
			kind: "MergeQueryNode",
			into: this.transformNode(node.into, queryId),
			using: this.transformNode(node.using, queryId),
			whens: this.transformNodeList(node.whens, queryId),
			with: this.transformNode(node.with, queryId),
			top: this.transformNode(node.top, queryId),
			endModifiers: this.transformNodeList(node.endModifiers, queryId),
			output: this.transformNode(node.output, queryId),
			returning: this.transformNode(node.returning, queryId)
		});
	}
	transformMatched(node, _queryId) {
		return requireAllProps({
			kind: "MatchedNode",
			not: node.not,
			bySource: node.bySource
		});
	}
	transformAddIndex(node, queryId) {
		return requireAllProps({
			kind: "AddIndexNode",
			name: this.transformNode(node.name, queryId),
			columns: this.transformNodeList(node.columns, queryId),
			unique: node.unique,
			using: this.transformNode(node.using, queryId),
			ifNotExists: node.ifNotExists
		});
	}
	transformCast(node, queryId) {
		return requireAllProps({
			kind: "CastNode",
			expression: this.transformNode(node.expression, queryId),
			dataType: this.transformNode(node.dataType, queryId)
		});
	}
	transformFetch(node, queryId) {
		return requireAllProps({
			kind: "FetchNode",
			rowCount: this.transformNode(node.rowCount, queryId),
			modifier: node.modifier
		});
	}
	transformTop(node, _queryId) {
		return requireAllProps({
			kind: "TopNode",
			expression: node.expression,
			modifiers: node.modifiers
		});
	}
	transformOutput(node, queryId) {
		return requireAllProps({
			kind: "OutputNode",
			selections: this.transformNodeList(node.selections, queryId)
		});
	}
	transformDataType(node, _queryId) {
		return node;
	}
	transformSelectAll(node, _queryId) {
		return node;
	}
	transformIdentifier(node, _queryId) {
		return node;
	}
	transformValue(node, _queryId) {
		return node;
	}
	transformPrimitiveValueList(node, _queryId) {
		return node;
	}
	transformOperator(node, _queryId) {
		return node;
	}
	transformDefaultInsertValue(node, _queryId) {
		return node;
	}
	transformOrAction(node, _queryId) {
		return node;
	}
	transformCollate(node, _queryId) {
		return node;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/plugin/with-schema/with-schema-transformer.js
const ROOT_OPERATION_NODES = freeze({
	AlterTableNode: true,
	CreateIndexNode: true,
	CreateSchemaNode: true,
	CreateTableNode: true,
	CreateTypeNode: true,
	CreateViewNode: true,
	RefreshMaterializedViewNode: true,
	DeleteQueryNode: true,
	DropIndexNode: true,
	DropSchemaNode: true,
	DropTableNode: true,
	DropTypeNode: true,
	DropViewNode: true,
	InsertQueryNode: true,
	RawNode: true,
	SelectQueryNode: true,
	UpdateQueryNode: true,
	MergeQueryNode: true
});
const SCHEMALESS_FUNCTIONS = {
	json_agg: true,
	to_json: true
};
var WithSchemaTransformer = class extends OperationNodeTransformer {
	#schema;
	#schemableIds = /* @__PURE__ */ new Set();
	#ctes = /* @__PURE__ */ new Set();
	constructor(schema) {
		super();
		this.#schema = schema;
	}
	transformNodeImpl(node, queryId) {
		if (!this.#isRootOperationNode(node)) return super.transformNodeImpl(node, queryId);
		const ctes = this.#collectCTEs(node);
		for (const cte of ctes) this.#ctes.add(cte);
		const tables = this.#collectSchemableIds(node);
		for (const table of tables) this.#schemableIds.add(table);
		const transformed = super.transformNodeImpl(node, queryId);
		for (const table of tables) this.#schemableIds.delete(table);
		for (const cte of ctes) this.#ctes.delete(cte);
		return transformed;
	}
	transformSchemableIdentifier(node, queryId) {
		const transformed = super.transformSchemableIdentifier(node, queryId);
		if (transformed.schema || !this.#schemableIds.has(node.identifier.name)) return transformed;
		return {
			...transformed,
			schema: IdentifierNode.create(this.#schema)
		};
	}
	transformReferences(node, queryId) {
		const transformed = super.transformReferences(node, queryId);
		if (transformed.table.table.schema) return transformed;
		return {
			...transformed,
			table: TableNode.createWithSchema(this.#schema, transformed.table.table.identifier.name)
		};
	}
	transformAggregateFunction(node, queryId) {
		return {
			...super.transformAggregateFunction({
				...node,
				aggregated: []
			}, queryId),
			aggregated: this.#transformTableArgsWithoutSchemas(node, queryId, "aggregated")
		};
	}
	transformFunction(node, queryId) {
		return {
			...super.transformFunction({
				...node,
				arguments: []
			}, queryId),
			arguments: this.#transformTableArgsWithoutSchemas(node, queryId, "arguments")
		};
	}
	transformSelectModifier(node, queryId) {
		return {
			...super.transformSelectModifier({
				...node,
				of: void 0
			}, queryId),
			of: node.of?.map((item) => TableNode.is(item) && !item.table.schema ? {
				...item,
				table: this.transformIdentifier(item.table.identifier, queryId)
			} : this.transformNode(item, queryId))
		};
	}
	#transformTableArgsWithoutSchemas(node, queryId, argsKey) {
		return SCHEMALESS_FUNCTIONS[node.func] ? node[argsKey].map((arg) => !TableNode.is(arg) || arg.table.schema ? this.transformNode(arg, queryId) : {
			...arg,
			table: this.transformIdentifier(arg.table.identifier, queryId)
		}) : this.transformNodeList(node[argsKey], queryId);
	}
	#isRootOperationNode(node) {
		return node.kind in ROOT_OPERATION_NODES;
	}
	#collectSchemableIds(node) {
		const schemableIds = /* @__PURE__ */ new Set();
		if ("name" in node && node.name && SchemableIdentifierNode.is(node.name)) this.#collectSchemableId(node.name, schemableIds);
		if ("from" in node && node.from) for (const from of node.from.froms) this.#collectSchemableIdsFromTableExpr(from, schemableIds);
		if ("into" in node && node.into) this.#collectSchemableIdsFromTableExpr(node.into, schemableIds);
		if ("table" in node && node.table) this.#collectSchemableIdsFromTableExpr(node.table, schemableIds);
		if ("joins" in node && node.joins) for (const join of node.joins) this.#collectSchemableIdsFromTableExpr(join.table, schemableIds);
		if ("using" in node && node.using) if (JoinNode.is(node.using)) this.#collectSchemableIdsFromTableExpr(node.using.table, schemableIds);
		else this.#collectSchemableIdsFromTableExpr(node.using, schemableIds);
		return schemableIds;
	}
	#collectCTEs(node) {
		const ctes = /* @__PURE__ */ new Set();
		if ("with" in node && node.with) this.#collectCTEIds(node.with, ctes);
		return ctes;
	}
	#collectSchemableIdsFromTableExpr(node, schemableIds) {
		if (TableNode.is(node)) return this.#collectSchemableId(node.table, schemableIds);
		if (AliasNode.is(node) && TableNode.is(node.node)) return this.#collectSchemableId(node.node.table, schemableIds);
		if (ListNode.is(node)) {
			for (const table of node.items) this.#collectSchemableIdsFromTableExpr(table, schemableIds);
			return;
		}
		if (UsingNode.is(node)) {
			for (const table of node.tables) this.#collectSchemableIdsFromTableExpr(table, schemableIds);
			return;
		}
	}
	#collectSchemableId(node, schemableIds) {
		const id = node.identifier.name;
		if (!this.#schemableIds.has(id) && !this.#ctes.has(id)) schemableIds.add(id);
	}
	#collectCTEIds(node, ctes) {
		for (const expr of node.expressions) {
			const cteId = expr.name.table.table.identifier.name;
			if (!this.#ctes.has(cteId)) ctes.add(cteId);
		}
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/plugin/with-schema/with-schema-plugin.js
var WithSchemaPlugin = class {
	#transformer;
	constructor(schema) {
		this.#transformer = new WithSchemaTransformer(schema);
	}
	transformQuery(args) {
		return this.#transformer.transformNode(args.node, args.queryId);
	}
	async transformResult(args) {
		return args.result;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/set-operation-node.js
/**
* @internal
*/
const SetOperationNode = freeze({
	is(node) {
		return node.kind === "SetOperationNode";
	},
	create(operator, expression, all) {
		return freeze({
			kind: "SetOperationNode",
			operator,
			expression,
			all
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/create-view-node.js
/**
* @internal
*/
const CreateViewNode = freeze({
	is(node) {
		return node.kind === "CreateViewNode";
	},
	create(name) {
		return freeze({
			kind: "CreateViewNode",
			name: SchemableIdentifierNode.create(name)
		});
	},
	cloneWith(createView, params) {
		return freeze({
			...createView,
			...params
		});
	}
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/operation-node/operation-node-visitor.js
var OperationNodeVisitor = class {
	nodeStack = [];
	get parentNode() {
		return this.nodeStack[this.nodeStack.length - 2];
	}
	#visitors = freeze({
		AliasNode: this.visitAlias.bind(this),
		ColumnNode: this.visitColumn.bind(this),
		IdentifierNode: this.visitIdentifier.bind(this),
		SchemableIdentifierNode: this.visitSchemableIdentifier.bind(this),
		RawNode: this.visitRaw.bind(this),
		ReferenceNode: this.visitReference.bind(this),
		SelectQueryNode: this.visitSelectQuery.bind(this),
		SelectionNode: this.visitSelection.bind(this),
		TableNode: this.visitTable.bind(this),
		FromNode: this.visitFrom.bind(this),
		SelectAllNode: this.visitSelectAll.bind(this),
		AndNode: this.visitAnd.bind(this),
		OrNode: this.visitOr.bind(this),
		ValueNode: this.visitValue.bind(this),
		ValueListNode: this.visitValueList.bind(this),
		PrimitiveValueListNode: this.visitPrimitiveValueList.bind(this),
		ParensNode: this.visitParens.bind(this),
		JoinNode: this.visitJoin.bind(this),
		OperatorNode: this.visitOperator.bind(this),
		WhereNode: this.visitWhere.bind(this),
		InsertQueryNode: this.visitInsertQuery.bind(this),
		DeleteQueryNode: this.visitDeleteQuery.bind(this),
		ReturningNode: this.visitReturning.bind(this),
		CreateTableNode: this.visitCreateTable.bind(this),
		AddColumnNode: this.visitAddColumn.bind(this),
		ColumnDefinitionNode: this.visitColumnDefinition.bind(this),
		DropTableNode: this.visitDropTable.bind(this),
		DataTypeNode: this.visitDataType.bind(this),
		OrderByNode: this.visitOrderBy.bind(this),
		OrderByItemNode: this.visitOrderByItem.bind(this),
		GroupByNode: this.visitGroupBy.bind(this),
		GroupByItemNode: this.visitGroupByItem.bind(this),
		UpdateQueryNode: this.visitUpdateQuery.bind(this),
		ColumnUpdateNode: this.visitColumnUpdate.bind(this),
		LimitNode: this.visitLimit.bind(this),
		OffsetNode: this.visitOffset.bind(this),
		OnConflictNode: this.visitOnConflict.bind(this),
		OnDuplicateKeyNode: this.visitOnDuplicateKey.bind(this),
		CreateIndexNode: this.visitCreateIndex.bind(this),
		DropIndexNode: this.visitDropIndex.bind(this),
		ListNode: this.visitList.bind(this),
		PrimaryKeyConstraintNode: this.visitPrimaryKeyConstraint.bind(this),
		UniqueConstraintNode: this.visitUniqueConstraint.bind(this),
		ReferencesNode: this.visitReferences.bind(this),
		CheckConstraintNode: this.visitCheckConstraint.bind(this),
		WithNode: this.visitWith.bind(this),
		CommonTableExpressionNode: this.visitCommonTableExpression.bind(this),
		CommonTableExpressionNameNode: this.visitCommonTableExpressionName.bind(this),
		HavingNode: this.visitHaving.bind(this),
		CreateSchemaNode: this.visitCreateSchema.bind(this),
		DropSchemaNode: this.visitDropSchema.bind(this),
		AlterTableNode: this.visitAlterTable.bind(this),
		DropColumnNode: this.visitDropColumn.bind(this),
		RenameColumnNode: this.visitRenameColumn.bind(this),
		AlterColumnNode: this.visitAlterColumn.bind(this),
		ModifyColumnNode: this.visitModifyColumn.bind(this),
		AddConstraintNode: this.visitAddConstraint.bind(this),
		DropConstraintNode: this.visitDropConstraint.bind(this),
		RenameConstraintNode: this.visitRenameConstraint.bind(this),
		ForeignKeyConstraintNode: this.visitForeignKeyConstraint.bind(this),
		CreateViewNode: this.visitCreateView.bind(this),
		RefreshMaterializedViewNode: this.visitRefreshMaterializedView.bind(this),
		DropViewNode: this.visitDropView.bind(this),
		GeneratedNode: this.visitGenerated.bind(this),
		DefaultValueNode: this.visitDefaultValue.bind(this),
		OnNode: this.visitOn.bind(this),
		ValuesNode: this.visitValues.bind(this),
		SelectModifierNode: this.visitSelectModifier.bind(this),
		CreateTypeNode: this.visitCreateType.bind(this),
		DropTypeNode: this.visitDropType.bind(this),
		ExplainNode: this.visitExplain.bind(this),
		DefaultInsertValueNode: this.visitDefaultInsertValue.bind(this),
		AggregateFunctionNode: this.visitAggregateFunction.bind(this),
		OverNode: this.visitOver.bind(this),
		PartitionByNode: this.visitPartitionBy.bind(this),
		PartitionByItemNode: this.visitPartitionByItem.bind(this),
		SetOperationNode: this.visitSetOperation.bind(this),
		BinaryOperationNode: this.visitBinaryOperation.bind(this),
		UnaryOperationNode: this.visitUnaryOperation.bind(this),
		UsingNode: this.visitUsing.bind(this),
		FunctionNode: this.visitFunction.bind(this),
		CaseNode: this.visitCase.bind(this),
		WhenNode: this.visitWhen.bind(this),
		JSONReferenceNode: this.visitJSONReference.bind(this),
		JSONPathNode: this.visitJSONPath.bind(this),
		JSONPathLegNode: this.visitJSONPathLeg.bind(this),
		JSONOperatorChainNode: this.visitJSONOperatorChain.bind(this),
		TupleNode: this.visitTuple.bind(this),
		MergeQueryNode: this.visitMergeQuery.bind(this),
		MatchedNode: this.visitMatched.bind(this),
		AddIndexNode: this.visitAddIndex.bind(this),
		CastNode: this.visitCast.bind(this),
		FetchNode: this.visitFetch.bind(this),
		TopNode: this.visitTop.bind(this),
		OutputNode: this.visitOutput.bind(this),
		OrActionNode: this.visitOrAction.bind(this),
		CollateNode: this.visitCollate.bind(this)
	});
	visitNode = (node) => {
		this.nodeStack.push(node);
		this.#visitors[node.kind](node);
		this.nodeStack.pop();
	};
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/query-compiler/default-query-compiler.js
const LIT_WRAP_REGEX = /'/g;
var DefaultQueryCompiler = class extends OperationNodeVisitor {
	#sql = "";
	#parameters = [];
	get numParameters() {
		return this.#parameters.length;
	}
	compileQuery(node, queryId) {
		this.#sql = "";
		this.#parameters = [];
		this.nodeStack.splice(0, this.nodeStack.length);
		this.visitNode(node);
		return freeze({
			query: node,
			queryId,
			sql: this.getSql(),
			parameters: [...this.#parameters]
		});
	}
	getSql() {
		return this.#sql;
	}
	visitSelectQuery(node) {
		const wrapInParens = this.parentNode !== void 0 && !ParensNode.is(this.parentNode) && !InsertQueryNode.is(this.parentNode) && !CreateTableNode.is(this.parentNode) && !CreateViewNode.is(this.parentNode) && !SetOperationNode.is(this.parentNode);
		if (this.parentNode === void 0 && node.explain) {
			this.visitNode(node.explain);
			this.append(" ");
		}
		if (wrapInParens) this.append("(");
		if (node.with) {
			this.visitNode(node.with);
			this.append(" ");
		}
		this.append("select");
		if (node.distinctOn) {
			this.append(" ");
			this.compileDistinctOn(node.distinctOn);
		}
		if (node.frontModifiers?.length) {
			this.append(" ");
			this.compileList(node.frontModifiers, " ");
		}
		if (node.top) {
			this.append(" ");
			this.visitNode(node.top);
		}
		if (node.selections) {
			this.append(" ");
			this.compileList(node.selections);
		}
		if (node.from) {
			this.append(" ");
			this.visitNode(node.from);
		}
		if (node.joins) {
			this.append(" ");
			this.compileList(node.joins, " ");
		}
		if (node.where) {
			this.append(" ");
			this.visitNode(node.where);
		}
		if (node.groupBy) {
			this.append(" ");
			this.visitNode(node.groupBy);
		}
		if (node.having) {
			this.append(" ");
			this.visitNode(node.having);
		}
		if (node.setOperations) {
			this.append(" ");
			this.compileList(node.setOperations, " ");
		}
		if (node.orderBy) {
			this.append(" ");
			this.visitNode(node.orderBy);
		}
		if (node.limit) {
			this.append(" ");
			this.visitNode(node.limit);
		}
		if (node.offset) {
			this.append(" ");
			this.visitNode(node.offset);
		}
		if (node.fetch) {
			this.append(" ");
			this.visitNode(node.fetch);
		}
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(this.sortSelectModifiers([...node.endModifiers]), " ");
		}
		if (wrapInParens) this.append(")");
	}
	visitFrom(node) {
		this.append("from ");
		this.compileList(node.froms);
	}
	visitSelection(node) {
		this.visitNode(node.selection);
	}
	visitColumn(node) {
		this.visitNode(node.column);
	}
	compileDistinctOn(expressions) {
		this.append("distinct on (");
		this.compileList(expressions);
		this.append(")");
	}
	compileList(nodes, separator = ", ") {
		const lastIndex = nodes.length - 1;
		for (let i = 0; i <= lastIndex; i++) {
			this.visitNode(nodes[i]);
			if (i < lastIndex) this.append(separator);
		}
	}
	visitWhere(node) {
		this.append("where ");
		this.visitNode(node.where);
	}
	visitHaving(node) {
		this.append("having ");
		this.visitNode(node.having);
	}
	visitInsertQuery(node) {
		const wrapInParens = this.parentNode !== void 0 && !ParensNode.is(this.parentNode) && !RawNode.is(this.parentNode) && !WhenNode.is(this.parentNode);
		if (this.parentNode === void 0 && node.explain) {
			this.visitNode(node.explain);
			this.append(" ");
		}
		if (wrapInParens) this.append("(");
		if (node.with) {
			this.visitNode(node.with);
			this.append(" ");
		}
		this.append(node.replace ? "replace" : "insert");
		if (node.ignore) {
			logOnce("`InsertQueryNode.ignore` is deprecated. Use `InsertQueryNode.orAction` instead.");
			this.append(" ignore");
		}
		if (node.orAction) {
			this.append(" ");
			this.visitNode(node.orAction);
		}
		if (node.top) {
			this.append(" ");
			this.visitNode(node.top);
		}
		if (node.into) {
			this.append(" into ");
			this.visitNode(node.into);
		}
		if (node.columns) {
			this.append(" (");
			this.compileList(node.columns);
			this.append(")");
		}
		if (node.output) {
			this.append(" ");
			this.visitNode(node.output);
		}
		if (node.values) {
			this.append(" ");
			this.visitNode(node.values);
		}
		if (node.defaultValues) {
			this.append(" ");
			this.append("default values");
		}
		if (node.onConflict) {
			this.append(" ");
			this.visitNode(node.onConflict);
		}
		if (node.onDuplicateKey) {
			this.append(" ");
			this.visitNode(node.onDuplicateKey);
		}
		if (node.returning) {
			this.append(" ");
			this.visitNode(node.returning);
		}
		if (wrapInParens) this.append(")");
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
	}
	visitValues(node) {
		this.append("values ");
		this.compileList(node.values);
	}
	visitDeleteQuery(node) {
		const wrapInParens = this.parentNode !== void 0 && !ParensNode.is(this.parentNode) && !RawNode.is(this.parentNode);
		if (this.parentNode === void 0 && node.explain) {
			this.visitNode(node.explain);
			this.append(" ");
		}
		if (wrapInParens) this.append("(");
		if (node.with) {
			this.visitNode(node.with);
			this.append(" ");
		}
		this.append("delete ");
		if (node.top) {
			this.visitNode(node.top);
			this.append(" ");
		}
		this.visitNode(node.from);
		if (node.output) {
			this.append(" ");
			this.visitNode(node.output);
		}
		if (node.using) {
			this.append(" ");
			this.visitNode(node.using);
		}
		if (node.joins) {
			this.append(" ");
			this.compileList(node.joins, " ");
		}
		if (node.where) {
			this.append(" ");
			this.visitNode(node.where);
		}
		if (node.orderBy) {
			this.append(" ");
			this.visitNode(node.orderBy);
		}
		if (node.limit) {
			this.append(" ");
			this.visitNode(node.limit);
		}
		if (node.returning) {
			this.append(" ");
			this.visitNode(node.returning);
		}
		if (wrapInParens) this.append(")");
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
	}
	visitReturning(node) {
		this.append("returning ");
		this.compileList(node.selections);
	}
	visitAlias(node) {
		this.visitNode(node.node);
		this.append(" as ");
		this.visitNode(node.alias);
	}
	visitReference(node) {
		if (node.table) {
			this.visitNode(node.table);
			this.append(".");
		}
		this.visitNode(node.column);
	}
	visitSelectAll(_) {
		this.append("*");
	}
	visitIdentifier(node) {
		this.append(this.getLeftIdentifierWrapper());
		this.compileUnwrappedIdentifier(node);
		this.append(this.getRightIdentifierWrapper());
	}
	compileUnwrappedIdentifier(node) {
		if (!isString(node.name)) throw new Error("a non-string identifier was passed to compileUnwrappedIdentifier.");
		this.append(this.sanitizeIdentifier(node.name));
	}
	visitAnd(node) {
		this.visitNode(node.left);
		this.append(" and ");
		this.visitNode(node.right);
	}
	visitOr(node) {
		this.visitNode(node.left);
		this.append(" or ");
		this.visitNode(node.right);
	}
	visitValue(node) {
		if (node.immediate) this.appendImmediateValue(node.value);
		else this.appendValue(node.value);
	}
	visitValueList(node) {
		this.append("(");
		this.compileList(node.values);
		this.append(")");
	}
	visitTuple(node) {
		this.append("(");
		this.compileList(node.values);
		this.append(")");
	}
	visitPrimitiveValueList(node) {
		this.append("(");
		const { values } = node;
		for (let i = 0; i < values.length; ++i) {
			this.appendValue(values[i]);
			if (i !== values.length - 1) this.append(", ");
		}
		this.append(")");
	}
	visitParens(node) {
		this.append("(");
		this.visitNode(node.node);
		this.append(")");
	}
	visitJoin(node) {
		this.append(JOIN_TYPE_SQL[node.joinType]);
		this.append(" ");
		this.visitNode(node.table);
		if (node.on) {
			this.append(" ");
			this.visitNode(node.on);
		}
	}
	visitOn(node) {
		this.append("on ");
		this.visitNode(node.on);
	}
	visitRaw(node) {
		const { sqlFragments, parameters: params } = node;
		for (let i = 0; i < sqlFragments.length; ++i) {
			this.append(sqlFragments[i]);
			if (params.length > i) this.visitNode(params[i]);
		}
	}
	visitOperator(node) {
		this.append(node.operator);
	}
	visitTable(node) {
		this.visitNode(node.table);
	}
	visitSchemableIdentifier(node) {
		if (node.schema) {
			this.visitNode(node.schema);
			this.append(".");
		}
		this.visitNode(node.identifier);
	}
	visitCreateTable(node) {
		this.append("create ");
		if (node.frontModifiers?.length) {
			this.compileList(node.frontModifiers, " ");
			this.append(" ");
		}
		if (node.temporary) this.append("temporary ");
		this.append("table ");
		if (node.ifNotExists) this.append("if not exists ");
		this.visitNode(node.table);
		if (!node.selectQuery) {
			this.append(" (");
			this.compileList([...node.columns, ...node.constraints ?? []]);
			this.append(")");
		}
		if (node.onCommit) {
			this.append(" on commit ");
			this.append(node.onCommit);
		}
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
		if (node.selectQuery) {
			this.append(" as ");
			this.visitNode(node.selectQuery);
		}
	}
	visitColumnDefinition(node) {
		if (node.ifNotExists) this.append("if not exists ");
		this.visitNode(node.column);
		this.append(" ");
		this.visitNode(node.dataType);
		if (node.unsigned) this.append(" unsigned");
		if (node.frontModifiers && node.frontModifiers.length > 0) {
			this.append(" ");
			this.compileList(node.frontModifiers, " ");
		}
		if (node.generated) {
			this.append(" ");
			this.visitNode(node.generated);
		}
		if (node.identity) this.append(" identity");
		if (node.defaultTo) {
			this.append(" ");
			this.visitNode(node.defaultTo);
		}
		if (node.notNull) this.append(" not null");
		if (node.unique) this.append(" unique");
		if (node.nullsNotDistinct) this.append(" nulls not distinct");
		if (node.primaryKey) this.append(" primary key");
		if (node.autoIncrement) {
			this.append(" ");
			this.append(this.getAutoIncrement());
		}
		if (node.references) {
			this.append(" ");
			this.visitNode(node.references);
		}
		if (node.check) {
			this.append(" ");
			this.visitNode(node.check);
		}
		if (node.endModifiers && node.endModifiers.length > 0) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
	}
	getAutoIncrement() {
		return "auto_increment";
	}
	visitReferences(node) {
		this.append("references ");
		this.visitNode(node.table);
		this.append(" (");
		this.compileList(node.columns);
		this.append(")");
		if (node.onDelete) {
			this.append(" on delete ");
			this.append(node.onDelete);
		}
		if (node.onUpdate) {
			this.append(" on update ");
			this.append(node.onUpdate);
		}
	}
	visitDropTable(node) {
		this.append("drop table ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.table);
		if (node.cascade) this.append(" cascade");
	}
	visitDataType(node) {
		this.append(node.dataType);
	}
	visitOrderBy(node) {
		this.append("order by ");
		this.compileList(node.items);
	}
	visitOrderByItem(node) {
		this.visitNode(node.orderBy);
		if (node.collation) {
			this.append(" ");
			this.visitNode(node.collation);
		}
		if (node.direction) {
			this.append(" ");
			this.visitNode(node.direction);
		}
		if (node.nulls) {
			this.append(" nulls ");
			this.append(node.nulls);
		}
	}
	visitGroupBy(node) {
		this.append("group by ");
		this.compileList(node.items);
	}
	visitGroupByItem(node) {
		this.visitNode(node.groupBy);
	}
	visitUpdateQuery(node) {
		const wrapInParens = this.parentNode !== void 0 && !ParensNode.is(this.parentNode) && !RawNode.is(this.parentNode) && !WhenNode.is(this.parentNode);
		if (this.parentNode === void 0 && node.explain) {
			this.visitNode(node.explain);
			this.append(" ");
		}
		if (wrapInParens) this.append("(");
		if (node.with) {
			this.visitNode(node.with);
			this.append(" ");
		}
		this.append("update ");
		if (node.top) {
			this.visitNode(node.top);
			this.append(" ");
		}
		if (node.table) {
			this.visitNode(node.table);
			this.append(" ");
		}
		this.append("set ");
		if (node.updates) this.compileList(node.updates);
		if (node.output) {
			this.append(" ");
			this.visitNode(node.output);
		}
		if (node.from) {
			this.append(" ");
			this.visitNode(node.from);
		}
		if (node.joins) {
			if (!node.from) throw new Error("Joins in an update query are only supported as a part of a PostgreSQL 'update set from join' query. If you want to create a MySQL 'update join set' query, see https://kysely.dev/docs/examples/update/my-sql-joins");
			this.append(" ");
			this.compileList(node.joins, " ");
		}
		if (node.where) {
			this.append(" ");
			this.visitNode(node.where);
		}
		if (node.returning) {
			this.append(" ");
			this.visitNode(node.returning);
		}
		if (node.orderBy) {
			this.append(" ");
			this.visitNode(node.orderBy);
		}
		if (node.limit) {
			this.append(" ");
			this.visitNode(node.limit);
		}
		if (wrapInParens) this.append(")");
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
	}
	visitColumnUpdate(node) {
		this.visitNode(node.column);
		this.append(" = ");
		this.visitNode(node.value);
	}
	visitLimit(node) {
		this.append("limit ");
		this.visitNode(node.limit);
	}
	visitOffset(node) {
		this.append("offset ");
		this.visitNode(node.offset);
	}
	visitOnConflict(node) {
		this.append("on conflict");
		if (node.columns) {
			this.append(" (");
			this.compileList(node.columns);
			this.append(")");
		} else if (node.constraint) {
			this.append(" on constraint ");
			this.visitNode(node.constraint);
		} else if (node.indexExpression) {
			this.append(" (");
			this.visitNode(node.indexExpression);
			this.append(")");
		}
		if (node.indexWhere) {
			this.append(" ");
			this.visitNode(node.indexWhere);
		}
		if (node.doNothing === true) this.append(" do nothing");
		else if (node.updates) {
			this.append(" do update set ");
			this.compileList(node.updates);
			if (node.updateWhere) {
				this.append(" ");
				this.visitNode(node.updateWhere);
			}
		}
	}
	visitOnDuplicateKey(node) {
		this.append("on duplicate key update ");
		this.compileList(node.updates);
	}
	visitCreateIndex(node) {
		this.append("create ");
		if (node.unique) this.append("unique ");
		this.append("index ");
		if (node.ifNotExists) this.append("if not exists ");
		this.visitNode(node.name);
		if (node.table) {
			this.append(" on ");
			this.visitNode(node.table);
		}
		if (node.using) {
			this.append(" using ");
			this.visitNode(node.using);
		}
		if (node.columns) {
			this.append(" (");
			this.compileList(node.columns);
			this.append(")");
		}
		if (node.nullsNotDistinct) this.append(" nulls not distinct");
		if (node.where) {
			this.append(" ");
			this.visitNode(node.where);
		}
	}
	visitDropIndex(node) {
		this.append("drop index ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.name);
		if (node.table) {
			this.append(" on ");
			this.visitNode(node.table);
		}
		if (node.cascade) this.append(" cascade");
	}
	visitCreateSchema(node) {
		this.append("create schema ");
		if (node.ifNotExists) this.append("if not exists ");
		this.visitNode(node.schema);
	}
	visitDropSchema(node) {
		this.append("drop schema ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.schema);
		if (node.cascade) this.append(" cascade");
	}
	visitPrimaryKeyConstraint(node) {
		if (node.name) {
			this.append("constraint ");
			this.visitNode(node.name);
			this.append(" ");
		}
		this.append("primary key (");
		this.compileList(node.columns);
		this.append(")");
		this.buildDeferrable(node);
	}
	buildDeferrable(node) {
		if (node.deferrable !== void 0) if (node.deferrable) this.append(" deferrable");
		else this.append(" not deferrable");
		if (node.initiallyDeferred !== void 0) if (node.initiallyDeferred) this.append(" initially deferred");
		else this.append(" initially immediate");
	}
	visitUniqueConstraint(node) {
		if (node.name) {
			this.append("constraint ");
			this.visitNode(node.name);
			this.append(" ");
		}
		this.append("unique");
		if (node.nullsNotDistinct) this.append(" nulls not distinct");
		this.append(" (");
		this.compileList(node.columns);
		this.append(")");
		this.buildDeferrable(node);
	}
	visitCheckConstraint(node) {
		if (node.name) {
			this.append("constraint ");
			this.visitNode(node.name);
			this.append(" ");
		}
		this.append("check (");
		this.visitNode(node.expression);
		this.append(")");
	}
	visitForeignKeyConstraint(node) {
		if (node.name) {
			this.append("constraint ");
			this.visitNode(node.name);
			this.append(" ");
		}
		this.append("foreign key (");
		this.compileList(node.columns);
		this.append(") ");
		this.visitNode(node.references);
		if (node.onDelete) {
			this.append(" on delete ");
			this.append(node.onDelete);
		}
		if (node.onUpdate) {
			this.append(" on update ");
			this.append(node.onUpdate);
		}
		this.buildDeferrable(node);
	}
	visitList(node) {
		this.compileList(node.items);
	}
	visitWith(node) {
		this.append("with ");
		if (node.recursive) this.append("recursive ");
		this.compileList(node.expressions);
	}
	visitCommonTableExpression(node) {
		this.visitNode(node.name);
		this.append(" as ");
		if (isBoolean(node.materialized)) {
			if (!node.materialized) this.append("not ");
			this.append("materialized ");
		}
		this.visitNode(node.expression);
	}
	visitCommonTableExpressionName(node) {
		this.visitNode(node.table);
		if (node.columns) {
			this.append("(");
			this.compileList(node.columns);
			this.append(")");
		}
	}
	visitAlterTable(node) {
		this.append("alter table ");
		this.visitNode(node.table);
		this.append(" ");
		if (node.renameTo) {
			this.append("rename to ");
			this.visitNode(node.renameTo);
		}
		if (node.setSchema) {
			this.append("set schema ");
			this.visitNode(node.setSchema);
		}
		if (node.addConstraint) this.visitNode(node.addConstraint);
		if (node.dropConstraint) this.visitNode(node.dropConstraint);
		if (node.renameConstraint) this.visitNode(node.renameConstraint);
		if (node.columnAlterations) this.compileColumnAlterations(node.columnAlterations);
		if (node.addIndex) this.visitNode(node.addIndex);
		if (node.dropIndex) this.visitNode(node.dropIndex);
	}
	visitAddColumn(node) {
		this.append("add column ");
		this.visitNode(node.column);
	}
	visitRenameColumn(node) {
		this.append("rename column ");
		this.visitNode(node.column);
		this.append(" to ");
		this.visitNode(node.renameTo);
	}
	visitDropColumn(node) {
		this.append("drop column ");
		this.visitNode(node.column);
	}
	visitAlterColumn(node) {
		this.append("alter column ");
		this.visitNode(node.column);
		this.append(" ");
		if (node.dataType) {
			if (this.announcesNewColumnDataType()) this.append("type ");
			this.visitNode(node.dataType);
			if (node.dataTypeExpression) {
				this.append("using ");
				this.visitNode(node.dataTypeExpression);
			}
		}
		if (node.setDefault) {
			this.append("set default ");
			this.visitNode(node.setDefault);
		}
		if (node.dropDefault) this.append("drop default");
		if (node.setNotNull) this.append("set not null");
		if (node.dropNotNull) this.append("drop not null");
	}
	visitModifyColumn(node) {
		this.append("modify column ");
		this.visitNode(node.column);
	}
	visitAddConstraint(node) {
		this.append("add ");
		this.visitNode(node.constraint);
	}
	visitDropConstraint(node) {
		this.append("drop constraint ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.constraintName);
		if (node.modifier === "cascade") this.append(" cascade");
		else if (node.modifier === "restrict") this.append(" restrict");
	}
	visitRenameConstraint(node) {
		this.append("rename constraint ");
		this.visitNode(node.oldName);
		this.append(" to ");
		this.visitNode(node.newName);
	}
	visitSetOperation(node) {
		this.append(node.operator);
		this.append(" ");
		if (node.all) this.append("all ");
		this.visitNode(node.expression);
	}
	visitCreateView(node) {
		this.append("create ");
		if (node.orReplace) this.append("or replace ");
		if (node.materialized) this.append("materialized ");
		if (node.temporary) this.append("temporary ");
		this.append("view ");
		if (node.ifNotExists) this.append("if not exists ");
		this.visitNode(node.name);
		this.append(" ");
		if (node.columns) {
			this.append("(");
			this.compileList(node.columns);
			this.append(") ");
		}
		if (node.as) {
			this.append("as ");
			this.visitNode(node.as);
		}
	}
	visitRefreshMaterializedView(node) {
		this.append("refresh materialized view ");
		if (node.concurrently) this.append("concurrently ");
		this.visitNode(node.name);
		if (node.withNoData) this.append(" with no data");
		else this.append(" with data");
	}
	visitDropView(node) {
		this.append("drop ");
		if (node.materialized) this.append("materialized ");
		this.append("view ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.name);
		if (node.cascade) this.append(" cascade");
	}
	visitGenerated(node) {
		this.append("generated ");
		if (node.always) this.append("always ");
		if (node.byDefault) this.append("by default ");
		this.append("as ");
		if (node.identity) this.append("identity");
		if (node.expression) {
			this.append("(");
			this.visitNode(node.expression);
			this.append(")");
		}
		if (node.stored) this.append(" stored");
	}
	visitDefaultValue(node) {
		this.append("default ");
		this.visitNode(node.defaultValue);
	}
	visitSelectModifier(node) {
		if (node.rawModifier) this.visitNode(node.rawModifier);
		else this.append(SELECT_MODIFIER_SQL[node.modifier]);
		if (node.of) {
			this.append(" of ");
			this.compileList(node.of, ", ");
		}
	}
	visitCreateType(node) {
		this.append("create type ");
		this.visitNode(node.name);
		if (node.enum) {
			this.append(" as enum ");
			this.visitNode(node.enum);
		}
	}
	visitDropType(node) {
		this.append("drop type ");
		if (node.ifExists) this.append("if exists ");
		this.visitNode(node.name);
	}
	visitExplain(node) {
		this.append("explain");
		if (node.options || node.format) {
			this.append(" ");
			this.append(this.getLeftExplainOptionsWrapper());
			if (node.options) {
				this.visitNode(node.options);
				if (node.format) this.append(this.getExplainOptionsDelimiter());
			}
			if (node.format) {
				this.append("format");
				this.append(this.getExplainOptionAssignment());
				this.append(node.format);
			}
			this.append(this.getRightExplainOptionsWrapper());
		}
	}
	visitDefaultInsertValue(_) {
		this.append("default");
	}
	visitAggregateFunction(node) {
		this.append(node.func);
		this.append("(");
		if (node.distinct) this.append("distinct ");
		this.compileList(node.aggregated);
		if (node.orderBy) {
			this.append(" ");
			this.visitNode(node.orderBy);
		}
		this.append(")");
		if (node.withinGroup) {
			this.append(" within group (");
			this.visitNode(node.withinGroup);
			this.append(")");
		}
		if (node.filter) {
			this.append(" filter(");
			this.visitNode(node.filter);
			this.append(")");
		}
		if (node.over) {
			this.append(" ");
			this.visitNode(node.over);
		}
	}
	visitOver(node) {
		this.append("over(");
		if (node.partitionBy) {
			this.visitNode(node.partitionBy);
			if (node.orderBy) this.append(" ");
		}
		if (node.orderBy) this.visitNode(node.orderBy);
		this.append(")");
	}
	visitPartitionBy(node) {
		this.append("partition by ");
		this.compileList(node.items);
	}
	visitPartitionByItem(node) {
		this.visitNode(node.partitionBy);
	}
	visitBinaryOperation(node) {
		this.visitNode(node.leftOperand);
		this.append(" ");
		this.visitNode(node.operator);
		this.append(" ");
		this.visitNode(node.rightOperand);
	}
	visitUnaryOperation(node) {
		this.visitNode(node.operator);
		if (!this.isMinusOperator(node.operator)) this.append(" ");
		this.visitNode(node.operand);
	}
	isMinusOperator(node) {
		return OperatorNode.is(node) && node.operator === "-";
	}
	visitUsing(node) {
		this.append("using ");
		this.compileList(node.tables);
	}
	visitFunction(node) {
		this.append(node.func);
		this.append("(");
		this.compileList(node.arguments);
		this.append(")");
	}
	visitCase(node) {
		this.append("case");
		if (node.value) {
			this.append(" ");
			this.visitNode(node.value);
		}
		if (node.when) {
			this.append(" ");
			this.compileList(node.when, " ");
		}
		if (node.else) {
			this.append(" else ");
			this.visitNode(node.else);
		}
		this.append(" end");
		if (node.isStatement) this.append(" case");
	}
	visitWhen(node) {
		this.append("when ");
		this.visitNode(node.condition);
		if (node.result) {
			this.append(" then ");
			this.visitNode(node.result);
		}
	}
	visitJSONReference(node) {
		this.visitNode(node.reference);
		this.visitNode(node.traversal);
	}
	visitJSONPath(node) {
		if (node.inOperator) this.visitNode(node.inOperator);
		this.append("'$");
		for (const pathLeg of node.pathLegs) this.visitNode(pathLeg);
		this.append("'");
	}
	visitJSONPathLeg(node) {
		const isArrayLocation = node.type === "ArrayLocation";
		this.append(isArrayLocation ? "[" : ".");
		this.append(typeof node.value === "string" ? this.sanitizeStringLiteral(node.value) : String(node.value));
		if (isArrayLocation) this.append("]");
	}
	visitJSONOperatorChain(node) {
		for (let i = 0, len = node.values.length; i < len; i++) {
			if (i === len - 1) this.visitNode(node.operator);
			else this.append("->");
			this.visitNode(node.values[i]);
		}
	}
	visitMergeQuery(node) {
		if (node.with) {
			this.visitNode(node.with);
			this.append(" ");
		}
		this.append("merge ");
		if (node.top) {
			this.visitNode(node.top);
			this.append(" ");
		}
		this.append("into ");
		this.visitNode(node.into);
		if (node.using) {
			this.append(" ");
			this.visitNode(node.using);
		}
		if (node.whens) {
			this.append(" ");
			this.compileList(node.whens, " ");
		}
		if (node.returning) {
			this.append(" ");
			this.visitNode(node.returning);
		}
		if (node.output) {
			this.append(" ");
			this.visitNode(node.output);
		}
		if (node.endModifiers?.length) {
			this.append(" ");
			this.compileList(node.endModifiers, " ");
		}
	}
	visitMatched(node) {
		if (node.not) this.append("not ");
		this.append("matched");
		if (node.bySource) this.append(" by source");
	}
	visitAddIndex(node) {
		this.append("add ");
		if (node.unique) this.append("unique ");
		this.append("index ");
		this.visitNode(node.name);
		if (node.columns) {
			this.append(" (");
			this.compileList(node.columns);
			this.append(")");
		}
		if (node.using) {
			this.append(" using ");
			this.visitNode(node.using);
		}
	}
	visitCast(node) {
		this.append("cast(");
		this.visitNode(node.expression);
		this.append(" as ");
		this.visitNode(node.dataType);
		this.append(")");
	}
	visitFetch(node) {
		this.append("fetch next ");
		this.visitNode(node.rowCount);
		this.append(` rows ${node.modifier}`);
	}
	visitOutput(node) {
		this.append("output ");
		this.compileList(node.selections);
	}
	visitTop(node) {
		this.append(`top(${node.expression})`);
		if (node.modifiers) this.append(` ${node.modifiers}`);
	}
	visitOrAction(node) {
		this.append(node.action);
	}
	visitCollate(node) {
		this.append("collate ");
		this.visitNode(node.collation);
	}
	append(str) {
		this.#sql += str;
	}
	appendValue(parameter) {
		this.addParameter(parameter);
		this.append(this.getCurrentParameterPlaceholder());
	}
	getLeftIdentifierWrapper() {
		return "\"";
	}
	getRightIdentifierWrapper() {
		return "\"";
	}
	getCurrentParameterPlaceholder() {
		return "$" + this.numParameters;
	}
	getLeftExplainOptionsWrapper() {
		return "(";
	}
	getExplainOptionAssignment() {
		return " ";
	}
	getExplainOptionsDelimiter() {
		return ", ";
	}
	getRightExplainOptionsWrapper() {
		return ")";
	}
	sanitizeIdentifier(identifier) {
		const leftWrap = this.getLeftIdentifierWrapper();
		const rightWrap = this.getRightIdentifierWrapper();
		let sanitized = "";
		for (const c of identifier) {
			sanitized += c;
			if (c === leftWrap) sanitized += leftWrap;
			else if (c === rightWrap) sanitized += rightWrap;
		}
		return sanitized;
	}
	sanitizeStringLiteral(value) {
		return value.replace(LIT_WRAP_REGEX, "''");
	}
	addParameter(parameter) {
		this.#parameters.push(parameter);
	}
	appendImmediateValue(value) {
		if (isString(value)) this.appendStringLiteral(value);
		else if (isNumber(value) || isBoolean(value) || isBigInt(value)) this.append(value.toString());
		else if (isNull(value)) this.append("null");
		else if (isDate(value)) this.appendImmediateValue(value.toISOString());
		else throw new Error(`invalid immediate value ${value}`);
	}
	appendStringLiteral(value) {
		this.append("'");
		this.append(this.sanitizeStringLiteral(value));
		this.append("'");
	}
	sortSelectModifiers(arr) {
		arr.sort((left, right) => left.modifier && right.modifier ? SELECT_MODIFIER_PRIORITY[left.modifier] - SELECT_MODIFIER_PRIORITY[right.modifier] : 1);
		return freeze(arr);
	}
	compileColumnAlterations(columnAlterations) {
		this.compileList(columnAlterations);
	}
	/**
	* controls whether the dialect adds a "type" keyword before a column's new data
	* type in an ALTER TABLE statement.
	*/
	announcesNewColumnDataType() {
		return true;
	}
};
const SELECT_MODIFIER_SQL = freeze({
	ForKeyShare: "for key share",
	ForNoKeyUpdate: "for no key update",
	ForUpdate: "for update",
	ForShare: "for share",
	NoWait: "nowait",
	SkipLocked: "skip locked",
	Distinct: "distinct"
});
const SELECT_MODIFIER_PRIORITY = freeze({
	ForKeyShare: 1,
	ForNoKeyUpdate: 1,
	ForUpdate: 1,
	ForShare: 1,
	NoWait: 2,
	SkipLocked: 2,
	Distinct: 0
});
const JOIN_TYPE_SQL = freeze({
	InnerJoin: "inner join",
	LeftJoin: "left join",
	RightJoin: "right join",
	FullJoin: "full join",
	CrossJoin: "cross join",
	LateralInnerJoin: "inner join lateral",
	LateralLeftJoin: "left join lateral",
	LateralCrossJoin: "cross join lateral",
	OuterApply: "outer apply",
	CrossApply: "cross apply",
	Using: "using"
});
//#endregion
//#region ../../node_modules/kysely/dist/esm/migration/migrator.js
const DEFAULT_MIGRATION_TABLE = "kysely_migration";
const DEFAULT_MIGRATION_LOCK_TABLE = "kysely_migration_lock";
freeze({ __noMigrations__: true });
//#endregion
export { isBoolean as A, noop as B, SchemableIdentifierNode as C, asArray as D, IdentifierNode as E, isNumber as F, isObject as I, isReadonlyArray as L, isDate as M, isFunction as N, freeze as O, isNull as P, isString as R, AliasNode as S, ON_COMMIT_ACTIONS as T, isJSONOperator as _, SetOperationNode as a, AndNode as b, WhenNode as c, InsertQueryNode as d, ParensNode as f, OperatorNode as g, OPERATORS as h, CreateViewNode as i, isBuffer as j, isBigInt as k, UsingNode as l, RawNode as m, DEFAULT_MIGRATION_TABLE as n, WithSchemaPlugin as o, logOnce as p, DefaultQueryCompiler as r, OperationNodeTransformer as s, DEFAULT_MIGRATION_LOCK_TABLE as t, ListNode as u, JoinNode as v, CreateTableNode as w, TableNode as x, OrNode as y, isUndefined as z };

//# sourceMappingURL=migrator-CVfj9o-J.mjs.map