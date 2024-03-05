import { Texture, getTexture, loadTexture } from "./assets/texture"
import { transitionAiState, updateCharacterAi } from "./entities/character"
import { Character, Entity, EntityType, GridSize, MapSize, fillData, setMoveTo } from "./entities/entity"
import { updateResourceSpawns } from "./resources"
import { getState, updateState } from "./state"
import "./style.css"
import "./ui/action-view"
import { ActionView } from "./ui/action-view"
import "./ui/commands-view"
import "./ui/inventory-view"
import { InventoryView } from "./ui/inventory-view"

interface Context {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    width: number
    height: number
}

const app: Context = {
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
    width: 0,
    height: 0,
}

const characters: Character[] = []

let player: Character = {} as Character
let hoverEntity: Entity | null = null

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

    window.addEventListener("mousemove", (event) => {
        const gridX = (event.clientX / GridSize) | 0
        const gridY = (event.clientY / GridSize) | 0

        hoverEntity = getEntityAt(gridX, gridY)

        document.body.style.cursor = hoverEntity ? "pointer" : "auto"
    })
    window.addEventListener("click", (event) => {
        const { player } = getState()

        const gridX = (event.clientX / GridSize) | 0
        const gridY = (event.clientY / GridSize) | 0

        const target = getEntityAt(gridX, gridY)
        if (target) {
            transitionAiState(player, "move-to-target", target)
        } else {
            transitionAiState(player, "move-to-target")

            const targetX = gridX * GridSize
            const targetY = gridY * GridSize
            setMoveTo(player, targetX, targetY)
        }
    })
    window.addEventListener("resize", () => {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
        app.width = canvas.width
        app.height = canvas.height
    })
}

function addEntity(type: EntityType, texture: Texture, gridX: number, gridY: number, sizeX: number, sizeY: number) {
    const { entities } = getState()

    const entity: Entity = {
        id: entities.length + 1,
        texture,
        type,
        x: gridX * GridSize,
        y: gridY * GridSize,
        subscribers: [],
    }

    fillData(entity, gridX, gridY, sizeX, sizeY)
    entities.push(entity)
}

function addTown(gridX: number, gridY: number) {
    addEntity(EntityType.Town, getTexture("town"), gridX, gridY, 2, 2)
}

function addCharacter(gridX: number, gridY: number, isPlayer = false) {
    const character: Character = {
        id: characters.length + 1,
        type: isPlayer ? EntityType.Player : EntityType.Npc,
        texture: getTexture(isPlayer ? "player" : "character"),
        x: gridX * GridSize,
        y: gridY * GridSize,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        tActionStart: 0,
        tActionEnd: 0,
        speed: 100,
        target: null,
        state: "idle",
        subscribers: [],
        inventory: [],
        inventorySpace: 0,
    }

    characters.push(character)

    return character
}

function load() {
    updateState({
        entities: [],
        data: new Uint16Array(MapSize * MapSize),
        ecology: {
            treesToSpawn: 20,
        },
    })

    loadTexture("character", "/textures/character.png")
    loadTexture("player", "/textures/player.png")
    loadTexture("town", "/textures/town.png")
    loadTexture("forest", "/textures/forest.png")

    addTown(24, 24)
    addCharacter(16, 6)
    addCharacter(36, 26)

    player = addCharacter(20, 20, true)

    updateState({
        player,
    })

    loadUI()
}

function loadUI() {
    const parent = document.getElementById("ui")!
    parent.appendChild(new InventoryView())
    parent.appendChild(new ActionView())
}

function update() {
    const tCurr = Date.now()

    updateResourceSpawns()

    for (const character of characters) {
        updateCharacterAi(character, tCurr)
    }
}

function render() {
    const { entities } = getState()

    update()

    app.ctx.fillStyle = "#ddd"
    app.ctx.fillRect(0, 0, app.width, app.height)

    for (const entity of entities) {
        renderImg(entity.texture, entity.x, entity.y)
    }

    for (const character of characters) {
        renderImg(character.texture, character.x, character.y)
    }

    renderImg(player.texture, player.x, player.y)

    if (hoverEntity) {
        const size = hoverEntity.type === EntityType.Town ? 2 : 1
        const startX = hoverEntity.x - 2
        const startY = hoverEntity.y - 2
        const endX = size * GridSize + 4
        const endY = size * GridSize + 4

        app.ctx.strokeStyle = "white"
        app.ctx.lineWidth = 2
        app.ctx.strokeRect(startX, startY, endX, endY)
    }

    requestAnimationFrame(render)
}

function renderImg(texture: Texture, x: number, y: number) {
    app.ctx.drawImage(texture.img, x, y)
}

function getEntityAt(gridX: number, gridY: number): Entity | null {
    const { entities, data } = getState()

    const index = gridX + gridY * MapSize
    const entityId = data[index]
    if (entityId) {
        return entities[entityId - 1] || null
    }

    return null
}

setup()
load()
render()

declare global {
    function html(str: TemplateStringsArray, ...values: unknown[]): string
}
