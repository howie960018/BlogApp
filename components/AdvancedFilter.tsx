import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { SketchButton } from './SketchButton';

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  moods: string[];
  tags: string[];
  searchText: string;
}

interface AdvancedFilterProps {
  availableMoods: string[];
  availableTags: string[];
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  availableMoods,
  availableTags,
  onFilterChange,
  initialFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    moods: [],
    tags: [],
    searchText: ''
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleMood = (mood: string) => {
    const moods = filters.moods.includes(mood)
      ? filters.moods.filter(m => m !== mood)
      : [...filters.moods, mood];
    handleFilterChange({ moods });
  };

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange({ tags });
  };

  const clearFilters = () => {
    const cleared: FilterOptions = { moods: [], tags: [], searchText: '' };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.moods.length > 0 ||
                          filters.tags.length > 0 ||
                          filters.searchText !== '' ||
                          filters.dateFrom ||
                          filters.dateTo;

  return (
    <div className="mb-6">
      <div className="flex gap-2 items-center mb-4">
        <SketchButton
          onClick={() => setIsOpen(!isOpen)}
          icon={<Filter size={18} />}
          variant={hasActiveFilters ? 'primary' : 'secondary'}
        >
          進階篩選
          {hasActiveFilters && (
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
              {filters.moods.length + filters.tags.length + (filters.searchText ? 1 : 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)}
            </span>
          )}
        </SketchButton>

        {hasActiveFilters && (
          <SketchButton onClick={clearFilters} variant="ghost" className="!p-2">
            <X size={18} />
          </SketchButton>
        )}
      </div>

      {isOpen && (
        <div className="bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk border-dashed rounded-lg p-6 shadow-sketch space-y-6">
          {/* 搜尋文字 */}
          <div>
            <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
              搜尋關鍵字
            </label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => handleFilterChange({ searchText: e.target.value })}
              placeholder="搜尋標題或內容..."
              className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-700 text-ink dark:text-chalk focus:outline-none focus:ring-2 focus:ring-pencil-blue"
            />
          </div>

          {/* 日期範圍 */}
          <div>
            <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
              日期範圍
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-hand text-ink/60 dark:text-chalk/60 mb-1">
                  從
                </label>
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange({ dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-700 text-ink dark:text-chalk"
                />
              </div>
              <div>
                <label className="block text-sm font-hand text-ink/60 dark:text-chalk/60 mb-1">
                  到
                </label>
                <input
                  type="date"
                  value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange({ dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border-2 border-ink dark:border-chalk rounded font-hand bg-white dark:bg-zinc-700 text-ink dark:text-chalk"
                />
              </div>
            </div>
          </div>

          {/* 心情篩選 */}
          {availableMoods.length > 0 && (
            <div>
              <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
                心情
              </label>
              <div className="flex flex-wrap gap-2">
                {availableMoods.map(mood => (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={`px-4 py-2 rounded-lg border-2 border-ink dark:border-chalk font-hand transition-all ${
                      filters.moods.includes(mood)
                        ? 'bg-pencil-yellow shadow-[3px_3px_0px_0px_currentColor] text-ink dark:text-chalk'
                        : 'bg-white dark:bg-zinc-700 text-ink/60 dark:text-chalk/60 hover:bg-gray-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 標籤篩選 */}
          {availableTags.length > 0 && (
            <div>
              <label className="block font-hand font-bold text-ink dark:text-chalk mb-2">
                標籤
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-lg border-2 border-ink dark:border-chalk font-hand transition-all ${
                      filters.tags.includes(tag)
                        ? 'bg-pencil-blue shadow-[3px_3px_0px_0px_currentColor] text-ink dark:text-white'
                        : 'bg-white dark:bg-zinc-700 text-ink/60 dark:text-chalk/60 hover:bg-gray-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
