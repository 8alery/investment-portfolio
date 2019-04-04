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
		bondsCache: {},
		selectedBoard: 'TQOB',
		searchText: '',
		boards: [],
		currentPage: 1,
		perPage: 20,
		sortBy: 'marketData.YIELD',
		sortDesc: true
	},
	getters: {
		bonds: (state) => state.items,
		bondsBoards: (state) => state.boards,
		bondsCache: (state) => state.bondsCache
	},
	mutations: {
		'bonds.set'(state, items){
			state.items = items;
		},
		'bonds.update'(state, item){
			if (state.bondsCache[item.id]){
				vueExtend(state.bondsCache[item.id], item);
			} else {
				Vue.set(state.bondsCache, item.id, item);
			}
		},
		'bondsBoards.set'(state, items){
			state.boards = items;
		},
		'bonds.selectedBoard'(state, value){
			state.selectedBoard = value;
		},
		'bonds.searchText'(state, value){
			state.searchText = value;
		},
		'bonds.currentPage'(state, value){
			state.currentPage = value;
		},
		'bonds.perPage'(state, value){
			state.perPage = value;
		},
		'bonds.sortBy'(state, value){
			state.sortBy = value;
		},
		'bonds.sortDesc'(state, value){
			state.sortDesc = value;
		},
		'bonds.loading'(state, value){
			state.loading = value;
		}
	},
	actions: {
		changeBondsSelectedBoard({ commit, dispatch }, value){
			commit('bonds.selectedBoard', value);
			commit('bonds.set', []);
			promisesCache.getBonds = null;
			dispatch('getBonds');
		},
		getBonds({ commit, state }){
			if (!promisesCache.getBonds){
				promisesCache.getBonds = new Promise((resolve, reject) => {
					commit('bonds.loading', true);
					moex.getSecuritiesForMarketAndBoard({ market: 'bonds', board: state.selectedBoard }).then((securities) => {
						commit('bonds.set', securities);
						commit('bonds.loading', false);
					}, reject);
				})
			}
			return promisesCache.getBonds;
		},
		getBond({ state, commit }, secid){
			return new Promise((resolve, reject) => {
				if (state.bondsCache[secid]){
					return resolve(state.bondsCache[secid]);
				}
				return moex.getBond(secid).then((item) => {
					commit('bonds.update', item);
					return resolve(state.bondsCache[secid]);
				}, reject);
			});
		},
		getBondsBoards({ commit }){
			if (!promisesCache.getBoardsForMarket){
				promisesCache.getBoardsForMarket = new Promise((resolve, reject) => {
					moex.getBoardsForMarket('bonds').then((items) => {
						commit('bondsBoards.set', items);
					}, reject);
				})
			}
			return promisesCache.getBoardsForMarket;
		}
	}
}