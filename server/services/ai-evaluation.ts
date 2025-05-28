import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export type AnswerFeedback = {
  strengths: string[];
  weaknesses: string[];
  overallFeedback: string;
  score: number;
  exampleAnswer?: string;
  improvementTips: string[];
  keywordAnalysis: {
    usedKeywords: string[];
    missedKeywords: string[];
  };
  delivery: {
    clarity: number;
    conciseness: number;
    relevance: number;
  };
};

export type InterviewFeedback = {
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  overallRating: number;
  industrySpecificFeedback: {
    relevantSkills: string[];
    skillGaps: string[];
    recommendations: string[];
  };
  nextSteps: {
    immediateActions: string[];
    longTermGoals: string[];
    resources: Array<{ title: string; url?: string; description: string }>;
  };
  overallSummary: string;
};

export const aiEvaluationService = {
  async evaluateAnswer(
    question: string, 
    answer: string, 
    context: {
      interviewType: string;
      roleLevel?: string;
      industry?: string;
    }
  ): Promise<AnswerFeedback> {
    const prompt = `As an expert ${context.interviewType} interviewer for ${context.industry || 'tech'} industry${context.roleLevel ? ` (${context.roleLevel} level)` : ''}, evaluate this interview answer.

Question: "${question}"
Answer: "${answer}"

Provide detailed feedback in the following JSON format:
{
  "strengths": [3-4 specific strengths with examples from the answer],
  "weaknesses": [3-4 specific areas for improvement with examples],
  "overallFeedback": "detailed constructive feedback focusing on impact and effectiveness",
  "score": [number between 1-5],
  "exampleAnswer": "a model answer that demonstrates best practices",
  "improvementTips": [4-5 actionable tips for improvement],
  "keywordAnalysis": {
    "usedKeywords": [important relevant terms/concepts mentioned],
    "missedKeywords": [important terms/concepts that should have been mentioned]
  },
  "delivery": {
    "clarity": [1-5 score],
    "conciseness": [1-5 score],
    "relevance": [1-5 score]
  }
}

Ensure feedback is specific, actionable, and tailored to the ${context.interviewType} context.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text()) as AnswerFeedback;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  },

  async generateInterviewFeedback(
    questions: Array<{ 
      question: string; 
      answer: string; 
      feedback?: AnswerFeedback;
    }>,
    context: {
      interviewType: string;
      roleLevel?: string;
      industry?: string;
      duration: number;
    }
  ): Promise<InterviewFeedback> {
    // Calculate average scores from individual answers
    const avgDeliveryScores = questions.reduce((acc, q) => {
      if (q.feedback?.delivery) {
        acc.clarity += q.feedback.delivery.clarity;
        acc.conciseness += q.feedback.delivery.conciseness;
        acc.relevance += q.feedback.delivery.relevance;
      }
      return acc;
    }, { clarity: 0, conciseness: 0, relevance: 0 });
    
    const len = questions.length;
    const normalizedScores = {
      clarity: (avgDeliveryScores.clarity / len).toFixed(1),
      conciseness: (avgDeliveryScores.conciseness / len).toFixed(1),
      relevance: (avgDeliveryScores.relevance / len).toFixed(1)
    };

    const questionsText = questions
      .map((q, i) => `
Q${i + 1}: "${q.question}"
A${i + 1}: "${q.answer}"
Individual Feedback: ${JSON.stringify(q.feedback, null, 2)}`)
      .join('\n\n');

    const prompt = `As an expert ${context.interviewType} interviewer for ${context.industry || 'tech'} industry${context.roleLevel ? ` (${context.roleLevel} level)` : ''}, provide comprehensive feedback for this ${context.duration}-minute interview:

${questionsText}

Average delivery scores:
- Clarity: ${normalizedScores.clarity}
- Conciseness: ${normalizedScores.conciseness}
- Relevance: ${normalizedScores.relevance}

Provide detailed feedback in the following JSON format:
{
  "communicationScore": [1-5 score with consideration of clarity and delivery],
  "technicalScore": [1-5 score based on technical accuracy and depth],
  "problemSolvingScore": [1-5 score based on approach and reasoning],
  "strengths": [4-5 main strengths demonstrated across the interview],
  "weaknesses": [4-5 specific areas for improvement],
  "overallRating": [1-5 score],
  "industrySpecificFeedback": {
    "relevantSkills": [skills demonstrated that are valuable in ${context.industry || 'tech'}],
    "skillGaps": [important skills for ${context.industry || 'tech'} that need development],
    "recommendations": [industry-specific recommendations for improvement]
  },
  "nextSteps": {
    "immediateActions": [3-4 specific actions to take within next week],
    "longTermGoals": [3-4 development goals for next 3-6 months],
    "resources": [
      {
        "title": "resource name",
        "url": "optional URL",
        "description": "how this resource helps"
      }
    ]
  },
  "overallSummary": "comprehensive summary of interview performance with specific examples and action items"
}

Focus on actionable feedback that will help the candidate improve their interview performance and advance their career in ${context.industry || 'tech'}.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text()) as InterviewFeedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw new Error('Failed to generate interview feedback');
    }
  }
};