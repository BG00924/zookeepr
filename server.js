const express = require('express');
// needed to write to json
const fs = require('fs')
const path = require('path')
// allows the app to use to vary ports
const PORT = process.env.PORT || 3001
// instantiates the server
const app = express()
// parse incoming string or array data
app.use(express.urlencoded({ extended: true}))
// parse incoming json data
app.use(express.json())
// allows for static pages (css, js, etc on the main html)
app.use(express.static('public'))
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
// function to finds single animal by taking in id and array of animals
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0]
    return result
}
// creates a new animal from data received from the post request
function createNewAnimal(body, animalsArray) {
    // console.log(body)
    // our functions main code will go here
    const animal = body
    animalsArray.push (animal)
    // writes to animal.json
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        JSON.stringify({ animals: animalsArray }, null, 2)
    )
    // return finished code to post route for response
    return animal;
}
// validates data received from user prior to writing to json
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}
// adds the route
app.get('/api/animals', (req, res) => {
    let results = animals
    if (req.query) {
        results = filterByQuery(req.query, results)
    }
    res.json(results)
})
// allows for specific animal
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals)
    if (result) {
        res.json(result)
    } else {
        res.send(404)
    }
})
// allows user to populate data to the server
app.post('/api/animals', (req, res) => {
    // req.body is where out incoming content will be
    // console.log(req.body)
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString()
    // add animal to json file and animals array in this function
    // const animal = createNewAnimal(req.body, animals)
    // res.json(req.body)
    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.')
    } else {
        const animal = createNewAnimal(req.body, animals)
        res.json(animal)
    }
})

// gets index, animals, and zookeepers to be served from our express.js server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})
app.get('/animals', (req, res) => {
    res.sendFile(path.join(__dirname, './public/animals.html'))
})
app.get('/zookeepers', (req, res) => {
    res.sendFile(path.join(__dirname, './public/zookeepers.html'))
})
// makes the server listen
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`)
})


