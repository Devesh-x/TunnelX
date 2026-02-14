import { useNavigate } from 'react-router-dom';
import { AnimatedHero } from '@/components/ui/animated-hero';
import { Button } from '@/components/ui/button';
import { Github, BookOpen } from 'lucide-react';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar without border */}
            <nav className="fixed top-4 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
                <div className="max-w-[1300px] mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Left: TunnelX Logo */}
                    <h1 className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TunnelX</h1>

                    {/* Right: Nav Links */}
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/docs')}>
                            <BookOpen className="w-4 h-4" />
                            Docs
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.open('https://github.com/Devesh-x/TunnelX', '_blank')}>
                            <Github className="w-4 h-4" />
                            GitHub
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section with minimal top padding for navbar */}
            <main className="pt-4">
                <AnimatedHero
                    onGetStarted={() => navigate('/register')}
                    onSignIn={() => navigate('/login')}
                />
            </main>
        </div>
    );
}

export default Landing;
