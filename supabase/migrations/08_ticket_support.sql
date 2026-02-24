-- Migration: Add ticket support columns to sales table
-- This migration adds the necessary columns to store ticket data and improve sales tracking

-- Add new columns to sales table for better ticket and payment tracking
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS amount_received NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_change NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS printed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_printed_at TIMESTAMPTZ;

-- Create index on sale_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON sales(sale_number);

-- Create index on customer_id for customer sales history
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);

-- Create index on sale_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);

-- Ensure sale_items table has proper constraints
ALTER TABLE sale_items 
ALTER COLUMN quantity SET NOT NULL,
ALTER COLUMN unit_price SET NOT NULL,
ALTER COLUMN total SET NOT NULL;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sale_items_sale_id_fkey'
    ) THEN
        ALTER TABLE sale_items 
        ADD CONSTRAINT sale_items_sale_id_fkey 
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on sale_items sale_id for faster joins
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- Create index on sale_items product_id for product sales history
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Add comments for documentation
COMMENT ON COLUMN sales.amount_received IS 'Amount received from customer';
COMMENT ON COLUMN sales.payment_change IS 'Change given to customer';
COMMENT ON COLUMN sales.items_count IS 'Number of items in the sale';
COMMENT ON COLUMN sales.printed_count IS 'Number of times the ticket has been printed';
COMMENT ON COLUMN sales.last_printed_at IS 'Last time the ticket was printed';

-- Update existing records to set default values
UPDATE sales SET 
    amount_received = COALESCE(amount_paid, 0),
    payment_change = COALESCE(change_given, 0)
WHERE amount_received IS NULL OR payment_change IS NULL;

-- Create a function to update items_count when sale_items change
CREATE OR REPLACE FUNCTION update_sale_items_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sales 
    SET items_count = (
        SELECT COUNT(*) 
        FROM sale_items 
        WHERE sale_id = NEW.sale_id
    )
    WHERE id = NEW.sale_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update items_count
DROP TRIGGER IF EXISTS trigger_update_sale_items_count ON sale_items;
CREATE TRIGGER trigger_update_sale_items_count
AFTER INSERT OR UPDATE OR DELETE ON sale_items
FOR EACH ROW EXECUTE FUNCTION update_sale_items_count();

-- Insert sample sales data for testing if table is empty
DO $$
DECLARE
    sales_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO sales_count FROM sales;
    
    IF sales_count = 0 THEN
        -- Insert sample sales
        INSERT INTO sales (
            sale_number, 
            status, 
            payment_status, 
            subtotal, 
            tax_amount, 
            discount_amount, 
            total, 
            payment_method, 
            amount_paid, 
            change_given,
            amount_received,
            payment_change,
            items_count,
            sale_date,
            created_at,
            updated_at
        ) VALUES 
        (
            'SALE-20260224-005081', 
            'completed', 
            'paid', 
            1800.00, 
            288.00, 
            0.00, 
            2088.00, 
            'EFECTIVO', 
            2100.00, 
            12.00,
            2100.00,
            12.00,
            1,
            '2026-02-23T22:23:00Z',
            NOW(),
            NOW()
        );

        -- Get the last inserted sale id
        INSERT INTO sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            discount_percent,
            discount_amount,
            subtotal,
            tax_amount,
            total,
            status,
            created_at
        )
        SELECT 
            id,
            (SELECT id FROM products LIMIT 1),
            1,
            1800.00,
            0.00,
            0.00,
            1800.00,
            288.00,
            2088.00,
            'completed',
            NOW()
        FROM sales 
        WHERE sale_number = 'SALE-20260224-005081'
        LIMIT 1;
    END IF;
END $$;

-- Grant necessary permissions (adjust as needed for your setup)
GRANT ALL ON sales TO authenticated;
GRANT ALL ON sale_items TO authenticated;
GRANT ALL ON sales TO service_role;
GRANT ALL ON sale_items TO service_role;

-- Final message
SELECT 'Migration 08_ticket_support completed successfully' AS result;
