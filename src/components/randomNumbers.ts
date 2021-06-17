const pickNumberAtRandom = (count: number) => Math.floor(Math.random() * count + 1);

export const pickNumbersAtRandomExcept = (exceptions: number[], count: number) => {
    let candidates: number[] = [];
    let localExceptions = [...exceptions]
    for (let x = 0; x < count; x++) {
        let candidate;
        do {
            candidate = pickNumberAtRandom(20);
            //console.log('numbers picked are', candidate)
        }
        while (localExceptions.includes(candidate))
        localExceptions = [...localExceptions, candidate]
        candidates.push(candidate)
    }

    return candidates;
}