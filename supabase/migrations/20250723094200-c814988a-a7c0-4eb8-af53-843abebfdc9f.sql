
-- Create function to hash passwords for students
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$;

-- Update students table to ensure proper constraints
ALTER TABLE public.students 
ADD CONSTRAINT students_username_unique UNIQUE (username);

-- Create function to generate student credentials
CREATE OR REPLACE FUNCTION public.generate_student_credentials(
  p_student_id uuid,
  p_username text,
  p_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_record public.students;
BEGIN
  -- Update student with login credentials
  UPDATE public.students 
  SET 
    username = p_username,
    password_hash = hash_password(p_password),
    is_login_enabled = true
  WHERE id = p_student_id
  RETURNING * INTO student_record;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Student not found');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Student credentials generated successfully',
    'student', json_build_object(
      'id', student_record.id,
      'username', student_record.username,
      'full_name', student_record.full_name
    )
  );
END;
$$;

-- Create student dashboard view function
CREATE OR REPLACE FUNCTION public.get_student_assignments(p_student_id uuid)
RETURNS TABLE(
  assignment_id uuid,
  title text,
  description text,
  due_date timestamp with time zone,
  total_marks integer,
  is_published boolean,
  created_at timestamp with time zone,
  submitted boolean,
  submission_id uuid,
  marks_obtained integer,
  feedback text,
  graded_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as assignment_id,
    a.title,
    a.description,
    a.due_date,
    a.total_marks,
    a.is_published,
    a.created_at,
    CASE WHEN sub.id IS NOT NULL THEN true ELSE false END as submitted,
    sub.id as submission_id,
    sub.marks_obtained,
    sub.feedback,
    sub.graded_at
  FROM public.assignments a
  LEFT JOIN public.assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = p_student_id
  WHERE a.batch_id = (SELECT batch_id FROM public.students WHERE id = p_student_id)
    AND a.is_published = true
  ORDER BY a.created_at DESC;
END;
$$;
