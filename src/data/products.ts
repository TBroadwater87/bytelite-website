export type ProductAvailability =
  | 'private-development'
  | 'prototype'
  | 'planned'
  | 'not-available';

export const PRODUCT_AVAILABILITY_LABEL: Record<ProductAvailability, string> = {
  'private-development': 'In private development',
  prototype: 'Prototype stage',
  planned: 'Planned',
  'not-available': 'Not available',
};

export interface ConsumerProduct {
  id: 'compatibility-app' | 'party-game' | 'personal-representation-service';
  displayName: string;
  href: string;
  category: string;
  oneLine: string;
  availability: ProductAvailability;
  availabilityDetail: string;
  whatExistsToday: readonly string[];
  whatDoesNotExist: readonly string[];
  audienceNotice?: string;
}

export const COMPATIBILITY_APP_NAME = 'Compatibility app';
export const PARTY_GAME_NAME = 'Cordel Play';
export const PERSONAL_REPRESENTATION_SERVICE_NAME = 'ByteLite Personal';

export const CONSUMER_PRODUCTS: readonly ConsumerProduct[] = [
  {
    id: 'compatibility-app',
    displayName: COMPATIBILITY_APP_NAME,
    href: '/compatibility-app',
    category: 'Mobile application',
    oneLine: 'A privacy-focused relationship and compatibility application.',
    availability: 'private-development',
    availabilityDetail:
      'Not publicly released. There is no public release, app-store listing, public price or sign-up, and its public name will be announced before any release.',
    whatExistsToday: [
      'An application and supporting server under private development and internal testing.',
      'Privacy controls for data export, deletion and profile visibility under internal test.',
    ],
    whatDoesNotExist: [
      'A public release or public beta.',
      'A published price.',
      'Independent security or privacy review.',
    ],
  },
  {
    id: 'party-game',
    displayName: PARTY_GAME_NAME,
    href: '/cordel-play',
    category: 'Physical adult board game',
    oneLine: 'A consent-first board game for adults.',
    availability: 'prototype',
    availabilityDetail:
      'Component designs and concept renderings exist. The game has not been manufactured, and no price, shipping date or preorder exists.',
    whatExistsToday: [
      'A draft rule book, card-back designs and a consent cup design.',
      'Concept renderings of those components.',
    ],
    whatDoesNotExist: [
      'Completed full-session playtesting.',
      'Manufacturing validation or manufactured inventory.',
      'A price, shipping date or refund process.',
      'Any way to buy or preorder it.',
    ],
    audienceNotice: 'Adults only (18+).',
  },
  {
    id: 'personal-representation-service',
    displayName: PERSONAL_REPRESENTATION_SERVICE_NAME,
    href: '/licensing',
    category: 'Planned subscription',
    oneLine: 'A planned personal subscription to the data representation research, if and when it works.',
    availability: 'planned',
    availabilityDetail:
      'Depends on research that has not yet demonstrated net size reduction. Nothing can be bought, and no price is published.',
    whatExistsToday: ['A proposed commercial model, described on the licensing page.'],
    whatDoesNotExist: ['A working product.', 'A published price.', 'Any way to subscribe.'],
  },
];

export function consumerProduct(id: ConsumerProduct['id']): ConsumerProduct {
  const product = CONSUMER_PRODUCTS.find((candidate) => candidate.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}
