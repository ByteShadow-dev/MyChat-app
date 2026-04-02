import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, AtSign, UserMinus, Lock, Camera, Pencil, Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/authStore";
import ConfirmModal from "../components/ConfirmModal.jsx";
import ImageViewer from "../components/ImageViewer";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isUpdatingProfile, changePrivacy, updateUserDetails, isUpdatingDetails } = useAuthStore();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, friendId: null, friendName: "" });
  const [selectedImg, setSelectedImg] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  // Edit state for name
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  // Edit state for username
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const {
    friends,
    getFriends,
    removeFriend,
    profileUserFriends,
    isProfileUserFriendsLoading,
    getProfileUserFriends,
  } = useChatStore();

  const handleRemoveClick = (friendId, friendName) => {
    setConfirmModal({ isOpen: true, friendId: friendId, friendName: friendName });
  };

  const handleConfirmRemove = async () => {
    await removeFriend(confirmModal.friendId);
    getProfileUserFriends(user._id);
    setConfirmModal({ isOpen: false, friendId: null, friendName: "" });
  };

  const handleCancelRemove = () => {
    setConfirmModal({ isOpen: false, friendId: null, friendName: "" });
  };

  // Name edit handlers
  const handleEditName = () => {
    setNameValue(user.name);
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim() === user.name) {
      setEditingName(false);
      return;
    }
    try {
      await updateUserDetails({ name: nameValue.trim() });
      setEditingName(false);
    } catch {
      // toast is handled in the store
    }
  };

  const handleCancelName = () => {
    setEditingName(false);
    setNameValue("");
  };

  // Username edit handlers
  const handleEditUsername = () => {
    setUsernameValue(user.username);
    setEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!usernameValue.trim() || usernameValue.trim() === user.username) {
      setEditingUsername(false);
      return;
    }
    try {
      await updateUserDetails({ username: usernameValue.trim() });
      setEditingUsername(false);
    } catch {
      // toast is handled in the store
    }
  };

  const handleCancelUsername = () => {
    setEditingUsername(false);
    setUsernameValue("");
  };

  useEffect(() => {
    if (!user?._id) return;
    getFriends();
    getProfileUserFriends(user._id);
  }, [user?._id]);

  if (!user) return (
    <div>
      <Navbar />
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="min-h-screen pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8 space-y-6">

          {/* Main profile card */}
          <div className="bg-base-300 rounded-xl p-6 space-y-8">

            <div className="text-center">
              <h1 className="text-2xl font-semibold">Your Profile</h1>
              <p className="mt-2 text-zinc-400">@{user.username}</p>
            </div>

            {/* Avatar upload section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={
                    selectedImg ||
                    (user.profilePic ? `http://localhost:5000${user.profilePic}` : "/avatar.png")
                  }
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setViewingImage(selectedImg || (user.profilePic ? `http://localhost:5000${user.profilePic}` : "/avatar.png"))}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-200
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                  `}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>
              <p className="text-sm text-zinc-400">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>

            <div className="space-y-6">

              {/* Full Name field */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="input input-bordered bg-base-200 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelName();
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isUpdatingDetails}
                      className="btn btn-sm btn-circle btn-success text-white"
                    >
                      {isUpdatingDetails ? <span className="loading loading-spinner loading-xs" /> : <Check className="size-4" />}
                    </button>
                    <button
                      onClick={handleCancelName}
                      disabled={isUpdatingDetails}
                      className="btn btn-sm btn-circle btn-error text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border flex-1">{user.name}</p>
                    <button
                      onClick={handleEditName}
                      className="btn btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Username field */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Username
                </div>
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={usernameValue}
                      onChange={(e) => setUsernameValue(e.target.value)}
                      className="input input-bordered bg-base-200 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveUsername();
                        if (e.key === "Escape") handleCancelUsername();
                      }}
                    />
                    <button
                      onClick={handleSaveUsername}
                      disabled={isUpdatingDetails}
                      className="btn btn-sm btn-circle btn-success text-white"
                    >
                      {isUpdatingDetails ? <span className="loading loading-spinner loading-xs" /> : <Check className="size-4" />}
                    </button>
                    <button
                      onClick={handleCancelUsername}
                      disabled={isUpdatingDetails}
                      className="btn btn-sm btn-circle btn-error text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <p className="px-4 py-2.5 bg-base-200 rounded-lg border flex-1">{user.username}</p>
                    <button
                      onClick={handleEditUsername}
                      className="btn btn-sm btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Email field — read only, no edit */}
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{user.email}</p>
              </div>
            </div>

            <div className="bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{user.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-zinc-700">
                  <span>Account Privacy</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-base-content/50">
                      {user.isPrivate ? "Private" : "Public"}
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={user.isPrivate || false}
                      onChange={(e) => changePrivacy(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Friends card */}
          <div className="bg-base-300 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Friends
              <span className="text-base-content/50 text-sm font-normal ml-2">
                ({profileUserFriends.length})
              </span>
            </h2>

            {isProfileUserFriendsLoading && (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner" />
              </div>
            )}

            {!isProfileUserFriendsLoading && profileUserFriends.length === 0 && (
              <p className="text-base-content/50 text-sm">No friends yet.</p>
            )}

            {!isProfileUserFriendsLoading && (
              <div className="space-y-2">
                {profileUserFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 bg-base-200 rounded-lg px-4 py-3"
                  >
                    <img
                      src={friend.profilePic ? `http://localhost:5000${friend.profilePic}` : "/avatar.png"}
                      alt={friend.name}
                      className="size-11 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate cursor-pointer hover:underline"
                        onClick={() => navigate(`/user/${friend._id}`)}
                      >
                        {friend.name}
                      </p>
                      <p className="text-sm text-base-content/50 truncate">@{friend.username}</p>
                    </div>
                    <button
                      className="btn btn-error btn-xs shrink-0"
                      onClick={() => handleRemoveClick(friend._id, friend.name)}
                    >
                      <UserMinus className="size-3" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        friendName={confirmModal.friendName}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      {viewingImage && (
        <ImageViewer
          src={viewingImage}
          onClose={() => setViewingImage(null)}
          isProfilePic={true}
        />
      )}
    </div>
  );
};

export default Profile;