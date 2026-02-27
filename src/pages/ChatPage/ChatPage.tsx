// src/components/ChatSystem.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMutation, useLazyQuery, useSubscription } from '@apollo/client';
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
  SEARCH_PARENTS,
  GET_ALL_PARENTS,
  CREATE_CHAT,
  ADD_CHAT_PARTICIPANTS,
  SEND_MESSAGE,
  MARK_MESSAGES_READ,
  CHECK_EXISTING_CHAT,
  SUBSCRIBE_USER_CHATS,
  SUBSCRIBE_CHAT_MESSAGES
} from '../../graphql/chat';

// ==================== TYPES ====================
type ViewType = 'chats' | 'new-chat' | 'new-group';
type UserRole = 'teacher' | 'parent';
type ChatType = 'direct' | 'group';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  student_name?: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_type: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

interface Chat {
  id: number;
  type: ChatType;
  name: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
}

// ==================== CONSTANTS ====================
const CHAT_COLORS = {
  group: 'bg-purple-500',
  direct: 'bg-indigo-500',
} as const;

const BUTTON_STYLES = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-purple-600 text-white hover:bg-purple-700',
  disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed',
} as const;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const EMPTY_STATES = {
  NO_CHATS_TEACHER: {
    icon: MessageCircle,
    title: 'No conversations yet',
    subtitle: 'Start a new chat with a parent'
  },
  NO_CHATS_PARENT: {
    icon: MessageCircle,
    title: 'No conversations yet',
    subtitle: 'Your teacher will start a conversation'
  },
  NO_SEARCH_RESULTS: {
    icon: Search,
    title: 'No parents found',
    subtitle: null
  },
  NO_CHAT_SELECTED: {
    icon: MessageCircle,
    title: 'Select a chat to start messaging',
    subtitle: 'Choose a conversation from the left'
  }
} as const;

const ALERT_MESSAGES = {
  GROUP_VALIDATION: 'Please enter a group name and select at least one member',
  GROUP_SUCCESS: 'Group created successfully!',
  GROUP_ERROR: 'Failed to create group',
  CHAT_ERROR: 'Error creating chat',
  MESSAGE_ERROR: 'Failed to send message',
} as const;

const PLACEHOLDERS = {
  SEARCH_PARENTS: 'Search parents by name or email...',
  GROUP_NAME: 'Group name (e.g., Class 10-A Parents)',
  MESSAGE_INPUT: 'Type a message...',
} as const;

// ==================== HELPER FUNCTIONS ====================
const parseUserId = (id: string | number | undefined): number => {
  if (typeof id === 'number') return id;
  return parseInt(id || '0', 10);
};

const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const convertToIST = (utcTimestamp: string): Date => {
  let timestamp = utcTimestamp;
  if (!timestamp.endsWith('Z') && !timestamp.includes('+')) {
    timestamp += 'Z';
  }
  const utcDate = new Date(timestamp);
  return new Date(utcDate.getTime() + IST_OFFSET_MS);
};

const formatTime = (timestamp: string): string => {
  const istDate = convertToIST(timestamp);
  const nowIST = new Date(new Date().getTime() + IST_OFFSET_MS);

  const istDateStr = istDate.toISOString().split('T')[0];
  const nowISTStr = nowIST.toISOString().split('T')[0];
  const yesterdayISTStr = new Date(nowIST.getTime() - DAY_MS).toISOString().split('T')[0];

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const timeString = `${displayHours}:${displayMinutes} ${ampm}`;

  if (istDateStr === nowISTStr) {
    return timeString;
  }

  if (istDateStr === yesterdayISTStr) {
    return `Yesterday ${timeString}`;
  }

  const day = istDate.getUTCDate();
  const month = MONTH_NAMES[istDate.getUTCMonth()];
  return `${day} ${month}, ${timeString}`;
};



