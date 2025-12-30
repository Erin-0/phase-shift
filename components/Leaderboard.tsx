import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

interface LeaderboardProps {
    onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const [leaders, setLeaders] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('highScore', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);
                const fetched: UserProfile[] = [];
                querySnapshot.forEach((doc) => {
                    fetched.push(doc.data() as UserProfile);
                });
                setLeaders(fetched);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#ff8c00] p-6 relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-[#ff8c00] font-mono text-xl hover:text-white" onClick={onClose}>[X]</button>

                <h2 className="text-3xl font-orbitron font-bold text-center mb-8 text-[#ff8c00] tracking-widest">
                    TOP OPERATORS
                </h2>

                {loading ? (
                    <div className="text-center font-mono text-[#ff8c00] animate-pulse">DOWNLOADING DATA...</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {leaders.map((user, idx) => (
                            <div key={user.uid} className="flex items-center justify-between p-3 bg-white/5 border-l-4 border-transparent hover:border-[#ff8c00] transition-all">
                                <div className="flex items-center gap-3">
                                    <span className={`font-orbitron font-bold text-xl w-8 ${idx < 3 ? 'text-[#ffd700]' : 'text-gray-500'}`}>
                                        #{idx + 1}
                                    </span>
                                    {user.photoBase64 ? (
                                        <img src={user.photoBase64} className="w-8 h-8 rounded-full border border-gray-600" alt="avatar" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-xs">
                                            {user.username.charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-mono text-sm md:text-base text-white">{user.username}</span>
                                </div>
                                <div className="font-orbitron font-bold text-[#00f2ff]">
                                    {user.highScore.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
