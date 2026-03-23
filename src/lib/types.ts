export type Role = "ADMIN" | "EMPLOYER" | "CANDIDATE";

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
  companyName?: string;
  fullName?: string;
}

export interface JobPostRequest {
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  jobType: string;
  experienceLevel: string;
  categoryId: number;
  expiredAt: string;
  skills: JobSkillRequest[];
}

export interface JobSkillRequest {
  skillName: string;
  level: string;
}

export interface JobPostResponse {
  id: number;
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  jobType: string;
  experienceLevel: string;
  status: string;
  postedAt: string;
  expiredAt: string;
  rejectionReason: string;
  employerId: number;
  companyName: string;
  logoUrl: string;
  categoryId: number;
  categoryName: string;
  skills: SkillResponse[];
  applicationCount: number;
  savedByCurrentUser: boolean;
}

export interface SkillResponse {
  skillName: string;
  displayName: string;
  level: string;
}

export interface ApplicationRequest {
  jobPostId: number;
  cvUrlAtTime: string;
  coverLetter: string;
}

export interface ApplicationResponse {
  id: number;
  status: string;
  cvUrlAtTime: string;
  coverLetter: string;
  appliedAt: string;
  jobPostId: number;
  jobTitle: string;
  companyName: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  histories: ApplicationHistoryResponse[];
}

export interface ApplicationHistoryResponse {
  id: number;
  fromStatus: string;
  toStatus: string;
  note: string;
  changedByUsername: string;
  changedAt: string;
}

export interface UpdateApplicationStatusRequest {
  status: string;
  note: string;
}

export interface CandidateProfileResponse {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  summary: string;
  cvUrl: string;
  avatarUrl: string;
  email: string;
  educations: EducationResponse[];
  workExperiences: WorkExperienceResponse[];
  skills: SkillResponse[];
}

export interface EducationResponse {
  id: number;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationRequest {
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface WorkExperienceResponse {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorking: boolean;
}

export interface WorkExperienceRequest {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorking: boolean;
}

export interface CandidateSkillRequest {
  skillName: string;
  level: string;
}

export interface EmployerProfileResponse {
  id: number;
  companyName: string;
  website: string;
  description: string;
  logoUrl: string;
  industry: string;
  companySize: string;
  address: string;
  email: string;
  name: string;
  followerCount: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface InterviewRequest {
  applicationId: number;
  interviewAt: string;
  location: string;
  meetingLink: string;
  note: string;
}

export interface InterviewResponse {
  id: number;
  applicationId: number;
  jobTitle: string;
  candidateName: string;
  interviewAt: string;
  location: string;
  meetingLink: string;
  note: string;
  status: string;
  createdAt: string;
}

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  type: string;
  referenceUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  avatarUrl: string;
  createdAt: string;
}

export interface PageResponse<T> {
  totalPages: number;
  totalElements: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminJobActionRequest {
  rejectionReason: string;
}
