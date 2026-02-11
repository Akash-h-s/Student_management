import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import Hero from './Hero';
import { GET_DASHBOARD_STATS } from '../../graphql/dashboard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
}));

const mockStats = {
    students_aggregate: { aggregate: { count: 1250 } },
    teachers_aggregate: { aggregate: { count: 85 } },
    admins_aggregate: { aggregate: { count: 12 } },
    parents_aggregate: { aggregate: { count: 950 } },
};

const mocks = [
    {
        request: {
            query: GET_DASHBOARD_STATS,
        },
        result: {
            data: mockStats,
        },
    },
];

describe('Hero Component', () => {
    it('renders the main heading correctly', () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <BrowserRouter>
                    <Hero />
                </BrowserRouter>
            </MockedProvider>
        );

        expect(screen.getByText(/Smart/i)).toBeDefined();
        expect(screen.getByText(/EduCloud/i)).toBeDefined();
    });

    it('renders call to action buttons', () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <BrowserRouter>
                    <Hero />
                </BrowserRouter>
            </MockedProvider>
        );

        expect(screen.getByText(/Get Started Now/i)).toBeDefined();
        expect(screen.getByText(/Sign In to Portal/i)).toBeDefined();
    });

    it('displays loading state initially', () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <BrowserRouter>
                    <Hero />
                </BrowserRouter>
            </MockedProvider>
        );

        const loadingElements = screen.getAllByText('...');
        expect(loadingElements.length).toBeGreaterThan(0);
    });

    it('displays live stats after data is fetched', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <BrowserRouter>
                    <Hero />
                </BrowserRouter>
            </MockedProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('1,250+')).toBeDefined(); // Students
            expect(screen.getByText('85+')).toBeDefined();   // Teachers
            expect(screen.getByText('12+')).toBeDefined();   // Schools (Admins)
            expect(screen.getByText('950+')).toBeDefined();  // Parents
        });
    });

    it('falls back to 0 if data fetching fails', async () => {
        const errorMock = [
            {
                request: {
                    query: GET_DASHBOARD_STATS,
                },
                error: new Error('Failed to fetch'),
            },
        ];

        render(
            <MockedProvider mocks={errorMock} addTypename={false}>
                <BrowserRouter>
                    <Hero />
                </BrowserRouter>
            </MockedProvider>
        );

        // Should show 0 for all stats when error occurs
        await waitFor(() => {
            const zeroStats = screen.getAllByText('0');
            expect(zeroStats.length).toBe(4);
        });
    });
});
