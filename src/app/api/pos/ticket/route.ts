import { NextRequest, NextResponse } from 'next/server'

interface TicketQueryParams {
  saleId: string
  saleNumber: string
  total: string
  paymentMethod: string
  amountReceived: string
  change: string
  items: string // JSON stringified
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const saleId = searchParams.get('saleId') || ''
    const saleNumber = searchParams.get('saleNumber') || ''
    const total = searchParams.get('total') || '0'
    const paymentMethod = searchParams.get('paymentMethod') || 'EFECTIVO'
    const amountReceived = searchParams.get('amountReceived') || '0'
    const change = searchParams.get('change') || '0'
    const itemsParam = searchParams.get('items') || '[]'
    
    let items = []
    try {
      items = JSON.parse(itemsParam)
    } catch {
      try {
        items = JSON.parse(decodeURIComponent(itemsParam))
      } catch {
        items = []
      }
    }

    // Calculate subtotal and tax from items
    let calculatedSubtotal = 0
    let calculatedTax = 0
    items.forEach((item: { total: number }) => {
      const itemSubtotal = item.total / 1.16
      calculatedSubtotal += itemSubtotal
      calculatedTax += (item.total - itemSubtotal)
    })

    // Use calculated values or fallback to passed values
    const finalSubtotal = calculatedSubtotal > 0 ? calculatedSubtotal : parseFloat(total) / 1.16
    const finalTax = calculatedTax > 0 ? calculatedTax : parseFloat(total) - (parseFloat(total) / 1.16)

    // Generate HTML ticket
    const html = generateTicketHTML({
      saleId,
      saleNumber,
      total,
      paymentMethod,
      amountReceived,
      change,
      items,
      subtotal: finalSubtotal,
      tax: finalTax,
    })

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating ticket:', error)
    return NextResponse.json(
      { error: 'Error generating ticket' },
      { status: 500 }
    )
  }
}

function generateTicketHTML(data: {
  saleId: string
  saleNumber: string
  total: string
  paymentMethod: string
  amountReceived: string
  change: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
}): string {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(num)
  }

  const formatDate = () => {
    return new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const paymentMethodLabels: Record<string, string> = {
    'EFECTIVO': 'Efectivo',
    'TARJETA_CREDITO': 'Tarjeta de Crédito',
    'TARJETA_DEBITO': 'Tarjeta de Débito',
    'TRANSFERENCIA': 'Transferencia',
    'QR': 'Pago con QR',
  }

  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px dashed #ccc;">
          ${item.name}
          <br><small style="color: #666;">${item.quantity} x ${formatCurrency(item.unitPrice)}</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px dashed #ccc; text-align: right;">
          ${formatCurrency(item.total)}
        </td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket - ${data.saleNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      max-width: 300px;
      margin: 0 auto;
      padding: 10px;
    }
    
    .ticket {
      border: 1px solid #000;
      padding: 15px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #000;
      padding-bottom: 10px;
    }
    
    .company-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .ticket-title {
      font-size: 14px;
      font-weight: bold;
    }
    
    .info {
      margin-bottom: 15px;
    }
    
    .info p {
      margin-bottom: 3px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    .totals {
      border-top: 1px solid #000;
      padding-top: 10px;
    }
    
    .totals .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .totals .total {
      font-size: 16px;
      font-weight: bold;
    }
    
    .payment-info {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px dashed #000;
    }
    
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #000;
      font-size: 10px;
    }
    
    .print-button {
      display: block;
      width: 100%;
      padding: 15px;
      background: #000;
      color: #fff;
      border: none;
      font-size: 16px;
      cursor: pointer;
      margin-top: 20px;
    }
    
    .print-button:hover {
      background: #333;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="company-name">ERP STILA</div>
      <div class="ticket-title">TICKET DE VENTA</div>
    </div>
    
    <div class="info">
      <p><strong>Folio:</strong> ${data.saleNumber}</p>
      <p><strong>Fecha:</strong> ${formatDate()}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #000;">Producto</th>
          <th style="padding: 8px; text-align: right; border-bottom: 2px solid #000;">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
    
    <div class="totals">
      <div class="row">
        <span>Subtotal:</span>
        <span>${formatCurrency(data.subtotal)}</span>
      </div>
      <div class="row">
        <span>IVA (16%):</span>
        <span>${formatCurrency(data.tax)}</span>
      </div>
      <div class="row total">
        <span>TOTAL:</span>
        <span>${formatCurrency(data.total)}</span>
      </div>
    </div>
    
    <div class="payment-info">
      <p><strong>Método de Pago:</strong> ${paymentMethodLabels[data.paymentMethod] || data.paymentMethod}</p>
      ${data.paymentMethod === 'EFECTIVO' ? `
        <p><strong>Recibido:</strong> ${formatCurrency(data.amountReceived)}</p>
        <p><strong>Cambio:</strong> ${formatCurrency(data.change)}</p>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>¡Gracias por su compra!</p>
      <p>Guarde este ticket para cualquier aclaración</p>
    </div>
  </div>
  
  <button class="print-button no-print" onclick="window.print()">
    IMPRIMIR TICKET
  </button>
  
  <button class="print-button no-print" onclick="window.close()" style="background: #666; margin-top: 10px;">
    CERRAR
  </button>
</body>
</html>
  `
}
