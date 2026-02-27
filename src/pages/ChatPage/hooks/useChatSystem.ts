import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMutation, useLazyQuery, useSubscription } from '@apollo/client';
import { useAppSelector } from '../../../store/hooks';
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
} from '../../../graphql/chat';
import { useOfflineChat } from '../../../hooks/useOfflineChat';

import type { ViewType, UserRole, Chat, User, Message } from '../types';
import { ALERT_MESSAGES } from '../constants';
import {
    parseUserId,
    transformChatData,
    transformMessageData,
    transformUserData
} from '../utils';

export const useChatSystem = () => {
    const currentUser = useAppSelector((state) => state.auth.user);

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
    const [localMessages, setLocalMessages] = useState<any[]>([]);

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

    const { db, localChats, persistChats, persistMessages } = useOfflineChat(currentUserId);

    // Effects
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

    // Subscribe to local messages when chat is selected
    useEffect(() => {
        if (!db || !selectedChat) {
            setLocalMessages([]);
            return;
        }

        const sub = db.messages.find({
            selector: { chat_id: selectedChat.id.toString() },
            sort: [{ created_at: 'asc' }]
        }).$.subscribe((docs: any[]) => {
            if (docs) {
                setLocalMessages(docs.map((d: any) => {
                    const doc = d.toJSON();
                    return {
                        id: parseInt(doc.id),
                        chat_id: parseInt(doc.chat_id),
                        content: doc.content,
                        timestamp: doc.created_at,
                        sender_id: parseInt(doc.sender_id),
                        sender_name: doc.sender_name || 'User',
                        sender_type: doc.sender_type,
                        is_own: parseInt(doc.sender_id) === currentUserId,
                        is_read: doc.is_read,
                        status: doc.status
                    };
                }));
            }
        });

        return () => sub.unsubscribe();
    }, [db, selectedChat, currentUserId]);

    // Memoized Data
    const chats = useMemo(() => {
        let transformed: Chat[] = [];
        if (chatsData?.chat_participants) {
            transformed = (chatsData.chat_participants as any[]).map((cp: any) => transformChatData(cp, currentUserId, currentUserName));
        }

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
        const sorted = dedupedByName.sort((a: any, b: any) => {
            const ta = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
            const tb = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
            return tb - ta;
        });

        if (dedupedByName.length > 0) {
            return sorted;
        }

        if (localChats.length > 0) {
            console.log(`[Chat] Falling back to ${localChats.length} local chats`);
            return localChats.map((lc: any) => ({
                ...lc,
                id: parseInt(lc.id),
                participants: (lc.participants || []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    email: p.email || ''
                })),
                unread_count: 0,
                last_message: {
                    id: 0,
                    sender_id: 0,
                    sender_name: 'Offline',
                    sender_type: 'system',
                    content: 'Syncing...',
                    timestamp: lc.last_message_at,
                    is_read: true
                }
            })) as Chat[];
        }
        return [];
    }, [chatsData, currentUserId, currentUserName, localChats]);

    const onlineMsgs = useMemo((): Message[] => {
        if (!selectedChat || !messagesData?.messages) return [];
        return (messagesData.messages as any[]).map((m: any) =>
            transformMessageData(m, selectedChat.participants, currentUserId, currentUserName)
        );
    }, [messagesData, selectedChat, currentUserId, currentUserName]);

    const messages = useMemo(() => {
        if (!selectedChat) return [];

        // Get all local messages for this chat
        const relevantLocal = localMessages.filter(m => m.chat_id === selectedChat.id);

        // Merge online and local. Online data is source of truth.
        const combined = [...onlineMsgs];
        relevantLocal.forEach(lm => {
            // Deduplicate: if an online message exists with same ID or similar content/time
            const existsOnline = onlineMsgs.some(om =>
                om.id === lm.id ||
                (om.content === lm.content &&
                    Math.abs(new Date(om.timestamp).getTime() - new Date(lm.timestamp).getTime()) < 60000) // 1 minute tolerance
            );
            if (!existsOnline) {
                combined.push(lm);
            }
        });

        // Sort by timestamp
        return combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [onlineMsgs, selectedChat, localMessages]);

    // Background sync for pending messages (Outbox Pattern)
    const isSyncing = useRef(false);
    useEffect(() => {
        if (!db || !currentUserId) return;

        const interval = setInterval(async () => {
            if (isSyncing.current || !navigator.onLine) return;

            try {
                const pending = await db.messages.find({
                    selector: {
                        status: 'sending',
                        sender_id: currentUserId.toString()
                    }
                }).exec();

                if (pending.length === 0) return;

                isSyncing.current = true;
                console.log(`[Sync] Processing ${pending.length} pending messages...`);

                for (const msgDoc of pending) {
                    const msg = msgDoc.toJSON();
                    try {
                        const { data } = await sendMessageMutation({
                            variables: {
                                chat_id: parseInt(msg.chat_id),
                                sender_id: parseInt(msg.sender_id),
                                sender_name: msg.sender_name,
                                sender_type: msg.sender_type,
                                content: msg.content,
                            },
                        });

                        if (data?.insert_messages_one) {
                            await msgDoc.remove();
                            console.log('[Sync] Message delivered and removed from outbox');
                        }
                    } catch (err) {
                        console.warn('[Sync] Failed to send message, will retry:', err);
                        break; // Stop loop if network/server error
                    }
                }
            } catch (err) {
                console.error('[Sync] Error in outbox check:', err);
            } finally {
                isSyncing.current = false;
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [db, currentUserId, sendMessageMutation]);

    // Update local cache when new chats arrive
    useEffect(() => {
        if (chatsData?.chat_participants && chats.length > 0 && !chatsData?.error) {
            persistChats(chats);
        }
    }, [chats, chatsData, persistChats]);

    // Update local cache when new messages arrive (ONLY persist online ones)
    useEffect(() => {
        if (onlineMsgs.length > 0 && selectedChat) {
            persistMessages(selectedChat.id.toString(), onlineMsgs);
        }
    }, [onlineMsgs, selectedChat, persistMessages]);

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

    // Handlers
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
                    user2_type: 'parent',
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
                setActiveView('chats');
                setSearchQuery('');
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            alert(ALERT_MESSAGES.CHAT_ERROR);
        }
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
                alert(ALERT_MESSAGES.GROUP_SUCCESS);
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert(ALERT_MESSAGES.GROUP_ERROR);
        }
    }, [groupName, selectedMembers, currentUserId, currentUserRole, createChatMutation, addParticipantsMutation]);

    const sendMessage = useCallback(async () => {
        if (!messageInput.trim() || !selectedChat) return;

        const tempMessage = messageInput.trim();
        setMessageInput('');
        const timestamp = new Date().toISOString();
        const tempId = Date.now().toString();

        const insertOffline = async () => {
            if (db) {
                console.log('[Chat] Saving message to local outbox');
                try {
                    await db.messages.insert({
                        id: tempId,
                        chat_id: selectedChat.id.toString(),
                        sender_id: currentUserId.toString(),
                        sender_name: currentUserName,
                        sender_type: currentUserRole,
                        content: tempMessage,
                        created_at: timestamp,
                        is_read: false,
                        status: 'sending'
                    });
                } catch (err) {
                    console.error('[RxDB] Failed to insert offline message:', err);
                }
            }
        };

        // If explicitly offline, skip mutation to avoid console noise/delays
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            await insertOffline();
            return;
        }

        try {
            // Check if token exists before even trying
            if (!localStorage.getItem('token')) {
                alert('Unauthorized: No active session found. Please login.');
                return;
            }

            await sendMessageMutation({
                variables: {
                    chat_id: selectedChat.id,
                    sender_id: currentUserId,
                    sender_name: currentUserName,
                    sender_type: currentUserRole,
                    content: tempMessage,
                },
            });
        } catch (error: any) {
            console.error('[Chat] Error sending message:', error);

            const isUnauthorized =
                error?.networkError?.statusCode === 401 ||
                error?.graphQLErrors?.some((e: any) => {
                    const code = e.extensions?.code?.toLowerCase();
                    return ['unauthorized', 'invalid-jwt', 'access-denied', 'no-role-found'].includes(code);
                }) ||
                error.message?.toLowerCase().includes('jwt') ||
                error.message?.toLowerCase().includes('unauthorized');

            if (isUnauthorized) {
                console.error('[Chat] Unauthorized message attempt blocked');
                // The apolloClient error link will handle the logout/alert
                return;
            }

            console.warn('[Chat] Mutation failed, falling back to offline outbox');
            await insertOffline();
        }
    }, [messageInput, selectedChat, currentUserId, currentUserName, currentUserRole, sendMessageMutation, db]);

    const handleChatSelect = useCallback(async (chat: Chat) => {
        setSelectedChat(chat);

        if (chat.unread_count > 0) {
            try {
                await markMessagesReadMutation({
                    variables: {
                        chat_id: chat.id,
                        user_id: currentUserId,
                    },
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }
    }, [currentUserId, markMessagesReadMutation]);

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

    return {
        currentUser,
        currentUserId,
        currentUserName,
        currentUserRole,
        isTeacher,
        isParent,
        activeView,
        setActiveView,
        selectedChat,
        setSelectedChat,
        messageInput,
        setMessageInput,
        searchQuery,
        setSearchQuery,
        groupName,
        setGroupName,
        selectedMembers,
        setSelectedMembers,
        messagesEndRef,
        chats,
        messages,
        searchResults,
        availableParents,
        searching,
        handleSearchChange,
        startDirectChat,
        createGroup,
        sendMessage,
        handleChatSelect,
        toggleMemberSelection,
        removeMember,
        handleNewChatClick,
        handleNewGroupClick,
        backToChats
    };
};
