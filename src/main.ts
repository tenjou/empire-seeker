import { loadTexture } from "./assets/texture"
import { updateResourceSpawns } from "./ecology"
import { addTown, updateTowns } from "./entities/town"
import { createFaction } from "./factions/factions"
import { updateHeroes } from "./hero/hero"
import { loadInput } from "./input"
import { MapHeight, MapSize, MapWidth } from "./map"
import { loadPopups } from "./popup"
import { loadRenderer, render } from "./renderer"
import { getState, loadState } from "./state"
import "./style.css"
import { loadTooltip } from "./tooltip/tooltip"
import "./trading/ui/trading-popup"
import { App, Camera } from "./types"
import "./ui/action-view"
import { ActionView } from "./ui/action-view"
import "./ui/commands-view"
import { getElement } from "./ui/dom"
import "./ui/info-view"
import { InfoView } from "./ui/info-view"
import "./ui/inventory-view"
import { InventoryView } from "./ui/inventory-view"
import "./ui/settlement-popup"

const app: App = {
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
    camera: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
}

let tPrev = 0

function setup() {
    const parent = document.getElementById("app")!

    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error(`Could not create CanvasRenderingContext2D`)
    }

    const camera: Camera = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
    }

    app.canvas = canvas
    app.ctx = ctx
    app.camera = camera

    window.addEventListener("resize", () => {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        camera.width = canvas.width
        camera.height = canvas.height
    })
}

function load() {
    loadInput(app)

    loadState({
        heroes: [],
        resources: [],
        resourcesToRespawn: [],
        towns: [],
        data: new Int32Array(MapSize * MapSize),
        factions: [],
        ecology: {
            treesToSpawn: 100,
        },
        time: {
            curr: 0,
            townUpdate: 0,
            villageUpdate: 0,
        },
    })

    loadTexture("faction-0", "/textures/faction-0.png")
    loadTexture("faction-1", "/textures/faction-1.png")
    loadTexture("faction-2", "/textures/faction-2.png")
    loadTexture("town", "/textures/town.png")
    loadTexture("village", "/textures/village.png")
    loadTexture("tree", "/textures/tree.png")

    loadRenderer()

    createFaction("Player")
    createFaction("A")
    createFaction("B")

    addTown(44, 38, 1)
    addTown(80, 92, 2)

    loadUI()

    tPrev = Date.now()
}

function loadUI() {
    const parent = document.getElementById("ui")!
    parent.appendChild(new InventoryView())
    parent.appendChild(new ActionView())

    loadTooltip()
    loadPopups()

    const infoView = getElement<InfoView>("info-view")
    infoView.updateFaction()
}

function update() {
    const { time } = getState()

    const tCurr = Date.now()
    const tDelta = tCurr - tPrev
    time.curr += tDelta

    updateHeroes(time.curr)
    updateResourceSpawns()
    updateTowns()

    tPrev = tCurr
}

function renderMain() {
    update()

    const { ctx } = app

    ctx.save()
    ctx.fillStyle = "#ddd"
    ctx.fillRect(0, 0, app.camera.width, app.camera.height)
    ctx.translate(-app.camera.x, -app.camera.y)

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 3
    ctx.strokeRect(0.5, 0.5, MapWidth, MapHeight)

    render(app)

    ctx.restore()

    requestAnimationFrame(renderMain)
}

setup()
load()
renderMain()

declare global {
    function html(str: TemplateStringsArray, ...values: unknown[]): string
}
