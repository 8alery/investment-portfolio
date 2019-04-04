<template>
  <b-container class="bonds">

	  <b-row class="mb-3">
		  <b-col cols="auto">
			  <b-button variant="outline-primary" @click="addToPortfolio">
				  <fa-icon class="mr-2" icon="briefcase"></fa-icon>
				  <span>Добавить в портфель</span>
			  </b-button>
		  </b-col>
	  </b-row>
	  <b-row>
		  <b-col cols="8">
			  <b-tabs>
				  <b-tab title="Общие сведения"
						 :class="{ active: selectedSection == 'details' }"
						 @click="selectedSection = 'details'">
					  <b-table striped hover :items="details"></b-table>
				  </b-tab>
				  <b-tab title="Рыночная информация"
						 :class="{ active: selectedSection == 'marketData' }"
						 @click="selectedSection = 'marketData'">
					  <b-table striped hover :items="marketData"></b-table>
				  </b-tab>
				  <b-tab title="Расчет доходности"
						 :class="{ active: selectedSection == 'calculateYield' }"
						 @click="selectedSection = 'calculateYield'">
					  <b-form @submit.prevent="calculateYield">

						  <b-form-group label="Цена">
							  <b-form-input
									  id="input-1"
									  v-model="targetPrice"
									  type="number"
									  step="any"
									  placeholder="100%"
							  ></b-form-input>
						  </b-form-group>

						  <b-button type="submit" variant="primary">Рассчитать</b-button>
					  </b-form>

					  <div>Доходность: {{ effectiveYield }}</div>
					  <div>НКД: {{ nkd }}</div>

				  </b-tab>
			  </b-tabs>


		  </b-col>
		  <b-col cols="4">
			  <b-tabs>
				  <b-tab title="Купоны"
						 @click="selectedTab = 'coupons'"
						 :class="{ active: selectedTab == 'coupons' }">
					  <b-table striped hover
							   :tbody-tr-class="couponRowClass"
							   :fields="couponsFields"
							   :items="coupons"></b-table>
				  </b-tab>
				  <b-tab title="Амортизации"
						 @click="selectedTab = 'amortizations'"
						 :class="{ active: selectedTab == 'amortizations' }">
					  <b-table striped hover
							   :tbody-tr-class="amortizationRowClass"
							   :items="amortizations"
							   :fields="amortizationsFields"></b-table>
				  </b-tab>
				  <b-tab title="Оферты"
						 @click="selectedTab = 'offers'"
						 :class="{ active: selectedTab == 'offers' }">
					  <b-table striped hover
							   :items="offers"></b-table>
				  </b-tab>
			  </b-tabs>
		  </b-col>
	  </b-row>
  </b-container>
</template>

<script>
	import moment from 'moment';
	import _ from 'lodash';
	import helpers from '../../js/helpers';

	import BTable from 'bootstrap-vue/src/components/table/table';
	import BRow from 'bootstrap-vue/src/components/layout/row';
	import BCol from 'bootstrap-vue/src/components/layout/col';
	import BButton from 'bootstrap-vue/src/components/button/button';
	import BTabs from 'bootstrap-vue/src/components/tabs/tabs';
	import BTab from 'bootstrap-vue/src/components/tabs/tab';
	import BForm from 'bootstrap-vue/src/components/form/form';
	import BFormGroup from 'bootstrap-vue/src/components/form-group/form-group';
	import BFormInput from 'bootstrap-vue/src/components/form-input/form-input';


	export default {
		name: 'ViewBond',
		components: {BFormInput, BFormGroup, BForm, BTab, BTabs, BButton, BCol, BRow, BTable},
		data(){
			return {
				params: {
					isin: null,
					name: null,
					nextCouponDate: moment(),
					maturationDate: moment(),
					frequency: 2,
					coupon: 0,
					pricePercent: 100,
					faceValue: 1000, // face value
					rate: 0,
					periods: [],
					YTM: null,
					hasAmortization: false,
					amortizations: []
				},
				fields: [
					{ key: 'date', label: 'Дата', formatter:(value) => moment(value).format('DD.MM.YYYY')  },
					{ key: 'money', label: 'Купон', formatter: 'roundFloat'  },
					{ key: 'price', label: 'Цена', formatter: 'roundFloat'  },
					{ key: 'nkd', label: 'НКД', formatter: 'roundFloat'  },
					{ key: 'amortization', label: 'Амортизация'}
				],
				moneyFlowFields: [
					{ key: 'date', formatter: (value) => moment(value).format('DD.MM.YYYY') },
					{ key: 'coupon' },
					{ key: 'period' }
				],
				selectedTab: 'coupons',
				amortizationsFields: [
					{ key: 'amortdate', label: 'Дата', formatter: (value) => moment(value).format('DD.MM.YYYY') },
					{ key: 'value', label: 'Значение' },
					{ key: 'data_source', label: 'Тип' }
				],
				couponsFields: [
					{ key: 'coupondate', label: 'Дата', formatter: (value) => moment(value).format('DD.MM.YYYY') },
					{ key: 'value', label: 'Значение' }
				],
				selectedSection: 'calculateYield',
				targetPrice: 100,
				effectiveYield: 0,
				nkd: 0
			};
		},
		computed: {
			secid(){
				return this.$route.params.secid;
			},
			board(){
				return this.$route.params.board;
			},
			item(){
				return this.$store.getters.bondsCache[this.secid];
				//return this.$store.getters.bondsCache[this.secid] && this.$store.getters.bondsCache[this.secid].boards[this.board];
			},
			details(){
				return this.item && _.map(_.keys(this.item.info), key => ({ key, value: this.item.info[key] }));
			},
			marketData(){
				return this.item && this.item.boards[this.board] &&  _.map(_.keys(this.item.boards[this.board]), key => ({ key, value: this.item.boards[this.board][key] }));
			},
			amortizations(){
				return this.item && this.item.payments && this.item.payments.amortizations;
			},
			coupons(){
				return this.item && this.item.payments && this.item.payments.coupons;
			},
			offers(){
				return this.item && this.item.payments && this.item.payments.offers;
			},
			closestAmortizationDate(){
				const now = Date.now();
				for (let amort of this.amortizations){
					if (moment(amort.amortdate).valueOf() >= now){
						return amort.amortdate;
					}
				}
				return null;
			},
			closestCouponDate(){
				const now = Date.now();
				for (let el of this.coupons){
					if (moment(el.coupondate).valueOf() >= now){
						return el.coupondate;
					}
				}
				return null;
			}
			// moneyFlow(){
			// 	if (this.item){
			// 		return helpers.getCouponMoneyFlowForBond({ startDate: new Date(), bond: this.item });
			// 	}
			// 	return [];
			// }
		},
		created(){
			if (this.secid){
				this.$store.dispatch('getBond', this.secid);
			}
		},
		methods: {
			addToPortfolio(){
				this.$store.dispatch('addOrder', { secid: this.secid, market: 'bonds' }).then((item) => {
					this.$router.push({ name: 'editPortfolio', params: { id: item.id } });
				});

			},
			amortizationRowClass(item){
				if (!item) return;
				if (item.amortdate === this.closestAmortizationDate){
					return 'table-success';
				}
			},
			couponRowClass(item){
				if (!item) return;
				if (item.coupondate === this.closestCouponDate){
					return 'table-success';
				}
			},
			calculateYield(){
				const { yieldToMaturity, nkd } = helpers.calculateYieldForPrice(this.targetPrice, new Date(), this.item);
				this.effectiveYield = yieldToMaturity;
				this.nkd = nkd;
			}
		}
	};
</script>
