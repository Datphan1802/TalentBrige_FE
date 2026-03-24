import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ApiResponse,
  JobPostResponse,
  PageResponse,
  ApplicationRequest,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  DollarSign,
  Clock,
  Search,
  Briefcase,
  Send,
  Eye,
  Building2,
  Calendar,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import SkeletonCard from "@/components/SkeletonCard";
import EmptyState from "@/components/EmptyState";

// Format skill name to handle spaces and special characters
const formatSkillName = (skillName: string): string => {
  if (!skillName) return "";

  // Convert common skill name formats to readable format
  const skillMap: Record<string, string> = {
    REACT: "React",
    ANGULAR: "Angular",
    VUE: "Vue.js",
    NEXTJS: "Next.js",
    NUXTJS: "Nuxt.js",
    SVELTE: "Svelte",
    JQUERY: "jQuery",
    BOOTSTRAP: "Bootstrap",
    TAILWIND_CSS: "Tailwind CSS",
    SASS: "Sass/SCSS",
    SPRING_BOOT: "Spring Boot",
    SPRING_FRAMEWORK: "Spring",
    NODEJS: "Node.js",
    EXPRESS: "Express.js",
    DJANGO: "Django",
    FLASK: "Flask",
    FASTAPI: "FastAPI",
    LARAVEL: "Laravel",
    RAILS: "Ruby on Rails",
    ASP_NET: "ASP.NET",
    NESTJS: "NestJS",
    ANDROID: "Android",
    IOS: "iOS",
    REACT_NATIVE: "React Native",
    FLUTTER: "Flutter",
    XAMARIN: "Xamarin",
    MYSQL: "MySQL",
    POSTGRESQL: "PostgreSQL",
    MONGODB: "MongoDB",
    REDIS: "Redis",
    ELASTICSEARCH: "Elasticsearch",
    ORACLE: "Oracle",
    MSSQL: "MS SQL Server",
    SQLITE: "SQLite",
    CASSANDRA: "Cassandra",
    DYNAMODB: "DynamoDB",
    FIREBASE: "Firebase",
    AWS: "AWS",
    AZURE: "Azure",
    GCP: "Google Cloud",
    DOCKER: "Docker",
    KUBERNETES: "Kubernetes",
    TERRAFORM: "Terraform",
    ANSIBLE: "Ansible",
    JENKINS: "Jenkins",
    GITHUB_ACTIONS: "GitHub Actions",
    GITLAB_CI: "GitLab CI",
    LINUX: "Linux",
    NGINX: "Nginx",
    APACHE: "Apache",
    MACHINE_LEARNING: "Machine Learning",
    DEEP_LEARNING: "Deep Learning",
    DATA_SCIENCE: "Data Science",
    DATA_ANALYSIS: "Data Analysis",
    TENSORFLOW: "TensorFlow",
    PYTORCH: "PyTorch",
    PANDAS: "Pandas",
    NUMPY: "NumPy",
    SPARK: "Apache Spark",
    HADOOP: "Hadoop",
    TABLEAU: "Tableau",
    POWER_BI: "Power BI",
    SQL: "SQL",
    JUNIT: "JUnit",
    SELENIUM: "Selenium",
    CYPRESS: "Cypress",
    JEST: "Jest",
    POSTMAN: "Postman",
    JMeter: "JMeter",
    GIT: "Git",
    AGILE: "Agile",
    SCRUM: "Scrum",
    JIRA: "Jira",
    FIGMA: "Figma",
    PHOTOSHOP: "Photoshop",
    ILLUSTRATOR: "Illustrator",
    COMMUNICATION: "Communication",
    LEADERSHIP: "Leadership",
    PROBLEM_SOLVING: "Problem Solving",
    TEAMWORK: "Teamwork",
    PROJECT_MANAGEMENT: "Project Management",
    BUSINESS_ANALYSIS: "Business Analysis",
    UI_UX_DESIGN: "UI/UX Design",
    DEVOPS: "DevOps",
    MICROSERVICES: "Microservices",
    REST_API: "REST API",
    GRAPHQL: "GraphQL",
    GRPC: "gRPC",
    KAFKA: "Apache Kafka",
    RABBITMQ: "RabbitMQ",
    WEBSOCKET: "WebSocket",
  };

  // Return mapped name or format the original
  return skillMap[skillName] || skillName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const JobListPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { role } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", page, search],
    queryFn: () =>
      api
        .get<
          ApiResponse<PageResponse<JobPostResponse>>
        >(search ? "/api/v1/jobs/search" : "/api/v1/jobs", { params: { page, size: 12, ...(search ? { keyword: search } : {}) } })
        .then((r) => r.data.data),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Browse Jobs</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Find your next opportunity
            </p>
          </div>
          <div className="relative sm:ml-auto w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, skills, companies..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && data?.empty && (
          <EmptyState
            icon={<Briefcase className="w-8 h-8 text-primary" />}
            title="No jobs found"
            description="Try adjusting your search terms or check back later for new opportunities."
          />
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.content?.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <JobCard job={job} canApply={role === "CANDIDATE"} />
            </motion.div>
          ))}
        </div>

        {data && !data.empty && (
          <div className="flex items-center gap-3 justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.first}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground font-medium">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

/* ───────── Job Details Modal ───────── */
const JobDetailsModal = ({
  jobId,
  canApply,
}: {
  jobId: number;
  canApply: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job-details", jobId],
    queryFn: () =>
      api
        .get<ApiResponse<JobPostResponse>>(`/api/v1/jobs/${jobId}`)
        .then((r) => r.data.data),
    enabled: open,
  });

  const applyMutation = useMutation({
    mutationFn: (data: ApplicationRequest) =>
      api.post("/api/v1/applications", data),
    onSuccess: async () => {
      toast.success("Application submitted!");
      setApplyOpen(false);
      setCoverLetter("");
      
      // Add small delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch my-applications to show new application
      await queryClient.refetchQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to apply"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-medium">
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl p-0">
        {/* Blue header */}
        <div className="bg-primary/5 border-b border-primary/10 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {isLoading ? "Loading..." : job?.title}
            </DialogTitle>
            {job && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{job.companyName}</span>
                {job.categoryName && (
                  <>
                    <span className="text-border">•</span>
                    <Tag className="w-3.5 h-3.5" />
                    <span>{job.categoryName}</span>
                  </>
                )}
              </div>
            )}
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted rounded animate-pulse"
                style={{ width: `${80 - i * 15}%` }}
              />
            ))}
          </div>
        ) : job ? (
          <div className="px-6 py-5 space-y-5">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetaItem
                icon={<MapPin className="w-4 h-4" />}
                label="Location"
                value={job.location}
              />
              <MetaItem
                icon={<Briefcase className="w-4 h-4" />}
                label="Job Type"
                value={job.jobType}
              />
              <MetaItem
                icon={<DollarSign className="w-4 h-4" />}
                label="Salary"
                value={`${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}`}
              />
              <MetaItem
                icon={<Clock className="w-4 h-4" />}
                label="Experience"
                value={job.experienceLevel}
              />
              {job.postedAt && (
                <MetaItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Posted"
                  value={new Date(job.postedAt).toISOString().split("T")[0]}
                />
              )}
              {job.expiredAt && (
                <MetaItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Expires"
                  value={new Date(job.expiredAt).toISOString().split("T")[0]}
                />
              )}
            </div>

            <Separator />

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <Badge
                      key={s.skillName}
                      variant="secondary"
                      className="text-xs font-medium"
                    >
                      {formatSkillName(s.skillName)}
                      {s.level && (
                        <span className="ml-1 text-muted-foreground">
                          · {s.level}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Full description */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Description
              </h3>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Apply section */}
            {canApply && (
              <>
                <Separator />
                {!applyOpen ? (
                  <Button
                    className="w-full font-medium shadow-soft"
                    onClick={() => setApplyOpen(true)}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Apply Now
                  </Button>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      applyMutation.mutate({
                        jobPostId: job.id,
                        cvUrlAtTime: "",
                        coverLetter,
                      });
                    }}
                    className="space-y-3"
                  >
                    <Label>Cover Letter</Label>
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                      placeholder="Tell the employer why you're a great fit..."
                    />
                    {applyMutation.isError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">
                          {(applyMutation.error as any)?.response?.data
                            ?.message || "Error"}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setApplyOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={applyMutation.isPending}
                        className="flex-1 font-medium shadow-soft"
                      >
                        {applyMutation.isPending
                          ? "Submitting..."
                          : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const MetaItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/40">
    <span className="text-primary mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

/* ───────── Job Card ───────── */
const JobCard = ({
  job,
  canApply,
}: {
  job: JobPostResponse;
  canApply: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: (data: ApplicationRequest) =>
      api.post("/api/v1/applications", data),
    onSuccess: async () => {
      toast.success("Application submitted!");
      setOpen(false);
      
      // Add small delay to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch my-applications to show new application
      await queryClient.refetchQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // Invalidate application queries for both candidate and employer
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to apply"),
  });

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {job.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              {job.companyName}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs font-medium">
            {job.jobType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            {job.salaryMin?.toLocaleString()} –{" "}
            {job.salaryMax?.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {job.experienceLevel}
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((s) => (
              <Badge
                key={s.skillName}
                variant="outline"
                className="text-xs font-normal bg-accent/50"
              >
                {formatSkillName(s.skillName)}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{job.skills.length - 4}
              </Badge>
            )}
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        <div className="flex gap-2 mt-1">
          <JobDetailsModal jobId={job.id} canApply={canApply} />
          {canApply && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 font-medium shadow-soft">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Apply Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply to {job.title}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyMutation.mutate({
                      jobPostId: job.id,
                      cvUrlAtTime: "",
                      coverLetter,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Cover Letter</Label>
                    <Textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      placeholder="Tell the employer why you're a great fit..."
                    />
                  </div>
                  {applyMutation.isError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">
                        {(applyMutation.error as any)?.response?.data
                          ?.message || "Error"}
                      </p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="w-full font-medium shadow-soft"
                  >
                    {applyMutation.isPending
                      ? "Submitting..."
                      : "Submit Application"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobListPage;
