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
							id="priceGroup"
							label="Цена покупки:"
							label-for="price">
						<b-form-input
								step="any"
								id="price"
								type="number"
								v-model.number="item.price"
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
					<b-button class="mt-4 ml-2" type="button" variant="danger" @click="deleteItem">Удалить</b-button>
				</b-col>
				<b-col cols="4">
					<div>Инструмент: {{ bond.SHORTNAME }}</div>

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
		name: 'EditPortfolioOrder',
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
			id(){
				return this.$route.params.id;
			},
			bond(){
				return this.$store.getters.bondsCache[this.item.secid] || {};
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
			}
		},
		created(){
			this.$store.dispatch('getOrder', this.id).then((item) => {
				this.item = _.extend({ price: 0 }, item);
				this.$store.dispatch('bonds.get', item.secid);
			});

		},
		methods: {
			setDate(field, value){
				this.item[field] = moment(value).toDate();
			},
			save(){
				this.$store.dispatch('updateOrder', this.item).then(() => {
					this.$router.push('/portfolio');
				});
			},
			deleteItem(){
				this.$store.dispatch('deleteOrder', this.item.id).then(() => {
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