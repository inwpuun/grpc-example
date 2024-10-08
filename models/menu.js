const mongoose = require('mongoose')

const Schema = mongoose.Schema

const menuSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique:true,
  },
  name: {
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  }
})

module.exports = mongoose.model('Menu', menuSchema)