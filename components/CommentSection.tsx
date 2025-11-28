import React, { useState } from 'react';
import { Comment } from '../types';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { SketchButton } from './SketchButton';
import { useAuth } from '../context/AuthContext';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments = [],
  onAddComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t-2 border-ink/20 dark:border-chalk/20 border-dashed pt-6">
      <h3 className="text-xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2 mb-4">
        <MessageCircle size={24} />
        留言 ({comments.length})
      </h3>

      {/* 新增留言表單 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="寫下你的想法..."
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-700 text-ink dark:text-chalk focus:outline-none focus:ring-2 focus:ring-pencil-blue disabled:opacity-50"
          />
          <SketchButton
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            icon={<Send size={18} />}
            className="!px-4"
          >
            送出
          </SketchButton>
        </div>
      </form>

      {/* 留言列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-ink/60 dark:text-chalk/60 font-hand py-4">
            還沒有留言,來當第一個留言的人吧!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-zinc-700 border-2 border-ink/20 dark:border-chalk/20 rounded-lg p-4 shadow-[2px_2px_0px_0px_currentColor] text-ink dark:text-chalk"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-hand font-bold text-ink dark:text-chalk">
                    {comment.username}
                  </span>
                  <span className="ml-2 text-sm text-ink/60 dark:text-chalk/60 font-hand">
                    {format(new Date(comment.createdAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                  </span>
                </div>
                {user && (user.id === comment.userId) && (
                  <button
                    onClick={() => onDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    title="刪除留言"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="font-hand text-ink dark:text-chalk">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
