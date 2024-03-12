export type EventId = "town-inventory"

type CallbackFunc = () => void

export const EventWatcher: Record<EventId, CallbackFunc | null> = {
    "town-inventory": null,
}

export function watch(eventId: EventId, cb: CallbackFunc) {
    if (EventWatcher[eventId]) {
        console.warn(`There is already an active watcher for event: ${eventId}`)
    }

    EventWatcher[eventId] = cb
}

export function unwatch(eventId: EventId) {
    EventWatcher[eventId] = null
}

export function emit(eventId: EventId) {
    const cb = EventWatcher[eventId]
    if (cb) {
        cb()
    }
}
