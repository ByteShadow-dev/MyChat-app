import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail, User, AtSign } from "lucide-react";
import Navbar from "../components/Navbar";
import { axiosInstance } from "../lib/axios";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      <div className="h-screen pt-20">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-base-300 rounded-xl p-6 space-y-8">
            
            <div className="text-center">
              <h1 className="text-2xl font-semibold">User Profile</h1>
              <p className="mt-2 text-zinc-400">@{profileUser.username}</p>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <img
                src={profileUser.profilePic ? `http://localhost:5000${profileUser.profilePic}` : "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
            </div>

            {/* Info fields */}
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

            <div className="mt-6 bg-base-300 rounded-xl p-6">
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
        </div>
      </div>
    </div>
  );
};
export default UserProfilePage;