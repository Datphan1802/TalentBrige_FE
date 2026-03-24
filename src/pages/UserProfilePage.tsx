import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { ApiResponse, UserProfileResponse, FollowResponse, ChatRoomResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, MessageSquare, Users, MapPin, Building2, Globe, Calendar, ArrowLeft, UserPlus, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [followDialogOpen, setFollowDialogOpen] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => {
      console.log(`Fetching user profile for ID: ${userId}`);
      return api.get<ApiResponse<UserProfileResponse>>(`/api/v1/users/${userId}`)
        .then(r => {
          console.log("User profile response:", r.data);
          return r.data.data;
        })
        .catch(err => {
          console.error("Error fetching user profile:", err);
          throw err;
        });
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data to get latest follow status
  });

  const followMutation = useMutation({
    mutationFn: (followingId: number) => {
      console.log("Following user:", followingId);
      // Use correct backend endpoint: /api/v1/connections/{userId}/follow
      return api.post<ApiResponse<FollowResponse>>(`/api/v1/connections/${followingId}/follow`)
        .then(r => {
          console.log("Follow response:", r.data);
          return r.data;
        });
    },
    onSuccess: (response) => {
      console.log("Follow success:", response);
      toast.success("Followed successfully!");
      // Update local state immediately
      queryClient.setQueryData(["user-profile", userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: true,
          followersCount: (old.followersCount || 0) + 1
        };
      });
      setFollowDialogOpen(false);
    },
    onError: (err: any) => {
      console.error("Follow error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to follow";
      toast.error(errorMessage);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (followingId: number) => {
      console.log("Unfollowing user:", followingId);
      // Use correct backend endpoint: /api/v1/connections/{userId}/unfollow
      return api.delete<ApiResponse<void>>(`/api/v1/connections/${followingId}/unfollow`)
        .then(r => {
          console.log("Unfollow response:", r.data);
          return r.data;
        });
    },
    onSuccess: () => {
      console.log("Unfollow successful");
      toast.success("Unfollowed successfully!");
      // Update local state immediately
      queryClient.setQueryData(["user-profile", userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: false,
          followersCount: Math.max((old.followersCount || 0) - 1, 0)
        };
      });
      setFollowDialogOpen(false);
    },
    onError: (err: any) => {
      console.error("Unfollow error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to unfollow";
      toast.error(errorMessage);
    },
  });

  // Create or get chat room mutation
  const createChatRoomMutation = useMutation({
    mutationFn: (targetUserId: number) => {
      console.log("Creating chat room with user:", targetUserId);
      // Try different endpoints and methods
      return api.post<ApiResponse<ChatRoomResponse>>("/api/v1/chat/rooms", { targetUserId })
        .then(r => {
          console.log("Chat room created/retrieved:", r.data);
          return r.data.data;
        })
        .catch(err => {
          console.error("POST /rooms failed, trying /chat endpoint...");
          // Try different endpoint
          return api.post<ApiResponse<ChatRoomResponse>>("/api/v1/chat", { targetUserId })
            .then(r => {
              console.log("Chat room created/retrieved with /chat:", r.data);
              return r.data.data;
            });
        });
    },
    onSuccess: (chatRoom) => {
      console.log("Chat room ready:", chatRoom);
      toast.success("Opening chat...");
      // Navigate to chat with the specific room
      navigate(`/chat?roomId=${chatRoom.id}`);
    },
    onError: (err: any) => {
      console.error("Create chat room error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create chat";
      toast.error(errorMessage);
      // Fallback: navigate to general chat page
      navigate("/chat");
    },
  });

  const handleMessageUser = () => {
    if (!profile) return;
    
    // Create or get existing chat room with this user
    createChatRoomMutation.mutate(profile.id);
  };

  const handleFollow = () => {
    if (!profile) return;
    
    if (profile.isFollowing) {
      unfollowMutation.mutate(profile.id);
    } else {
      followMutation.mutate(profile.id);
    }
  };

  {error && (
    <PageTransition>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Backend Error</h2>
        <p className="text-muted-foreground mb-4">Unable to load user profile. The backend server returned an error.</p>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md">
          <p className="text-sm text-destructive font-medium mb-2">Error Details:</p>
          <p className="text-xs text-muted-foreground font-mono">
            Status: 500 Internal Server Error<br />
            Endpoint: /api/v1/users/{userId}<br />
            Message: Please check the backend server logs
          </p>
        </div>
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </PageTransition>
  )}

  if (isLoading) return (
    <PageTransition>
      <div className="flex items-center justify-center py-20">
        <SkeletonCard />
      </div>
    </PageTransition>
  );

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">The user profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
                  <Badge variant="outline" className="text-sm">{profile.role}</Badge>
                </div>
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.company && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{profile.followersCount} followers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{profile.followingCount} following</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMessageUser}
                  className="gap-2 w-full"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className={`gap-2 w-full ${profile.isFollowing ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      {unfollowMutation.isPending ? "Unfollowing..." : "Unfollow"}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {followMutation.isPending ? "Following..." : "Follow"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-accent/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.followersCount}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.followingCount}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.role}</div>
                <div className="text-sm text-muted-foreground">Role</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Join Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">March 2024</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default UserProfilePage;
