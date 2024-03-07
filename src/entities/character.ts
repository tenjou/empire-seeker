import { getTexture } from "../assets/texture"
import { Inventory, haveInventorySpace, sellInventory } from "../inventory"
import { openPopup } from "../popup"
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
    inventory: Inventory
    ai: {
        state: AiState
        statePrev: AiState
        tUpdate: number
    }
}

function handleStateEnter(character: Character, newState: AiState, tCurr: number) {
    const { ai } = character
    ai.statePrev = ai.state
    ai.state = newState
    ai.tUpdate = 0

    switch (newState) {
        case "move-to-target": {
            if (!character.target) {
                console.warn(`Missing a target:`, character)
                break
            }

            setMoveTo(character, character.target.x, character.target.y)
            character.ai.tUpdate = character.tActionEnd
            break
        }

        case "gather-resource": {
            ai.tUpdate = tCurr + 2000
            break
        }

        case "enter": {
            character.isHidden = true

            if (character.type === EntityType.Player) {
                openPopup("settlement-popup", () => {
                    transitionAiState(character, "exit")
                })
            }
            break
        }

        case "exit": {
            character.isHidden = false
            break
        }

        case "sell": {
            const sellDelay = character.inventory.spaceUsed * 1000
            ai.tUpdate = tCurr + sellDelay
            break
        }
    }
}

export function updateCharacterAi(character: Character, tCurr: number) {
    const { ai } = character

    if (ai.tUpdate > tCurr) {
        return
    }

    switch (ai.state) {
        case "idle": {
            if (character.type === EntityType.Npc) {
                transitionAiState(character, "search-wood")
            } else {
                ai.tUpdate = tCurr + 5000
            }
            break
        }

        case "move-to-target": {
            if (!character.target) {
                console.warn(`Missing a target:`, character)
                break
            }

            switch (character.target.type) {
                case EntityType.Resource:
                    transitionAiState(character, "gather-resource", character.target)
                    return

                case EntityType.Town:
                case EntityType.Village:
                    transitionAiState(character, "enter", character.target)
                    return

                case EntityType.Placeholder:
                    transitionAiState(character, "idle")
                    return
            }

            transitionAiState(character, "return-town")
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

        case "gather-resource": {
            const resourceLeft = extractResource(character, character.target)

            if (!haveInventorySpace(character.inventory, 1)) {
                transitionAiState(character, "return-town")
                return
            }

            if (!resourceLeft) {
                transitionAiState(character, "search-wood")
                return
            }

            ai.tUpdate = tCurr + 2000
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

        case "enter": {
            if (character.inventory.spaceUsed > 0) {
                transitionAiState(character, "sell", character.target)
            } else {
                if (character.type !== EntityType.Player) {
                    transitionAiState(character, "exit", character.target)
                }
            }
            return
        }

        case "exit": {
            transitionAiState(character, "idle")
            return
        }

        case "sell": {
            sellInventory(character.inventory)
            transitionAiState(character, character.ai.statePrev, character.target)
            return
        }
    }
}

export function transitionAiState(character: Character, newState: AiState, target: Entity | null = null, force = false) {
    if (character.ai.state === newState && character.target === target && !force) {
        console.warn(`Already on state: ${newState}`)
        return
    }

    const { time } = getState()

    if (character.target !== target) {
        if (character.target) {
            unsubscribe(character.target, character)
        }
        character.target = target
        if (character.target) {
            subscribe(character.target, character, handleEntityEvent)
        }
    }

    handleStateEnter(character, newState, time.curr)
    emit(character, "state-updated")
}

function handleEntityEvent(_from: Entity, _to: Entity, _event: EntityEvent) {}

export function addCharacter(gridX: number, gridY: number, isPlayer = false) {
    const { characters } = getState()

    const character: Character = {
        id: characters.length + 1,
        type: isPlayer ? EntityType.Player : EntityType.Npc,
        texture: getTexture(isPlayer ? "player" : "character"),
        x: gridX * GridSize,
        y: gridY * GridSize,
        isHidden: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        tActionStart: 0,
        tActionEnd: 0,
        speed: 100,
        target: null,
        subscribers: [],
        inventory: {
            items: [],
            spaceMax: 2,
            spaceUsed: 0,
        },
        ai: {
            state: "idle",
            statePrev: "idle",
            tUpdate: 0,
        },
    }

    characters.push(character)

    return character
}
