type PopupCallback = () => void

interface Popup {
    element: HTMLElement
    callback: PopupCallback | null
}

let popupsElement: HTMLElement = {} as HTMLElement
let popups: Popup[] = []

function stopPropagation(event: MouseEvent) {
    event.stopPropagation()
}

export function loadPopups() {
    popupsElement = document.getElementById("popups")!
    popupsElement.onmousedown = stopPropagation
    popupsElement.onmouseup = stopPropagation
    popupsElement.onmousemove = stopPropagation
    popupsElement.onclick = (event) => {
        event.stopPropagation()
        closeLastPopup()
    }

    window.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "Escape":
                closeLastPopup()
                break
        }
    })
}

export function openPopup(tag: string, callback: PopupCallback | null = null) {
    const popupsElement = document.getElementById("popups")!
    if (popupsElement.children.length === 0) {
        popupsElement.classList.remove("hide")
    } else {
        popupsElement.removeChild(popupsElement.children[0])
    }

    const popupElement = document.createElement(tag)
    popupElement.onclick = stopPropagation
    popupsElement.appendChild(popupElement)
    popups.push({
        element: popupElement,
        callback,
    })
}

export function closeLastPopup() {
    if (!popups.length) {
        console.error(`No popups opened`)
        return
    }

    const lastPopup = popups.pop()!
    popupsElement.removeChild(lastPopup.element)
    if (lastPopup.callback) {
        lastPopup.callback()
    }

    if (popups.length) {
        const prevPopup = popups[popups.length - 1]
        popupsElement.appendChild(prevPopup.element)
    } else {
        popupsElement.classList.add("hide")
    }
}
