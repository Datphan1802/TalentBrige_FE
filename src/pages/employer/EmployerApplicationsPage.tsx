import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, ApplicationResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, ExternalLink } from "lucide-react";
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
};

const EmployerApplicationsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["employer-applications"],
    queryFn: () => api.get<ApiResponse<ApplicationResponse[]>>("/api/v1/applications/employer").then(r => r.data.data),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications Received</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and manage candidate applications</p>
        </div>

        {isLoading && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

        {!isLoading && (!data || data.length === 0) && (
          <EmptyState icon={<FileText className="w-8 h-8 text-primary" />} title="No applications yet" description="Applications will appear here once candidates apply to your job posts." />
        )}

        <div className="space-y-3">
          {data?.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
              <ApplicationCard app={app} queryClient={queryClient} />
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

const ApplicationCard = ({ app, queryClient }: { app: ApplicationResponse; queryClient: any }) => {
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState("");

  const updateStatus = useMutation({
    mutationFn: () => api.put(`/api/v1/applications/${app.id}/status`, { status, note }),
    onSuccess: () => { toast.success("Status updated"); queryClient.invalidateQueries({ queryKey: ["employer-applications"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  return (
    <Card className="hover:shadow-soft transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{app.candidateName}</CardTitle>
            <p className="text-sm text-muted-foreground">{app.candidateEmail} · {app.jobTitle}</p>
          </div>
          <Badge variant="outline" className={statusStyles[app.status] || ""}>{app.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {app.coverLetter && <p className="text-sm text-muted-foreground leading-relaxed">{app.coverLetter}</p>}
        {app.cvUrlAtTime && (
          <a href={app.cvUrlAtTime} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <ExternalLink className="w-3.5 h-3.5" />View CV
          </a>
        )}
        <div className="flex items-end gap-2 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Update Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWING">Reviewing</SelectItem>
                <SelectItem value="INTERVIEW">Interview</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="max-w-xs" />
          <Button size="sm" onClick={() => updateStatus.mutate()} disabled={updateStatus.isPending || status === app.status} className="shadow-soft">
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployerApplicationsPage;
