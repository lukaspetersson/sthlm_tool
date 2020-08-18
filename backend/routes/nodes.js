import { v4 as uuidv4 } from 'uuid';

const router = require('express').Router();
let Node = require('../models/node.model');

router.route('/').get((req, res) => {
    Node.find()
    .then(nodes => res.json(nodes))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const pos = req.body.pos;
  let long = pos[0]
  let lat = pos[1]
  let id = uuidv4();

  const newNode = new Node({id, long, lat});

  newNode.save()
    .then(() => res.json(id))
    .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;
