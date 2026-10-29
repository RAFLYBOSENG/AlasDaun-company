import { useState, useEffect, useCallback } from 'react';
import { Lock, LogOut, Leaf, ArrowLeft, Phone, Users, Calendar, Clock, MapPin, StickyNote, Loader2 } from 'lucide-react';
import { supabase, fetchReservations, type Reservation } from '../lib/supabase';
import { useLang } from '../lib/LanguageContext';

export function Admin() {
  const { lang, dict } = useLang();
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [list, setList] = useState<Reservation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const load = useCallback(async () => {
    setLoadingList(true);
    setLoadError(null);
    const { data, error } = await fetchReservations();
    setLoadingList(false);
    if (error) setLoadError(error);
    else setList(data || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(!!s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const goHome = () => { window.location.hash = ''; window.location.href = '/'; };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setEmail(''); setPassword('');
  };

  // Loading state
  if (session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-krem-50">
        <Loader2 className="h-8 w-8 animate-spin text-daun-500" />
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-krem-50 px-6 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-daun-500 text-krem-100">
              <Leaf size={26} />
            </span>
            <h1 className="font-heading text-2xl font-bold text-daun-600">{dict.admin.title}</h1>
            <p className="mt-1 font-body text-sm text-daun-500">
              {mode === 'login' ? dict.admin.login : dict.admin.login}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-body text-sm font-medium text-daun-700">{dict.admin.email}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-daun-200 bg-white px-4 py-3 font-body text-sm text-daun-700 outline-none transition focus:border-daun-500 focus:ring-2 focus:ring-daun-200"
                  placeholder="admin@alasdaun.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-body text-sm font-medium text-daun-700">{dict.admin.password}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-daun-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-daun-200 bg-white px-4 py-3 pl-11 font-body text-sm text-daun-700 outline-none transition focus:border-daun-500 focus:ring-2 focus:ring-daun-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {authError && <p className="rounded-lg bg-red-50 px-4 py-2 font-body text-sm text-red-600">{authError}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === 'login' ? dict.admin.login : dict.admin.login}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode((m) => (m === 'login' ? 'signup' : 'login')); setAuthError(null); }}
              className="font-body text-sm text-daun-600 transition hover:text-oranye-500"
            >
              {mode === 'login'
                ? (lang === 'id' ? 'Belum punya akun? Daftar di sini' : 'No account? Sign up here')
                : (lang === 'id' ? 'Sudah punya akun? Masuk' : 'Already have an account? Sign in')}
            </button>
          </div>

          <button onClick={goHome} className="mt-6 flex w-full items-center justify-center gap-2 font-body text-sm text-daun-500 transition hover:text-daun-700">
            <ArrowLeft size={16} /> {dict.admin.back}
          </button>
        </div>
      </div>
    );
  }

  // Signed in — reservations list
  return (
    <div className="min-h-screen bg-krem-50">
      <header className="sticky top-0 z-10 border-b border-daun-100 bg-krem-100/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-daun-500 text-krem-100">
              <Leaf size={18} />
            </span>
            <h1 className="font-heading text-lg font-bold text-daun-600">{dict.admin.list}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="font-body text-sm text-daun-600 transition hover:text-daun-700">
              {dict.admin.back}
            </button>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full bg-daun-500 px-4 py-2 font-body text-sm font-medium text-krem-100 transition hover:bg-daun-600">
              <LogOut size={15} /> {dict.admin.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loadingList ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-daun-500" />
          </div>
        ) : loadError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-600">{loadError}</p>
        ) : list.length === 0 ? (
          <p className="py-20 text-center font-body text-daun-500">{dict.admin.empty}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <article key={r.id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-daun-700">{r.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 font-body text-xs font-semibold ${
                    r.status === 'confirmed' ? 'bg-green-100 text-green-700'
                    : r.status === 'cancelled' ? 'bg-red-100 text-red-700'
                    : 'bg-oranye-100 text-oranye-700'
                  }`}>
                    {r.status || 'pending'}
                  </span>
                </div>
                <ul className="space-y-1.5 font-body text-sm text-daun-700/80">
                  <li className="flex items-center gap-2"><Phone size={14} className="text-daun-400" /> {r.phone}</li>
                  <li className="flex items-center gap-2"><Calendar size={14} className="text-daun-400" /> {r.date}</li>
                  <li className="flex items-center gap-2"><Clock size={14} className="text-daun-400" /> {r.time}</li>
                  <li className="flex items-center gap-2"><Users size={14} className="text-daun-400" /> {r.guests} {dict.admin.guests.toLowerCase()}</li>
                  {r.area && <li className="flex items-center gap-2"><MapPin size={14} className="text-daun-400" /> {r.area}</li>}
                  {r.notes && <li className="flex items-start gap-2"><StickyNote size={14} className="mt-0.5 text-daun-400" /> <span className="italic">{r.notes}</span></li>}
                </ul>
                {r.created_at && (
                  <p className="mt-3 border-t border-daun-50 pt-2 font-body text-xs text-daun-400">
                    {dict.admin.created}: {new Date(r.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
