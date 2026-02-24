'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, ClipboardCheck, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ApprovalRequest } from '@/types/database'

// Fallback mock data for demo/offline mode
const mockApprovals: ApprovalRequest[] = [
  {
    id: '1',
    record_type: 'sales',
    record_id: '1',
    status: 'pending',
    current_level: 1,
    max_level: 1,
    requested_by: '1',
    requested_at: '2024-01-17T10:00:00Z',
    reason: 'Discount request for bulk purchase',
    previous_value: { discount: 0 },
    new_value: { discount: 0.15 },
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
  {
    id: '2',
    record_type: 'inventory_movements',
    record_id: '2',
    status: 'pending',
    current_level: 1,
    max_level: 1,
    requested_by: '2',
    requested_at: '2024-01-17T09:00:00Z',
    reason: 'Inventory adjustment due to damage',
    previous_value: { quantity: 10 },
    new_value: { quantity: 5 },
    created_at: '2024-01-17T09:00:00Z',
    updated_at: '2024-01-17T09:00:00Z',
  },
  {
    id: '3',
    record_type: 'sales',
    record_id: '3',
    status: 'approved',
    current_level: 1,
    max_level: 1,
    requested_by: '3',
    requested_at: '2024-01-16T14:00:00Z',
    reason: 'Price override for loyal customer',
    previous_value: { price: 25000 },
    new_value: { price: 22000 },
    resolved_by: '1',
    resolved_at: '2024-01-16T15:00:00Z',
    resolution_notes: 'Approved',
    created_at: '2024-01-16T14:00:00Z',
    updated_at: '2024-01-16T15:00:00Z',
  },
]

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApprovals() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('approval_requests')
          .select('*')
          .order('requested_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching approvals from Supabase:', error)
          setApprovals(mockApprovals)
        } else if (data && data.length > 0) {
          setApprovals(data as ApprovalRequest[])
        } else {
          console.log('No approvals found in Supabase, using demo data')
          setApprovals(mockApprovals)
        }
      } catch (err) {
        console.error('Exception fetching approvals:', err)
        setApprovals(mockApprovals)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [])

  const pendingApprovals = approvals.filter(a => a.status === 'pending')
  const processedApprovals = approvals.filter(a => a.status !== 'pending')

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500">Manage approval requests</p>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando aprobaciones desde Supabase...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Pending Approvals */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Pending ({pendingApprovals.length})
            </h2>
            <div className="grid gap-4">
              {pendingApprovals.map((approval) => (
                <Card key={approval.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[approval.status]}`}>
                            {approval.status}
                          </span>
                        </div>
                        <h3 className="font-medium capitalize">{approval.record_type} Request</h3>
                        <p className="text-sm text-gray-500 mt-1">{approval.reason}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested: {formatDateTime(approval.requested_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingApprovals.length === 0 && (
                <p className="text-gray-500 text-center py-8">No pending approvals</p>
              )}
            </div>
          </div>

          {/* Processed Approvals */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Processed
            </h2>
            <Card>
              <CardContent className="p-4">
                {processedApprovals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Type</th>
                          <th className="text-left py-2 px-4 font-medium">Status</th>
                          <th className="text-left py-2 px-4 font-medium">Reason</th>
                          <th className="text-left py-2 px-4 font-medium">Requested</th>
                          <th className="text-left py-2 px-4 font-medium">Resolved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedApprovals.map((approval) => (
                          <tr key={approval.id} className="border-b">
                            <td className="py-2 px-4 capitalize">{approval.record_type}</td>
                            <td className="py-2 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[approval.status]}`}>
                                {approval.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">{approval.reason}</td>
                            <td className="py-2 px-4 text-sm">{formatDateTime(approval.requested_at)}</td>
                            <td className="py-2 px-4 text-sm">{approval.resolved_at ? formatDateTime(approval.resolved_at) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No processed approvals</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
