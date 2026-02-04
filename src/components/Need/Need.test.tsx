import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Need from './Need';

describe('Need Component', () => {
  it('renders the main heading correctly', () => {
    render(<Need />);
    const heading = screen.getByText(/Why Smart Student Management System\?/i);
    expect(heading).toBeDefined();
  });

  it('renders the problem and solution paragraphs', () => {
    render(<Need />);
    expect(screen.getByText(/Manual record-keeping in schools/i)).toBeDefined();
    expect(screen.getByText(/automates attendance, marks/i)).toBeDefined();
  });

  it('renders the correct number of images for infinite scroll', () => {
    render(<Need />);
    // Total images = (leftColumnImages * 2) + (rightColumnImages * 2) = 6 + 6 = 12
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(12);
  });

  it('applies the correct animation classes', () => {
    const { container } = render(<Need />);
    const downColumn = container.querySelector('.animate-scrollDown');
    const upColumn = container.querySelector('.animate-scrollUp');
    
    expect(downColumn).not.toBeNull();
    expect(upColumn).not.toBeNull();
  });

  it('has a dark background color class', () => {
    const { container } = render(<Need />);
    const section = container.querySelector('section');
    expect(section?.className).toContain('bg-[#0C2B4E]');
  });
});