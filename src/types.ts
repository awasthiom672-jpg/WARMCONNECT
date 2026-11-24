export type Department = 'CSE' | 'ECE' | 'CSAM' | 'CB' | 'HCD';

export interface Milestone {
  year: string;
  title: string;
  organization: string;
}

export interface Alumnus {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company: string;
  department: Department;
  degree: string;
  batchYear: number;
  location: string;
  skills: string[];
  mentorshipTopics: string[];
  bio: string;
  experienceYears: number;
  availableForMentorship: boolean;
  pastMilestones: Milestone[];
  adviceSnippet: string;
  matchScore?: number;
  matchReasons?: string[];
  featuredInHero?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'unverified';
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface MentorshipRequest {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniRole: string;
  alumniCompany: string;
  alumniAvatar: string;
  topic: string;
  message: string;
  preferredCadence: string;
  status: RequestStatus;
  createdAt: string;
  studentName?: string;
  studentDepartment?: string;
}

export type OpportunityType = 'Internship' | 'Full-Time' | 'Research' | 'Mentorship Cohort';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: OpportunityType;
  department: string;
  location: string;
  compensation: string;
  deadline: string;
  postedByAlumniName: string;
  postedByAlumniBatch: string;
  postedByAlumniId?: string;
  skills: string[];
  description: string;
  applicationUrl?: string;
}

export interface CareerGoalFilter {
  goal: string;
  targetCompany: string;
  department: string;
  selectedSkills: string[];
  mentorExperience: string;
  mentorshipTopic: string;
}

export type LegalDocType = 'privacy' | 'terms' | null;
