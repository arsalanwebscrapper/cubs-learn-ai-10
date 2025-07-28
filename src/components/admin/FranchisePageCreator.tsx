import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Globe, 
  Search, 
  Eye, 
  Save, 
  Plus,
  Image,
  Star,
  Users,
  BookOpen,
  Award,
  Phone,
  Mail,
  Clock,
  Target,
  Heart,
  Sparkles
} from "lucide-react";

interface FranchisePage {
  id?: string;
  city: string;
  state: string;
  title: string;
  meta_description: string;
  meta_keywords: string;
  h1_heading: string;
  hero_subtitle: string;
  hero_description: string;
  about_section: string;
  programs_section: string;
  why_choose_section: string;
  contact_info: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  local_keywords: string;
  schema_markup: string;
  is_published: boolean;
}

const FranchisePageCreator = () => {
  const [pages, setPages] = useState<FranchisePage[]>([]);
  const [currentPage, setCurrentPage] = useState<FranchisePage>({
    city: "",
    state: "",
    title: "",
    meta_description: "",
    meta_keywords: "",
    h1_heading: "",
    hero_subtitle: "",
    hero_description: "",
    about_section: "",
    programs_section: "",
    why_choose_section: "",
    contact_info: {
      address: "",
      phone: "",
      email: "",
      hours: ""
    },
    local_keywords: "",
    schema_markup: "",
    is_published: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const generateSEOContent = (city: string, state: string) => {
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    
    setCurrentPage(prev => ({
      ...prev,
      title: `Best Coaching Classes in ${capitalizedCity} | StudyCubs ${capitalizedCity} | Top Educational Center ${capitalizedState}`,
      meta_description: `Join StudyCubs ${capitalizedCity} - Premium coaching classes for kids in ${capitalizedCity}, ${capitalizedState}. Expert teachers, proven methods, personalized learning. Enroll today for academic excellence!`,
      meta_keywords: `coaching classes ${city}, education center ${city}, tutoring ${city}, study cubs ${city}, best coaching ${city} ${state}, kids learning ${city}, academic support ${city}, teaching center ${city}`,
      h1_heading: `StudyCubs ${capitalizedCity} - Building Future Champions`,
      hero_subtitle: `Premium Educational Excellence in ${capitalizedCity}`,
      hero_description: `Discover ${capitalizedCity}'s most trusted educational partner. At StudyCubs ${capitalizedCity}, we nurture young minds with innovative teaching methods, personalized attention, and a proven track record of success. Join hundreds of students who've achieved their academic dreams with us.`,
      about_section: `Welcome to StudyCubs ${capitalizedCity}, where education meets excellence! Located in the heart of ${capitalizedCity}, ${capitalizedState}, we are dedicated to providing world-class coaching that transforms students into confident learners and future leaders. Our state-of-the-art facility combines traditional teaching values with modern educational technology.`,
      programs_section: `Our comprehensive programs in ${capitalizedCity} include: Foundation Courses for Classes 1-5, Advanced Learning for Classes 6-10, Competitive Exam Preparation, Skill Development Workshops, Personality Development Classes, and Special Holiday Programs. Each program is designed specifically for ${capitalizedCity} students' needs.`,
      why_choose_section: `Why StudyCubs ${capitalizedCity} stands out: ✓ Located conveniently in ${capitalizedCity} for easy access ✓ Experienced local teachers who understand ${capitalizedState} curriculum ✓ Small batch sizes ensuring personal attention ✓ Regular parent-teacher meetings ✓ Proven track record in ${capitalizedCity} ✓ Modern infrastructure with digital learning tools`,
      local_keywords: `${city} coaching, ${city} tuition, ${city} education, ${state} learning center, ${city} academic support, best teachers ${city}, ${city} study center`,
      schema_markup: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": `StudyCubs ${capitalizedCity}`,
        "description": `Premium coaching classes in ${capitalizedCity}, ${capitalizedState}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": capitalizedCity,
          "addressRegion": capitalizedState,
          "addressCountry": "IN"
        },
        "areaServed": `${capitalizedCity}, ${capitalizedState}`,
        "educationalCredentialAwarded": "Academic Excellence Certificate"
      }, null, 2)
    }));
  };

  const handleSave = async () => {
    try {
      if (!currentPage.city || !currentPage.state) {
        toast({
          title: "Error",
          description: "City and State are required",
          variant: "destructive"
        });
        return;
      }

      // Save to localStorage for now (we'll add database integration after SQL is run)
      const pageData = {
        ...currentPage,
        slug: `${currentPage.city.toLowerCase()}-${currentPage.state.toLowerCase()}`,
        id: editingId || `${Date.now()}`
      };

      if (editingId) {
        // Update existing page
        setPages(prev => prev.map(p => p.id === editingId ? pageData : p));
        setEditingId(null);
      } else {
        // Create new page
        setPages(prev => [...prev, pageData]);
      }

      toast({
        title: "Success",
        description: `Franchise page ${editingId ? 'updated' : 'created'} successfully!`
      });

      // Reset form
      setCurrentPage({
        city: "",
        state: "",
        title: "",
        meta_description: "",
        meta_keywords: "",
        h1_heading: "",
        hero_subtitle: "",
        hero_description: "",
        about_section: "",
        programs_section: "",
        why_choose_section: "",
        contact_info: {
          address: "",
          phone: "",
          email: "",
          hours: ""
        },
        local_keywords: "",
        schema_markup: "",
        is_published: false
      });
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error",
        description: "Failed to save franchise page",
        variant: "destructive"
      });
    }
  };

  const AnimatedHeroPreview = () => (
    <div className="relative min-h-[500px] bg-gradient-hero overflow-hidden rounded-lg">
      {/* Floating Animation Icons */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 animate-bounce">
          <BookOpen className="w-8 h-8 text-primary opacity-60" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse">
          <Star className="w-6 h-6 text-secondary opacity-70" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce delay-1000">
          <Award className="w-7 h-7 text-primary opacity-60" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse delay-500">
          <Heart className="w-6 h-6 text-secondary opacity-70" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-bounce delay-700">
          <Sparkles className="w-5 h-5 text-primary opacity-50" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-pulse delay-300">
          <Target className="w-6 h-6 text-secondary opacity-60" />
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-16 right-1/4 w-4 h-4 bg-primary/20 rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-40 left-1/3 w-6 h-6 bg-secondary/20 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-2/3 right-16 w-3 h-3 bg-primary/30 rounded-full animate-pulse delay-800"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[500px] p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-batangas font-bold text-foreground mb-4 animate-fade-in">
            {currentPage.h1_heading || "StudyCubs [City] - Building Future Champions"}
          </h1>
          <p className="text-xl md:text-2xl text-primary mb-6 animate-fade-in delay-200">
            {currentPage.hero_subtitle || "Premium Educational Excellence in [City]"}
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-400">
            {currentPage.hero_description || "Discover [City]'s most trusted educational partner. At StudyCubs [City], we nurture young minds with innovative teaching methods..."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in delay-600">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Users className="w-5 h-5 mr-2" />
              Enroll Now
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="w-5 h-5 mr-2" />
              Call Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-batangas font-bold text-foreground">Franchise Page Creator</h2>
          <p className="text-muted-foreground">Create SEO-optimized pages for offline coaching centers</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="space-y-6">
          <AnimatedHeroPreview />
          
          <Card>
            <CardHeader>
              <CardTitle>SEO Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded bg-muted/30">
                <h3 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                  {currentPage.title || "Page Title"}
                </h3>
                <p className="text-green-700 text-sm">
                  studycubs.com/{currentPage.city.toLowerCase()}-{currentPage.state.toLowerCase()}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {currentPage.meta_description || "Meta description will appear here..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={currentPage.city}
                      onChange={(e) => setCurrentPage(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Bangalore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={currentPage.state}
                      onChange={(e) => setCurrentPage(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="e.g., Karnataka"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => generateSEOContent(currentPage.city, currentPage.state)}
                  disabled={!currentPage.city || !currentPage.state}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate SEO Content
                </Button>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-secondary" />
                  SEO Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Page Title (SEO)</Label>
                  <Input
                    id="title"
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="SEO optimized page title"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPage.title.length}/60 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={currentPage.meta_description}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO meta description"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentPage.meta_description.length}/160 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="meta_keywords">Keywords</Label>
                  <Input
                    id="meta_keywords"
                    value={currentPage.meta_keywords}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  Page Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="h1_heading">Hero Heading (H1)</Label>
                  <Input
                    id="h1_heading"
                    value={currentPage.h1_heading}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, h1_heading: e.target.value }))}
                    placeholder="Main page heading"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Input
                    id="hero_subtitle"
                    value={currentPage.hero_subtitle}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                    placeholder="Engaging subtitle"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_description">Hero Description</Label>
                  <Textarea
                    id="hero_description"
                    value={currentPage.hero_description}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, hero_description: e.target.value }))}
                    placeholder="Compelling hero description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-secondary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={currentPage.contact_info.address}
                    onChange={(e) => setCurrentPage(prev => ({ 
                      ...prev, 
                      contact_info: { ...prev.contact_info, address: e.target.value }
                    }))}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={currentPage.contact_info.phone}
                      onChange={(e) => setCurrentPage(prev => ({ 
                        ...prev, 
                        contact_info: { ...prev.contact_info, phone: e.target.value }
                      }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={currentPage.contact_info.email}
                      onChange={(e) => setCurrentPage(prev => ({ 
                        ...prev, 
                        contact_info: { ...prev.contact_info, email: e.target.value }
                      }))}
                      placeholder="center@studycubs.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hours">Operating Hours</Label>
                  <Input
                    id="hours"
                    value={currentPage.contact_info.hours}
                    onChange={(e) => setCurrentPage(prev => ({ 
                      ...prev, 
                      contact_info: { ...prev.contact_info, hours: e.target.value }
                    }))}
                    placeholder="Mon-Fri: 9AM-6PM, Sat: 9AM-2PM"
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="w-4 h-4 mr-2" />
              {editingId ? "Update Page" : "Create Page"}
            </Button>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentPage.about_section}
                  onChange={(e) => setCurrentPage(prev => ({ ...prev, about_section: e.target.value }))}
                  placeholder="About the coaching center..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programs Section</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentPage.programs_section}
                  onChange={(e) => setCurrentPage(prev => ({ ...prev, programs_section: e.target.value }))}
                  placeholder="Description of programs offered..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentPage.why_choose_section}
                  onChange={(e) => setCurrentPage(prev => ({ ...prev, why_choose_section: e.target.value }))}
                  placeholder="Reasons to choose this center..."
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schema Markup (JSON-LD)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentPage.schema_markup}
                  onChange={(e) => setCurrentPage(prev => ({ ...prev, schema_markup: e.target.value }))}
                  placeholder="Structured data for SEO..."
                  rows={6}
                  className="font-mono text-xs"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Existing Pages List */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Franchise Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-semibold">{page.city}, {page.state}</h3>
                    <p className="text-sm text-muted-foreground">{page.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentPage(page);
                        setEditingId(page.id || null);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FranchisePageCreator;
