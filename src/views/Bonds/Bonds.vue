<template>
  <b-container fluid class="bonds">
	  <b-form inline>
		 <b-form-input v-model="searchText"/>
	  </b-form>
	  <b-row class="mb-3">
		  <b-col>
			  <b-link class="btn btn-primary" to="/bonds/new">
				  <fa-icon icon="plus"></fa-icon>
				  <span class="ml-2">Новая облигация</span>
			  </b-link>
		  </b-col>
		  <b-col cols="auto">
			  <b-button class="btn btn-success" @click.stop.prevent="exportData">
				  <fa-icon icon="file-excel"></fa-icon>
				  <span class="ml-2">Экспорт в Excel</span>
			  </b-button>
		  </b-col>
	  </b-row>
	  <b-table :items="bonds" :fields="fields">
		  <template slot="name" slot-scope="data">
			  <b-link :to="'/bonds/' + data.item.isin">{{ data.value }}</b-link>
		  </template>
	  </b-table>
  </b-container>
</template>

<script>
	import moment from 'moment';
	import _ from 'lodash';
	import BButton from 'bootstrap-vue/src/components/button/button';
	import XLSX from 'xlsx';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	import BLink from 'bootstrap-vue/src/components/link/link';
	import BTable from 'bootstrap-vue/src/components/table/table';
	import BForm from 'bootstrap-vue/src/components/form/form';
	import BFormInput from 'bootstrap-vue/src/components/form-input/form-input';

	export default {
		name: 'Bonds',
		components: {BFormInput, BForm, BTable, BLink, BCol, BRow, BContainer, BButton },
		data(){
			return {
				searchText: '',
				fields: [
					{ key: 'name', label: 'Название' },
					{ key: 'nextCouponDate', label: 'Дата купона', formatter: 'dateValue' },
					{ key: 'maturationDate', label: 'Дата погашения', formatter: 'dateValue' },
					{ key: 'frequency', label: 'Частота выплат в год' },
					{ key: 'pricePercent', label: 'Цена в процентах от номинала' },
					{ key: 'faceValue', label: 'Номинал' },
					{ key: 'coupon', label: 'Купон (сумма)' },
					{ key: 'couponProfit', label: 'Купонная доходность', formatter: (value, key, item) => 100 *(item.coupon * item.frequency) / (item.faceValue) },
					{ key: 'YTM', label: 'Доходность к погашению', formatter: (value) => this.roundFloat(value*100) },
					{ key: 'modifiedDuration', label: 'Модифицированная дюрация', formatter: (value) => this.roundFloat(value) },
					{ key: 'makoleiDuration', label: 'Дюрация Маколея', formatter: (value) => this.roundFloat(value) },
				]
			};
		},
		computed: {
			bonds(){
				return _.orderBy(this.$store.state.bonds, ['YTM'], ['desc']);
			}
		},
		methods: {
			dateValue(value){
				return moment(value).format('DD.MM.YYYY');
			},
			roundFloat(value){
				return Math.round(value * 100) / 100;
			},
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
						})
					})
				];
				const ws = XLSX.utils.aoa_to_sheet(ws_data);

				/* Add the worksheet to the workbook */
				XLSX.utils.book_append_sheet(workbook, ws, new_ws_name);

				XLSX.writeFile(workbook, 'Облигации.xlsx');

			}
		}
	};
</script>
