const { v4: uuidv4 } = require('uuid');
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

router.route('/add_edge/:id').post((req, res) => {
	Node.findOne({id: req.params.id})
  	.then(node => {

  		node.edges.push(req.body.edge)

  		node.save()
  		.then(() => res.json("Edge assigned"))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;