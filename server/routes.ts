import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema, insertFolderSchema, insertTagSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes API endpoints
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid note ID" });
      }
      
      const note = await storage.getNoteWithTags(id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNoteSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const newNote = await storage.createNote(validatedData.data);
      
      // Process tags if they are provided
      if (req.body.tagIds && Array.isArray(req.body.tagIds)) {
        for (const tagId of req.body.tagIds) {
          await storage.addTagToNote(newNote.id, tagId);
        }
      }
      
      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid note ID" });
      }
      
      // Validate only the fields that are provided for update
      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        folderId: z.number().nullable().optional(),
      });
      
      const validatedData = updateSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const updatedNote = await storage.updateNote(id, validatedData.data);
      if (!updatedNote) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      // Process tags if they are provided
      if (req.body.tagIds && Array.isArray(req.body.tagIds)) {
        // Get existing tags for the note
        const existingTags = await storage.getNoteTagsByNoteId(id);
        const existingTagIds = existingTags.map(tag => tag.id);
        
        // Remove tags that are no longer present
        for (const existingTagId of existingTagIds) {
          if (!req.body.tagIds.includes(existingTagId)) {
            await storage.removeTagFromNote(id, existingTagId);
          }
        }
        
        // Add new tags
        for (const tagId of req.body.tagIds) {
          if (!existingTagIds.includes(tagId)) {
            await storage.addTagToNote(id, tagId);
          }
        }
      }
      
      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid note ID" });
      }
      
      const success = await storage.deleteNote(id);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });
  
  // Folder endpoints
  app.get("/api/folders", async (req: Request, res: Response) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });
  
  app.post("/api/folders", async (req: Request, res: Response) => {
    try {
      const validatedData = insertFolderSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const newFolder = await storage.createFolder(validatedData.data);
      res.status(201).json(newFolder);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(409).json({ error: "A folder with this name already exists" });
      }
      res.status(500).json({ error: "Failed to create folder" });
    }
  });
  
  app.put("/api/folders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid folder ID" });
      }
      
      const updateSchema = z.object({
        name: z.string(),
      });
      
      const validatedData = updateSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const updatedFolder = await storage.updateFolder(id, validatedData.data);
      if (!updatedFolder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      
      res.json(updatedFolder);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(409).json({ error: "A folder with this name already exists" });
      }
      res.status(500).json({ error: "Failed to update folder" });
    }
  });
  
  app.delete("/api/folders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid folder ID" });
      }
      
      const success = await storage.deleteFolder(id);
      if (!success) {
        return res.status(404).json({ error: "Folder not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });
  
  // Get notes by folder ID
  app.get("/api/folders/:id/notes", async (req: Request, res: Response) => {
    try {
      const id = req.params.id === "null" ? null : parseInt(req.params.id);
      if (req.params.id !== "null" && isNaN(id as number)) {
        return res.status(400).json({ error: "Invalid folder ID" });
      }
      
      const notes = await storage.getNotesByFolderId(id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes for folder" });
    }
  });
  
  // Tag endpoints
  app.get("/api/tags", async (req: Request, res: Response) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });
  
  app.post("/api/tags", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTagSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const newTag = await storage.createTag(validatedData.data);
      res.status(201).json(newTag);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(409).json({ error: "A tag with this name already exists" });
      }
      res.status(500).json({ error: "Failed to create tag" });
    }
  });
  
  app.put("/api/tags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tag ID" });
      }
      
      const updateSchema = z.object({
        name: z.string().optional(),
        color: z.string().optional(),
      });
      
      const validatedData = updateSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const updatedTag = await storage.updateTag(id, validatedData.data);
      if (!updatedTag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      
      res.json(updatedTag);
    } catch (error) {
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return res.status(409).json({ error: "A tag with this name already exists" });
      }
      res.status(500).json({ error: "Failed to update tag" });
    }
  });
  
  app.delete("/api/tags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tag ID" });
      }
      
      const success = await storage.deleteTag(id);
      if (!success) {
        return res.status(404).json({ error: "Tag not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });
  
  // Get notes by tag ID
  app.get("/api/tags/:id/notes", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tag ID" });
      }
      
      const notes = await storage.getNotesByTagId(id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes for tag" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
