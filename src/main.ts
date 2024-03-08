import { EmptyTexture, Texture, loadTexture } from "./assets/texture"
import { Character, addCharacter, transitionAiState, updateCharacterAi } from "./entities/character"
import { Entity, EntityType, GridSize, MapSize, getEntityAt } from "./entities/entity"
import { addTown } from "./entities/town"
import { createVillage, updateVillages } from "./entities/village"
import { FactionType, createFaction } from "./factions/factions"
import { loadPopups } from "./popup"
import { updateResourceSpawns } from "./resources"
import { getState, loadState, updateState } from "./state"
import "./style.css"
import { loadTooltip, showEntityTooltip as updateEntityTooltip } from "./tooltip/tooltip"
import "./trading/ui/trading-popup"
import "./ui/action-view"
import { ActionView } from "./ui/action-view"
import "./ui/commands-view"
import { getElement } from "./ui/dom"
import "./ui/info-view"
import { InfoView } from "./ui/info-view"
import "./ui/inventory-view"
import { InventoryView } from "./ui/inventory-view"
import "./ui/settlement-popup"

interface Camera {
    x: number
    y: number
}

interface Context {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    mapWidth: number
    mapHeight: number
    camera: Camera
}

const app: Context = {
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
    width: 0,
    height: 0,
    mapWidth: 0,
    mapHeight: 0,
    camera: {
        x: 0,
        y: 0,
    },
}

let tPrev = 0
let player: Character = {} as Character
let hoverEntity: Entity | null = null
let isHolding = false
let isDragging = false
let draggingAccumulator = 0

const targetEntity: Entity = {
    id: 0,
    isHidden: true,
    subscribers: [],
    texture: EmptyTexture,
    type: EntityType.Placeholder,
    x: 0,
    y: 0,
}

function setup() {
    const parent = document.getElementById("app")!

    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.width = parent.clientWidth
    canvas.height = parent.clientHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error(`Could not create CanvasRenderingContext2D`)
    }

    app.canvas = canvas
    app.ctx = ctx
    app.width = canvas.width
    app.height = canvas.height
    app.mapWidth = MapSize * GridSize
    app.mapHeight = MapSize * GridSize

    window.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            isHolding = true
        }
    })
    window.addEventListener("mouseup", (event) => {
        if (event.button === 0) {
            isHolding = false
        }

        if (isDragging && event.button === 0) {
            isDragging = false
            draggingAccumulator = 0
            return
        }

        const { player } = getState()

        const posX = event.clientX + app.camera.x
        const posY = event.clientY + app.camera.y
        const gridX = (posX / GridSize) | 0
        const gridY = (posY / GridSize) | 0

        const target = getEntityAt(gridX, gridY)
        if (target) {
            transitionAiState(player, "move-to-target", target)
        } else {
            targetEntity.x = gridX * GridSize
            targetEntity.y = gridY * GridSize
            transitionAiState(player, "move-to-target", targetEntity, true)
        }
    })
    window.addEventListener("mousemove", (event) => {
        if (isHolding) {
            const { camera, width, height, mapWidth, mapHeight } = app

            draggingAccumulator += Math.abs(event.movementX) + Math.abs(event.movementY)
            camera.x -= event.movementX
            camera.y -= event.movementY

            if (camera.x < 0) {
                camera.x = 0
            } else if (camera.x + width >= mapWidth) {
                camera.x = mapWidth - width
            }

            if (camera.y < 0) {
                camera.y = 0
            } else if (camera.y + height >= mapHeight) {
                camera.y = mapHeight - height
            }

            if (draggingAccumulator >= 5) {
                isDragging = true
                return
            }
        }

        const posX = event.clientX + app.camera.x
        const posY = event.clientY + app.camera.y
        const gridX = (posX / GridSize) | 0
        const gridY = (posY / GridSize) | 0

        getElement<InfoView>("info-view").updateCoords(gridX, gridY)

        hoverEntity = getEntityAt(gridX, gridY)
        updateEntityTooltip(hoverEntity)

        document.body.style.cursor = hoverEntity ? "pointer" : "auto"
    })
    window.addEventListener("resize", () => {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        app.width = canvas.width
        app.height = canvas.height
    })
}

