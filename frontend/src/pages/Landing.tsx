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
        <div className="min-h-screen bg-black text-foreground font-sans selection:bg-white/20 relative overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>

            <header className="container mx-auto px-4 h-16 flex items-center justify-between relative z-10">
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

            <main className="relative z-10">
                <section className="pt-4 pb-8 md:pt-10 md:pb-12">
                    <div className="container mx-auto px-4 text-center">
                        <AnimatedHero
                            onGetStarted={() => window.open('https://www.npmjs.com/package/tunnelx', '_blank')}
                            onSignIn={() => navigate('/register')}
                        />

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
