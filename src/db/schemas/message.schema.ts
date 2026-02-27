import type { RxJsonSchema } from 'rxdb';
import type { MessageDoc } from '../types';

export const messageSchema: RxJsonSchema<MessageDoc> = {
    title: 'message schema',
    version: 2,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        chat_id: {
            type: 'string',
            maxLength: 100
        },
        sender_id: {
            type: 'string'
        },
        sender_type: {
            type: 'string'
        },
        sender_name: {
            type: 'string'
        },
        content: {
            type: 'string'
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            maxLength: 50
        },
        is_read: {
            type: 'boolean'
        },
        status: {
            type: 'string',
            enum: ['sending', 'sent', 'read', 'error']
        }
    },
    required: ['id', 'chat_id', 'sender_id', 'content', 'created_at', 'status'],
    indexes: ['chat_id', 'created_at']
};
