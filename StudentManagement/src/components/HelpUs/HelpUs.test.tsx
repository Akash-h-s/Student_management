import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HelpUs from './HelpUs';
import '@testing-library/jest-dom';

describe('HelpUs Component', () => {
  it('should render all four guide sections', () => {
    render(<HelpUs />);
    expect(screen.getByText(/Admin Guide Made Simple/i)).toBeInTheDocument();
    expect(screen.getByText(/Teacher Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Parent Guide/i)).toBeInTheDocument();
  });

  it('should render correct steps for the Teacher Guide', () => {
    render(<HelpUs />);
    expect(screen.getByText(/Assign homework and grades/i)).toBeInTheDocument();
  });

  it('should render images with appropriate alt text', () => {
    render(<HelpUs />);
    const adminImg = screen.getByAltText(/Admin Guide Made Simple/i);
    expect(adminImg).toBeInTheDocument();
  });

  it('verifies the zigzag layout logic (even/odd index check)', () => {
    const { container } = render(<HelpUs />);
    
    // Select the wrapper divs for each guide
    const guideRows = container.querySelectorAll('.flex-col.md\\:flex-row');
    
    /**
     * Index 0 (Admin Guide): isImageLeft = false
     * Structure should be: [Text Content Div] then [Image Div]
     */
    const adminRowFirstChild = guideRows[0].firstElementChild;
    // The first child should NOT contain the image
    expect(adminRowFirstChild?.querySelector('img')).toBeNull();

    /**
     * Index 1 (Teacher Guide): isImageLeft = true
     * Structure should be: [Image Div] then [Text Content Div]
     */
    const teacherRowFirstChild = guideRows[1].firstElementChild;
    // The first child SHOULD contain the image
    expect(teacherRowFirstChild?.querySelector('img')).not.toBeNull();
  });
});