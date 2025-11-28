import React, { useMemo } from 'react';
import { BlogPost } from '../types';
import { BarChart3, TrendingUp, Smile } from 'lucide-react';

interface MoodStatsProps {
  posts: BlogPost[];
}

export const MoodStats: React.FC<MoodStatsProps> = ({ posts }) => {
  const moodData = useMemo(() => {
    const moodCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.mood) {
        moodCounts[post.mood] = (moodCounts[post.mood] || 0) + 1;
      }
    });

    const total = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const getMoodColor = (mood: string): string => {
    const moodColors: Record<string, string> = {
      '開心': 'bg-yellow-400',
      '平靜': 'bg-blue-400',
      '興奮': 'bg-red-400',
      '悲傷': 'bg-gray-400',
      '焦慮': 'bg-purple-400',
      '感恩': 'bg-green-400',
    };
    return moodColors[mood] || 'bg-pink-400';
  };

  const getMoodEmoji = (mood: string): string => {
    const moodEmojis: Record<string, string> = {
      '開心': '😊',
      '平靜': '😌',
      '興奮': '😆',
      '悲傷': '😢',
      '焦慮': '😰',
      '感恩': '🙏',
    };
    return moodEmojis[mood] || '😐';
  };

  const tagData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* 心情統計 */}
      <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch">
        <h2 className="text-2xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2 mb-4">
          <Smile size={28} />
          心情統計
        </h2>

        {moodData.length === 0 ? (
          <p className="text-center text-ink/60 dark:text-chalk/60 font-hand py-8">
            還沒有記錄心情喔!開始寫日記吧~
          </p>
        ) : (
          <div className="space-y-3">
            {moodData.map(({ mood, count, percentage }) => (
              <div key={mood} className="space-y-1">
                <div className="flex justify-between items-center font-hand">
                  <span className="text-ink dark:text-chalk flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(mood)}</span>
                    {mood}
                  </span>
                  <span className="text-ink/60 dark:text-chalk/60">
                    {count} 次 ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden border border-ink/20 dark:border-chalk/20">
                  <div
                    className={`h-full ${getMoodColor(mood)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 標籤統計 */}
      <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch">
        <h2 className="text-2xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2 mb-4">
          <BarChart3 size={28} />
          熱門標籤
        </h2>

        {tagData.length === 0 ? (
          <p className="text-center text-ink/60 dark:text-chalk/60 font-hand py-8">
            還沒有標籤喔!
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tagData.map(({ tag, count }) => (
              <div
                key={tag}
                className="bg-white dark:bg-zinc-700 border-2 border-ink dark:border-chalk rounded-lg px-4 py-2 shadow-[2px_2px_0px_0px_currentColor] text-ink dark:text-chalk hover:shadow-[4px_4px_0px_0px_currentColor] transition-all"
              >
                <span className="font-hand font-bold">#{tag}</span>
                <span className="ml-2 text-sm text-ink/60 dark:text-chalk/60">×{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 寫作統計 */}
      <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch">
        <h2 className="text-2xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2 mb-4">
          <TrendingUp size={28} />
          寫作統計
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border-2 border-ink dark:border-chalk">
            <div className="text-3xl font-bold font-hand text-ink dark:text-chalk">{posts.length}</div>
            <div className="text-sm font-hand text-ink/60 dark:text-chalk/60">總日記數</div>
          </div>

          <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-ink dark:border-chalk">
            <div className="text-3xl font-bold font-hand text-ink dark:text-chalk">
              {posts.filter(p => p.images && p.images.length > 0).length}
            </div>
            <div className="text-sm font-hand text-ink/60 dark:text-chalk/60">包含圖片</div>
          </div>

          <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border-2 border-ink dark:border-chalk">
            <div className="text-3xl font-bold font-hand text-ink dark:text-chalk">
              {posts.filter(p => p.mood).length}
            </div>
            <div className="text-sm font-hand text-ink/60 dark:text-chalk/60">記錄心情</div>
          </div>

          <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border-2 border-ink dark:border-chalk">
            <div className="text-3xl font-bold font-hand text-ink dark:text-chalk">
              {new Set(posts.flatMap(p => p.tags)).size}
            </div>
            <div className="text-sm font-hand text-ink/60 dark:text-chalk/60">不同標籤</div>
          </div>
        </div>
      </div>
    </div>
  );
};
