const { 
extractEntities
} = require("./index")

const resp = extractEntities(`
    Elon Musk founded SpaceX in 2002 in Hawthorne, California. The company
developed the Falcon 9 rocket and the Dragon spacecraft. SpaceX was awarded
a $1.6 billion NASA contract for cargo resupply missions to the International
Space Station.`, [
    "person", "organization", "date", "location", "product", "monetary value"
])

console.log(resp)