const transformChatData = (cp: any, currentUserId: number, currentUserName: string, currentUserRole: string): Chat => {
  const chat = cp.chat;

  const participants = chat.chat_participants
    .filter((p: any) => !(p.user_id === currentUserId && p.user_type === currentUserRole))
    .map((p: any) => {
      const userInfo = p.user_type === 'parent' ? p.parent : p.teacher;
      return {
        id: p.user_id,
        name: userInfo?.name || 'Unknown',
        email: userInfo?.email || '',
        role: p.user_type,
      };
    });

  let chatName = chat.name;
  if (chat.type === 'direct' && participants.length > 0) {
    chatName = participants[0].name;
  }

  // Helper for last message
  const lastMsg = chat.messages[0];
  let lastMsgSenderName = 'Unknown';
  if (lastMsg) {
    if (lastMsg.sender_id === currentUserId) {
      lastMsgSenderName = currentUserName;
    } else {
      const sender = participants.find((p: any) => p.id === lastMsg.sender_id && p.role === lastMsg.sender_type);
      lastMsgSenderName = sender?.name || 'Unknown';
    }
  }

  return {
    id: chat.id,
    type: chat.type,
    name: chatName,
    participants,
    last_message: lastMsg ? {
      id: lastMsg.id,
      sender_id: lastMsg.sender_id,
      sender_name: lastMsgSenderName,
      sender_type: lastMsg.sender_type,
      content: lastMsg.content,
      timestamp: lastMsg.created_at,
      is_read: lastMsg.is_read,
    } : undefined,
    unread_count: chat.messages_aggregate.aggregate.count || 0,
  };
};

const transformMessageData = (m: any, chatParticipants: User[], currentUserId: number, currentUserName: string): Message => {
  let senderName = 'Unknown';
  if (m.sender_id === currentUserId) {
    senderName = currentUserName;
  } else {
    const sender = chatParticipants.find(p => p.id === m.sender_id && p.role === m.sender_type);
    senderName = sender?.name || 'Unknown';
  }

  return {
    id: m.id,
    sender_id: m.sender_id,
    sender_name: senderName,
    sender_type: m.sender_type,
    content: m.content,
    timestamp: m.created_at,
    is_read: m.is_read,
  };
};

const transformUserData = (user: any, role: UserRole): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role,
  student_name: user.students?.[0]?.name,
});

// ==================== SUB-COMPONENTS ====================
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string | null;
}

const EmptyState = React.memo(({ icon: Icon, title, subtitle }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
    <Icon className="w-16 h-16 mb-4" />
    <p className="text-center">{title}</p>
    {subtitle && <p className="text-sm text-center mt-2">{subtitle}</p>}
  </div>
));
EmptyState.displayName = 'EmptyState';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  currentUserId: number;
  onSelect: (chat: Chat) => void;
}

const ChatListItem = React.memo(({ chat, isSelected, currentUserId, onSelect }: ChatListItemProps) => (
  <button
    onClick={() => onSelect(chat)}
    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''
      }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${CHAT_COLORS[chat.type]
        }`}>
        {chat.type === 'group' ? <Users className="w-6 h-6" /> : getInitials(chat.name || 'Unknown')}
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
));
ChatListItem.displayName = 'ChatListItem';

interface ParentListItemProps {
  parent: User;
  onSelect: (parent: User) => void;
}

const ParentListItem = React.memo(({ parent, onSelect }: ParentListItemProps) => (
  <button
    onClick={() => onSelect(parent)}
    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
        {getInitials(parent.name || 'Unknown')}
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
));
ParentListItem.displayName = 'ParentListItem';

interface GroupMemberItemProps {
  parent: User;
  isSelected: boolean;
  onToggle: (parent: User) => void;
}

const GroupMemberItem = React.memo(({ parent, isSelected, onToggle }: GroupMemberItemProps) => (
  <button
    onClick={() => onToggle(parent)}
    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
        }`}>
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{parent.name}</h3>
        <p className="text-sm text-gray-500">{parent.email}</p>
      </div>
    </div>
  </button>
));
GroupMemberItem.displayName = 'GroupMemberItem';

interface SelectedMemberBadgeProps {
  member: User;
  onRemove: (id: number) => void;
}

