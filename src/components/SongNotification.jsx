"use client";
import { useEffect, useState } from "react";

export default function SongNotification({ songName, isVisible, onClose, status = "nowPlaying" }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-dismiss only when not loading
      if (status !== "loading") {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onClose, 300); // Wait for animation to finish
        }, 3000); // Show for 3 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, onClose, status]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-out ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="backdrop-blur-xl bg-black/20 dark:bg-white/10 rounded-2xl p-4 shadow-2xl border border-white/20 dark:border-black/20"
        style={{
          minWidth: '280px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Music Note Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--foreground)' }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          
          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium opacity-70 flex items-center gap-2"
              style={{ color: 'var(--foreground)' }}
            >
              {status === 'loading' ? (
                <>
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  LOADING...
                </>
              ) : (
                'NOW PLAYING'
              )}
            </p>
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--foreground)' }}
            >
              {songName}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--foreground)', opacity: 0.7 }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
