import "./dashboardPage.css";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (text) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, text }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      return response.json();
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries(["userChats"]);
      navigate(`/dashboard/chats/${id}`);
    },
    onError: (error) => {
      console.error("Failed to create chat:", error);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text || !userId) return;
    
    try {
      mutation.mutate(text);
    } catch (error) {
      console.error("Error submitting:", error);
    }
  };

  if (!userId) {
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
            disabled={mutation.isPending}
          />
          <button 
            type="submit" 
            aria-label="Send message"
            disabled={mutation.isPending}
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