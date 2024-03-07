import { EmptyEntity, EntityType, subscribe } from "../entities/entity"
import { getState } from "../state"
import { HTMLComponent } from "./dom"

const template = document.createElement("template")
template.className = "absolute px-2 py-1 center bottom mb-2 bg-black-blended border-radius color-white font-smaller"
template.innerHTML = html``

export class ActionView extends HTMLComponent {
    constructor() {
        super(template)
    }

    connectedCallback(): void {
        super.connectedCallback()

        const { player } = getState()

        subscribe(player, EmptyEntity, () => this.update())

        this.update()
    }

    update() {
        const { player } = getState()
        const { ai } = player

        if (ai.state === "move-to-target" && player.target) {
            this.setText("", `${ai.state}: ${EntityType[player.target.type]}`)
        } else {
            this.setText("", ai.state)
        }
    }
}

customElements.define("action-view", ActionView)
