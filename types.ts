export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  message: string;
  scheduledTime: number;
  isActive: boolean;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  userId: string; // 新增：關聯到特定使用者
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  mood?: string;
  tags: string[];
  category?: string;
  images?: string[]; // Base64 strings
  aiSummary?: string;
  colorTheme: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  comments?: Comment[];
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'comments'>;

export interface AIAnalysisResult {
  summary: string;
  mood: string;
  tags: string[];
}