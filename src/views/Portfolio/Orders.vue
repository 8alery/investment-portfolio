<template>
	<b-container>
		<b-row class="mb-2">
			<b-col>
				Цена покупки: {{ totalPurchasePrice }}₽
			</b-col>
			<b-col>
				Цена рыночная: {{ totalMarketPrice | roundFloat(2) }}₽
			</b-col>
			<b-col>
				<label for="file-import" class="btn btn-success btn-sm">
					<fa-icon icon="file-excel"></fa-icon>
					<span class="ml-2">Импорт из CSV</span>
					<input id="file-import" style="display: none" type="file" ref="fileimport" accept=".xlsx" @change="onFileChange">
				</label>
			</b-col>
		</b-row>
		<b-table striped hover
				 @row-clicked="editItem"
				 :items="items"
				 :fields="fields">
			<template slot="actions" slot-scope="data">
				<b-link :to="{ name: 'editPortfolio', params: { id: data.item.id } }">Редактировать</b-link>
			</template>
		</b-table>
	</b-container>
</template>

<script>
	import moment from 'moment';
	import XLSX from 'xlsx';


	import BTable from 'bootstrap-vue/src/components/table/table';

	import BLink from 'bootstrap-vue/src/components/link/link';
	import BContainer from 'bootstrap-vue/src/components/layout/container';
	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';

	export default {
		name: 'Orders',
		components: { BCol, BRow, BContainer, BLink, BTable},
		computed: {
			items(){
				return this.$store.getters.portfolioOrders;
			},
			totalMarketPrice(){
				return this.$store.getters.portfolioOrdersTotalMarketPrice;
			},
			totalPurchasePrice(){
				return this.$store.getters.portfolioOrdersTotalPurchasePrice;
			}
		},
		data(){
			return {
				fields: [
					{
						key: 'secid',
						label: 'Инструмент',
						formatter:() => {

							// const bond = this.$store.getters.bondsCache[value];
							// if (bond){
							// 	return bond.details.SHORTNAME;
							// }
							// const share = this.$store.getters.sharesCache[value];
							// if (share){
							// 	return share.details.SHORTNAME;
							// }
						}
					},
					{
						key: 'amount', 'label': 'Количество'
					},
					{
						key: 'purchaseDate', 'label': 'Дата покупки', formatter:(value) => moment(value).format('DD.MM.YYYY')
					},
					{
						key: 'price', label: 'Цена покупки'

					},
					{
						key: 'nkd', label: 'НКД'

					},
					{
						key: 'totalValue', label: 'Стоимость',
						formatter:(value, key, item) => {
							return item.amount * item.price + item.nkd;
						}

					},{
						key: 'actions', label: ''
					}]
			};
		},
		created(){
			this.$store.dispatch('getOrders');
			this.$store.dispatch('bonds.list');
			this.$store.dispatch('shares.list');
		},
		methods: {
			editItem(item){
				this.$router.push({ name: 'editPortfolioOrder', params: { id: item.id } });
			},
			onFileChange(e){
				const rABS = true;

				const files = e.target.files || e.dataTransfer.files;
				if (!files){
					return;
				}

				const importFile = files[0];
				const reader = new FileReader();
				reader.onload = (e) => {
					let data = e.target.result;
					if(!rABS) data = new Uint8Array(data);
					const workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
					const sheetName = workbook.SheetNames[0];
					const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
					this.$store.dispatch('importPortfolioOrders', json);
				};
				if(rABS) reader.readAsBinaryString(importFile); else reader.readAsArrayBuffer(importFile);

			}
		}

	};
</script>

<style scoped>

</style>