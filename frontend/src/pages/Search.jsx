import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle, UserPlus, UserCheck, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/authStore";

const SearchPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        searchedUsers,
        isSearchedUsersLoading,
        getSearchedUsers,
        friends,
        requestsSent,
        requestsInbox,
        getFriends,
        getRequestsSent,
        getRequestsInbox,
        sendFriendRequest,
        acceptFriendRequest,
        setSelectedUser,
        suggestedSearch,
        isSuggestedSearchLoading,
        getSuggestedSearch,
    } = useChatStore();

    const [query, setQuery] = useState("");

    useEffect(() => {
        getFriends();
        getRequestsSent();
        getRequestsInbox();
        getSuggestedSearch();
    }, []);

    // Search on every keystroke
    useEffect(() => {
        if (query.trim()) {
            getSearchedUsers(query);
        }
    }, [query]);

    // Decide which list to display
    const displayUsers = query.trim() ? searchedUsers : suggestedSearch;
    const isLoading = query.trim() ? isSearchedUsersLoading : isSuggestedSearchLoading;

    const isFriend = (userId) =>
        friends.some(f => f._id === userId);

    const hasSentRequest = (userId) =>
        requestsSent.some(r => r._id === userId);

    const hasIncomingRequest = (userId) =>
        requestsInbox.some(r => r._id === userId);

    const handleChat = (searchedUser) => {
        setSelectedUser(searchedUser);
        navigate('/chats');
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen pt-20 px-4">
                <div className="max-w-5xl mx-auto py-8 space-y-8">

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">Search Users</h1>
                        <p className="text-base-content/60">Find people by name or username</p>
                    </div>

                    {/* Search bar — no form submit needed anymore */}
                    <div className="flex gap-2 max-w-xl mx-auto">
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            placeholder="Search by name or username..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                className="btn btn-ghost"
                                onClick={() => setQuery("")}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Section label */}
                    <p className="text-sm text-base-content/50 text-center">
                        {query.trim() ? `Results for "${query}"` : "Suggested People"}
                    </p>

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner loading-lg" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && displayUsers.length === 0 && query.trim() && (
                        <div className="text-center text-base-content/50 py-10">
                            No users found for "{query}"
                        </div>
                    )}

                    {/* Results grid */}
                    {!isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {displayUsers.map((searchedUser) => (
                                <div key={searchedUser._id} className="card bg-base-300 shadow-md">
                                    <div className="card-body items-center text-center gap-3">

                                        <div className="avatar">
                                            <div className="size-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                                <img
                                                    src={searchedUser.profilePic
                                                        ? `http://localhost:5000${searchedUser.profilePic}`
                                                        : "/avatar.png"}
                                                    alt={searchedUser.name}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="card-title text-base">{searchedUser.name}</h2>
                                            <p className="text-sm text-base-content/60">@{searchedUser.username}</p>
                                        </div>

                                        <div className="card-actions w-full flex-col gap-2">

                                            <button
                                                className="btn btn-outline btn-sm w-full"
                                                onClick={() => navigate(`/user/${searchedUser._id}`)}
                                            >
                                                View Profile
                                            </button>

                                            {isFriend(searchedUser._id) && (
                                                <button
                                                    className="btn btn-primary btn-sm w-full"
                                                    onClick={() => handleChat(searchedUser)}
                                                >
                                                    <MessageCircle className="size-4" />
                                                    Chat
                                                </button>
                                            )}

                                            {!isFriend(searchedUser._id) && hasIncomingRequest(searchedUser._id) && (
                                                <button
                                                    className="btn btn-success btn-sm w-full"
                                                    onClick={() => acceptFriendRequest(searchedUser._id)}
                                                >
                                                    <UserCheck className="size-4" />
                                                    Accept Request
                                                </button>
                                            )}

                                            {!isFriend(searchedUser._id) && hasSentRequest(searchedUser._id) && (
                                                <button className="btn btn-sm w-full" disabled>
                                                    <Clock className="size-4" />
                                                    Request Sent
                                                </button>
                                            )}

                                            {!isFriend(searchedUser._id) &&
                                             !hasSentRequest(searchedUser._id) &&
                                             !hasIncomingRequest(searchedUser._id) && (
                                                <button
                                                    className="btn btn-secondary btn-sm w-full"
                                                    onClick={() => sendFriendRequest(searchedUser._id)}
                                                >
                                                    <UserPlus className="size-4" />
                                                    Add Friend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;