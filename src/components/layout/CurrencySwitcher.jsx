import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import RateNote from '../ui/RateNote';
import useCurrency from '../../hooks/useCurrency';
import useEscape from '../../hooks/useEscape';
import { currencyFor } from '../../lib/currency';

/**
 * Header currency control (spec §2).
 * Trigger shows `KSh KES`; the panel mirrors the account menu so the header keeps
 * one dropdown pattern. Selecting only changes display — checkout charges KES.
 */
export default function CurrencySwitcher() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;

  const [openFor, setOpenFor] = useState(null);
  const open = openFor === routeKey;

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedIndex = Math.max(
    0,
    availableCurrencies.findIndex((option) => option.code === currency),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const meta = currencyFor(currency);

  const close = useCallback((focusTrigger = false) => {
    setOpenFor(null);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setActiveIndex(selectedIndex);
    setOpenFor(routeKey);
  }, [routeKey, selectedIndex]);

  useEscape(open, () => close(true));

  // Any pointer press outside the control closes it.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpenFor(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Move focus onto the active row so the listbox works without a mouse.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const choose = (code) => {
    setCurrency(code);
    close(true);
  };

  const onTriggerKeyDown = (event) => {
    if (open) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu();
    }
  };

  const onMenuKeyDown = (event) => {
    const last = availableCurrencies.length - 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index >= last ? 0 : index + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? last : index - 1));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(last);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = availableCurrencies[activeIndex];
      if (option) choose(option.code);
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:block"
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget)) setOpenFor(null);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="header-currency-menu"
        aria-label={`Change currency, currently ${meta.name}`}
        className={`relative inline-flex h-11 items-center gap-1.5 px-2 font-sans font-medium uppercase text-xs tracking-label transition-colors ${
          open ? 'text-ink' : 'text-ink hover:text-graphite'
        }`}
      >
        <span className="tabular-nums">
          <span aria-hidden="true" className="mr-1 normal-case">
            {meta.symbol}
          </span>
          <span className="uppercase">{meta.code}</span>
        </span>
        <Icon
          name="chevronDown"
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        {open && <span aria-hidden="true" className="absolute bottom-0 left-2 right-2 h-[1.5px] bg-ink" />}
      </button>

      {open && (
        <div
          id="header-currency-menu"
          className="animate-dropdown-in absolute right-0 top-full mt-[10px] md:mt-[14px] lg:mt-[18px] w-[252px] border border-line bg-paper"
        >
          <ul
            role="listbox"
            aria-label="Select currency"
            className="py-1"
            onKeyDown={onMenuKeyDown}
          >
            {availableCurrencies.map((option, index) => {
              const selected = option.code === currency;
              return (
                <li key={option.code} role="none">
                  <button
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onClick={() => choose(option.code)}
                    className={`flex h-12 w-full items-center gap-3 px-5 text-left font-sans text-[12px] font-semibold uppercase tracking-label transition-colors ${
                      index === activeIndex || selected
                        ? 'bg-mist text-ink'
                        : 'text-ink hover:bg-mist'
                    }`}
                  >
                    <span aria-hidden="true" className="w-9 text-[13px] normal-case">
                      {option.symbol}
                    </span>
                    <span aria-hidden="true">{option.code}</span>
                    <span className="ml-auto text-[11px] font-normal normal-case tracking-normal text-graphite">
                      {option.name}
                    </span>
                    {selected && <Icon name="check" size={16} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <RateNote className="border-t border-line px-5 py-3 text-[11px] text-graphite" />
        </div>
      )}
    </div>
  );
}
