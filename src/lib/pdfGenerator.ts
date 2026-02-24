import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const esLocale = es

function formatDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: esLocale })
}

function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: esLocale })
}

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(num)
}

interface ReportData {
  title: string
  subtitle?: string
  headers: string[]
  rows: (string | number)[][]
  totals?: (string | number)[]
  filename: string
}

export function generatePDFReport(data: ReportData): void {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Por favor permita ventanas emergentes para generar el PDF')
    return
  }

  const currentDate = formatDate(new Date())
  const currentTime = format(new Date(), 'HH:mm')

  // Build totals row if provided
  let totalsRow = ''
  if (data.totals && data.totals.length > 0) {
    totalsRow = `
      <tr class="totals-row">
        ${data.totals.map((t, i) => {
          if (i === 0) return `<td class="total-cell"><strong>Total:</strong></td>`
          if (typeof t === 'number') return `<td class="total-cell"><strong>${formatCurrency(t)}</strong></td>`
          return `<td></td>`
        }).join('')}
      </tr>
    `
  }

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title} - ERP STILA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 10px; color: #333; padding: 15px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #1a1a2e; }
    .company-info { display: flex; flex-direction: column; }
    .company-name { font-size: 22px; font-weight: bold; color: #1a1a2e; }
    .company-tagline { font-size: 9px; color: #666; }
    .report-info { text-align: right; }
    .report-title { font-size: 16px; font-weight: bold; color: #1a1a2e; }
    .report-subtitle { font-size: 10px; color: #666; }
    .report-date { font-size: 9px; color: #888; }
    .meta-info { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px; background-color: #f8f9fa; border-radius: 4px; font-size: 9px; }
    .meta-label { font-weight: bold; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background-color: #1a1a2e; color: white; padding: 8px 6px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 9px; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    .totals-row { background-color: #1a1a2e !important; color: white; }
    .totals-row td { border-bottom: none; padding: 8px 6px; }
    .total-cell { text-align: right; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 8px; color: #888; }
    @page { size: A4; margin: 1cm; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">ERP STILA</div>
      <div class="company-tagline">Sistema de Gestión Empresarial</div>
    </div>
    <div class="report-info">
      <div class="report-title">${data.title}</div>
      ${data.subtitle ? `<div class="report-subtitle">${data.subtitle}</div>` : ''}
      <div class="report-date">Generado: ${currentDate} a las ${currentTime}</div>
    </div>
  </div>
  
  <div class="meta-info">
    <span><span class="meta-label">Fecha:</span> ${currentDate}</span>
    <span><span class="meta-label">Registros:</span> ${data.rows.length}</span>
    <span><span class="meta-label">Sistema:</span> ERP STILA v1.0</span>
  </div>
  
  <table>
    <thead>
      <tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      ${totalsRow}
    </tbody>
  </table>
  
  <div class="footer">
    <span>ERP STILA - Sistema de Gestión Empresarial</span>
    <span>Página 1</span>
  </div>
</body>
</html>`

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 500)
}

// Format currency helper
function fmtCurr(value: number): string {
  return formatCurrency(value)
}

export function getSalesSummaryPDF(sales: any[]): ReportData {
  const total = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  return {
    title: 'Resumen de Ventas',
    subtitle: 'Reporte general de ventas del período',
    headers: ['Folio', 'Fecha', 'Estado', 'Estado Pago', 'Total', 'Método'],
    rows: sales.map(s => [
      s.sale_number,
      formatDateShort(new Date(s.sale_date)),
      s.status,
      s.payment_status,
      fmtCurr(s.total),
      s.payment_method || 'Efectivo'
    ]),
    totals: ['', '', '', '', total, ''],
    filename: 'resumen_ventas'
  }
}

export function getSalesByCustomerPDF(sales: any[]): ReportData {
  const total = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  return {
    title: 'Ventas por Cliente',
    subtitle: 'Análisis de ventas por cliente',
    headers: ['ID Cliente', 'Folio', 'Fecha', 'Total', 'Estado'],
    rows: sales.map(s => [
      `Cliente #${s.customer_id}`,
      s.sale_number,
      formatDateShort(new Date(s.sale_date)),
      fmtCurr(s.total),
      s.status
    ]),
    totals: ['', '', '', total, ''],
    filename: 'ventas_por_cliente'
  }
}

export function getInventoryStatusPDF(products: any[]): ReportData {
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
  return {
    title: 'Estado de Inventario',
    subtitle: 'Stock actual de productos',
    headers: ['SKU', 'Producto', 'Stock', 'Precio', 'Costo', 'Valor Total'],
    rows: products.map(p => [
      p.sku || '',
      p.name,
      String(p.stock || 0),
      fmtCurr(p.base_price || 0),
      fmtCurr(p.cost_price || 0),
      fmtCurr((p.stock || 0) * (p.cost_price || 0))
    ]),
    totals: ['', '', '', '', 'Total:', totalValue],
    filename: 'estado_inventario'
  }
}

export function getLowStockPDF(products: any[]): ReportData {
  const lowStock = products.filter(p => (p.stock || 0) < 10)
  return {
    title: 'Reporte de Stock Bajo',
    subtitle: 'Productos con stock menor a 10 unidades',
    headers: ['SKU', 'Producto', 'Stock Actual', 'Stock Mínimo', 'Precio'],
    rows: lowStock.map(p => [
      p.sku || '',
      p.name,
      String(p.stock || 0),
      '10',
      fmtCurr(p.base_price || 0)
    ]),
    filename: 'stock_bajo'
  }
}

export function getInventoryValuationPDF(products: any[]): ReportData {
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
  return {
    title: 'Valoración de Inventario',
    subtitle: 'Valor total del inventario',
    headers: ['Producto', 'Categoría', 'Stock', 'Costo Unit.', 'Valor Total'],
    rows: products.map(p => [
      p.name,
      p.category_id || 'Sin categoría',
      String(p.stock || 0),
      fmtCurr(p.cost_price || 0),
      fmtCurr((p.stock || 0) * (p.cost_price || 0))
    ]),
    totals: ['', '', '', 'Total:', totalValue],
    filename: 'valoracion_inventario'
  }
}

export function getCommissionReportPDF(sales: any[]): ReportData {
  const completedSales = sales.filter(s => s.status === 'completed')
  const totalSales = completedSales.reduce((sum, s) => sum + (s.total || 0), 0)
  const commission = totalSales * 0.05
  return {
    title: 'Reporte de Comisiones',
    subtitle: 'Comisiones de ventas (5%)',
    headers: ['Folio', 'Fecha', 'Venta Total', 'Comisión (5%)'],
    rows: completedSales.map(s => [
      s.sale_number,
      formatDateShort(new Date(s.sale_date)),
      fmtCurr(s.total),
      fmtCurr((s.total || 0) * 0.05)
    ]),
    totals: ['', '', totalSales, commission],
    filename: 'reporte_comisiones'
  }
}

export function getAccountsReceivablePDF(sales: any[]): ReportData {
  const pending = sales.filter(s => s.payment_status === 'pending')
  const totalPending = pending.reduce((sum, s) => sum + (s.total || 0), 0)
  return {
    title: 'Cuentas por Cobrar',
    subtitle: 'Pagos pendientes',
    headers: ['Folio', 'Cliente', 'Fecha', 'Total', 'Estado'],
    rows: pending.map(s => [
      s.sale_number,
      `Cliente #${s.customer_id}`,
      formatDateShort(new Date(s.sale_date)),
      fmtCurr(s.total),
      s.payment_status
    ]),
    totals: ['', '', '', totalPending, ''],
    filename: 'cuentas_por_cobrar'
  }
}

export function getProfitLossPDF(sales: any[], products: any[]): ReportData {
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0)
  const totalCost = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
  const grossProfit = totalRevenue - totalCost
  return {
    title: 'Estado de Resultados',
    subtitle: 'Reporte de ganancias y pérdidas',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Ingresos por Ventas', totalRevenue],
      ['Costo de Inventario', totalCost],
      ['Ganancia Bruta', grossProfit]
    ],
    filename: 'estado_resultados'
  }
}