const SelectedMemberBadge = React.memo(({ member, onRemove }: SelectedMemberBadgeProps) => (
  <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
    <span>{member.name}</span>
    <button
      onClick={() => onRemove(member.id)}
      className="hover:bg-purple-200 rounded-full p-0.5"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
));
SelectedMemberBadge.displayName = 'SelectedMemberBadge';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isParent: boolean;
}

const MessageBubble = React.memo(({ message, isOwn, isParent }: MessageBubbleProps) => {
  const isTeacherMessage = message.sender_type === 'teacher';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <p className="text-xs text-gray-500 mb-1 ml-3">
            {message.sender_name}
            {isTeacherMessage && isParent && ' (Teacher)'}
          </p>
        )}
        <div className={`px-4 py-2 rounded-2xl ${isOwn ?
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
});
MessageBubble.displayName = 'MessageBubble';

interface ChatHeaderProps {
  chat: Chat;
  isTeacher: boolean;
  onBack?: () => void;
}

const ChatHeader = React.memo(({ chat, isTeacher, onBack }: ChatHeaderProps) => (
  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
    <div className="flex items-center gap-3">
      {/* Back button only on small screens */}
      {onBack && (
        <button onClick={onBack} className="md:hidden p-2 rounded-md hover:bg-gray-100 mr-1">
          ←
        </button>
      )}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${CHAT_COLORS[chat.type]
        }`}>
        {chat.type === 'group' ? <Users className="w-5 h-5" /> : getInitials(chat.name)}
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">{chat.name}</h2>
        <p className="text-xs text-gray-500">
          {chat.type === 'group' ?
            `Group • ${chat.participants.length + 1} members` :
            isTeacher ? 'Parent' : 'Teacher'}
        </p>
      </div>
    </div>
  </div>
));
ChatHeader.displayName = 'ChatHeader';

