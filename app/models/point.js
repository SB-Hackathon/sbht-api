const mongoose = require('mongoose')

const pointSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Point', pointSchema)
