import React, { useState, useEffect } from "react";
import "./App.css";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
  UserButton,
} from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LandingPage from "./LandingPage";
import FaceTracker from "./FaceTracker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const CenteredWrapper = ({ children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}
  >
    {children}
  </div>
);

const ChatComponent = () => {
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("zephyrus_chat_history");
    return saved
      ? JSON.parse(saved)
      : [{ text: "Welcome aspirants, let's get learning!", sender: "ai" }];
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("zephyrus_theme") || "dark";
  });

  const [input, setInput] = useState("");
  const [isUserPresent, setIsUserPresent] = useState(true);
  const [presenceSeconds, setPresenceSeconds] = useState(0);

  const fullyActive = isUserPresent;

  useEffect(() => {
    localStorage.setItem("zephyrus_chat_history", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("zephyrus_theme", theme);
  }, [theme]);

  useEffect(() => {
    let interval = null;
    if (isUserPresent) {
      interval = setInterval(() => {
        setPresenceSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isUserPresent && interval !== null) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isUserPresent]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const newUserMessage = { text: input, sender: "user" };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      const newAIMessage = { text: data.reply, sender: "ai" };
      setMessages((prev) => [...prev, newAIMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Could not reach AI server.", sender: "ai" },
      ]);
    }

    setInput("");
  };

  const clearChat = () => {
    localStorage.removeItem("zephyrus_chat_history");
    setMessages([{ text: "Welcome aspirants, let's get learning!", sender: "ai" }]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="app-header">
        <div className="app-header-left">
          <strong>Zephyrus</strong>
          <span className="tagline">The Wind Beneath Your Wings to Success.</span>
        </div>
        <div className="app-header-right">
          <div className={`status-indicator ${fullyActive ? "active" : "away"}`}>
            <span className="dot" />
            {fullyActive ? `Active | ${formatTime(presenceSeconds)}` : "Away"}
          </div>
          <button onClick={clearChat} className="clear-button">Clear Chat</button>
          <button onClick={toggleTheme} className="clear-button">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <UserButton signOutOptions={{ redirectUrl: "/" }} />
        </div>
      </div>

      <FaceTracker onPresenceChange={(present) => setIsUserPresent(present)} />

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.sender === "user" ? "user-message" : "ai-message"
              }`}
            >
              {msg.sender === "ai" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>

      <div className="watermark">
        Zephyrus – The Wind Beneath Your Wings to Success.
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Navigate to="/app" />
            </SignedIn>
            <SignedOut>
              <LandingPage />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/app"
        element={
          <>
            <SignedIn>
              <ChatComponent />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/sign-in/*"
        element={
          <CenteredWrapper>
            <SignIn routing="path" path="/sign-in" redirectUrl="/app" />
          </CenteredWrapper>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <CenteredWrapper>
            <SignUp routing="path" path="/sign-up" redirectUrl="/app" />
          </CenteredWrapper>
        }
      />
    </Routes>
  );
}
