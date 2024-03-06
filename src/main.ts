import { Texture, getTexture, loadTexture } from "./assets/texture"
import { transitionAiState, updateCharacterAi } from "./entities/character"
import {
    Character,
    Entity,
    EntityType,
    GridSize,
    MapSize,
    addEntity,
    createEntityId,
    fillData,
    getEntityAt,
    setMoveTo,
} from "./entities/entity"
import { updateResourceSpawns } from "./resources"
import { getState, updateState } from "./state"
import "./style.css"
import { loadTooltip, showEntityTooltip as updateEntityTooltip } from "./tooltip/tooltip"
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

interface Camera {
    x: number
    y: number
}

const app: Context = {
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
    width: 0,
    height: 0,
}

const camera: Camera = {
    x: 0,
    y: 0,
}

const characters: Character[] = []

let player: Character = {} as Character
let hoverEntity: Entity | null = null
let isHolding = false
let isDragging = false

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
            return
        }

        const { player } = getState()

        const posX = event.clientX - camera.x
        const posY = event.clientY - camera.y
        const gridX = (posX / GridSize) | 0
        const gridY = (posY / GridSize) | 0

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
    window.addEventListener("mousemove", (event) => {
        if (isHolding) {
            isDragging = true
            camera.x += event.movementX
            camera.y += event.movementY
            return
        }

        const posX = event.clientX - camera.x
        const posY = event.clientY - camera.y
        const gridX = (posX / GridSize) | 0
        const gridY = (posY / GridSize) | 0

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
    updateState({
        entities: [],
        entitiesMap: {},
        data: new Uint16Array(MapSize * MapSize),
        ecology: {
            treesToSpawn: 30,
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

    loadTooltip()
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

    app.ctx.save()
    app.ctx.fillStyle = "#ddd"
    app.ctx.fillRect(0, 0, app.width, app.height)
    app.ctx.translate(camera.x, camera.y)

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

    app.ctx.restore()

    requestAnimationFrame(render)
}

function renderImg(texture: Texture, x: number, y: number) {
    app.ctx.drawImage(texture.img, x, y)
}

function createEntity(type: EntityType, texture: Texture, gridX: number, gridY: number, sizeX: number, sizeY: number) {
    const entity: Entity = {
        id: createEntityId(),
        texture,
        type,
        x: gridX * GridSize,
        y: gridY * GridSize,
        subscribers: [],
    }

    fillData(entity, gridX, gridY, sizeX, sizeY)
    addEntity(entity)
}

function addTown(gridX: number, gridY: number) {
    createEntity(EntityType.Town, getTexture("town"), gridX, gridY, 2, 2)
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

setup()
load()
render()

declare global {
    function html(str: TemplateStringsArray, ...values: unknown[]): string
}
