import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, ApplicationResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  REVIEWING: "bg-info/10 text-info border-info/20",
  INTERVIEW: "bg-primary/10 text-primary border-primary/20",
  ACCEPTED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
};

const MyApplicationsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () =>
      api
        .get<
          ApiResponse<ApplicationResponse[]>
        >("/api/v1/applications/my-applications")
        .then((r) => r.data.data),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/applications/${id}/withdraw`),
    onSuccess: () => {
      toast.success("Application withdrawn");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track the status of your job applications
          </p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && (!data || data.length === 0) && (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-primary" />}
            title="No applications yet"
            description="Start exploring jobs and submit your first application."
          />
        )}

        <div className="space-y-3">
          {data?.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {app.jobTitle}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={statusStyles[app.status] || ""}
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.companyName} · Applied{" "}
                    {new Date(app.appliedAt).toISOString().split("T")[0]}
                  </p>
                </CardHeader>
                <CardContent>
                  {app.coverLetter && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {app.coverLetter}
                    </p>
                  )}
                  {app.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => withdrawMutation.mutate(app.id)}
                      disabled={withdrawMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Withdraw
                    </Button>
                  )}
                  {app.histories?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Timeline
                      </p>
                      {app.histories.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{h.fromStatus}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="font-medium text-foreground">
                            {h.toStatus}
                          </span>
                          {h.note && <span>· {h.note}</span>}
                          <span className="ml-auto">
                            {new Date(h.changedAt).toISOString().split("T")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyApplicationsPage;
