import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Folder Schema
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
});

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Tag Schema
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// Note Schema
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Note-Tag relationship 
export const noteTags = pgTable("note_tags", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => notes.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

export const insertNoteTagSchema = createInsertSchema(noteTags).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type NoteTag = typeof noteTags.$inferSelect;
export type InsertNoteTag = z.infer<typeof insertNoteTagSchema>;

// Define relations
export const notesRelations = relations(notes, ({ one, many }) => ({
  folder: one(folders, {
    fields: [notes.folderId],
    references: [folders.id],
  }),
  noteTags: many(noteTags),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  notes: many(notes),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  noteTags: many(noteTags),
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

// For local storage
export interface NoteWithTags extends Note {
  tags: Tag[];
}
