<template>
	<b-container>
		<b-row class="mb-3">
			<b-col>
				<b-link class="btn btn-primary ml-2" to="/portfolio/fees/new">
					<fa-icon icon="plus"></fa-icon>
					<span class="ml-2">Новая запись</span>
				</b-link>
			</b-col>
			<b-col cols="auto">{{ total | roundFloat(2) }}₽</b-col>
		</b-row>
		<b-table hover striped
				 @row-clicked="editItem"
				 :fields="fields"
				 :items="items"></b-table>
	</b-container>
</template>

<script>
	import moment from 'moment';
	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	import BLink from 'bootstrap-vue/src/components/link/link';
	import BTable from 'bootstrap-vue/src/components/table/table';
	import BContainer from 'bootstrap-vue/src/components/layout/container';

	export default {
		name: 'Fees',
		components: {BContainer, BTable, BLink, BCol, BRow},
		data(){
			return {
				fields: [
					{ key: 'date', label: 'Дата', formatter: (value) => moment(value).format('DD.MM.YYYY') },
					{ key: 'amount', label: 'Сумма' },
					{ key: 'comment', label: 'Коментарий' }
				]
			}
		},
		computed: {
			items(){
				return this.$store.getters.portfolioFees;
			},
			total(){
				return this.$store.getters.portfolioFeesTotal;
			}
		},
		created(){
			this.$store.dispatch('getPortfolioFees');
		},
		methods: {
			editItem(item){
				this.$router.push({ name: 'editPortfolioFee', params: { id: item.id } });
			}
		}
	};
</script>

<style scoped>

</style>