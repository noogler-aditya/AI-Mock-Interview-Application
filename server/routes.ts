import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { aiEvaluationService } from './services/ai-evaluation';
import { questionGeneratorService } from './services/question-generator';
import { apiLimiter, aiLimiter } from './middleware/rate-limiter';
import type { FirestoreInterview } from '../shared/firestore-types';

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Generate interview questions (AI endpoint)
  app.post('/api/questions/generate', aiLimiter, async (req, res, next) => {
    try {
      const { interviewType, skills = [] } = req.body;
      
      if (!interviewType) {
        return res.status(400).json({ error: 'Interview type is required' });
      }

      const questions = await questionGeneratorService.generateQuestions(
        interviewType as FirestoreInterview['type'],
        skills
      );

      res.json({ questions });
    } catch (error) {
      next(error);
    }
  });

  // Evaluate a single answer (AI endpoint)
  app.post('/api/evaluate', aiLimiter, async (req, res, next) => {
    try {
      const { question, answer } = req.body;
      
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      const feedback = await aiEvaluationService.evaluateAnswer(question, answer);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  });

  // Generate final interview feedback (AI endpoint)
  app.post('/api/feedback', aiLimiter, async (req, res, next) => {
    try {
      const { questions, interviewType }: { 
        questions: Array<{ question: string; answer: string }>;
        interviewType: FirestoreInterview['type'];
      } = req.body;

      if (!questions?.length || !interviewType) {
        return res.status(400).json({ error: 'Questions and interview type are required' });
      }

      const feedback = await aiEvaluationService.generateInterviewFeedback(questions, interviewType);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
