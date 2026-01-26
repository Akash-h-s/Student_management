import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Users, 
  Plus, 
  X, 
  Check,
  UserPlus,
  Hash,
  Clock
} from 'lucide-react';

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'parent';
  student_name?: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

interface Chat {
  id: number;
  type: 'direct' | 'group';
  name: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
}

interface Group {
  id: number;
  name: string;
  created_by: number;
  members: number[];
  member_details: User[];
}

const ChatSystem: React.FC = () => {
  const currentUserId = 1; // Should come from auth context
  const currentUserRole = 'teacher'; // Should come from auth context

  // State
  const [activeView, setActiveView] = useState<'chats' | 'new-chat' | 'new-group'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Group creation
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [availableParents, setAvailableParents] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedChat) {
        loadMessages(selectedChat.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await fetch('http://localhost:3000/hasura/get-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });

      const result = await response.json();
      if (result.success) {
        setChats(result.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch('http://localhost:3000/hasura/get-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, user_id: currentUserId })
      });

      const result = await response.json();
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const searchParents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch('http://localhost:3000/hasura/search-parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_query: query.trim() })  // Changed from 'query' to 'search_query'
      });

      const result = await response.json();
      if (result.success) {
        setSearchResults(result.parents);
      }
    } catch (error) {
      console.error('Error searching parents:', error);
    } finally {
      setSearching(false);
    }
  };

  const startDirectChat = async (parent: User) => {
    try {
      const response = await fetch('http://localhost:3000/hasura/create-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'direct',
          participants: [
            { user_id: currentUserId, user_type: currentUserRole },  // FIXED: Send as object with user_type
            { user_id: parent.id, user_type: 'parent' }              // FIXED: Send as object with user_type
          ]
        })
      });

      const result = await response.json();
      if (result.success) {
        setSelectedChat(result.chat);
        setActiveView('chats');
        setSearchQuery('');
        setSearchResults([]);
        loadChats();
        loadMessages(result.chat.id);
      } else {
        console.error('Failed to create chat:', result.message);
        alert('Failed to create chat: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error creating chat');
    }
  };

  const loadAvailableParents = async () => {
    try {
      const response = await fetch('http://localhost:3000/hasura/get-all-parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const result = await response.json();
      if (result.success) {
        setAvailableParents(result.parents);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/hasura/create-chat', {  // Changed endpoint to create-chat
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'group',
          name: groupName.trim(),
          created_by: currentUserId,
          members: [
            { user_id: currentUserId, user_type: currentUserRole },  // FIXED: Include teacher as object
            ...selectedMembers.map(m => ({ user_id: m.id, user_type: 'parent' }))  // FIXED: Map to objects
          ]
        })
      });

      const result = await response.json();
      if (result.success) {
        setGroupName('');
        setSelectedMembers([]);
        setActiveView('chats');
        loadChats();
        alert('Group created successfully!');
      } else {
        console.error('Failed to create group:', result.message);
        alert('Failed to create group: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const response = await fetch('http://localhost:3000/hasura/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: selectedChat.id,
          sender_id: currentUserId,
          sender_type: currentUserRole,  // FIXED: Added sender_type
          content: messageInput.trim()
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessageInput('');
        loadMessages(selectedChat.id);
        loadChats();
      } else {
        console.error('Failed to send message:', result.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Messages
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveView('new-chat');
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
            
            <button
              onClick={() => {
                setActiveView('new-group');
                setSelectedMembers([]);
                setGroupName('');
                loadAvailableParents();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">New Group</span>
            </button>
          </div>
        </div>

        {/* Chat List or Search */}
        {activeView === 'chats' && (
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <MessageCircle className="w-16 h-16 mb-4" />
                <p className="text-center">No conversations yet</p>
                <p className="text-sm text-center mt-2">Start a new chat or create a group</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      loadMessages(chat.id);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        chat.type === 'group' ? 'bg-purple-500' : 'bg-indigo-500'
                      }`}>
                        {chat.type === 'group' ? (
                          <Users className="w-6 h-6" />
                        ) : (
                          chat.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                          {chat.last_message && (
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(chat.last_message.timestamp)}
                            </span>
                          )}
                        </div>
                        
                        {chat.last_message && (
                          <p className="text-sm text-gray-600 truncate">
                            {chat.last_message.content}
                          </p>
                        )}
                        
                        {chat.unread_count > 0 && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                              {chat.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Chat Search */}
        {activeView === 'new-chat' && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setActiveView('chats')}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
              >
                ← Back to Chats
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search parents by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchParents(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-gray-500">Searching...</div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map(parent => (
                    <button
                      key={parent.id}
                      onClick={() => startDirectChat(parent)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                          {parent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{parent.name}</h3>
                          <p className="text-sm text-gray-500">{parent.email}</p>
                          {parent.student_name && (
                            <p className="text-xs text-gray-400">Parent of {parent.student_name}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <p>No parents found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Search className="w-12 h-12 mb-2" />
                  <p>Search for a parent to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Group */}
        {activeView === 'new-group' && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setActiveView('chats')}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm mb-4"
              >
                ← Back to Chats
              </button>
              
              <input
                type="text"
                placeholder="Group name (e.g., Class 10-A Parents)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />

              <div className="text-sm font-medium text-gray-700 mb-2">
                Selected: {selectedMembers.length} members
              </div>
              
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      <span>{member.name}</span>
                      <button
                        onClick={() => setSelectedMembers(prev => prev.filter(m => m.id !== member.id))}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  groupName.trim() && selectedMembers.length > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create Group
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {availableParents.map(parent => {
                  const isSelected = selectedMembers.some(m => m.id === parent.id);
                  return (
                    <button
                      key={parent.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers(prev => prev.filter(m => m.id !== parent.id));
                        } else {
                          setSelectedMembers(prev => [...prev, parent]);
                        }
                      }}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{parent.name}</h3>
                          <p className="text-sm text-gray-500">{parent.email}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-indigo-500'
                }`}>
                  {selectedChat.type === 'group' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    selectedChat.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.participants.length} members`
                      : 'Direct message'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(message => {
                const isOwn = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && selectedChat.type === 'group' && (
                        <p className="text-xs text-gray-500 mb-1 ml-3">{message.sender_name}</p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'} mx-3`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-lg transition-colors ${
                    messageInput.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-24 h-24 mb-4" />
            <h3 className="text-xl font-medium mb-2">Select a chat to start messaging</h3>
            <p className="text-sm">Choose a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;