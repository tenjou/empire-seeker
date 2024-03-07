let popupsElement: HTMLElement = {} as HTMLElement

function stopPropagation(event: MouseEvent) {
    event.stopPropagation()
}

export function loadPopups() {
    popupsElement = document.getElementById("popups")!
    popupsElement.onmousedown = stopPropagation
    popupsElement.onmouseup = stopPropagation
    popupsElement.onclick = (event) => {
        event.stopPropagation()
        tryCloseCurrentPopup()
    }

    window.addEventListener("keyup", (event) => {
        switch (event.key) {
            case "Escape":
                tryCloseCurrentPopup()
                break
        }
    })
}

export function openPopup(tag: string) {
    const popupsElement = document.getElementById("popups")!

    const popup = document.createElement(tag)
    popup.onclick = stopPropagation
    popupsElement.appendChild(popup)

    if (popupsElement.children.length === 1) {
        popupsElement.classList.remove("hide")
    }
}

export function tryCloseCurrentPopup() {
    const popups = popupsElement.children
    if (popups.length <= 0) {
        return
    }

    const currPopup = popups[popups.length - 1]
    popupsElement.removeChild(currPopup)

    if (popups.length <= 0) {
        popupsElement.classList.add("hide")
    }
}
