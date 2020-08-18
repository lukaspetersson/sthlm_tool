const { v4: uuidv4 } = require('uuid');
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
   let id = uuidv4();

  const newEdge = new Edge({
		id,
		nodeOneID,
		nodeTwoID
	});

  newEdge.save()
  .then(() => res.json(id))
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
