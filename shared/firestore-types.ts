export type UserTier = 'free' | 'pro' | 'enterprise';

export interface FirestoreUser {
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  questions: Question[];
  answers: Answer[];
  transcript: string;
  feedback?: InterviewFeedback;
}

export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  timestamp: string;
}

export interface InterviewFeedback {
  overallScore: number;
  clarity: number;
  relevance: number;
  technicalAccuracy?: number;
  comments: string[];
  suggestions: string[];
}