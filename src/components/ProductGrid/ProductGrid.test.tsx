/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import {render, screen} from '@testing-library/react';

import {ProductGrid} from './ProductGrid.js';

describe('ProductGrid', () => {
  it('renders products', () => {
    render(<ProductGrid products={[{href: '/p', imageAlt: 'Bottle', imageSrc: '/bottle.jpg', name: 'Bottle', price: '$48'}]} />);

    expect(screen.getByRole('link', {name: /Bottle/})).toHaveAttribute('href', '/p');
    expect(screen.getByAltText('Bottle')).toHaveAttribute('src', '/bottle.jpg');
  });
});

test('renders non-linked products with descriptions, colors and badges', () => {
  render(<ProductGrid products={[{
    badge: 'New arrival', colors: ['red', 'blue'], description: 'Insulated steel', id: 'bottle',
    imageAlt: 'Steel bottle', imageSrc: '/steel.jpg', name: 'Bottle'
  }]} />);

  expect(screen.getByRole('article')).toHaveTextContent('Insulated steel');
  expect(screen.getByText('New arrival')).toBeInTheDocument();
  expect(screen.getByLabelText('red')).toHaveStyle({backgroundColor: 'rgb(255, 0, 0)'});
  expect(screen.getByLabelText('blue')).toHaveStyle({backgroundColor: 'rgb(0, 0, 255)'});
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
