import React from 'react'
import { Button, TextField, Container, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { signUp } from '../lib/supabase_api';
import { Link, useNavigate } from 'react-router-dom'; 

const schema = zod.object({
  full_name: zod.string({ message: "Name is required" })
    .nonempty("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"), 
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
  confirmPassword: zod.string({ message: "Confirm Password is required" })
    .nonempty("Confirm Password is required"),
  age: zod.coerce.number({ message: "Age is required" })
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  gender: zod.enum(["male", "female", "other", "prefer-not-to-say"],
    "Please select a valid gender")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function Signup() {
    const navigate = useNavigate(); 
  const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: "onBlur",
  defaultValues: {
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: ""
  }
});

const onSubmit = async (data) => {
  try {
    const result = await signUp(
      data.email,
      data.password,
      data.full_name,
      data.age,
      data.gender
    );

    console.log("User created:", result);
   navigate('/');
  } catch (error) {
    console.error(error.message);
    if (error.message.includes('already registered')) {
      alert('This email is already registered. Please sign in instead.');
    } else {
      alert(error.message);
    }
  }
};

  return (
    <div className='grid gap-3 text-center'>
      <h1 className='text-3xl font-bold'>Join Us Today</h1>
      <p className='text-gray-500'>Create an account to get started with our amazing platform.</p>
      <Container maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field}
                fullWidth 
                label="Full Name" 
                margin="normal"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
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
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field}
                fullWidth 
                label="Confirm Password" 
                type="password" 
                margin="normal"
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField 
                {...field}
                fullWidth 
                label="Age" 
                type="number" 
                margin="normal"
                required
                error={!!errors.age}
                helperText={errors.age?.message}
              />
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" required error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  {...field}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            )}
          />
          {errors.gender && <p className='text-red-500 text-sm mt-1'>{errors.gender?.message}</p>}
          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            sx={{ mt: 3 }}
            type="submit"
          >
            Sign Up
          </Button>
          <p className='text-sm text-gray-600 mt-2'>
            Already have an account? <Link to="/auth/Singin" className='text-blue-500 hover:underline'>
              sign in
            </Link>
          </p>
        </form>
      </Container>
    </div>
  )
}