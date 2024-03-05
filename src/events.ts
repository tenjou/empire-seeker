export type EventType = "inventory-updated" | "state-updated"

export type EventCallbackFunc = (payload: any, amount: number) => void

export interface EventCallbackInfo {
    type: EventType
    callback: EventCallbackFunc
}

const ignoredEvents: Partial<Record<EventType, boolean>> = {}
const subscribers: Partial<Record<EventType, EventCallbackFunc[]>> = {}
let subscriberWatcher: ((info: EventCallbackInfo) => void) | null = null

export const subscribeApp = (type: EventType, callback: EventCallbackFunc): EventCallbackFunc => {
    const funcs = subscribers[type]
    if (funcs) {
        funcs.push(callback as EventCallbackFunc)
    } else {
        subscribers[type] = [callback as EventCallbackFunc]
    }

    if (subscriberWatcher) {
        subscriberWatcher({ type, callback })
    }

    return callback
}

export const unsubscribeApp = (type: EventType, callback: EventCallbackFunc) => {
    const funcs = subscribers[type]
    if (!funcs) {
        return
    }

    const index = funcs.indexOf(callback as EventCallbackFunc)
    if (index === -1) {
        return
    }

    funcs[index] = funcs[funcs.length - 1]
    funcs.pop()
}

export const emitApp = (type: EventType, payload: unknown = undefined, amount: number = 0) => {
    if (!ignoredEvents[type]) {
        console.log(type, "->", payload, amount)
    }

    const funcs = subscribers[type]
    if (!funcs || !funcs.length) {
        return
    }

    for (const listener of funcs) {
        listener(payload, amount)
    }
}

export const watchSubscribers = (func: (info: EventCallbackInfo) => void | null) => {
    subscriberWatcher = func
}
