// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for points
const Point = require('../models/point')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { point: { title: '', text: 'foo' } } -> { point: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /points
router.get('/points', requireToken, (req, res, next) => {
  Point.find()
    .then(points => {
      // `points` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return points.map(point => point.toObject())
    })
    // respond with status 200 and JSON of the points
    .then(points => res.status(200).json({ points: points }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /points/5a7db6c74d55bc51bdf39793
router.get('/points/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Point.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "point" JSON
    .then(point => res.status(200).json({ point: point.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /points
router.post('/points', requireToken, (req, res, next) => {
  // set owner of new point to be current user
  req.body.point.owner = req.user.id

  Point.create(req.body.point)
    // respond to succesful `create` with status 201 and JSON of new "point"
    .then(point => {
      res.status(201).json({ point: point.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /points/5a7db6c74d55bc51bdf39793
router.patch('/points/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.point.owner

  Point.findById(req.params.id)
    .then(handle404)
    .then(point => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, point)

      // pass the result of Mongoose's `.update` to the next `.then`
      return point.updateOne(req.body.point)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /points/5a7db6c74d55bc51bdf39793
router.delete('/points/:id', requireToken, (req, res, next) => {
  Point.findById(req.params.id)
    .then(handle404)

    .then(point => {
      // throw an error if current user doesn't own `point`
      requireOwnership(req, point)
      // delete the point ONLY IF the above didn't throw
      if (point.total === 0) {
        point.deleteOne()
      } else {
        return res.status(200).json({ point: point.toObject() })
      }
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
