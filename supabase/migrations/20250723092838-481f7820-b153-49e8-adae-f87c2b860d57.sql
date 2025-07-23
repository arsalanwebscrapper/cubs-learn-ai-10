-- Add login credentials for students
ALTER TABLE public.students 
ADD COLUMN username text UNIQUE,
ADD COLUMN password_hash text,
ADD COLUMN is_login_enabled boolean DEFAULT false;

-- Create index for faster username lookups
CREATE INDEX idx_students_username ON public.students(username) WHERE username IS NOT NULL;

-- Update RLS policies to allow student authentication
CREATE POLICY "Students can view their own data" 
ON public.students 
FOR SELECT 
USING (username = current_setting('request.jwt.claims', true)::json->>'username');

-- Allow students to submit assignments
CREATE POLICY "Students can insert assignment submissions" 
ON public.assignment_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = assignment_submissions.student_id 
    AND username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

-- Allow students to view their own submissions
CREATE POLICY "Students can view their own submissions" 
ON public.assignment_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = assignment_submissions.student_id 
    AND username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

-- Allow students to view assignments for their batch
CREATE POLICY "Students can view assignments for their batch" 
ON public.assignments 
FOR SELECT 
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM public.students 
    WHERE batch_id = assignments.batch_id 
    AND username = current_setting('request.jwt.claims', true)::json->>'username'
  )
);

-- Create function for student authentication
CREATE OR REPLACE FUNCTION public.authenticate_student(
  p_username text,
  p_password text
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record public.students;
  result json;
BEGIN
  -- Find student with matching username and enabled login
  SELECT * INTO student_record
  FROM public.students
  WHERE username = p_username 
    AND is_login_enabled = true
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
  
  -- Check password (in production, use proper password hashing)
  IF student_record.password_hash = crypt(p_password, student_record.password_hash) THEN
    RETURN json_build_object(
      'success', true,
      'student', json_build_object(
        'id', student_record.id,
        'full_name', student_record.full_name,
        'batch_id', student_record.batch_id,
        'username', student_record.username
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid credentials');
  END IF;
END;
$$;