import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthProps {
    onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [photoBase64, setPhotoBase64] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Image too large (Max 2MB)");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if too big (max 300x300 for avatar)
                    const MAX_SIZE = 300;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7 quality to ensure small size
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setPhotoBase64(dataUrl);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const mapAuthError = (code: string) => {
        switch (code) {
            case 'auth/email-already-in-use': return 'هذا البريد الإلكتروني مستخدم بالفعل.';
            case 'auth/invalid-email': return 'البريد الإلكتروني غير صحيح.';
            case 'auth/operation-not-allowed': return 'هذه العملية غير مسموح بها حالياً.';
            case 'auth/weak-password': return 'كلمة المرور ضعيفة جداً.';
            case 'auth/user-disabled': return 'تم تعطيل هذا الحساب.';
            case 'auth/user-not-found': return 'لا يوجد حساب بهذا البريد.';
            case 'auth/wrong-password': return 'كلمة المرور غير صحيحة.';
            case 'auth/invalid-credential': return 'بيانات الدخول غير صحيحة.';
            case 'auth/too-many-requests': return 'محاولات كثيرة جداً. حاول لاحقاً.';
            default: return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userAuth;
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                userAuth = userCredential.user;
            } else {
                if (!username.trim()) throw new Error('رجاء إدخال اسم المستخدم');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                userAuth = userCredential.user;
                await updateProfile(userAuth, { displayName: username });
            }

            // Fetch or Create User Document
            const docRef = doc(db, 'users', userAuth.uid);
            const docSnap = await getDoc(docRef);

            let userData: UserProfile;

            if (docSnap.exists()) {
                userData = docSnap.data() as UserProfile;
            } else {
                const initialData: UserProfile = {
                    uid: userAuth.uid,
                    username: username || userAuth.displayName || 'Operator',
                    email: userAuth.email || '',
                    photoBase64: photoBase64 || undefined,
                    highScore: 0,
                    stars: 0,
                    ownedThemes: ['classic'],
                    activeThemeId: 'classic',
                    missions: [],
                    lastLogin: new Date().toISOString()
                };

                const localScore = parseInt(localStorage.getItem('ps-highscore') || '0');
                const localStars = parseInt(localStorage.getItem('ps-stars') || '0');
                if (localScore > 0) {
                    initialData.highScore = localScore;
                    initialData.stars = localStars;
                }

                await setDoc(docRef, initialData);
                userData = initialData;

                localStorage.removeItem('ps-highscore');
                localStorage.removeItem('ps-stars');
            }

            onLogin(userData);

        } catch (err: any) {
            setError(mapAuthError(err.code) || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#111] border border-[#00f2ff] p-8 rounded-lg shadow-[0_0_50px_rgba(0,242,255,0.2)]">
                <h2 className="text-3xl font-orbitron font-bold text-center mb-6 text-white">
                    {isLogin ? 'SYSTEM LOGIN' : 'NEW OPERATOR'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm font-mono">
                        ERROR: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[#00f2ff] font-mono text-xs uppercase">Operator Name</label>
                            <input
                                type="text"
                                required
                                className="bg-black border border-gray-700 p-3 text-white focus:border-[#00f2ff] outline-none font-orbitron"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />

                            <label className="text-[#00f2ff] font-mono text-xs uppercase mt-2">Avatar (Optional)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00f2ff] file:text-black hover:file:bg-[#00c2cf]"
                                />
                                {photoBase64 && (
                                    <img src={photoBase64} alt="Preview" className="w-10 h-10 rounded-full border border-[#00f2ff]" />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-[#00f2ff] font-mono text-xs uppercase">Email Frequency</label>
                        <input
                            type="email"
                            required
                            className="bg-black border border-gray-700 p-3 text-white focus:border-[#00f2ff] outline-none font-orbitron"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#00f2ff] font-mono text-xs uppercase">Access Key</label>
                        <input
                            type="password"
                            required
                            className="bg-black border border-gray-700 p-3 text-white focus:border-[#00f2ff] outline-none font-orbitron"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="mt-4 w-full py-4 bg-[#00f2ff] text-black font-bold font-orbitron text-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'CONNECTING...' : (isLogin ? 'ESTABLISH LINK' : 'INITIATE')}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-500 text-sm font-mono cursor-pointer hover:text-[#00f2ff]" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? '[ Create New Identity ]' : '[ Access Existing Link ]'}
                </p>
            </div>
        </div>
    );
};

export default Auth;
 
