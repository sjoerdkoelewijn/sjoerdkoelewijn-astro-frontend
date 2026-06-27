import { useEffect, useRef } from 'react';

type Testimonial = { name: string; role: string; quote: string; linkedinUrl: string | null };

/**
 * Horizontal testimonial slider with drag-to-scroll + momentum and vertical-wheel
 * -> horizontal scroll, matching the original testimonials.bundle.js behavior.
 * Items are rendered twice (like the original markup) for a seamless feel.
 */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let velocity = 0;
    let raf = 0;

    const stop = () => cancelAnimationFrame(raf);
    const momentum = () => {
      grid.scrollLeft += 3 * velocity;
      velocity *= 0.02;
      if (Math.abs(velocity) > 0.5) raf = requestAnimationFrame(momentum);
    };

    const onDown = (e: MouseEvent) => {
      isDown = true; grid.classList.add('active');
      startX = e.pageX - grid.offsetLeft; startScroll = grid.scrollLeft; stop();
    };
    const onLeave = () => { isDown = false; grid.classList.remove('active'); };
    const onUp = () => { isDown = false; grid.classList.remove('active'); stop(); raf = requestAnimationFrame(momentum); };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - grid.offsetLeft;
      const walk = x - startX;
      const prev = grid.scrollLeft;
      grid.scrollLeft = startScroll - walk;
      velocity = grid.scrollLeft - prev;
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native horizontal
      stop();
      window.requestAnimationFrame(() => {
        grid.scrollTo({ top: 0, left: grid.scrollLeft + 2 * e.deltaY, behavior: 'smooth' });
      });
    };

    grid.addEventListener('mousedown', onDown);
    grid.addEventListener('mouseleave', onLeave);
    grid.addEventListener('mouseup', onUp);
    grid.addEventListener('mousemove', onMove);
    grid.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      grid.removeEventListener('mousedown', onDown);
      grid.removeEventListener('mouseleave', onLeave);
      grid.removeEventListener('mouseup', onUp);
      grid.removeEventListener('mousemove', onMove);
      grid.removeEventListener('wheel', onWheel);
      stop();
    };
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="testimonial-grid" data-id="testimonialGrid" ref={ref}>
      {doubled.map((t, i) => (
        <div className="grid-item" key={i}>
          <p>{t.quote}</p>
          <div className="meta">
            <span className="heading-wrap">
              <h3 className="title">{t.name}</h3>
              {t.linkedinUrl && (
                <a className="linkedin-button" href={t.linkedinUrl} aria-label={`View ${t.name}'s LinkedIn Profile`}></a>
              )}
            </span>
            <span>{t.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
