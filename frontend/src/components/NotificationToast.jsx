// components/NotificationToast.jsx
import { useNotificationStore } from "../store/useNotificationStore.js";
import { X, MessageSquare, UserPlus } from "lucide-react";

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto alert bg-base-300 border border-base-content/10 shadow-lg w-80 transition-all duration-300"
        >
          {/* Avatar or Icon */}
          {n.avatar ? (
            <img
              src={n.avatar}
              alt=""
              className="size-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="avatar placeholder shrink-0">
              <div className="bg-primary/20 text-primary rounded-full size-10 flex items-center justify-center">
                {n.type === "message" ? (
                  <MessageSquare className="size-5" />
                ) : (
                  <UserPlus className="size-5" />
                )}
              </div>
            </div>
          )}

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{n.title}</p>
            <p className="text-xs text-base-content/60 truncate">{n.message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={() => removeNotification(n.id)}
            className="btn btn-ghost btn-xs btn-circle shrink-0"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;