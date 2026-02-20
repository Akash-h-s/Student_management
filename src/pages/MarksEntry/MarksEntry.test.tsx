import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import authReducer from '../../store/slices/authSlice';
import MarksEntrySystem from './MarksEntry';
import { GET_STUDENTS_BY_CLASS_SECTION } from '../../graphql/marks';

const createMockStore = (initialState: any) => configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: initialState
  }
});

const mockUser = { id: 101, name: 'John Teacher', role: 'teacher' };

const studentsMock = {
  request: {
    query: GET_STUDENTS_BY_CLASS_SECTION,
    variables: { className: '10', sectionName: 'A' },
  },
  result: {
    data: {
      class_sections: [
        {
          students: [{ id: 1, admission_no: 'S001', name: 'Alice Smith' }]
        }
      ]
    },
  },
};

describe('MarksEntrySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error if fetch clicked without subject/exam', async () => {
    const store = createMockStore({
      user: mockUser,
      isAuthenticated: true
    });

    render(
      <MockedProvider mocks={[studentsMock]} addTypename={false}>
        <Provider store={store}>
          <MarksEntrySystem />
        </Provider>
      </MockedProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g., 10/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g., A/i), { target: { value: 'A' } });

    fireEvent.click(screen.getByRole('button', { name: /Fetch Students/i }));

    expect(await screen.findByText(/Please fill all required fields/i)).toBeInTheDocument();
  });
});