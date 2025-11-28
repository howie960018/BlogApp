import { Comment } from '../types';

const TOKEN_KEY = 'doodle_journal_token';
const API_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
});

export const commentService = {
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    const res = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete comment');
  }
};
