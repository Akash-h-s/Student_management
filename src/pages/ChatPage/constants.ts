import { MessageCircle, Search } from 'lucide-react';

export const CHAT_COLORS = {
    group: 'bg-purple-500',
    direct: 'bg-indigo-500',
} as const;

export const BUTTON_STYLES = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700',
    disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed',
} as const;

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const EMPTY_STATES = {
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

export const ALERT_MESSAGES = {
    GROUP_VALIDATION: 'Please enter a group name and select at least one member',
    GROUP_SUCCESS: 'Group created successfully!',
    GROUP_ERROR: 'Failed to create group',
    CHAT_ERROR: 'Error creating chat',
    MESSAGE_ERROR: 'Failed to send message',
} as const;

export const PLACEHOLDERS = {
    SEARCH_PARENTS: 'Search parents by name or email...',
    GROUP_NAME: 'Group name (e.g., Class 10-A Parents)',
    MESSAGE_INPUT: 'Type a message...',
} as const;
