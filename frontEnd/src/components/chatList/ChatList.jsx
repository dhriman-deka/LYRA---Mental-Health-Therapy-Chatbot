import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./chatList.css";
import { useAuth } from "@clerk/clerk-react";
import { apiEndpoint } from "../../utils/api";

const ChatList = () => {
  const auth = useAuth();
  const { userId } = auth;

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      const response = await fetch(
        apiEndpoint("api/userchats"),
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      return response.json();
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  if (!userId) {
    return (
      <div className="chatList">
        <div className="auth-message">
          Please log in to view your conversations.
        </div>
      </div>
    );
  }

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore Lyra AI</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending ? (
          <div className="loading">Loading your chats...</div>
        ) : error ? (
          <div className="error">
            Something went wrong! Please try again.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="no-chats">
            No conversations yet. Start a new chat to begin.
          </div>
        ) : (
          data.map((chat) => (
            <Link
              to={`/dashboard/chats/${chat._id}`}
              key={chat._id}
              className="chat-link"
            >
              <span className="chat-title">
                {chat.title || "Untitled Chat"}
              </span>
              {chat.createdAt && (
                <span className="chat-time">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;