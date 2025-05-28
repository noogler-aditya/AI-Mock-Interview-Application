import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  LogOut 
} from "lucide-react";

export const Sidebar = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">CSED Panel</h1>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        {/* Profile Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user ? getInitials(user.fullName) : "U"}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <Link href="/">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              location === "/profile" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}>
              <User className="h-5 w-5 mr-2" />
              Profile
            </a>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 w-full justify-start"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
