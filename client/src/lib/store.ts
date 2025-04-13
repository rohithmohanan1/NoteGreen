import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { type Note, type Tag, type Folder, type NoteWithTags } from '@shared/schema';

// Local storage types
interface LocalNote extends Omit<Note, 'id'> {
  id: string;
  folderId: string | null;
  tagIds: string[];
}

interface LocalTag extends Omit<Tag, 'id'> {
  id: string;
}

interface LocalFolder extends Omit<Folder, 'id'> {
  id: string;
}

interface StoreState {
  notes: LocalNote[];
  tags: LocalTag[];
  folders: LocalFolder[];
  activeFolder: string | null;
  searchQuery: string;
  
  // Note actions
  addNote: (note: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, note: Partial<Omit<LocalNote, 'id'>>) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => LocalNote | undefined;
  getNotesByFolderId: (folderId: string | null) => LocalNote[];
  getNotesByTagId: (tagId: string) => LocalNote[];
  searchNotes: (query: string) => LocalNote[];
  
  // Tag actions
  addTag: (tag: Omit<LocalTag, 'id'>) => string;
  updateTag: (id: string, tag: Partial<Omit<LocalTag, 'id'>>) => void;
  deleteTag: (id: string) => void;
  
  // Folder actions
  addFolder: (folder: Omit<LocalFolder, 'id'>) => string;
  updateFolder: (id: string, folder: Partial<Omit<LocalFolder, 'id'>>) => void;
  deleteFolder: (id: string) => void;
  setActiveFolder: (id: string | null) => void;
  
  // Search actions
  setSearchQuery: (query: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      notes: [],
      tags: [],
      folders: [],
      activeFolder: null,
      searchQuery: '',
      
      // Note actions
      addNote: (note) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        return id;
      },
      
      updateNote: (id, note) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...note, updatedAt: new Date() }
              : n
          ),
        }));
      },
      
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
      },
      
      getNoteById: (id) => {
        return get().notes.find((n) => n.id === id);
      },
      
      getNotesByFolderId: (folderId) => {
        return get().notes.filter((n) => n.folderId === folderId);
      },
      
      getNotesByTagId: (tagId) => {
        return get().notes.filter((n) => n.tagIds.includes(tagId));
      },
      
      searchNotes: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().notes;
        
        return get().notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        );
      },
      
      // Tag actions
      addTag: (tag) => {
        const id = uuidv4();
        set((state) => ({
          tags: [...state.tags, { ...tag, id }],
        }));
        return id;
      },
      
      updateTag: (id, tag) => {
        set((state) => ({
          tags: state.tags.map((t) =>
            t.id === id ? { ...t, ...tag } : t
          ),
        }));
      },
      
      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          notes: state.notes.map(note => ({
            ...note,
            tagIds: note.tagIds.filter(tagId => tagId !== id)
          }))
        }));
      },
      
      // Folder actions
      addFolder: (folder) => {
        const id = uuidv4();
        set((state) => ({
          folders: [...state.folders, { ...folder, id }],
        }));
        return id;
      },
      
      updateFolder: (id, folder) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, ...folder } : f
          ),
        }));
      },
      
      deleteFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          notes: state.notes.map(note => ({
            ...note,
            folderId: note.folderId === id ? null : note.folderId
          }))
        }));
      },
      
      setActiveFolder: (id) => {
        set(() => ({ activeFolder: id }));
      },
      
      // Search actions
      setSearchQuery: (query) => {
        set(() => ({ searchQuery: query }));
      },
    }),
    {
      name: 'notegreen-storage',
    }
  )
);
