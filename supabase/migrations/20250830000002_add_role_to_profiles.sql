-- Add a 'role' column to the 'profiles' table
ALTER TABLE public.profiles
ADD COLUMN role TEXT DEFAULT 'customer';

-- Create an index on the 'role' column for faster queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Optional: Set existing users to 'customer' role where role is currently NULL
UPDATE public.profiles
SET role = 'customer'
WHERE role IS NULL;
