<template>
	<b-container fluid>
		<b-row>
			<b-col cols="auto">
				<b-pagination
						v-model="currentPage"
						:total-rows="rows"
						:per-page="perPage"/>
			</b-col>
			<b-col cols="auto">
				<b-form-select
						v-model="board"
						:options="sharesBoards"
				></b-form-select>
			</b-col>
			<b-col>
				<b-form-input
						v-model="searchText"
						placeholder="Поиск..."/>
			</b-col>
			<b-col cols="auto">
				<b-button class="btn btn-success" @click.stop.prevent="exportData">
					<fa-icon icon="file-excel"></fa-icon>
					<span class="ml-2">Экспорт в Excel</span>
				</b-button>
			</b-col>
		</b-row>
		<b-table striped hover
				 @row-clicked="viewItem"
				 id="shares"
				 :busy="loading"
				 :no-local-sorting="true"
				 :fields="fields"
				 :sort-by.sync="sortBy"
				 :sort-desc.sync="sortDesc"
				 :items="itemsVisible" small>
			<div slot="table-busy" class="text-center text-success my-2">
				<b-spinner class="align-middle" />
				<strong>Загрузка...</strong>
			</div>
		</b-table>
	</b-container>
</template>

<script>
	import _ from 'lodash';

	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BTable from 'bootstrap-vue/src/components/table/table';
	import BPagination from 'bootstrap-vue/src/components/pagination/pagination';
	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	import BFormSelect from 'bootstrap-vue/src/components/form-select/form-select';
	import BFormInput from 'bootstrap-vue/src/components/form-input/form-input';
	import BButton from 'bootstrap-vue/src/components/button/button';

	const units = {
		SUR: '₽',
		USD: '$',
		EUR: '€'
	};


	export default {
		name: 'Shares',
		components: {BButton, BFormInput, BFormSelect, BCol, BRow, BPagination, BTable, BContainer},
		data(){
			return {
				// fields: [
				// 	{ key: 'SECID' },
				// 	{ key: 'SHORTNAME' },
				// 	{ key: 'SECNAME' },
				// 	{ key: 'PREVPRICE' },
				// 	{ key: 'LOTSIZE' },
				// 	{ key: 'ISIN' },
				// 	{ key: 'LISTLEVEL' },
				// 	{ key: 'VALUE' },
				// 	{ key: 'MARKETPRICE' }
				// ]
				fields: [
					{ key: 'details.BOARDID', label: 'Режим', formatter: (value, key, item) => item.details.BOARDID, sortable: true },
					{ key: 'details.SHORTNAME', label: 'Название', formatter: (value, key, item) => item.details.SHORTNAME, sortable: true },
					{ key: 'marketData.MARKETPRICE', label: 'Рыночная цена', formatter: (value, key, item) => item.marketData.MARKETPRICE, sortable: true },
					{ key: 'lot', label: 'Лот', formatter: (value, key, item) => `${item.details.LOTSIZE * item.details.FACEVALUE} ${units[item.details.FACEUNIT]}`, sortable: true },
					{ key: 'details.ISIN', label: 'ISIN', formatter: (value, key, item) => item.details.ISIN, sortable: true }
				],
			};
		},
		computed: {
			items(){
				return this.$store.getters.shares;
			},
			itemsFiltered(){
				let items = this.items;
				if (this.searchText){
					const regex = new RegExp(`${this.searchText}`, 'i');
					items = _.filter(items, b => regex.test(b.SHORTNAME) );
				}
				items = _.orderBy(items, [this.sortBy], [this.sortDesc ? 'desc': 'asc']);
				return items;
			},
			itemsVisible(){
				const start = (this.currentPage - 1) * this.perPage;
				return this.itemsFiltered.slice(start, start + this.perPage);
			},
			rows(){
				return this.itemsFiltered.length;
			},
			sharesBoards(){
				return _.map(this.$store.getters.sharesBoards, b => ({ value: b.boardid, text: b.title }));
			},
			loading(){
				return this.$store.state.bonds.loading;
			},
			board: {
				get(){
					return this.$store.state.shares.selectedBoard;
				},
				set(value){
					this.$store.dispatch('changeSharesSelectedBoard', value);
				}
			},
			searchText: {
				get(){
					return this.$store.state.shares.searchText;
				},
				set(value){
					this.$store.commit('shares.searchText', value);
				}
			},
			currentPage: {
				get(){
					return this.$store.state.shares.currentPage;
				},
				set(value){
					this.$store.commit('shares.currentPage', value);
				}
			},
			perPage: {
				get(){
					return this.$store.state.shares.perPage;
				},
				set(value){
					this.$store.commit('shares.perPage', value);
				}
			},
			sortBy: {
				get(){
					return this.$store.state.shares.sortBy;
				},
				set(value){
					this.$store.commit('shares.sortBy', value);
				}
			},
			sortDesc: {
				get(){
					return this.$store.state.shares.sortDesc;
				},
				set(value){
					this.$store.commit('shares.sortDesc', value);
				}
			}
		},
		watch: {
			'filter.board'() {
				this.currentPage = 1;
			},
			searchText(){
				this.currentPage = 1;
			}
		},
		created(){
			this.$store.dispatch('getShares');
			this.$store.dispatch('getSharesBoards');
		},
		methods:{
			viewItem(item){
				this.$router.push({ name: 'viewShare', params: { secid: item.SECID } });
			}
		}
	};
</script>

<style scoped>

</style>