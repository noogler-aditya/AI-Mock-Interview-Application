import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export function MobileNav() {
  const { user } = useAuth();
  const [location] = useLocation();

  const routes = [
    { href: "/home", label: "Home" },
    { href: "/interviews", label: "Interviews" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={location === route.href ? "default" : "ghost"}
              className="justify-start"
              asChild
            >
              <a href={route.href}>{route.label}</a>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}