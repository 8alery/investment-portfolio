<template>
  <b-container class="bonds">
	  <b-row>
		  <b-col cols="8">
			  <b-form @submit.prevent="calculate">
				  <b-form-group
						  id="exampleInputGroupISIN"
						  label="ISIN:"
						  label-for="exampleInputISIN">
					  <b-form-input
							  id="exampleInputISIN"
							  type="text"
							  v-model="params.isin"
							  required
							  placeholder="ISIN" />
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup1"
						  label="Название:"
						  label-for="exampleInput1">
					  <b-form-input
							  id="exampleInput1"
							  type="text"
							  v-model="params.name"
							  required
							  placeholder="Название облигации" />
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup21"
						  label="Дата купона:"
						  label-for="exampleInput21">
					  <datepicker :value="nextCouponDate" format="dd.MM.yyyy"
								  @input="setDate('nextCouponDate', $event)"
								  name="uniquename"></datepicker>
					  <!--<b-form-input-->
							  <!--id="exampleInput21"-->
							  <!--type="date"-->
							  <!--:value="nextCouponDate"-->
							  <!--@input="setDate('nextCouponDate', $event)"-->
							  <!--required/>-->
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup2"
						  label="Дата погашения:"
						  label-for="exampleInput2">
					  <datepicker :value="maturationDate" format="dd.MM.yyyy"
								  @input="setDate('maturationDate', $event)"
								  name="uniquename"></datepicker>
					  <!--<b-form-input-->
							  <!--id="exampleInput2"-->
							  <!--type="date"-->
							  <!--:value="maturationDate"-->
							  <!--@input="setDate('maturationDate', $event)"-->
							  <!--required />-->
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup3"
						  label="Частота выплаты купонов:"
						  label-for="exampleInput3">
					  <b-form-input
							  id="exampleInput3"
							  type="number"
							  v-model.number="params.frequency"
							  required
					  />
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup4"
						  label="Текущая цена (% от номинала):"
						  label-for="exampleInput4">
					  <b-form-input
							  id="exampleInput4"
							  type="number"
							  step="any"
							  v-model.number="params.pricePercent"
							  required />
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup5"
						  label="Размер купона:"
						  label-for="exampleInput5">
					  <b-form-input
							  id="exampleInput5"
							  type="number"
							  step="any"
							  v-model.number="params.coupon"
							  required />
				  </b-form-group>
				  <b-form-group
						  id="exampleInputGroup6"
						  label="Номинал:"
						  label-for="exampleInput6">
					  <b-form-input
							  id="exampleInput6"
							  type="number"
							  v-model.number="params.faceValue"
							  required />
				  </b-form-group>
				  <b-form-checkbox
						  id="checkbox1"
						  name="checkbox1"
						  v-model="params.hasAmortization">
					  Амортизация долга
				  </b-form-checkbox>

				  <b-form-row v-if="params.hasAmortization">
					  <b-col>
						  <b-button type="button" variant="outline-primary" @click="addAmortization">Добавить дату амортизации</b-button>
						  <b-table :items="params.amortizations">
							  <template slot="date" slot-scope="data">
								  <b-form-input
										  type="date"
										  v-model="data.item.date"/>
							  </template>
							  <template slot="value" slot-scope="data">
								  <b-form-input
										  type="number"
										  step="any"
										  v-model.number="data.item.value"/>
							  </template>
						  </b-table>
					  </b-col>
				  </b-form-row>



				  <!--<b-form-row>-->
					  <!--<b-col>-->
						  <!--<div v-for="item of params.amortizations">{{ item.date }}: {{ item.value }}</div>-->
					  <!--</b-col>-->
				  <!--</b-form-row>-->




				  <b-button class="mt-4" type="submit" variant="primary">Рассчитать доходность</b-button>
				  <b-button class="mt-4 ml-2" type="button" variant="outline-primary" @click="addToPortfolio">Добавить в портфель</b-button>
				  <b-button class="mt-4 ml-2" type="button" variant="danger" @click="remove">Удалить</b-button>
			  </b-form>
		  </b-col>
		  <b-col cols="4">
			  <b-table :items="params.periods" :fields="fields">
			  </b-table>

			  <div>Доходность к погашению: {{ roundFloat(params.YTM * 100) }}%</div>
			  <div>Модифицированная дюрация: {{ roundFloat(params.modifiedDuration) }} лет</div>
			  <div>Дюрация Маколея: {{ roundFloat(params.makoleiDuration) }} лет</div>

		  </b-col>
	  </b-row>
  </b-container>
</template>

