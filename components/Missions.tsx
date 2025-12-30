import React from 'react';
import { Mission } from '../types';

interface MissionsProps {
    missions: Mission[];
    onClose: () => void;
    onClaim: (missionId: string) => void;
}

const Missions: React.FC<MissionsProps> = ({ missions, onClose, onClaim }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#00ff88] p-6 relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-[#00ff88] font-mono text-xl hover:text-white" onClick={onClose}>[X]</button>

                <h2 className="text-3xl font-orbitron font-bold text-center mb-2 text-[#00ff88] tracking-widest">
                    DAILY TASKS
                </h2>
                <p className="text-center font-mono text-xs text-gray-400 mb-6 uppercase">Sync rewards reset every 24h</p>

                <div className="flex flex-col gap-3">
                    {missions.map(mission => (
                        <div key={mission.id} className={`p-4 border ${mission.completed ? 'border-gray-800 bg-gray-900/50' : 'border-[#00ff88]/30 bg-[#00ff88]/5'} transition-all`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`font-orbitron text-sm md:text-base ${mission.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {mission.description}
                                </h3>
                                <span className="text-[#ffd700] text-xs font-bold font-mono">+{mission.reward}★</span>
                            </div>

                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${mission.completed ? 'bg-gray-600' : 'bg-[#00ff88]'}`}
                                    style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-gray-500 font-mono">{mission.progress} / {mission.target}</span>
                                {mission.progress >= mission.target && !mission.completed && (
                                    <button
                                        onClick={() => onClaim(mission.id)}
                                        className="px-3 py-1 bg-[#00ff88] text-black text-[10px] font-bold font-orbitron uppercase tracking-widest hover:bg-white animate-pulse"
                                    >
                                        Claim
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Missions;
