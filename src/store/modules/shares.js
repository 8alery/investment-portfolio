import _ from 'lodash';
import Vue from 'vue';
import moex from '../../js/moex';

const vueExtend = (dest, source) => {
	for(const key of _.keys(source)){
		Vue.set(dest, key, source[key]);
	}
};

const promisesCache = {};

export default {
	state: {
		loading: false,
		items: [],
		sharesCache: {},
		selectedBoard: 'TQBR',
		searchText: '',
		boards: [],
		currentPage: 1,
		perPage: 20,
		sortBy: 'marketData.MARKETPRICE',
		sortDesc: true
	},
	getters: {
		shares: (state) => state.items,
		sharesCache: (state) => state.sharesCache,
		sharesBoards: (state) => state.boards
	},
	mutations: {
		'shares.set'(state, items){
			state.items = items;
		},
		'sharesBoards.set'(state, items){
			state.boards = items;
		},
		'shares.update'(state, item){
			if (state.sharesCache[item.id]){
				vueExtend(state.sharesCache[item.id], item);
			} else {
				Vue.set(state.sharesCache, item.id, item);
			}
		},
		'shares.selectedBoard'(state, value){
			state.selectedBoard = value;
		},
		'shares.searchText'(state, value){
			state.searchText = value;
		},
		'shares.currentPage'(state, value){
			state.currentPage = value;
		},
		'shares.perPage'(state, value){
			state.perPage = value;
		},
		'shares.sortBy'(state, value){
			state.sortBy = value;
		},
		'shares.sortDesc'(state, value){
			state.sortDesc = value;
		},
		'shares.loading'(state, value){
			state.loading = value;
		}
	},
	actions: {
		changeSharesSelectedBoard({ commit, dispatch }, value){
			commit('shares.selectedBoard', value);
			commit('shares.set', []);
			promisesCache.getShares = null;
			dispatch('getShares');
		},
		getShares({ commit, state }){
			if (!promisesCache.getShares){
				promisesCache.getShares = new Promise((resolve, reject) => {
					commit('shares.loading', true);
					moex.getSecuritiesForMarketAndBoard({ market: 'shares', board: state.selectedBoard }).then((securities) => {
						commit('shares.set', securities);
						commit('shares.loading', false);
					}, reject);
				})
			}
			return promisesCache.getShares;
		},
		getShare({ state, commit }, secid){
			return new Promise((resolve, reject) => {
				if (state.sharesCache[secid]){
					return resolve(state.sharesCache[secid]);
				}
				return moex.getBond(secid).then((item) => {
					commit('shares.update', item);
					return resolve(state.bondsCache[secid]);
				}, reject);
			});
		},
		getSharesBoards({ commit }){
			if (!promisesCache.getBoardsForMarket){
				promisesCache.getBoardsForMarket = new Promise((resolve, reject) => {
					moex.getBoardsForMarket('shares').then((items) => {
						commit('sharesBoards.set', items);
					}, reject);
				})
			}
			return promisesCache.getBoardsForMarket;
		}
	}
}