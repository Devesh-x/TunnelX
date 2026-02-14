import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTunnels, createTunnel, deleteTunnel, getCurrentUser, type Tunnel, type User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [tunnels, setTunnels] = useState<Tunnel[]>([]);
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        try {
            const [userRes, tunnelsRes] = await Promise.all([
                getCurrentUser(),
                getTunnels(),
            ]);
            setUser(userRes.data.data.user);
            setTunnels(tunnelsRes.data.data.tunnels);
        } catch (error: any) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteTunnel = async (id: string) => {
        if (!window.confirm('Delete this tunnel?')) return;

        try {
            await deleteTunnel(id);
            await loadData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete tunnel');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">TunnelX</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Your Tunnels</h1>
                        <p className="text-muted-foreground">Manage your active localhost tunnels</p>
                    </div>
                </div>

                {tunnels.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-bold mb-2">No tunnels yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first tunnel to get started</p>
                        <Button onClick={() => navigate('/docs')}>Read Documentation</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tunnels.map((tunnel) => (
                            <div
                                key={tunnel.id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🔗</span>
                                        <code className="text-sm">{tunnel.id}</code>
                                    </div>
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-white border border-white">
                                        Active
                                    </span>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={tunnel.publicUrl}
                                        readOnly
                                        onClick={() => copyToClipboard(tunnel.publicUrl)}
                                        className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md cursor-pointer"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(tunnel.publicUrl)}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                    <span className="text-xs text-muted-foreground">
                                        Created {new Date(tunnel.createdAt).toLocaleDateString()}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDeleteTunnel(tunnel.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
