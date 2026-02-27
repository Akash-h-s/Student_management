import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRxDB } from '../db/RxDBContext';
import type { ChatDoc } from '../db/types';

export const useOfflineChat = (currentUserId: number | null) => {
    const db = useRxDB();
    const [localChats, setLocalChats] = useState<ChatDoc[]>([]);

    // Subscribe to local chats - only those where the current user is a participant
    useEffect(() => {
        if (!db || !currentUserId) return;

        console.log('[RxDB] Subscribing to local chats for user:', currentUserId);
        const sub = db.chats.find({
            selector: {
                participants: {
                    $elemMatch: {
                        id: { $eq: currentUserId }
                    }
                }
            },
            sort: [{ last_message_at: 'desc' }]
        }).$.subscribe((docs: any[]) => {
            if (docs) {
                const data = docs.map(d => d.toJSON());
                console.log(`[RxDB] Loaded ${data.length} local chats for user ${currentUserId}`);
                setLocalChats(data);
            }
        });

        return () => sub.unsubscribe();
    }, [db, currentUserId]);

    // Helper to ensure date strings match ISO 8601 format required by RxDB
    const formatISO = (dateStr: string) => {
        if (!dateStr) return new Date().toISOString();
        // If it's missing timezone suffix, add Z
        if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+')) {
            return `${dateStr}Z`;
        }
        return dateStr;
    };

    // Save chats to RxDB - using bulkUpsert for performance
    const persistChats = useCallback(async (chats: any[]) => {
        if (!db || chats.length === 0) return;

        console.log('[RxDB] Persisting chats:', chats.length);
        try {
            const docs = chats.map(chat => ({
                id: chat.id.toString(),
                type: chat.type,
                name: chat.name,
                last_message_at: formatISO(chat.last_message?.timestamp || new Date().toISOString()),
                participants: (chat.participants || []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    email: p.email || ''
                }))
            }));

            await db.chats.bulkUpsert(docs);
        } catch (err) {
            console.error('[RxDB] Error persisting chats:', err);
        }
    }, [db]);

    // Save messages to RxDB - using bulkUpsert for performance
    const persistMessages = useCallback(async (chatId: string, messages: any[]) => {
        if (!db || messages.length === 0) return;

        console.log(`[RxDB] Persisting ${messages.length} messages for chat ${chatId}`);
        try {
            const docs = messages.map(msg => ({
                id: msg.id.toString(),
                chat_id: chatId.toString(),
                sender_id: msg.sender_id.toString(),
                sender_name: msg.sender_name || 'User',
                sender_type: msg.sender_type,
                content: msg.content || '',
                created_at: formatISO(msg.timestamp),
                is_read: !!msg.is_read,
                status: msg.status || (msg.is_read ? 'read' : 'sent')
            }));

            await db.messages.bulkUpsert(docs);
        } catch (err) {
            console.error('[RxDB] Error persisting messages:', err);
        }
    }, [db]);

    return useMemo(() => ({
        localChats,
        persistChats,
        persistMessages,
        db
    }), [localChats, persistChats, persistMessages, db]);
};
