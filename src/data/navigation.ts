import { COMPATIBILITY_APP_NAME, PARTY_GAME_NAME } from './products';

export interface NavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationGroup {
  label: string;
  links: readonly NavigationLink[];
}

export const RESEARCH_MENU: NavigationGroup = {
  label: 'Research',
  links: [
    { label: 'Research overview', href: '/research', description: 'All programs and how they relate' },
    { label: 'Machine Cognition', href: '/research/machine-cognition', description: 'Governed knowledge research' },
    { label: 'Data Representation', href: '/research/data-representation', description: 'Exact, accountable representation of data' },
    { label: 'Visual and Audio', href: '/research/visual-and-audio', description: 'Early sensory information research' },
    { label: 'Research Milestones', href: '/research/milestones', description: 'What is demonstrated, and what is not' },
    { label: 'Approaches to AI', href: '/research/approaches-to-ai', description: 'How this work compares with mainstream AI' },
  ],
};

export const PRIMARY_LINKS: readonly NavigationLink[] = [
  { label: 'Validation', href: '/validation' },
  { label: 'Products', href: '/products' },
  { label: 'Partnerships', href: '/licensing' },
  { label: 'Company', href: '/about' },
];

export const FOOTER_GROUPS: readonly NavigationGroup[] = [
  {
    label: 'Research',
    links: [
      { label: 'Overview', href: '/research' },
      { label: 'Machine Cognition', href: '/research/machine-cognition' },
      { label: 'Data Representation', href: '/research/data-representation' },
      { label: 'Visual and Audio', href: '/research/visual-and-audio' },
      { label: 'Milestones', href: '/research/milestones' },
      { label: 'Approaches to AI', href: '/research/approaches-to-ai' },
      { label: 'Validation', href: '/validation' },
    ],
  },
  {
    label: 'Products',
    links: [
      { label: 'All products', href: '/products' },
      { label: COMPATIBILITY_APP_NAME, href: '/compatibility-app' },
      { label: PARTY_GAME_NAME, href: '/cordel-play' },
      { label: 'Founder access', href: '/founder-access' },
      { label: 'Supporter Pack', href: '/support' },
    ],
  },
  {
    label: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Licensing and partnerships', href: '/licensing' },
      { label: 'Contact', href: '/contact' },
      { label: 'Billing', href: '/billing' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Responsible disclosure', href: '/responsible-disclosure' },
    ],
  },
];
