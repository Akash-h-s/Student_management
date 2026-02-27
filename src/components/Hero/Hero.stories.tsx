import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import Hero from './Hero';
import { GET_DASHBOARD_STATS } from '../../graphql/dashboard';

const meta: Meta<typeof Hero> = {
    title: 'Components/Hero',
    component: Hero,
    decorators: [
        (Story) => (
            <BrowserRouter>
                {Story()}
            </BrowserRouter>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Hero>;

const mockData = {
    students_aggregate: { aggregate: { count: 1250 } },
    teachers_aggregate: { aggregate: { count: 85 } },
    admins_aggregate: { aggregate: { count: 12 } },
    parents_aggregate: { aggregate: { count: 950 } },
};

export const Default: Story = {
    decorators: [
        (Story) => (
            <MockedProvider
                mocks={[
                    {
                        request: {
                            query: GET_DASHBOARD_STATS,
                        },
                        result: {
                            data: mockData,
                        },
                    },
                ]}
                addTypename={false}
            >
                {Story()}
            </MockedProvider>
        ),
    ],
};

export const Loading: Story = {
    decorators: [
        (Story) => (
            <MockedProvider mocks={[]} addTypename={false}>
                {Story()}
            </MockedProvider>
        ),
    ],
};

export const StatsError: Story = {
    decorators: [
        (Story) => (
            <MockedProvider
                mocks={[
                    {
                        request: {
                            query: GET_DASHBOARD_STATS,
                        },
                        error: new Error('Failed to fetch stats'),
                    },
                ]}
                addTypename={false}
            >
                {Story()}
            </MockedProvider>
        ),
    ],
};
