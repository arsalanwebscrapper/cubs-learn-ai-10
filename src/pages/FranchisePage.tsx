import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, Users, BookOpen, Trophy, Star } from "lucide-react";

interface FranchisePageData {
  id: string;
  cityName: string;
  centerName: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  features: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  slug: string;
}

const FranchisePage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState<FranchisePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get franchise pages from localStorage (or later from Supabase)
    const storedPages = localStorage.getItem('franchisePages');
    if (storedPages) {
      const pages: FranchisePageData[] = JSON.parse(storedPages);
      const foundPage = pages.find(page => page.slug === slug);
      setPageData(foundPage || null);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (pageData) {
      // Update SEO meta tags
      document.title = pageData.seoTitle;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', pageData.seoDescription);

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', pageData.keywords.join(', '));
    }
  }, [pageData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The franchise page you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full animate-bounce-slow"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-primary/20 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <MapPin className="w-4 h-4 mr-2" />
              {pageData.cityName}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {pageData.centerName}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {pageData.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
              <Button variant="outline" size="lg">
                <Mail className="w-5 h-5 mr-2" />
                Get Info
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">{pageData.address}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-muted-foreground">{pageData.phone}</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground">{pageData.email}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose {pageData.centerName}?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageData.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {index === 0 && <BookOpen className="w-8 h-8 text-primary" />}
                    {index === 1 && <Users className="w-8 h-8 text-primary" />}
                    {index === 2 && <Trophy className="w-8 h-8 text-primary" />}
                    {index === 3 && <Star className="w-8 h-8 text-primary" />}
                    {index === 4 && <Clock className="w-8 h-8 text-primary" />}
                    {index >= 5 && <BookOpen className="w-8 h-8 text-primary" />}
                  </div>
                  <p className="text-foreground font-medium">{feature}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Child's Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of parents in {pageData.cityName} who trust {pageData.centerName} for their child's education.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Phone className="w-5 h-5 mr-2" />
              Call {pageData.phone}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Mail className="w-5 h-5 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 {pageData.centerName}. Part of StudyCubs Learning Network.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FranchisePage;