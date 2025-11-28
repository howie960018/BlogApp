import { Reminder } from '../types';

const TOKEN_KEY = 'doodle_journal_token';
const API_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
});

export const reminderService = {
  getReminders: async (): Promise<Reminder[]> => {
    try {
      const res = await fetch(`${API_URL}/reminders`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return res.json();
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  },

  createReminder: async (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>): Promise<Reminder> => {
    const res = await fetch(`${API_URL}/reminders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reminder)
    });
    if (!res.ok) throw new Error('Failed to create reminder');
    return res.json();
  },

  updateReminder: async (id: string, updates: Partial<Reminder>): Promise<Reminder> => {
    const res = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update reminder');
    return res.json();
  },

  deleteReminder: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete reminder');
  }
};
