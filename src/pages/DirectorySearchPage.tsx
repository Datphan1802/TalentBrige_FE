import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { ApiResponse, UserSearchResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, UserPlus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const DirectorySearchPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const suggestionsQuery = useQuery({
    queryKey: ["directory-suggestions"],
    queryFn: () =>
      api
        .get<ApiResponse<UserSearchResponse[]>>("/api/v1/directory/suggestions")
        .then((r) => r.data.data),
    enabled: debouncedKeyword.length === 0,
  });

  const searchQuery = useQuery({
    queryKey: ["directory-search", debouncedKeyword],
    queryFn: () =>
      api
        .get<ApiResponse<UserSearchResponse[]>>("/api/v1/directory/search", {
          params: { keyword: debouncedKeyword },
        })
        .then((r) => r.data.data),
    enabled: debouncedKeyword.length > 0,
  });

  const users = useMemo(
    () => (debouncedKeyword.length > 0 ? searchQuery.data ?? [] : suggestionsQuery.data ?? []),
    [debouncedKeyword.length, searchQuery.data, suggestionsQuery.data]
  );
  const isLoading = debouncedKeyword.length > 0 ? searchQuery.isLoading : suggestionsQuery.isLoading;

  const followMutation = useMutation({
    mutationFn: (userId: number) => api.post(`/api/v1/connections/${userId}/follow`),
    onSuccess: (_res, userId) => {
      toast.success("Followed");
      const markFollow = (list?: UserSearchResponse[]) =>
        list?.map((item) =>
          item.id === userId
            ? {
                ...item,
                isFollowing: true,
                isMutualFollow: true,
                canMessage: true,
              }
            : item
        );
      queryClient.setQueryData(["directory-suggestions"], markFollow);
      queryClient.setQueryData(["directory-search", debouncedKeyword], markFollow);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Follow failed"),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find candidates and hirers, follow and connect.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by name, username, company..."
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !users.length ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="w-full rounded-lg border border-border p-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{user.fullName || user.username}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {user.subtitle || user.companyName || "TalentBridge user"}
                        </p>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!user.isMe && !user.isFollowing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => followMutation.mutate(user.id)}
                            disabled={followMutation.isPending}
                            className="gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Follow
                          </Button>
                        )}
                        {!user.isMe && user.canMessage && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/chat?otherUserId=${user.id}`)}
                            className="gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default DirectorySearchPage;
