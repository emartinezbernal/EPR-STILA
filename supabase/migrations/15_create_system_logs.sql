-- =============================================================================
-- Tabla de Logs del Sistema para ERP STILA
-- =============================================================================

-- Tabla de logs del sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'info',
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "system_logs_select" ON system_logs FOR SELECT USING (true);
CREATE POLICY "system_logs_insert" ON system_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "system_logs_update" ON system_logs FOR UPDATE USING (true);
CREATE POLICY "system_logs_delete" ON system_logs FOR DELETE USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_category ON system_logs(category);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);

-- Insertar log de ejemplo
INSERT INTO system_logs (level, category, message, metadata)
VALUES ('info', 'SYSTEM', 'Tabla de logs creada', '{"source": "migration"}')
ON CONFLICT DO NOTHING;
