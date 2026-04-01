import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/authStore";
import { formatMessageTime } from "../lib/utils";

const CONTINUOUS_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const isContinuous = (prevMessage, currMessage) => {
  if (!prevMessage) return false;
  if (prevMessage.senderId !== currMessage.senderId) return false;
  const timeDiff = new Date(currMessage.createdAt) - new Date(prevMessage.createdAt);
  return timeDiff < CONTINUOUS_THRESHOLD_MS;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { user } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  // Extracted to keep the template cleaner
  const BASE_URL = "http://localhost:5000";

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const continuous = isContinuous(prevMessage, message);
          const isMine = message.senderId === user._id;
          
          const profilePic = isMine
            ? (user.profilePic ? `${BASE_URL}${user.profilePic}` : "/avatar.png")
            : (selectedUser.profilePic ? `${BASE_URL}${selectedUser.profilePic}` : "/avatar.png");

          return (
            <div
              key={message._id}
              className={`chat ${isMine ? "chat-end" : "chat-start"} ${
                continuous ? "mt-0.5" : "mt-4"
              }`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div
                  className={`size-10 rounded-full border border-base-300 shadow-sm ${
                    continuous ? "invisible" : ""
                  }`}
                >
                  <img src={profilePic} alt="Profile" />
                </div>
              </div>

              {/* Timestamp */}
              {!continuous && (
                <div className="chat-header mb-1 text-xs opacity-60 font-medium">
                  {formatMessageTime(message.createdAt)}
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`chat-bubble flex flex-col gap-2 shadow-sm ${
                  isMine
                    ? "chat-bubble-primary text-primary-content" 
                    : "bg-base-200 text-base-content"
                }`}
              >
                {message.image && (
                  <img
                    src={`${BASE_URL}${message.image}`}
                    alt="Attachment"
                    className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover border border-base-100/10"
                  />
                )}
                {message.text && (
                  <p className="text-sm md:text-base leading-relaxed break-words">
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {/* Empty div for auto-scrolling */}
        <div ref={messageEndRef} className="h-4" /> 
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;