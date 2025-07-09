'use client';

export default function ScheduledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="glass-card w-full max-w-xl mx-auto p-10 flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-2 rounded-full shadow-lg animate-pulse mb-2">
            {/* Animated calendar icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#calendar-gradient)" />
              <rect x="10" y="14" width="20" height="14" rx="3" fill="#fff" fillOpacity="0.15" stroke="#fff" strokeWidth="2"/>
              <rect x="14" y="18" width="4" height="4" rx="1" fill="#fff" fillOpacity="0.5"/>
              <rect x="22" y="18" width="4" height="4" rx="1" fill="#fff" fillOpacity="0.5"/>
              <defs>
                <linearGradient id="calendar-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#A21CAF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow tracking-tight text-center">Scheduled Payments</h1>
          <p className="text-purple-200 mt-2 text-center max-w-xs">Automate your recurring payments and never miss a due date.</p>
        </div>
        <div className="flex flex-col items-center mt-8">
          <div className="w-24 h-24 rounded-full border-4 border-accent animate-spin mb-4"></div>
          <p className="text-gray-400 text-center">Scheduled payments feature coming soon!</p>
        </div>
      </main>
    </div>
  );
} 