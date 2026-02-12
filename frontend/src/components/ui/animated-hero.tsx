import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedHeroProps {
    onGetStarted?: () => void;
    onSignIn?: () => void;
}

function AnimatedHero({ onGetStarted, onSignIn }: AnimatedHeroProps) {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["fast", "secure", "simple", "powerful", "reliable"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="w-full">
            <div className="container mx-auto px-4">
                <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
                    <div>
                        <Button variant="secondary" size="sm" className="gap-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            v1.0 Live
                        </Button>
                    </div>

                    <div className="flex gap-6 flex-col max-w-4xl">
                        <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tight text-center font-bold">
                            <span className="text-foreground">Expose your localhost in single click</span>
                            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        className="absolute text-white italic font-light"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                        initial={{ opacity: 0, y: -100 }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? {
                                                    y: 0,
                                                    opacity: 1,
                                                }
                                                : {
                                                    y: titleNumber > index ? -150 : 150,
                                                    opacity: 0,
                                                }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center mx-auto">
                            Instant public URLs for your local web server. Share your work with clients,
                            test webhooks, or demo your app - all without deploying.
                        </p>
                    </div>

                    <div className="flex flex-row gap-3 flex-wrap justify-center">
                        <Button size="lg" className="gap-2" onClick={onGetStarted}>
                            Get Started Free <MoveRight className="w-4 h-4" />
                        </Button>
                        <Button size="lg" className="gap-2" variant="outline" onClick={onSignIn}>
                            Sign In
                        </Button>
                    </div>

                    <div className="w-full max-w-3xl mt-8 rounded-xl overflow-hidden border border-border shadow-2xl">
                        <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                            </div>
                            <span className="text-xs text-muted-foreground ml-2">bash — 80x24</span>
                        </div>
                        <div className="bg-black p-6 font-mono text-sm">
                            <div className="flex gap-3 text-white">
                                <span>$</span>
                                <span className="text-white">tunnelx start --port 3000</span>
                                <span className="animate-pulse">█</span>
                            </div>
                            <div className="mt-2 text-gray-300">✓ Tunnel created successfully!</div>
                            <div className="mt-1 text-gray-400">→ Public URL: https://abc123.tunnelx.dev</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { AnimatedHero };
