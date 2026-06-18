const mongoose = require('mongoose')

let musicnoteschema = new mongoose.Schema({
    user :{type : mongoose.Schema.Types.ObjectId,ref : 'User',required : true},
    title :{type : String,required : true},
    genre:{type : String,required : true},
    description :{type : String},
    fileurl :{type : String,required : true},
    rate :{type : Number,default : 0},
    isForBidding :{type : Boolean,default : true},
    ratings :[{
        user :{type : mongoose.Schema.Types.ObjectId,ref : 'User'},
        value :{type : Number,min : 1,max : 5}
    }],
    bids :[{
        user :{type : mongoose.Schema.Types.ObjectId,ref : 'User'},
        amount :{type : Number,required : true},
        createdat :{type : Date,default : Date.now}
    }],
    biddingClosed :{type : Boolean,default : false},
    date :{type : Date,default : Date.now}
})

module.exports = mongoose.model('MusicNote', musicnoteschema);