<script>
	import moment from 'moment';
	import _ from 'lodash';
	import Datepicker from 'vuejs-datepicker';

	const precition = 0.000001;

	const xiff = (values, dates, rate) => {

		const firstPeriod = _.first(dates);

		rate = 0;

		if (values.length === dates.length && values[0] < 0){
			let p = 0;

			for (let i = 0; i < values.length; i += 1){
				const periodLength = dates[i].diff(firstPeriod, 'days') / 365;
				p +=  values[i] / Math.pow(1 + rate, periodLength);
			}

			if (p < 0){

				do {
					rate = rate - precition;
					p = 0;
					for (let i = 0; i < values.length; i += 1){
						const periodLength = dates[i].diff(firstPeriod, 'days') / 365;
						p += values[i] / Math.pow(1 + rate, periodLength);
					}
				} while (p <= 0);

			} else {
				do {
					rate = rate + precition;
					p = 0;
					for (let i = 0; i < values.length; i += 1){
						const periodLength = dates[i].diff(firstPeriod, 'days') / 365;
						p += values[i] / Math.pow(1 + rate, periodLength);
					}
				} while (p >= 0);
			}

			return rate;

		} else {
			throw new Error('Bad data');
		}
	};

	export default {
		name: 'Bonds',
		components: {Datepicker},
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
				]
			};
		},
		computed: {
			maturationDate(){
				return moment(this.params.maturationDate).toDate();//.format('YYYY-MM-DD');
			},
			nextCouponDate(){
				return moment(this.params.nextCouponDate).toDate();//.format('YYYY-MM-DD');
			},
			ratePerPeriod(){
				return this.params.coupon / this.params.faceValue;
			},
			interval(){
				return Math.floor(365 / this.params.frequency);
			},
			couponForHalfYear(){
				return (this.params.frequency * this.params.coupon) / 2;
			},
			YTMForHalfYear(){
				return this.params.YTM / 2;
			},
			daysInPeriod(){
				return 365 / this.params.frequency;
			}
		},
		created(){
			if (this.$route.params.bond_id){
				this.$store.dispatch('getBond', this.$route.params.bond_id).then((item) => {
					this.$set(item, 'amortizations', item.amortizations || []);
					this.params = item;
				});
			}
		},
		methods: {
			setDate(field, value){
				this.params[field] = moment(value, 'YYYY-MM-DD');
			},
			calculate(){

				const current = moment(this.params.nextCouponDate);

				const periods = [];

				const nkdPeriod = this.interval - current.diff(moment(), 'days');

				const nkd = this.params.coupon * nkdPeriod/this.interval;

				periods.push({
					date: moment().toDate(),
					money: 0,
					price: -1 * this.params.pricePercent * this.params.faceValue / 100,
					nkd: -1 * nkd,
					amortization: 0
				});

				const amortizations = this.params.hasAmortization ? _.map(this.params.amortizations, a => {
					return {
						date: moment(a.date, 'YYYY-MM-DD'),
						value: a.value
					};
				}) : [{ date: moment(this.params.maturationDate), value: this.params.faceValue }];

				let amortizationIndex = 0;

				let faceValue = this.params.faceValue;

				while (current.diff(this.params.maturationDate, 'days') <= 0){

					let money = this.ratePerPeriod * faceValue;
					let amortization = 0;

					if (current.diff(amortizations[amortizationIndex].date, 'days') === 0){
						amortization = amortizations[amortizationIndex].value;
						faceValue -= amortization;
						amortizationIndex += 1;
					}
					periods.push({ date: current.toDate(), money, price: 0, nkd: 0, amortization });

					current.add(this.interval, 'days');

				}

				const lastDate = moment(_.last(periods).date);
				const difference = -1 * lastDate.diff(this.params.maturationDate, 'days');
				if (difference > 0){

					let money = (this.ratePerPeriod / this.daysInPeriod) * difference * faceValue;
					periods.push({ date: this.params.maturationDate, money, price: 0, nkd: 0, amortization: _.last(amortizations).value });
				}

				const values = _.map(periods, el => el.money + el.price + el.nkd + el.amortization);
				const dates = _.map(periods, el => moment(el.date));

				const rate = xiff(values, dates, 0);

				this.params.periods = periods;
				this.params.YTM = rate;

				const halfYearPeriods = (moment(this.params.maturationDate).diff(moment(), 'days')) / 182;

				this.params.modifiedDuration = ((this.couponForHalfYear /  (this.YTMForHalfYear * this.YTMForHalfYear))
					* (1 - 1 / Math.pow(1 + this.YTMForHalfYear, halfYearPeriods))
					+ (halfYearPeriods*(100 - this.couponForHalfYear/this.YTMForHalfYear)/Math.pow(1 + this.YTMForHalfYear, halfYearPeriods + 1))) / this.params.pricePercent / 2;

				this.params.makoleiDuration = this.params.modifiedDuration * (1 + this.YTMForHalfYear);

				this.save();
			},
			roundFloat(value){
				return Math.round(value * 100) / 100;
			},
			save(){
				this.$store.commit('saveBond', this.params);
				//this.$router.push('/bonds');
			},
			addAmortization(){
				this.params.amortizations = this.params.amortizations || [];
				this.params.amortizations.push({ date: moment().format('YYYY-MM-DD'), value: 100 });
			},
			addToPortfolio(){
				this.$store.commit('addBondToPortfolio', this.params.isin);
			},
			remove(){
				this.$store.commit('removeBond', this.params.isin);
				this.$router.push('/bonds');

			}
		}
	};
</script>
