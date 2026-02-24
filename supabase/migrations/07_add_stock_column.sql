-- =============================================================================
-- Agregar columna 'stock' a la tabla products
-- =============================================================================
-- Esta migración soluciona el problema de que la tabla products no tiene
-- la columna 'stock' que es necesaria para el control de inventario

-- Agregar columna stock si no existe
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Verificar que las columnas requeridas existan
DO $$
BEGIN
    -- Verificar stock
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) THEN
        RAISE EXCEPTION 'Columna stock no pudo ser creada';
    END IF;
    
    RAISE NOTICE 'Columna stock verificada correctamente en products';
END $$;

-- Mensaje de éxito
DO $$ 
BEGIN
    RAISE NOTICE 'Migración 07_add_stock_column completada correctamente';
END $$;
