import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, User } from "lucide-react";
import API, { SERVER_URL } from "../services/api";
import "./ChatRoom.css";

const socket = io(SERVER_URL, {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  withCredentials: true
});

export default function ChatRoom({ projectId, projectName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();
  const userName = localStorage.getItem("userName") || "User";
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${projectId}`);
        const formattedMessages = res.data.map(m => ({
          project: m.project,
          sender: m.sender?._id || m.sender,
          senderName: m.sender?.name || "Unknown",
          message: m.message,
          timestamp: m.createdAt
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    if (projectId) {
      socket.emit("join_project", projectId);
      fetchMessages();
    }

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [projectId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageData = {
      project: projectId,
      sender: userId,
      senderName: userName,
      message: input,
      timestamp: new Date()
    };

    socket.emit("send_message", messageData);
    // setMessages((prev) => [...prev, messageData]); // Socket will echo back
    setInput("");
  };

  if (!projectId) return <div className="chat-empty">Select a project to start chatting</div>;

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h3>Team Discussion: {projectName}</h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message-wrapper ${msg.sender === userId ? "own" : ""}`}
          >
            <div className="message-info">
              <span className="sender">{msg.senderName}</span>
              <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="message-bubble">
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input 
          placeholder="Type a message..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
        />
        <button type="submit">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
