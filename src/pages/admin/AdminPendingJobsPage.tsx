import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, JobPostResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Shield, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

const AdminPendingJobsPage = () => {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-pending-jobs"],
    queryFn: () => api.get<ApiResponse<JobPostResponse[]>>("/api/v1/admin/jobs/pending").then(r => r.data.data),
  });

  const approve = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/admin/jobs/${id}/approve`),
    onSuccess: () => { toast.success("Job approved"); queryClient.invalidateQueries({ queryKey: ["admin-pending-jobs"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Job Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review and approve submitted job posts</p>
        </div>

        {isLoading && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

        {!isLoading && (!jobs || jobs.length === 0) && (
          <EmptyState icon={<Shield className="w-8 h-8 text-primary" />} title="No pending jobs" description="All job posts have been reviewed. Check back later." />
        )}

        <div className="space-y-3">
          {jobs?.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}>
              <PendingJobCard job={job} onApprove={() => approve.mutate(job.id)} queryClient={queryClient} />
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

const PendingJobCard = ({ job, onApprove, queryClient }: { job: JobPostResponse; onApprove: () => void; queryClient: any }) => {
  const [reason, setReason] = useState("");

  const reject = useMutation({
    mutationFn: () => api.put(`/api/v1/admin/jobs/${job.id}/reject`, { rejectionReason: reason }),
    onSuccess: () => { toast.success("Job rejected"); queryClient.invalidateQueries({ queryKey: ["admin-pending-jobs"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  return (
    <Card className="hover:shadow-soft transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{job.companyName}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
          <span>{job.jobType}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()}
        </p>
        <div className="flex items-end gap-2 pt-2 border-t border-border/50">
          <Button size="sm" onClick={onApprove} className="shadow-soft">
            <Check className="w-4 h-4 mr-1" />Approve
          </Button>
          <Input placeholder="Rejection reason" value={reason} onChange={e => setReason(e.target.value)} className="max-w-xs" />
          <Button size="sm" variant="outline" onClick={() => reject.mutate()} disabled={!reason} className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5">
            <X className="w-4 h-4 mr-1" />Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPendingJobsPage;
