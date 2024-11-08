// components/SignupForm.tsx
"use client"
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setLoading(true);
    try {
      // Call the signup API
      const response = await fetch('http://localhost:3000/auth/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        const data = await response.json();
        localStorage.setItem('token', data["accessToken"]);
        localStorage.setItem('userId', data["user_id"]);
        setError(null);
        // console.log(await response.json());
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      <Label htmlFor="email" className=' text-white'>Email</Label>
      <Input
      className='text-white'
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Label htmlFor="password" className=' text-white'>Password</Label>
      <Input
      className='text-white'
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <div className="text-red-500">{error}</div>}

      <Button variant={'secondary'} onClick={handleSignup}>
        Sign Up
      </Button>
    </div>
  );
};

export default SignupForm;