const router = require('express').Router();
let Edge = require('../models/edge.model');

router.route('/').get((req, res) => {
  Edge.find()
    .then(edges => res.json(edges))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const newEdge = new Edge({
		nodeOne: {
			id: req.body.nodeOne.id,
			longitude: req.body.nodeOne.pos[0],
			latitude: req.body.nodeOne.pos[1]
		},
		nodeTwo: {
			id: req.body.nodeTwo.id,
			longitude: req.body.nodeTwo.pos[0],
			latitude: req.body.nodeTwo.pos[1]
		},
		streetName: req.body.streetName,
		tier: 0,
		bus: false
	});

  newEdge.save()
  .then(edge => res.json(edge._id))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/set_tier/:id').post((req, res) => {
	Edge.findOne({_id: req.params.id})
  	.then(edge => {

  		edge.tier = Object.keys(req.body)[0]

  		edge.save()
  		.then(edge => res.json(edge.tier))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});

router.route('/toggle_bus/:id').post((req, res) => {
	Edge.findOne({_id: req.params.id})
  	.then(edge => {

		edge.bus = !edge.bus

  		edge.save()
  		.then(edge => res.json(edge.bus))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