function load() {
    loadState({
        player: {} as Character,
        entities: [],
        characters: [],
        entitiesMap: {},
        data: new Uint16Array(MapSize * MapSize),
        factions: {
            [FactionType.Neutral]: createFaction(FactionType.Neutral),
            [FactionType.Player]: createFaction(FactionType.Player),
            [FactionType.A]: createFaction(FactionType.A),
            [FactionType.B]: createFaction(FactionType.B),
        },
        ecology: {
            treesToSpawn: 200,
        },
        time: {
            curr: 0,
            villageUpdate: 0,
        },
    })

    loadTexture("faction-a", "/textures/faction-a.png")
    loadTexture("faction-b", "/textures/faction-b.png")
    loadTexture("player", "/textures/player.png")
    loadTexture("town", "/textures/town.png")
    loadTexture("village", "/textures/village.png")
    loadTexture("forest", "/textures/forest.png")

    addTown(44, 38, FactionType.A)
    addCharacter(16, 6, FactionType.A)
    addCharacter(36, 26, FactionType.A)
    createVillage(30, 30, FactionType.A)

    addTown(80, 92, FactionType.B)
    addCharacter(83, 94, FactionType.B)
    addCharacter(76, 88, FactionType.B)

    player = addCharacter(20, 20, FactionType.Player)

    updateState({
        player,
    })

    loadUI()

    tPrev = Date.now()
}

function loadUI() {
    const parent = document.getElementById("ui")!
    parent.appendChild(new InventoryView())
    parent.appendChild(new ActionView())

    loadTooltip()
    loadPopups()
}

function update() {
    const { time, characters } = getState()

    const tCurr = Date.now()
    const tDelta = tCurr - tPrev
    time.curr += tDelta

    updateResourceSpawns()
    updateVillages()

    for (const character of characters) {
        if (character.ai.state === "move-to-target") {
            const t = (time.curr - character.tActionStart) / (character.tActionEnd - character.tActionStart)
            if (t >= 1) {
                character.x = character.endX
                character.y = character.endY
            } else {
                character.x = character.startX + (character.endX - character.startX) * t
                character.y = character.startY + (character.endY - character.startY) * t
            }
        }

        updateCharacterAi(character, time.curr)
    }

    tPrev = tCurr
}

function render() {
    const { entities, characters } = getState()

    update()

    const { ctx } = app

    ctx.save()
    ctx.fillStyle = "#ddd"
    ctx.fillRect(0, 0, app.width, app.height)
    ctx.translate(-app.camera.x, -app.camera.y)

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 3
    ctx.strokeRect(0.5, 0.5, app.mapWidth, app.mapHeight)

    for (const entity of entities) {
        if (entity.isHidden) {
            continue
        }

        renderImg(entity.texture, entity.x, entity.y)
    }

    for (const character of characters) {
        if (character.isHidden) {
            continue
        }

        renderImg(character.texture, character.x, character.y)
    }

    if (!player.isHidden) {
        renderImg(player.texture, player.x, player.y)
    }

    if (hoverEntity) {
        const size = hoverEntity.type === EntityType.Town ? 2 : 1
        const startX = hoverEntity.x - 2
        const startY = hoverEntity.y - 2
        const endX = size * GridSize + 4
        const endY = size * GridSize + 4

        ctx.strokeStyle = "white"
        ctx.lineWidth = 2
        ctx.strokeRect(startX, startY, endX, endY)
    }

    ctx.restore()

    requestAnimationFrame(render)
}

function renderImg(texture: Texture, x: number, y: number) {
    app.ctx.drawImage(texture.img, x, y)
}

setup()
load()
render()

declare global {
    function html(str: TemplateStringsArray, ...values: unknown[]): string
}
