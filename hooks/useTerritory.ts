'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CellDisplay } from '@/lib/h3/utils'

export function useTerritory() {
  const [cells, setCells] = useState<CellDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCells = useCallback(async () => {
    const res = await fetch('/api/territory')
    const { cells: raw } = await res.json()
    setCells((raw ?? []).map((c: any) => ({
      cellId: c.cell_id,
      color: c.clubs?.color ?? '#6B7280',
      clubName: c.clubs?.name ?? 'Sahipsiz',
      defenseScore: c.defense_score
    })))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCells()

    const channel = supabase
      .channel('territory_changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'territory_cells'
      }, fetchCells)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchCells])

  return { cells, loading }
}
