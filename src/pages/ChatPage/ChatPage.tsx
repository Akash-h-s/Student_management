import React from 'react';
import { useChatSystem } from './hooks/useChatSystem';
import { ChatSidebar } from './atoms/ChatSidebar';
import { ChatMainArea } from './atoms/ChatMainArea';

const ChatSystem: React.FC = () => {
  const {
    currentUserId,
    currentUserName,
    isTeacher,
    isParent,
    activeView,
    selectedChat,
    setSelectedChat,
    chats,
    searchQuery,
    searching,
    searchResults,
    availableParents,
    groupName,
    selectedMembers,
    messageInput,
    setMessageInput,
    messages,
    messagesEndRef,
    handleNewChatClick,
    handleNewGroupClick,
    handleChatSelect,
    handleSearchChange,
    startDirectChat,
    backToChats,
    setGroupName,
    removeMember,
    toggleMemberSelection,
    createGroup,
    sendMessage
  } = useChatSystem();

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col md:flex-row">
      <ChatSidebar
        isTeacher={isTeacher}
        currentUserName={currentUserName}
        currentUserId={currentUserId}
        activeView={activeView}
        chats={chats}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        searching={searching}
        searchResults={searchResults}
        availableParents={availableParents}
        groupName={groupName}
        selectedMembers={selectedMembers}
        handleNewChatClick={handleNewChatClick}
        handleNewGroupClick={handleNewGroupClick}
        handleChatSelect={handleChatSelect}
        handleSearchChange={handleSearchChange}
        startDirectChat={startDirectChat}
        backToChats={backToChats}
        setGroupName={setGroupName}
        removeMember={removeMember}
        toggleMemberSelection={toggleMemberSelection}
        createGroup={createGroup}
      />

      <ChatMainArea
        selectedChat={selectedChat}
        isTeacher={isTeacher}
        isParent={isParent}
        messages={messages}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sendMessage={sendMessage}
        setSelectedChat={setSelectedChat}
      />
    </div>
  );
};

export default ChatSystem;