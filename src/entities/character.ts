import { getTexture } from "../assets/texture"
import { Inventory, haveInventorySpace, sellInventory } from "../inventory"
import { getState } from "../state"
import { Entity, EntityEvent, EntityType, GridSize, emit, findEntity, setMoveTo, subscribe, unsubscribe } from "./entity"
import { extractResource } from "./resource"

export type AiState = "idle" | "move-to-target" | "search-wood" | "gather-resource" | "return-town" | "sell" | "enter" | "exit"

export interface Character extends Entity {
    startX: number
    startY: number
    endX: number
    endY: number
    target: Entity | null
    tActionStart: number
    tActionEnd: number
    speed: number
    state: AiState
    inventory: Inventory
}

export function transitionAiState(character: Character, newState: AiState, target: Entity | null = null) {
    if (character.state === newState && character.target === target) {
        return
    }

    handleStateEnter(character, newState)

    character.state = newState

    if (character.target !== target) {
        if (character.target) {
            unsubscribe(character.target, character)
        }

        character.target = target

        if (character.target) {
            subscribe(character.target, character, handleEntityEvent)
        }
    }

    if (target && newState === "move-to-target") {
        setMoveTo(character, target.x, target.y)
    }

    emit(character, "state-updated")
}

function handleStateEnter(character: Character, newState: AiState) {
    switch (newState) {
        case "sell": {
            const { time } = getState()

            const sellDelay = character.inventory.spaceUsed * 1000
            character.tActionStart = time.curr
            character.tActionEnd = time.curr + sellDelay
            break
        }

        default: {
            character.tActionStart = 0
            character.tActionEnd = 0
            break
        }
    }
}

export function updateCharacterAi(character: Character, tCurr: number) {
    switch (character.state) {
        case "idle": {
            if (character.type === EntityType.Npc) {
                if (character.isHidden) {
                    if (character.inventory.spaceUsed > 0) {
                        transitionAiState(character, "sell")
                    } else {
                        transitionAiState(character, "exit")
                    }
                } else {
                    transitionAiState(character, "search-wood")
                }
            }
            return
        }

        case "search-wood": {
            const forest = findEntity(EntityType.Resource, character.x, character.y, true)
            if (!forest) {
                if (character.inventory.spaceUsed > 0) {
                    transitionAiState(character, "return-town")
                } else {
                    transitionAiState(character, "idle")
                }
                return
            }

            transitionAiState(character, "move-to-target", forest)
            break
        }

        case "move-to-target": {
            if (character.tActionEnd <= tCurr) {
                character.x = character.endX
                character.y = character.endY

                if (character.target) {
                    switch (character.target.type) {
                        case EntityType.Resource:
                            transitionAiState(character, "gather-resource", character.target)
                            return

                        case EntityType.Town:
                        case EntityType.Village:
                            transitionAiState(character, "enter")
                            return

                        default:
                            transitionAiState(character, "return-town")
                            return
                    }
                } else {
                    transitionAiState(character, "return-town")
                    return
                }
            }

            const t = (tCurr - character.tActionStart) / (character.tActionEnd - character.tActionStart)
            character.x = character.startX + (character.endX - character.startX) * t
            character.y = character.startY + (character.endY - character.startY) * t
            break
        }

        case "gather-resource": {
            if (character.tActionEnd === 0) {
                character.tActionEnd = tCurr + 2000
                return
            }

            if (character.tActionEnd <= tCurr) {
                character.tActionEnd = 0

                extractResource(character, character.target)

                if (!haveInventorySpace(character.inventory, 1)) {
                    transitionAiState(character, "return-town")
                }
            }
            break
        }

        case "return-town": {
            const nearestTown = findEntity(EntityType.Town, character.x, character.y)
            if (!nearestTown) {
                console.warn(`Could not find a town`)
                transitionAiState(character, "idle")
                return
            }

            transitionAiState(character, "move-to-target", nearestTown)
            return
        }

        case "sell": {
            if (character.tActionEnd > tCurr) {
                return
            }

            sellInventory(character.inventory)
            transitionAiState(character, "idle")
            return
        }

        case "enter": {
            character.isHidden = true
            transitionAiState(character, "idle")
            break
        }

        case "exit": {
            character.isHidden = false
            transitionAiState(character, "idle")
            break
        }
    }
}

function handleEntityEvent(_from: Entity, to: Entity, event: EntityEvent) {
    switch (event) {
        case "destroyed":
            transitionAiState(to as Character, "search-wood")
            break
    }
}

export function addCharacter(gridX: number, gridY: number, isPlayer = false) {
    const { characters } = getState()

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
        inventory: {
            items: [],
            spaceMax: 2,
            spaceUsed: 0,
        },
        isHidden: false,
    }

    characters.push(character)

    return character
}
