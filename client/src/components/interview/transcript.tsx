import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Mic, AlertCircle, Info, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "ai" | "user";
  text: string;
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    overallFeedback: string;
    score: number;
  };
};

interface TranscriptProps {
  messages: Message[];
  currentAnswer: string;
  onUpdateCurrentAnswer: (answer: string) => void;
  isListening?: boolean;
}

const MAX_WORD_COUNT = 300; // Typical interview answer length

export function Transcript({ 
  messages, 
  currentAnswer, 
  onUpdateCurrentAnswer,
  isListening = false
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "error" | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Calculate word count
  useEffect(() => {
    const words = currentAnswer.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [currentAnswer]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentAnswer]);

  // Auto-save functionality
  useEffect(() => {
    if (currentAnswer) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Show saving status
      setAutoSaveStatus("saving");

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem('interview_draft', currentAnswer);
          setAutoSaveStatus("saved");
        } catch (error) {
          setAutoSaveStatus("error");
          console.error('Failed to save draft:', error);
        }
      }, 1000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [currentAnswer]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('interview_draft');
    if (savedDraft && !currentAnswer) {
      onUpdateCurrentAnswer(savedDraft);
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to clear current answer
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        onUpdateCurrentAnswer('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onUpdateCurrentAnswer]);

  // Render feedback scores
  const renderScoreIndicator = (score: number) => {
    const color = score >= 4 ? "bg-green-500" : score >= 3 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center space-x-2">
        <Progress value={score * 20} className={color} />
        <span className="text-sm font-medium">{score}/5</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-6 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transcript</h2>
        
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-2"
              >
                {/* Question */}
                <Card className={`p-4 ${message.role === "ai" ? "bg-blue-50" : "bg-white"}`}>
                  <p className="text-sm font-medium text-gray-900">
                    {message.role === "ai" ? "Interviewer" : "You"}
                  </p>
                  <ReactMarkdown className="mt-1 prose prose-sm max-w-none text-gray-700">
                    {message.text}
                  </ReactMarkdown>
                </Card>
                
                {/* Feedback (if available) */}
                {message.feedback && (
                  <Card className="p-4 bg-gray-50 border-l-4 border-blue-500">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Score</p>
                        {renderScoreIndicator(message.feedback.score)}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Strengths
                        </p>
                        <ul className="mt-2 space-y-1">
                          {message.feedback.strengths.map((strength, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2" />
                              {strength}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                          Areas for Improvement
                        </p>
                        <ul className="mt-2 space-y-1">
                          {message.feedback.weaknesses.map((weakness, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mt-1.5 mr-2" />
                              {weakness}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <Info className="h-4 w-4 text-blue-500 mr-2" />
                          Overall Feedback
                        </p>
                        <ReactMarkdown className="mt-2 prose prose-sm max-w-none text-gray-700">
                          {message.feedback.overallFeedback}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current answer being typed/recorded */}
          {currentAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-900">Current Response</p>
                <ReactMarkdown className="mt-1 prose prose-sm max-w-none text-gray-700">
                  {currentAnswer}
                </ReactMarkdown>
              </Card>
            </motion.div>
          )}

          {/* Speech recognition in progress indicator */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200 flex items-center"
            >
              <Mic className="h-5 w-5 text-blue-500 mr-3 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-gray-700">Recording in progress...</p>
                <p className="text-xs text-gray-500 mt-1">Speak clearly into your microphone</p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Answer input area */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {autoSaveStatus === "saving" && <span>Saving draft...</span>}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Draft saved
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="flex items-center text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Failed to save draft
              </span>
            )}
          </div>
          <div>
            <span className={wordCount > MAX_WORD_COUNT ? "text-red-500" : ""}>
              {wordCount}/{MAX_WORD_COUNT} words
            </span>
          </div>
        </div>
        
        <Textarea
          value={currentAnswer}
          onChange={(e) => onUpdateCurrentAnswer(e.target.value)}
          placeholder="Type your answer here... You can use markdown formatting"
          className="min-h-[100px] font-mono"
        />
        
        <p className="text-xs text-gray-500">
          Tip: Use Ctrl/Cmd + Enter to clear your response
        </p>
      </div>
    </div>
  );
}
