import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatSystem from './ChatPage';
import { AuthContext } from '../../context/AuthContext';

describe('ChatSystem Component', () => {
  beforeEach(() => {
    // FIX: Mock scrollIntoView because JSDOM does not support layout methods
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('updates input value when typing in the message box', async () => {
    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ 
        success: true, 
        chats: [{ id: 1, name: 'Test Chat', type: 'direct', participants: [] }], 
        messages: [] 
      }),
    });
    
    render(
      <AuthContext.Provider value={{ user: { id: 1, role: 'teacher', name: 'John' }, loading: false } as any}>
        <ChatSystem />
      </AuthContext.Provider>
    );

    const chatButton = await screen.findByText('Test Chat');
    fireEvent.click(chatButton);

    const textarea = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('Hello World');
  });
});