import {cn} from '@nlabs/utils';
import {memo, useMemo, useState} from 'react';

import {Check, Minus, Plus, X} from '../../icons/index.js';

import type {HTMLAttributes, ReactNode} from 'react';

export type PricingVariant = 'grid' | 'single' | 'comparison';
export type PricingTone = 'default' | 'dark' | 'gradient';
export type PricingCardStyle = 'default' | 'contrast' | 'solid';

export interface PricingFrequency {
  readonly label: string;
  readonly priceSuffix?: string;
  readonly value: string;
}

export interface PricingHighlight {
  readonly description: string;
  readonly disabled?: boolean;
}

export type PricingTierValue = boolean | string;

export interface PricingTier {
  readonly badge?: string;
  readonly ctaLabel?: string;
  readonly ctaSubtitle?: string;
  readonly description?: ReactNode;
  readonly featured?: boolean;
  readonly features?: readonly string[];
  readonly highlights?: readonly PricingHighlight[];
  readonly href?: string;
  readonly id: string;
  readonly name: string;
  readonly price: string | Record<string, string>;
  readonly priceCaption?: ReactNode;
  readonly priceSuffix?: string | Record<string, string>;
}

export interface PricingComparisonFeature {
  readonly name: string;
  readonly tiers: Record<string, PricingTierValue>;
}

export interface PricingComparisonSection {
  readonly features: readonly PricingComparisonFeature[];
  readonly name: string;
}

export interface PricingLogo {
  readonly alt: string;
  readonly className?: string;
  readonly src: string;
}

export interface PricingExtraOffer {
  readonly ctaHref: string;
  readonly ctaLabel: string;
  readonly description?: ReactNode;
  readonly title: ReactNode;
}

export interface PricingSingleOffer {
  readonly ctaHref: string;
  readonly ctaLabel: string;
  readonly description?: ReactNode;
  readonly featureLabel?: ReactNode;
  readonly features?: readonly string[];
  readonly note?: ReactNode;
  readonly price: ReactNode;
  readonly priceLabel?: ReactNode;
  readonly priceSuffix?: ReactNode;
  readonly title: ReactNode;
}

export interface PricingProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly cardStyle?: PricingCardStyle;
  readonly comparisonSections?: readonly PricingComparisonSection[];
  readonly defaultFrequency?: string;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly extraOffer?: PricingExtraOffer;
  readonly frequencies?: readonly PricingFrequency[];
  readonly logos?: readonly PricingLogo[];
  readonly singleOffer?: PricingSingleOffer;
  readonly tiers?: readonly PricingTier[];
  readonly title?: ReactNode;
  readonly tone?: PricingTone;
  readonly variant?: PricingVariant;
}

const toneClasses: Record<PricingTone, string> = {
  dark: 'bg-gray-950 text-white',
  default: 'bg-white text-gray-900 dark:bg-gray-900 dark:text-white',
  gradient: 'bg-white dark:bg-gray-900'
};

const headerToneClasses: Record<PricingTone, {description: string; eyebrow: string; title: string}> = {
  dark: {
    description: 'text-gray-300',
    eyebrow: 'text-primary-dark-300',
    title: 'text-white'
  },
  default: {
    description: 'text-gray-600 dark:text-gray-400',
    eyebrow: 'text-primary dark:text-primary-dark-300',
    title: 'text-gray-900 dark:text-white'
  },
  gradient: {
    description: 'text-gray-600 dark:text-gray-400',
    eyebrow: 'text-primary dark:text-primary-dark-300',
    title: 'text-gray-900 dark:text-white'
  }
};

const frequencyShellClasses: Record<PricingTone, string> = {
  dark: 'bg-white/5 ring-1 ring-white/10',
  default: 'ring-1 ring-border bg-background',
  gradient: 'ring-1 ring-border bg-background'
};

