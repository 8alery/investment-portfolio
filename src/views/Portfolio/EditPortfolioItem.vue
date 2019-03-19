<template>
	<b-container>
		<b-form v-if="item" @submit.prevent="save">
			<b-row>
				<b-col cols="8">



					<b-form-group
							id="amountGroup"
							label="Количество:"
							label-for="amount">
						<b-form-input
								id="amount"
								type="number"
								v-model.number="item.amount"
						/>
					</b-form-group>
					<b-form-group
							id="purchaseDateGroup"
							label="Дата покупки:"
							label-for="purchaseDate">
						<datepicker id="purchaseDate" :value="purchaseDate" format="dd.MM.yyyy"
									@input="setDate('purchaseDate', $event)"
									name="purchaseDate"></datepicker>
					</b-form-group>
					<b-button class="mt-4" type="submit" variant="primary">Сохранить</b-button>
				</b-col>
				<b-col cols="4">
					<div>Инструмент: {{ bond.name }}</div>
					<div>Ближайший купон: {{ nextCouponDate }}</div>

					<b-table :items="moneyFlow" :fields="flowFields" thead-class="hidden_header"></b-table>

				</b-col>
			</b-row>
		</b-form>
	</b-container>
</template>

<script>
	import Datepicker from 'vuejs-datepicker';
	import moment from 'moment';
	import helpers from '../../js/helpers';

	export default {
		name: 'EditPortfolioItem',
		components: { Datepicker },
		data(){
			return {
				item: null,
				flowFields: [
					{ key: 'date', formatter:(value) => moment(value).format('DD.MM.YYYY') },
					{ key: 'coupon', formatter:(value) => Math.round(value * 100) / 100 }
				]
			};
		},
		computed: {
			bond(){
				return this.$store.state.bondsCache[this.item.bondId];
			},
			nextCouponDate(){
				let currentDate = moment(this.bond.maturationDate);
				let previousDate = currentDate;
				const now = moment();
				const period = Math.floor(365/this.bond.frequency);
				while(currentDate.diff(now, 'days') > 0){
					previousDate = moment(currentDate);
					currentDate = currentDate.add(-1*period, 'days');
				}
				return previousDate.format('DD.MM.YYYY');
			},
			purchaseDate(){
				return this.item.purchaseDate && moment(this.item.purchaseDate).toDate();
			},
			moneyFlow(){
				return helpers.getCouponMoneyFlowForBond({
					startDate: this.item.purchaseDate,
					bond: this.bond
				});
			}
		},
		created(){
			this.$store.dispatch('getPortfolioItem', this.$route.params.item_id).then((item) => {
				this.item = item;
			});
		},
		methods: {
			setDate(field, value){
				this.item[field] = moment(value).toDate();
			},
			save(){
				this.$store.dispatch('savePortfolioItem', this.item).then(() => {
					this.$router.push('/portfolio');
				});
			}
		}
	};
</script>

<style>

	.hidden_header {
		display: none;
	}

</style>