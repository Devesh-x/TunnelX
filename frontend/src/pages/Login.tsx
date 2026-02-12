import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '@/lib/api';
import { Button } from '@/components/ui/button';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.data.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">TunnelX</h2>
                    <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                    <p className="text-muted-foreground">Login to manage your tunnels</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="text-center mt-6 text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
