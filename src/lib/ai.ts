import api from "./api";

// 1. Quick AI chat (no session)
export async function aiQuickChat(message: string) {
  const res = await api.post("/api/v1/ai/chat", { message });
  return res.data.data;
}

// 2. Create AI session
export async function aiCreateSession(title: string) {
  const res = await api.post("/api/v1/ai/sessions", { title });
  return res.data.data;
}

// 3. Get all AI sessions of current user
export async function aiGetSessions() {
  try {
    const res = await api.get("/api/v1/ai/sessions");
    console.log("aiGetSessions response:", res);
    return res.data.data;
  } catch (error) {
    console.error("aiGetSessions error:", error);
    throw error;
  }
}

// 3.5. Update session title
export async function aiUpdateSessionTitle(sessionId: number, title: string) {
  const res = await api.put(`/api/v1/ai/sessions/${sessionId}`, { title });
  return res.data.data;
}

// 4. Get messages of a session
export async function aiGetSessionMessages(sessionId: number) {
  const res = await api.get(`/api/v1/ai/sessions/${sessionId}/messages`);
  return res.data.data;
}

// 5. Send message to a session (response includes userMessage & assistantMessage)
export async function aiSendSessionMessage(sessionId: number, content: string) {
  try {
    // Try with 'content' field first, if it fails, try with 'message'
    let res;
    try {
      res = await api.post(`/api/v1/ai/sessions/${sessionId}/messages`, { content });
    } catch (err: any) {
      if (err.response?.status === 400) {
        console.warn("'content' field failed, trying 'message' field");
        res = await api.post(`/api/v1/ai/sessions/${sessionId}/messages`, { message: content });
      } else {
        throw err;
      }
    }
    console.log("aiSendSessionMessage response:", res);
    return res.data.data;
  } catch (err: any) {
    console.error("aiSendSessionMessage error:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
    });
    throw err;
  }
}

// 6. Delete AI session
export async function aiDeleteSession(sessionId: number) {
  const res = await api.delete(`/api/v1/ai/sessions/${sessionId}`);
  return res.data.data;
}

// 7. Forgot password (send email)
export async function forgotPassword(email: string) {
  const res = await api.post("/api/v1/auth/forgot-password", { email });
  return res.data;
}
