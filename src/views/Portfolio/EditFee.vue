<template>
	<b-container>
		<b-form @submit.prevent="save" v-if="item">
			<b-form-group
					id="dateGroup"
					label="Дата платежа:"
					label-for="date">
				<datepicker v-model="date"
							format="dd.MM.yyyy"
							name="uniquename"></datepicker>
			</b-form-group>
			<b-form-group
					id="amountGroup"
					label="Сумма:"
					label-for="amount">
				<b-form-input
						id="amount"
						type="number"
						step="any"
						v-model.number="item.amount"/>
			</b-form-group>
			<b-form-group
					id="commentGroup"
					label="Коментарий:"
					label-for="comment">
				<b-form-input
						id="comment"
						type="text"
						v-model="item.comment"/>
			</b-form-group>
			<b-button class="mt-4" type="submit" variant="primary">Сохранить</b-button>
		</b-form>
	</b-container>
</template>

<script>
	import moment from 'moment';
	import _ from 'lodash';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BForm from 'bootstrap-vue/src/components/form/form';
	import Datepicker from 'vuejs-datepicker';
	export default {
		name: 'EditFee',
		components: {BForm, BContainer, Datepicker},
		data(){
			return {
				item: null
			}
		},
		computed: {
			id(){
				return this.$route.params.id;
			},
			date:{
				get(){
					return moment(this.item.date).toDate();
				},
				set(value){
					this.item.date = moment(value, 'YYYY-MM-DD').toDate();
				}
			},
		},
		created(){
			if (this.id){
				this.$store.dispatch('getPortfolioFee', this.id).then((item) => {
					this.item = _.clone(item);
				});
			} else {
				this.item = { date: new Date(), amount: 0, comment: null };
			}
		},
		methods: {
			save(){
				this.$store.dispatch('savePortfolioFee', this.item).then(() => {
					this.$router.push('/portfolio/fees');
				});
			}
		}
	};
</script>

<style scoped>

</style>