import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  beforeEach(() => cleanup());

  it('renders children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card.className).toContain('rounded-xl');
    expect(card.className).toContain('bg-surface-2');
  });

  it('renders with elevated variant', () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-lg');
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-card');
  });

  it('renders empty card', () => {
    const { container } = render(<Card />);
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card.children.length).toBe(0);
  });

  it('renders with complex children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Paragraph</p>
        <button>Button</button>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});
