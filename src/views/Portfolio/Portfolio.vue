<template>
	<div class="portfolio">
		<b-row class="mb-2">
			<b-col></b-col>
			<b-col>
				<b-nav pills>
					<b-nav-item v-for="item in listTypes"
								active-class="active"
								:key="item.value"
								:to="'/portfolio/' + item.value"  >{{ item.text }}</b-nav-item>
				</b-nav>
			</b-col>
			<b-col></b-col>
		</b-row>

		<router-view>

		</router-view>

	</div>
</template>

<script>
	import _ from 'lodash';
	import XLSX from 'xlsx';


	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';

	export default {
		name: 'Portfolio',
		components: { BCol, BRow },
		computed: {
			portfolioTotal(){
				return this.$store.getters.portfolioTotal;
			}
		},
		data(){
			return {
				type: 'orders',
				listTypes: [
					{ value: 'orders', text: 'Покупки' },
					{ value: 'securities', text: 'Бумаги' },
					{ value: 'fees', text: 'Комиссии' }
				]
			};
		},
		created(){

		},
		methods: {
			exportData(){
				const items = this.items;

				if (items.length === 0){
					return;
				}

				const workbook = XLSX.utils.book_new();
				const new_ws_name = 'Портфель';

				const keys = _.keys(_.first(items));

				const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

				const ws_data = [
					keys,
					..._.map(items, item => {
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

				XLSX.writeFile(workbook, `${new_ws_name}.xlsx`);

			}

		}
	};
</script>

<style scoped>

</style>