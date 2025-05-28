import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useInterview } from "@/hooks/use-interview";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraFeed } from "@/components/interview/camera-feed";
import { Transcript } from "@/components/interview/transcript";
import { Mic, MicOff, Video, VideoOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type InterviewParams = {
  type: string;
};

export default function InterviewPage() {
  const { type } = useParams<InterviewParams>();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Custom hooks with enhanced speech recognition options
  const {
    createInterview,
    submitAnswer,
    endInterview,
    questions,
    loading: interviewLoading,
    error: interviewError
  } = useInterview(type);
  
  const {
    transcript,
    isListening,
    error: speechError,
    startListening,
    stopListening,
    isSupported
  } = useSpeechRecognition({
    silenceTimeout: 3000, // 3 seconds of silence to auto-stop
    noiseThreshold: 0.2, // Higher threshold for better accuracy
    language: 'en-US'
  });

  // State
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60);
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  // Update current answer when speech recognition provides new transcript
  useEffect(() => {
    if (transcript) {
      setCurrentAnswer(prev => {
        // Avoid duplicate text
        const newText = transcript.trim();
        if (!prev.endsWith(newText)) {
          return (prev + ' ' + newText).trim();
        }
        return prev;
      });
    }
  }, [transcript]);

  // Timer effect with cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (interviewStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleEndInterview();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [interviewStarted, timeRemaining]);

  // Handle starting the interview
  const handleStartInterview = async () => {
    try {
      await createInterview(selectedDuration);
      setTimeRemaining(selectedDuration * 60);
      setInterviewStarted(true);
    } catch (error) {
      toast({
        title: "Failed to start interview",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle submitting an answer with retry logic
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    try {
      // Stop speech recognition if it's running
      if (isListening) {
        stopListening(null);
      }

      const feedback = await submitAnswer(currentQuestionIndex, currentAnswer);
      
      // Show feedback toast
      toast({
        title: "Answer submitted",
        description: `Score: ${feedback.score}/5`,
      });
      
      // Move to next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer("");
      }
    } catch (error) {
      toast({
        title: "Failed to submit answer",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle speech recognition toggle with error handling
  const handleToggleSpeechRecognition = () => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try using a modern browser like Chrome.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      stopListening(null);
    } else {
      startListening();
    }
  };

  // Handle ending the interview
  const handleEndInterview = async () => {
    try {
      const feedback = await endInterview();
      
      // Show final feedback toast
      toast({
        title: "Interview completed",
        description: `Overall rating: ${feedback.overallRating}/5`,
      });
      
      // Navigate to results page
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Failed to end interview",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle errors
  useEffect(() => {
    if (interviewError) {
      toast({
        title: "Interview Error",
        description: interviewError.message,
        variant: "destructive"
      });
    }
    
    if (speechError) {
      toast({
        title: "Speech Recognition Error",
        description: speechError.message,
        variant: "destructive"
      });
    }
  }, [interviewError, speechError, toast]);

  if (interviewLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-col">
      {/* Interview Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {type === "hr" ? "HR Interview" : type === "technical" ? "Technical Interview" : "Custom Interview"}
            </h1>
            <p className="text-sm text-gray-500">
              {interviewStarted 
                ? `Question ${currentQuestionIndex + 1} of ${questions.length}` 
                : "Configure your interview settings"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {interviewStarted && (
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
                <span className="ml-1 font-medium text-gray-900">{formatTimeRemaining()}</span>
              </div>
            )}
            {interviewStarted ? (
              <Button variant="outline" onClick={handleEndInterview}>
                End Interview
              </Button>
            ) : (
              <Button onClick={handleStartInterview} disabled={interviewLoading}>
                {interviewLoading ? "Loading Questions..." : "Start Interview"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Interview Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Feed (Left/Top on mobile) */}
        <div className="w-full md:w-1/2 p-4 md:p-6">
          <CameraFeed videoEnabled={videoEnabled} />
          
          {/* Interview Duration Selection (only visible before interview starts) */}
          {!interviewStarted && (
            <Card className="mt-4 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Interview Duration</h3>
              <div className="flex space-x-2">
                <Button 
                  variant={selectedDuration === 15 ? "default" : "outline"}
                  className={selectedDuration === 15 ? "flex-1" : "flex-1 bg-gray-100 text-gray-800"}
                  onClick={() => setSelectedDuration(15)}
                >
                  15 min
                </Button>
                <Button 
                  variant={selectedDuration === 30 ? "default" : "outline"}
                  className={selectedDuration === 30 ? "flex-1" : "flex-1 bg-gray-100 text-gray-800"}
                  onClick={() => setSelectedDuration(30)}
                >
                  30 min
                </Button>
                <Button 
                  variant={selectedDuration === 60 ? "default" : "outline"}
                  className={selectedDuration === 60 ? "flex-1" : "flex-1 bg-gray-100 text-gray-800"}
                  onClick={() => setSelectedDuration(60)}
                >
                  1 hour
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Chat and Transcript (Right/Bottom on mobile) */}
        <div className="w-full md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l border-gray-200">
          {/* Current Question */}
          <div className="bg-white p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Current Question</h2>
            <p className="text-gray-700">
              {interviewLoading 
                ? "Loading questions..." 
                : questions.length > 0 && interviewStarted
                  ? questions[currentQuestionIndex].question
                  : "Questions will appear here when you start the interview"}
            </p>
          </div>

          {/* Transcript */}
          <Transcript 
            messages={questions.map(q => ({
              role: "ai",
              text: q.question,
              feedback: q.feedback
            }))}
            currentAnswer={currentAnswer}
            onUpdateCurrentAnswer={setCurrentAnswer}
          />

          {/* Action Buttons */}
          <div className="bg-white p-4 md:p-6 border-t border-gray-200">
            {interviewStarted ? (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleSubmitAnswer} 
                  className="justify-center" 
                  disabled={!currentAnswer.trim()}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Answer
                </Button>
                <Button
                  onClick={handleToggleSpeechRecognition}
                  className="justify-center"
                  variant={isListening ? "destructive" : "secondary"}
                  disabled={!isSupported}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-5 w-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setAudioEnabled(!audioEnabled)} 
                  variant="outline" 
                  className="justify-center"
                >
                  {audioEnabled ? <Mic className="h-5 w-5 mr-2" /> : <MicOff className="h-5 w-5 mr-2" />}
                  {audioEnabled ? "Mute Audio" : "Enable Audio"}
                </Button>
                <Button 
                  onClick={() => setVideoEnabled(!videoEnabled)} 
                  variant="outline" 
                  className="justify-center"
                >
                  {videoEnabled ? <Video className="h-5 w-5 mr-2" /> : <VideoOff className="h-5 w-5 mr-2" />}
                  {videoEnabled ? "Disable Video" : "Enable Video"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
