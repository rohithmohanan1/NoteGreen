import { 
  users, notes, folders, tags, noteTags,  
  type User, type InsertUser, 
  type Note, type InsertNote,
  type Folder, type InsertFolder,
  type Tag, type InsertTag,
  type NoteTag, type InsertNoteTag,
  type NoteWithTags
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, sql, desc } from "drizzle-orm";

// Database Storage Interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Note operations
  getNotes(): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNotesByFolderId(folderId: number | null): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Folder operations
  getFolders(): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  getTagById(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Note-Tag operations
  getNoteTagsByNoteId(noteId: number): Promise<Tag[]>;
  getNotesByTagId(tagId: number): Promise<Note[]>;
  addTagToNote(noteId: number, tagId: number): Promise<NoteTag>;
  removeTagFromNote(noteId: number, tagId: number): Promise<boolean>;
  
  // Special operations
  getNoteWithTags(noteId: number): Promise<NoteWithTags | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Note operations
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.updatedAt));
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  
  async getNotesByFolderId(folderId: number | null): Promise<Note[]> {
    if (folderId === null) {
      return await db.select().from(notes).where(sql`${notes.folderId} IS NULL`).orderBy(desc(notes.updatedAt));
    } else {
      return await db.select().from(notes).where(eq(notes.folderId, folderId)).orderBy(desc(notes.updatedAt));
    }
  }
  
  async createNote(note: InsertNote): Promise<Note> {
    const [createdNote] = await db.insert(notes).values(note).returning();
    return createdNote;
  }
  
  async updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set({ ...note, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    const [deletedNote] = await db.delete(notes).where(eq(notes.id, id)).returning();
    return !!deletedNote;
  }
  
  // Folder operations
  async getFolders(): Promise<Folder[]> {
    return await db.select().from(folders);
  }
  
  async getFolderById(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }
  
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [createdFolder] = await db.insert(folders).values(folder).returning();
    return createdFolder;
  }
  
  async updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined> {
    const [updatedFolder] = await db
      .update(folders)
      .set(folder)
      .where(eq(folders.id, id))
      .returning();
    return updatedFolder;
  }
  
  async deleteFolder(id: number): Promise<boolean> {
    // First update all notes in this folder to have no folder
    await db.update(notes).set({ folderId: null }).where(eq(notes.folderId, id));
    
    // Then delete the folder
    const [deletedFolder] = await db.delete(folders).where(eq(folders.id, id)).returning();
    return !!deletedFolder;
  }
  
  // Tag operations
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags);
  }
  
  async getTagById(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }
  
  async createTag(tag: InsertTag): Promise<Tag> {
    const [createdTag] = await db.insert(tags).values(tag).returning();
    return createdTag;
  }
  
  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const [updatedTag] = await db
      .update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  }
  
  async deleteTag(id: number): Promise<boolean> {
    // The CASCADE constraints will automatically delete related note_tags rows
    const [deletedTag] = await db.delete(tags).where(eq(tags.id, id)).returning();
    return !!deletedTag;
  }
  
  // Note-Tag operations
  async getNoteTagsByNoteId(noteId: number): Promise<Tag[]> {
    const result = await db
      .select({
        tag: tags
      })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(noteTags.noteId, noteId));
    
    return result.map(r => r.tag);
  }
  
  async getNotesByTagId(tagId: number): Promise<Note[]> {
    const result = await db
      .select({
        note: notes
      })
      .from(noteTags)
      .innerJoin(notes, eq(noteTags.noteId, notes.id))
      .where(eq(noteTags.tagId, tagId))
      .orderBy(desc(notes.updatedAt));
    
    return result.map(r => r.note);
  }
  
  async addTagToNote(noteId: number, tagId: number): Promise<NoteTag> {
    const [noteTag] = await db
      .insert(noteTags)
      .values({ noteId, tagId })
      .returning();
    return noteTag;
  }
  
  async removeTagFromNote(noteId: number, tagId: number): Promise<boolean> {
    const [deletedNoteTag] = await db
      .delete(noteTags)
      .where(and(
        eq(noteTags.noteId, noteId),
        eq(noteTags.tagId, tagId)
      ))
      .returning();
    return !!deletedNoteTag;
  }
  
  // Special operations
  async getNoteWithTags(noteId: number): Promise<NoteWithTags | undefined> {
    const note = await this.getNoteById(noteId);
    if (!note) return undefined;
    
    const noteTags = await this.getNoteTagsByNoteId(noteId);
    
    return {
      ...note,
      tags: noteTags
    };
  }
}

export const storage = new DatabaseStorage();
