-- Add date_of_birth and sex fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth DATE,
ADD COLUMN sex TEXT CHECK (sex IN ('Male', 'Female', 'Other'));