const frequencyItemClasses: Record<PricingTone, string> = {
  dark: 'has-checked:bg-primary-dark text-gray-300 has-checked:text-white',
  default: 'has-checked:bg-primary text-gray-500 has-checked:text-white dark:text-gray-400 dark:has-checked:bg-primary-dark',
  gradient: 'has-checked:bg-primary text-gray-500 has-checked:text-white dark:text-gray-400 dark:has-checked:bg-primary-dark'
};

const cardToneClasses: Record<PricingTone, Record<PricingCardStyle, {body: string; cta: string; featuredBody: string; featuredCta: string; muted: string; title: string}>> = {
  dark: {
    contrast: {
      body: 'bg-white/5 ring-1 ring-white/10',
      cta: 'bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20',
      featuredBody: 'bg-white text-gray-900 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:text-white dark:ring-white/10 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-300',
      title: 'text-white'
    },
    default: {
      body: 'bg-white/5 ring-1 ring-white/10',
      cta: 'bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20',
      featuredBody: 'bg-gray-900 ring-1 ring-gray-900 shadow-2xl dark:bg-gray-800 dark:ring-white/10 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-300',
      title: 'text-white'
    },
    solid: {
      body: 'bg-gray-900 ring-1 ring-white/10',
      cta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      featuredBody: 'bg-primary-dark ring-2 ring-primary-dark-300 shadow-2xl',
      featuredCta: 'bg-white text-gray-900 hover:bg-gray-100',
      muted: 'text-gray-300',
      title: 'text-white'
    }
  },
  default: {
    contrast: {
      body: 'bg-white/70 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10',
      cta: 'bg-white text-primary ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20',
      featuredBody: 'bg-gray-900 text-white shadow-2xl ring-1 ring-gray-900/10 dark:bg-gray-800 dark:ring-white/10 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    },
    default: {
      body: 'bg-white ring-1 ring-border dark:bg-gray-800/50 dark:ring-white/10',
      cta: 'bg-white text-primary ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20',
      featuredBody: 'bg-white ring-2 ring-primary shadow-xl dark:bg-gray-800/50 dark:ring-primary-dark-300 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    },
    solid: {
      body: 'bg-white ring-1 ring-border shadow-lg dark:bg-gray-800/50 dark:ring-white/10 dark:shadow-none',
      cta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      featuredBody: 'bg-white ring-2 ring-primary shadow-2xl dark:bg-gray-800 dark:ring-primary-dark-300 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    }
  },
  gradient: {
    contrast: {
      body: 'bg-white/75 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10',
      cta: 'bg-white text-primary ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20',
      featuredBody: 'bg-gray-900 text-white shadow-2xl ring-1 ring-gray-900/10 dark:bg-gray-800 dark:ring-white/10 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    },
    default: {
      body: 'bg-white ring-1 ring-border dark:bg-gray-800/50 dark:ring-white/10',
      cta: 'bg-white text-primary ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20',
      featuredBody: 'bg-white shadow-xl ring-2 ring-primary dark:bg-gray-800/50 dark:ring-primary-dark-300 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    },
    solid: {
      body: 'bg-white ring-1 ring-border shadow-lg dark:bg-gray-800/50 dark:ring-white/10 dark:shadow-none',
      cta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      featuredBody: 'bg-white shadow-2xl ring-2 ring-primary dark:bg-gray-800 dark:ring-primary-dark-300 dark:shadow-none',
      featuredCta: 'bg-primary text-white hover:bg-primary-700 dark:bg-primary-dark dark:hover:bg-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    }
  }
};

const featuredTextClasses = (tone: PricingTone, cardStyle: PricingCardStyle) => {
  const lightFeaturedCard =
    (tone === 'dark' && cardStyle === 'contrast') ||
    ((tone === 'default' || tone === 'gradient') && (cardStyle === 'default' || cardStyle === 'solid'));

  return lightFeaturedCard
    ? {
      badge: 'bg-primary/10 text-primary dark:bg-primary-dark-300/10 dark:text-primary-dark-300',
      icon: 'text-primary dark:text-primary-dark-300',
      muted: 'text-gray-600 dark:text-gray-300',
      title: 'text-gray-900 dark:text-white'
    }
    : {
      badge: 'bg-white/10 text-white dark:bg-primary-dark-300/15 dark:text-primary-dark-300',
      icon: 'text-primary-dark-300',
      muted: 'text-gray-300 dark:text-gray-300',
      title: 'text-white dark:text-white'
    };
};

const comparisonPanelToneClasses: Record<PricingTone, string> = {
  dark: 'bg-gray-900/60 border-white/10',
  default: 'bg-white border-border dark:bg-gray-800/50 dark:border-white/10',
  gradient: 'bg-white border-border dark:bg-gray-800/50 dark:border-white/10'
};

const comparisonGridClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4'
};

const comparisonColClasses: Record<number, string> = {
  1: 'w-full',
  2: 'w-1/2',
  3: 'w-1/3',
  4: 'w-1/4'
};

const gradientDecoration = (
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden blur-3xl">
    <div
      className="mx-auto aspect-[1155/678] w-[72rem] bg-linear-to-tr from-primary/25 via-secondary/20 to-primary-dark/25 opacity-70 dark:opacity-40"
      style={{
        clipPath:
          'polygon(74.1% 44.1%,100% 61.6%,97.5% 26.9%,85.5% 0.1%,80.7% 2%,72.5% 32.5%,60.2% 62.4%,52.4% 68.1%,47.5% 58.3%,45.2% 34.5%,27.5% 76.7%,0.1% 64.9%,17.9% 100%,27.6% 76.8%,76.1% 97.7%,74.1% 44.1%)'
      }}
    />
  </div>
);

const getDefaultFrequency = (
  frequencies: readonly PricingFrequency[] | undefined,
  tiers: readonly PricingTier[] | undefined,
  defaultFrequency?: string
) => {
  if(defaultFrequency) {
    return defaultFrequency;
  }

  if(frequencies?.[0]?.value) {
    return frequencies[0].value;
  }

  const firstPrice = tiers?.find((tier) => typeof tier.price !== 'string' && Object.keys(tier.price).length > 0)?.price;

  if(firstPrice && typeof firstPrice !== 'string') {
    return Object.keys(firstPrice)[0] ?? 'monthly';
  }

  return 'monthly';
};

const getPriceForTier = (tier: PricingTier, activeFrequency: string) => {
  if(typeof tier.price === 'string') {
    return tier.price;
  }

  return tier.price[activeFrequency] ?? Object.values(tier.price)[0] ?? '';
};

const getPriceSuffixForTier = (
  tier: PricingTier,
  frequencies: readonly PricingFrequency[] | undefined,
  activeFrequency: string
) => {
  if(typeof tier.price === 'string' && typeof tier.priceSuffix === 'string') {
    return tier.priceSuffix;
  }

  if(tier.priceSuffix && typeof tier.priceSuffix !== 'string') {
    return tier.priceSuffix[activeFrequency] ?? Object.values(tier.priceSuffix)[0] ?? '';
  }

  return frequencies?.find((frequency) => frequency.value === activeFrequency)?.priceSuffix ?? '';
};

const renderTierList = (
  tier: PricingTier,
  featured: boolean,
  featuredText: ReturnType<typeof featuredTextClasses>
) => {
  if(tier.highlights?.length) {
    return (
      <ul className="mt-8 space-y-3 text-sm/6" role="list">
        {tier.highlights.map((highlight) => (
          <li
            className={cn(
              'group flex items-start gap-3',
              highlight.disabled ? 'text-gray-400 dark:text-gray-500' : featured ? featuredText.muted : 'text-gray-600 dark:text-gray-300'
            )}
            key={highlight.description}
          >
            <span className="inline-flex h-6 items-center">
              {highlight.disabled ? (
                <Minus aria-hidden="true" className="size-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <Plus aria-hidden="true" className={cn('size-4', featured ? featuredText.icon : 'text-primary dark:text-primary-dark-300')} />
              )}
            </span>
            {highlight.description}
          </li>
        ))}
      </ul>
    );
  }

  if(!tier.features?.length) {
    return null;
  }

  return (
    <ul className="mt-8 space-y-3 text-sm/6" role="list">
      {tier.features.map((feature) => (
        <li
          className={cn(
            'flex gap-3',
            featured ? featuredText.muted : 'text-gray-600 dark:text-gray-300'
          )}
          key={feature}
        >
          <Check aria-hidden="true" className={cn('mt-0.5 size-4 shrink-0', featured ? featuredText.icon : 'text-primary dark:text-primary-dark-300')} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};

const PricingHeader = ({
  description,
  eyebrow,
  title,
  tone
}: Pick<PricingProps, 'description' | 'eyebrow' | 'title' | 'tone'>) => {
  if(!eyebrow && !title && !description) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl text-center">
      {eyebrow ? (
        <h2 className={cn('text-base/7 font-semibold', headerToneClasses[tone ?? 'default'].eyebrow)}>
          {eyebrow}
        </h2>
      ) : null}
      {title ? (
        <p className={cn('mt-2 text-5xl font-semibold tracking-tight text-balance sm:text-6xl', headerToneClasses[tone ?? 'default'].title)}>
          {title}
        </p>
      ) : null}
      {description ? (
        <p className={cn('mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty sm:text-xl/8', headerToneClasses[tone ?? 'default'].description)}>
          {description}
        </p>
      ) : null}
    </div>
  );
};

const FrequencyToggle = ({
  activeFrequency,
  frequencies,
  onChange,
  tone
}: {
  readonly activeFrequency: string;
  readonly frequencies: readonly PricingFrequency[];
  readonly onChange: (value: string) => void;
  readonly tone: PricingTone;
}) => (
  <div className="mt-16 flex justify-center">
    <fieldset aria-label="Payment frequency">
      <div className={cn('grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs/5 font-semibold', frequencyShellClasses[tone])}>
        {frequencies.map((frequency) => {
          const checked = activeFrequency === frequency.value;

          return (
            <label
              className={cn('relative rounded-full px-2.5 py-1 transition-colors', frequencyItemClasses[tone], checked && 'text-white')}
              key={frequency.value}
            >
              <input
                checked={checked}
                className="sr-only"
                name="pricing-frequency"
                onChange={() => onChange(frequency.value)}
                type="radio"
                value={frequency.value}
              />
              <span>{frequency.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  </div>
);

const GridPricing = ({
  activeFrequency,
  cardStyle,
  extraOffer,
  frequencies,
  tone,
  tiers
}: {
  readonly activeFrequency: string;
  readonly cardStyle: PricingCardStyle;
  readonly extraOffer?: PricingExtraOffer;
  readonly frequencies?: readonly PricingFrequency[];
  readonly tone: PricingTone;
  readonly tiers: readonly PricingTier[];
}) => {
  const gridColsClass = tiers.length >= 4
    ? 'md:grid-cols-2 xl:grid-cols-4'
    : tiers.length === 3
      ? 'lg:grid-cols-3'
      : tiers.length === 2
        ? 'lg:grid-cols-2 lg:max-w-4xl'
        : 'max-w-2xl';
  const cardTokens = cardToneClasses[tone][cardStyle];

  return (
    <div className="mt-10">
      <div className={cn('mx-auto grid max-w-md grid-cols-1 gap-8', gridColsClass)}>
        {tiers.map((tier) => {
          const featured = Boolean(tier.featured);
          const featuredText = featuredTextClasses(tone, cardStyle);
          const price = getPriceForTier(tier, activeFrequency);
          const suffix = getPriceSuffixForTier(tier, frequencies, activeFrequency);

          return (
            <div
              className={cn(
                'flex flex-col justify-between rounded-3xl p-8 xl:p-10',
                featured ? cardTokens.featuredBody : cardTokens.body
              )}
              data-featured={featured ? 'true' : undefined}
              key={tier.id}
            >
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className={cn('text-lg/8 font-semibold', featured ? featuredText.title : cardTokens.title)} id={tier.id}>
                    {tier.name}
                  </h3>
                  {tier.badge ? (
                    <span className={cn(
                      'rounded-full px-2.5 py-1 text-xs/5 font-semibold',
                      featured ? featuredText.badge : 'bg-primary/10 text-primary dark:bg-primary-dark-300/10 dark:text-primary-dark-300'
                    )}>
                      {tier.badge}
                    </span>
                  ) : null}
                </div>
                {tier.description ? (
                  <p className={cn('mt-4 text-sm/6', featured ? featuredText.muted : cardTokens.muted)}>
                    {tier.description}
                  </p>
                ) : null}
                <p className="mt-6 flex items-baseline gap-x-2">
                  <span className={cn('text-4xl font-semibold tracking-tight', featured ? featuredText.title : cardTokens.title)}>
                    {price}
                  </span>
                  {suffix ? (
                    <span className={cn('text-sm/6 font-semibold', featured ? featuredText.muted : cardTokens.muted)}>
                      {suffix}
                    </span>
                  ) : null}
                </p>
                {tier.priceCaption ? (
                  <p className={cn('mt-3 text-sm/6', featured ? featuredText.muted : cardTokens.muted)}>
                    {tier.priceCaption}
                  </p>
                ) : null}
                {renderTierList(tier, featured, featuredText)}
              </div>
              {tier.href && tier.ctaLabel ? (
                <a
                  aria-describedby={tier.id}
                  className={cn(
                    'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:focus-visible:outline-primary-dark-300',
                    featured ? cardTokens.featuredCta : cardTokens.cta
                  )}
                  href={tier.href}
                >
                  {tier.ctaLabel}
                </a>
              ) : null}
              {tier.ctaSubtitle ? (
                <p className={cn('mt-3 text-center text-xs/5', featured ? featuredText.muted : cardTokens.muted)}>
                  {tier.ctaSubtitle}
                </p>
              ) : null}
            </div>
          );
        })}
        {extraOffer ? (
          <div className={cn(
            'flex flex-col items-start gap-6 rounded-3xl p-8 ring-1 sm:p-10',
            tiers.length > 1 ? 'lg:col-span-full lg:flex-row lg:items-center' : '',
            tone === 'dark'
              ? 'bg-white/5 ring-white/10'
              : 'bg-transparent ring-border dark:bg-white/5 dark:ring-white/10'
          )}>
            <div className="min-w-0 flex-1">
              <h3 className="text-base/7 font-semibold text-primary dark:text-primary-dark-300">{extraOffer.title}</h3>
              {extraOffer.description ? (
                <p className={cn('mt-1 text-base/7', tone === 'dark' ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300')}>
                  {extraOffer.description}
                </p>
              ) : null}
            </div>
            <a
              className={cn(
                'rounded-md px-3.5 py-2 text-sm/6 font-semibold',
                tone === 'dark'
                  ? 'bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20'
                  : 'bg-white text-primary ring-1 ring-primary/20 hover:ring-primary/40 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20'
              )}
              href={extraOffer.ctaHref}
            >
              {extraOffer.ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SinglePricing = ({
  singleOffer,
  tone
}: {
  readonly singleOffer: PricingSingleOffer;
  readonly tone: PricingTone;
}) => (
  <div className="mx-auto mt-16 max-w-5xl rounded-3xl ring-1 ring-border lg:flex dark:bg-gray-800/50 dark:ring-white/10">
    <div className="p-8 sm:p-10 lg:flex-auto">
      <h3 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{singleOffer.title}</h3>
      {singleOffer.description ? (
        <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">{singleOffer.description}</p>
      ) : null}
      {singleOffer.features?.length ? (
        <>
          <div className="mt-10 flex items-center gap-x-4">
            <h4 className="flex-none text-sm/6 font-semibold text-primary dark:text-primary-dark-300">
              {singleOffer.featureLabel ?? 'What\'s included'}
            </h4>
            <div className="h-px flex-auto bg-gray-100 dark:bg-white/10" />
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-gray-600 sm:grid-cols-2 sm:gap-6 dark:text-gray-300" role="list">
            {singleOffer.features.map((feature) => (
              <li className="flex gap-3" key={feature}>
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary dark:text-primary-dark-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
    <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:shrink-0">
      <div className={cn(
        'rounded-2xl py-10 text-center ring-1 lg:flex lg:flex-col lg:justify-center lg:py-16',
        tone === 'dark'
          ? 'bg-gray-900 ring-white/10'
          : 'bg-gray-50 ring-gray-900/5 dark:bg-gray-900 dark:ring-white/10'
      )}>
        <div className="mx-auto max-w-xs px-8">
          {singleOffer.priceLabel ? (
            <p className="text-base font-semibold text-gray-600 dark:text-gray-400">{singleOffer.priceLabel}</p>
          ) : null}
          <p className="mt-6 flex items-baseline justify-center gap-x-2">
            <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">{singleOffer.price}</span>
            {singleOffer.priceSuffix ? (
              <span className="text-sm/6 font-semibold tracking-wide text-gray-600 dark:text-gray-400">{singleOffer.priceSuffix}</span>
            ) : null}
          </p>
          <a
            className="mt-10 block w-full rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-primary-dark dark:hover:bg-primary-dark-300"
            href={singleOffer.ctaHref}
          >
            {singleOffer.ctaLabel}
          </a>
          {singleOffer.note ? (
            <p className="mt-6 text-xs/5 text-gray-600 dark:text-gray-400">{singleOffer.note}</p>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

const ComparisonValue = ({value}: {readonly value: PricingTierValue | undefined}) => {
  if(typeof value === 'string') {
    return <span className="text-sm/6 text-gray-900 dark:text-white">{value}</span>;
  }

  if(value === true) {
    return <Check aria-hidden="true" className="inline-block size-4 text-green-600 dark:text-green-500" />;
  }

  return <X aria-hidden="true" className="inline-block size-4 text-gray-400 dark:text-gray-500" />;
};

const ComparisonPricing = ({
  activeFrequency,
  cardStyle,
  comparisonSections,
  frequencies,
  logos,
  tone,
  tiers
}: {
  readonly activeFrequency: string;
  readonly cardStyle: PricingCardStyle;
  readonly comparisonSections?: readonly PricingComparisonSection[];
  readonly frequencies?: readonly PricingFrequency[];
  readonly logos?: readonly PricingLogo[];
  readonly tone: PricingTone;
  readonly tiers: readonly PricingTier[];
}) => {
  const [activeMobileTierId, setActiveMobileTierId] = useState(tiers[0]?.id ?? '');
  const activeMobileTier = tiers.find((tier) => tier.id === activeMobileTierId) ?? tiers[0];
  const cardTokens = cardToneClasses[tone][cardStyle];

  return (
    <>
      <div className={cn('relative mt-10', tone === 'gradient' && 'pt-6')}>
        {tone === 'gradient' ? (
          <div aria-hidden="true" className="absolute inset-x-0 top-16 bottom-0 bg-[radial-gradient(circle_at_center_center,theme(colors.primary/.35),theme(colors.primary-dark/.28),transparent_72%)] dark:bg-[radial-gradient(circle_at_center_center,theme(colors.primary-dark-300/.28),theme(colors.primary-dark/.22),transparent_72%)]" />
        ) : null}
        <div className="relative mx-auto max-w-7xl">
          <div className={cn('grid grid-cols-1 gap-8', comparisonGridClasses[Math.min(Math.max(tiers.length, 1), 4)])}>
            {tiers.map((tier) => {
              const featured = Boolean(tier.featured);
              const featuredText = featuredTextClasses(tone, cardStyle);

              return (
                <div className={cn('rounded-4xl p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]', tone === 'dark' ? 'bg-white/5' : 'bg-white/5 dark:bg-white/5')} key={tier.id}>
                  <div className={cn('rounded-3xl p-8', featured ? cardTokens.featuredBody : cardTokens.body)}>
                    <h3 className={cn('text-sm font-semibold', featured ? 'text-white dark:text-white' : 'text-primary dark:text-primary-dark-300')}>
                      {tier.name}
                    </h3>
                    {tier.description ? (
                      <p className={cn('mt-2 text-sm/6', featured ? 'text-gray-300 dark:text-gray-300' : cardTokens.muted)}>
                        {tier.description}
                      </p>
                    ) : null}
                    <div className="mt-8 flex items-center gap-4">
                      <div className={cn('text-5xl font-semibold', featured ? 'text-white dark:text-white' : cardTokens.title)}>
                        {getPriceForTier(tier, activeFrequency)}
                      </div>
                      {getPriceSuffixForTier(tier, frequencies, activeFrequency) ? (
                        <div className={cn('text-sm', featured ? 'text-gray-300 dark:text-gray-300' : cardTokens.muted)}>
                          <p>{getPriceSuffixForTier(tier, frequencies, activeFrequency)}</p>
                        </div>
                      ) : null}
                    </div>
                    {tier.href && tier.ctaLabel ? (
                      <a
                        aria-label={`${tier.ctaLabel} on the ${tier.name} plan`}
                        className={cn(
                          'mt-8 inline-block rounded-md px-3.5 py-2 text-center text-sm/6 font-semibold',
                          featured ? cardTokens.featuredCta : cardTokens.cta
                        )}
                        href={tier.href}
                      >
                        {tier.ctaLabel}
                      </a>
                    ) : null}
                    {renderTierList(tier, featured, featuredText)}
                  </div>
                </div>
              );
            })}
          </div>
          {logos?.length ? (
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 py-16 opacity-70 sm:py-24">
              {logos.map((logo) => (
                <img alt={logo.alt} className={cn('h-8 object-contain lg:h-10', logo.className)} key={`${logo.alt}-${logo.src}`} src={logo.src} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {comparisonSections?.length ? (
        <div className="mx-auto mt-8 max-w-7xl">
          <div className="hidden lg:block">
            <table className="w-full text-left">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="w-2/5" />
                {tiers.map((tier) => <col className={comparisonColClasses[Math.min(Math.max(tiers.length, 1), 4)]} key={tier.id} />)}
              </colgroup>
              <thead>
                <tr>
                  <td className="p-0" />
                  {tiers.map((tier) => (
                    <th className="p-0" key={tier.id} scope="col">
                      <div className="text-sm font-semibold text-primary dark:text-primary-dark-300">{tier.name}</div>
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="p-0" />
                  {tiers.map((tier) => (
                    <td className="px-0 pt-3 pb-0" key={tier.id}>
                      {tier.href && tier.ctaLabel ? (
                        <a
                          className={cn(
                            'inline-block rounded-md px-2.5 py-1.5 text-sm font-semibold',
                            tier.featured ? cardTokens.featuredCta : cardTokens.cta
                          )}
                          href={tier.href}
                        >
                          {tier.ctaLabel}
                        </a>
                      ) : null}
                    </td>
                  ))}
                </tr>
              </thead>
              {comparisonSections.map((section) => (
                <tbody className="group" key={section.name}>
                  <tr>
                    <th className="px-0 pt-10 pb-0 group-first-of-type:pt-5" colSpan={tiers.length + 1} scope="colgroup">
                      <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm/6 font-semibold text-gray-950 dark:bg-gray-800/50 dark:text-white">
                        {section.name}
                      </div>
                    </th>
                  </tr>
                  {section.features.map((feature) => (
                    <tr className="border-b border-gray-100 last:border-none dark:border-white/10" key={feature.name}>
                      <th className="px-0 py-4 text-sm/6 font-normal text-gray-600 dark:text-gray-300" scope="row">
                        {feature.name}
                      </th>
                      {tiers.map((tier) => (
                        <td className="p-4 max-sm:text-center" key={tier.id}>
                          <ComparisonValue value={feature.tiers[tier.name]} />
                          <span className="sr-only">{typeof feature.tiers[tier.name] === 'string' ? `${feature.tiers[tier.name]} for ${tier.name}` : `${feature.tiers[tier.name] === true ? 'Included' : 'Not included'} in ${tier.name}`}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <div className="lg:hidden">
            <div className="flex border-b border-gray-100 dark:border-white/10">
              {tiers.map((tier) => (
                <button
                  className={cn(
                    'flex-1 border-b py-4 text-base/8 font-medium not-focus-visible:focus:outline-none',
                    activeMobileTier?.id === tier.id
                      ? 'border-primary text-primary dark:border-primary-dark-300 dark:text-primary-dark-300'
                      : 'border-transparent text-gray-500 dark:text-gray-400'
                  )}
                  key={tier.id}
                  onClick={() => setActiveMobileTierId(tier.id)}
                  type="button"
                >
                  {tier.name}
                </button>
              ))}
            </div>
            {activeMobileTier ? (
              <div className="mt-8">
                {activeMobileTier.href && activeMobileTier.ctaLabel ? (
                  <a
                    className={cn(
                      'block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold',
                      activeMobileTier.featured ? cardTokens.featuredCta : cardTokens.cta
                    )}
                    href={activeMobileTier.href}
                  >
                    {activeMobileTier.ctaLabel}
                  </a>
                ) : null}
                {comparisonSections.map((section) => (
                  <div key={section.name}>
                    <div className={cn('mt-10 rounded-lg px-6 py-3 text-sm/6 font-semibold text-gray-950 group-first-of-type:mt-5 dark:text-white', comparisonPanelToneClasses[tone])}>
                      {section.name}
                    </div>
                    <dl>
                      {section.features.map((feature) => (
                        <div className="grid grid-cols-2 border-b border-gray-100 py-4 last:border-none dark:border-white/10" key={feature.name}>
                          <dt className="text-sm/6 font-normal text-gray-600 dark:text-gray-300">{feature.name}</dt>
                          <dd className="text-center">
                            <ComparisonValue value={feature.tiers[activeMobileTier.name]} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
};

const PricingComponent = ({
  cardStyle = 'default',
  className,
  comparisonSections,
  defaultFrequency,
  description,
  eyebrow = 'Pricing',
  extraOffer,
  frequencies,
  logos,
  singleOffer,
  tiers = [],
  title,
  tone = 'default',
  variant = 'grid',
  ...props
}: PricingProps) => {
  const initialFrequency = useMemo(
    () => getDefaultFrequency(frequencies, tiers, defaultFrequency),
    [defaultFrequency, frequencies, tiers]
  );
  const [activeFrequency, setActiveFrequency] = useState(initialFrequency);

  return (
    <section
      className={cn(
        'relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8',
        toneClasses[tone],
        className
      )}
      data-slot="pricing"
      data-tone={tone}
      data-variant={variant}
      {...props}
    >
      {tone === 'gradient' ? gradientDecoration : null}
      <div className="mx-auto max-w-7xl">
        <PricingHeader description={description} eyebrow={eyebrow} title={title} tone={tone} />
        {frequencies?.length ? (
          <FrequencyToggle
            activeFrequency={activeFrequency}
            frequencies={frequencies}
            onChange={setActiveFrequency}
            tone={tone}
          />
        ) : null}
        {variant === 'single' && singleOffer ? (
          <SinglePricing singleOffer={singleOffer} tone={tone} />
        ) : null}
        {variant === 'grid' ? (
          <GridPricing
            activeFrequency={activeFrequency}
            cardStyle={cardStyle}
            extraOffer={extraOffer}
            frequencies={frequencies}
            tiers={tiers}
            tone={tone}
          />
        ) : null}
        {variant === 'comparison' ? (
          <ComparisonPricing
            activeFrequency={activeFrequency}
            cardStyle={cardStyle}
            comparisonSections={comparisonSections}
            frequencies={frequencies}
            logos={logos}
            tiers={tiers}
            tone={tone}
          />
        ) : null}
      </div>
    </section>
  );
};

export const Pricing = memo(PricingComponent);
Pricing.displayName = 'Pricing';
