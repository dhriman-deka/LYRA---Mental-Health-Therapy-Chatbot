import "./chatPage.css";
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import { apiEndpoint } from "../../utils/api";
import { useAuth } from "@clerk/clerk-react";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await fetch(
        apiEndpoint(`api/chats/${chatId}`),
        {
          headers: {
            Authorization: `Bearer ${useAuth().getToken()}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      return response.json();
    },
  });

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isPending ? (
            "Loading..."
          ) : error ? (
            "Something went wrong!"
          ) : (
            data?.history?.map((message, i) => (
              <div
                key={i}
                className={`message ${message.role === "user" ? "user" : ""}`}
              >
                <Markdown>{message.parts[0].text}</Markdown>
              </div>
            ))
          )}
          {data && <NewPrompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;