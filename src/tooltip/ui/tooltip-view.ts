import { EntityType } from "../../entities/entity"
import { HTMLComponent } from "../../ui/dom"
import "./tooltip-resource"
import { TooltipResourceElement } from "./tooltip-resource"
import "./tooltip-town"
import { TooltipTownElement } from "./tooltip-town"

const template = document.createElement("template")
template.className = "absolute top left p-2 m-2 width-160px bg-black-blended border-radius color-white hide"
template.innerHTML = html`
    <div id="name" class="bold"></div>
    <div class="mb-1 pb-1 border-bottom"></div>
    <div id="content"></div>
`

export class TooltipView extends HTMLComponent {
    constructor() {
        super(template)
    }

    update() {
        // if (this.currEntity.type !== entity.type) {
        //     this.updateContentElement(entity)
        //     this.setText("#name", EntityType[entity.type])
        // }
        // this.currEntity = entity
        // this.updateContent()
    }

    updateContent() {
        const content = this.getElement("#content")

        // switch (this.currEntity.type) {
        //     case EntityType.Resource: {
        //         ;(content.children[0] as TooltipResourceElement).update(this.currEntity as Resource)
        //         break
        //     }

        //     case EntityType.Town: {
        //         ;(content.children[0] as TooltipTownElement).update(this.currEntity as Town)
        //         break
        //     }

        // }
    }

    updateContentElement(entity: EntityOld) {
        const content = this.getElement("#content")
        if (content.children.length) {
            content.removeChild(content.children[0])
        }

        switch (entity.type) {
            case EntityType.Resource: {
                const tooltipResource = new TooltipResourceElement()
                content.appendChild(tooltipResource)
                break
            }

            case EntityType.Town: {
                const tooltipTown = new TooltipTownElement()
                content.appendChild(tooltipTown)
                break
            }
        }
    }
}

customElements.define("tooltip-view", TooltipView)
