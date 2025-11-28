import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { SketchButton } from './SketchButton';
import { KeyRound, Mail, Lock, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登入失敗，請檢查帳號密碼。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <h1 className="font-hand text-5xl font-bold text-ink dark:text-chalk mb-2 drop-shadow-sm">歡迎回來</h1>
           <p className="font-hand text-xl text-ink/60 dark:text-chalk/60">解鎖你的專屬回憶</p>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-white dark:bg-zinc-800 p-8 rounded-2xl border-2 border-ink dark:border-chalk shadow-sketch transition-colors">
          {/* Decorative Lock */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-pencil-yellow rounded-full border-2 border-ink dark:border-chalk flex items-center justify-center shadow-sketch z-10">
             <KeyRound size={32} className="text-ink" />
          </div>
          
          <div className="mt-8 space-y-6">
            {error && (
              <div className="p-3 bg-pencil-red/20 border-2 border-pencil-red border-dashed rounded-lg text-red-600 dark:text-red-300 font-hand font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-hand text-lg font-bold text-ink dark:text-chalk ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-chalk/40" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-xl bg-transparent focus:outline-none focus:ring-4 focus:ring-pencil-blue/30 transition-all text-ink dark:text-chalk placeholder-gray-400"
                  placeholder="example@mail.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-hand text-lg font-bold text-ink dark:text-chalk ml-1">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-chalk/40" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-xl bg-transparent focus:outline-none focus:ring-4 focus:ring-pencil-blue/30 transition-all text-ink dark:text-chalk placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <SketchButton 
              type="submit" 
              className="w-full justify-center py-3 text-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登入中...' : '登入手帳'}
            </SketchButton>

            <div className="text-center font-hand text-lg text-ink/70 dark:text-chalk/70 mt-4">
              還沒有帳號嗎？ 
              <Link to="/register" className="text-pencil-blue hover:underline font-bold ml-1 decoration-2 underline-offset-4">
                立即註冊
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};