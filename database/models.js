const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/test');
	// use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const HardwareSchema = new mongoose.Schema({
    kind: {
		type: String,
		required: true
	},
    description: {
		type: String,
		required: true
	},
    name: {
		type: String,
		required: true
	},
    date: {
		type: String,
		required: true
	},
    
});

const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: {
    		type: String,
		required: false
  	},
	illuminareanSerial: {
		type: String,
		required: false
	},
	manufacturerSerial: {
		type: String,
		required: false 
	},
	category: {
		type: String,
		required: true
	},
	price: {
		type: Double,
		required: true
	},
	purchasePlace: {
		type: String,
		required: true
	},
	color: {
		type: String,
		required: false
	},
	//only one per person?
	numProvided: {
		type: Double,
		required: true
	},
	providedTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: false
  	}
});

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	itemsProvided: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Item',
		required: true
  	}],
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group',
		required: false
	}]
});

const groupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	members: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
  	}]
});

const Item = mongoose.model('Item', itemSchema);
const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);

module.exports = {
	Item,
	User,
	Group
};