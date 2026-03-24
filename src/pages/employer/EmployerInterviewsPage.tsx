import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "@/lib/api";
import {
  ApiResponse,
  InterviewResponse,
  InterviewRequest,
  ApplicationResponse,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Video,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

import { interviewStatusStyles, enumToDisplay } from "@/lib/enums";

const EmployerInterviewsPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["employer-interviews"],
    queryFn: () =>
      api
        .get<ApiResponse<InterviewResponse[]>>("/api/v1/interviews/employer")
        .then((r) => r.data.data),
  });

  const { data: applications } = useQuery({
    queryKey: ["employer-applications-for-interview"],
    queryFn: () =>
      api
        .get<
          ApiResponse<ApplicationResponse[]>
        >("/api/v1/applications/employer")
        .then((r) => r.data.data),
  });

  const interviewApps =
    applications?.filter((a) => a.status === "INTERVIEW") || [];

  const createInterview = useMutation({
    mutationFn: (data: InterviewRequest) =>
      api.post("/api/v1/interviews", data),
    onSuccess: () => {
      toast.success("Interview scheduled");
      queryClient.invalidateQueries({ queryKey: ["employer-interviews"] });
      setDialogOpen(false);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message || "Failed to schedule interview",
      ),
  });

  const cancelInterview = useMutation({
    mutationFn: (id: number) => api.put(`/api/v1/interviews/${id}/cancel`),
    onSuccess: () => {
      toast.success("Interview cancelled");
      queryClient.invalidateQueries({ queryKey: ["employer-interviews"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to cancel"),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interviews</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Schedule and manage candidate interviews
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-soft gap-1.5">
                <Plus className="w-4 h-4" /> Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Schedule Interview</DialogTitle>
              </DialogHeader>
              <ScheduleForm
                applications={interviewApps}
                onSubmit={(data) => createInterview.mutate(data)}
                isPending={createInterview.isPending}
              />
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

        {!isLoading && (!interviews || interviews.length === 0) && (
          <EmptyState
            icon={<CalendarIcon className="w-8 h-8 text-primary" />}
            title="No interviews scheduled"
            description="Schedule interviews with candidates who are in the interview stage."
          />
        )}

        <div className="space-y-3">
          {interviews?.map((interview, i) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <Card className="hover:shadow-soft transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {interview.candidateName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {interview.jobTitle}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={interviewStatusStyles[interview.status] || ""}
                    >
                      {enumToDisplay(interview.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {format(
                        new Date(interview.interviewAt),
                        "yyyy-MM-dd 'at' p",
                      )}
                    </span>
                    {interview.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {interview.location}
                      </span>
                    )}
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                  {interview.note && (
                    <p className="text-sm text-muted-foreground border-t border-border/50 pt-2">
                      {interview.note}
                    </p>
                  )}
                  {interview.status === "SCHEDULED" && (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => cancelInterview.mutate(interview.id)}
                        disabled={cancelInterview.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
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

const ScheduleForm = ({
  applications,
  onSubmit,
  isPending,
}: {
  applications: ApplicationResponse[];
  onSubmit: (data: InterviewRequest) => void;
  isPending: boolean;
}) => {
  const [applicationId, setApplicationId] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !date) {
      toast.error("Please select an application and date");
      return;
    }
    const [hours, minutes] = time.split(":").map(Number);
    const interviewDate = new Date(date);
    interviewDate.setHours(hours, minutes, 0, 0);

    onSubmit({
      applicationId: Number(applicationId),
      interviewAt: interviewDate.toISOString(),
      location,
      meetingLink,
      note,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Application</Label>
        <Select value={applicationId} onValueChange={setApplicationId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a candidate" />
          </SelectTrigger>
          <SelectContent>
            {applications.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No applications in interview stage
              </div>
            )}
            {applications.map((app) => (
              <SelectItem key={app.id} value={String(app.id)}>
                {app.candidateName} — {app.jobTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label>Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Location (optional)</Label>
        <Input
          placeholder="e.g. Office Building A, Room 301"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Meeting Link (optional)</Label>
        <Input
          placeholder="e.g. https://meet.google.com/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Note (optional)</Label>
        <Textarea
          placeholder="Any additional notes for the candidate..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full shadow-soft" disabled={isPending}>
        {isPending ? "Scheduling..." : "Schedule Interview"}
      </Button>
    </form>
  );
};

export default EmployerInterviewsPage;
