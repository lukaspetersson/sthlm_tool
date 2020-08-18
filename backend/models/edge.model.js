const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const edgeSchema = new Schema({
  nodeOneID: { type: String, required: true },
  nodeTwoID: { type: String, required: true },
  tier: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Edge = mongoose.model('Edge', edgeSchema);

module.exports = Edge;
