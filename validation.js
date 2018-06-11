module.exports = { 
    checkXRequestedWith : async (request, headers) => {
        //Do validation here
        let isValid = headers['x-requested-with'] && ( headers['x-requested-with'].toLowerCase() === 'xmlhttprequest' )      
        let credentials = {headers: headers}
        return { isValid: isValid, credentials: credentials}
    },

    checkTrue : async (request, headers) => {
        //Do validation here
        let isValid = true
        let credentials = {headers: headers}
        return { isValid: isValid, credentials: credentials}
    },

    checkFalse : async (request, headers) => {
        //Do validation here
        let isValid = false
        let credentials = {headers: headers}
        return { isValid: isValid, credentials: credentials}
    }
}