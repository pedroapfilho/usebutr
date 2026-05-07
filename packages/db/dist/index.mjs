import { t as __exportAll } from "./chunk-CfYAbeIz.mjs";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as runtime from "@prisma/client/runtime/client";
//#region src/generated/prisma/internal/class.ts
const config = {
	"previewFeatures": [],
	"clientVersion": "7.8.0",
	"engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
	"activeProvider": "postgresql",
	"inlineSchema": "datasource db {\n  provider = \"postgresql\"\n}\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated/prisma\"\n}\n\nmodel User {\n  id            String   @id @default(cuid())\n  email         String   @unique\n  emailVerified Boolean  @default(false)\n  name          String?\n  image         String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  // Custom fields\n  username        String? @unique\n  displayUsername String? @unique\n  displayName     String?\n\n  accounts Account[]\n  sessions Session[]\n\n  @@index([email])\n}\n\nmodel Session {\n  id        String   @id @default(cuid())\n  expiresAt DateTime\n  token     String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  ipAddress String?\n  userAgent String?\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([token])\n}\n\nmodel Account {\n  id         String @id @default(cuid())\n  accountId  String\n  providerId String\n  userId     String\n  user       User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  accessToken  String? @db.Text\n  refreshToken String? @db.Text\n  idToken      String? @db.Text\n\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n\n  scope     String?\n  password  String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([providerId, accountId])\n}\n\nmodel Verification {\n  id         String   @id @default(cuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@unique([identifier, value])\n  @@index([identifier])\n}\n\n// Better Auth database-backed rate limiting — required when auth config has\n// `rateLimit.storage: \"database\"`. Rows are written on first limited request.\nmodel RateLimit {\n  id          String @id @default(cuid())\n  key         String @unique\n  count       Int\n  lastRequest BigInt\n}\n",
	"runtimeDataModel": {
		"models": {},
		"enums": {},
		"types": {}
	},
	"parameterizationSchema": {
		"strings": [],
		"graph": ""
	}
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"username\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"displayUsername\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"displayName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToUser\"}],\"dbName\":null},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SessionToUser\"}],\"dbName\":null},\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"},{\"name\":\"accessToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"idToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accessTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"refreshTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Verification\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"identifier\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"RateLimit\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"count\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastRequest\",\"kind\":\"scalar\",\"type\":\"BigInt\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
	strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"user\",\"accounts\",\"sessions\",\"_count\",\"User.findUnique\",\"User.findUniqueOrThrow\",\"User.findFirst\",\"User.findFirstOrThrow\",\"User.findMany\",\"data\",\"User.createOne\",\"User.createMany\",\"User.createManyAndReturn\",\"User.updateOne\",\"User.updateMany\",\"User.updateManyAndReturn\",\"create\",\"update\",\"User.upsertOne\",\"User.deleteOne\",\"User.deleteMany\",\"having\",\"_min\",\"_max\",\"User.groupBy\",\"User.aggregate\",\"Session.findUnique\",\"Session.findUniqueOrThrow\",\"Session.findFirst\",\"Session.findFirstOrThrow\",\"Session.findMany\",\"Session.createOne\",\"Session.createMany\",\"Session.createManyAndReturn\",\"Session.updateOne\",\"Session.updateMany\",\"Session.updateManyAndReturn\",\"Session.upsertOne\",\"Session.deleteOne\",\"Session.deleteMany\",\"Session.groupBy\",\"Session.aggregate\",\"Account.findUnique\",\"Account.findUniqueOrThrow\",\"Account.findFirst\",\"Account.findFirstOrThrow\",\"Account.findMany\",\"Account.createOne\",\"Account.createMany\",\"Account.createManyAndReturn\",\"Account.updateOne\",\"Account.updateMany\",\"Account.updateManyAndReturn\",\"Account.upsertOne\",\"Account.deleteOne\",\"Account.deleteMany\",\"Account.groupBy\",\"Account.aggregate\",\"Verification.findUnique\",\"Verification.findUniqueOrThrow\",\"Verification.findFirst\",\"Verification.findFirstOrThrow\",\"Verification.findMany\",\"Verification.createOne\",\"Verification.createMany\",\"Verification.createManyAndReturn\",\"Verification.updateOne\",\"Verification.updateMany\",\"Verification.updateManyAndReturn\",\"Verification.upsertOne\",\"Verification.deleteOne\",\"Verification.deleteMany\",\"Verification.groupBy\",\"Verification.aggregate\",\"RateLimit.findUnique\",\"RateLimit.findUniqueOrThrow\",\"RateLimit.findFirst\",\"RateLimit.findFirstOrThrow\",\"RateLimit.findMany\",\"RateLimit.createOne\",\"RateLimit.createMany\",\"RateLimit.createManyAndReturn\",\"RateLimit.updateOne\",\"RateLimit.updateMany\",\"RateLimit.updateManyAndReturn\",\"RateLimit.upsertOne\",\"RateLimit.deleteOne\",\"RateLimit.deleteMany\",\"_avg\",\"_sum\",\"RateLimit.groupBy\",\"RateLimit.aggregate\",\"AND\",\"OR\",\"NOT\",\"id\",\"key\",\"count\",\"lastRequest\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"identifier\",\"value\",\"expiresAt\",\"createdAt\",\"updatedAt\",\"identifier_value\",\"accountId\",\"providerId\",\"userId\",\"accessToken\",\"refreshToken\",\"idToken\",\"accessTokenExpiresAt\",\"refreshTokenExpiresAt\",\"scope\",\"password\",\"token\",\"ipAddress\",\"userAgent\",\"email\",\"emailVerified\",\"name\",\"image\",\"username\",\"displayUsername\",\"displayName\",\"every\",\"some\",\"none\",\"providerId_accountId\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
	graph: "9gEsUA8EAACoAQAgBQAAqQEAIF8AAKUBADBgAAAOABBhAAClAQAwYgEAAAABdEAAlgEAIXVAAJYBACGEAQEAAAABhQEgAKYBACGGAQEApwEAIYcBAQCnAQAhiAEBAAAAAYkBAQAAAAGKAQEApwEAIQEAAAABACARAwAAqwEAIF8AAK0BADBgAAADABBhAACtAQAwYgEAjgEAIXRAAJYBACF1QACWAQAhdwEAjgEAIXgBAI4BACF5AQCOAQAhegEApwEAIXsBAKcBACF8AQCnAQAhfUAArgEAIX5AAK4BACF_AQCnAQAhgAEBAKcBACEIAwAA6gEAIHoAALsBACB7AAC7AQAgfAAAuwEAIH0AALsBACB-AAC7AQAgfwAAuwEAIIABAAC7AQAgEgMAAKsBACBfAACtAQAwYAAAAwAQYQAArQEAMGIBAAAAAXRAAJYBACF1QACWAQAhdwEAjgEAIXgBAI4BACF5AQCOAQAhegEApwEAIXsBAKcBACF8AQCnAQAhfUAArgEAIX5AAK4BACF_AQCnAQAhgAEBAKcBACGOAQAArAEAIAMAAAADACABAAAEADACAAAFACAMAwAAqwEAIF8AAKoBADBgAAAHABBhAACqAQAwYgEAjgEAIXNAAJYBACF0QACWAQAhdUAAlgEAIXkBAI4BACGBAQEAjgEAIYIBAQCnAQAhgwEBAKcBACEDAwAA6gEAIIIBAAC7AQAggwEAALsBACAMAwAAqwEAIF8AAKoBADBgAAAHABBhAACqAQAwYgEAAAABc0AAlgEAIXRAAJYBACF1QACWAQAheQEAjgEAIYEBAQAAAAGCAQEApwEAIYMBAQCnAQAhAwAAAAcAIAEAAAgAMAIAAAkAIAEAAAADACABAAAABwAgAQAAAAEAIA8EAACoAQAgBQAAqQEAIF8AAKUBADBgAAAOABBhAAClAQAwYgEAjgEAIXRAAJYBACF1QACWAQAhhAEBAI4BACGFASAApgEAIYYBAQCnAQAhhwEBAKcBACGIAQEApwEAIYkBAQCnAQAhigEBAKcBACEHBAAA6AEAIAUAAOkBACCGAQAAuwEAIIcBAAC7AQAgiAEAALsBACCJAQAAuwEAIIoBAAC7AQAgAwAAAA4AIAEAAA8AMAIAAAEAIAMAAAAOACABAAAPADACAAABACADAAAADgAgAQAADwAwAgAAAQAgDAQAAOYBACAFAADnAQAgYgEAAAABdEAAAAABdUAAAAABhAEBAAAAAYUBIAAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQEAAAABigEBAAAAAQEMAAATACAKYgEAAAABdEAAAAABdUAAAAABhAEBAAAAAYUBIAAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQEAAAABigEBAAAAAQEMAAAVADABDAAAFQAwDAQAAMwBACAFAADNAQAgYgEAtAEAIXRAALoBACF1QAC6AQAhhAEBALQBACGFASAAywEAIYYBAQC_AQAhhwEBAL8BACGIAQEAvwEAIYkBAQC_AQAhigEBAL8BACECAAAAAQAgDAAAGAAgCmIBALQBACF0QAC6AQAhdUAAugEAIYQBAQC0AQAhhQEgAMsBACGGAQEAvwEAIYcBAQC_AQAhiAEBAL8BACGJAQEAvwEAIYoBAQC_AQAhAgAAAA4AIAwAABoAIAIAAAAOACAMAAAaACADAAAAAQAgEwAAEwAgFAAAGAAgAQAAAAEAIAEAAAAOACAIBgAAyAEAIBkAAMoBACAaAADJAQAghgEAALsBACCHAQAAuwEAIIgBAAC7AQAgiQEAALsBACCKAQAAuwEAIA1fAAChAQAwYAAAIQAQYQAAoQEAMGIBAIMBACF0QACSAQAhdUAAkgEAIYQBAQCDAQAhhQEgAKIBACGGAQEAmQEAIYcBAQCZAQAhiAEBAJkBACGJAQEAmQEAIYoBAQCZAQAhAwAAAA4AIAEAACAAMBgAACEAIAMAAAAOACABAAAPADACAAABACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAkDAADHAQAgYgEAAAABc0AAAAABdEAAAAABdUAAAAABeQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAAAABAQwAACkAIAhiAQAAAAFzQAAAAAF0QAAAAAF1QAAAAAF5AQAAAAGBAQEAAAABggEBAAAAAYMBAQAAAAEBDAAAKwAwAQwAACsAMAkDAADGAQAgYgEAtAEAIXNAALoBACF0QAC6AQAhdUAAugEAIXkBALQBACGBAQEAtAEAIYIBAQC_AQAhgwEBAL8BACECAAAACQAgDAAALgAgCGIBALQBACFzQAC6AQAhdEAAugEAIXVAALoBACF5AQC0AQAhgQEBALQBACGCAQEAvwEAIYMBAQC_AQAhAgAAAAcAIAwAADAAIAIAAAAHACAMAAAwACADAAAACQAgEwAAKQAgFAAALgAgAQAAAAkAIAEAAAAHACAFBgAAwwEAIBkAAMUBACAaAADEAQAgggEAALsBACCDAQAAuwEAIAtfAACgAQAwYAAANwAQYQAAoAEAMGIBAIMBACFzQACSAQAhdEAAkgEAIXVAAJIBACF5AQCDAQAhgQEBAIMBACGCAQEAmQEAIYMBAQCZAQAhAwAAAAcAIAEAADYAMBgAADcAIAMAAAAHACABAAAIADACAAAJACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIA4DAADCAQAgYgEAAAABdEAAAAABdUAAAAABdwEAAAABeAEAAAABeQEAAAABegEAAAABewEAAAABfAEAAAABfUAAAAABfkAAAAABfwEAAAABgAEBAAAAAQEMAAA_ACANYgEAAAABdEAAAAABdUAAAAABdwEAAAABeAEAAAABeQEAAAABegEAAAABewEAAAABfAEAAAABfUAAAAABfkAAAAABfwEAAAABgAEBAAAAAQEMAABBADABDAAAQQAwDgMAAMEBACBiAQC0AQAhdEAAugEAIXVAALoBACF3AQC0AQAheAEAtAEAIXkBALQBACF6AQC_AQAhewEAvwEAIXwBAL8BACF9QADAAQAhfkAAwAEAIX8BAL8BACGAAQEAvwEAIQIAAAAFACAMAABEACANYgEAtAEAIXRAALoBACF1QAC6AQAhdwEAtAEAIXgBALQBACF5AQC0AQAhegEAvwEAIXsBAL8BACF8AQC_AQAhfUAAwAEAIX5AAMABACF_AQC_AQAhgAEBAL8BACECAAAAAwAgDAAARgAgAgAAAAMAIAwAAEYAIAMAAAAFACATAAA_ACAUAABEACABAAAABQAgAQAAAAMAIAoGAAC8AQAgGQAAvgEAIBoAAL0BACB6AAC7AQAgewAAuwEAIHwAALsBACB9AAC7AQAgfgAAuwEAIH8AALsBACCAAQAAuwEAIBBfAACYAQAwYAAATQAQYQAAmAEAMGIBAIMBACF0QACSAQAhdUAAkgEAIXcBAIMBACF4AQCDAQAheQEAgwEAIXoBAJkBACF7AQCZAQAhfAEAmQEAIX1AAJoBACF-QACaAQAhfwEAmQEAIYABAQCZAQAhAwAAAAMAIAEAAEwAMBgAAE0AIAMAAAADACABAAAEADACAAAFACAKXwAAlQEAMGAAAFMAEGEAAJUBADBiAQAAAAFxAQCOAQAhcgEAjgEAIXNAAJYBACF0QACWAQAhdUAAlgEAIXYAAJcBACABAAAAUAAgAQAAAFAAIAlfAACVAQAwYAAAUwAQYQAAlQEAMGIBAI4BACFxAQCOAQAhcgEAjgEAIXNAAJYBACF0QACWAQAhdUAAlgEAIQADAAAAUwAgAQAAVAAwAgAAUAAgAwAAAFMAIAEAAFQAMAIAAFAAIAMAAABTACABAABUADACAABQACAGYgEAAAABcQEAAAABcgEAAAABc0AAAAABdEAAAAABdUAAAAABAQwAAFgAIAZiAQAAAAFxAQAAAAFyAQAAAAFzQAAAAAF0QAAAAAF1QAAAAAEBDAAAWgAwAQwAAFoAMAZiAQC0AQAhcQEAtAEAIXIBALQBACFzQAC6AQAhdEAAugEAIXVAALoBACECAAAAUAAgDAAAXQAgBmIBALQBACFxAQC0AQAhcgEAtAEAIXNAALoBACF0QAC6AQAhdUAAugEAIQIAAABTACAMAABfACACAAAAUwAgDAAAXwAgAwAAAFAAIBMAAFgAIBQAAF0AIAEAAABQACABAAAAUwAgAwYAALcBACAZAAC5AQAgGgAAuAEAIAlfAACRAQAwYAAAZgAQYQAAkQEAMGIBAIMBACFxAQCDAQAhcgEAgwEAIXNAAJIBACF0QACSAQAhdUAAkgEAIQMAAABTACABAABlADAYAABmACADAAAAUwAgAQAAVAAwAgAAUAAgB18AAI0BADBgAABsABBhAACNAQAwYgEAAAABYwEAAAABZAIAjwEAIWUEAJABACEBAAAAaQAgAQAAAGkAIAdfAACNAQAwYAAAbAAQYQAAjQEAMGIBAI4BACFjAQCOAQAhZAIAjwEAIWUEAJABACEAAwAAAGwAIAEAAG0AMAIAAGkAIAMAAABsACABAABtADACAABpACADAAAAbAAgAQAAbQAwAgAAaQAgBGIBAAAAAWMBAAAAAWQCAAAAAWUEAAAAAQEMAABxACAEYgEAAAABYwEAAAABZAIAAAABZQQAAAABAQwAAHMAMAEMAABzADAEYgEAtAEAIWMBALQBACFkAgC1AQAhZQQAtgEAIQIAAABpACAMAAB2ACAEYgEAtAEAIWMBALQBACFkAgC1AQAhZQQAtgEAIQIAAABsACAMAAB4ACACAAAAbAAgDAAAeAAgAwAAAGkAIBMAAHEAIBQAAHYAIAEAAABpACABAAAAbAAgBQYAAK8BACAZAACyAQAgGgAAsQEAIFsAALABACBcAACzAQAgB18AAIIBADBgAAB_ABBhAACCAQAwYgEAgwEAIWMBAIMBACFkAgCEAQAhZQQAhQEAIQMAAABsACABAAB-ADAYAAB_ACADAAAAbAAgAQAAbQAwAgAAaQAgB18AAIIBADBgAAB_ABBhAACCAQAwYgEAgwEAIWMBAIMBACFkAgCEAQAhZQQAhQEAIQ4GAACHAQAgGQAAjAEAIBoAAIwBACBmAQAAAAFnAQAAAARoAQAAAARpAQAAAAFqAQAAAAFrAQAAAAFsAQAAAAFtAQCLAQAhbgEAAAABbwEAAAABcAEAAAABDQYAAIcBACAZAACHAQAgGgAAhwEAIFsAAIgBACBcAACHAQAgZgIAAAABZwIAAAAEaAIAAAAEaQIAAAABagIAAAABawIAAAABbAIAAAABbQIAigEAIQ0GAACHAQAgGQAAiQEAIBoAAIkBACBbAACIAQAgXAAAiQEAIGYEAAAAAWcEAAAABGgEAAAABGkEAAAAAWoEAAAAAWsEAAAAAWwEAAAAAW0EAIYBACENBgAAhwEAIBkAAIkBACAaAACJAQAgWwAAiAEAIFwAAIkBACBmBAAAAAFnBAAAAARoBAAAAARpBAAAAAFqBAAAAAFrBAAAAAFsBAAAAAFtBACGAQAhCGYCAAAAAWcCAAAABGgCAAAABGkCAAAAAWoCAAAAAWsCAAAAAWwCAAAAAW0CAIcBACEIZggAAAABZwgAAAAEaAgAAAAEaQgAAAABaggAAAABawgAAAABbAgAAAABbQgAiAEAIQhmBAAAAAFnBAAAAARoBAAAAARpBAAAAAFqBAAAAAFrBAAAAAFsBAAAAAFtBACJAQAhDQYAAIcBACAZAACHAQAgGgAAhwEAIFsAAIgBACBcAACHAQAgZgIAAAABZwIAAAAEaAIAAAAEaQIAAAABagIAAAABawIAAAABbAIAAAABbQIAigEAIQ4GAACHAQAgGQAAjAEAIBoAAIwBACBmAQAAAAFnAQAAAARoAQAAAARpAQAAAAFqAQAAAAFrAQAAAAFsAQAAAAFtAQCLAQAhbgEAAAABbwEAAAABcAEAAAABC2YBAAAAAWcBAAAABGgBAAAABGkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAIwBACFuAQAAAAFvAQAAAAFwAQAAAAEHXwAAjQEAMGAAAGwAEGEAAI0BADBiAQCOAQAhYwEAjgEAIWQCAI8BACFlBACQAQAhC2YBAAAAAWcBAAAABGgBAAAABGkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAIwBACFuAQAAAAFvAQAAAAFwAQAAAAEIZgIAAAABZwIAAAAEaAIAAAAEaQIAAAABagIAAAABawIAAAABbAIAAAABbQIAhwEAIQhmBAAAAAFnBAAAAARoBAAAAARpBAAAAAFqBAAAAAFrBAAAAAFsBAAAAAFtBACJAQAhCV8AAJEBADBgAABmABBhAACRAQAwYgEAgwEAIXEBAIMBACFyAQCDAQAhc0AAkgEAIXRAAJIBACF1QACSAQAhCwYAAIcBACAZAACUAQAgGgAAlAEAIGZAAAAAAWdAAAAABGhAAAAABGlAAAAAAWpAAAAAAWtAAAAAAWxAAAAAAW1AAJMBACELBgAAhwEAIBkAAJQBACAaAACUAQAgZkAAAAABZ0AAAAAEaEAAAAAEaUAAAAABakAAAAABa0AAAAABbEAAAAABbUAAkwEAIQhmQAAAAAFnQAAAAARoQAAAAARpQAAAAAFqQAAAAAFrQAAAAAFsQAAAAAFtQACUAQAhCV8AAJUBADBgAABTABBhAACVAQAwYgEAjgEAIXEBAI4BACFyAQCOAQAhc0AAlgEAIXRAAJYBACF1QACWAQAhCGZAAAAAAWdAAAAABGhAAAAABGlAAAAAAWpAAAAAAWtAAAAAAWxAAAAAAW1AAJQBACECcQEAAAABcgEAAAABEF8AAJgBADBgAABNABBhAACYAQAwYgEAgwEAIXRAAJIBACF1QACSAQAhdwEAgwEAIXgBAIMBACF5AQCDAQAhegEAmQEAIXsBAJkBACF8AQCZAQAhfUAAmgEAIX5AAJoBACF_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_AQAhB2IBAAAAAXNAAAAAAXRAAAAAAXVAAAAAAYEBAQAAAAGCAQEAAAABgwEBAAAAAQxiAQAAAAF0QAAAAAF1QAAAAAF3AQAAAAF4AQAAAAF6AQAAAAF7AQAAAAF8AQAAAAF9QAAAAAF-QAAAAAF_AQAAAAGAAQEAAAABAgAAAAUAIBMAAOUBACADAAAABQAgEwAA5QEAIBQAAOQBACABDAAA6wEAMBIDAACrAQAgXwAArQEAMGAAAAMAEGEAAK0BADBiAQAAAAF0QACWAQAhdUAAlgEAIXcBAI4BACF4AQCOAQAheQEAjgEAIXoBAKcBACF7AQCnAQAhfAEApwEAIX1AAK4BACF-QACuAQAhfwEApwEAIYABAQCnAQAhjgEAAKwBACACAAAABQAgDAAA5AEAIAIAAADiAQAgDAAA4wEAIBBfAADhAQAwYAAA4gEAEGEAAOEBADBiAQCOAQAhdEAAlgEAIXVAAJYBACF3AQCOAQAheAEAjgEAIXkBAI4BACF6AQCnAQAhewEApwEAIXwBAKcBACF9QACuAQAhfkAArgEAIX8BAKcBACGAAQEApwEAIRBfAADhAQAwYAAA4gEAEGEAAOEBADBiAQCOAQAhdEAAlgEAIXVAAJYBACF3AQCOAQAheAEAjgEAIXkBAI4BACF6AQCnAQAhewEApwEAIXwBAKcBACF9QACuAQAhfkAArgEAIX8BAKcBACGAAQEApwEAIQxiAQC0AQAhdEAAugEAIXVAALoBACF3AQC0AQAheAEAtAEAIXoBAL8BACF7AQC_AQAhfAEAvwEAIX1AAMABACF-QADAAQAhfwEAvwEAIYABAQC_AQAhDGIBALQBACF0QAC6AQAhdUAAugEAIXcBALQBACF4AQC0AQAhegEAvwEAIXsBAL8BACF8AQC_AQAhfUAAwAEAIX5AAMABACF_AQC_AQAhgAEBAL8BACEMYgEAAAABdEAAAAABdUAAAAABdwEAAAABeAEAAAABegEAAAABewEAAAABfAEAAAABfUAAAAABfkAAAAABfwEAAAABgAEBAAAAAQQTAADaAQAwkQEAANsBADCTAQAA3QEAIJcBAADeAQAwBBMAAM4BADCRAQAAzwEAMJMBAADRAQAglwEAANIBADAAAAcEAADoAQAgBQAA6QEAIIYBAAC7AQAghwEAALsBACCIAQAAuwEAIIkBAAC7AQAgigEAALsBACAMYgEAAAABdEAAAAABdUAAAAABdwEAAAABeAEAAAABegEAAAABewEAAAABfAEAAAABfUAAAAABfkAAAAABfwEAAAABgAEBAAAAAQdiAQAAAAFzQAAAAAF0QAAAAAF1QAAAAAGBAQEAAAABggEBAAAAAYMBAQAAAAELBAAA5gEAIGIBAAAAAXRAAAAAAXVAAAAAAYQBAQAAAAGFASAAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEBAAAAAYoBAQAAAAECAAAAAQAgEwAA7QEAIAMAAAAOACATAADtAQAgFAAA8QEAIA0AAAAOACAEAADMAQAgDAAA8QEAIGIBALQBACF0QAC6AQAhdUAAugEAIYQBAQC0AQAhhQEgAMsBACGGAQEAvwEAIYcBAQC_AQAhiAEBAL8BACGJAQEAvwEAIYoBAQC_AQAhCwQAAMwBACBiAQC0AQAhdEAAugEAIXVAALoBACGEAQEAtAEAIYUBIADLAQAhhgEBAL8BACGHAQEAvwEAIYgBAQC_AQAhiQEBAL8BACGKAQEAvwEAIQsFAADnAQAgYgEAAAABdEAAAAABdUAAAAABhAEBAAAAAYUBIAAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQEAAAABigEBAAAAAQIAAAABACATAADyAQAgAwAAAA4AIBMAAPIBACAUAAD2AQAgDQAAAA4AIAUAAM0BACAMAAD2AQAgYgEAtAEAIXRAALoBACF1QAC6AQAhhAEBALQBACGFASAAywEAIYYBAQC_AQAhhwEBAL8BACGIAQEAvwEAIYkBAQC_AQAhigEBAL8BACELBQAAzQEAIGIBALQBACF0QAC6AQAhdUAAugEAIYQBAQC0AQAhhQEgAMsBACGGAQEAvwEAIYcBAQC_AQAhiAEBAL8BACGJAQEAvwEAIYoBAQC_AQAhAwQGAgUKAwYABAEDAAEBAwABAgQLAAUMAAAAAAMGAAkZAAoaAAsAAAADBgAJGQAKGgALAQMAAQEDAAEDBgAQGQARGgASAAAAAwYAEBkAERoAEgEDAAEBAwABAwYAFxkAGBoAGQAAAAMGABcZABgaABkAAAADBgAfGQAgGgAhAAAAAwYAHxkAIBoAIQAAAAUGACcZACoaACtbAChcACkAAAAAAAUGACcZACoaACtbAChcACkHAgEIDQEJEAEKEQELEgENFAEOFgUPFwYQGQERGwUSHAcVHQEWHgEXHwUbIggcIwwdJAMeJQMfJgMgJwMhKAMiKgMjLAUkLQ0lLwMmMQUnMg4oMwMpNAMqNQUrOA8sORMtOgIuOwIvPAIwPQIxPgIyQAIzQgU0QxQ1RQI2RwU3SBU4SQI5SgI6SwU7ThY8Txo9URs-Uhs_VRtAVhtBVxtCWRtDWwVEXBxFXhtGYAVHYR1IYhtJYxtKZAVLZx5MaCJNaiNOayNPbiNQbyNRcCNSciNTdAVUdSRVdyNWeQVXeiVYeyNZfCNafQVdgAEmXoEBLA"
};
async function decodeBase64AsWasm(wasmBase64) {
	const { Buffer } = await import("node:buffer");
	const wasmArray = Buffer.from(wasmBase64, "base64");
	return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
	getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
	getQueryCompilerWasmModule: async () => {
		const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
		return await decodeBase64AsWasm(wasm);
	},
	importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
	return runtime.getPrismaClient(config);
}
//#endregion
//#region src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = /* @__PURE__ */ __exportAll({
	AccountScalarFieldEnum: () => AccountScalarFieldEnum,
	AnyNull: () => AnyNull,
	DbNull: () => DbNull,
	Decimal: () => Decimal,
	JsonNull: () => JsonNull,
	ModelName: () => ModelName,
	NullTypes: () => NullTypes,
	NullsOrder: () => NullsOrder,
	PrismaClientInitializationError: () => PrismaClientInitializationError,
	PrismaClientKnownRequestError: () => PrismaClientKnownRequestError,
	PrismaClientRustPanicError: () => PrismaClientRustPanicError,
	PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError,
	PrismaClientValidationError: () => PrismaClientValidationError,
	QueryMode: () => QueryMode,
	RateLimitScalarFieldEnum: () => RateLimitScalarFieldEnum,
	SessionScalarFieldEnum: () => SessionScalarFieldEnum,
	SortOrder: () => SortOrder,
	Sql: () => Sql,
	TransactionIsolationLevel: () => TransactionIsolationLevel,
	UserScalarFieldEnum: () => UserScalarFieldEnum,
	VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
	defineExtension: () => defineExtension,
	empty: () => empty,
	getExtensionContext: () => getExtensionContext,
	join: () => join,
	prismaVersion: () => prismaVersion,
	raw: () => raw,
	sql: () => sql
});
/**
* Prisma Errors
*/
const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
const PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
* Re-export of sql-template-tag
*/
const sql = runtime.sqltag;
const empty = runtime.empty;
const join = runtime.join;
const raw = runtime.raw;
const Sql = runtime.Sql;
/**
* Decimal.js
*/
const Decimal = runtime.Decimal;
const getExtensionContext = runtime.Extensions.getExtensionContext;
/**
* Prisma Client JS version: 7.8.0
* Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
*/
const prismaVersion = {
	client: "7.8.0",
	engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
const NullTypes = {
	DbNull: runtime.NullTypes.DbNull,
	JsonNull: runtime.NullTypes.JsonNull,
	AnyNull: runtime.NullTypes.AnyNull
};
/**
* Helper for filtering JSON entries that have `null` on the database (empty on the db)
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const DbNull = runtime.DbNull;
/**
* Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const JsonNull = runtime.JsonNull;
/**
* Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
*
* @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
*/
const AnyNull = runtime.AnyNull;
const ModelName = {
	User: "User",
	Session: "Session",
	Account: "Account",
	Verification: "Verification",
	RateLimit: "RateLimit"
};
/**
* Enums
*/
const TransactionIsolationLevel = runtime.makeStrictEnum({
	ReadUncommitted: "ReadUncommitted",
	ReadCommitted: "ReadCommitted",
	RepeatableRead: "RepeatableRead",
	Serializable: "Serializable"
});
const UserScalarFieldEnum = {
	id: "id",
	email: "email",
	emailVerified: "emailVerified",
	name: "name",
	image: "image",
	createdAt: "createdAt",
	updatedAt: "updatedAt",
	username: "username",
	displayUsername: "displayUsername",
	displayName: "displayName"
};
const SessionScalarFieldEnum = {
	id: "id",
	expiresAt: "expiresAt",
	token: "token",
	createdAt: "createdAt",
	updatedAt: "updatedAt",
	ipAddress: "ipAddress",
	userAgent: "userAgent",
	userId: "userId"
};
const AccountScalarFieldEnum = {
	id: "id",
	accountId: "accountId",
	providerId: "providerId",
	userId: "userId",
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	idToken: "idToken",
	accessTokenExpiresAt: "accessTokenExpiresAt",
	refreshTokenExpiresAt: "refreshTokenExpiresAt",
	scope: "scope",
	password: "password",
	createdAt: "createdAt",
	updatedAt: "updatedAt"
};
const VerificationScalarFieldEnum = {
	id: "id",
	identifier: "identifier",
	value: "value",
	expiresAt: "expiresAt",
	createdAt: "createdAt",
	updatedAt: "updatedAt"
};
const RateLimitScalarFieldEnum = {
	id: "id",
	key: "key",
	count: "count",
	lastRequest: "lastRequest"
};
const SortOrder = {
	asc: "asc",
	desc: "desc"
};
const QueryMode = {
	default: "default",
	insensitive: "insensitive"
};
const NullsOrder = {
	first: "first",
	last: "last"
};
const defineExtension = runtime.Extensions.defineExtension;
//#endregion
//#region src/generated/prisma/enums.ts
var enums_exports = /* @__PURE__ */ __exportAll({});
//#endregion
//#region src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
/**
* ## Prisma Client
* 
* Type-safe database client for TypeScript
* @example
* ```
* const prisma = new PrismaClient({
*   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
* })
* // Fetch zero or more Users
* const users = await prisma.user.findMany()
* ```
* 
* Read more in our [docs](https://pris.ly/d/client).
*/
const PrismaClient = getPrismaClientClass();
//#endregion
//#region src/client.ts
const globalForPrisma = globalThis;
const createPrismaClient = () => {
	return new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
};
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
//#endregion
export { enums_exports as $Enums, prismaNamespace_exports as Prisma, PrismaClient, prisma };
