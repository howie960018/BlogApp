import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Link, Check } from 'lucide-react';
import { BlogPost } from '../types';
import { SketchButton } from './SketchButton';

interface ShareButtonProps {
  post: BlogPost;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ post }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${post.title} - 手繪風手帳`;
  const shareText = post.aiSummary || post.content.substring(0, 100);

  const handleShare = async (platform: 'facebook' | 'twitter' | 'line' | 'copy') => {
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'line':
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
    }
    setShowMenu(false);
  };

  // 使用 Web Share API (如果可用)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="relative">
      <SketchButton
        onClick={handleNativeShare}
        variant="secondary"
        icon={<Share2 size={18} />}
        className="!py-1"
      >
        分享
      </SketchButton>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-paper dark:bg-zinc-800 border-2 border-ink dark:border-chalk rounded-lg shadow-sketch z-50 overflow-hidden">
            <button
              onClick={() => handleShare('facebook')}
              className="w-full px-4 py-3 text-left font-hand text-ink dark:text-chalk hover:bg-blue-50 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
            >
              <Facebook size={18} />
              Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="w-full px-4 py-3 text-left font-hand text-ink dark:text-chalk hover:bg-blue-50 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors border-t border-ink/10 dark:border-chalk/10"
            >
              <Twitter size={18} />
              Twitter
            </button>
            <button
              onClick={() => handleShare('line')}
              className="w-full px-4 py-3 text-left font-hand text-ink dark:text-chalk hover:bg-green-50 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors border-t border-ink/10 dark:border-chalk/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-full px-4 py-3 text-left font-hand text-ink dark:text-chalk hover:bg-gray-50 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors border-t border-ink/10 dark:border-chalk/10"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Link size={18} />}
              {copied ? '已複製!' : '複製連結'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
