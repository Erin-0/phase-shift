import React, { useEffect, useState } from 'react';

const LoadingScreen: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + Math.random() * 15;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center p-6">
            <div className="relative mb-12">
                <h1 className="text-4xl md:text-6xl font-orbitron font-black text-white italic tracking-widest animate-pulse">
                    PHASE <span className="text-[#00f2ff]">SHIFT</span>
                </h1>
                <div className="absolute -inset-1 bg-[#00f2ff] opacity-20 blur-xl animate-pulse"></div>
            </div>

            <div className="w-full max-w-md">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[#00f2ff] font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
                        Establishing Neural Link...
                    </span>
                    <span className="text-white font-mono text-lg">{Math.floor(progress)}%</span>
                </div>

                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                    <div
                        className="h-full bg-[#00f2ff] shadow-[0_0_15px_#00f2ff] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                    {/* Glitch effect on bar */}
                    <div
                        className="absolute top-0 h-full w-4 bg-white/50 blur-sm animate-glitch-slide"
                        style={{ left: `${progress - 5}%` }}
                    />
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="h-1 bg-white/5 animate-pulse delay-75"></div>
                    <div className="h-1 bg-white/5 animate-pulse delay-150"></div>
                    <div className="h-1 bg-white/5 animate-pulse delay-300"></div>
                    <div className="h-1 bg-white/5 animate-pulse delay-500"></div>
                </div>
            </div>

            <div className="absolute bottom-10 font-mono text-[10px] text-gray-700 uppercase tracking-[0.5em]">
                System Version 2.0.4 // Grid_Safe: Active
            </div>

            <style>{`
        @keyframes glitch-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(500%); }
        }
        .animate-glitch-slide {
            animation: glitch-slide 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
