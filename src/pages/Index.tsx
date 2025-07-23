
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
