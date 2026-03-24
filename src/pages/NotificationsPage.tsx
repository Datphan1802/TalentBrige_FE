import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import api from "@/lib/api";
import { ApiResponse, NotificationResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Trash2, Bell, ExternalLink, Calendar, Clock, MapPin, Video } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
  const [interviewDetails, setInterviewDetails] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<ApiResponse<NotificationResponse[]>>("/api/v1/notifications").then(r => r.data.data),
  });

  // Fetch interview details when dialog opens
  const { data: interviewData, isLoading: loadingInterview } = useQuery({
    queryKey: ["interview-details", selectedNotification?.referenceUrl],
    queryFn: () => {
      if (!selectedNotification?.referenceUrl) return null;
      return api.get(selectedNotification.referenceUrl).then(r => r.data.data);
    },
    enabled: !!selectedNotification?.referenceUrl && selectedNotification?.type === "INTERVIEW_SCHEDULED",
  });

  // Update interview details when data changes
  React.useEffect(() => {
    if (interviewData) {
      setInterviewDetails(interviewData);
    }
  }, [interviewData]);

  const handleViewDetails = (notification: NotificationResponse) => {
    setSelectedNotification(notification);
    setInterviewDetails(null); // Reset previous data
  };

  const handleCloseDialog = () => {
    setSelectedNotification(null);
    setInterviewDetails(null);
  };

  const markAllRead = useMutation({
    mutationFn: () => api.put("/api/v1/notifications/read-all"),
    onSuccess: () => { toast.success("All marked as read"); queryClient.invalidateQueries({ queryKey: ["notifications"] }); },
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Stay updated on your activity</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} className="font-medium">
            <Check className="w-4 h-4 mr-1.5" />Mark all read
          </Button>
        </div>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {(!data || data.length === 0) && !isLoading && (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-primary" />}
            title="All caught up!"
            description="You have no notifications at the moment."
          />
        )}
        <div className="space-y-2">
          {data?.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <Card className={`transition-all duration-200 hover:shadow-soft ${n.isRead ? "opacity-60" : "border-primary/20"}`}>
                <CardContent className="flex items-start justify-between py-4">
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`} />
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.content}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {n.type === "INTERVIEW_SCHEDULED" && n.referenceUrl && (
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(n)} className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    {!n.isRead && (
                      <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)} className="text-muted-foreground hover:text-primary">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove.mutate(n.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interview Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Interview Details
            </DialogTitle>
          </DialogHeader>
          
          {loadingInterview ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-muted-foreground">Loading details...</span>
            </div>
          ) : interviewDetails ? (
            <div className="space-y-4">
              <div className="bg-accent/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{interviewDetails.jobTitle || "Interview"}</h3>
                <p className="text-sm text-muted-foreground">with {interviewDetails.companyName || "Company"}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {interviewDetails.interviewDate ? new Date(interviewDetails.interviewDate).toLocaleDateString() : "TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {interviewDetails.interviewTime || interviewDetails.startTime || "TBD"}
                    </p>
                  </div>
                </div>

                {interviewDetails.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{interviewDetails.location}</p>
                    </div>
                  </div>
                )}

                {interviewDetails.meetingLink && (
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meeting Link</p>
                      <a 
                        href={interviewDetails.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {interviewDetails.meetingLink}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {interviewDetails.note && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{interviewDetails.note}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                {interviewDetails.meetingLink && (
                  <Button asChild className="flex-1">
                    <a href={interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Interview details not available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default NotificationsPage;
