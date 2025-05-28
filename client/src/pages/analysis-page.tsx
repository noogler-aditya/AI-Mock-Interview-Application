import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AnalysisPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // State for selected options
  const [skillsCategory, setSkillsCategory] = useState<string>("software_development");
  const [projectsCategory, setProjectsCategory] = useState<string>("web_applications");
  const [includeProjects, setIncludeProjects] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<string>("");

  // Fetch user's skills
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ["/api/skills"],
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (skill: string) => {
      const res = await apiRequest("POST", "/api/skills", { skill });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      setNewSkill("");
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
    },
  });

  // Handle skill addition
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim()) {
      addSkillMutation.mutate(newSkill.trim());
    }
  };

  // Start custom interview
  const startCustomInterview = () => {
    navigate("/interview/custom");
  };

  // Skills categories
  const skillsCategories = [
    { value: "software_development", label: "Software Development" },
    { value: "data_science", label: "Data Science" },
    { value: "web_development", label: "Web Development" },
    { value: "devops", label: "DevOps" },
    { value: "ui_ux_design", label: "UI/UX Design" },
  ];

  // Project categories
  const projectCategories = [
    { value: "web_applications", label: "Web Applications" },
    { value: "mobile_apps", label: "Mobile Apps" },
    { value: "data_analysis", label: "Data Analysis" },
    { value: "machine_learning", label: "Machine Learning" },
    { value: "other", label: "Other" },
  ];

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
                <h2 className="text-2xl font-bold text-gray-900">Interview Analysis</h2>
                <p className="mt-1 text-sm text-gray-500">Customize your interview experience</p>
              </div>
            </div>

            {/* Analysis Configuration */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills Section */}
                  <div>
                    <Label htmlFor="skills-category" className="block text-sm font-medium text-gray-700 mb-2">Skills Category</Label>
                    <Select value={skillsCategory} onValueChange={setSkillsCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillsCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-4">
                      <form onSubmit={handleAddSkill} className="flex mb-2">
                        <Input
                          placeholder="Add a skill (e.g. JavaScript)"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="flex-1 mr-2"
                        />
                        <Button 
                          type="submit" 
                          size="sm"
                          disabled={addSkillMutation.isPending}
                        >
                          Add
                        </Button>
                      </form>
                      
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700 block mb-2">Selected Skills</span>
                        {isLoadingSkills ? (
                          <div className="text-sm text-gray-500">Loading skills...</div>
                        ) : skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill: any) => (
                              <span key={skill.id} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                                {skill.skill}
                                <button
                                  type="button"
                                  className="flex-shrink-0 ml-1 text-blue-500 focus:outline-none"
                                  onClick={() => removeSkillMutation.mutate(skill.id)}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No skills added yet</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div>
                    <Label htmlFor="projects-category" className="block text-sm font-medium text-gray-700 mb-2">Projects Category</Label>
                    <Select value={projectsCategory} onValueChange={setProjectsCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-700 block mb-2">Project Experience</span>
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <Checkbox
                            id="include-projects"
                            checked={includeProjects}
                            onCheckedChange={(checked) => setIncludeProjects(checked as boolean)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <Label htmlFor="include-projects" className="font-medium text-gray-700">Include questions about my projects</Label>
                          <p className="text-gray-500">We'll generate questions based on your uploaded resume</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={startCustomInterview} 
                    className="w-full md:w-auto"
                  >
                    Start Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav activePage="analysis" />
      </div>
    </div>
  );
}
