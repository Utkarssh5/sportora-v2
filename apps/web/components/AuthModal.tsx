'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup';
type Role = 'PLAYER' | 'ORGANIZER';

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('PLAYER');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [organizationName, setOrganizationName] = useState('');
  const [governmentIdType, setGovernmentIdType] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function resetState() {
    setError('');
    setIsSuccess(false);
    setLoading(false);
  }

  function switchMode(nextMode: AuthMode) {
    resetState();
    setMode(nextMode);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'login'
          ? '/api/auth/login'
          : '/api/auth/signup';

      const body =
        mode === 'login'
          ? {
              email,
              password,
            }
          : {
              fullName,
              email,
              password,
              phone: phone || undefined,
              role,
              ...(role === 'ORGANIZER'
                ? {
                    organizationName,
                    governmentIdType,
                    governmentId,
                    documentUrl,
                    address,
                    city,
                    state,
                    pincode,
                  }
                : {}),
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            'Authentication failed',
        );
      }

      if (mode === 'signup') {
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          setMode('login');
          setPassword('');
          setError('');
        }, 1200);

        return;
      }

      const user: AuthUser | undefined = data.user;

      if (user) {
        localStorage.setItem(
          'sportoraUser',
          JSON.stringify(user),
        );

        window.dispatchEvent(
          new CustomEvent('sportora-auth-change', {
            detail: user,
          }),
        );
      }

      if (user?.role === 'ADMIN') {
        window.location.href = user.mustChangePassword
          ? '/admin/change-password'
          : '/admin';

        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#080B10]/90 backdrop-blur-2xl">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00FF66]/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            rotateX: -10,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
          }}
          className="relative w-full max-w-lg p-8 sm:p-10 text-left bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent rounded-[40px] border-l-4 border-t border-[#00FF66] shadow-[0_0_50px_rgba(0,255,102,0.15)] overflow-hidden"
        >

          <div className="absolute -top-1 -right-1 bg-[#00FF66] text-black font-black text-[10px] tracking-widest uppercase px-6 py-1.5 rounded-bl-2xl shadow-lg flex items-center gap-1">
            <Zap className="w-3 h-3 fill-black" />
            ARENA PASS ACCESS
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-white/5 rounded-full border border-white/10 hover:border-[#00FF66] transition-all z-20 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="text-center py-12 space-y-4">

              <motion.div
                initial={{
                  scale: 0.5,
                  rotate: -15,
                }}
                animate={{
                  scale: 1,
                  rotate: -3,
                }}
                className="w-20 h-20 bg-[#00FF66] text-black rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#00FF66]/30"
              >
                <ShieldCheck className="w-12 h-12" />
              </motion.div>

              <h3 className="text-3xl font-black text-white italic tracking-tight">
                {mode === 'login'
                  ? 'ACCESS GRANTED!'
                  : role === 'ORGANIZER'
                    ? 'ORGANIZER APPLICATION SUBMITTED!'
                    : 'PLAYER CREATED!'}
              </h3>

              <p className="text-xs text-[#00FF66] font-mono font-bold tracking-wider">
                • SPORTORA ARENA ACCESS CONFIRMED
              </p>

              {mode === 'signup' && (
                <p className="text-xs text-gray-400">
                  Your account is ready. Enter the arena with your credentials.
                </p>
              )}
            </div>
          ) : (
            <div>

              <div className="mb-8">
                <span className="text-[10px] font-mono font-black text-[#00FF66] tracking-[0.25em] uppercase block mb-1">
                  // OFFICIAL AUTHENTICATION GATEWAY
                </span>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                  {mode === 'login'
                    ? 'ENTER THE ARENA'
                    : 'JOIN THE LEAGUE'}
                </h2>

                <div className="flex bg-black/60 p-1.5 rounded-2xl mt-5 border border-white/10">

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    disabled={loading}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all italic ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-[#00FF66] to-emerald-400 text-black shadow-lg shadow-[#00FF66]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    LOGIN
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    disabled={loading}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all italic ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-[#00FF66] to-emerald-400 text-black shadow-lg shadow-[#00FF66]/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    REGISTER
                  </button>

                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-2">
                      CHOOSE ARENA ROLE
                    </label>

                    <div className="grid grid-cols-2 gap-2">

                      {(['PLAYER', 'ORGANIZER'] as const).map(
                        (r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            disabled={loading}
                            className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                              role === r
                                ? 'bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66] shadow-md shadow-[#00FF66]/10'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {r}
                          </button>
                        ),
                      )}

                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                        FULL NAME
                      </label>

                      <div className="relative">
                        <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />

                        <input
                          type="text"
                          required
                          minLength={3}
                          maxLength={50}
                          value={fullName}
                          onChange={(e) =>
                            setFullName(e.target.value)
                          }
                          placeholder="Utkarsh Tripathi"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                        PHONE NUMBER
                      </label>

                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />

                        <input
                          type="tel"
                          minLength={10}
                          maxLength={15}
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="9876543210"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {mode === 'signup' && role === 'ORGANIZER' && (
                  <div className="space-y-4 rounded-3xl border border-[#00FF66]/20 bg-[#00FF66]/5 p-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#00FF66]">
                        ORGANIZER VERIFICATION
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        These details are required before you can host tournaments.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                        ORGANIZATION / ORGANIZER NAME
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={150}
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Sportora Sports Academy"
                        disabled={loading}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                          ID PROOF TYPE
                        </label>
                        <select
                          required
                          value={governmentIdType}
                          onChange={(e) => setGovernmentIdType(e.target.value)}
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        >
                          <option value="">Select ID</option>
                          <option value="AADHAAR">Aadhaar</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                          <option value="VOTER_ID">Voter ID</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                          ID NUMBER
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={governmentId}
                          onChange={(e) => setGovernmentId(e.target.value)}
                          placeholder="Government ID number"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                        ID PROOF DOCUMENT URL
                      </label>
                      <input
                        type="url"
                        required
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        placeholder="https://..."
                        disabled={loading}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                      />
                      <p className="mt-1 text-[9px] text-gray-500">
                        Secure file upload will replace this field in the next step.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                        COMPLETE ADDRESS
                      </label>
                      <textarea
                        required
                        minLength={10}
                        maxLength={300}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House / office / organization address"
                        disabled={loading}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                          CITY
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Jaipur"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                          STATE
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Rajasthan"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                          PINCODE
                        </label>
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="302001"
                          disabled={loading}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                    EMAIL ADDRESS
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="player@sportora.com"
                      disabled={loading}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">
                    PASSCODE
                  </label>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />

                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={100}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-xs outline-none focus:border-[#00FF66] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#00FF66] to-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-6 shadow-lg shadow-[#00FF66]/30 disabled:opacity-50 italic"
                >
                  {loading
                    ? 'AUTHENTICATING...'
                    : mode === 'login'
                      ? 'ENTER THE HUB'
                      : 'CLAIM ARENA PASS'}

                  {!loading && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

              </form>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
