const router = require('express').Router();
let Edge = require('../models/edge.model');

router.route('/').get((req, res) => {
  Edge.find()
    .then(edges => res.json(edges))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const nodeOneID = req.body.nodeOneID;
  const nodeTwoID = req.body.nodeTwoID;
  const streetName = req.body.streetName;

  const newEdge = new Edge({
		nodeOneID: nodeOneID,
		nodeTwoID: nodeTwoID,
		streetName: streetName
	});

  newEdge.save()
  .then(edge => res.json(edge._id))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add_tier/:id').post((req, res) => {
	Edge.findOne({id: req.params.id})
  	.then(edge => {

  		edge.tier = req.body.tier

  		edge.save()
  		.then(() => res.json("Tier assigned"))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
