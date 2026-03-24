import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  ApiResponse,
  ChatRoomResponse,
  ChatMessageResponse,
  SendMessageRequest,
  ApplicationResponse,
  JobPostResponse,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Send, MessageSquare, ArrowLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const MOCK_ROOMS: ChatRoomResponse[] = [
  {
    id: 9001,
    userOneId: 1,
    userOneUsername: "john",
    userTwoId: 2,
    userTwoUsername: "FPT Recruiter",
    lastMessage: "Can you join interview this Friday?",
    unreadCount: 1,
  },
  {
    id: 9002,
    userOneId: 1,
    userOneUsername: "john",
    userTwoId: 3,
    userTwoUsername: "VNG HR Team",
    lastMessage: "Your CV looks good. Let's discuss.",
    unreadCount: 0,
  },
  {
    id: 9003,
    userOneId: 1,
    userOneUsername: "john",
    userTwoId: 4,
    userTwoUsername: "Shopee Talent",
    lastMessage: "Please share your expected salary.",
    unreadCount: 2,
  },
];

const MOCK_MESSAGES: Record<number, ChatMessageResponse[]> = {
  9001: [
    {
      id: 1,
      roomId: 9001,
      senderId: 2,
      senderUsername: "FPT Recruiter",
      content: "Hi John, thanks for applying to our role.",
      isRead: true,
      sentAt: "2026-03-24T09:10:00.000Z",
    },
    {
      id: 2,
      roomId: 9001,
      senderId: 1,
      senderUsername: "john",
      content: "Thanks! I'm happy to connect.",
      isRead: true,
      sentAt: "2026-03-24T09:12:00.000Z",
    },
    {
      id: 3,
      roomId: 9001,
      senderId: 2,
      senderUsername: "FPT Recruiter",
      content: "Can you join interview this Friday?",
      isRead: false,
      sentAt: "2026-03-24T09:15:00.000Z",
    },
  ],
  9002: [
    {
      id: 4,
      roomId: 9002,
      senderId: 3,
      senderUsername: "VNG HR Team",
      content: "Your CV looks good. Let's discuss.",
      isRead: true,
      sentAt: "2026-03-24T08:00:00.000Z",
    },
  ],
  9003: [
    {
      id: 5,
      roomId: 9003,
      senderId: 4,
      senderUsername: "Shopee Talent",
      content: "Please share your expected salary.",
      isRead: false,
      sentAt: "2026-03-24T07:45:00.000Z",
    },
  ],
};

