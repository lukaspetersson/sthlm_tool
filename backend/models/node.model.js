const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const nodeSchema = new Schema({
	id: { type: String, required: true, unique: true },
	longitude: { type: Number, required: true },
	latitude: { type: Number, required: true },
	edges: { type: Array},
}, {
  timestamps: true,
});

const Node = mongoose.model('Node', nodeSchema);

module.exports = Node;
