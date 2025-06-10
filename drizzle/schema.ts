import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/sqlite-core";

export const userDocuments = sqliteTable("user_documents", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer().references(() => users.id),
	name: text(),
	url: text(),
});

export const users = sqliteTable("users", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text(),
	email: text(),
	password: text(),
});

const float32Array = customType<{
	data: number[];
	config: { dimensions: number };
	configRequired: true;
	driverData: Buffer;
}>({
	dataType(config) {
		return `F32_BLOB(${config.dimensions})`;
	},
	fromDriver(value: Buffer) {
		return Array.from(new Float32Array(value.buffer));
	},
	toDriver(value: number[]) {
		return sql`vector32(${JSON.stringify(value)})`;
	},
});

export const documentsChunk = sqliteTable("documents_chunk", {
	id: integer().primaryKey({ autoIncrement: true }),
	userDocumentId: integer().references(() => userDocuments.id),
	metadata: text(),
	vector: float32Array("vector", { dimensions: 1536 }),
	// Note: vector column has an index defined. This is a special vector index. Drizzle doesnot support representing the index correctly in the schema. Hence, new users will need to create the index manually by writing sql themselves.
	// INDEX: CREATE INDEX IF NOT EXISTS vector_index ON documents_chunk(libsql_vector_idx(vector));
});
