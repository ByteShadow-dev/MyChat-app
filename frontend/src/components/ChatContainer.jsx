import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageViewer from "./ImageViewer"; // Added ImageViewer import
import DragDropOverlay from "./DragDropOverlay"; // <-- Add this
import { useAuthStore } from "../store/authStore";
import { formatMessageTime } from "../lib/utils";
import { useNavigate } from "react-router-dom";


const ChatContainer = () => {

  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);

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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === user._id ? "chat-end" : "chat-start"}`}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === user._id
                      ? (user.profilePic ? `http://localhost:5000${user.profilePic}` : "/avatar.png")
                      : (selectedUser.profilePic ? `http://localhost:5000${selectedUser.profilePic}` : "/avatar.png")
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {/*message.image && (
                <img
                  src={`http://localhost:5000${message.image}`}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )*/}
              {message.image && (
                <img
                  src={`http://localhost:5000${message.image}`}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={() => setSelectedImage(`http://localhost:5000${message.image}`)} 
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef}/>
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