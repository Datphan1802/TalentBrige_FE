import React, { useEffect, useState } from "react";
import { aiGetSessions, aiGetSessionMessages, aiSendSessionMessage, aiCreateSession, aiUpdateSessionTitle, aiDeleteSession } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Send, Sparkles, Copy, Check, Bot, User, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
};

// Generate session title from first message
const generateTitle = (text: string): string => {
  const max = 50;
  return text.length > max ? text.substring(0, max) + "..." : text;
};

export default function AiHistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTitleUpdated, setIsTitleUpdated] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await aiGetSessions();
      setSessions(data || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load chat history");
    }
  };

  const handleSelectSession = async (session: any) => {
    setSelectedSession(session);
    setMessages([]);
    setInput("");
    setIsTitleUpdated(true);
    setLoading(true);
    try {
      const msgs = await aiGetSessionMessages(session.id);
      console.log("Loaded messages from session:", msgs);
      console.log("First message structure:", JSON.stringify(msgs?.[0], null, 2));
      console.log("All first message fields:", Object.keys(msgs?.[0] || {}));

      const formattedMsgs: ChatMessage[] = (msgs || []).map((msg: any, index: number) => {
        // If role exists, use it. Otherwise, use alternating pattern (even = user, odd = assistant)
        let role: "user" | "assistant";
        if (msg.role === "user") {
          role = "user";
        } else if (msg.role === "assistant") {
          role = "assistant";
        } else {
          // Fallback: alternating pattern - even index = user, odd index = assistant
          role = index % 2 === 0 ? "user" : "assistant";
        }

        console.log(`Message ${index}:`, {
          allFields: Object.keys(msg),
          original_role: msg.role,
          detected_role: role,
          content_preview: msg.content?.substring(0, 50)
        });

        return {
          role: role,
          content: msg.content || "",
        };
      });

      setMessages(formattedMsgs);
    } catch (err) {
      console.error("Error loading messages:", err);
      toast.error("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const session = await aiCreateSession("New Chat");
      setSessions([session, ...sessions]);
      setSelectedSession(session);
      setMessages([]);
      setInput("");
      setIsTitleUpdated(false);
      toast.success("New chat created");
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await aiDeleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
        setInput("");
      }
      toast.success("Chat deleted successfully");
    } catch (err) {
      console.error("Error deleting session:", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || !selectedSession) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiSendSessionMessage(selectedSession.id, trimmed);
      console.log("AI Response received:", response);
      const assistantContent = response.assistantMessage?.content || "No response";

      // Auto-rename session on first message
      if (!isTitleUpdated && messages.length === 0) {
        const newTitle = generateTitle(trimmed);
        try {
          await aiUpdateSessionTitle(selectedSession.id, newTitle);
          setSelectedSession({ ...selectedSession, title: newTitle });
          setSessions(sessions.map(s => s.id === selectedSession.id ? { ...s, title: newTitle } : s));
        } catch (err) {
          console.error("Error updating session title:", err);
        }
        setIsTitleUpdated(true);
      }

      const assistantMsg: ChatMessage = { role: "assistant", content: assistantContent };
      console.log("Adding assistant message:", assistantMsg);
      setMessages([...updatedMessages, assistantMsg]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to send message";
      toast.error(errorMsg);
      setMessages([...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 rounded-xl overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-64 border border-border bg-card rounded-lg flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={handleNewChat} className="w-full gap-2 rounded-lg" size="sm">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No chat history</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 line-clamp-2 group flex items-center justify-between hover:pr-2 cursor-pointer",
                    selectedSession?.id === session.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={session.title}
                >
                  <span className="truncate flex-1">{session.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 border border-border bg-card rounded-lg flex flex-col overflow-hidden">
        {selectedSession ? (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{selectedSession.title}</h2>
                <p className="text-xs text-muted-foreground">{messages.length} messages</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="w-8 h-8 text-primary/60" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">How can I help you today?</p>
                      <p className="text-sm text-muted-foreground mt-1">Ask me about career advice, resume tips, or interview prep</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isUser = msg.role === "user";
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-1">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "group relative max-w-[70%] px-4 py-3 rounded-2xl text-sm",
                              isUser
                                ? "bg-blue-600 text-white rounded-br-md shadow-md"
                                : "bg-gray-100 text-gray-950 rounded-bl-md shadow-sm dark:bg-gray-800 dark:text-gray-50"
                            )}
                          >
                            {isUser ? (
                              <p className="break-words">{msg.content}</p>
                            ) : (
                              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 prose-code:text-xs">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )}
                            {!isUser && (
                              <div className="absolute -bottom-1 -right-1">
                                <CopyButton text={msg.content} />
                              </div>
                            )}
                          </div>
                          {isUser && (
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask the AI assistant..."
                  className="flex-1 rounded-full bg-accent/50 border-border"
                  disabled={isLoading}
                  maxLength={4000}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 shadow-sm"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                AI responses are generated and may not always be accurate.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary/60" />
            </div>
            <div>
              <p className="font-medium text-foreground">No chat selected</p>
              <p className="text-sm text-muted-foreground mt-1">Select a chat from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
