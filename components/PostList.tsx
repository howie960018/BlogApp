import React, { useMemo, useState } from 'react';
import { BlogPost } from '../types';
import { PostCard } from './PostCard';
import { Search } from 'lucide-react';
import { AdvancedFilter, FilterOptions } from './AdvancedFilter';

interface PostListProps {
  posts: BlogPost[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const PostList: React.FC<PostListProps> = ({ posts, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    moods: [],
    tags: [],
    searchText: ''
  });

  const availableMoods = useMemo(() => {
    const moods = new Set<string>();
    posts.forEach(post => {
      if (post.mood) moods.add(post.mood);
    });
    return Array.from(moods);
  }, [posts]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 簡單搜尋
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.category && post.category.includes(searchTerm));

      // 進階篩選 - 搜尋文字
      const matchesFilterText = !filters.searchText ||
        post.title.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchText.toLowerCase());

      // 進階篩選 - 心情
      const matchesMood = filters.moods.length === 0 ||
        (post.mood && filters.moods.includes(post.mood));

      // 進階篩選 - 標籤
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.some(tag => post.tags.includes(tag));

      // 進階篩選 - 日期範圍
      const matchesDateFrom = !filters.dateFrom ||
        post.createdAt >= filters.dateFrom.getTime();
      const matchesDateTo = !filters.dateTo ||
        post.createdAt <= filters.dateTo.getTime() + 86400000; // +1天

      return matchesSearch && matchesFilterText && matchesMood && matchesTags && matchesDateFrom && matchesDateTo;
    });
  }, [posts, searchTerm, filters]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 opacity-60">
        <div className="text-8xl mb-4">📓</div>
        <h2 className="font-hand text-3xl font-bold text-ink dark:text-chalk mb-2">你的日記本是空的</h2>
        <p className="font-hand text-xl text-ink dark:text-chalk">點擊「寫日記」開始記錄你的人生故事吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="搜尋回憶、關鍵字..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 font-hand text-xl border-2 border-ink dark:border-chalk rounded-full bg-white dark:bg-zinc-800 text-ink dark:text-chalk shadow-sketch focus:outline-none focus:shadow-sketch-hover transition-all placeholder-gray-400"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 dark:text-chalk/50" size={24} />
      </div>

      {/* Advanced Filter */}
      <AdvancedFilter
        availableMoods={availableMoods}
        availableTags={availableTags}
        onFilterChange={setFilters}
        initialFilters={filters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onClick={onView}
          />
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
         <div className="text-center py-10 font-hand text-xl text-ink/60 dark:text-chalk/60">
           找不到符合的日記內容。
         </div>
      )}
    </div>
  );
};