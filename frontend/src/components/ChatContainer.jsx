import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageViewer from "./ImageViewer";
import DragDropOverlay from "./DragDropOverlay";
import { useAuthStore } from "../store/authStore";
import { formatMessageTime } from "../lib/utils";
import { MoreVertical, Edit2, Trash2, X, Check } from "lucide-react";

const BASE_URL = "http://localhost:5000";
const CONTINUOUS_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const isContinuous = (prevMessage, currMessage) => {
  if (!prevMessage) return false;
  if (prevMessage.senderId !== currMessage.senderId) return false;
  const timeDiff = new Date(currMessage.createdAt) - new Date(prevMessage.createdAt);
  return timeDiff < CONTINUOUS_THRESHOLD_MS;
};

const ChatContainer = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      setDroppedFile(file);
    }
  };

  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,   // 2. ADD THIS
    deleteMessage, // 3. ADD THIS
  } = useChatStore();
  const { user } = useAuthStore();
  const messageEndRef = useRef(null);

  const handleEditClick = (message) => {
    setEditingMessageId(message._id);
    setEditMessageText(message.text);
  };

  const handleSaveEdit = (messageId) => {
    if (editMessageText.trim() !== "") {
      editMessage(messageId, editMessageText.trim());
    }
    setEditingMessageId(null);
    setEditMessageText("");
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageText("");
  };

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

  return (
    <div
      className="flex-1 flex flex-col overflow-auto relative"
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
    >
      {isDragging && (
        <DragDropOverlay
          onDrop={handleDrop}
          onDragLeave={() => setIsDragging(false)}
        />
      )}

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
              } group relative`}
            >
              {/* Avatar — hidden for continuous messages to group them visually */}
              <div className="chat-image avatar">
                <div
                  className={`size-10 rounded-full border border-base-300 shadow-sm ${
                    continuous ? "invisible" : ""
                  }`}
                >
                  <img src={profilePic} alt="Profile" />
                </div>
              </div>

              {/* Timestamp — only shown for the first message in a group */}
              {!continuous && (
                <div className="chat-header mb-1 text-xs opacity-60 font-medium">
                  {formatMessageTime(message.createdAt)}
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`chat-bubble relative flex flex-col gap-2 shadow-sm ${
                  isMine
                    ? "chat-bubble-primary text-primary-content"
                    : "bg-base-200 text-base-content"
                }`}
              >
                {/* Hover dropdown for Edit / Delete — only on own messages */}
                {isMine && !editingMessageId && (
                  <div className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="dropdown dropdown-left">
                      <div tabIndex={0} role="button" className="btn btn-xs btn-circle btn-ghost text-base-content/60 hover:text-base-content">
                        <MoreVertical className="size-4" />
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[50] menu p-1.5 shadow bg-base-200 text-base-content rounded-box w-32">
                        <li>
                          <button onClick={() => handleEditClick(message)} className="text-sm py-1.5">
                            <Edit2 className="size-3.5" /> Edit
                          </button>
                        </li>
                        <li>
                          <button onClick={() => deleteMessage(message._id)} className="text-sm py-1.5 text-error">
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {message.image && (
                  <img
                    src={`${BASE_URL}${message.image}`}
                    alt="Attachment"
                    className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover border border-base-100/10 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(`${BASE_URL}${message.image}`)}
                  />
                )}

                {/* Inline edit input or regular message text */}
                {editingMessageId === message._id ? (
                  <div className="flex items-center gap-2 my-1">
                    <input
                      type="text"
                      value={editMessageText}
                      onChange={(e) => setEditMessageText(e.target.value)}
                      className="input input-sm input-bordered bg-base-100 text-base-content min-w-[200px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(message._id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <button onClick={() => handleSaveEdit(message._id)} className="btn btn-xs btn-circle btn-success text-white">
                      <Check className="size-3" />
                    </button>
                    <button onClick={handleCancelEdit} className="btn btn-xs btn-circle btn-error text-white">
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  message.text && (
                    <p className="text-sm md:text-base leading-relaxed break-words">
                      {message.text}
                      {/* Show (edited) tag inline if message was modified */}
                      {message.isEdited && (
                        <span className="text-[10px] italic opacity-60 ml-2">(edited)</span>
                      )}
                    </p>
                  )
                )}
              </div>
            </div>
          );
        })}

        {/* Empty div for auto-scrolling */}
        <div ref={messageEndRef} className="h-4" />
      </div>

      <MessageInput
        droppedFile={droppedFile}
        onFileConsumed={() => setDroppedFile(null)}
      />

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default ChatContainer;