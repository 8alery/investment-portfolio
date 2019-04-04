<template>
  <b-container fluid class="bonds">
	  <b-form>
		  <b-form-row class="mb-2">
			  <b-col cols="auto">
				  <b-form-select
						  v-model="board"
						  :options="bondBoards"
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
		  </b-form-row>
	  </b-form>
	  <b-table striped hover
			   @row-clicked="viewItem"
			   id="bonds"
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
	  <b-row>
		  <b-col>
			  <b-pagination
					  v-model="currentPage"
					  :per-page="perPage"
					  :total-rows="rows">

			  </b-pagination>
		  </b-col>
	  </b-row>
  </b-container>
</template>

<script>
	import moment from 'moment';
	import _ from 'lodash';
	import BButton from 'bootstrap-vue/src/components/button/button';
	import XLSX from 'xlsx';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	import BTable from 'bootstrap-vue/src/components/table/table';
	import BForm from 'bootstrap-vue/src/components/form/form';
	import BFormInput from 'bootstrap-vue/src/components/form-input/form-input';
	import BFormRow from 'bootstrap-vue/src/components/layout/form-row';
	import BSpinner from 'bootstrap-vue/src/components/spinner/spinner';
	import BFormSelect from 'bootstrap-vue/src/components/form-select/form-select';
	import BPagination from 'bootstrap-vue/src/components/pagination/pagination';
	import BRow from 'bootstrap-vue/src/components/layout/row';

	const units = {
		SUR: '₽',
		USD: '$',
		EUR: '€'
	};

	export default {
		name: 'Bonds',
		components: {
			BRow,
			BPagination, BFormSelect, BSpinner, BFormRow, BFormInput, BForm, BTable, BCol, BContainer, BButton },
		data(){
			return {
				usefulBoards: [
					{ value: 'TQOB', text: 'Т+: Облигации - безадрес.' },
					{ value: 'TQOD', text: 'Т+: Облигации (USD) - безадрес.' },
					{ value: 'EQOB', text: 'Т0 Облигации - безадрес.' },
					{ value: 'EQDB', text: 'Основной режим: Облигации Д - безадрес.' },
					{ value: 'EQEO', text: 'Основной режим: Облигации (EUR) - безадрес.' }
				],
				fields: [
					{ key: 'details.BOARDID', label: 'Режим', formatter: (value, key, item) => item.details.BOARDID, sortable: true },
					{ key: 'details.SHORTNAME', label: 'Название', formatter: (value, key, item) => item.details.SHORTNAME, sortable: true },
					{ key: 'marketData.YIELD', label: 'Доходность', formatter: (value, key, item) => item.marketData.YIELD, sortable: true },
					{ key: 'details.COUPONVALUE', label: 'Купон', formatter: (value, key, item) => item.details.COUPONVALUE, sortable: true },
					{ key: 'details.NEXTCOUPON', label: 'Дата купона', formatter: (value, key, item) => moment(item.details.NEXTCOUPON).format('DD.MM.YYYY'), sortable: true },
					{ key: 'details.MATDATE', label: 'Дата погашения', formatter: (value, key, item) => moment(item.details.MATDATE).format('DD.MM.YYYY'), sortable: true },
					{ key: 'details.COUPONPERCENT', label: 'Купон %', formatter: (value, key, item) => item.details.COUPONPERCENT, sortable: true },
					{ key: 'details.COUPONPERIOD', label: 'Период выплаты', formatter: (value, key, item) => item.details.COUPONPERIOD, sortable: true },
					{ key: 'marketData.MARKETPRICE', label: 'Рыночная цена', formatter: (value, key, item) => item.marketData.MARKETPRICE, sortable: true },
					{ key: 'lot', label: 'Лот', formatter: (value, key, item) => `${item.details.LOTSIZE * item.details.FACEVALUE} ${units[item.details.FACEUNIT]}`, sortable: true },
					{ key: 'details.ISIN', label: 'ISIN', formatter: (value, key, item) => item.details.ISIN, sortable: true }
				],
				bondsGroups: [
					{ value: 'custom', text: 'Режим торгов' },
					{ value: 'federal', text: 'ОФЗ' },
					{ value: 'municipal', text: 'Муниципальный' },
					{ value: 'corporate', text: 'Корпоративные' },
					{ value: 'euroFederal', text: 'ЕвроГос' },
					{ value: 'euro', text: 'Еврооблигации' }
				]
			};
		},
		computed: {
			loading(){
				return this.$store.state.bonds.loading;
			},
			board: {
				get(){
					return this.$store.state.bonds.selectedBoard;
				},
				set(value){
					this.$store.dispatch('changeBondsSelectedBoard', value);
				}
			},
			searchText: {
				get(){
					return this.$store.state.bonds.searchText;
				},
				set(value){
					this.$store.commit('bonds.searchText', value);
				}
			},
			currentPage: {
				get(){
					return this.$store.state.bonds.currentPage;
				},
				set(value){
					this.$store.commit('bonds.currentPage', value);
				}
			},
			perPage: {
				get(){
					return this.$store.state.bonds.perPage;
				},
				set(value){
					this.$store.commit('bonds.perPage', value);
				}
			},
			sortBy: {
				get(){
					return this.$store.state.bonds.sortBy;
				},
				set(value){
					this.$store.commit('bonds.sortBy', value);
				}
			},
			sortDesc: {
				get(){
					return this.$store.state.bonds.sortDesc;
				},
				set(value){
					this.$store.commit('shares.sortDesc', value);
				}
			},
			items(){
				return this.$store.getters.bonds;
			},
			itemsFiltered(){
				let items = this.items;

				if (this.searchText){
					const regex = new RegExp(`${this.searchText}`, 'i');
					items = _.filter(items, b => regex.test(b.details.SHORTNAME) || regex.test(b.details.SECNAME) || regex.test(b.details.ISIN)  );
				}

				if (this.sortBy !== 'lot'){
					items = _.orderBy(items, [this.sortBy], [this.sortDesc ? 'desc': 'asc']);
				} else {
					items = _.orderBy(items, [(el) => el.details.LOTSIZE * el.details.FACEVALUE], [this.sortDesc ? 'desc': 'asc']);
				}
				return items;
			},
			itemsVisible(){
				const start = (this.currentPage - 1) * this.perPage;
				return this.itemsFiltered.slice(start, start + this.perPage);
			},
			rows(){
				return this.itemsFiltered.length;
			},
			bondBoards(){
				return _.map(this.$store.getters.bondsBoards, b => ({ value: b.boardid, text: b.title }));
			}
		},
		created(){
			// this.loading = true;
			// this.$store.dispatch('bonds.list').then(() => {
			// 	this.loading = false;
			// });
			this.$store.dispatch('getBonds');
			this.$store.dispatch('getBondsBoards');
		},
		watch: {
			'filter.board'() {
				this.currentPage = 1;
			},
			searchText(){
				this.currentPage = 1;
			},
			sortBy(value){
				console.log('sort by: ', value);
			},
			sortDesc(value){
				console.log('sort Desc: ', value);
			}
		},
		methods: {
			exportData(){
				if (this.bonds.length === 0){
					return;
				}

				const workbook = XLSX.utils.book_new();
				const new_ws_name = 'Облигации';

				const keys = _.keys(_.first(this.bonds));

				const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

				const ws_data = [
					keys,
					..._.map(this.bonds, item => {
						return _.map(keys, key => {
							if (_.isObject(item[key]) || _.isArray(item[key])){
								return JSON.stringify(item[key]);
							} else if (_.isString(item[key]) && isoDateRegex.test(item[key])){
								return new Date(item[key]);
							}
							return item[key];
						});
					})
				];
				const ws = XLSX.utils.aoa_to_sheet(ws_data);

				/* Add the worksheet to the workbook */
				XLSX.utils.book_append_sheet(workbook, ws, new_ws_name);

				XLSX.writeFile(workbook, 'Облигации.xlsx');

			},
			viewItem(item){
				this.$router.push({ name: 'viewBond', params: { secid: item.id, board: item.details.BOARDID } });
			}
		}
	};
</script>
