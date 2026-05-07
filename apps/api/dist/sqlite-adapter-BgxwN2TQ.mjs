import { r as DefaultQueryCompiler } from "./migrator-CVfj9o-J.mjs";
//#region ../../node_modules/kysely/dist/esm/dialect/dialect-adapter-base.js
/**
* A basic implementation of `DialectAdapter` with sensible default values.
* Third-party dialects can extend this instead of implementing the `DialectAdapter`
* interface from scratch. That way all new settings will get default values when
* they are added and there will be less breaking changes.
*/
var DialectAdapterBase = class {
	get supportsCreateIfNotExists() {
		return true;
	}
	get supportsTransactionalDdl() {
		return false;
	}
	get supportsReturning() {
		return false;
	}
	get supportsOutput() {
		return false;
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/dialect/sqlite/sqlite-query-compiler.js
const ID_WRAP_REGEX = /"/g;
var SqliteQueryCompiler = class extends DefaultQueryCompiler {
	visitOrAction(node) {
		this.append("or ");
		this.append(node.action);
	}
	getCurrentParameterPlaceholder() {
		return "?";
	}
	getLeftExplainOptionsWrapper() {
		return "";
	}
	getRightExplainOptionsWrapper() {
		return "";
	}
	getLeftIdentifierWrapper() {
		return "\"";
	}
	getRightIdentifierWrapper() {
		return "\"";
	}
	getAutoIncrement() {
		return "autoincrement";
	}
	sanitizeIdentifier(identifier) {
		return identifier.replace(ID_WRAP_REGEX, "\"\"");
	}
	visitDefaultInsertValue(_) {
		this.append("null");
	}
};
//#endregion
//#region ../../node_modules/kysely/dist/esm/dialect/sqlite/sqlite-adapter.js
var SqliteAdapter = class extends DialectAdapterBase {
	get supportsTransactionalDdl() {
		return false;
	}
	get supportsReturning() {
		return true;
	}
	async acquireMigrationLock(_db, _opt) {}
	async releaseMigrationLock(_db, _opt) {}
};
//#endregion
export { SqliteQueryCompiler as n, DialectAdapterBase as r, SqliteAdapter as t };

//# sourceMappingURL=sqlite-adapter-BgxwN2TQ.mjs.map