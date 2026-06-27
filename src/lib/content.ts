// Content layer — fetches from the Strapi REST API at build time and maps the
// responses to the shapes the components consume (image fields become absolute
// remote image objects). Replaces the previous local-JSON layer from step 2.

// Build-time only (content.ts is used in server frontmatter, never shipped to the client).
const STRAPI_URL =
  (typeof process !== 'undefined' && process.env.STRAPI_URL) ||
  import.meta.env.PUBLIC_STRAPI_URL ||
  'http://localhost:1337';

export interface StrapiImage { url: string; width: number; height: number; alt: string; }

async function api<T = any>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}/api/${path}`);
  if (!res.ok) throw new Error(`Strapi ${res.status} for /api/${path}`);
  const json = await res.json();
  return json.data as T;
}

function mapImage(m: any): StrapiImage | null {
  if (!m) return null;
  const url = m.url?.startsWith('http') ? m.url : STRAPI_URL + m.url;
  return { url, width: m.width, height: m.height, alt: m.alternativeText || '' };
}

const mapSeo = (s: any) => ({ title: s?.metaTitle ?? '', description: s?.metaDescription ?? '' });

import { marked } from 'marked';
/** Render Strapi richtext (markdown) to inline HTML (no block <p> wrapping). */
export const richInline = (md: string | null | undefined) => (md ? marked.parseInline(md) as string : '');
/** Plain text -> HTML preserving line breaks. */
export const nl2br = (s: string | null | undefined) => (s ?? '').replace(/\n/g, '<br />');

/* ------------------------------- Global ------------------------------- */
let _global: any;
export async function getGlobal() {
  if (_global) return _global;
  const g = await api('global?populate=*');
  _global = {
    name: g.siteName,
    nav: (g.nav ?? []).map((n: any) => ({ label: n.label, href: n.href, ariaLabel: n.ariaLabel })),
    sidebar: {
      avatar: mapImage(g.sidebarAvatar),
      name: g.sidebarName,
      description: g.sidebarDescription,
      button: { label: g.sidebarButtonLabel, href: g.sidebarButtonHref },
    },
    social: (g.social ?? []).map((s: any) => ({ type: s.type, href: s.href, label: s.label })),
    cta: mapCta(g.cta),
    defaultSeoDescription: g.defaultSeoDescription,
  };
  return _global;
}

const mapCta = (c: any) => c ? ({
  heading: c.heading, body: c.body,
  button: { label: c.buttonLabel, href: c.buttonHref }, subText: c.subText,
}) : null;

/* ------------------------------- Home ------------------------------- */
export async function getHome() {
  const h = await api('home?populate=*');
  const items = await getPortfolioItems();
  return {
    seo: mapSeo(h.seo),
    hero: {
      hello: h.heroHello,
      heading: h.heroHeading,
      image: mapImage(h.heroImage),
      buttons: (h.heroButtons ?? []).map((b: any) => ({ label: b.label, href: b.href, ghost: !!b.ghost })),
    },
    heroText: { heading: h.heroTextHeading, body: h.heroTextBody, name: h.heroTextName },
    portfolioBlock: { heading: h.portfolioHeading, body: h.portfolioBody, items: items.map((p) => p.slug) },
    testimonialsBlock: { heading: h.testimonialsHeading, body: h.testimonialsBody },
    footerImage: mapImage(h.footerImage),
  };
}

/* --------------------------- Portfolio index --------------------------- */
export async function getPortfolioIndex() {
  const p = await api('portfolio-index?populate=*');
  return { seo: mapSeo(p.seo), heading: p.heading, intro: p.intro, footerImage: mapImage(p.footerImage) };
}

/* --------------------------- Services index --------------------------- */
export async function getServicesIndex() {
  const s = await api('services-index?populate=*');
  return {
    seo: mapSeo(s.seo),
    heading: s.heading,
    intro: s.intro,
    button: { label: s.buttonLabel, href: s.buttonHref },
    serviceCards: (s.serviceCards ?? []).map((c: any) => ({ heading: c.heading, description: c.description })),
    ctaBlock: mapCta(s.cta),
    heroImage: mapImage(s.heroImage),
  };
}

/* ------------------------------- Contact ------------------------------- */
export async function getContact() {
  const c = await api('contact?populate=*');
  return {
    seo: mapSeo(c.seo),
    left: { heading: c.leftHeading, body: c.leftBody, button: { label: c.leftButtonLabel, href: c.leftButtonHref } },
    right: {
      avatar: mapImage(c.rightAvatar),
      name: c.rightName,
      body: c.rightBody,
      externalLinks: (c.externalLinks ?? []).map((l: any) => ({ type: l.type, href: l.href, label: l.label })),
    },
    footerImage: mapImage(c.footerImage),
  };
}

/* ----------------------------- Testimonials ----------------------------- */
export async function getTestimonials() {
  const list = await api<any[]>('testimonials?sort=order:asc&pagination[pageSize]=100');
  return list.map((t) => ({ name: t.name, role: t.role, quote: t.quote, linkedinUrl: t.linkedinUrl }));
}

/* ----------------------------- Portfolio ----------------------------- */
let _items: any[];
export async function getPortfolioItems() {
  if (_items) return _items;
  const list = await api<any[]>('portfolio-items?populate=*&sort=order:asc&pagination[pageSize]=100');
  _items = list.map((p) => ({
    slug: p.slug,
    heading: p.heading,
    intro: p.intro,
    services: (p.services ?? []).map((s: any) => s.name),
    images: (p.caseImages ?? []).map((im: any) => mapImage(im)).filter(Boolean),
    card: {
      heading: p.cardHeading,
      description: p.cardDescription,
      ctaText: p.cardCtaText,
      firstImage: mapImage(p.cardFirstImage),
      secondImage: mapImage(p.cardSecondImage),
    },
    seo: mapSeo(p.seo),
  }));
  return _items;
}
export async function getPortfolioItem(slug: string) {
  return (await getPortfolioItems()).find((p) => p.slug === slug);
}

/* ------------------------------- Services ------------------------------- */
export async function getServices() {
  const list = await api<any[]>('services?sort=order:asc&pagination[pageSize]=100');
  return list.map((s) => ({ slug: s.slug, name: s.name, heading: s.heading ?? '' }));
}
export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug);
}
