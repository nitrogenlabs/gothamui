/* @vitest-environment jsdom */
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import {NotFound} from './NotFound.js';
import {Rss} from 'lucide-react';

describe('NotFound', () => {
  it('renders the simple 404 state by default', () => {
    render(<NotFound supportHref="/support" />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Page not found'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Go back home'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', {name: /Contact support/})).toHaveAttribute('href', '/support');
  });

  it('renders popular page links', () => {
    render(
      <NotFound
        links={[
          {description: 'Read the docs.', href: '/docs', label: 'Docs'},
          {href: '/status', label: 'Status'}
        ]}
        variant="popular"
      />
    );

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('link', {name: 'Status'})).toHaveAttribute('href', '/status');
  });

  it('renders a background image layout', () => {
    render(<NotFound backgroundImageAlt="Lost road" backgroundImageSrc="/lost-road.jpg" variant="background" />);

    expect(screen.getByRole('img', {name: 'Lost road'})).toHaveAttribute('src', '/lost-road.jpg');
    expect(screen.getByRole('link', {name: /Go back home/})).toHaveAttribute('href', '/');
  });

  it('renders split layout footer links and image', () => {
    render(
      <NotFound
        footerLinks={[{href: '/help', label: 'Help'}, {href: '/status', label: 'Status'}]}
        imageAlt="Desk"
        imageSrc="/desk.jpg"
        logo={<span>Logo</span>}
        variant="split"
      />
    );

    expect(screen.getByRole('link', {name: 'Logo'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', {name: 'Help'})).toHaveAttribute('href', '/help');
    expect(screen.getByRole('img', {name: 'Desk'})).toHaveAttribute('src', '/desk.jpg');
  });

  it('renders popular footer content and social links', () => {
    render(
      <NotFound
        copyright="Copyright GothamUI"
        socialLinks={[{href: '/feed', icon: Rss, label: 'RSS'}]}
        variant="popular"
      />
    );

    expect(screen.getByText('Copyright GothamUI')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'RSS'})).toHaveAttribute('href', '/feed');
  });
});
