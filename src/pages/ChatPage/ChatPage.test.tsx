import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import ChatSystem from '../ChatPage/ChatPage';
import { GET_USER_CHATS } from '../../graphql/chat';


const teacherUser = { id: 1, name: 'Prof. McGonagall', role: 'teacher' };

const mocks = [
  {
    request: { query: GET_USER_CHATS, variables: { user_id: 1, user_type: 'teacher' } },
    result: { data: { chat_participants: [] } }, // Empty chat list
  }
];

const renderWithAuth = (user = teacherUser) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={{ user, loading: false } as any}>
        <ChatSystem />
      </AuthContext.Provider>
    </MockedProvider>
  );
};

describe('ChatSystem Integration', () => {
  it('shows administrative buttons for teachers but hides them for parents', () => {
  
    expect(screen.getByText(/New Group/i)).toBeInTheDocument();

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AuthContext.Provider value={{ user: { id: 2, role: 'parent' }, loading: false } as any}>
          <ChatSystem />
        </AuthContext.Provider>
      </MockedProvider>
    );
    expect(screen.queryByText(/New Group/i)).not.toBeInTheDocument();
  });

  // Test 2: View Navigation
  it('switches to new group view when clicking "New Group"', async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/New Group/i));
    expect(screen.getByPlaceholderText(/Group name/i)).toBeInTheDocument();
  });

  // Test 3: Validation Logic
  it('disables "Create Group" button until name and members are present', () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/New Group/i));
    const createBtn = screen.getByRole('button', { name: /Create Group/i });
    expect(createBtn).toBeDisabled();
  });

  // Test 4: Back Navigation
  it('returns to chat list when clicking "Back to Chats"', () => {
    renderWithAuth();
    fireEvent.click(screen.getByText(/New Chat/i));
    fireEvent.click(screen.getByText(/← Back to Chats/i));
    expect(screen.getByText(/Messages/i)).toBeInTheDocument();
  });
});