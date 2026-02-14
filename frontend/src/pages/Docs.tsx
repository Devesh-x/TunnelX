import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Terminal, Shield, Globe, Zap } from 'lucide-react';

function Docs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TunnelX <span className="text-muted-foreground font-normal">Docs</span></h1>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Getting Started with TunnelX
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        Expose your localhost to the world in seconds. Secure, fast, and developer-friendly tunneling.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Section 1: Installation */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">1. Installation</h2>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground mb-4">
                                Install the TunnelX CLI globally using npm. You'll need Node.js installed on your machine.
                            </p>
                            <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm border border-border/50 relative group">
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-muted-foreground">bash</span>
                                </div>
                                <span className="text-primary mr-2">$</span>
                                npm install -g tunnelx
                            </div>
                            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500/90 text-sm">
                                <strong>Pro Tip:</strong> For complex apps (React, Next.js, Vue), we recommending <strong>building your app</strong> first!
                                <br />
                                <code>npm run build && npm run preview</code>
                                <br />
                                This avoids issues with absolute paths in development servers.
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Authentication */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">2. Authentication</h2>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground mb-4">
                                Before creating tunnels, log in with your TunnelX account.
                            </p>
                            <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm border border-border/50">
                                <span className="text-primary mr-2">$</span>
                                tunnelx login
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 ml-1">
                                You'll be prompted to enter your email and password.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Creating a Tunnel */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">3. Start Tunneling</h2>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted-foreground mb-4">
                                Point TunnelX to your local server port. For example, if your React app is running on port 5173:
                            </p>
                            <div className="bg-muted/50 rounded-xl p-4 font-mono text-sm border border-border/50">
                                <span className="text-primary mr-2">$</span>
                                tunnelx start --port 5173
                            </div>

                            <div className="mt-6 space-y-2">
                                <h3 className="font-semibold text-foreground">You'll see output like:</h3>
                                <div className="bg-black/80 rounded-xl p-4 font-mono text-sm text-green-400 border border-green-900/30">
                                    <div className="mb-2">🚇 TunnelX Tunnel</div>
                                    <div className="text-white mb-4">✅ Connected to tunnel server</div>
                                    <div className="text-blue-400">🌐 Public URL: https://tunnelx-backend.onrender.com/t/abc123xyz/</div>
                                    <div className="text-yellow-400">🔗 Forwarding to: http://localhost:5173</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Troubleshooting */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Troubleshooting</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                                <h3 className="font-semibold mb-2">Assets not loading?</h3>
                                <p className="text-sm text-muted-foreground">
                                    If you see 404s for JS/CSS files, make sure your app uses <strong>relative paths</strong>.
                                    <br /><br />
                                    <strong>Vite/React:</strong> Set <code>base: './'</code> in <code>vite.config.ts</code>.
                                </p>
                            </div>
                            <div className="p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/5 transition-colors">
                                <h3 className="font-semibold mb-2">Connection Closed?</h3>
                                <p className="text-sm text-muted-foreground">
                                    The CLI automatically attempts to reconnect (`Code 1006`). If it persists, the backend might be restarting (free tier). Just wait a moment.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t border-border/40 text-center">
                    <p className="text-muted-foreground">
                        Built with ❤️ by the TunnelX Team
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Docs;
