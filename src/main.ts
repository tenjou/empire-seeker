import { loadTexture } from "./assets/texture"
import { updateResourceSpawns } from "./ecology"
import { addTown, updateTowns } from "./entities/town"
import { createFaction } from "./factions/factions"
import { createHero, updateHeroes } from "./hero/hero"
import { selectHero } from "./hero/hero-controller"
import { loadInput } from "./input"
import { MapHeight, MapSize, MapWidth } from "./map"
import { loadRenderer, render } from "./renderer"
import { getState, loadState } from "./state"
import "./style.css"
import "./trading/ui/trading-popup"
import { App, Camera } from "./types"
import "./ui/action-view"
import "./ui/commands-view"
import "./ui/info-view"
import "./ui/inventory-view"
import "./ui/settlement-popup"
import { loadUI } from "./ui/ui"

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

    const player = createHero(42, 38, 0, "idle")
    player.job = {
        type: "controlled",
    }
    selectHero(player)

    loadUI()

    tPrev = Date.now()
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
