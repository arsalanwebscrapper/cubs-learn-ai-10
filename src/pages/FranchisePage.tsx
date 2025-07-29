import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, MessageCircle, Users, Clock, Star, BookOpen } from "lucide-react";

interface FranchisePage {
  id: string;
  title: string;
  city: string;
  state: string;
  slug: string;
  description: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  whatsapp_number: string;
  map_embed_url: string;
  image_url: string;
  facilities: string[];
  programs: string[];
  age_groups: string[];
  meta_title: string;
  meta_description: string;
  keywords: string[];
  is_published: boolean;
  created_at: string;
}

const FranchisePage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<FranchisePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // For now, use localStorage until database table is created
        const savedPages = localStorage.getItem('franchisePages');
        if (savedPages) {
          const pages: FranchisePage[] = JSON.parse(savedPages);
          const foundPage = pages.find(page => 
            page.slug === slug && page.is_published
          );
          
          if (foundPage) {
            setPage(foundPage);
            
            // Update document meta tags
            document.title = foundPage.meta_title;
            
            // Update meta description
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
              metaDescription = document.createElement('meta');
              metaDescription.setAttribute('name', 'description');
              document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', foundPage.meta_description);
            
            // Update meta keywords
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
              metaKeywords = document.createElement('meta');
              metaKeywords.setAttribute('name', 'keywords');
              document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', foundPage.keywords.join(', '));
        
            // Add structured data for SEO
            const structuredData = {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": foundPage.title,
              "description": foundPage.description,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": foundPage.address,
                "addressLocality": foundPage.city,
                "addressRegion": foundPage.state,
                "addressCountry": "IN"
              },
              "telephone": foundPage.contact_phone,
              "email": foundPage.contact_email,
              "url": window.location.href,
              "image": foundPage.image_url
            };
        
            let script = document.querySelector('script[type="application/ld+json"]');
            if (!script) {
              script = document.createElement('script');
              script.setAttribute('type', 'application/ld+json');
              document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(structuredData);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
        
      } catch (error) {
        console.error('Error fetching franchise page:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The franchise page you're looking for doesn't exist or hasn't been published yet.</p>
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ 
                backgroundImage: `url(${page.image_url || '/src/assets/hero-children.jpg'})` 
              }}
            />
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full animate-bounce-slow"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-secondary/20 rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-primary/20 rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          
          {/* Kid-themed animated icons */}
          <div className="absolute top-20 left-1/3 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🎨</div>
          <div className="absolute top-40 right-1/4 text-3xl animate-bounce-slow" style={{ animationDelay: '2s' }}>📚</div>
          <div className="absolute bottom-40 left-1/5 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🧸</div>
          <div className="absolute bottom-24 right-1/5 text-4xl animate-bounce-slow" style={{ animationDelay: '3s' }}>⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <MapPin className="w-4 h-4 mr-2" />
              {page.city}, {page.state}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {page.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {page.description || `Welcome to StudyCubs ${page.city} - Where learning meets fun! Join us for an amazing educational journey for your child.`}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <a href={`tel:${page.contact_phone}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href={`mailto:${page.contact_email}`}>
                  <Mail className="w-5 h-5 mr-2" />
                  Get Info
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs & Age Groups Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Programs</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {page.programs.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BookOpen className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Available Programs</h3>
                  <div className="space-y-2">
                    {page.programs.map((program, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {program}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {page.age_groups.length > 0 && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Age Groups</h3>
                  <div className="space-y-2">
                    {page.age_groups.map((group, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      {page.facilities.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Our Facilities</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {page.facilities.map((facility, index) => (
                <div key={index} className="text-center p-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium">{facility}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {page.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{page.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {page.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{page.contact_phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {page.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{page.contact_email}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <a 
                        href={`https://wa.me/${page.whatsapp_number}?text=Hi, I'm interested in StudyCubs ${page.city} franchise`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Inquiry
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${page.contact_phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${page.contact_email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              {page.map_embed_url && (
                <CardContent className="p-0">
                  <div className="h-80 rounded-lg overflow-hidden">
                    <iframe
                      src={page.map_embed_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${page.title}`}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Child's Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of parents in {page.city} who trust StudyCubs for their child's education and development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
              <a href={`tel:${page.contact_phone}`}>
                <Phone className="w-5 h-5 mr-2" />
                Call {page.contact_phone}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href={`mailto:${page.contact_email}`}>
                <Mail className="w-5 h-5 mr-2" />
                Send Email
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 StudyCubs {page.city}. Part of StudyCubs Learning Network.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Empowering young minds with quality education and holistic development.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FranchisePage;