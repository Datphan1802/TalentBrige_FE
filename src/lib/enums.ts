// Backend enum values and display helpers

export const EXPERIENCE_LEVELS = ["INTERN", "FRESHER", "JUNIOR", "MID", "SENIOR", "LEAD"] as const;

export const APPLICATION_STATUSES = ["SUBMITTED", "REVIEWING", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN"] as const;

export const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"] as const;

export const JOB_STATUSES = ["PENDING_APPROVAL", "ACTIVE", "CLOSED", "REJECTED"] as const;

export const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"] as const;

export const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;

export const SKILL_NAMES = [
  "JAVA", "PYTHON", "JAVASCRIPT", "TYPESCRIPT", "C", "C_PLUS_PLUS", "CSHARP", "GO", "RUST", "KOTLIN",
  "SWIFT", "PHP", "RUBY", "SCALA", "DART", "R", "MATLAB", "PERL", "HASKELL", "LUA",
  "REACT", "ANGULAR", "VUE", "SVELTE", "NEXTJS", "NUXTJS", "GATSBY", "EMBER",
  "NODEJS", "EXPRESS", "SPRING", "SPRING_BOOT", "DJANGO", "FLASK", "FASTAPI", "LARAVEL", "RAILS",
  "DOTNET", "ASPNET", "NESTJS",
  "HTML", "CSS", "SASS", "TAILWINDCSS", "BOOTSTRAP", "MATERIALUI",
  "MYSQL", "POSTGRESQL", "MONGODB", "REDIS", "ELASTICSEARCH", "CASSANDRA", "ORACLE", "SQLSERVER", "SQLITE", "FIREBASE",
  "AWS", "AZURE", "GCP", "DOCKER", "KUBERNETES", "TERRAFORM", "ANSIBLE", "JENKINS", "GITHUBACTIONS", "GITLABCI",
  "LINUX", "NGINX", "APACHE",
  "GIT", "JIRA", "CONFLUENCE", "SLACK", "FIGMA", "SKETCH", "ADOBEXD", "PHOTOSHOP", "ILLUSTRATOR",
  "MACHINELEARNING", "DEEPLEARNING", "TENSORFLOW", "PYTORCH", "SCIKITLEARN", "NLP", "COMPUTERVISION",
  "DATAANALYSIS", "PANDAS", "NUMPY", "TABLEAU", "POWERBI", "APACHESPARK", "HADOOP",
  "RESTAPI", "GRAPHQL", "GRPC", "WEBSOCKET", "MICROSERVICES", "KAFKA", "RABBITMQ",
  "JUNIT", "SELENIUM", "CYPRESS", "JEST", "MOCHA", "PYTEST",
  "BLOCKCHAIN", "SOLIDITY", "WEB3",
  "IOS", "ANDROID", "REACTNATIVE", "FLUTTER",
  "UNITY", "UNREALENGINE",
  "AGILE", "SCRUM", "KANBAN", "CICD", "DEVOPS", "TDD", "BDD",
  "COMMUNICATION", "LEADERSHIP", "PROBLEMSOLVING", "TEAMWORK", "TIMEMANAGEMENT", "CRITICALTHINKING",
  "PROJECTMANAGEMENT", "PRODUCTMANAGEMENT", "BUSINESSANALYSIS", "UXDESIGN", "UIDESIGN",
  "ENGLISH", "JAPANESE", "CHINESE", "KOREAN", "FRENCH", "GERMAN", "SPANISH",
  "CYBERSECURITY", "PENETRATIONTESTING", "NETWORKSECURITY", "CRYPTOGRAPHY",
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
