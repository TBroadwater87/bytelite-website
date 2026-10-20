export const DISCOVERABLE_ROUTES = [
  '/',
  '/research',
  '/research/machine-cognition',
  '/research/data-representation',
  '/research/visual-and-audio',
  '/research/milestones',
  '/research/approaches-to-ai',
  '/validation',
  '/products',
  '/compatibility-app',
  '/cordel-play',
  '/founder-access',
  '/support',
  '/licensing',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
] as const;

export const RESOLVABLE_UNDISCOVERABLE_ROUTES = [
  '/checkout/success',
  '/checkout/cancel',
  '/billing',
  '/responsible-disclosure',
] as const;

export const ALL_PAGE_ROUTES = [...DISCOVERABLE_ROUTES, ...RESOLVABLE_UNDISCOVERABLE_ROUTES];

export const RETIRED_ROUTE_PREFIXES = [
  '/how-it-works',
  '/architecture',
  '/progress',
  '/technologies',
  '/company',
  '/preorder',
  '/marketing',
  '/deep-kore',
  '/deepkore',
  '/cordel-connect',
] as const;

export function routePathOf(href: string): string {
  return href.split('#')[0]!.split('?')[0]!.replace(/\/$/, '') || '/';
}
