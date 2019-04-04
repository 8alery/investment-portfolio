// import { openDB, deleteDB, wrap, unwrap } from 'idb';
//
// const dbPromise = openDB('investment_db', 1, {
// 	upgrade(db) {
// 		// Create a store of objects
// 		const ordersStore = db.createObjectStore('orders', {
// 			// The 'id' property of the object will be the key.
// 			keyPath: 'id',
// 			// If it isn't explicitly set, create a value by auto incrementing.
// 			autoIncrement: true,
// 		});
// 		// Create an index on the 'date' property of the objects.
// 		ordersStore.createIndex('purchaseDate', 'purchaseDate');
// 	},
// });
import Dexie from 'dexie';

const db = new Dexie('investment_db');
db.version(1)
	.stores({
		orders: '++id,purchaseDate'
	});
db.version(2)
	.stores({
		orders: '++id,purchaseDate',
		fees: '++id,date'
	});


export default {

	saveOrder(order){
		// return dbPromise.then((db) => {
		// 	return db.add('orders', order);
		// }).then((item) => {
		// 	return item;
		// }, (err) => {
		// 	console.error(err);
		// })
		return db.orders.put(order).then((orderId) => {
			if (!order.id){
				order.id = orderId;
			}
			return order;
		});
	},

	saveOrders(orders){
		return db.orders.bulkAdd(orders).then((lastId) => {
			console.log(`Added ${orders.length}, last key is ${lastId}`);
			return this.getOrders();
		});
	},

	// async getOrder(orderId){
	// 	//return (await dbPromise).get('orders', orderId);
	// },
	//
	async deleteOrder(orderId){
		//return (await dbPromise).delete('orders', orderId);
		return db.orders.delete(orderId);
	},
	//
	// async updateOrder(order){
	// 	//return (await dbPromise).put('orders', order, order.id);
	// },


	getOrders(){
		return db.orders.toArray();
		// return dbPromise.then((db) => {
		// 	return db.getAllFromIndex('orders', 'purchaseDate');
		// });
	},

	getFees(){
		return db.fees.toArray();
	},

	saveFee(item){
		return db.fees.put(item).then((itemId) => {
			if (!item.id){
				item.id = itemId;
			}
			return item;
		});
	}


};
