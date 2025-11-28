import React from 'react';
    import { BlogPost } from '../types';
    import { format } from 'date-fns';
    import { Edit2, Trash2, Calendar, Tag, Image as ImageIcon, Folder } from 'lucide-react';
    
    interface PostCardProps {
      post: BlogPost;
      onEdit: (id: string) => void;
      onDelete: (id: string) => void;
      onClick: (id: string) => void;
    }
    
    export const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete, onClick }) => {
      const colorClasses = {
        red: 'bg-pencil-red/20 hover:bg-pencil-red/30 dark:bg-red-900/30 dark:hover:bg-red-900/40',
        blue: 'bg-pencil-blue/20 hover:bg-pencil-blue/30 dark:bg-blue-900/30 dark:hover:bg-blue-900/40',
        green: 'bg-pencil-green/20 hover:bg-pencil-green/30 dark:bg-green-900/30 dark:hover:bg-green-900/40',
        yellow: 'bg-pencil-yellow/20 hover:bg-pencil-yellow/30 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/40',
        purple: 'bg-pencil-purple/20 hover:bg-pencil-purple/30 dark:bg-purple-900/30 dark:hover:bg-purple-900/40',
      };
    
      const hasImages = post.images && post.images.length > 0;
    
      return (
        <div 
          className={`
            relative group p-6 rounded-2xl border-2 border-ink dark:border-chalk
            shadow-sketch hover:shadow-sketch-hover transition-all duration-300
            cursor-pointer text-ink dark:text-chalk flex flex-col h-full
            ${colorClasses[post.colorTheme]}
          `}
          onClick={() => onClick(post.id)}
        >
          {/* Tape Effect */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 border border-white/60 rotate-2 shadow-sm pointer-events-none backdrop-blur-sm z-10" />
    
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-hand text-2xl font-bold leading-tight line-clamp-2">
              {post.title}
            </h3>
            <span className="text-3xl filter drop-shadow-sm ml-2" title="心情">{post.mood || '📝'}</span>
          </div>
    
          <div className="flex items-center gap-3 text-sm font-hand mb-4 opacity-70">
            <div className="flex items-center gap-1">
               <Calendar size={14} />
               <span>{format(post.createdAt, 'yyyy/MM/dd')}</span>
            </div>
            {post.category && (
               <div className="flex items-center gap-1">
                 <Folder size={14} />
                 <span>{post.category}</span>
               </div>
            )}
          </div>
    
          {/* Image Thumbnail Preview */}
          {hasImages && (
            <div className="mb-4 h-32 w-full rounded-lg border-2 border-ink dark:border-chalk/50 overflow-hidden bg-white/50 relative">
               <img src={post.images![0]} alt="Thumbnail" className="w-full h-full object-cover" />
               {post.images!.length > 1 && (
                 <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-hand flex items-center">
                    <ImageIcon size={10} className="mr-1"/> +{post.images!.length - 1}
                 </div>
               )}
            </div>
          )}
    
          <p className="font-hand text-lg opacity-90 line-clamp-3 mb-4 flex-grow">
            {post.aiSummary || post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')}
          </p>
    
          <div className="flex flex-wrap gap-2 mt-auto">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center text-xs font-bold px-2 py-1 bg-white/80 dark:bg-black/40 border border-ink dark:border-chalk/60 rounded-full">
                <Tag size={10} className="mr-1" />
                #{tag}
              </span>
            ))}
          </div>
    
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(post.id); }}
              className="p-2 bg-white dark:bg-zinc-800 border-2 border-ink dark:border-chalk rounded-full hover:bg-pencil-blue hover:text-white dark:hover:bg-blue-600 transition-colors shadow-sm"
              title="編輯"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
              className="p-2 bg-white dark:bg-zinc-800 border-2 border-ink dark:border-chalk rounded-full hover:bg-pencil-red hover:text-white dark:hover:bg-red-600 transition-colors shadow-sm"
              title="刪除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      );
    };