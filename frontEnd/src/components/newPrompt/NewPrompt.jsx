import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import model from "../../lib/openRouter";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoint } from "../../utils/api";
import { auth } from "../../utils/auth";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const endRef = useRef(null);
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const systemInstruction =
    
    "You are a specialized digital mental health support assistant. " +
    "Your sole purpose is to offer evidence-based, compassionate guidance on mental health and emotional wellbeing. " +
    "You MUST respond ONLY to mental health–related queries. If a user asks for non–mental health assistance (e.g., coding, math, or other general queries), you MUST reply: 'I'm sorry, but I can only assist with mental health and emotional wellbeing topics. Could we focus on your feelings or concerns?'\n\n" +
    "In every response, you must:\n" +
    "1. Use a professional, empathetic tone with clear, supportive, and non-judgmental language.\n" +
    "2. Apply proven therapeutic techniques and motivational interviewing to help users manage their emotions.\n" +
    "3. Adapt your response based on the user's emotional cues, staying within ethical, evidence-based guidelines.\n" +
    "4. Encourage users to seek in-person professional support if their needs exceed your scope, providing crisis resources only when necessary.\n" +
    "5. Maintain strict confidentiality and never reveal internal technology details or company secrets.\n" +
    "6. Uphold the highest standards of digital ethics, safety, and privacy.\n\n" +
    "Important Instructions:\n" +
    "   - Provide direct, concise responses (no more than about 100 words).\n" +
    "   - Only mention that you are not a therapist if specifically asked or if the user signals an extreme crisis.\n" +
    "   - Prioritize support, guidance, and actionable resources over discussing your limitations.";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(apiEndpoint(`api/chats/${data._id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getToken()}`,
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chat", data._id]);
      formRef.current.reset();
      setQuestion("");
      setAnswer("");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setAnswer("I apologize, but I'm having trouble saving our conversation. Please try again.");
    }
  });

  const add = async (text, isInitial = false) => {
    if (!isInitial) setQuestion(text);

    try {
      const chat = model.startChat({
        history: data?.history?.map(({ role, parts }) => ({
          role,
          parts: [{ text: parts[0].text }]
        })) || [],
        generationConfig: { maxOutputTokens: 1000 }
      });

      const combinedText = systemInstruction + "\n\n" + text;
      const result = await chat.sendMessageStream([{ text: combinedText }]);
      let accumulatedText = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      await mutation.mutateAsync();
    } catch (error) {
      console.error("Error generating response:", error);
      setAnswer("I apologize, but I'm having trouble responding right now. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    add(text, false);
  };

  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
    }
    hasRun.current = true;
  }, []);

  return (
    <div className="chat-container">
      {question && <div className="message user">{question}</div>}
      {answer && (
        <div className="message">
          <Markdown>{answer}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <input 
          type="text" 
          name="text" 
          placeholder="Share your thoughts or concerns..." 
          disabled={mutation.isPending}
        />
        <button type="submit" disabled={mutation.isPending}>
          <img src="/arrow.png" alt="Send" />
        </button>
      </form>
    </div>
  );
};

export default NewPrompt;