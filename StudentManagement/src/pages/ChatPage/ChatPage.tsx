// src/components/ChatSystem.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageCircle, 
  Search, 
  Send, 
  Users, 
  X, 
  Check
} from 'lucide-react';
import {
  GET_USER_CHATS,
  GET_CHAT_MESSAGES,
  SEARCH_PARENTS,
  GET_ALL_PARENTS,
  CREATE_CHAT,
  ADD_CHAT_PARTICIPANTS,
  SEND_MESSAGE,
  MARK_MESSAGES_READ,
  CHECK_EXISTING_CHAT
} from '../../graphql/chat';

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
  sender_type: string;
  content: string;
  created_at: string;
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

const ChatSystem: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const currentUserId = parseInt(currentUser?.id || '0');
  const currentUserRole = currentUser?.role || 'teacher';
  const currentUserName = currentUser?.name || '';

  // State
  const [activeView, setActiveView] = useState<'chats' | 'new-chat' | 'new-group'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group creation
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apollo Queries
  const { data: chatsData, refetch: refetchChats } = useQuery(GET_USER_CHATS, {
    variables: { user_id: currentUserId, user_type: currentUserRole },
    skip: !currentUserId,
    pollInterval: 3000, // Refetch every 3 seconds
  });

  const [getMessages, { data: messagesData }] = useLazyQuery(GET_CHAT_MESSAGES, {
  fetchPolicy: 'network-only', // Always fetch fresh data
  pollInterval: 3000,
});

  const [searchParents, { data: searchData, loading: searching }] = useLazyQuery(SEARCH_PARENTS);
  
  const [getAllParents, { data: allParentsData }] = useLazyQuery(GET_ALL_PARENTS);

  const [checkExistingChat] = useLazyQuery(CHECK_EXISTING_CHAT);

  // Apollo Mutations
  const [createChatMutation] = useMutation(CREATE_CHAT);
  const [addParticipantsMutation] = useMutation(ADD_CHAT_PARTICIPANTS);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [markMessagesReadMutation] = useMutation(MARK_MESSAGES_READ);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  useEffect(() => {
    if (activeView === 'new-chat') {
      searchParents({ variables: { search: '%%' } });
    }
  }, [activeView]);

  // Transform chats data
 // Transform chats data
