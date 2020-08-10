const express = require('express');
// allows the app to use to vary ports
const PORT = process.env.PORT || 3001
// instantiates the server
const app = express()
// requires the animal data
const { animals } = require('./data/animals')
// filter code
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray =[]
    // note we save animalsarray as filteredresults here
    let filteredResults = animalsArray
    if (query.personalityTraits) {
        // save personality traits as a dedicated array
        // if personality traits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits]
        } else {
            personalityTraitsArray = query.personalityTraits
        }
        // loop through each trait in the personalitytraits array
        personalityTraitsArray.forEach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            )
        })
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}
// adds the route
app.get('/api/animals', (req, res) => {
    let results = animals
    if (req.query) {
        results = filterByQuery(req.query, results)
    }
    res.json(results)
})
// makes the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`)
})


