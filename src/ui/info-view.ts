import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "absolute right top m-2"
template.innerHTML = html`
    <div id="coords">0, 0</div>
`

export class InfoView extends HTMLComponent {
    constructor() {
        super(template)
    }

    updateCoords(x: number, y: number) {
        this.setText("#coords", `${x}, ${y}`)
    }
}

customElements.define("info-view", InfoView)
