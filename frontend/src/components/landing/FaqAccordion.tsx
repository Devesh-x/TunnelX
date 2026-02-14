import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqAccordion() {
    return (
        <section className="py-24 bg-black/50">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-white">
                        Frequently Asked Questions
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-white/10">
                        <AccordionTrigger className="text-lg hover:no-underline hover:text-primary transition-colors">
                            Do I need to install anything?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Yes, creating tunnels requires the TunnelX CLI. Install it globally with `npm install -g tunnelx`. However, viewers of your tunnel do not need to install anything.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border-white/10">
                        <AccordionTrigger className="text-lg hover:no-underline hover:text-primary transition-colors">
                            What are the limits?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            The free tier includes unlimited HTTP/HTTPS tunnels with generous bandwidth limits. Custom subdomains are available on paid plans.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border-white/10">
                        <AccordionTrigger className="text-lg hover:no-underline hover:text-primary transition-colors">
                            Does it support WebSockets?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Yes! TunnelX has full support for WebSockets, making it perfect for real-time applications like chat apps, dashboards, and games.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border-white/10">
                        <AccordionTrigger className="text-lg hover:no-underline hover:text-primary transition-colors">
                            How secure is it?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Very secure. All traffic is encrypted via HTTPS. Tunnels are ephemeral and minimal information is stored. We also perform automatic malware scanning on tunnel traffic.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5" className="border-white/10">
                        <AccordionTrigger className="text-lg hover:no-underline hover:text-primary transition-colors">
                            Can I pick my subdomain?
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Currently, subdomains are randomly generated for free users. Custom reserved subdomains are coming soon for premium accounts.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
