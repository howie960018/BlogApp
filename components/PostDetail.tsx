import React, { useState } from 'react';
import { BlogPost } from '../types';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Calendar, Tag, Sparkles, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SketchButton } from './SketchButton';
import { CommentSection } from './CommentSection';
import { ShareButton } from './ShareButton';
import { commentService } from '../services/commentService';

interface PostDetailProps {
  post: BlogPost;
  onBack: () => void;
  onEdit: (id: string) => void;
  onPostUpdate?: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post, onBack, onEdit, onPostUpdate }) => {
  const [localPost, setLocalPost] = useState(post);

  const colorClasses = {
    red: 'bg-pencil-red/10 dark:bg-red-900/20',
    blue: 'bg-pencil-blue/10 dark:bg-blue-900/20',
    green: 'bg-pencil-green/10 dark:bg-green-900/20',
    yellow: 'bg-pencil-yellow/10 dark:bg-yellow-900/20',
    purple: 'bg-pencil-purple/10 dark:bg-purple-900/20',
  };

  const handleAddComment = async (content: string) => {
    try {
      const newComment = await commentService.addComment(localPost.id, content);
      setLocalPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      if (onPostUpdate) onPostUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(localPost.id, commentId);
      setLocalPost(prev => ({
        ...prev,
        comments: (prev.comments || []).filter(c => c.id !== commentId)
      }));
      if (onPostUpdate) onPostUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-12">
       <button 
          onClick={onBack}
          className="flex items-center text-ink dark:text-chalk hover:underline font-hand text-lg mb-6"
        >
          <ArrowLeft size={20} className="mr-1" /> 返回列表
        </button>

      <article className={`relative p-8 md:p-12 bg-white dark:bg-zinc-800 rounded-3xl border-2 border-ink dark:border-chalk shadow-sketch transition-colors ${colorClasses[localPost.colorTheme]}`}>
        {/* Decorative Tape */}
        <div className="absolute -top-4 left-10 w-32 h-8 bg-white/60 dark:bg-white/10 border border-white/50 rotate-[-2deg] shadow-sm backdrop-blur-sm"></div>

        <header className="mb-8 border-b-2 border-ink dark:border-chalk border-dashed pb-6">
          <div className="flex justify-between items-start gap-4">
             <h1 className="font-hand text-4xl md:text-5xl font-bold text-ink dark:text-chalk leading-tight">
              {localPost.title}
            </h1>
            <div className="flex gap-2 shrink-0">
              <ShareButton post={localPost} />
              <SketchButton variant="ghost" onClick={() => onEdit(localPost.id)} className="!p-2" title="編輯這篇日記">
                 <Edit2 size={20} />
              </SketchButton>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-ink/70 dark:text-chalk/70 font-hand text-lg">
            <span className="flex items-center gap-1">
              <Calendar size={18} />
              {format(localPost.createdAt, 'yyyy 年 M 月 d 日')}
            </span>
            {localPost.category && (
               <span className="flex items-center gap-1">
                 <Folder size={18} />
                 {localPost.category}
               </span>
            )}
            {localPost.mood && (
              <span className="flex items-center gap-1 bg-white dark:bg-black/20 px-3 py-1 rounded-full border border-ink/30 dark:border-chalk/30">
                <span>心情:</span>
                <span className="text-xl">{localPost.mood}</span>
              </span>
            )}
          </div>
        </header>

        {localPost.aiSummary && (
          <div className="mb-8 p-6 bg-white/50 dark:bg-zinc-900/50 rounded-xl border-2 border-ink dark:border-chalk border-dashed flex items-start gap-3">
             <Sparkles className="text-pencil-purple shrink-0 mt-1" />
             <div>
               <span className="block font-bold font-hand text-sm text-pencil-purple uppercase tracking-wider mb-1">AI 摘要</span>
               <p className="font-hand text-lg italic text-ink/80 dark:text-chalk/80 leading-relaxed">
                 {localPost.aiSummary}
               </p>
             </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg font-hand max-w-none text-ink dark:text-chalk prose-headings:font-bold prose-a:text-pencil-blue dark:prose-strong:text-chalk dark:prose-blockquote:text-chalk/70">
          <ReactMarkdown>{localPost.content}</ReactMarkdown>
        </div>

        {/* Image Gallery */}
        {localPost.images && localPost.images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {localPost.images.map((img, index) => (
              <div key={index} className="rounded-xl overflow-hidden border-2 border-ink dark:border-chalk shadow-sm">
                <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t-2 border-ink dark:border-chalk border-dashed">
          <div className="flex flex-wrap gap-2">
            {localPost.tags.map(tag => (
              <span key={tag} className="flex items-center text-sm font-bold font-hand px-3 py-1 bg-white dark:bg-zinc-900 border border-ink dark:border-chalk rounded-full shadow-[2px_2px_0px_0px_currentColor] text-ink dark:text-chalk">
                <Tag size={12} className="mr-2" />
                {tag}
              </span>
            ))}
          </div>
        </footer>

        {/* Comments Section */}
        <CommentSection
          postId={localPost.id}
          comments={localPost.comments || []}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </article>
    </div>
  );
};