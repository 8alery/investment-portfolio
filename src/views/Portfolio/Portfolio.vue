<template>
	<div class="portfolio">
		<b-table :items="items" :fields="fields">
			<template slot="actions" slot-scope="data">
				<b-link :to="'/portfolio/' + data.item.id">Редактировать</b-link>
			</template>
		</b-table>
	</div>
</template>

<script>
	import moment from 'moment';

	export default {
		name: 'Portfolio',
		computed: {
			items(){
				return this.$store.state.portfolio;
			}
		},
		data(){
			return {
				fields: [{
					key: 'bondId',
					label: 'Облигация',
					formatter:(value) => {
						return this.$store.state.bondsCache[value].name;
					}
				}, {
					key: 'amount', 'label': 'Количество'
				},{
					key: 'purchaseDate', 'label': 'Дата покупки', formatter:(value) => moment(value).format('DD.MM.YYYY')
				},{
					key: 'actions', label: ''
				}]
			};
		}
	};
</script>

<style scoped>

</style>