// Backend enum values and display helpers

export const EXPERIENCE_LEVELS = ["INTERN", "FRESHER", "JUNIOR", "MID", "SENIOR", "LEAD"] as const;

export const APPLICATION_STATUSES = ["SUBMITTED", "REVIEWING", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"] as const;

export const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"] as const;

export const JOB_STATUSES = ["PENDING_APPROVAL", "ACTIVE", "CLOSED", "REJECTED"] as const;

export const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"] as const;

export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export const SKILL_NAMES = [
  "JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT", "C", "C_PLUS_PLUS", "C_SHARP", "GO", "RUST", "KOTLIN",
  "SWIFT", "PHP", "RUBY", "SCALA", "DART", "R", "MATLAB", "PERL", "HASKELL", "LUA",
  "REACT", "ANGULAR", "VUE", "SVELTE", "NEXT_JS", "NUXT_JS", "GATSBY", "EMBER",
  "NODE_JS", "EXPRESS", "SPRING", "SPRING_BOOT", "DJANGO", "FLASK", "FAST_API", "LARAVEL", "RAILS",
  "DOT_NET", "ASP_NET", "NEST_JS",
  "HTML", "CSS", "SASS", "TAILWIND_CSS", "BOOTSTRAP", "MATERIAL_UI",
  "MYSQL", "POSTGRESQL", "MONGODB", "REDIS", "ELASTICSEARCH", "CASSANDRA", "ORACLE", "SQL_SERVER", "SQLITE", "FIREBASE",
  "AWS", "AZURE", "GCP", "DOCKER", "KUBERNETES", "TERRAFORM", "ANSIBLE", "JENKINS", "GITHUB_ACTIONS", "GITLAB_CI",
  "LINUX", "NGINX", "APACHE",
  "GIT", "JIRA", "CONFLUENCE", "SLACK", "FIGMA", "SKETCH", "ADOBE_XD", "PHOTOSHOP", "ILLUSTRATOR",
  "MACHINE_LEARNING", "DEEP_LEARNING", "TENSORFLOW", "PYTORCH", "SCIKIT_LEARN", "NLP", "COMPUTER_VISION",
  "DATA_ANALYSIS", "PANDAS", "NUMPY", "TABLEAU", "POWER_BI", "APACHE_SPARK", "HADOOP",
  "REST_API", "GRAPHQL", "GRPC", "WEBSOCKET", "MICROSERVICES", "KAFKA", "RABBITMQ",
  "JUNIT", "SELENIUM", "CYPRESS", "JEST", "MOCHA", "PYTEST",
  "BLOCKCHAIN", "SOLIDITY", "WEB3",
  "IOS", "ANDROID", "REACT_NATIVE", "FLUTTER",
  "UNITY", "UNREAL_ENGINE",
  "AGILE", "SCRUM", "KANBAN", "CI_CD", "DEVOPS", "TDD", "BDD",
  "COMMUNICATION", "LEADERSHIP", "PROBLEM_SOLVING", "TEAMWORK", "TIME_MANAGEMENT", "CRITICAL_THINKING",
  "PROJECT_MANAGEMENT", "PRODUCT_MANAGEMENT", "BUSINESS_ANALYSIS", "UX_DESIGN", "UI_DESIGN",
  "ENGLISH", "JAPANESE", "CHINESE", "KOREAN", "FRENCH", "GERMAN", "SPANISH",
  "CYBER_SECURITY", "PENETRATION_TESTING", "NETWORK_SECURITY", "CRYPTOGRAPHY",
  "SAP", "SALESFORCE", "SERVICENOW", "SHAREPOINT",
] as const;

/** Convert UPPER_SNAKE_CASE to Title Case for display */
export function enumToDisplay(value: string): string {
  return value
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Status color styles for badges */
export const applicationStatusStyles: Record<string, string> = {
  SUBMITTED: "bg-warning/10 text-warning border-warning/20",
  REVIEWING: "bg-info/10 text-info border-info/20",
  INTERVIEW: "bg-primary/10 text-primary border-primary/20",
  OFFERED: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
};

export const jobStatusStyles: Record<string, string> = {
  PENDING_APPROVAL: "bg-warning/10 text-warning border-warning/20",
  ACTIVE: "bg-success/10 text-success border-success/20",
  CLOSED: "bg-muted text-muted-foreground border-border",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

export const interviewStatusStyles: Record<string, string> = {
  SCHEDULED: "bg-primary/10 text-primary border-primary/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  RESCHEDULED: "bg-warning/10 text-warning border-warning/20",
};
