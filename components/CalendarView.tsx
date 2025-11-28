import React, { useState, useMemo } from 'react';
import { BlogPost } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { SketchButton } from './SketchButton';

interface CalendarViewProps {
  posts: BlogPost[];
  onDateClick: (date: Date, postsOnDate: BlogPost[]) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ posts, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const postsByDate = useMemo(() => {
    const map = new Map<string, BlogPost[]>();
    posts.forEach(post => {
      const dateKey = format(new Date(post.createdAt), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(post);
    });
    return map;
  }, [posts]);

  const getMoodColor = (mood?: string): string => {
    const moodColors: Record<string, string> = {
      '開心': 'bg-yellow-400',
      '平靜': 'bg-blue-400',
      '興奮': 'bg-red-400',
      '悲傷': 'bg-gray-400',
      '焦慮': 'bg-purple-400',
      '感恩': 'bg-green-400',
    };
    return mood ? moodColors[mood] || 'bg-pink-400' : 'bg-gray-300';
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-hand font-bold text-ink dark:text-chalk flex items-center gap-2">
          <Calendar size={28} />
          日曆視圖
        </h2>
        <div className="flex items-center gap-2">
          <SketchButton onClick={goToPreviousMonth} variant="ghost" className="!p-2">
            <ChevronLeft size={20} />
          </SketchButton>
          <span className="text-lg font-hand font-bold text-ink dark:text-chalk min-w-[140px] text-center">
            {format(currentMonth, 'yyyy年 M月', { locale: zhTW })}
          </span>
          <SketchButton onClick={goToNextMonth} variant="ghost" className="!p-2">
            <ChevronRight size={20} />
          </SketchButton>
          <SketchButton onClick={goToToday} variant="secondary" className="!py-1 ml-2">
            今天
          </SketchButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center font-hand font-bold text-ink dark:text-chalk p-2">
            {day}
          </div>
        ))}

        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const postsOnDate = postsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => postsOnDate.length > 0 && onDateClick(day, postsOnDate)}
              className={`
                min-h-[80px] p-2 border border-ink/20 dark:border-chalk/20 rounded
                ${isCurrentMonth ? 'bg-white dark:bg-zinc-700' : 'bg-gray-100 dark:bg-zinc-900'}
                ${isToday ? 'ring-2 ring-pencil-blue' : ''}
                ${postsOnDate.length > 0 ? 'cursor-pointer hover:bg-yellow-50 dark:hover:bg-zinc-600' : ''}
                transition-all
              `}
            >
              <div className={`text-sm font-hand mb-1 ${isToday ? 'font-bold text-pencil-blue' : 'text-ink dark:text-chalk'}`}>
                {format(day, 'd')}
              </div>
              {postsOnDate.length > 0 && (
                <div className="space-y-1">
                  {postsOnDate.slice(0, 2).map(post => (
                    <div
                      key={post.id}
                      className={`text-xs p-1 rounded ${getMoodColor(post.mood)} text-white truncate`}
                      title={post.title}
                    >
                      {post.title}
                    </div>
                  ))}
                  {postsOnDate.length > 2 && (
                    <div className="text-xs text-center text-ink/60 dark:text-chalk/60">
                      +{postsOnDate.length - 2} 篇
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
