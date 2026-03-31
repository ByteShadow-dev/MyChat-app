import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/authStore.js";
import SidebarSkeleton from "./skeletons/SidebarSkeleton.jsx";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { 
    getFriendsForSidebar, 
    friends, 
    selectedUser, 
    setSelectedUser, 
    isFriendsLoading,
    unreadMessages,
    clearUnread,
    typingUsers, 
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getFriendsForSidebar();
  }, []);

  const filteredUsers = showOnlineOnly
    ? friends.filter((user) => onlineUsers.includes(user._id))
    : friends;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    clearUnread(user._id);
  };

  if (isFriendsLoading) return <SidebarSkeleton />;

    const UserItem = ({ user, showName }) => (
      <button
        onClick={() => handleSelectUser(user)}
        className={`
          w-full p-3 flex items-center gap-3
          hover:bg-base-300 transition-colors
          ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
        `}
      >
        <div className={`relative ${showName ? "" : "mx-auto lg:mx-0"}`}>
          <img
            src={user.profilePic ? `http://localhost:5000${user.profilePic}` : "/avatar.png"}
            alt={user.name}
            className="size-12 object-cover rounded-full"
          />
          {onlineUsers.includes(user._id) && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
          )}
        </div>

        {/* Show name: always in overlay (showName=true), only on lg in main sidebar (showName=false) */}
        <div className={`${showName ? "flex" : "hidden lg:flex"} flex-1 text-left min-w-0 flex-col`}>
          <div className="font-medium truncate">{user.name}</div>
          <div className="text-sm text-zinc-400">
              {typingUsers[user._id] 
                  ? <span className="text-primary animate-pulse">typing...</span>
                  : onlineUsers.includes(user._id) ? "Online" : "Offline"
              }
          </div>
        </div>

        {/* Unread badge */}
        {unreadMessages[user._id] && selectedUser?._id !== user._id && (
          <span className={`badge badge-primary badge-xs ${showName ? "inline-flex" : "hidden lg:inline-flex"}`} />
        )}
      </button>
  );

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative group">

      {/* Hover overlay — only on small screens */}
      <div className="lg:hidden absolute top-0 left-0 h-full w-72 bg-base-100 border-r border-base-300
        flex flex-col z-10
        opacity-0 pointer-events-none
        group-hover:opacity-100 group-hover:pointer-events-auto
        transition-opacity duration-200">

        <div className="border-b border-base-300 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium">Contacts</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
          </div>
        </div>

        <div className="overflow-y-auto w-full py-3">
          {filteredUsers.map((user) => (
            <UserItem key={user._id} user={user} showName={true} />
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No contacts</div>
          )}
        </div>
      </div>

      {/* Original content */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <UserItem key={user._id} user={user} showName={false} />
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No contacts</div>
        )}
      </div>

    </aside>
  );
};
export default Sidebar;