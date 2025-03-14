function compairCoordinates (coord1, coord2, radius = 0.025) {
    if (coord1[0] === coord2[0] && coord1[1] === coord2[1]) {
        return true
    } else if (coord1[0] >= coord2[0] && coord1[0] <= coord2[0]+radius && coord1[1] >= coord2[1] && coord1[1] <= coord2[1]+radius) {
        return true
    } else if (coord1[0] <= coord2[0] && coord1[0] >= coord2[0]-radius && coord1[1] <= coord2[1] && coord1[1] >= coord2[1]-radius) {
        return true
    } else {
        return false 
    }
}

export async function findParks(base, userCoordinates, radius) {
    const result = []
    base.map(item => {
        if (compairCoordinates(item.coordinates, userCoordinates, radius)) {
            result.push(item)
        }
    })
    return result
}