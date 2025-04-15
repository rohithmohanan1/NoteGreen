import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Folder Schema
export const folders = pgTable("folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
});

// User Schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Tag Schema
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// Note Schema
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content"),
  folderId: uuid("folder_id").references(() => folders.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Note-Tag Schema
export const noteTags = pgTable("note_tags", {
  noteId: uuid("note_id")
    .references(() => notes.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});

export const insertNoteTagSchema = createInsertSchema(noteTags);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  folder: one(folders, {
    fields: [notes.folderId],
    references: [folders.id],
  }),
  tags: many(noteTags),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  notes: many(notes),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  notes: many(noteTags),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type InsertNoteTag = typeof noteTags.$inferInsert;
export type NoteWithTags = Note & { tags: Tag[] };
