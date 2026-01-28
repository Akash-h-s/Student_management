// src/components/AboutUs/AboutUs.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutUs from './AboutUs';

// Helper function to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AboutUs Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithRouter(<AboutUs />);
    expect(container).toBeTruthy();
  });

  it('should render the component in the document', () => {
    const { container } = renderWithRouter(<AboutUs />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have some content', () => {
    const { container } = renderWithRouter(<AboutUs />);
    expect(container.innerHTML).not.toBe('');
  });
});