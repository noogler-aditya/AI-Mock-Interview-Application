import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { 
  Users, 
  Code, 
  Upload, 
  CircleDot 
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Fetch user's interviews
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery({
    queryKey: ["/api/interviews"],
  });

  const startInterview = (type: string) => {
    navigate(`/interview/${type}`);
  };

  // Handle technical interview start with option for resume upload
  const startTechnicalInterview = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        // Here we would typically handle the file upload to a server
        // For now, just show a success message and navigate
        alert(`Resume "${file.name}" uploaded successfully! Extracting skills and generating technical questions...`);
        setTimeout(() => {
          navigate('/interview/technical');
        }, 1000);
      }
    };
    
    // Create a confirm dialog
    if (confirm('Would you like to upload your resume for more personalized technical questions?')) {
      fileInput.click();
    } else {
      // User chose not to upload a resume, navigate directly
      navigate('/interview/technical');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-0 pt-16 pb-16 md:pb-6">
          {/* Home Section */}
          <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="mt-1 text-sm text-gray-500">Start practicing for your interviews</p>
              </div>
            </div>

            {/* Interview Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* HR Interview Card */}
              <Card className="overflow-hidden">
                <div className="bg-blue-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">HR Interview</h3>
                  <p className="text-sm text-gray-500 mb-4">Practice answering common HR and behavioral questions</p>
                  <button 
                    onClick={() => startInterview('hr')} 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Start HR Interview
                  </button>
                </CardContent>
              </Card>

              {/* Technical Interview Card */}
              <Card className="overflow-hidden">
                <div className="bg-violet-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-100 text-violet-600 mb-4">
                    <Code className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Interview</h3>
                  <p className="text-sm text-gray-500 mb-4">Test your technical skills with domain-specific questions</p>
                  <button 
                    onClick={startTechnicalInterview} 
                    className="w-full bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  >
                    Start Technical Interview
                  </button>
                </CardContent>
              </Card>

              {/* Custom Interview Card */}
              <Card className="overflow-hidden">
                <div className="bg-green-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-4">
                    <CircleDot className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Interview</h3>
                  <p className="text-sm text-gray-500 mb-4">Create a personalized interview with your own focus areas</p>
                  <button 
                    onClick={() => startInterview('custom')} 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Start Custom Interview
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                {isLoadingInterviews ? (
                  <div className="py-4 text-center text-gray-500">Loading recent activities...</div>
                ) : interviews && Array.isArray(interviews) && interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.slice(0, 3).map((interview: any) => (
                      <div key={interview.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                            <CircleDot className="h-5 w-5" />
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Completed {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(interview.createdAt).toLocaleDateString()} · {interview.duration} minutes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    No recent activities. Start an interview to see your progress!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav activePage="home" />
      </div>
    </div>
  );
}
