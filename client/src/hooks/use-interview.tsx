import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { firestoreService } from '@/lib/firebase-service';
import type { FirestoreInterview } from '@shared/firestore-types';

export function useInterview(interviewType: string) {
  const { user } = useAuth();
  const [interviewId, setInterviewId] = useState<string>('');
  const [interview, setInterview] = useState<FirestoreInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create new interview session
  const createInterview = async (duration: number) => {
    try {
      if (!user) throw new Error('User must be authenticated');
      
      const newInterviewId = await firestoreService.createInterview({
        userId: user.uid,
        type: interviewType as FirestoreInterview['type'],
        duration,
        questions: [],
        status: 'in-progress'
      });
      
      setInterviewId(newInterviewId);
      const interview = await firestoreService.getInterview(newInterviewId);
      setInterview(interview);
      
      return newInterviewId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create interview');
      setError(error);
      throw error;
    }
  };

  // Save answer and get feedback
  const submitAnswer = async (questionIndex: number, answer: string) => {
    try {
      if (!interviewId || !interview) throw new Error('No active interview');
      
      // Get feedback from the API
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: interview.questions[questionIndex].question,
          answer
        })
      });
      
      const feedback = await response.json();
      
      // Update questions array
      const updatedQuestions = [...interview.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer,
        feedback
      };
      
      // Update in Firebase
      await firestoreService.updateInterview(interviewId, {
        questions: updatedQuestions
      });
      
      // Update local state
      setInterview(prev => prev ? {
        ...prev,
        questions: updatedQuestions
      } : null);
      
      return feedback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit answer');
      setError(error);
      throw error;
    }
  };

  // End interview and get final feedback
  const endInterview = async () => {
    try {
      if (!interviewId || !interview) throw new Error('No active interview');
      
      // Get overall feedback from the API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: interview.questions.map(q => ({
            question: q.question,
            answer: q.answer || ''
          })),
          interviewType
        })
      });
      
      const feedback = await response.json();
      
      // Update interview in Firebase
      await firestoreService.completeInterview(interviewId, feedback);
      
      // Update local state
      setInterview(prev => prev ? {
        ...prev,
        status: 'completed',
        overallFeedback: feedback
      } : null);
      
      return feedback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end interview');
      setError(error);
      throw error;
    }
  };

  // Load interview data if we have an ID
  useEffect(() => {
    if (interviewId) {
      setLoading(true);
      firestoreService.getInterview(interviewId)
        .then(interview => {
          setInterview(interview);
          setLoading(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error('Failed to load interview'));
          setLoading(false);
        });
    }
  }, [interviewId]);

  return {
    createInterview,
    submitAnswer,
    endInterview,
    interview,
    loading,
    error
  };
}