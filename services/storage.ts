import { BlogPost, BlogPostInput } from '../types';
import { authService } from './authService';
import { USE_REAL_BACKEND, API_URL } from './config';

const STORAGE_KEY = 'doodle_journal_posts';
const TOKEN_KEY = 'doodle_journal_token';

// ================= Mock Implementation (LocalStorage) =================

const mockStorage = {
  getPosts: (): Promise<BlogPost[]> => {
    const user = authService.getCurrentUser();
    if (!user) return Promise.resolve([]);

    const data = localStorage.getItem(STORAGE_KEY);
    const allPosts: BlogPost[] = data ? JSON.parse(data) : [];
    return Promise.resolve(allPosts.filter(post => post.userId === user.id));
  },

  savePost: (postInput: BlogPostInput): Promise<BlogPost> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const data = localStorage.getItem(STORAGE_KEY);
    const allPosts: BlogPost[] = data ? JSON.parse(data) : [];

    const newPost: BlogPost = {
      ...postInput,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newPost, ...allPosts]));
    return Promise.resolve(newPost);
  },

  updatePost: (id: string, updates: Partial<BlogPostInput>): Promise<BlogPost | null> => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const data = localStorage.getItem(STORAGE_KEY);
    const allPosts: BlogPost[] = data ? JSON.parse(data) : [];
    const index = allPosts.findIndex(p => p.id === id && p.userId === user.id);
    
    if (index === -1) return Promise.resolve(null);

    const updatedPost = { ...allPosts[index], ...updates, updatedAt: Date.now() };
    allPosts[index] = updatedPost;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPosts));
    return Promise.resolve(updatedPost);
  },

  deletePost: (id: string): Promise<void> => {
    const user = authService.getCurrentUser();
    if (!user) return Promise.resolve();

    const data = localStorage.getItem(STORAGE_KEY);
    const allPosts: BlogPost[] = data ? JSON.parse(data) : [];
    const filtered = allPosts.filter(p => !(p.id === id && p.userId === user.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return Promise.resolve();
  },

  getPostById: (id: string): Promise<BlogPost | undefined> => {
    const user = authService.getCurrentUser();
    if (!user) return Promise.resolve(undefined);
    
    const data = localStorage.getItem(STORAGE_KEY);
    const allPosts: BlogPost[] = data ? JSON.parse(data) : [];
    return Promise.resolve(allPosts.find(p => p.id === id && p.userId === user.id));
  }
};

// ================= Real API Implementation (Fetch) =================

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
});

const apiStorage = {
  getPosts: async (): Promise<BlogPost[]> => {
    const res = await fetch(`${API_URL}/posts`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  savePost: async (postInput: BlogPostInput): Promise<BlogPost> => {
    const res = await fetch(`${API_URL}/posts`, { 
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postInput)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  updatePost: async (id: string, updates: Partial<BlogPostInput>): Promise<BlogPost | null> => {
    const res = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) return null;
    return res.json();
  },

  deletePost: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    // In a real app, you might want a specific GET /posts/:id endpoint.
    // For now, we reuse getPosts to keep backend simple, or assume we fetch list and find.
    // However, let's implement the filter client side for the detailed view if endpoint missing, 
    // OR ideally add GET /:id to backend. Let's assume we just fetch all for now or optimize later.
    const posts = await apiStorage.getPosts();
    return posts.find(p => p.id === id);
  }
};

// ================= Export based on Config =================

export const getPosts = () => USE_REAL_BACKEND ? apiStorage.getPosts() : mockStorage.getPosts();
export const savePost = (data: BlogPostInput) => USE_REAL_BACKEND ? apiStorage.savePost(data) : mockStorage.savePost(data);
export const updatePost = (id: string, data: Partial<BlogPostInput>) => USE_REAL_BACKEND ? apiStorage.updatePost(id, data) : mockStorage.updatePost(id, data);
export const deletePost = (id: string) => USE_REAL_BACKEND ? apiStorage.deletePost(id) : mockStorage.deletePost(id);
export const getPostById = (id: string) => USE_REAL_BACKEND ? apiStorage.getPostById(id) : mockStorage.getPostById(id);
