import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  // Fetch user's interviews
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery({
    queryKey: ["/api/interviews"],
  });

  // Calculate stats
  const interviewsArray = Array.isArray(interviews) ? interviews : [];
  const hrInterviews = interviewsArray.filter((i: any) => i.type === "hr").length;
  const technicalInterviews = interviewsArray.filter((i: any) => i.type === "technical").length;
  const customInterviews = interviewsArray.filter((i: any) => i.type === "custom").length;
  const totalInterviews = interviewsArray.length;

  // Calculate performance data based on completed interviews
  const calculatePerformanceData = () => {
    if (totalInterviews === 0) {
      return {
        communicationScore: 0,
        technicalScore: 0,
        problemSolvingScore: 0,
        improvementAreas: []
      };
    }
    
    // Base the scores on the number and types of interviews completed
    const communicationScore = Math.min(95, 65 + (hrInterviews * 5));
    const technicalScore = Math.min(95, 60 + (technicalInterviews * 8));
    const problemSolvingScore = Math.min(95, 55 + (totalInterviews * 3));
    
    // Generate dynamic improvement areas based on the scores
    const improvementAreas = [];
    
    if (communicationScore < 80) {
      improvementAreas.push("Work on providing more concise answers to behavioral questions");
    }
    
    if (technicalScore < 80) {
      improvementAreas.push("Enhance knowledge of data structures for technical interviews");
    }
    
    if (problemSolvingScore < 75) {
      improvementAreas.push("Practice breaking down complex problems into smaller steps");
    }
    
    // Always provide at least one suggestion
    if (improvementAreas.length === 0) {
      improvementAreas.push("Continue practicing mock interviews to maintain your skills");
    }
    
    return {
      communicationScore,
      technicalScore,
      problemSolvingScore,
      improvementAreas
    };
  };
  
  const performanceData = calculatePerformanceData();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-0 pt-16 pb-16 md:pb-6">
          <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profile Dashboard</h2>
                <p className="mt-1 text-sm text-gray-500">View your progress and performance</p>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interview Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Statistics</h3>
                  
                  {isLoadingInterviews ? (
                    <div className="py-4 text-center text-gray-500">Loading statistics...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Total Interviews</span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {totalInterviews}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600">HR Interviews</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {hrInterviews}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: totalInterviews ? `${(hrInterviews / totalInterviews) * 100}%` : "0%" }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-violet-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-violet-600">Technical Interviews</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                              {technicalInterviews}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-violet-600 h-2.5 rounded-full" 
                              style={{ width: totalInterviews ? `${(technicalInterviews / totalInterviews) * 100}%` : "0%" }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-600">Custom Interviews</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {customInterviews}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: totalInterviews ? `${(customInterviews / totalInterviews) * 100}%` : "0%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
                  
                  {totalInterviews === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      Complete an interview to see your performance summary.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Communication Skills</span>
                          <span className="text-sm text-gray-500">{performanceData.communicationScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${performanceData.communicationScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Technical Knowledge</span>
                          <span className="text-sm text-gray-500">{performanceData.technicalScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full" 
                            style={{ width: `${performanceData.technicalScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Problem Solving</span>
                          <span className="text-sm text-gray-500">{performanceData.problemSolvingScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-full" 
                            style={{ width: `${performanceData.problemSolvingScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Improvement Areas */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
                
                {totalInterviews === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    Complete an interview to receive personalized improvement suggestions.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {performanceData.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{area}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav activePage="profile" />
      </div>
    </div>
  );
}
