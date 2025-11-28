import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { BlogPost, BlogPostInput, Reminder } from './types';
import { getPosts, savePost, updatePost, deletePost, getPostById } from './services/storage';
import { PostList } from './components/PostList';
import { PostEditor } from './components/PostEditor';
import { PostDetail } from './components/PostDetail';
import { SketchButton } from './components/SketchButton';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CalendarView } from './components/CalendarView';
import { MoodStats } from './components/MoodStats';
import { ReminderManager } from './components/ReminderManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import { reminderService } from './services/reminderService';
import { Plus, BookOpen, PenTool, Moon, Sun, LogOut, User as UserIcon, Calendar, BarChart3, Bell, List } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-hand text-xl">載入中...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const JournalApp = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'stats'>('list');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const loadPosts = async () => {
    if (isAuthenticated) {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load posts", error);
      }
    } else {
      setPosts([]);
    }
  };

  const loadReminders = async () => {
    if (isAuthenticated) {
      try {
        const data = await reminderService.getReminders();
        setReminders(data);
      } catch (error) {
        console.error("Failed to load reminders", error);
      }
    } else {
      setReminders([]);
    }
  };

  useEffect(() => {
    loadPosts();
    loadReminders();
  }, [isAuthenticated, location.key]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const body = document.body;
    if (darkMode) {
      body.classList.remove('light');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleSavePost = async (postInput: BlogPostInput) => {
    await savePost(postInput);
    await loadPosts();
    navigate('/');
  };

  const handleUpdatePost = async (id: string, postInput: BlogPostInput) => {
    await updatePost(id, postInput);
    await loadPosts();
    navigate('/');
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('確定要撕掉這一頁嗎?這個動作無法復原喔。')) {
      await deletePost(id);
      await loadPosts();
      if (location.pathname.includes(id)) {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    if(window.confirm('確定要登出嗎?')) {
      logout();
      navigate('/login');
    }
  };

  const handleAddReminder = async (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt'>) => {
    await reminderService.createReminder(reminder);
    await loadReminders();
  };

  const handleDeleteReminder = async (id: string) => {
    await reminderService.deleteReminder(id);
    await loadReminders();
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    await reminderService.updateReminder(id, updates);
    await loadReminders();
  };

  const handleDateClick = (date: Date, postsOnDate: BlogPost[]) => {
    if (postsOnDate.length === 1) {
      navigate(`/post/${postsOnDate[0].id}`);
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300 flex flex-col">
      <header className="sticky top-0 z-50 bg-paper/95 dark:bg-zinc-800/95 backdrop-blur-sm border-b-2 border-ink dark:border-chalk border-dashed mb-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
            title="回到首頁"
          >
            <div className="w-10 h-10 bg-pencil-blue rounded-lg border-2 border-ink dark:border-chalk flex items-center justify-center shadow-sketch group-hover:shadow-sketch-hover transition-all group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-sketch-active">
              <BookOpen className="text-ink" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-hand text-ink dark:text-chalk tracking-wide hidden sm:block">手繪風手帳</h1>
            <h1 className="text-2xl font-bold font-hand text-ink dark:text-chalk tracking-wide sm:hidden">手帳</h1>
          </div>

          <div className="flex items-center gap-3">
             <SketchButton
                onClick={toggleDarkMode}
                variant="secondary"
                className="!px-2 !py-1"
                title={darkMode ? "切換至亮色模式" : "切換至深色模式"}
             >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
             </SketchButton>

             {isAuthenticated && user && (
               <>
                  <div className="hidden md:flex items-center gap-2 font-hand text-ink dark:text-chalk mr-2 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full border border-ink/20 dark:border-chalk/20">
                    <UserIcon size={16} />
                    <span>Hi, {user.username}</span>
                  </div>

                  <SketchButton
                      onClick={handleLogout}
                      variant="ghost"
                      className="!px-2 !py-1"
                      title="登出"
                  >
                      <LogOut size={18} />
                  </SketchButton>

                  <SketchButton
                      onClick={() => navigate('/new')}
                      icon={<Plus size={18} />}
                      className="!py-1"
                      title="寫新日記"
                  >
                      <span className="hidden sm:inline">寫日記</span>
                  </SketchButton>
               </>
             )}
          </div>
        </div>

        {/* View Switcher - 只在首頁顯示 */}
        {isHomePage && isAuthenticated && (
          <div className="max-w-5xl mx-auto px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto">
              <SketchButton
                onClick={() => setCurrentView('list')}
                variant={currentView === 'list' ? 'primary' : 'secondary'}
                icon={<List size={18} />}
                className="!py-2"
              >
                列表
              </SketchButton>
              <SketchButton
                onClick={() => setCurrentView('calendar')}
                variant={currentView === 'calendar' ? 'primary' : 'secondary'}
                icon={<Calendar size={18} />}
                className="!py-2"
              >
                日曆
              </SketchButton>
              <SketchButton
                onClick={() => setCurrentView('stats')}
                variant={currentView === 'stats' ? 'primary' : 'secondary'}
                icon={<BarChart3 size={18} />}
                className="!py-2"
              >
                統計
              </SketchButton>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 w-full flex-grow">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                {currentView === 'list' && (
                  <PostList
                    posts={posts}
                    onEdit={(id) => navigate(`/edit/${id}`)}
                    onDelete={handleDeletePost}
                    onView={(id) => navigate(`/post/${id}`)}
                  />
                )}
                {currentView === 'calendar' && (
                  <CalendarView
                    posts={posts}
                    onDateClick={handleDateClick}
                  />
                )}
                {currentView === 'stats' && (
                  <MoodStats posts={posts} />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <ReminderManager
                  reminders={reminders}
                  onAddReminder={handleAddReminder}
                  onDeleteReminder={handleDeleteReminder}
                  onUpdateReminder={handleUpdateReminder}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <PostEditor
                  onSave={handleSavePost}
                  onCancel={() => navigate('/')}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditRouteWrapper onUpdate={handleUpdatePost} onCancel={() => navigate('/')} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <DetailRouteWrapper onDelete={handleDeletePost} onEdit={(id) => navigate(`/edit/${id}`)} onPostUpdate={loadPosts} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {location.pathname === '/' && isAuthenticated && (
         <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
           <button
             onClick={() => navigate('/reminders')}
             className="w-14 h-14 rounded-full bg-pencil-purple border-2 border-ink dark:border-chalk shadow-[4px_4px_0px_0px_currentColor] flex items-center justify-center text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_currentColor] transition-all md:hidden"
             title="提醒通知"
           >
             <Bell size={24} />
           </button>
           <button
             onClick={() => navigate('/new')}
             className="w-14 h-14 rounded-full bg-pencil-yellow border-2 border-ink dark:border-chalk shadow-[4px_4px_0px_0px_currentColor] flex items-center justify-center text-ink active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_currentColor] transition-all md:hidden"
             title="新增日記"
           >
             <PenTool size={24} />
           </button>
         </div>
      )}
    </div>
  );
};

// Wrappers for async data fetching
const EditRouteWrapper = ({ onUpdate, onCancel }: { onUpdate: (id: string, data: BlogPostInput) => Promise<void>, onCancel: () => void }) => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPostById(id).then(p => {
        setPost(p);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div>載入中...</div>;
  if (!post) return <div className="text-center font-hand text-2xl mt-20 text-ink dark:text-chalk">找不到這篇日記!</div>;

  return <PostEditor initialData={post} onSave={(data) => onUpdate(id!, data)} onCancel={onCancel} />;
};

const DetailRouteWrapper = ({ onDelete, onEdit, onPostUpdate }: { onDelete: (id: string) => Promise<void>, onEdit: (id: string) => void, onPostUpdate: () => void }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadPost = () => {
    if (id) {
      getPostById(id).then(p => {
        setPost(p);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  if (loading) return <div>載入中...</div>;
  if (!post) return <div className="text-center font-hand text-2xl mt-20 text-ink dark:text-chalk">找不到這篇日記!</div>;
  return <PostDetail post={post} onBack={() => navigate('/')} onEdit={onEdit} onPostUpdate={() => { loadPost(); onPostUpdate(); }} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <JournalApp />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
