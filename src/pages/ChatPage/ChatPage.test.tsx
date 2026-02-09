import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { AuthContext } from '../../context/AuthContext';
import ChatSystem from './ChatPage';
import { SUBSCRIBE_USER_CHATS, SUBSCRIBE_CHAT_MESSAGES, SEARCH_PARENTS, SEND_MESSAGE } from '../../graphql/chat';

// Mock scrollIntoView as it's not implemented in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockUser = { id: 1, name: 'Teacher John', role: 'teacher' };

describe('ChatSystem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1: Initial Render & Empty State
  it('renders the sidebar and the default empty state for a teacher', async () => {
    const mocks = [
      {
        request: {
          query: SUBSCRIBE_USER_CHATS,
          variables: { user_id: 1, user_type: 'teacher' },
        },
        result: { data: { chat_participants: [] } },
      },
    ];

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
          <ChatSystem />
        </AuthContext.Provider>
      </MockedProvider>
    );

    expect(screen.getByText(/Teacher: Teacher John/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a chat to start messaging/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Chat/i })).toBeInTheDocument();
  });

  // TEST 2: Searching for Parents (Flow)
  it('navigates to "New Chat" and searches for parents', async () => {
    const chatSubMock = {
      request: {
        query: SUBSCRIBE_USER_CHATS,
        variables: { user_id: 1, user_type: 'teacher' },
      },
      result: { data: { chat_participants: [] } },
    };

    const searchMock = {
      request: {
        query: SEARCH_PARENTS,
        variables: { search: '%Alice%' },
      },
      result: {
        data: {
          parents: [
            { id: 10, name: 'Alice Parent', email: 'alice@test.com', students: [{ name: 'Bob' }] }
          ],
        },
      },
    };

    render(
      <MockedProvider mocks={[chatSubMock, searchMock]} addTypename={false}>
        <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
          <ChatSystem />
        </AuthContext.Provider>
      </MockedProvider>
    );

    // Click New Chat
    fireEvent.click(screen.getByRole('button', { name: /New Chat/i }));

    // Type in search
    const searchInput = screen.getByPlaceholderText(/Search parents/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Wait for result to appear
    const parentResult = await screen.findByText('Alice Parent');
    expect(parentResult).toBeInTheDocument();
    expect(screen.getByText(/Parent of Bob/i)).toBeInTheDocument();
  });

  // TEST 3: Sending a Message
  it('allows the user to type and send a message in an active chat', async () => {
    // 1. Mock for initial chat list (Subscription)
    const chatListMock = {
      request: { query: SUBSCRIBE_USER_CHATS, variables: { user_id: 1, user_type: 'teacher' } },
      result: {
        data: {
          chat_participants: [{
            chat: {
              id: 500, type: 'direct', name: 'Alice Parent',
              chat_participants: [
                { user_id: 10, user_type: 'parent', parent: { id: 10, name: 'Alice Parent', email: 'a@a.com' } }
              ],
              messages: [],
              messages_aggregate: { aggregate: { count: 0 } }
            }
          }]
        }
      }
    };

    // 2. Mock for chat messages (Subscription)
    const chatMessagesMock = {
      request: { query: SUBSCRIBE_CHAT_MESSAGES, variables: { chat_id: 500 } },
      result: {
        data: {
          messages: []
        }
      }
    };

    // 3. Mock for sending message
    const sendMessageMock = {
      request: {
        query: SEND_MESSAGE,
        variables: {
          chat_id: 500,
          sender_id: 1,
          sender_name: 'Teacher John',
          sender_type: 'teacher',
          content: 'Hello Alice',
        },
      },
      result: { data: { insert_messages_one: { id: 1001, sender_id: 1, sender_type: 'teacher', content: 'Hello Alice', created_at: new Date().toISOString(), is_read: false } } },
    };

    render(
      <MockedProvider mocks={[chatListMock, chatMessagesMock, sendMessageMock]} addTypename={false}>
        <AuthContext.Provider value={{ user: mockUser, loading: false } as any}>
          <ChatSystem />
        </AuthContext.Provider>
      </MockedProvider>
    );

    // Select the chat from sidebar
    const chatTab = await screen.findByText('Alice Parent');
    fireEvent.click(chatTab);

    // Type message
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello Alice' } });

    // Send message
    // The send button might be an icon button without text, relying on aria-label or just the SVG
    // In the component, it's <Send className="w-5 h-5" /> inside a button. 
    // Best to find by role 'button' and maybe the container or just the last button in that section.
    // Or if checking the code, the button wraps the input group or is next to it.
    // Let's assume there is only one button in the input area or we can find it by generic role if it's the only one nearby.
    // Given the previous test used `getByRole('button', { name: '' })`, we'll try to be more specific if possible or stick to that if it worked.
    // Actually, let's verify if there is an aria-label. The code didn't show one explicitly but the previous test implies it was finding it.
    // I'll add a helper to find it.

    // Note: In the previous test code provided (lines 133-134):
    // const sendButton = screen.getByRole('button', { name: '' }); 

    // I'll proceed with finding the button that contains the Send icon if possible or just the submit button.
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1]; // Usually the last button is the send button in the chat interface
    fireEvent.click(sendButton);

    // Verify input cleared (optimistic UI check)
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});