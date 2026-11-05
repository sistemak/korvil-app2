CREATE TABLE IF NOT EXISTS korvil_cursos_matriculas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  curso_id text NOT NULL,
  curso_titulo text NOT NULL,
  area text NOT NULL,
  preco numeric(10,2) DEFAULT 0,
  pix_code text,
  bank_used text,
  status text DEFAULT 'matriculado',
  modulos_concluidos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE korvil_cursos_matriculas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_matriculas" ON korvil_cursos_matriculas;
CREATE POLICY "select_own_matriculas" ON korvil_cursos_matriculas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_matricula" ON korvil_cursos_matriculas;
CREATE POLICY "insert_own_matricula" ON korvil_cursos_matriculas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_matricula" ON korvil_cursos_matriculas;
CREATE POLICY "update_own_matricula" ON korvil_cursos_matriculas
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_korvil_cursos_user ON korvil_cursos_matriculas(user_id);
CREATE INDEX IF NOT EXISTS idx_korvil_cursos_curso ON korvil_cursos_matriculas(curso_id);
