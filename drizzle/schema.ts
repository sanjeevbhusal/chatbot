import {
	sqliteTable,
	integer,
	text,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const userDocumentsTable = sqliteTable("user_documents", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: text().references(() => usersTable.id),
	name: text(),
	url: text(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
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

export const documentsChunkTable = sqliteTable("documents_chunk", {
	id: integer().primaryKey({ autoIncrement: true }),
	userDocumentId: integer().references(() => userDocumentsTable.id, {
		onDelete: "cascade",
	}),
	metadata: text(),
	content: text(),
	vector: float32Array("vector", { dimensions: 1536 }),
	// Note: vector column has an index defined. This is a special vector index. Drizzle doesnot support representing the index correctly in the schema. Hence, new users will need to create the index manually by writing sql themselves.
	// INDEX: CREATE INDEX IF NOT EXISTS vector_index ON documents_chunk(libsql_vector_idx(vector));
});

export const usersMessagesTable = sqliteTable("users_messages", {
	id: integer().primaryKey({ autoIncrement: true }),
	userId: text()
		.references(() => usersTable.id)
		.notNull(),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: text().notNull(),
	threadId: integer()
		.references(() => messageThreadTable.id, {
			onDelete: "cascade",
		})
		.notNull(),
});

export const messageThreadTable = sqliteTable("message_thread", {
	id: integer().primaryKey({ autoIncrement: true }),
	name: text(),
	userId: text()
		.references(() => usersTable.id, {
			onDelete: "cascade",
		})
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => /* @__PURE__ */ new Date()),
});

export const messageSourcesTable = sqliteTable(
	"message_sources",
	{
		messageId: integer()
			.notNull()
			.references(() => usersMessagesTable.id, {
				onDelete: "cascade",
			}),
		documentChunkId: integer()
			.notNull()
			.references(() => documentsChunkTable.id, {
				onDelete: "cascade",
			}),
	},
	(t) => [primaryKey({ columns: [t.messageId, t.documentChunkId] })],
);

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});
