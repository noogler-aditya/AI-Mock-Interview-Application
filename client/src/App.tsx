import { Route, Switch } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import ProtectedRoute from "./lib/protected-route";
import LandingPage from "./pages/landing-page";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import InterviewPage from "./pages/interview-page";
import AnalysisPage from "./pages/analysis-page";
import ProfilePage from "./pages/profile-page";
import NotFoundPage from "./pages/not-found";

function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={AuthPage} />
        
        <ProtectedRoute path="/home" component={HomePage} />
        <ProtectedRoute path="/interview/:id" component={InterviewPage} />
        <ProtectedRoute path="/analysis/:id" component={AnalysisPage} />
        <ProtectedRoute path="/profile" component={ProfilePage} />
        
        <Route component={NotFoundPage} />
      </Switch>
    </AuthProvider>
  );
}

export default App;
