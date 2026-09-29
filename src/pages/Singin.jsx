import React from 'react'
import { Button, TextField, Container, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { signIn } from '../lib/supabase_api';
import { Link, useNavigate } from 'react-router-dom'; 



export default function Singin() {
const schema = zod.object({ 
  email: zod.string({ message: "Email is required" })
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: zod.string({ message: "Password is required" })
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
});
 const navigate = useNavigate(); 
  const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",
  defaultValues: {
    email: "",
    password: "",
  }
});

const onSubmit = async (data) => {
  try {
    const result = await signIn(
      data.email,
      data.password,
    );

    console.log("signed in successfully:", result);
   navigate('/');
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('does not exist')) {
      alert('This email is not registered. Please sign up instead.');
    } else {
      alert(error.message);
    }
  }
};
  return (
    <>
    <div className='grid gap-3 text-center'>
          <h1 className='text-3xl font-bold'>welcome back</h1>
          <p className='text-gray-500'>Sign in to access your account.</p>
          <Container maxWidth="sm">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field}
                    fullWidth 
                    label="Email" 
                    type="email" 
                    margin="normal"
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field}
                    fullWidth 
                    label="Password" 
                    type="password" 
                    margin="normal"
                    required
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                sx={{ mt: 3 }}
                type="submit"
              >
                Sign In
              </Button>
              <p className='text-sm text-gray-600 mt-2'>
                Don't have an account? <Link to="/auth/signup" className='text-blue-500 hover:underline'>
                  sign in
                </Link>
              </p>
            </form>
          </Container>
        </div>
    
    </>
  )
}
