import { getState } from "../state"
import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "absolute right top p-2 flex bg-light border-bottom-left-radius z-top"
template.innerHTML = html`
    <div class="flex width-100px">
        <img class="mr-1" src="/icons/gold.png" />
        <div id="gold" class="bold">0</div>
    </div>
    <div id="coords" class="width-60px text-right bold">0, 0</div>
`

export class InfoView extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        this.updateFaction()
    }

    updateFaction() {
        const { factions } = getState()

        const faction = factions[0]

        this.setText("#gold", faction.gold)
    }

    updateCoords(x: number, y: number) {
        this.setText("#coords", `${x}, ${y}`)
    }
}

customElements.define("info-view", InfoView)
