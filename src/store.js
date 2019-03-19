import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

const  storage = window.localStorage;

const bonds = storage.getItem('bondsArray') && JSON.parse(storage.getItem('bondsArray')) || [];
const portfolio = storage.getItem('portfolio') && JSON.parse(storage.getItem('portfolio')) || [];

export default new Vuex.Store({
	state: {
		bonds: bonds,
		bondsCache: _.reduce(bonds, (acc, el) => {
			return {
				...acc,
				[el.isin]: el
			};
		}, {}),
		portfolio: portfolio,
		portfolioCache: _.reduce(portfolio, (acc, el) => {
			return {
				...acc,
				[el.id]: el
			};
		}, {})
	},
	mutations: {
		saveBond(state, item){
			if (state.bondsCache[item.name]){
				_.extend(state.bondsCache[item.name], item);
			} else {
				state.bonds.push(item);
				state.bondsCache[item.name] = item;
			}
			storage.setItem('bondsArray', JSON.stringify(state.bonds));
		},
		addBondToPortfolio(state, bondId){
			const id = state.portfolio.length ? _.last(state.portfolio).id + 1 : 1;
			state.portfolio.push({ id, bondId, amount: 0, purchaseDate: null });
			storage.setItem('portfolio', JSON.stringify(state.portfolio));
		},
		savePortfolioItem(state, item){
			const existing = state.portfolioCache[item.id];
			_.extend(existing, item);
			storage.setItem('portfolio', JSON.stringify(state.portfolio));
		}
	},
	actions: {
		getBond({ state }, bondId){
			return new Promise((resolve) => {
				resolve(state.bondsCache[bondId]);
			});

		},
		getPortfolioItem({ state }, itemId){
			return new Promise((resolve) => {
				resolve(state.portfolioCache[itemId]);
			});

		},
		addBondToPortfolio({ commit }, bondId){
			return new Promise((resolve) => {
				commit('addBondToPortfolio', bondId);
				resolve();
			});
		},
		savePortfolioItem({ commit }, item){
			return new Promise((resolve) => {
				commit('savePortfolioItem', item);
				resolve();
			});
		}
	}
});
