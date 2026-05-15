// Module-level live run route store, shared between useLiveRun and TerritoryMap

type Coord = [number, number] // [lng, lat]
type State = { active: boolean; coords: Coord[] }
type Listener = (s: State) => void

let state: State = { active: false, coords: [] }
const listeners = new Set<Listener>()
const emit = () => listeners.forEach(l => l(state))

export const runRoute = {
  start() { state = { active: true,  coords: [] };          emit() },
  stop()  { state = { active: false, coords: state.coords };  emit() },
  clear() { state = { active: false, coords: [] };          emit() },
  add(lng: number, lat: number) {
    if (!state.active) return
    state.coords.push([lng, lat])
    emit()
  },
  subscribe(l: Listener) {
    listeners.add(l)
    l(state)
    return () => { listeners.delete(l) }
  },
  current(): State { return state },
}
