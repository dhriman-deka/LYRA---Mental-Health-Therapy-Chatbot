import "./dashboardPage.css";
import { useState } from "react";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import ChatList from "../../components/chatList/ChatList";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiEndpoint } from "../../utils/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: async (text) => {
      const response = await fetch(apiEndpoint("api/chats"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getToken()}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["userChats"]);
      navigate(`/dashboard/chats/${data}`);
    },
  });

  const sendMessage = async (text) => {
    try {
      setLoading(true);
      await mutation.mutateAsync(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.userId) {
    return (
      <div className="dashboardPage">
        <div className="auth-required">
          Please log in to access the dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="Lyra Logo" />
          <h1>LYRA</h1>
        </div>
        <p className="welcome-text">
          Your safe space for emotional support and personal growth
        </p>
      </div>

      <div className="options">
        <div className="option">
          <div className="option-icon">
            <img src="/chat-heart.png" alt="Supportive Chat" />
          </div>
          <span className="option-title">Start a Supportive Chat</span>
        </div>

        <div className="option">
          <div className="option-icon">
            <img src="/meditation.png" alt="Guided Wellness" />
          </div>
          <span className="option-title">Guided Wellness</span>
        </div>

        <div className="option">
          <div className="option-icon">
            <img src="/community.png" alt="Resource Center" />
          </div>
          <span className="option-title">Resource Center</span>
        </div>
      </div>

      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="text" 
            placeholder="Share what's on your mind... I'm here to listen"
            aria-label="Chat input"
            disabled={loading}
          />
          <button 
            type="submit" 
            aria-label="Send message"
            disabled={loading}
          >
            <img src="/arrow.png" alt="Send" />
          </button>
        </form>
        {mutation.isError && (
          <div className="error-message">
            Failed to create chat. Please try again.
          </div>
        )}
      </div>

      <div className="support-footer">
        <p className="crisis-text">
          In crisis? <a href="/crisis-resources">Get immediate help</a>
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;