const chats: Chat[] = React.useMemo(() => {
  if (!chatsData?.chat_participants) return [];
  
  return chatsData.chat_participants.map((cp: any) => {
    const chat = cp.chat;
    
    // Get participants excluding current user
    const participants = chat.chat_participants
      .filter((p: any) => p.user_id !== currentUserId)
      .map((p: any) => {
        // Get user info based on user_type
        const userInfo = p.user_type === 'parent' ? p.parent : p.teacher;
        
        return {
          id: p.user_id,
          name: userInfo?.name || 'Unknown',
          email: userInfo?.email || '',
          role: p.user_type,
        };
      });

    // For direct chats, use participant's name as chat name
    let chatName = chat.name;
    if (chat.type === 'direct' && participants.length > 0) {
      chatName = participants[0].name;
    }

    return {
      id: chat.id,
      type: chat.type,
      name: chatName,
      participants,
      last_message: chat.messages[0] ? {
        id: chat.messages[0].id,
        sender_id: chat.messages[0].sender_id,
        sender_name: chat.messages[0].sender_name,
        sender_type: chat.messages[0].sender_type,
        content: chat.messages[0].content,
        timestamp: chat.messages[0].created_at,
        is_read: chat.messages[0].is_read,
      } : undefined,
      unread_count: chat.messages_aggregate.aggregate.count || 0,
    };
  });
}, [chatsData, currentUserId]);

  // Transform messages data
  const messages: Message[] = React.useMemo(() => {
    if (!messagesData?.messages) return [];
    
    return messagesData.messages.map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id,
      sender_name: m.sender_name,
      sender_type: m.sender_type,
      content: m.content,
      timestamp: m.created_at,
      is_read: m.is_read,
    }));
  }, [messagesData]);

  // Transform search results
  const searchResults: User[] = React.useMemo(() => {
    if (!searchData?.parents) return [];
    
    return searchData.parents.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: 'parent' as const,
      student_name: p.students[0]?.name,
    }));
  }, [searchData]);

  // Transform available parents
  const availableParents: User[] = React.useMemo(() => {
    if (!allParentsData?.parents) return [];
    
    return allParentsData.parents.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: 'parent' as const,
      student_name: p.students[0]?.name,
    }));
  }, [allParentsData]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const searchTerm = query.trim() ? `%${query.trim()}%` : '%%';
    searchParents({ variables: { search: searchTerm } });
  };

  const startDirectChat = async (parent: User) => {
    try {
      // Check if chat already exists
      const { data: existingData } = await checkExistingChat({
        variables: {
          user1_id: currentUserId,
          user1_type: currentUserRole,
          user2_id: parent.id,
          user2_type: 'parent',
        },
      });

      if (existingData?.chats && existingData.chats.length > 0) {
        const existingChat = existingData.chats.find((c: any) => 
          c.chat_participants.length > 0
        );
        
        if (existingChat) {
          const chat: Chat = {
            id: existingChat.id,
            type: 'direct',
            name: parent.name,
            participants: [parent],
            unread_count: 0,
          };
          setSelectedChat(chat);
          getMessages({ variables: { chat_id: existingChat.id } });
          setActiveView('chats');
          setSearchQuery('');
          return;
        }
      }

      // Create new chat
      const { data: chatData } = await createChatMutation({
        variables: {
          type: 'direct',
          name: null,
          created_by: currentUserId,
        },
      });

      if (chatData?.insert_chats_one) {
        const chatId = chatData.insert_chats_one.id;

        // Add participants
        await addParticipantsMutation({
          variables: {
            participants: [
              { chat_id: chatId, user_id: currentUserId, user_type: currentUserRole },
              { chat_id: chatId, user_id: parent.id, user_type: 'parent' },
            ],
          },
        });

        const newChat: Chat = {
          id: chatId,
          type: 'direct',
          name: parent.name,
          participants: [parent],
          unread_count: 0,
        };

        setSelectedChat(newChat);
        getMessages({ variables: { chat_id: chatId } });
        setActiveView('chats');
        setSearchQuery('');
        refetchChats();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Error creating chat');
    }
  };

  const loadAvailableParents = () => {
    getAllParents();
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    try {
      const { data: chatData } = await createChatMutation({
        variables: {
          type: 'group',
          name: groupName.trim(),
          created_by: currentUserId,
        },
      });

      if (chatData?.insert_chats_one) {
        const chatId = chatData.insert_chats_one.id;

        const participants = [
          { chat_id: chatId, user_id: currentUserId, user_type: currentUserRole },
          ...selectedMembers.map(m => ({ 
            chat_id: chatId, 
            user_id: m.id, 
            user_type: 'parent' 
          })),
        ];

        await addParticipantsMutation({
          variables: { participants },
        });

        setGroupName('');
        setSelectedMembers([]);
        setActiveView('chats');
        refetchChats();
        alert('Group created successfully!');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  // Update the sendMessage function in ChatSystem component

const sendMessage = async () => {
  if (!messageInput.trim() || !selectedChat) return;

  const tempMessage = messageInput.trim();
  setMessageInput('');

  try {
    await sendMessageMutation({
      variables: {
        chat_id: selectedChat.id,
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_type: currentUserRole,
        content: tempMessage,
      },
    });

    // Force immediate refetch
    await getMessages({ 
      variables: { chat_id: selectedChat.id },
      fetchPolicy: 'network-only' // Force network request, ignore cache
    });
    
    await refetchChats();

  } catch (error) {
    console.error('Error sending message:', error);
    setMessageInput(tempMessage);
    alert('Failed to send message');
  }
};
  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    getMessages({ variables: { chat_id: chat.id } });

    // Mark messages as read
    if (chat.unread_count > 0) {
      try {
        await markMessagesReadMutation({
          variables: {
            chat_id: chat.id,
            user_id: currentUserId,
          },
        });
        refetchChats();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    let utcTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !timestamp.includes('+')) {
      utcTimestamp = timestamp + 'Z';
    }
    
    const utcDate = new Date(utcTimestamp);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = utcDate.getTime() + istOffset;
    const istDate = new Date(istTime);
    
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + istOffset);
    
    const istDateStr = istDate.toISOString().split('T')[0];
    const nowISTStr = nowIST.toISOString().split('T')[0];
    const isToday = istDateStr === nowISTStr;
    
    const yesterdayIST = new Date(nowIST.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayISTStr = yesterdayIST.toISOString().split('T')[0];
    const isYesterday = istDateStr === yesterdayISTStr;
    
    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
    
    if (isToday) {
      return timeString;
    } else if (isYesterday) {
      return `Yesterday ${timeString}`;
    } else {
      const day = istDate.getUTCDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[istDate.getUTCMonth()];
      return `${day} ${month}, ${timeString}`;
    }
  };

  const isTeacher = currentUserRole === 'teacher';
  const isParent = currentUserRole === 'parent';

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isTeacher ? 'Teacher' : 'Parent'}: {currentUserName}
            </p>
          </div>
          
          {isTeacher && (
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
          )}
        </div>

        {/* Chat List */}
        {activeView === 'chats' && (
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <MessageCircle className="w-16 h-16 mb-4" />
                <p className="text-center">No conversations yet</p>
                {isTeacher && (
                  <p className="text-sm text-center mt-2">Start a new chat with a parent</p>
                )}
                {isParent && (
                  <p className="text-sm text-center mt-2">Your teacher will start a conversation</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        chat.type === 'group' ? 'bg-purple-500' : 'bg-indigo-500'
                      }`}>
                        {chat.type === 'group' ? <Users className="w-6 h-6" /> : chat.name.charAt(0).toUpperCase()}
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
                            {chat.last_message.sender_id === currentUserId ? 'You: ' : ''}
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
        {activeView === 'new-chat' && isTeacher && (
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <Search className="w-12 h-12 mb-2" />
                  <p>No parents found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Group */}
        {activeView === 'new-group' && isTeacher && (
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
                    <div key={member.id} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
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
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
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
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-indigo-500'
                }`}>
                  {selectedChat.type === 'group' ? <Users className="w-5 h-5" /> : selectedChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.type === 'group' ? 
                      `Group • ${selectedChat.participants.length + 1} members` : 
                      isTeacher ? 'Parent' : 'Teacher'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(message => {
                const isOwn = message.sender_id === currentUserId;
                const isTeacherMessage = message.sender_type === 'teacher';
                
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <p className="text-xs text-gray-500 mb-1 ml-3">
                          {message.sender_name}
                          {isTeacherMessage && isParent && ' (Teacher)'}
                        </p>
                      )}
                      <div className={`px-4 py-2 rounded-2xl ${
                        isOwn ? 
                          'bg-indigo-600 text-white rounded-br-sm' : 
                          isTeacherMessage && isParent ?
                            'bg-blue-100 text-gray-900 rounded-bl-sm border border-blue-200' :
                            'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}>
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
                    messageInput.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            <p className="text-sm">Choose a conversation from the left</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;