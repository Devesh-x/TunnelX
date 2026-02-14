import { Check, X } from 'lucide-react';

interface ComparisonFeature {
    name: string;
    tunnelx: boolean | string;
    ngrok: boolean | string;
    cloudflare: boolean | string;
    localtunnel: boolean | string;
}

const features: ComparisonFeature[] = [
    { name: 'No install required', tunnelx: true, ngrok: false, cloudflare: false, localtunnel: true },
    { name: 'No signup required', tunnelx: true, ngrok: false, cloudflare: false, localtunnel: true },
    { name: 'Free', tunnelx: true, ngrok: 'Limited', cloudflare: true, localtunnel: true },
    { name: 'HTTPS included', tunnelx: true, ngrok: true, cloudflare: true, localtunnel: true },
    { name: 'Works with SSH', tunnelx: true, ngrok: false, cloudflare: false, localtunnel: false },
    { name: 'WebSocket support', tunnelx: true, ngrok: true, cloudflare: true, localtunnel: false },
    { name: 'Open source', tunnelx: true, ngrok: false, cloudflare: false, localtunnel: true },
];

export function ComparisonTable() {
    return (
        <section className="py-24 bg-black/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        How We Compare
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        See how TunnelX stacks up against the alternatives.
                    </p>
                </div>

                <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium"></th>
                                <th scope="col" className="px-6 py-4 font-bold text-primary text-base text-center">TunnelX</th>
                                <th scope="col" className="px-6 py-4 font-medium text-center">ngrok</th>
                                <th scope="col" className="px-6 py-4 font-medium text-center">Cloudflare Tunnel</th>
                                <th scope="col" className="px-6 py-4 font-medium text-center">localtunnel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                        {feature.name}
                                    </th>
                                    <td className="px-6 py-4 text-center">
                                        {feature.tunnelx === true ? (
                                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                                        ) : feature.tunnelx === false ? (
                                            <X className="w-5 h-5 text-red-500 mx-auto" />
                                        ) : (
                                            <span className="text-yellow-500 font-medium">{feature.tunnelx}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-muted-foreground">
                                        {feature.ngrok === true ? (
                                            <Check className="w-5 h-5 mx-auto opacity-50" />
                                        ) : feature.ngrok === false ? (
                                            <X className="w-5 h-5 mx-auto opacity-50" />
                                        ) : (
                                            <span className="text-yellow-500/70 font-medium">{feature.ngrok}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-muted-foreground">
                                        {feature.cloudflare === true ? (
                                            <Check className="w-5 h-5 mx-auto opacity-50" />
                                        ) : feature.cloudflare === false ? (
                                            <X className="w-5 h-5 mx-auto opacity-50" />
                                        ) : (
                                            <span className="text-yellow-500/70 font-medium">{feature.cloudflare}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-muted-foreground">
                                        {feature.localtunnel === true ? (
                                            <Check className="w-5 h-5 mx-auto opacity-50" />
                                        ) : feature.localtunnel === false ? (
                                            <X className="w-5 h-5 mx-auto opacity-50" />
                                        ) : (
                                            <span className="text-yellow-500/70 font-medium">{feature.localtunnel}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