const ChatPage = () => {
  const { userId, role } = useAuth();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredOtherUserRef = useRef(false);

  // Get roomId from URL params
  const roomIdFromUrl = searchParams.get('roomId');
  const otherUserIdFromUrl = searchParams.get("otherUserId");
  const forceMockChat = searchParams.get("mockChat") === "1";

  // Auto-select room if roomId is in URL
  useEffect(() => {
    if (roomIdFromUrl && !selectedRoomId) {
      const roomId = parseInt(roomIdFromUrl);
      if (!isNaN(roomId)) {
        setSelectedRoomId(roomId);
      }
    }
  }, [roomIdFromUrl, selectedRoomId]);

  // Fetch chat rooms (inbox)
  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ["chatRooms"],
    queryFn: () => api.get<ApiResponse<ChatRoomResponse[]>>("/api/v1/chat/rooms").then(r => r.data.data),
    refetchInterval: 5000,
  });

  // Fetch messages for selected room
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["chatMessages", selectedRoomId],
    queryFn: () =>
      api.get<ApiResponse<ChatMessageResponse[]>>(`/api/v1/chat/rooms/${selectedRoomId}/messages`).then(r => r.data.data),
    enabled: !!selectedRoomId,
    refetchInterval: 3000,
  });

  // Candidate flow: show hirers from applications when no room exists yet
  const { data: myApplicationsData } = useQuery({
    queryKey: ["my-applications-for-chat"],
    queryFn: () =>
      api
        .get<ApiResponse<ApplicationResponse[]>>("/api/v1/applications/my-applications")
        .then((r) => r.data.data),
    enabled: role === "CANDIDATE",
  });

  const { data: candidateChatTargetsData, isLoading: candidateChatTargetsLoading } = useQuery({
    queryKey: [
      "candidate-chat-targets",
      myApplicationsData?.map((a) => a.jobPostId).join(",") || "",
    ],
    queryFn: async () => {
      const applications = myApplicationsData ?? [];
      const uniqueJobIds = Array.from(new Set(applications.map((a) => a.jobPostId)));
      if (!uniqueJobIds.length) return [] as { employerId: number; companyName: string; jobTitle: string }[];

      const jobs = await Promise.all(
        uniqueJobIds.map((jobId) =>
          api
            .get<ApiResponse<JobPostResponse>>(`/api/v1/jobs/${jobId}`)
            .then((r) => r.data.data)
            .catch(() => null)
        )
      );

      const dedup = new Map<number, { employerId: number; companyName: string; jobTitle: string }>();
      jobs.forEach((job) => {
        if (!job) return;
        if (!dedup.has(job.employerId)) {
          dedup.set(job.employerId, {
            employerId: job.employerId,
            companyName: job.companyName,
            jobTitle: job.title,
          });
        }
      });

      return Array.from(dedup.values());
    },
    enabled: role === "CANDIDATE" && !!myApplicationsData,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (req: SendMessageRequest) => api.post<ApiResponse<ChatMessageResponse>>("/api/v1/chat/messages", req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages", selectedRoomId] });
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      setMessage("");
      inputRef.current?.focus();
    },
  });

  const createChatRoomMutation = useMutation({
    mutationFn: (otherUserId: number) =>
      api
        .post<ApiResponse<ChatRoomResponse>>(`/api/v1/chat/rooms/${otherUserId}`)
        .then((r) => r.data.data),
    onSuccess: (chatRoom) => {
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      setSelectedRoomId(chatRoom.id);
      const otherName =
        chatRoom.userOneId === userId ? chatRoom.userTwoUsername : chatRoom.userOneUsername;
      setSelectedChatName(otherName || "Hirer");
    },
    onError: (error: unknown) => {
      const responseError = error as { response?: { data?: { message?: string } } };
      toast.error(
        responseError?.response?.data?.message || "Không thể tạo cuộc trò chuyện"
      );
    },
  });

  useEffect(() => {
    if (hasTriggeredOtherUserRef.current) return;
    if (!otherUserIdFromUrl) return;
    const parsed = Number(otherUserIdFromUrl);
    if (Number.isNaN(parsed)) return;
    hasTriggeredOtherUserRef.current = true;
    createChatRoomMutation.mutate(parsed);
  }, [otherUserIdFromUrl, createChatRoomMutation]);

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (roomId: number) => api.put(`/api/v1/chat/rooms/${roomId}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatRooms"] }),
  });

  // Mark as read when selecting a room
  useEffect(() => {
    if (selectedRoomId) {
      markReadMutation.mutate(selectedRoomId);
    }
  }, [selectedRoomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const handleSend = () => {
    if (!message.trim() || !selectedRoomId) return;
    sendMutation.mutate({ roomId: selectedRoomId, content: message.trim() });
  };

  const selectedRoom = roomsData?.find(r => r.id === selectedRoomId);
  const shouldUseMockData =
    forceMockChat || (import.meta.env.DEV && !roomsLoading && !roomsData?.length);
  const displayRooms = shouldUseMockData ? MOCK_ROOMS : (roomsData ?? []);
  const selectedDisplayRoom = displayRooms.find((r) => r.id === selectedRoomId) || null;
  const fallbackMessagesForSelectedRoom: ChatMessageResponse[] =
    !shouldUseMockData &&
    import.meta.env.DEV &&
    !!selectedRoomId &&
    !messagesLoading &&
    (!messagesData || messagesData.length === 0) &&
    !!selectedDisplayRoom
      ? [
          {
            id: -1,
            roomId: selectedRoomId,
            senderId: selectedDisplayRoom.userOneId === userId ? selectedDisplayRoom.userTwoId : selectedDisplayRoom.userOneId,
            senderUsername: getOtherUsername(selectedDisplayRoom),
            content: "Xin chao! Day la tin nhan mau de demo giao dien chat.",
            isRead: true,
            sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: -2,
            roomId: selectedRoomId,
            senderId: userId || 0,
            senderUsername: "You",
            content: "Cam on, toi da nhan duoc tin nhan.",
            isRead: true,
            sentAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          },
        ]
      : [];
  const displayMessages = shouldUseMockData
    ? (selectedRoomId ? MOCK_MESSAGES[selectedRoomId] ?? [] : [])
    : ((messagesData && messagesData.length > 0) ? messagesData : fallbackMessagesForSelectedRoom);

  const getOtherUsername = (room: ChatRoomResponse) =>
    room.userOneId === userId ? room.userTwoUsername : room.userOneUsername;

  return (
    <div className="h-[calc(100vh-7rem)] flex rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Sidebar - Room List */}
      <div
        className={cn(
          "w-full md:w-80 border-r border-border flex flex-col bg-card",
          selectedRoomId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages
          </h2>
        </div>
        <ScrollArea className="flex-1">
          {roomsLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : !displayRooms.length ? (
            role === "CANDIDATE" ? (
              <div className="p-3 space-y-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Start a conversation with hirers
                </p>
                {candidateChatTargetsLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))
                ) : candidateChatTargetsData?.length ? (
                  candidateChatTargetsData.map((target) => (
                    <button
                      key={target.employerId}
                      onClick={() => {
                        setSelectedChatName(target.companyName);
                        createChatRoomMutation.mutate(target.employerId);
                      }}
                      disabled={createChatRoomMutation.isPending}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left hover:bg-accent disabled:opacity-60"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {target.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {target.jobTitle}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Bạn chưa apply job nào để bắt đầu nhắn với hirer.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No conversations yet
              </div>
            )
          ) : (
            <div className="p-2">
              {displayRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setSelectedChatName(getOtherUsername(room));
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left",
                    selectedRoomId === room.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-accent"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground truncate">
                        {getOtherUsername(room)}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {room.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !selectedRoomId ? "hidden md:flex" : "flex"
        )}
      >
        {selectedRoomId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-accent/30">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedRoomId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                {selectedDisplayRoom
                  ? getOtherUsername(selectedDisplayRoom)
                  : selectedChatName || "Conversation"}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {!shouldUseMockData && messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                      <Skeleton className="h-10 w-48 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {displayMessages.map(msg => {
                      const isMine = msg.senderId === userId;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex", isMine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            )}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {format(new Date(msg.sentAt), "HH:mm")}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full bg-accent/50 border-border"
                  disabled={sendMutation.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full shrink-0 shadow-sm"
                  disabled={!message.trim() || sendMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
