/**
 * LoginPage — Module 2.4 finalization.
 *
 * Adds over Module 2.3 version:
 *   - Client-side field validation (validationUtils.validateLoginForm)
 *   - Per-field error messages, aria-invalid / aria-describedby
 *   - Show/Hide password toggle
 *   - Demo credentials helper section (mock mode)
 *   - Autofocus on email field on mount
 *
 * Reads location.state.from (set by ProtectedRoute) and redirects there
 * after a successful login; AppRouter's LoginRoute also redirects
 * authenticated users away from /login automatically.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@constants/routes';
import { validateLoginForm } from '@utils/validationUtils';

const DEMO_ACCOUNTS = [
  { label: 'Admin',            email: 'admin@aaro.com' },
  { label: 'Training Manager', email: 'manager@aaro.com' },
  { label: 'Trainer',          email: 'trainer@aaro.com' },
];

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5" aria-hidden="true">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.22-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Restore intended destination (set by ProtectedRoute on redirect)
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateLoginForm(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Server/auth error surfaced via useAuth's `error` state; stay on page.
    }
  };

  const handleDemoFill = (demoEmail) => {
    clearError();
    setFieldErrors({});
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-lg shadow-card border border-border p-8">
          {/* Logo / Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-primary text-center">
              Trainer Session Attendance Dashboard
            </h1>
            <p className="site-name text-sm font-medium text-accent mt-0.5 text-center tracking-wide">
              Aaro
            </p>
            <p className="text-sm text-textMuted mt-1 text-center">
              Naan Mudhalvan Internship — Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1.5">
                Email
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={loading}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                onChange={(e) => {
                  clearError();
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  setEmail(e.target.value);
                }}
                placeholder="admin@aaro.com"
                className={`w-full px-3 py-2.5 text-sm border rounded-md placeholder:text-textMuted
                  focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                  transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                  ${fieldErrors.email ? 'border-red-400' : 'border-border'}`}
              />
              {fieldErrors.email && (
                <p id="email-error" role="alert" className="text-xs text-danger-DEFAULT mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  disabled={loading}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  onChange={(e) => {
                    clearError();
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    setPassword(e.target.value);
                  }}
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-md placeholder:text-textMuted
                    focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                    transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                    ${fieldErrors.password ? 'border-red-400' : 'border-border'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md
                    text-textMuted hover:text-textPrimary hover:bg-neutral-100
                    transition-colors outline-none focus-visible:ring-2
                    focus-visible:ring-accent disabled:cursor-not-allowed"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="text-xs text-danger-DEFAULT mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Auth error (server-side / invalid credentials) */}
            {error && (
              <p role="alert" className="text-sm text-danger-DEFAULT bg-danger-bg px-3 py-2 rounded-md border border-danger-border">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent text-white text-sm font-medium rounded-md
                hover:bg-accent-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors focus:outline-none focus-visible:ring-2
                focus-visible:ring-accent focus-visible:ring-offset-2 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-surface rounded-lg border border-border p-4">
          <p className="text-xs font-medium text-textPrimary mb-2">Demo accounts (mock mode)</p>
          <p className="text-xs text-textMuted mb-3">
            Any password is accepted in mock mode. Tap an account to autofill.
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoFill(acc.email)}
                disabled={loading}
                className="flex items-center justify-between px-3 py-2 text-xs rounded-md
                  border border-border hover:bg-neutral-50 transition-colors text-left
                  outline-none focus-visible:ring-2 focus-visible:ring-accent
                  disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="font-medium text-textPrimary">{acc.label}</span>
                <span className="text-textMuted">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-textMuted text-center mt-6">
          © {new Date().getFullYear()} Aaro — Trainer Session Attendance Dashboard · Naan Mudhalvan Internship
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
