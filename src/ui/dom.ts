import { EventCallbackFunc, EventCallbackInfo, EventType, subscribeApp, unsubscribeApp } from "../events"

export function getElementById(id: string, parent?: Element) {
    const element = parent ? parent.querySelector(`#${id}`) : document.getElementById(id)
    if (!element) {
        console.error(`Could get element with id: "${id}"`)
        return document.createElement("div")
    }

    return element as HTMLElement
}

export function getElement<T extends HTMLElement>(query: string) {
    const element = document.querySelector(query)
    if (!element) {
        console.error(`Could get element: "${query}"`)
        return document.createElement("div") as unknown as T
    }

    return element as T
}

export function removeElement(id: string) {
    const element = document.getElementById(id)
    if (!element) {
        console.error(`Could get element: "${id}"`)
        return
    }

    element.remove()
}

export function removeAllChildren(param: string | HTMLElement) {
    let element: HTMLElement | null

    if (typeof param === "string") {
        element = document.getElementById(param)
        if (!element) {
            console.error(`Could get element: "${param}"`)
            return
        }
    } else {
        element = param
    }

    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

export function addChild(id: string, child: HTMLElement) {
    const element = document.getElementById(id)
    if (!element) {
        console.error(`Could get element: "${id}"`)
        return
    }

    element.appendChild(child)
}

export function setText(id: string, text: string | number, parent?: Element) {
    const element = (parent ? parent.querySelector(`#${id}`) : document.getElementById(id)) as HTMLElement
    if (!element) {
        console.error(`Could set element: "${id}" text to: ${text}`)
        return
    }

    element.innerText = String(text)
}

export function setHTML(id: string, text: string) {
    const element = document.getElementById(id)
    if (!element) {
        console.error(`Could set element: "${id}" text to: ${text}`)
        return
    }

    element.innerHTML = text
}

export function setOnClick(id: string, func: () => void) {
    const element = document.getElementById(id)
    if (!element) {
        console.error(`Could set element: "${id}" onclick`)
        return
    }

    element.onclick = func
}

export function toggleClassName(id: string, className: string, add: boolean, parent: HTMLElement | null = null) {
    const element = parent ? parent.querySelector(`#${id}`) : document.getElementById(id)
    if (!element) {
        return
    }

    if (add) {
        element.classList.add(className)
    } else {
        element.classList.remove(className)
    }
}

export function setShow(id: string, show: boolean) {
    const element = document.getElementById(id)
    if (!element) {
        console.error(`Could set element: "${id}" to set show: ${show}`)
        return
    }

    if (show) {
        element.classList.remove("hide")
    } else {
        element.classList.add("hide")
    }
}

export const scrollBottom = (element: HTMLElement) => {
    element.scrollTo(0, element.scrollHeight)
}

export class HTMLComponent extends HTMLElement {
    root: HTMLElement
    rootClasses: string
    subscribers?: EventCallbackInfo[]
    timer?: number
    timeout?: number

    constructor(template?: HTMLTemplateElement) {
        super()

        if (template) {
            this.root = template.content.cloneNode(true) as HTMLElement
            this.rootClasses = template.getAttribute("class") || ""
        } else {
            this.root = document.createElement("div")
            this.rootClasses = ""
        }
    }

    connectedCallback() {
        if (this.rootClasses) {
            const outerClasses = this.getAttribute("class")
            this.setAttribute("class", outerClasses ? this.rootClasses + " " + outerClasses : this.rootClasses)
        }

        if (this.root) {
            this.append(this.root)
        }
        this.root = this
    }

    disconnectedCallback() {
        if (this.subscribers) {
            for (const subscriber of this.subscribers) {
                unsubscribeApp(subscriber.type, subscriber.callback)
            }
            this.subscribers = undefined
        }

        if (this.timer) {
            clearInterval(this.timer)
        }
        if (this.timeout) {
            clearInterval(this.timeout)
        }
    }

    load(_arg?: unknown) {}

    query<T>(query: string) {
        const element = this.root.querySelector(query) as unknown as T
        if (!element) {
            console.error(`Could not find child element with query: ${query}`)
            return document.createElement("div") as unknown as T
        }

        return element
    }

    getElement<T extends HTMLComponent>(query: string, clear = false): T {
        if (!query) {
            return this as unknown as T
        }

        const element = this.root.querySelector(query) as unknown as T
        if (!element) {
            console.error(`Could not find child element with query: ${query}`)
            return document.createElement("div") as unknown as T
        }

        if (clear) {
            while (element.firstChild) {
                element.removeChild(element.firstChild)
            }
        }

        return element
    }

    setText(query: string, text: string | number | null) {
        this.getElement(query).innerText = String(text)
    }

    setHTML(query: string, text: string | number | null) {
        if (!text) {
            return
        }
        this.getElement(query).innerHTML = String(text)
    }

    getAttrib(key: string) {
        return this.getAttribute(key)
    }

    toggleCls(className: string, add: boolean, query: string = "") {
        if (add) {
            this.getElement(query).classList.add(className)
        } else {
            this.getElement(query).classList.remove(className)
        }
    }

    toggleClass(query: string, className: string, add: boolean) {
        if (add) {
            this.getElement(query).classList.add(className)
        } else {
            this.getElement(query).classList.remove(className)
        }
    }

    toggleClassName(query: string = "", className: string, add: boolean) {
        if (add) {
            this.getElement(query).classList.add(className)
        } else {
            this.getElement(query).classList.remove(className)
        }
    }

    toggleAttr(attr: string, add: boolean, query: string = "") {
        if (add) {
            this.getElement(query).setAttribute(attr, "")
        } else {
            this.getElement(query).removeAttribute(attr)
        }
    }

    haveAttribute(key: string) {
        return this.getAttribute(key) !== null
    }

    subscribe(type: EventType, callback: EventCallbackFunc) {
        if (!this.subscribers) {
            this.subscribers = []
        }

        subscribeApp(type, callback)

        this.subscribers.push({
            type,
            callback,
        })
    }

    setInterval(func: () => void, tInterval: number) {
        if (this.timer) {
            clearInterval(this.timer)
        }

        this.timer = setInterval(func, tInterval)
    }

    clearInterval() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    }

    setTimeout(func: () => void, tTimeout: number) {
        if (this.timer) {
            clearTimeout(this.timer)
        }

        this.timeout = setTimeout(func, tTimeout)
    }

    syncElementEntries(tagName: string, numCurr: number, container?: HTMLElement) {
        if (!container) {
            container = this
        }

        const entriesToAdd = numCurr - container.children.length
        const entriesToRemove = -entriesToAdd

        for (let n = 0; n < entriesToAdd; n += 1) {
            const element = document.createElement(tagName)
            container.appendChild(element)
        }

        for (let n = 0; n < entriesToRemove; n += 1) {
            container.removeChild(container.children[container.children.length - 1])
        }

        return container
    }

    syncElementEntriesEx(tagName: string, firstTagName: string, numCurr: number, container?: HTMLElement) {
        if (!container) {
            container = this
        }

        const entriesToAdd = numCurr - container.children.length
        const entriesToRemove = -entriesToAdd

        if (container.children.length === 0) {
            const element = document.createElement(firstTagName)
            container.appendChild(element)
        }

        for (let n = 0; n < entriesToAdd; n += 1) {
            const element = document.createElement(tagName)
            container.appendChild(element)
        }

        for (let n = 0; n < entriesToRemove; n += 1) {
            container.removeChild(container.children[container.children.length - 1])
        }

        return container
    }
}
