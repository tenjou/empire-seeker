import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "absolute right top m-2"
template.innerHTML = html`
    <button class="button">Build</button>
`

export class CommandsView extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        this.getElement("button").onclick = (event) => {
            event.preventDefault()
            event.stopPropagation()
        }

        this.update()
    }

    update() {}
}

customElements.define("commands-view", CommandsView)
