const server = require('./server')
const knex = server.knex

const all_locations = { 
    business_employee: null, 
    charges: null, 
    image: null, 
    businesses: null, 
    employees: null, 
    permissions: null, 
    products: null, 
    qrs: null,
    users: null
}

const host_location = { 
    piipsell_frontend: null
}

var getPrimaryHost = function() { 
    return new Promise((resolve, reject) => {
        getLocation("piipsell_frontend")
        .then((result) => { 
            host_location.piipsell_frontend = result
            resolve(result)
        })
        .catch((err) => {
            reject(err)
        })
    })
}

var getLocation = function(name) { 
    return new Promise((resolve, reject) => {
        console.log("getting host")
        console.log(name)
        return knex('location').where('name', name).select('host') 
        .then((query) => {
            console.log(query)
            resolve(query[0].host)
        })
        .catch((err) => {
            reject(err)
        })
    })
}


var getAllLocations = function() { 
    for(var i = 0; i < Object.keys(all_locations).length; i++) {
        const value = Object.keys(all_locations)[i]
        getLocation(value)
        .then((result) => { 
            all_locations[value] = result
        })
        .catch((err) => { 
            console.log(err)
        })
    }   
}

module.exports = { 
    getAllLocations: getAllLocations, 
    getLocation: getLocation,
    getPrimaryHost: getPrimaryHost,
    all_locations: all_locations
}