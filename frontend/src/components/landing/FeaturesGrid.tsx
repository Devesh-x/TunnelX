import { Share2, Smartphone, Terminal, Webhook } from 'lucide-react';

interface FeatureCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: string;
    color: string;
}

const features: FeatureCard[] = [
    {
        title: 'Webhook Testing',
        description: 'Receive Stripe, GitHub, or Slack webhooks directly on your local machine without deploying.',
        icon: <Webhook className="w-6 h-6 text-orange-500" />,
        command: 'tunnelx start --port 3000',
        color: 'orange',
    },
    {
        title: 'Demo Sharing',
        description: 'Share a live preview of your work with clients or teammates — no staging server needed.',
        icon: <Share2 className="w-6 h-6 text-blue-500" />,
        command: 'tunnelx start --port 5173',
        color: 'blue',
    },
    {
        title: 'Mobile Testing',
        description: 'Test your app on real devices over the internet without complicated network setup.',
        icon: <Smartphone className="w-6 h-6 text-green-500" />,
        command: 'tunnelx start --port 8080',
        color: 'green',
    },
    {
        title: 'CI/CD Callbacks',
        description: 'Let external services call back to your local environment during development and debugging.',
        icon: <Terminal className="w-6 h-6 text-purple-500" />,
        command: 'tunnelx start --port 4000',
        color: 'purple',
    },
];

export function FeaturesGrid() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-white">
                        Built For
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Common scenarios where TunnelX saves you time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 hover:border-white/20 transition-all duration-300 text-left">
                            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${feature.color}-500/20 rounded-bl-3xl`}>
                                {feature.icon}
                            </div>

                            <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                                {feature.icon}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground mb-6 line-clamp-2">
                                {feature.description}
                            </p>

                            <div className="relative mt-auto">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />
                                <div className="rounded-lg bg-black/50 border border-white/5 p-3 text-sm font-mono text-muted-foreground group-hover:text-white transition-colors flex items-center gap-2">
                                    <span className="text-primary">$</span>
                                    {feature.command}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
