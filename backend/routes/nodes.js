const router = require('express').Router();
let Node = require('../models/node.model');

router.route('/').get((req, res) => {
    Node.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;

  const newNode = new Node({username});

  newNode.save()
    .then(() => res.json('Node added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
