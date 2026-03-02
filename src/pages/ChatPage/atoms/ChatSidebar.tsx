import type{FC} from 'react';
import { MessageCircle, Users, Search } from 'lucide-react';
import { BUTTON_STYLES, EMPTY_STATES, PLACEHOLDERS } from '../constants';
import { EmptyState } from './EmptyState';
import { ChatListItem } from './ChatListItem';
import { ParentListItem } from './ParentListItem';
import { SelectedMemberBadge } from './SelectedMemberBadge';
import { GroupMemberItem } from './GroupMemberItem';
import type { User, Chat, ViewType } from '../types';

interface ChatSidebarProps {
    isTeacher: boolean;
    currentUserName: string;
    currentUserId: number;
    activeView: ViewType;
    chats: Chat[];
    selectedChat: Chat | null;
    searchQuery: string;
    searching: boolean;
    searchResults: User[];
    availableParents: User[];
    groupName: string;
    selectedMembers: User[];

    // Handlers
    handleNewChatClick: () => void;
    handleNewGroupClick: () => void;
    handleChatSelect: (chat: Chat) => void;
    handleSearchChange: (query: string) => void;
    startDirectChat: (parent: User) => void;
    backToChats: () => void;
    setGroupName: (name: string) => void;
    removeMember: (id: number) => void;
    toggleMemberSelection: (parent: User) => void;
    createGroup: () => void;
}

export const ChatSidebar: FC<ChatSidebarProps> = ({
    isTeacher,
    currentUserName,
    currentUserId,
    activeView,
    chats,
    selectedChat,
    searchQuery,
    searching,
    searchResults,
    availableParents,
    groupName,
    selectedMembers,
    handleNewChatClick,
    handleNewGroupClick,
    handleChatSelect,
    handleSearchChange,
    startDirectChat,
    backToChats,
    setGroupName,
    removeMember,
    toggleMemberSelection,
    createGroup
}) => {
    return (
        <div className={`w-full md:w-96 bg-white md:border-r border-b border-gray-200 md:border-b-0 ${selectedChat ? 'hidden md:flex' : 'flex'} flex-col h-full`}>
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
                            {chats.map((chat) => (
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

            {/* New Chat View */}
            {activeView === 'new-chat' && (
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <button onClick={backToChats} className="p-1 hover:bg-gray-100 rounded">←</button>
                        <h2 className="font-semibold text-gray-900">New Chat</h2>
                    </div>
                    <div className="p-4 bg-gray-50">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={PLACEHOLDERS.SEARCH_PARENTS}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {searching ? (
                            <div className="p-8 text-center text-gray-500">Searching...</div>
                        ) : searchResults.length === 0 ? (
                            <EmptyState {...EMPTY_STATES.NO_SEARCH_RESULTS} />
                        ) : (
                            searchResults.map((parent) => (
                                <ParentListItem
                                    key={parent.id}
                                    parent={parent}
                                    onSelect={startDirectChat}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* New Group View */}
            {activeView === 'new-group' && (
                <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <button onClick={backToChats} className="p-1 hover:bg-gray-100 rounded">←</button>
                        <h2 className="font-semibold text-gray-900">New Group</h2>
                    </div>

                    <div className="p-4 bg-white border-b border-gray-100 space-y-4">
                        <input
                            type="text"
                            placeholder={PLACEHOLDERS.GROUP_NAME}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />

                        {selectedMembers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedMembers.map((member) => (
                                    <SelectedMemberBadge
                                        key={member.id}
                                        member={member}
                                        onRemove={removeMember}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {availableParents.map((parent) => (
                            <GroupMemberItem
                                key={parent.id}
                                parent={parent}
                                isSelected={selectedMembers.some(m => m.id === parent.id)}
                                onToggle={toggleMemberSelection}
                            />
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <button
                            onClick={createGroup}
                            disabled={!groupName.trim() || selectedMembers.length === 0}
                            className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${!groupName.trim() || selectedMembers.length === 0
                                ? BUTTON_STYLES.disabled
                                : BUTTON_STYLES.secondary
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            Create Group ({selectedMembers.length} members)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
