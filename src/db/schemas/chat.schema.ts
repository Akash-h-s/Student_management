import type { RxJsonSchema } from 'rxdb';
import type { ChatDoc } from '../types';

export const chatSchema: RxJsonSchema<ChatDoc> = {
    title: 'chat schema',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        type: {
            type: 'string',
            enum: ['direct', 'group']
        },
        name: {
            type: 'string'
        },
        last_message_at: {
            type: 'string',
            format: 'date-time',
            maxLength: 50
        },
        created_by: {
            type: 'string'
        },
        participants: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    email: { type: 'string' }
                }
            }
        }
    },
    required: ['id', 'type', 'last_message_at'],
    indexes: ['last_message_at']
};
