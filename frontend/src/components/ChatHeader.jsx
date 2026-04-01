import { X } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { Link } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const timeStampDisplay = (timestamp) =>{
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
     minute: "2-digit",
    })
  }

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <Link to={`/user/${selectedUser._id}`}><img src={selectedUser.profilePic ? `http://localhost:5000${selectedUser.profilePic}` : "/avatar.png"} alt={selectedUser.name} /></Link>
            </div>
          </div>

          {/* User info */}
          <div>
            <Link to={`/user/${selectedUser._id}`}>
              <h3 className="font-medium">{selectedUser.name}</h3>
            </Link>
            
            {typingUsers[selectedUser._id] ? (
              <p className="text-sm text-primary animate-pulse">
                typing...
              </p>
            ) : onlineUsers.includes(selectedUser._id) ? (
              <p className="text-sm text-green-400">
                Online
              </p>
            ) : (
              <div className="flex flex-col">
                <p className="text-sm text-base-content/70">Offline</p>
                <p className="text-xs text-base-content/50">
                  {`Last Seen on ${timeStampDisplay(selectedUser.lastLogin)}`}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;