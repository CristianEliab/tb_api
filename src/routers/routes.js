const express = require('express')
const api = express.Router()

/**
 * Mutants functions
 */
const functions = require('../controllers/api')

/**
 * Routes
 */
api.get('/files/data', functions.getFilesData)
api.get('/files/list', functions.getFilesList)

module.exports = api
