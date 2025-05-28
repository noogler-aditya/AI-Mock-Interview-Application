import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FirestoreInterview } from '../../shared/firestore-types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface Question {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  expectedDuration: number; // in minutes
  hints?: string[];
  evaluationCriteria?: string[];
}

interface QuestionGenerationContext {
  type: FirestoreInterview['type'];
  skills?: string[];
  experience?: string; // e.g., "junior", "mid-level", "senior"
  industry?: string;
  role?: string;
  duration: number; // interview duration in minutes
  previousQuestions?: string[]; // to avoid duplicates
}

export const questionGeneratorService = {
  async generateQuestions(context: QuestionGenerationContext): Promise<Question[]> {
    // Calculate number of questions based on duration
    const questionCount = Math.max(3, Math.floor(context.duration / 10)); // ~10 min per question
    
    const basePrompt = this.getBasePrompt(context, questionCount);
    const formatInstructions = `
Format the response as a JSON array of question objects, each containing:
{
  "question": "the actual question text",
  "difficulty": "easy|medium|hard",
  "category": "specific category/topic",
  "expectedDuration": number of minutes expected for answer,
  "hints": ["2-3 helpful hints"],
  "evaluationCriteria": ["3-4 specific points to evaluate"]
}`;

    try {
      const result = await model.generateContent(basePrompt + formatInstructions);
      const response = await result.response;
      return JSON.parse(response.text()) as Question[];
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  },

  private getBasePrompt(context: QuestionGenerationContext, questionCount: number): string {
    const experienceLevel = context.experience || 'mid-level';
    const industry = context.industry || 'technology';
    const role = context.role || 'software engineer';

    const prompts = {
      hr: `Generate ${questionCount} challenging HR/behavioral interview questions for a ${experienceLevel} ${role} position in the ${industry} industry. 
Focus on:
- Leadership and team collaboration
- Problem-solving and decision-making
- Cultural fit and values alignment
- Conflict resolution
- Career growth and motivation

Ensure questions:
- Are specific to ${industry} industry challenges
- Test both past experiences and hypothetical scenarios
- Reveal thinking process and self-awareness
- Progress in difficulty throughout the interview`,

      technical: `Generate ${questionCount} technical interview questions for a ${experienceLevel} ${role} focusing on ${
        context.skills?.length ? context.skills.join(', ') : 'core software engineering'
      }.

Include:
- System design and architecture
- Coding and algorithms
- Best practices and patterns
- ${industry}-specific technical challenges
- Modern tools and technologies

Questions should:
- Start with easier concept validation
- Progress to complex problem-solving
- Include real-world scenarios from ${industry}
- Test both theoretical knowledge and practical experience
- Cover current technology trends`,

      custom: `Generate ${questionCount} comprehensive interview questions for a ${experienceLevel} ${role} in ${industry}, combining technical and behavioral aspects.

Focus areas:
- Technical expertise in ${context.skills?.length ? context.skills.join(', ') : 'software engineering'}
- Problem-solving methodology
- Team collaboration and leadership
- Industry-specific challenges
- Innovation and adaptability

Ensure questions:
- Blend technical and soft skills assessment
- Progress in complexity
- Include real-world ${industry} scenarios
- Test both knowledge and approach
- Cover modern practices and methodologies`
    };

    // Add context about previous questions to avoid duplication
    const previousQuestionsContext = context.previousQuestions?.length
      ? `\n\nAvoid these previously asked questions:\n${context.previousQuestions.join('\n')}`
      : '';

    return prompts[context.type] + previousQuestionsContext;
  }
};