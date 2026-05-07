import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockEq,
  mockSingle,
  mockInsert,
  mockUpdateEq,
  mockUpdate,
  mockSelect,
  mockFrom,
} = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockInsert = vi.fn().mockResolvedValue({ error: null })
  const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })
  const mockEq = vi.fn()
  const mockSelect = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) })
  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  })
  return { mockEq, mockSingle, mockInsert, mockUpdateEq, mockUpdate, mockSelect, mockFrom }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom })
}))

import { processActivityCells } from './conquest'

describe('processActivityCells', () => {
  beforeEach(() => vi.clearAllMocks())

  it('boş hücreyi claimed olarak sayar', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    const result = await processActivityCells('act1', 'club1', ['cell1'])
    expect(result.claimed).toBe(1)
    expect(result.conquered).toBe(0)
  })

  it('aynı kulüp hücresini reinforced sayar', async () => {
    mockSingle.mockResolvedValue({
      data: { cell_id: 'cell1', club_id: 'club1', defense_score: 2 }, error: null
    })
    const result = await processActivityCells('act1', 'club1', ['cell1'])
    expect(result.reinforced).toBe(1)
  })

  it('düşman hücresini defense 1 ise conquered sayar', async () => {
    mockSingle.mockResolvedValue({
      data: { cell_id: 'cell1', club_id: 'club2', defense_score: 1 }, error: null
    })
    const result = await processActivityCells('act1', 'club1', ['cell1'])
    expect(result.conquered).toBe(1)
  })

  it('düşman hücresini defense > 1 ise weakened sayar', async () => {
    mockSingle.mockResolvedValue({
      data: { cell_id: 'cell1', club_id: 'club2', defense_score: 3 }, error: null
    })
    const result = await processActivityCells('act1', 'club1', ['cell1'])
    expect(result.weakened).toBe(1)
    expect(result.conquered).toBe(0)
  })
})
