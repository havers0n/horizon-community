import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('should render the button with the correct text', () => {
    render(<Button>Click me</Button>);

    const buttonElement = screen.getByRole('button', { name: /click me/i });

    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent('Click me');
  });

  it('should apply the correct variant class', () => {
    render(<Button variant="destructive">Delete</Button>);

    const buttonElement = screen.getByRole('button', { name: /delete/i });

    expect(buttonElement).toHaveClass('bg-destructive');
  });
});
