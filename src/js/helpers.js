import moment from 'moment';
import _ from 'lodash';

const PRECITION = 0.00001;

export default {
	roundFloat(value, decimals){
		const multiplier = Math.pow(10, decimals);
		return Math.round(value * multiplier) / multiplier;
	},

	xiff(price, periods, rate = 0){

		const firstPeriod = moment(); //moment(_.first(periods).date);

		let p = 0;

		const periodLengths = _.map(periods, () => 0);

		for (let i = 0; i < periods.length; i += 1){
			const periodLength = moment(periods[i].date).diff(firstPeriod, 'days') / 365;
			periodLengths[i] = periodLength;
			p +=  periods[i].amount / Math.pow(1 + rate, periodLength);
		}

		p -= price;

		if (p < 0){

			do {
				rate = rate - PRECITION;
				p = 0;
				for (let i = 0; i < periods.length; i += 1){
					p += periods[i].amount / Math.pow(1 + rate, periodLengths[i]);
				}
				p -= price;
			} while (p <= 0);

		} else {
			do {
				rate = rate + PRECITION;
				p = 0;
				for (let i = 0; i < periods.length; i += 1){
					p += periods[i].amount / Math.pow(1 + rate, periodLengths[i]);
				}
				p -= price;
			} while (p >= 0);
		}

		return rate;


	},

	calculateNKD(date, bond){
		date = moment(date);
		let previous = _.first(bond.payments.coupons);
		let current = null;
		for (let i = 1; i < bond.payments.coupons.length; i += 1){
			current = bond.payments.coupons[i];
			if (moment(current.coupondate).diff(date, 'days') > 0){
				break;
			}
			previous = current;
		}

		const elapsed = date.diff(previous.coupondate, 'days');
		const periodLength = moment(current.coupondate).diff(previous.coupondate, 'days');

		return this.roundFloat(current.value * elapsed / periodLength, 2);

	},

	calculateYieldForPrice(price, fromDate, bond){

		fromDate = fromDate.getTime();

		let amortizations = bond.payments.amortizations;
		if (amortizations.length > 1){
			// Has amortizations
			amortizations = _.filter(bond.payments.amortizations, el => {
				return moment(el.amortdate).valueOf() > fromDate && el.data_source === 'amortization';
			});
		}

		amortizations = _.map(amortizations, el => {
			return {
				date: moment(el.amortdate).valueOf(),
				amount: el.value
			}
		});
		amortizations = _.sortBy(amortizations, 'date');

		let coupons = _.filter(bond.payments.coupons, el => {
			return moment(el.coupondate).valueOf() > fromDate;
		});
		coupons = _.map(coupons, el => {
			return {
				date: moment(el.coupondate).valueOf(),
				amount: el.value
			}
		});
		coupons = _.sortBy(coupons, 'date');

		let payments = [...amortizations, ...coupons];
		payments = _.groupBy(payments, 'date');

		const dates = _.sortBy(_.keys(payments));

		payments = _.map(dates, key => {
			return {
				date: moment(parseInt(key, 10)),
				amount: _.reduce(payments[key], (acc, el) => acc + el.amount, 0)
			}
		});

		const faceValue = parseFloat(bond.info.FACEVALUE);
		let totalPrice = faceValue * price / 100;
		let nkd = this.calculateNKD(fromDate, bond);


		const yieldToMaturity = this.xiff(totalPrice + nkd, payments, bond.marketData.YIELD);
		return { nkd, yieldToMaturity: this.roundFloat(100 * yieldToMaturity, 2) };

	},

	getBondPaymentsForPeriod({ bond, from, to }){
		if (!bond || !bond.payments || !from || !to){
			return [];
		}

		const { amortizations, coupons } = bond.payments;

		if (!amortizations || !coupons){
			return [];
		}

		from = moment(from).toDate();
		to = moment(to).toDate();

		const payments = [];

		for (let coupon of coupons){

			const date = moment(coupon.coupondate).toDate();

			if (date >= from && date < to){
				payments.push({
					date,
					type: 'coupon',
					value: coupon.value
				});
			}
		}

		// Бумага без амортизации
		if (amortizations.length === 1){
			const  matDate = moment(amortizations[0].amortdate).toDate();
			if (matDate >= from && matDate < to){
				payments.push({
					date,
					type: 'amortization',
					value: amortizations[0].value
				});
			}
		} else {
			for (let item of amortizations){
				if (item.data_source === 'maturation'){
					continue;
				}

				const date = moment(item.amortdate).toDate();

				if (date >= from && date < to){
					payments.push({
						date,
						type: 'amortization',
						value: item.value
					});
				}
			}
		}

		return payments;
	},

	calculateOwnershipForPayments({ payments, orders }){

		const mappedOrders = _.map(orders, o => {
			return {
				date: moment(o.purchaseDate).toDate(),
				amount: o.amount
			};
		});

		for (let payment of payments){

			const validOrders = _.filter(mappedOrders, o => o.date <= payment.date);
			const totalAmount = _.reduce(validOrders, (acc, o) => acc + o.amount, 0);

			payment.amount = totalAmount;
			payment.total = payment.value * totalAmount;

		}

	}
};