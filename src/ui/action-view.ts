import { EntityType, getEntityTypeAt } from "../entities/entity"
import { getSelectedHero } from "../hero/hero-controller"
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

        this.update()
    }

    update() {
        const hero = getSelectedHero()

        if (hero.state === "move-to-target") {
            const entityType = getEntityTypeAt(hero.targetGridX, hero.targetGridY)
            if (entityType) {
                this.setText("", `${hero.state}: ${EntityType[entityType]}`)
            } else {
                this.setText("", `${hero.state}: ${hero.targetGridX | 0}, ${hero.targetGridY | 0}`)
            }
        } else {
            this.setText("", hero.state)
        }
    }
}

customElements.define("action-view", ActionView)
