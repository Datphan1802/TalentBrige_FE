import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, NotificationResponse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Trash2, Bell } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<ApiResponse<NotificationResponse[]>>("/api/v1/notifications").then(r => r.data.data),
  });

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
    </PageTransition>
  );
};

export default NotificationsPage;
