"use client"
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Call the login API
      const response = await fetch('http://localhost:3000/auth/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        // Handle successful login
        const data = await response.json();
        localStorage.setItem('token', data["accessToken"]);
        localStorage.setItem('userId', data["user_id"]);
        console.log('Logged in successfully!');
        setError(null);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="email" className='text-white'>Email</Label>
      <Input
        id="email"
        type="email"
        className='text-white'
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
      />

      <Label htmlFor="password" className='text-white'>Password</Label>
      <Input
        id="password"
        className='text-white'
        type="password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />

      {error && <div className="text-red-500">{error}</div>}

      <Button onClick={handleLogin} variant={'secondary'}>
        Login
      </Button>
    </div>
  );
};

export default LoginForm;