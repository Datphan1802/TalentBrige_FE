import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ApiResponse,
  JobPostResponse,
  JobPostRequest,
  CategoryResponse,
} from "@/lib/types";
import { formatDateYMD } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Briefcase, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

import { EXPERIENCE_LEVELS, JOB_TYPES, jobStatusStyles, enumToDisplay } from "@/lib/enums";

const EmployerJobsPage = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const initialForm: JobPostRequest = {
    title: "",
    description: "",
    salaryMin: 0,
    salaryMax: 0,
    location: "",
    jobType: "FULL_TIME",
    experienceLevel: "INTERN",
    categoryId: 0,
    expiredAt: formatDateYMD(new Date()),
    skills: [],
  };

  const [form, setForm] = useState<JobPostRequest>(initialForm);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () =>
      api
        .get<ApiResponse<JobPostResponse[]>>("/api/v1/jobs/my-jobs")
        .then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      api
        .get<ApiResponse<CategoryResponse[]>>("/api/v1/categories")
        .then((r) => r.data.data),
  });

  const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;

  const createJob = useMutation({
    mutationFn: (data: JobPostRequest) => api.post("/api/v1/jobs", data),
    onSuccess: () => {
      toast.success("Job posted!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Error"),
  });

  const deleteJob = useMutation({
    mutationFn: (id: number) => api.delete(`/api/v1/jobs/${id}`),
    onSuccess: () => {
      toast.success("Job closed");
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Job Posts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your open positions
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (isOpen) {
                setForm({
                  ...initialForm,
                  expiredAt: formatDateYMD(new Date()),
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="shadow-soft font-medium">
                <Plus className="w-4 h-4 mr-1.5" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Post</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  if (!ymdRegex.test(form.expiredAt)) {
                    toast.error("Expiry date must be in format YYYY-MM-DD");
                    return;
                  }

                  const parsedExpiry = new Date(form.expiredAt);
                  if (Number.isNaN(parsedExpiry.getTime())) {
                    toast.error("Expiry date is not a valid date");
                    return;
                  }

                  const formattedDate = formatDateYMD(parsedExpiry);
                  const preparedForm = {
                    ...form,
                    expiredAt: `${formattedDate}T00:00:00`,
                  };

                  createJob.mutate(preparedForm);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Min Salary</Label>
                    <Input
                      type="number"
                      value={form.salaryMin}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          salaryMin: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Salary</Label>
                    <Input
                      type="number"
                      value={form.salaryMax}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          salaryMax: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select
                      value={form.jobType}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, jobType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map(jt => (
                          <SelectItem key={jt} value={jt}>{enumToDisplay(jt)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Select
                      value={form.experienceLevel}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, experienceLevel: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>{enumToDisplay(level)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={String(form.categoryId)}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, categoryId: Number(v) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={form.expiredAt}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        expiredAt: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createJob.isPending}
                  className="w-full font-medium shadow-soft"
                >
                  {createJob.isPending ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && (!jobs || jobs.length === 0) && (
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-primary" />}
            title="No job posts yet"
            description="Create your first job post to start receiving applications."
          />
        )}

        <div className="space-y-3">
          {jobs?.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span>{enumToDisplay(job.jobType)}</span>
                        <span>{enumToDisplay(job.experienceLevel)}</span>
                        {job.expiredAt && (
                          <span>Expires: {formatDateYMD(job.expiredAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={jobStatusStyles[job.status] || ""}
                      >
                        {enumToDisplay(job.status)}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="w-3 h-3" />
                        {job.applicationCount}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteJob.mutate(job.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default EmployerJobsPage;
