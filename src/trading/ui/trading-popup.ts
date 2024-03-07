import { HTMLComponent } from "../../ui/dom"

const template = document.createElement("template")
template.className = "popup color-gray"
template.innerHTML = html`
    <div class="font-small bold">Trading</div>
    <div class="mb-1 pb-1 border-bottom"></div>
`

export class TradingPopup extends HTMLComponent {
    constructor() {
        super(template)
    }
}

customElements.define("trading-popup", TradingPopup)
