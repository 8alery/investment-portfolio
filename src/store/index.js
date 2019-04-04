import Vue from 'vue';
import Vuex from 'vuex';
// import _ from 'lodash';
import modules from './modules';

Vue.use(Vuex);

//const  storage = window.localStorage;

//const bonds = storage.getItem('bondsArray') && JSON.parse(storage.getItem('bondsArray')) || [];
//const portfolio = storage.getItem('portfolio') && JSON.parse(storage.getItem('portfolio')) || [];

// const test = bonds[19];
// test.isin = 'RU000A0JU3B6';

// const forDelete = [];
// const bondsCache = _.reduce(bonds, (acc, el) => {
// 	if (acc[el.isin]){
// 		console.log('el.isin already exists');
// 		forDelete.push(el);
// 	}
// 	return {
// 		...acc,
// 		[el.isin]: el
// 	};
// }, {});

export default new Vuex.Store({
	modules,
	// state: {
	// 	//bonds: bonds,
	// 	//bondsCache,
	// 	// portfolio: portfolio,
	// 	// portfolioCache: _.reduce(portfolio, (acc, el) => {
	// 	// 	return {
	// 	// 		...acc,
	// 	// 		[el.id]: el
	// 	// 	};
	// 	// }, {})
	// },
	// mutations: {
	// 	// saveBond(state, item){
	// 	// 	if (state.bondsCache[item.isin]){
	// 	// 		_.extend(state.bondsCache[item.isin], item);
	// 	// 	} else {
	// 	// 		state.bonds.push(item);
	// 	// 		state.bondsCache[item.isin] = item;
	// 	// 	}
	// 	// 	storage.setItem('bondsArray', JSON.stringify(state.bonds));
	// 	// },
	// 	// addBondToPortfolio(state, bondId){
	// 	// 	const id = state.portfolio.length ? _.last(state.portfolio).id + 1 : 1;
	// 	// 	state.portfolio.push({ id, bondId, amount: 0, purchaseDate: null });
	// 	// 	storage.setItem('portfolio', JSON.stringify(state.portfolio));
	// 	// },
	// 	// savePortfolioItem(state, item){
	// 	// 	const existing = state.portfolioCache[item.id];
	// 	// 	_.extend(existing, item);
	// 	// 	storage.setItem('portfolio', JSON.stringify(state.portfolio));
	// 	// },
	// 	// removeBond(state, bondId){
	// 	// 	const existing = state.bondsCache[bondId];
	// 	// 	if (existing){
	// 	// 		delete state.bondsCache[bondId];
	// 	// 		const index = _.indexOf(state.bonds, existing);
	// 	// 		if (index !== -1){
	// 	// 			state.bonds.splice(index, 1);
	// 	// 			storage.setItem('bondsArray', JSON.stringify(state.bonds));
	// 	// 		}
	// 	// 	}
	// 	// }
	// },
	// actions: {
	// 	// getBond({ state }, bondId){
	// 	// 	return new Promise((resolve) => {
	// 	// 		resolve(state.bondsCache[bondId]);
	// 	// 	});
	// 	//
	// 	// },
	// 	// getPortfolioItem({ state }, itemId){
	// 	// 	return new Promise((resolve) => {
	// 	// 		resolve(state.portfolioCache[itemId]);
	// 	// 	});
	// 	//
	// 	// },
	// 	// addBondToPortfolio({ commit }, bondId){
	// 	// 	return new Promise((resolve) => {
	// 	// 		commit('addBondToPortfolio', bondId);
	// 	// 		resolve();
	// 	// 	});
	// 	// },
	// 	// savePortfolioItem({ commit }, item){
	// 	// 	return new Promise((resolve) => {
	// 	// 		commit('savePortfolioItem', item);
	// 	// 		resolve();
	// 	// 	});
	// 	// }
	// }
});
