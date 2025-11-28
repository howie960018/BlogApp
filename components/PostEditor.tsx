import React, { useState, useRef } from 'react';
import { BlogPost, BlogPostInput } from '../types';
import { SketchButton } from './SketchButton';
import { ArrowLeft, Wand2, Save, RefreshCw, Upload, X, FolderOpen } from 'lucide-react';
import { analyzeJournalEntry } from '../services/geminiService';

interface PostEditorProps {
  initialData?: BlogPost;
  onSave: (post: BlogPostInput) => void;
  onCancel: () => void;
}

const PREDEFINED_CATEGORIES = ["日常生活", "心情隨筆", "旅遊", "美食", "工作/學習", "靈感"];

export const PostEditor: React.FC<PostEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [mood, setMood] = useState(initialData?.mood || '');
  const [category, setCategory] = useState(initialData?.category || '日常生活');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [summary, setSummary] = useState(initialData?.aiSummary || '');
  const [colorTheme, setColorTheme] = useState<BlogPost['colorTheme']>(initialData?.colorTheme || 'yellow');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeJournalEntry(content);
      setMood(result.mood);
      setSummary(result.summary);
      // Merge new tags with existing ones, unique only
      setTags(prev => Array.from(new Set([...prev, ...result.tags])));
    } catch (e) {
      alert("AI 分析失敗，請稍後再試。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Explicitly cast to File[] so TypeScript knows elements are Blobs
    const fileList = Array.from(files) as File[];
    
    // Limit total images to avoid localstorage quota issues
    if (images.length + fileList.length > 4) {
      alert("最多只能上傳 4 張照片喔！");
      return;
    }

    const promises = fileList.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      setImages(prev => [...prev, ...base64Images]);
    }).catch(err => console.error("Image upload error", err));
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      tags,
      mood,
      category,
      images,
      aiSummary: summary,
      colorTheme
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center text-ink dark:text-chalk hover:underline font-hand text-lg"
        >
          <ArrowLeft size={20} className="mr-1" /> 返回手帳列表
        </button>
        <h2 className="text-3xl font-bold font-hand text-ink dark:text-chalk">
          {initialData ? '編輯日記' : '寫新日記'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-2xl border-2 border-ink dark:border-chalk shadow-sketch relative transition-colors">
        {/* Paper holes decoration */}
        <div className="hidden md:flex flex-col gap-8 absolute -left-4 top-12">
           {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-paper dark:bg-zinc-900 border-2 border-ink dark:border-chalk shadow-inner"></div>)}
        </div>

        <div className="mb-4 space-y-2">
          <label className="block font-hand text-xl font-bold text-ink dark:text-chalk">標題</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 font-hand text-xl bg-transparent border-2 border-ink dark:border-chalk rounded-lg focus:outline-none focus:ring-4 focus:ring-pencil-yellow/50 border-dashed text-ink dark:text-chalk placeholder-gray-400"
            placeholder="今天發生了什麼有趣的事？"
            required
          />
        </div>

        <div className="mb-4 space-y-2">
          <label className="block font-hand text-xl font-bold text-ink dark:text-chalk">內容</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 h-64 font-hand text-lg bg-transparent border-2 border-ink dark:border-chalk rounded-lg focus:outline-none focus:ring-4 focus:ring-pencil-yellow/50 leading-loose resize-y text-ink dark:text-chalk"
            placeholder="親愛的日記..."
            style={{
              backgroundImage: 'linear-gradient(transparent, transparent 29px, #e5e7eb 30px)',
              backgroundSize: '100% 30px',
              lineHeight: '30px'
            }}
            required
          />
        </div>

        {/* Image Upload Section */}
        <div className="mb-6">
           <label className="block font-hand text-lg font-bold text-ink dark:text-chalk mb-2">照片 (最多4張)</label>
           <div className="flex flex-wrap gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 border-2 border-ink dark:border-chalk rounded-lg overflow-hidden group">
                   <img src={img} alt="upload" className="w-full h-full object-cover" />
                   <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-pencil-red text-white rounded-full p-1 opacity-80 hover:opacity-100"
                   >
                     <X size={12} />
                   </button>
                </div>
              ))}
              {images.length < 4 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-ink dark:border-chalk/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-ink/50 dark:text-chalk/50"
                >
                   <Upload size={24} />
                   <span className="text-xs font-hand">上傳照片</span>
                </div>
              )}
           </div>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageUpload} 
             className="hidden" 
             accept="image/*" 
             multiple
           />
        </div>

        {/* AI Toolbar */}
        <div className="mb-6 p-4 bg-paper dark:bg-zinc-700/50 rounded-xl border-2 border-ink dark:border-chalk border-dashed flex flex-wrap items-center gap-4">
          <div className="flex-1">
             <h4 className="font-hand font-bold text-lg mb-1 flex items-center gap-2 text-ink dark:text-chalk">
               <Wand2 size={18} className="text-purple-500"/> AI 魔法助手
             </h4>
             <p className="text-sm font-hand text-gray-600 dark:text-gray-300">
               自動幫你生成心情、摘要和標籤。
             </p>
          </div>
          <SketchButton 
            type="button" 
            variant="secondary" 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !content}
            icon={isAnalyzing ? <RefreshCw className="animate-spin" /> : <Wand2 />}
            title="點擊讓 AI 分析你的日記"
          >
            {isAnalyzing ? '思考中...' : 'AI 分析'}
          </SketchButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="block font-hand text-lg font-bold text-ink dark:text-chalk">分類</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 font-hand border-2 border-ink dark:border-chalk rounded-lg appearance-none bg-transparent text-ink dark:text-chalk"
              >
                {PREDEFINED_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="text-ink bg-white">{cat}</option>
                ))}
                <option value="其他" className="text-ink bg-white">其他</option>
              </select>
              <FolderOpen size={18} className="absolute right-3 top-3 pointer-events-none text-ink/50 dark:text-chalk/50" />
            </div>
            {/* If user selects "Other", you could toggle a text input here, but keeping it simple for now */}
          </div>

          <div className="space-y-2">
             <label className="block font-hand text-lg font-bold text-ink dark:text-chalk">心情</label>
             <input 
              type="text" 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-2 font-hand border-2 border-ink dark:border-chalk rounded-lg bg-transparent text-ink dark:text-chalk"
              placeholder="例如：開心 😊"
             />
          </div>
        </div>

        <div className="mb-6 space-y-2">
             <label className="block font-hand text-lg font-bold text-ink dark:text-chalk">標籤 (用逗號分隔)</label>
             <input 
              type="text" 
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              className="w-full p-2 font-hand border-2 border-ink dark:border-chalk rounded-lg bg-transparent text-ink dark:text-chalk"
              placeholder="生活, 靈感, 隨筆"
             />
        </div>

        <div className="mb-6 space-y-2">
          <label className="block font-hand text-lg font-bold text-ink dark:text-chalk">主題顏色</label>
          <div className="flex gap-3">
            {(['red', 'blue', 'green', 'yellow', 'purple'] as const).map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setColorTheme(color)}
                className={`w-10 h-10 rounded-full border-2 border-ink dark:border-chalk transition-transform hover:scale-110 ${
                  colorTheme === color ? 'ring-2 ring-offset-2 ring-ink dark:ring-chalk scale-110' : ''
                }`}
                style={{ backgroundColor: `var(--color-pencil-${color})` }}
                title={`選擇 ${color} 主題色`}
              >
                <span className={`block w-full h-full rounded-full bg-pencil-${color}`}></span>
              </button>
            ))}
          </div>
        </div>

        {summary && (
          <div className="mb-6 p-4 bg-pencil-yellow/20 dark:bg-yellow-900/30 rounded-xl border-2 border-ink dark:border-chalk">
            <h4 className="font-hand font-bold mb-1 text-ink dark:text-chalk">AI 摘要:</h4>
            <p className="font-hand italic text-ink dark:text-chalk">{summary}</p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
           <SketchButton type="button" variant="ghost" onClick={onCancel}>
             取消
           </SketchButton>
           <SketchButton type="submit" variant="primary" icon={<Save size={18} />}>
             儲存日記
           </SketchButton>
        </div>

      </form>
    </div>
  );
};