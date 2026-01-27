// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Users, 
  X, 
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  GET_CHATS,
  MESSAGES_SUBSCRIPTION,
  SEND_MESSAGE,
  CREATE_CHAT,
  SEARCH_PARENTS,
  GET_ALL_PARENTS,
} from '../graphql/queries';

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
  content: string;
  created_at: string;
  sender_type: string;
}

interface Chat {
  id: number;
  type: 'direct' | 'group';
  name: string;
  chat_participants: Array<{ user_id: number; user_type: string }>;
  messages: Message[];
}

export default function ChatPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || 0;
  const currentUserRole = user?.role || 'teacher';

  // State
  const [activeView, setActiveView] = useState<'chats' | 'new-chat' | 'new-group'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GraphQL Queries & Mutations
  const { data: chatsData, refetch: refetchChats } = useQuery(GET_CHATS, {
    variables: { user_id: currentUserId },
    skip: !currentUserId,
  });

  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chat_id: selectedChat?.id },
    skip: !selectedChat,
  });

  const { data: searchData, loading: searching } = useQuery(SEARCH_PARENTS, {
    variables: { search: `%${searchQuery}%` },
    skip: !searchQuery || activeView !== 'new-chat',
  });

  const { data: parentsData } = useQuery(GET_ALL_PARENTS, {
    skip: activeView !== 'new-group',
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessageInput('');
      refetchChats();
    },
  });

  const [createChatMutation] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      const newChat = data.insert_chats_one;
      setSelectedChat(newChat);
      setActiveView('chats');
      setSearchQuery('');
      refetchChats();
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const chats = chatsData?.chats || [];
  const messages = messagesData?.messages || [];
  const searchResults = searchData?.parents || [];
  const availableParents = parentsData?.parents || [];

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    await sendMessageMutation({
      variables: {
        chat_id: selectedChat.id,
        sender_id: currentUserId,
        sender_type: currentUserRole,
        content: messageInput.trim(),
      },
    });
  };

  const handleStartDirectChat = async (parent: User) => {
    await createChatMutation({
      variables: {
        type: 'direct',
        participants: [
          { user_id: currentUserId, user_type: currentUserRole },
          { user_id: parent.id, user_type: 'parent' },
        ],
      },
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    await createChatMutation({
      variables: {
        type: 'group',
        name: groupName.trim(),
        participants: [
          { user_id: currentUserId, user_type: currentUserRole },
          ...selectedMembers.map(m => ({ user_id: m.id, user_type: 'parent' })),
        ],
      },
    });

    setGroupName('');
    setSelectedMembers([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    
    // For direct chats, find the other participant
    const otherParticipant = chat.chat_participants.find(p => p.user_id !== currentUserId);
    // In production, you'd fetch the user's name from a separate query
    return `Chat ${chat.id}`;
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
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </button>
            
            {currentUserRole === 'teacher' && (
              <button
                onClick={() => {
                  setActiveView('new-group');
                  setSelectedMembers([]);
                  setGroupName('');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">New Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
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
                {chats.map((chat: Chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
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
                          getChatName(chat).charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{getChatName(chat)}</h3>
                          {chat.messages[0] && (
                            <span className="text-xs text-gray-500 ml-2">
                              {formatTime(chat.messages[0].created_at)}
                            </span>
                          )}
                        </div>
                        
                        {chat.messages[0] && (
                          <p className="text-sm text-gray-600 truncate">
                            {chat.messages[0].content}
                          </p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  {searchResults.map((parent: any) => (
                    <button
                      key={parent.id}
                      onClick={() => handleStartDirectChat({
                        id: parent.id,
                        name: parent.name,
                        email: parent.email,
                        role: 'parent',
                        student_name: parent.students?.[0]?.name,
                      })}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                          {parent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{parent.name}</h3>
                          <p className="text-sm text-gray-500">{parent.email}</p>
                          {parent.students?.[0] && (
                            <p className="text-xs text-gray-400">Parent of {parent.students[0].name}</p>
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
        {activeView === 'new-group' && currentUserRole === 'teacher' && (
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
                onClick={handleCreateGroup}
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
                {availableParents.map((parent: any) => {
                  const isSelected = selectedMembers.some(m => m.id === parent.id);
                  return (
                    <button
                      key={parent.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMembers(prev => prev.filter(m => m.id !== parent.id));
                        } else {
                          setSelectedMembers(prev => [...prev, {
                            id: parent.id,
                            name: parent.name,
                            email: parent.email,
                            role: 'parent',
                          }]);
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
                    getChatName(selectedChat).charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{getChatName(selectedChat)}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.chat_participants.length} members`
                      : 'Direct message'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message: Message) => {
                const isOwn = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
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
                        {formatTime(message.created_at)}
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
                  onClick={handleSendMessage}
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
}