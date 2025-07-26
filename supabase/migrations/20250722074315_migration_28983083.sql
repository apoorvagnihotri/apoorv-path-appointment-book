-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create many-to-many relationship between packages and tests
CREATE TABLE public.package_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, test_id)
);

-- Create many-to-many relationship between tests and categories
CREATE TABLE public.test_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(test_id, category_id)
);

-- Create many-to-many relationship between packages and categories
CREATE TABLE public.package_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, category_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Packages are publicly readable" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Package tests are publicly readable" ON public.package_tests FOR SELECT USING (true);
CREATE POLICY "Test categories are publicly readable" ON public.test_categories FOR SELECT USING (true);
CREATE POLICY "Package categories are publicly readable" ON public.package_categories FOR SELECT USING (true);

-- Add trigger for packages updated_at
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert categories
INSERT INTO public.categories (name, icon_name) VALUES
('Full Body', 'User'),
('Fever', 'Thermometer'),
('Heart', 'Heart'),
('Vitamin', 'Pill'),
('Diabetes', 'Droplets'),
('Thyroid', 'Shield'),
('Hormones', 'Activity'),
('Cancer', 'Ribbon'),
('Lifestyle', 'Dumbbell'),
('Pregnancy', 'Baby'),
('Fertility', 'Egg'),
('Allergy', 'AlertTriangle'),
('STD', 'Shield'),
('Arthritis', 'Bone'),
('Anemia', 'Droplet');

-- Insert some sample packages
INSERT INTO public.packages (name, description, price) VALUES
('Complete Health Checkup', 'Comprehensive health screening with 50+ tests', 2999),
('Diabetes Care Package', 'Essential tests for diabetes monitoring and management', 899),
('Heart Health Package', 'Cardiovascular health assessment with lipid profile', 1299),
('Vitamin Deficiency Package', 'Complete vitamin and mineral deficiency screening', 1599),
('Thyroid Function Package', 'Complete thyroid function tests including T3, T4, TSH', 699),
('Women Health Package', 'Comprehensive health screening designed for women', 2499),
('Pregnancy Care Package', 'Essential tests during pregnancy for mother and baby', 1899),
('Cancer Screening Package', 'Early detection screening for common cancers', 3499);

-- Add some sample tests with different categories
INSERT INTO public.tests (name, description, price, category) VALUES
('Complete Blood Count (CBC)', 'Basic blood test to check overall health', 299, 'Blood'),
('Lipid Profile', 'Cholesterol and triglyceride levels', 399, 'Heart'),
('HbA1c Test', 'Blood sugar control over past 2-3 months', 349, 'Diabetes'),
('Thyroid Profile (T3, T4, TSH)', 'Complete thyroid function assessment', 599, 'Thyroid'),
('Vitamin D Test', 'Vitamin D deficiency screening', 899, 'Vitamin'),
('Vitamin B12 Test', 'Vitamin B12 levels in blood', 699, 'Vitamin'),
('PSA Test', 'Prostate cancer screening for men', 799, 'Cancer'),
('Pap Smear', 'Cervical cancer screening for women', 999, 'Cancer'),
('Pregnancy Test (Beta HCG)', 'Confirm pregnancy with blood test', 399, 'Pregnancy'),
('Allergy Panel', 'Common allergen testing', 2999, 'Allergy');

-- Link packages to categories
DO $$
DECLARE
    full_body_id UUID;
    diabetes_id UUID;
    heart_id UUID;
    vitamin_id UUID;
    thyroid_id UUID;
    pregnancy_id UUID;
    cancer_id UUID;
    lifestyle_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO full_body_id FROM public.categories WHERE name = 'Full Body';
    SELECT id INTO diabetes_id FROM public.categories WHERE name = 'Diabetes';
    SELECT id INTO heart_id FROM public.categories WHERE name = 'Heart';
    SELECT id INTO vitamin_id FROM public.categories WHERE name = 'Vitamin';
    SELECT id INTO thyroid_id FROM public.categories WHERE name = 'Thyroid';
    SELECT id INTO pregnancy_id FROM public.categories WHERE name = 'Pregnancy';
    SELECT id INTO cancer_id FROM public.categories WHERE name = 'Cancer';
    SELECT id INTO lifestyle_id FROM public.categories WHERE name = 'Lifestyle';

    -- Link packages to categories
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, full_body_id FROM public.packages p WHERE p.name = 'Complete Health Checkup';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, diabetes_id FROM public.packages p WHERE p.name = 'Diabetes Care Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, heart_id FROM public.packages p WHERE p.name = 'Heart Health Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, vitamin_id FROM public.packages p WHERE p.name = 'Vitamin Deficiency Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, thyroid_id FROM public.packages p WHERE p.name = 'Thyroid Function Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, pregnancy_id FROM public.packages p WHERE p.name = 'Pregnancy Care Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, cancer_id FROM public.packages p WHERE p.name = 'Cancer Screening Package';
    
    INSERT INTO public.package_categories (package_id, category_id)
    SELECT p.id, lifestyle_id FROM public.packages p WHERE p.name = 'Women Health Package';

    -- Link tests to categories
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, heart_id FROM public.tests t WHERE t.name = 'Lipid Profile';
    
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, diabetes_id FROM public.tests t WHERE t.name = 'HbA1c Test';
    
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, thyroid_id FROM public.tests t WHERE t.name = 'Thyroid Profile (T3, T4, TSH)';
    
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, vitamin_id FROM public.tests t WHERE t.name IN ('Vitamin D Test', 'Vitamin B12 Test');
    
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, cancer_id FROM public.tests t WHERE t.name IN ('PSA Test', 'Pap Smear');
    
    INSERT INTO public.test_categories (test_id, category_id)
    SELECT t.id, pregnancy_id FROM public.tests t WHERE t.name = 'Pregnancy Test (Beta HCG)';
END $$;