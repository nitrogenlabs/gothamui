/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen} from '@testing-library/react';

import {Pricing} from './Pricing.js';

describe('Pricing', () => {
  it('renders all tiers in grid variant from the tier array length', () => {
    render(
      <Pricing
        description="Pick a plan"
        tiers={[
          {
            ctaLabel: 'Choose starter',
            href: '/starter',
            id: 'starter',
            name: 'Starter',
            price: '$19',
            priceSuffix: '/month'
          },
          {
            ctaLabel: 'Choose growth',
            featured: true,
            href: '/growth',
            id: 'growth',
            name: 'Growth',
            price: '$49',
            priceSuffix: '/month'
          },
          {
            ctaLabel: 'Choose scale',
            href: '/scale',
            id: 'scale',
            name: 'Scale',
            price: '$99',
            priceSuffix: '/month'
          }
        ]}
        title="Pricing that grows with you"
        variant="grid"
      />
    );

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Scale')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Choose growth'})).toHaveAttribute('href', '/growth');
  });

  it('switches displayed prices when the frequency toggle changes', () => {
    render(
      <Pricing
        frequencies={[
          {label: 'Monthly', priceSuffix: '/month', value: 'monthly'},
          {label: 'Annually', priceSuffix: '/year', value: 'annually'}
        ]}
        tiers={[
          {
            ctaLabel: 'Buy starter',
            href: '/starter',
            id: 'starter',
            name: 'Starter',
            price: {annually: '$199', monthly: '$19'}
          }
        ]}
        title="Choose a billing cycle"
        variant="grid"
      />
    );

    expect(screen.getByText('$19')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', {name: /annually/i}));

    expect(screen.getByText('$199')).toBeInTheDocument();
  });

  it('uses readable text colors on default featured grid cards', () => {
    render(
      <Pricing
        cardStyle="default"
        tiers={[
          {
            ctaLabel: 'Buy starter',
            href: '/starter',
            id: 'starter',
            name: 'Starter',
            price: '$19'
          },
          {
            badge: 'Popular',
            ctaLabel: 'Buy growth',
            description: 'For production systems.',
            featured: true,
            features: ['Release checks'],
            href: '/growth',
            id: 'growth',
            name: 'Growth',
            price: '$49'
          }
        ]}
        title="Choose a plan"
        variant="grid"
      />
    );

    expect(screen.getByText('Growth')).toHaveClass('text-gray-900');
    expect(screen.getByText('$49')).toHaveClass('text-gray-900');
    expect(screen.getByText('For production systems.')).toHaveClass('text-gray-600');
    expect(screen.getByText('Release checks').closest('li')).toHaveClass('text-gray-600');
    expect(screen.getByText('Popular')).toHaveClass('text-primary');
  });

  it('renders the comparison layout with section values', () => {
    render(
      <Pricing
        comparisonSections={[
          {
            features: [
              {
                name: 'Custom domains',
                tiers: {Growth: '3', Starter: '1'}
              }
            ],
            name: 'Features'
          }
        ]}
        tiers={[
          {
            ctaLabel: 'Buy starter',
            href: '/starter',
            id: 'starter',
            name: 'Starter',
            price: '$19'
          },
          {
            ctaLabel: 'Buy growth',
            href: '/growth',
            id: 'growth',
            name: 'Growth',
            price: '$49'
          }
        ]}
        title="Compare plans"
        variant="comparison"
      />
    );

    expect(screen.getAllByText('Features').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Custom domains').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('renders the single-offer layout', () => {
    render(
      <Pricing
        singleOffer={{
          ctaHref: '/buy',
          ctaLabel: 'Get access',
          featureLabel: 'Included',
          features: ['Private forum access', 'Official member t-shirt'],
          price: '$349',
          priceLabel: 'Pay once, own it forever',
          priceSuffix: 'USD',
          title: 'Lifetime membership'
        }}
        title="Simple no-tricks pricing"
        variant="single"
      />
    );

    expect(screen.getByText('Lifetime membership')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Get access'})).toHaveAttribute('href', '/buy');
    expect(screen.getByText('Private forum access')).toBeInTheDocument();
  });
});

describe('Pricing billing and optional content', () => {
  it('honors the default cycle and falls back when a tier lacks that cycle', () => {
    render(<Pricing defaultFrequency="annual" frequencies={[
      {label: 'Monthly', value: 'monthly'}, {label: 'Annual', value: 'annual'}
    ]} tiers={[
      {id: 'full', name: 'Full', price: {annual: '$120', monthly: '$12'}, priceSuffix: {annual: '/year', monthly: '/month'}},
      {id: 'limited', name: 'Limited', price: {monthly: '$8'}, priceSuffix: {monthly: '/seat'}},
      {id: 'quote', name: 'Quote', price: {}, priceSuffix: {}}
    ]} />);

    expect(screen.getByRole('radio', {name: 'Annual'})).toBeChecked();
    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(screen.getByText('/year')).toBeInTheDocument();
    expect(screen.getByText('$8')).toBeInTheDocument();
    expect(screen.getByText('/seat')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', {name: 'Monthly'}));

    expect(screen.getByText('$12')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
    expect(screen.queryByText('$120')).not.toBeInTheDocument();
  });

  it('infers a billing cycle from the first nonempty price map', () => {
    render(<Pricing tiers={[
      {id: 'empty', name: 'Contact us', price: {}},
      {id: 'annual', name: 'Annual plan', price: {annual: '$99'}, priceSuffix: {annual: '/year'}}
    ]} />);

    expect(screen.getByText('$99')).toBeInTheDocument();
    expect(screen.getByText('/year')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('supports an empty section without a header or purchase links', () => {
    render(<Pricing aria-label="Plans" eyebrow={null} />);

    expect(screen.getByRole('region', {name: 'Plans'})).toHaveAttribute('data-variant', 'grid');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each([
    {cardStyle: 'contrast', titleClass: 'text-white', tone: 'default'},
    {cardStyle: 'contrast', titleClass: 'text-gray-900', tone: 'dark'},
    {cardStyle: 'solid', titleClass: 'text-white', tone: 'dark'},
    {cardStyle: 'solid', titleClass: 'text-gray-900', tone: 'gradient'}
  ] as const)('keeps featured content readable in $tone/$cardStyle cards', ({cardStyle, titleClass, tone}) => {
    render(<Pricing cardStyle={cardStyle} tiers={[
      {
        badge: 'Recommended', ctaSubtitle: 'Cancel anytime', description: 'Team tools', featured: true,
        features: ['Hidden by highlights'], highlights: [{description: 'Priority support'}, {description: 'No phone support', disabled: true}],
        id: 'team', name: 'Team', price: '$40', priceCaption: 'Billed monthly', priceSuffix: '/month'
      },
      {
        badge: 'Free trial', ctaSubtitle: 'No card needed', description: 'Try the product',
        highlights: [{description: 'Community support'}], id: 'trial', name: 'Trial', price: '$0', priceCaption: 'For 14 days'
      }
    ]} tone={tone} />);

    expect(screen.getByRole('heading', {name: 'Team'})).toHaveClass(titleClass);
    expect(screen.getByText('Priority support')).toBeInTheDocument();
    expect(screen.getByText('No phone support')).toHaveClass('text-gray-400');
    expect(screen.getByText('Community support')).toBeInTheDocument();
    expect(screen.queryByText('Hidden by highlights')).not.toBeInTheDocument();
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
    expect(screen.getByText('No card needed')).toBeInTheDocument();
    expect(screen.getByText('Billed monthly')).toBeInTheDocument();
    expect(screen.getByText('For 14 days')).toBeInTheDocument();
  });

  it.each(['dark', 'default'] as const)('offers an enterprise contact link in the %s grid', (tone) => {
    const {rerender} = render(<Pricing extraOffer={{ctaHref: '/sales', ctaLabel: 'Contact sales', description: 'Custom capacity', title: 'Enterprise'}}
      tiers={Array.from({length: 4}, (_, index) => ({features: ['Email support'], id: `${index}`, name: `Plan ${index}`, price: '$10'}))} tone={tone} />);

    expect(screen.getByRole('link', {name: 'Contact sales'})).toHaveAttribute('href', '/sales');
    expect(screen.getByText('Custom capacity')).toBeInTheDocument();
    expect(screen.getAllByText('Email support')).toHaveLength(4);

    rerender(<Pricing extraOffer={{ctaHref: '/sales', ctaLabel: 'Talk to us', title: 'Enterprise'}} tone={tone} />);

    expect(screen.queryByText('Custom capacity')).not.toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Talk to us'})).toHaveAttribute('href', '/sales');
  });

  it('renders single-offer details and supports a minimal offer', () => {
    const offer = {ctaHref: '/buy', ctaLabel: 'Buy lifetime', price: '$100', title: 'Lifetime'};
    const {rerender} = render(<Pricing singleOffer={{...offer, description: 'One payment', features: ['All updates'], note: 'Taxes included'}} tone="dark" variant="single" />);

    expect(screen.getByText('What\'s included')).toBeInTheDocument();
    expect(screen.getByText('All updates')).toBeInTheDocument();
    expect(screen.getByText('One payment')).toBeInTheDocument();
    expect(screen.getByText('Taxes included')).toBeInTheDocument();

    rerender(<Pricing singleOffer={offer} variant="single" />);

    expect(screen.getByRole('link', {name: 'Buy lifetime'})).toHaveAttribute('href', '/buy');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('Taxes included')).not.toBeInTheDocument();
  });

  it.each(['dark', 'gradient'] as const)('switches mobile comparison details in the %s layout', (tone) => {
    const sections = [{features: [
      {name: 'Support', tiers: {Basic: false, Pro: true}},
      {name: 'Seats', tiers: {Basic: '1 seat', Pro: '10 seats'}}
    ], name: 'Included features'}];
    const tiers = [
      {description: 'Getting started', id: 'basic', name: 'Basic', price: '$5', priceSuffix: '/month'},
      {ctaLabel: 'Choose Pro', description: 'For teams', featured: true, href: '/pro', id: 'pro', name: 'Pro', price: '$20', priceSuffix: '/month'}
    ];
    const {rerender} = render(<Pricing comparisonSections={sections} logos={[{alt: 'Customer', src: '/customer.svg'}]} tiers={tiers} tone={tone} variant="comparison" />);

    expect(screen.getByAltText('Customer')).toHaveAttribute('src', '/customer.svg');
    expect(screen.getByText('Included in Pro')).toBeInTheDocument();
    expect(screen.getByText('Not included in Basic')).toBeInTheDocument();
    expect(screen.getAllByText('1 seat')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', {name: 'Pro'}));

    expect(screen.getAllByText('10 seats')).toHaveLength(2);
    expect(screen.getAllByText('1 seat')).toHaveLength(1);
    expect(screen.getByRole('link', {name: 'Choose Pro on the Pro plan'})).toHaveAttribute('href', '/pro');

    rerender(<Pricing comparisonSections={sections} tiers={[tiers[0]]} tone={tone} variant="comparison" />);

    expect(screen.getAllByText('1 seat')).toHaveLength(2);
    expect(screen.queryByRole('button', {name: 'Pro'})).not.toBeInTheDocument();

    rerender(<Pricing comparisonSections={sections} tiers={[]} tone={tone} variant="comparison" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('1 seat')).not.toBeInTheDocument();
  });
});
