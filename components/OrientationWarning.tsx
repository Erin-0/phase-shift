import React, { useEffect, useState } from 'react';

const OrientationWarning: React.FC = () => {
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
        };

        window.addEventListener('resize', checkOrientation);
        checkOrientation();
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    if (!isPortrait) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-32 border-4 border-[#00f2ff] rounded-xl mb-8 animate-bounce flex items-center justify-center">
                <div className="w-1 h-8 bg-[#00f2ff]/30 rounded-full"></div>
            </div>
            <h2 className="text-[#00f2ff] font-orbitron font-bold text-2xl mb-4">ROTATE DEVICE</h2>
            <p className="text-gray-400 font-mono text-sm uppercase tracking-widest leading-relaxed">
                Neural sync requires horizontal alignment for optimal reaction velocity.
            </p>

            {/* Glitch Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
    );
};

export default OrientationWarning;
