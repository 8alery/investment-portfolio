<template>
	<b-container>
		<div>
			<h2>{{ security && security.details.SECNAME }}</h2>
			<b-row>
				<b-col>Получено: {{ totalPayments | roundFloat(2) }}₽</b-col>
				<b-col>Потрачено: {{  totalCost | roundFloat(2) }}₽</b-col>
				<b-col>Период: {{  periodLength }} дней</b-col>
				<b-col>Доходность (годовых): {{  yieldYearly | roundFloat(2) }}%</b-col>
			</b-row>
		</div>
		<b-row>
			<b-col>
				<h2>Покупки</h2>
				<b-table hover striped :fields="orderFields" :items="orders"></b-table>
			</b-col>
			<b-col>
				<h2>Выплаты</h2>
				<b-table hover striped :fields="paymentFields" :items="payments"></b-table>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
	import _ from 'lodash';
	import moment from 'moment';
	import helpers from '../../js/helpers';

	import BTable from 'bootstrap-vue/src/components/table/table';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	export default {
		name: 'ViewSecurity',
		components: {BCol, BContainer, BTable},
		data(){
			return {
				orderFields: [
					{ key: 'purchaseDate', label: 'Дата', formatter: 'dateValue' },
					{ key: 'price', label: 'Цена' },
					{ key: 'amount', label: 'Количество' },
					{ key: 'total', label: 'Итого', formatter: 'totalPrice' }
				],
				paymentFields: [
					{ key: 'date', label: 'Дата', formatter: 'dateValue' },
					{ key: 'type', label: 'Тип', formatter: 'paymentType' },
					{ key: 'value', label: 'Выплата за единицу' },
					{ key: 'amount', label: 'В портфеле' },
					{ key: 'total', label: 'Итого' }
				]
			}
		},
		computed: {
			secid() {
				return this.$route.params.id;
			},
			security() {
				const bond = this.$store.getters.bondsCache[this.secid];
				if (bond && (!bond.payments || _.isEmpty(bond.payments))){
					this.$store.dispatch('bonds.getPayments', bond.id);
				}
				return bond || this.$store.getters.sharesCache[this.secid];
			},
			orders() {
				return _.filter(this.$store.getters.portfolioOrders, o => o.secid === this.secid);
			},
			period(){
				const firstOrder = _.minBy(this.orders, o => o.purchaseDate);
				if (firstOrder){
					return {
						from: moment(firstOrder.purchaseDate).toDate(),
						to: new Date()
					}
				}
				return null;
			},
			periodLength(){
				if (this.period){
					return moment(this.period.to).diff(this.period.from, 'days');
				}
				return 0;
			},
			payments(){
				if (this.security && this.security.type === 'bonds'){
					const period = this.period;
					if (period){
						const payments = helpers.getBondPaymentsForPeriod({ bond: this.security, from: period.from, to: period.to });
						helpers.calculateOwnershipForPayments({ payments, orders: this.orders });
						return payments;
					}
				}
				return null;
			},
			totalPayments(){
				return _.reduce(this.payments, (acc, el) => acc + el.total, 0);
			},
			totalCost(){
				return _.reduce(this.orders, (acc, item) => acc + item.amount*item.price + item.nkd, 0);
			},
			yieldYearly(){
				if (!this.periodLength){
					return 0;
				}

				return 365 * (100 * this.totalPayments / this.totalCost) / this.periodLength

			}
		},
		created() {
			// TODO: single method for all securities
			this.$store.dispatch('bonds.get', this.secid);
			this.$store.dispatch('shares.get', this.secid);
			this.$store.dispatch('getOrders');
		},
		methods: {
			dateValue(value){
				return moment(value).format('DD.MM.YYYY');
			},
			totalPrice(value, key, item){
				return item.amount*item.price + item.nkd;
			},
			paymentType(value){
				switch (value) {
					case 'coupon':
						return 'Купон';
					case 'amortization':
						return 'Амортизация';
					default:
						return value;
				}
			}
		}
	}
</script>

<style scoped>

</style>