// ==================== MAIN COMPONENT ====================
const ChatSystem: React.FC = () => {
  const { user: currentUser } = useAuth();

  const currentUserId = parseUserId(currentUser?.id);
  const currentUserRole = (currentUser?.role || 'teacher') as UserRole;
  const currentUserName = currentUser?.name || '';

  // State
  const [activeView, setActiveView] = useState<ViewType>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apollo Subscription for User Chats
  const { data: chatsData } = useSubscription(SUBSCRIBE_USER_CHATS, {
    variables: { user_id: currentUserId, user_type: currentUserRole },
    skip: !currentUserId,
  });

  // Apollo Subscription for Chat Messages
  const { data: messagesData } = useSubscription(SUBSCRIBE_CHAT_MESSAGES, {
    variables: { chat_id: selectedChat?.id },
    skip: !selectedChat?.id,
  });

  const [searchParents, { data: searchData, loading: searching }] = useLazyQuery(SEARCH_PARENTS);
  const [getAllParents, { data: allParentsData }] = useLazyQuery(GET_ALL_PARENTS);
  const [checkExistingChat] = useLazyQuery(CHECK_EXISTING_CHAT);

  // Apollo Mutations
  const [createChatMutation] = useMutation(CREATE_CHAT);
  const [addParticipantsMutation] = useMutation(ADD_CHAT_PARTICIPANTS);
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const [markMessagesReadMutation] = useMutation(MARK_MESSAGES_READ);

  // ==================== EFFECTS ====================
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messagesData, scrollToBottom]);

  useEffect(() => {
    if (activeView === 'new-chat') {
      searchParents({ variables: { search: '%%' } });
    }
  }, [activeView, searchParents]);

  // ==================== MEMOIZED DATA ====================
  const chats = useMemo(() => {
    if (!chatsData?.chat_participants) return [];
    // Transform all chats from server
    const transformed = chatsData.chat_participants.map((cp: any) => transformChatData(cp, currentUserId, currentUserName, currentUserRole));

    // Deduplicate by chat id first
    const seenIds = new Set<number>();
    const dedupedById = transformed.filter((c: Chat) => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });

    // Further deduplicate by chat name (prevent same parent showing twice)
    const seenNames = new Set<string>();
    const dedupedByName = dedupedById.filter((c: Chat) => {
      const key = `${c.type}:${c.name}`;
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    // Sort by last message timestamp (most recent first)
    return dedupedByName.sort((a: any, b: any) => {
      const ta = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
      const tb = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
      return tb - ta;
    });
  }, [chatsData, currentUserId, currentUserName]);

  const messages = useMemo(() => {
    if (!messagesData?.messages || !selectedChat) return [];
    return messagesData.messages.map((m: any) => transformMessageData(m, selectedChat.participants, currentUserId, currentUserName));
  }, [messagesData, selectedChat, currentUserId, currentUserName]);

  const searchResults = useMemo(() => {
    if (!searchData?.parents) return [];
    return searchData.parents.map((p: any) => transformUserData(p, 'parent'));
  }, [searchData]);

  const availableParents = useMemo(() => {
    if (!allParentsData?.parents) return [];
    return allParentsData.parents.map((p: any) => transformUserData(p, 'parent'));
  }, [allParentsData]);

  const isTeacher = currentUserRole === 'teacher';
  const isParent = currentUserRole === 'parent';

  // ==================== HANDLERS ====================
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    const searchTerm = query.trim() ? `%${query.trim()}%` : '%%';
    searchParents({ variables: { search: searchTerm } });
  }, [searchParents]);

  const startDirectChat = useCallback(async (parent: User) => {
    try {
      const { data: existingData } = await checkExistingChat({
        variables: {
          user1_id: currentUserId,
          user1_type: currentUserRole,
          user2_id: parent.id,
          user2_type: parent.role || 'parent',
        },
      });

      if (existingData?.chats?.length > 0) {
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
          // getMessages({ variables: { chat_id: existingChat.id } }); // Subscription handles this
          setActiveView('chats');
          setSearchQuery('');
          return;
        }
      }

      const { data: chatData } = await createChatMutation({
        variables: {
          type: 'direct',
          name: null,
          created_by: currentUserId,
        },
      });

      if (chatData?.insert_chats_one) {
        const chatId = chatData.insert_chats_one.id;

        await addParticipantsMutation({
          variables: {
            participants: [
              { chat_id: chatId, user_id: currentUserId, user_type: currentUserRole },
              { chat_id: chatId, user_id: parent.id, user_type: parent.role || 'parent' },
            ].filter((v, i, a) => a.findIndex(t => t.user_id === v.user_id && t.user_type === v.user_type) === i),
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
        // getMessages({ variables: { chat_id: chatId } }); // Subscription handles this
        setActiveView('chats');
        setSearchQuery('');
        // refetchChats(); // Subscription handles this
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert(ALERT_MESSAGES.CHAT_ERROR);
    }
    // getMessages replaced by subscription
  }, [currentUserId, currentUserRole, checkExistingChat, createChatMutation, addParticipantsMutation]);

  const createGroup = useCallback(async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert(ALERT_MESSAGES.GROUP_VALIDATION);
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
        // refetchChats(); // Subscription handles this
        alert(ALERT_MESSAGES.GROUP_SUCCESS);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(ALERT_MESSAGES.GROUP_ERROR);
    }
    // refetchChats replaced by subscription
  }, [groupName, selectedMembers, currentUserId, currentUserRole, createChatMutation, addParticipantsMutation]);

  const sendMessage = useCallback(async () => {
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

      // Subscription handles updates

      // refetchChats(); // Subscription handles this
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageInput(tempMessage);
      alert(ALERT_MESSAGES.MESSAGE_ERROR);
    }
    // getMessages and refetchChats replaced by subscription
  }, [messageInput, selectedChat, currentUserId, currentUserName, currentUserRole, sendMessageMutation]);

  const handleChatSelect = useCallback(async (chat: Chat) => {
    setSelectedChat(chat);
    // getMessages({ variables: { chat_id: chat.id } }); // Subscription handles this

    if (chat.unread_count > 0) {
      try {
        await markMessagesReadMutation({
          variables: {
            chat_id: chat.id,
            user_id: currentUserId,
          },
        });
        // refetchChats(); // Subscription handles this
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
    // getMessages and refetchChats replaced by subscription
  }, [currentUserId, markMessagesReadMutation]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const toggleMemberSelection = useCallback((parent: User) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === parent.id);
      return isSelected
        ? prev.filter(m => m.id !== parent.id)
        : [...prev, parent];
    });
  }, []);

  const removeMember = useCallback((id: number) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const loadAvailableParents = useCallback(() => {
    getAllParents();
  }, [getAllParents]);

  const handleNewChatClick = useCallback(() => {
    setActiveView('new-chat');
    setSearchQuery('');
  }, []);

  const handleNewGroupClick = useCallback(() => {
    setActiveView('new-group');
    setSelectedMembers([]);
    setGroupName('');
    loadAvailableParents();
  }, [loadAvailableParents]);

  const backToChats = useCallback(() => {
    setActiveView('chats');
  }, []);

  // ==================== RENDER ====================
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col md:flex-row">
      {/* Sidebar: hide on small screens when a chat is selected */}
      <div className={`w-full md:w-96 bg-white md:border-r border-b border-gray-200 md:border-b-0 ${selectedChat ? 'hidden md:flex' : 'flex'} flex-col`}>
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
                onClick={handleNewChatClick}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${BUTTON_STYLES.primary}`}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">New Chat</span>
              </button>
              <button
                onClick={handleNewGroupClick}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${BUTTON_STYLES.secondary}`}
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
              <EmptyState {...(isTeacher ? EMPTY_STATES.NO_CHATS_TEACHER : EMPTY_STATES.NO_CHATS_PARENT)} />
            ) : (
              <div className="divide-y divide-gray-100">
                {chats.map((chat: any) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChat?.id === chat.id}
                    currentUserId={currentUserId}
                    onSelect={handleChatSelect}
                  />
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
                onClick={backToChats}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
              >
                ← Back to Chats
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={PLACEHOLDERS.SEARCH_PARENTS}
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
                  {searchResults.map((parent: any) => (
                    <ParentListItem
                      key={parent.id}
                      parent={parent}
                      onSelect={startDirectChat}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState {...EMPTY_STATES.NO_SEARCH_RESULTS} />
              )}
            </div>
          </div>
        )}

        {/* New Group */}
        {activeView === 'new-group' && isTeacher && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={backToChats}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm mb-4"
              >
                ← Back to Chats
              </button>
              <input
                type="text"
                placeholder={PLACEHOLDERS.GROUP_NAME}
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
                    <SelectedMemberBadge
                      key={member.id}
                      member={member}
                      onRemove={removeMember}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${groupName.trim() && selectedMembers.length > 0
                  ? BUTTON_STYLES.secondary
                  : BUTTON_STYLES.disabled
                  }`}
              >
                Create Group
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {availableParents.map((parent: any) => (
                  <GroupMemberItem
                    key={parent.id}
                    parent={parent}
                    isSelected={selectedMembers.some(m => m.id === parent.id)}
                    onToggle={toggleMemberSelection}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className={`${selectedChat ? 'flex-1 flex flex-col' : 'hidden md:flex md:flex-1 md:flex-col'}`}>
        {selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} isTeacher={isTeacher} onBack={() => setSelectedChat(null)} />

            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24 md:pb-0">
              {messages.map((message: any) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === currentUserId}
                  isParent={isParent}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed input on mobile, static on md+ */}
            <div className="bg-white border-t border-gray-200 p-3 fixed bottom-0 left-0 right-0 md:static md:p-4">
              <div className="max-w-7xl mx-auto flex items-end gap-3">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={PLACEHOLDERS.MESSAGE_INPUT}
                  rows={1}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className={`p-3 rounded-lg transition-colors ${messageInput.trim() ? BUTTON_STYLES.primary : BUTTON_STYLES.disabled
                    }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState {...EMPTY_STATES.NO_CHAT_SELECTED} />
        )}
      </div>
    </div>
  );
};

export default ChatSystem;