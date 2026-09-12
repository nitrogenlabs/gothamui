/* @vitest-environment jsdom */
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import {Footer} from './Footer.js';

describe('Footer', () => {
  it('renders brand, links, support email, and copyright', () => {
    render(
      <Footer
        brand={<span>GothamUI</span>}
        copyright="Copyright 2026 GothamUI"
        links={[
          {href: '/docs', label: 'Docs'},
          {href: '/blog', label: 'Blog'}
        ]}
        supportEmail="help@gothamui.io"
        supportLabel="Help Desk"
      />
    );

    expect(screen.getByText('GothamUI')).toBeInTheDocument();
    expect(screen.getByRole('navigation', {name: 'Footer'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', {name: 'Blog'})).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', {name: 'Help Desk'})).toHaveAttribute('href', 'mailto:help@gothamui.io');
    expect(screen.getByText('Copyright 2026 GothamUI')).toBeInTheDocument();
  });

  it('does not render a support link for a blank support email', () => {
    render(<Footer supportEmail="   " />);

    expect(screen.queryByRole('link', {name: 'Support'})).not.toBeInTheDocument();
  });

  it('uses the default support label when a support email is provided', () => {
    render(<Footer supportEmail="support@gothamui.io" />);

    expect(screen.getByRole('link', {name: 'Support'})).toHaveAttribute('href', 'mailto:support@gothamui.io');
  });

  it('renders the large footer variant with grouped links and social links', () => {
    render(
      <Footer
        brand={<span>GothamUI</span>}
        copyright="Copyright 2026 GothamUI"
        description="Operational UI components for ambitious apps."
        linkGroups={[
          {
            title: 'Solutions',
            links: [
              {href: '/stacks', label: 'Stack Management'}
            ]
          },
          {
            title: 'Legal',
            links: [
              {href: '/privacy', label: 'Privacy policy'}
            ]
          }
        ]}
        socialLinks={[
          {href: '/github', label: 'GitHub', icon: <span aria-hidden="true">GH</span>}
        ]}
        variant="large"
      />
    );

    expect(screen.getByText('GothamUI')).toBeInTheDocument();
    expect(screen.getByText('Operational UI components for ambitious apps.')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Stack Management'})).toHaveAttribute('href', '/stacks');
    expect(screen.getByRole('link', {name: 'Privacy policy'})).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', {name: 'GitHub'})).toHaveAttribute('href', '/github');
    expect(screen.getByText('Copyright 2026 GothamUI')).toBeInTheDocument();
  });
});
