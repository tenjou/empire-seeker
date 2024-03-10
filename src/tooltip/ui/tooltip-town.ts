import { Town } from "../../entities/town"
import { getState } from "../../state"
import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "flex column font-smaller color-gray"
template.innerHTML = html`
    <div class="flex">
        faction:
        <div id="faction" class="ml-2 color-white"></div>
    </div>
`

export class TooltipTownElement extends HTMLComponent {
    constructor() {
        super(template)
    }

    update(town: Town) {
        const { factions } = getState()

        const faction = factions[town.factionId]

        this.setText("#faction", faction.name)
    }
}

customElements.define("tooltip-town", TooltipTownElement)
