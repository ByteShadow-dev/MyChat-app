import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, User, AtSign, UserMinus, MessageCircle, UserPlus, UserCheck, Clock, Lock } from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/authStore";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuthStore();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    friends,
    requestsSent,
    requestsInbox,
    getFriends,
    getRequestsSent,
    getRequestsInbox,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    setSelectedUser,
    profileUserFriends,
    isProfileUserFriendsLoading,
    getProfileUserFriends,
  } = useChatStore();

  useEffect(() => {
    if (!userId) return;
    getFriends();
    getRequestsSent();
    getRequestsInbox();
    getProfileUserFriends(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/auth/user/${userId}`);
        setProfileUser(res.data);
      } catch (error) {
        console.log("Error fetching user: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const isFriend = friends.some(f => f._id === userId);
  const hasSentRequest = requestsSent.some(r => r._id === userId);
  const hasIncomingRequest = requestsInbox.some(r => r._id === userId);

  const handleChat = () => {
    setSelectedUser(profileUser);
    navigate('/chats');
  };

  if (isLoading) return (
    <div>
      <Navbar />
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  if (!profileUser) return (
    <div>
      <Navbar />
      <div className="h-screen flex items-center justify-center">
        <p className="text-zinc-400">User not found.</p>
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
              <h1 className="text-2xl font-semibold">User Profile</h1>
              <p className="mt-2 text-zinc-400">@{profileUser.username}</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <img
                src={profileUser.profilePic ? `http://localhost:5000${profileUser.profilePic}` : "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />

              {/* Action buttons */}
              <div className="flex gap-2 w-full max-w-xs">
                {isFriend && (
                  <>
                    <button className="btn btn-primary btn-sm flex-1" onClick={handleChat}>
                      <MessageCircle className="size-4" />
                      Chat
                    </button>
                    <button
                      className="btn btn-error btn-sm flex-1"
                      onClick={() => removeFriend(userId)}
                    >
                      <UserMinus className="size-4" />
                      Remove
                    </button>
                  </>
                )}
                {!isFriend && hasIncomingRequest && (
                  <button
                    className="btn btn-success btn-sm w-full"
                    onClick={() => acceptFriendRequest(userId)}
                  >
                    <UserCheck className="size-4" />
                    Accept Request
                  </button>
                )}
                {!isFriend && hasSentRequest && (
                  <button className="btn btn-sm w-full" disabled>
                    <Clock className="size-4" />
                    Request Sent
                  </button>
                )}
                {!isFriend && !hasSentRequest && !hasIncomingRequest && (
                  <button
                    className="btn btn-secondary btn-sm w-full"
                    onClick={() => sendFriendRequest(userId)}
                  >
                    <UserPlus className="size-4" />
                    Add Friend
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{profileUser.name}</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <AtSign className="w-4 h-4" />
                  Username
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{profileUser.username}</p>
              </div>
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{profileUser.email}</p>
              </div>
            </div>

            <div className="bg-base-300 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{profileUser.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Friends card */}
          <div className="bg-base-300 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Friends
              {isFriend && (
                <span className="text-base-content/50 text-sm font-normal ml-2">
                  ({profileUserFriends.length})
                </span>
              )}
            </h2>

            {/* Not a friend — show private message */}
            {!isFriend && (
              <div className="flex flex-col items-center gap-2 py-6 text-base-content/50">
                <Lock className="size-8" />
                <p className="text-sm">Add this user as a friend to see their friends list.</p>
              </div>
            )}

            {/* Is a friend — show friends list */}
            {isFriend && isProfileUserFriendsLoading && (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner" />
              </div>
            )}

            {isFriend && !isProfileUserFriendsLoading && profileUserFriends.length === 0 && (
              <p className="text-base-content/50 text-sm">No friends yet.</p>
            )}

            {isFriend && !isProfileUserFriendsLoading && (
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
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
export default UserProfilePage;