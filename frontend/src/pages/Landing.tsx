import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedHero } from '@/components/ui/animated-hero';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { FaqAccordion } from '@/components/landing/FaqAccordion';
import { Globe, Github, BookOpen } from 'lucide-react';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Hero Section */}
            <header className="container mx-auto px-4 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Globe className="w-6 h-6 text-primary" />
                    <span>TunnelX</span>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/docs')}>
                        <BookOpen className="w-4 h-4" />
                        Docs
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open('https://github.com/Devesh-x/TunnelX', '_blank')}>
                        <Github className="w-4 h-4" />
                        GitHub
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
                    <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
                </div>
            </header>

            <main>
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4 text-center">
                        <AnimatedHero />

                    </div>
                </section>

                <FeaturesGrid />
                <ComparisonTable />
                <FaqAccordion />
            </main>
        </div>
    );
}

export default Landing;
