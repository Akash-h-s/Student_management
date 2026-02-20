import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import TeacherDashboard from './TeacherDashboard';

const createMockStore = (initialState: any) => configureStore({
    reducer: {
        auth: authReducer,
    },
    preloadedState: {
        auth: initialState
    }
});

const meta: Meta<typeof TeacherDashboard> = {
    title: 'Pages/Dashboards/Teacher',
    component: TeacherDashboard,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TeacherDashboard>;

export const Default: Story = {
    decorators: [
        (Story) => (
            <Provider store={createMockStore({
                user: { id: 2, name: 'Prof. McGonagall', role: 'teacher', email: 'minerva@hogwarts.edu' },
                isAuthenticated: true,
                loading: false
            })}>
                <Story />
            </Provider>
        )
    ]
};
