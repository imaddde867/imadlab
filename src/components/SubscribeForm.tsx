import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';

type State = 'idle' | 'sending' | 'done' | 'exists' | 'error';

const messages: Record<Exclude<State, 'idle' | 'sending'>, string> = {
  done: "Subscribed. You'll get an email when something new goes up.",
  exists: 'That address is already subscribed.',
  error: 'Something went wrong. Please try again.',
};

// Quiet newsletter signup. Anonymous inserts are allowed by RLS; status and the
// unsubscribe token come from column defaults.
const SubscribeForm = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setState('sending');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: value });
    if (!error) {
      setState('done');
      setEmail('');
    } else {
      setState(error.code === '23505' ? 'exists' : 'error');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md">
      <label htmlFor="subscribe-email" className="text-[color:var(--nd-ink-2)]">
        Get an email when I publish a new post or project.
      </label>
      <div className="mt-3 flex items-end gap-4">
        <input
          id="subscribe-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== 'sending') setState('idle');
          }}
          placeholder="you@example.com"
          className="min-w-0 flex-1 border-b border-[color:var(--nd-line)] bg-transparent pb-1 text-[color:var(--nd-ink)] placeholder:text-[color:var(--nd-ink-3)] focus:border-[color:var(--nd-link)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="nd-link shrink-0 disabled:opacity-60"
        >
          {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-[1.25rem] text-sm text-[color:var(--nd-ink-3)]"
      >
        {state !== 'idle' && state !== 'sending' ? messages[state] : ''}
      </p>
    </form>
  );
};

export default SubscribeForm;
