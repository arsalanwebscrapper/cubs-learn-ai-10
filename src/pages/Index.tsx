import HomePage from "@/components/HomePage";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div>
      <HomePage />
      <div className="fixed bottom-4 right-4">
        <Button asChild variant="outline">
          <a href="/student-login">Student Login</a>
        </Button>
      </div>
    </div>
  );
};

export default Index;
