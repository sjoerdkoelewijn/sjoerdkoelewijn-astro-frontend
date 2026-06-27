import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type NavItem = { label: string; href: string; ariaLabel?: string };
type Social = { type: string; href: string; label: string };

interface Props {
  nav: NavItem[];
  social: Social[];
  avatarSrc: string;
  name: string;
  description: string;
  button: { label: string; href: string };
}

/**
 * Mobile off-canvas menu. The hamburger toggle is portaled INTO the header
 * (#sidebar-toggle-slot) while the sidebar + underlay render at body level — so the
 * `filter: blur()` the CSS applies to <main>/<header> when open does not blur the
 * sidebar itself (matching the original markup where the sidebar is a body sibling).
 * Open state mirrors on <html data-sidebar-visible> so existing CSS drives the rest.
 */
export default function MobileMenu({ nav, social, avatarSrc, name, description, button }: Props) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => { setSlot(document.getElementById('sidebar-toggle-slot')); }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-sidebar-visible', String(open));
    return () => document.documentElement.setAttribute('data-sidebar-visible', 'false');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (
    <svg
      className="sidebar-toggle"
      width="30" height="23" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg"
      role="button" tabIndex={0} aria-label="Open menu" aria-expanded={open}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
    >
      <path d="M0 0H30V3.83333H0V0ZM0 9.58333H30V13.4167H0V9.58333ZM0 19.1667H30V23H0V19.1667Z" fill="#2D47FF" />
    </svg>
  );

  return (
    <>
      {slot && createPortal(toggle, slot)}

      <aside className="sidebar">
        <svg
          className="close-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
          role="button" tabIndex={0} aria-label="Close menu"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(false); } }}
        >
          <path d="M0.935736 1.85333L14.9382 15.8558L16.7916 14.0025L2.78906 0L0.935736 1.85333Z" fill="white" />
          <path d="M2.79083 16.0018L0.9375 14.1484L14.94 0.145929L16.7933 1.99926L2.79083 16.0018Z" fill="white" />
        </svg>

        <div className="inner-wrap">
          <div className="text-wrap">
            <p className="hello">
              <img src={avatarSrc} alt="Sjoerd Koelewijn Avatar" />
              {name}
            </p>
            <p className="heading-description">{description}</p>
          </div>

          <nav className="sidebar-menu">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="menu-link" aria-label={n.ariaLabel}>{n.label}</a>
            ))}
          </nav>

          <a className="button" href={button.href}>{button.label}</a>

          <div className="social-icons">
            {social.map((s) => (
              <a key={s.type} href={s.href} className={`icon ${s.type}`} aria-label={s.label}></a>
            ))}
          </div>
        </div>
      </aside>

      <span className="sidebar-underlay" onClick={() => setOpen(false)}></span>
    </>
  );
}
