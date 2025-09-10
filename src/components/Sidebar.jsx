"use client";
import { useTheme } from "@/contexts/ThemeContext";

export default function Sidebar({ isOpen, onClose }) {
  const { theme } = useTheme();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          backgroundColor: 'var(--background)',
          fontFamily: "'Doto', system-ui, sans-serif"
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold" style={{ 
              color: 'var(--foreground)',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                style={{ 
                  color: 'var(--foreground)',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            <a
              href="#"
              className="block px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ 
                color: 'var(--foreground)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                '--hover-bg-light': '#f3f4f6',
                '--hover-bg-dark': '#1f2937'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.target.style.backgroundColor = isDark ? '#1f2937' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Home
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ 
                color: 'var(--foreground)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                '--hover-bg-light': '#f3f4f6',
                '--hover-bg-dark': '#1f2937'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.target.style.backgroundColor = isDark ? '#1f2937' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              About
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ 
                color: 'var(--foreground)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                '--hover-bg-light': '#f3f4f6',
                '--hover-bg-dark': '#1f2937'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.target.style.backgroundColor = isDark ? '#1f2937' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Projects
            </a>
            <a
              href="#"
              className="block px-4 py-2 rounded-lg transition-colors font-medium"
              style={{ 
                color: 'var(--foreground)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                '--hover-bg-light': '#f3f4f6',
                '--hover-bg-dark': '#1f2937'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.target.style.backgroundColor = isDark ? '#1f2937' : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
