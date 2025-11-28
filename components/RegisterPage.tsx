import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { SketchButton } from './SketchButton';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '註冊失敗。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <h1 className="font-hand text-5xl font-bold text-ink dark:text-chalk mb-2 drop-shadow-sm flex items-center justify-center gap-3">
             <Sparkles className="text-pencil-purple" /> 開始旅程
           </h1>
           <p className="font-hand text-xl text-ink/60 dark:text-chalk/60">建立屬於你的手繪小天地</p>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-white dark:bg-zinc-800 p-8 rounded-2xl border-2 border-ink dark:border-chalk shadow-sketch transition-colors">
          
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-pencil-red/20 border-2 border-pencil-red border-dashed rounded-lg text-red-600 dark:text-red-300 font-hand font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-hand text-lg font-bold text-ink dark:text-chalk ml-1">你的暱稱</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-chalk/40" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-xl bg-transparent focus:outline-none focus:ring-4 focus:ring-pencil-green/30 transition-all text-ink dark:text-chalk placeholder-gray-400"
                  placeholder="怎麼稱呼你？"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-hand text-lg font-bold text-ink dark:text-chalk ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-chalk/40" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-xl bg-transparent focus:outline-none focus:ring-4 focus:ring-pencil-green/30 transition-all text-ink dark:text-chalk placeholder-gray-400"
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-hand text-lg font-bold text-ink dark:text-chalk ml-1">設定密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-chalk/40" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-xl bg-transparent focus:outline-none focus:ring-4 focus:ring-pencil-green/30 transition-all text-ink dark:text-chalk placeholder-gray-400"
                  placeholder="至少 6 個字元"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <SketchButton 
              type="submit" 
              variant="primary"
              className="w-full justify-center py-3 text-xl !bg-pencil-green hover:!bg-green-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? '建立中...' : '註冊帳號'}
            </SketchButton>

            <div className="text-center font-hand text-lg text-ink/70 dark:text-chalk/70 mt-4">
              已經有帳號了？ 
              <Link to="/login" className="text-pencil-blue hover:underline font-bold ml-1 decoration-2 underline-offset-4">
                直接登入
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};