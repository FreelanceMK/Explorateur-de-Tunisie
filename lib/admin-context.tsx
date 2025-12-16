"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Place } from './types'

interface AdminContextType {
  isAdminMode: boolean
  activateAdminMode: () => void
  deactivateAdminMode: () => void
  createPlace: (place: Omit<Place, 'position'>) => Promise<Place>
  updatePlace: (id: string, place: Partial<Place>) => Promise<Place>
  deletePlace: (id: string) => Promise<void>
  isEditModalOpen: boolean
  setIsEditModalOpen: (open: boolean) => void
  editingPlace: Place | null
  setEditingPlace: (place: Place | null) => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  refreshPlaces: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Load admin mode from localStorage on mount
  useEffect(() => {
    const adminMode = localStorage.getItem('adminMode')
    if (adminMode === 'true') {
      setIsAdminMode(true)
    }
  }, [])

  const activateAdminMode = () => {
    setIsAdminMode(true)
    localStorage.setItem('adminMode', 'true')
  }

  const deactivateAdminMode = () => {
    setIsAdminMode(false)
    localStorage.removeItem('adminMode')
  }

  const refreshPlaces = () => {
    setRefreshTrigger(prev => prev + 1)
    // Dispatch custom event for dashboard to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('refreshPlaces'))
    }
  }

  const createPlace = async (placeData: Omit<Place, 'position'>): Promise<Place> => {
    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...placeData,
          position: 0, // Will be updated later if needed
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create place')
      }

      const newPlace = await response.json()
      refreshPlaces()
      return newPlace
    } catch (error) {
      console.error('Error creating place:', error)
      throw error
    }
  }

  const updatePlace = async (id: string, placeData: Partial<Place>): Promise<Place> => {
    try {
      const response = await fetch(`/api/places/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(placeData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update place')
      }

      const updatedPlace = await response.json()
      refreshPlaces()
      return updatedPlace
    } catch (error) {
      console.error('Error updating place:', error)
      throw error
    }
  }

  const deletePlace = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/places/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete place')
      }

      refreshPlaces()
    } catch (error) {
      console.error('Error deleting place:', error)
      throw error
    }
  }

  return (
    <AdminContext.Provider
      value={{
        isAdminMode,
        activateAdminMode,
        deactivateAdminMode,
        createPlace,
        updatePlace,
        deletePlace,
        isEditModalOpen,
        setIsEditModalOpen,
        editingPlace,
        setEditingPlace,
        isAddModalOpen,
        setIsAddModalOpen,
        refreshPlaces,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
