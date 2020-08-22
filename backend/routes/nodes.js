const router = require('express').Router();
let Node = require('../models/node.model');

router.route('/').get((req, res) => {
    Node.find()
    .then(nodes => res.json(nodes))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
	const pos = req.body.pos
	const long = pos[0]
    const lat = pos[1]
	Node.findOne({longitude: long, latitude: lat})
  	.then(node => {

		if (!node){
			node = new Node({longitude: long, latitude: lat});
		}else{
			console.log(node.longitude, node.latitude)
		}

		node.save()
	      .then(node => res.json(node))
	      .catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));

});

router.route('/add_edge/:_id').post((req, res) => {
	Node.findOne({_id: req.params._id})
  	.then(node => {

  		node.edges.push(req.body.edge)

  		node.save()
  		.then(node => res.json(node))
  		.catch(err => res.status(400).json('Error: ' + err));
  	})
  	.catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;
