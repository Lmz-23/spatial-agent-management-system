import { useState } from 'react';
import { useAgentsStore } from '../store';
import { appConfig } from '../config/app.config';

export function LoginScreen() {
  const [workspaceId, setWorkspaceId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuthToken = useAgentsStore((state) => state.setAuthToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${appConfig.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const { token } = await res.json();
      setAuthToken(token);
      localStorage.setItem('sams_token', token);
      localStorage.setItem('sams_workspace', workspaceId);

      // Recargar la página para que useAgents haga fetch con el token
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>SAMS</h1>
        <p className="login-subtitle">Simulation & Agent Management System</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Workspace ID</label>
            <input
              type="text"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="UUID del workspace"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>
        <p className="login-hint">
          Para desarrollo usa: cualquier UUID válido como workspaceId y "sams123" como password
        </p>
      </div>
    </div>
  );
}
