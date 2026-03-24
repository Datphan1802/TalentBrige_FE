import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ApiResponse, ApplicationResponse, ChatRoomResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CandidateProfileResponse } from "@/lib/types";
import { toast } from "sonner";
import { FileText, ExternalLink, Eye, User, Sparkles, Briefcase, GraduationCap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

import { APPLICATION_STATUSES, applicationStatusStyles, enumToDisplay } from "@/lib/enums";

const EmployerApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
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
              <ApplicationCard app={app} queryClient={queryClient} onViewProfile={(candidateId) => {
                setSelectedCandidate(candidateId);
                setProfileDialogOpen(true);
              }} />
            </motion.div>
          ))}
        </div>
        
        {/* Candidate Profile Dialog */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate Profile</DialogTitle>
            </DialogHeader>
            {selectedCandidate && (
              <CandidateProfileView candidateId={selectedCandidate} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

const ApplicationCard = ({ app, queryClient, onViewProfile }: { app: ApplicationResponse; queryClient: any; onViewProfile: (candidateId: number) => void }) => {
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
          <Badge variant="outline" className={applicationStatusStyles[app.status] || ""}>{enumToDisplay(app.status)}</Badge>
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewProfile(app.candidateId)}
            className="gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            View Profile
          </Button>
          <div className="flex-1 flex items-end gap-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Update Status</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{enumToDisplay(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} className="max-w-xs" />
            <Button size="sm" onClick={() => updateStatus.mutate()} disabled={updateStatus.isPending || status === app.status} className="shadow-soft">
              Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CandidateProfileView = ({ candidateId }: { candidateId: number }) => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["candidate-profile", candidateId],
    queryFn: () => {
      console.log(`Fetching candidate profile for ID: ${candidateId}`);
      // Try different endpoints that might work for employer
      return api.get<ApiResponse<CandidateProfileResponse>>(`/api/v1/candidates/profile/${candidateId}`)
        .then(r => {
          console.log("Candidate profile response:", r.data);
          return r.data.data;
        })
        .catch(err => {
          console.error("Error with /candidates/profile endpoint, trying alternative...");
          // Try alternative endpoint
          return api.get<ApiResponse<CandidateProfileResponse>>(`/api/v1/users/${candidateId}`)
            .then(r => {
              console.log("User profile response:", r.data);
              return r.data.data;
            })
            .catch(userErr => {
              console.error("Error with user endpoint:", userErr);
              throw userErr;
            });
        });
    },
    enabled: !!candidateId,
  });

  const navigate = useNavigate();

  // Create or get chat room mutation
  const createChatRoomMutation = useMutation({
    mutationFn: (targetUserId: number) => {
      console.log("Creating chat room with candidate:", targetUserId);
      return api
        .post<ApiResponse<ChatRoomResponse>>(`/api/v1/chat/rooms/${targetUserId}`)
        .then((r) => {
          console.log("Chat room created/retrieved:", r.data);
          return r.data.data;
        });
    },
    onSuccess: (chatRoom) => {
      console.log("Chat room ready:", chatRoom);
      toast.success("Opening chat...");
      navigate(`/chat?roomId=${chatRoom.id}`);
    },
    onError: (err: any) => {
      console.error("Create chat room error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create chat";
      toast.error(errorMessage);
      navigate("/chat");
    },
  });

  const handleMessageCandidate = () => {
    if (!profile) return;
    createChatRoomMutation.mutate(profile.id);
  };

  if (isLoading) return <div className="flex items-center justify-center py-10 text-muted-foreground">Loading profile...</div>;
  if (error) {
    console.error("Candidate profile error:", error);
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <p className="text-destructive font-medium">Error loading profile</p>
        <p className="text-sm mt-1">Please check the console for details</p>
      </div>
    );
  }
  if (!profile) return <div className="flex items-center justify-center py-10 text-muted-foreground">Profile not found.</div>;

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.fullName} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-medium">{profile.fullName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{profile.phone || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium">{profile.address || "—"}</span>
            </div>
            {profile.cvUrl && (
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">CV</span>
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  View CV
                </a>
              </div>
            )}
            {profile.summary && (
              <div className="pt-1.5">
                <span className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">Professional Summary</span>
                <p className="mt-1 text-foreground leading-relaxed">{profile.summary}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Skills</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.skills.length} skills</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.skills.map(skill => (
                <div key={skill.skillName} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                      {skill.skillName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {enumToDisplay(skill.level)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Proficiency: {enumToDisplay(skill.level)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {profile.workExperiences && profile.workExperiences.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Work Experience</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.workExperiences.length} positions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.workExperiences.map(exp => (
              <div key={exp.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-base">{exp.position}</p>
                      <p className="text-sm text-muted-foreground font-medium">{exp.company}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {exp.currentlyWorking ? "Current" : "Past"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>
                </div>
                {exp.description && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.educations && profile.educations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Education</CardTitle>
                <p className="text-sm text-muted-foreground">{profile.educations.length} degrees</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.educations.map(edu => (
              <div key={edu.id} className="border border-border/60 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-base">{edu.degree} in {edu.major}</p>
                      <p className="text-sm text-muted-foreground font-medium">{edu.school}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {edu.startDate} – {edu.endDate || "Present"}
                    </span>
                  </div>
                </div>
                {edu.description && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Profile Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Total Skills</span>
                <span className="font-medium">{profile.skills?.length || 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Work Experience</span>
                <span className="font-medium">{profile.workExperiences?.length || 0} positions</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Education</span>
                <span className="font-medium">{profile.educations?.length || 0} degrees</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessageCandidate}
                disabled={createChatRoomMutation.isPending}
                className="gap-2 flex-1"
              >
                <MessageSquare className="w-4 h-4" />
                {createChatRoomMutation.isPending ? "Creating..." : "Message"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Navigate to user profile
                  window.location.href = `/candidate/profile/${profile.id}`;
                }}
                className="gap-2 flex-1"
              >
                <Eye className="w-4 h-4" />
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default EmployerApplicationsPage;
