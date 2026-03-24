import React, { useState } from "react";
import { aiQuickChat, aiCreateSession, aiSendSessionMessage, aiGetSessions, aiGetSessionMessages } from "@/lib/ai";

export default function AiTestPage() {
  const [message, setMessage] = useState("");
  const [chatResult, setChatResult] = useState<any>(null);

  // Test chat nhanh
  const handleQuickChat = async () => {
    const res = await aiQuickChat(message);
    setChatResult(res);
  };

  // Test tạo session và gửi message
  const handleSessionChat = async () => {
    const session = await aiCreateSession("Test session");
    await aiSendSessionMessage(session.id, message);
    const messages = await aiGetSessionMessages(session.id);
    setChatResult(messages);
  };

  // Test xem lịch sử sessions
  const handleTestSessions = async () => {
    const sessions = await aiGetSessions();
    console.log("Test aiGetSessions():", sessions);
    setChatResult(sessions);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Test AI API</h2>
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Nhập câu hỏi..." />
      <button onClick={handleQuickChat}>Chat nhanh</button>
      <button onClick={handleSessionChat}>Chat lưu session</button>
      <button onClick={handleTestSessions}>Test aiGetSessions()</button>
      <pre>{JSON.stringify(chatResult, null, 2)}</pre>
    </div>
  );
}