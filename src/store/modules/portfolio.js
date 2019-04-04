import Vue from 'vue';
import _ from 'lodash';
import db from '../../js/db';
import moment from 'moment';

let getPortfolioPromise = null, getFeesPromise = null;

const vueExtend = (dest, source) => {
	for(const key of _.keys(source)){
		Vue.set(dest, key, source[key]);
	}
};

const smartParseNumber = (value) => {
	if (_.isNumber(value)){
		return value;
	}

	value = value.replace(/\s+/g, '');
	return parseFloat(value);

};

export default {
	state: {
		orders: [],
		ordersCache: {},
		fees: [],
		feesCache: {}
	},
	getters: {
		portfolioOrders: state => _.orderBy(state.orders, ['purchaseDate'], ['desc']),
		portfolioOrdersCache: state => state.ordersCache,
		portfolioOrdersTotalMarketPrice: (state, getters) => {
			let total = 0;
			_.each(state.orders, item => {
				const security = getters.bondsCache[item.secid];
				if (security){
					// PREVPRICE PREVLEGALCLOSEPRICE PREVADMITTEDQUOTE MARKETPRICE LCURRENTPRICE LCLOSEPRICE
					total += item.amount * (security.marketData.MARKETPRICE * security.details.FACEVALUE / 100);
				}
			});
			return total;
		},
		portfolioOrdersTotalPurchasePrice: (state, getters) => {
			let total = 0;
			_.each(state.orders, item => {
				const security = getters.bondsCache[item.secid];
				if (security){
					total += item.amount * item.price + item.nkd;
				}
			});
			return total;
		},
		portfolioSecurities: (state, getters) => {
			const securities = _.groupBy(state.orders, o => o.secid);
			return _.map(_.keys(securities), (secid) => {
				const orders = securities[secid];
				const security = getters.bondsCache[secid] || getters.sharesCache[secid] || { id: secid, details: {}, marketData: {} };
				return {
					secid,
					security,
					amount: _.reduce(orders, (acc, o) => acc + o.amount, 0)
				};

			});
		},
		portfolioFees: state => _.orderBy(state.fees, ['date'], ['desc']),
		portfolioFeesTotal: state => _.reduce(state.fees, (acc, el) => acc + el.amount, 0)
	},
	mutations: {
		'portfolioOrders.set'(state, orders){
			state.orders = orders;
			_.each(orders, item => {
				Vue.set(state.ordersCache, item.id, item);
			});
		},
		'portfolioOrders.add'(state, item){
			state.orders.push(item);
			Vue.set(state.ordersCache, item.id, item);
			//storage.setItem('portfolioorders', JSON.stringify(state.orders));
		},
		'portfolioOrders.update'(state, item){
			const existing = state.ordersCache[item.id];
			if (existing){
				vueExtend(existing, item);
			} else {
				Vue.set(state.ordersCache, item.id, item);
			}
		},
		'portfolioOrders.delete'(state, itemId){
			if (state.ordersCache[itemId]){
				const index = _.indexOf(state.orders, state.ordersCache[itemId]);
				if (index !== -1){
					state.orders.splice(index, 1);
					//storage.setItem('portfolioorders', JSON.stringify(state.orders));
				}
				delete state.ordersCache[itemId];
			}
		},
		'portfolioFees.set'(state, items){
			state.fees = items;
			_.each(items, item => {
				Vue.set(state.feesCache, item.id, item);
			});
		},
		'portfolioFees.update'(state, item){
			const existing = state.feesCache[item.id];
			if (existing){
				vueExtend(existing, item);
			} else {
				Vue.set(state.feesCache, item.id, item);
				state.fees.push(item);
			}
		}
	},
	actions: {
		getOrders({ commit }){
			if (!getPortfolioPromise){
				getPortfolioPromise = new Promise((resolve, reject) => {
					try {

						db.getOrders().then((orders) => {
							commit('portfolioOrders.set', orders);
							resolve(orders);
						}, reject);

					} catch (err) {
						resolve([]);
					}
				});
			}
			return getPortfolioPromise;
		},
		addOrder({ commit }, { secid, market }){
			return new Promise((resolve, reject) => {
				const item = {
					secid,
					market,
					purchaseDate: new Date(),
					amount: 0
				};
				db.saveOrder(item).then((order) => {
					commit('portfolioOrders.add', order);
					resolve(order);
				}, reject);

			})
		},
		getOrder({ dispatch, state }, itemId){
			return dispatch('getOrders').then(() => {
				return state.ordersCache[itemId];
			});
		},
		deleteOrder({ commit, state }, itemId){
			if (!state.ordersCache[itemId]){
				return Promise.reject(`Portfolio item with id ${order.id} does not exist`);
			}

			return db.deleteOrder(itemId).then(() => {
				commit('portfolioOrders.delete', itemId);
			});
		},
		updateOrder({ commit, state }, order){
			const existing = state.ordersCache[order.id];
			if (!existing){
				return Promise.reject(`Portfolio item with id ${order.id} does not exist`);
			}
			return db.saveOrder(order).then((order) => {
				commit('portfolioOrders.update', order);
				return state.ordersCache[order.id];
			})
		},
		getPortfolioFees({ commit }){
			if (!getFeesPromise){
				getFeesPromise = new Promise((resolve, reject) => {
					try {

						db.getFees().then((items) => {
							commit('portfolioFees.set', items);
							resolve(items);
						}, reject);

					} catch (err) {
						resolve([]);
					}
				});
			}
			return getFeesPromise;
		},
		getPortfolioFee({ dispatch, state }, itemId){
			return dispatch('getPortfolioFees').then(() => {
				return state.feesCache[itemId];
			});
		},
		savePortfolioFee({ commit, state }, item){
			return db.saveFee(item).then((fee) => {
				commit('portfolioFees.update', fee);
				return state.feesCache[fee.id];
			})
		},
		importPortfolioOrders({ commit }, items){
			const mappedOrders = _.map(items, item => {
				return {
					secid: item.SECID,
					purchaseDate: moment(item.DATE, 'DD.MM.YYYY').toDate(),
					price: smartParseNumber(item.PRICE),
					amount: smartParseNumber(item.AMOUNT),
					nkd: smartParseNumber(item.NKD)
				};
			});

			return db.saveOrders(mappedOrders).then((items) => {
				commit('portfolioOrders.set', items);
				return items;
			});

		}
	}
}