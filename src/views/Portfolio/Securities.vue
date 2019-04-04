<template>
	<b-container>
		<b-row class="mb-2">
			<b-col>
				Цена рыночная: {{ totalMarketPrice | roundFloat(2) }}₽
			</b-col>
		</b-row>
		<b-table striped hover
				 @row-clicked="viewItem"
				 :fields="fields"
				 :items="items">
		</b-table>
	</b-container>
</template>

<script>
	import BTable from 'bootstrap-vue/src/components/table/table';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	export default {
		name: 'Securities',
		components: {BContainer, BTable},
		computed: {
			items(){
				return this.$store.getters.portfolioSecurities;
			},
			totalMarketPrice(){
				return this.$store.getters.portfolioOrdersTotalMarketPrice;
			}
		},
		data(){
			return {
				fields: [
					{ key: 'name', formatter: (value, key, item) => item.security.details.SHORTNAME },
					{ key: 'amount' },
					{ key: 'marketPrice', formatter:(value, key, item) => item.security.marketData.MARKETPRICE },
					{ key: 'totalValue', formatter:(value, key, item) => item.security.marketData.MARKETPRICE * item.amount * item.security.details.FACEVALUE / 100 }
				]
			}
		},
		created(){
			this.$store.dispatch('getOrders');
			this.$store.dispatch('bonds.list');
			this.$store.dispatch('shares.list');
		},
		methods: {
			viewItem(item){
				this.$router.push({ name: 'viewPortfolioSecurity', params: { id: item.secid } });
			}
		}
	};
</script>

<style scoped>

</style>