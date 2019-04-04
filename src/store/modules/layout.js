export default {
	state: {
		bonds: {
			filter: {
				board: 'TQOB'
			},
			searchText: '',
			currentPage: 1,
			perPage: 20,
			sortBy: 'marketData.YIELD',//'YIELD',
			sortDesc: true,
			kind: 'federal'
		}
	},
	mutations: {
		'layout.bonds.filter.board'(state, value){
			state.bonds.filter.board = value;
		},
		'layout.bonds.searchText'(state, value){
			state.bonds.searchText = value;
		},
		'layout.bonds.currentPage'(state, value){
			state.bonds.currentPage = value;
		},
		'layout.bonds.perPage'(state, value){
			state.bonds.perPage = value;
		},
		'layout.bonds.sortBy'(state, value){
			state.bonds.sortBy = value;
		},
		'layout.bonds.sortDesc'(state, value){
			state.bonds.sortDesc = value;
		},
		'layout.bonds.kind'(state, value){
			state.bonds.kind = value;
		}
	}
}