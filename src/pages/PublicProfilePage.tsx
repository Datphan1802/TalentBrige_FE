import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { ApiResponse, ChatRoomResponse, DirectoryProfileResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, User, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const PublicProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["directory-profile", userId],
    queryFn: () =>
      api
        .get<ApiResponse<DirectoryProfileResponse>>(`/api/v1/directory/profiles/${userId}`)
        .then((r) => r.data.data),
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: (id: number) => api.post(`/api/v1/connections/${id}/follow`),
    onSuccess: () => {
      toast.success("Followed");
      queryClient.setQueryData(["directory-profile", userId], (old: DirectoryProfileResponse | undefined) =>
        old
          ? {
              ...old,
              isFollowing: true,
              isMutualFollow: true,
              canMessage: true,
              followerCount: (old.followerCount || 0) + 1,
            }
          : old
      );
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Follow failed"),
  });

  const createRoomMutation = useMutation({
    mutationFn: (id: number) =>
      api.post<ApiResponse<ChatRoomResponse>>(`/api/v1/chat/rooms/${id}`).then((r) => r.data.data),
    onSuccess: (room) => navigate(`/chat?roomId=${room.id}`),
    onError: (err: any) => toast.error(err?.response?.data?.message || "Cannot open chat"),
  });

  if (isLoading) {
    return <div className="py-16 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="py-16 text-center text-muted-foreground">Profile not found.</div>;
  }

  return (
    <PageTransition>
      <div className="space-y-4 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {profile.fullName || profile.username}
                  </h1>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">@{profile.username}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.subtitle || profile.companyName || "TalentBridge user"}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.followerCount} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.followingCount} following
                  </span>
                  {profile.followsYou && (
                    <Badge variant="secondary">Follows you</Badge>
                  )}
                  {profile.isMutualFollow && (
                    <Badge variant="outline">Mutual</Badge>
                  )}
                </div>
              </div>
              {!profile.isMe && (
                <div className="flex flex-col gap-2">
                  {!profile.isFollowing && (
                    <Button
                      variant="outline"
                      onClick={() => followMutation.mutate(profile.id)}
                      disabled={followMutation.isPending}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </Button>
                  )}
                  {profile.canMessage && (
                    <Button
                      onClick={() => createRoomMutation.mutate(profile.id)}
                      disabled={createRoomMutation.isPending}
                      className="gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default PublicProfilePage;
