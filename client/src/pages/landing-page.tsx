import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Code, BarChart, User } from "lucide-react";

export default function LandingPage() {
  const [location, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">AI Mock Interview</h1>
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="font-medium" 
                onClick={() => navigate("/auth")}
              >
                Log in
              </Button>
              <Button 
                className="font-medium"
                onClick={() => navigate("/auth?tab=register")}
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full mr-2">NEW</span>
                <span className="text-gray-600 text-sm">AI-Powered Interview Practice</span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl tracking-tight mb-4">
                Master Interviews with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Assistance</span>
              </h1>
              <p className="mt-3 text-lg text-gray-600 sm:mt-5 sm:text-xl leading-relaxed">
                Prepare for your job interviews with our AI-powered mock interview platform. Practice HR and technical interviews, receive real-time feedback, and improve your skills.
              </p>
              
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
                  onClick={() => navigate("/auth?tab=register")}
                >
                  Get Started for Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Learn More
                </Button>
              </div>
              
              <div className="mt-8 flex items-center text-gray-500">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-xs">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white flex items-center justify-center text-white text-xs">
                    TK
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-white text-xs">
                    MR
                  </div>
                </div>
                <span className="text-sm">Trusted by 5,000+ students</span>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex items-center">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  LIVE DEMO
                </div>
                <div className="px-2 py-2 sm:p-3">
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <div className="bg-blue-600 flex items-center px-4 py-2">
                      <div className="flex space-x-1 mr-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-white text-sm font-medium">AI Mock Interview</div>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Interview interface preview" 
                      className="w-full object-cover h-64 sm:h-80"
                    />
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <div className="text-sm text-gray-700">HR Interview Session</div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Try it now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to ace your interviews
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform offers comprehensive tools to help you prepare for any interview scenario.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 - HR Interviews */}
              <Card className="border-t-4 border-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">HR Interviews</h3>
                  <p className="mt-2 mb-4 text-base text-gray-500 flex-grow">
                    Practice answering behavioral questions, personal experiences, and skills assessment. Perfect for preparing for your first job interview.
                  </p>
                  <Button 
                    className="w-full mt-auto bg-blue-600 hover:bg-blue-700" 
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    Try HR Interview
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 2 - Technical Interviews */}
              <Card className="border-t-4 border-violet-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-violet-100 text-violet-600 mb-4">
                    <Code className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Technical Interviews</h3>
                  <p className="mt-2 mb-4 text-base text-gray-500 flex-grow">
                    Test your domain knowledge with technical questions specific to your field. Includes coding, system design, and domain-specific questions.
                  </p>
                  <Button 
                    className="w-full mt-auto bg-violet-600 hover:bg-violet-700" 
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    Try Technical Interview
                  </Button>
                </CardContent>
              </Card>

              {/* Feature 3 - Performance Analysis */}
              <Card className="border-t-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-4">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Performance Analysis</h3>
                  <p className="mt-2 mb-4 text-base text-gray-500 flex-grow">
                    Get detailed feedback and analytics on your interview performance. Identify your strengths and areas for improvement.
                  </p>
                  <Button 
                    className="w-full mt-auto bg-green-600 hover:bg-green-700" 
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    View Analytics Demo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How it works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple steps to start practicing
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 text-white mb-6">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create an account</h3>
                  <p className="text-base text-gray-500 mb-4">
                    Sign up for a free account to get started with AI-powered mock interviews.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-auto" 
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    Sign up now
                  </Button>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 text-white mb-6">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Choose interview type</h3>
                  <p className="text-base text-gray-500 mb-4">
                    Select from HR, technical, or custom interviews based on your career goals and needs.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 border-blue-600"
                    >
                      HR
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-violet-600 border-violet-600"
                    >
                      Technical
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-600"
                    >
                      Custom
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 text-white mb-6">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Practice and improve</h3>
                  <p className="text-base text-gray-500 mb-4">
                    Complete interviews, get AI-generated feedback, and track your progress over time.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-auto"
                    onClick={() => navigate("/auth?tab=register")}
                  >
                    Start practicing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Join thousands of students improving their interview skills.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button 
                size="lg"
                variant="secondary"
                className="inline-flex items-center text-blue-600 bg-white hover:bg-blue-50"
                onClick={() => navigate("/auth?tab=register")}
              >
                Sign up now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              © 2023 AI Mock Interview. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}