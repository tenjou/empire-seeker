export const mulberry32 = (seed: number) => {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0

        currSeed = seed

        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// const defaultSeed = Date.now()
let defaultSeed = 1685427805898
let currSeed = defaultSeed
let randInstance = mulberry32(defaultSeed)

console.log(defaultSeed)

export const rand = () => {
    return randInstance()
}

export const setSeed = (seed: number) => {
    randInstance = mulberry32(seed)
}

export const getSeed = () => {
    return currSeed
}
