<template>
  <b-container fluid class="bonds">
	  <b-link to="/bonds/new">Новая облигация</b-link>
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

	export default {
		name: 'Bonds',
		data(){
			return {
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
				return this.$store.state.bonds;
			}
		},
		methods: {
			dateValue(value){
				return moment(value).format('DD.MM.YYYY');
			},
			roundFloat(value){
				return Math.round(value * 100) / 100;
			}
		}
	};
</script>
