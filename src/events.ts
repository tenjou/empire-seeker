export type EventId = "town-inventory"

type CallbackFunc = () => void

export const EventWatcher: Record<EventId, CallbackFunc | null> = {
    "town-inventory": null,
}

export function subscribe(eventId: EventId, cb: CallbackFunc | null) {
    if (EventWatcher[eventId]) {
        console.warn(`There is already an active watcher for event: ${eventId}`)
    }

    EventWatcher[eventId] = cb
}

export function emit(eventId: EventId) {
    const cb = EventWatcher[eventId]
    if (cb) {
        cb()
    }
}
