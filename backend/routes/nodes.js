const router = require('express').Router();
let Node = require('../models/node.model');

router.route('/').get((req, res) => {
    Node.find()
    .then(nodes => res.json(nodes))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const pos = req.body.pos;
  const long = pos[0]
  const lat = pos[1]

  const newNode = new Node({longitude: long, latitude: lat});

  newNode.save()
    .then(node => res.json(node._id))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add_edge/:_id').post((req, res) => {
	console.log(req.params._id)
	Node.findOne({_id: req.params._id})
  	.then(node => {

  		node.edges.push(req.body.edge)

  		node.save()
  		.then(() => res.json("Edge added"))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;
