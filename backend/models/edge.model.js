const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const edgeSchema = new Schema({
	nodeOne:{
		id: { type: String, required: true },
		longitude: { type: Number, required: true },
		latitude: { type: Number, required: true },
	},
	nodeTwo:{
		id: { type: String, required: true },
		longitude: { type: Number, required: true },
		latitude: { type: Number, required: true },
	},
	streetName: { type: String},
	tier: { type: Number, default: 0 },
	bus: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Edge = mongoose.model('Edge', edgeSchema);

module.exports = Edge;
