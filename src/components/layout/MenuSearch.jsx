import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';

/**
 * Underline search field (spec §3.3). Never autofocused — on mobile the keyboard
 * would cover the menu.
 */
export default function MenuSearch({ stagger, onNavigate }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    const query = value.trim();
    onNavigate?.();
    setValue('');
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop', { replace: true });
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className="menu-item px-6 py-4 md:px-8"
      style={{ '--i': stagger }}
    >
      <label htmlFor="menu-search" className="sr-only">
        Search products
      </label>
      <div className="flex items-center gap-3 border-b border-white/30 focus-within:border-volt">
        <input
          id="menu-search"
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="SEARCH PRODUCTS"
          enterKeyHint="search"
          autoComplete="off"
          className="h-11 w-full min-w-0 bg-transparent font-sans text-base font-medium uppercase tracking-label text-paper placeholder:text-white/50 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-paper hover:text-volt"
        >
          <Icon name="search" size={22} />
        </button>
      </div>
    </form>
  );
}
