'use client'

import { create } from 'zustand'
import { DashboardSummary, mockDashboardSummary } from './types'

interface DashboardState {
  summary: DashboardSummary
  isLoading: boolean
  error: string | null
  timeRange: 'today' | 'week' | 'month'
  setTimeRange: (range: 'today' | 'week' | 'month') => void
  fetchSummary: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: mockDashboardSummary,
  isLoading: false,
  error: null,
  timeRange: 'today',

  setTimeRange: (timeRange) => {
    set({ timeRange })
  },

  fetchSummary: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement real API call to /api/dashboard/summary
      // For now, use mock data
      // const response = await fetch(`/api/dashboard/summary?range=${get().timeRange}`)
      // const data = await response.json()
      // set({ summary: data, isLoading: false })
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ summary: mockDashboardSummary, isLoading: false })
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      set({ 
        summary: mockDashboardSummary, 
        isLoading: false, 
        error: 'Error al cargar los datos del dashboard' 
      })
    }
  },
}))
