const router = require('express').Router();
let Edge = require('../models/edge.model');

router.route('/').get((req, res) => {
  Edge.find()
    .then(edges => res.json(edges))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  const description = req.body.description;
  const duration = Number(req.body.duration);
  const date = Date.parse(req.body.date);

  const newEdge = new Edge({
    username,
    description,
    duration,
    date,
  });

  newEdge.save()
  .then(() => res.json('Edge added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
