import moment from 'moment';

export default {
	nextCouponDate({ date, maturationDate, frequency }){

		let currentDate = moment(maturationDate);
		let previousDate = currentDate.toDate();

		date = moment(date);

		const period = Math.floor(365/frequency);

		let diff = currentDate.diff(date, 'days');
		while(diff > 0){
			previousDate = currentDate.toDate();
			currentDate = currentDate.subtract(period, 'days');
			diff = currentDate.diff(date, 'days');
		}

		return previousDate;
	},
	getCouponMoneyFlowForBond({ startDate, bond }){

		const current = moment(this.nextCouponDate({ date: startDate, maturationDate: bond.maturationDate, frequency: bond.frequency }));

		let previousDate = moment(startDate);
		const maturationDate = moment(bond.maturationDate);

		const bondPeriod = Math.floor(365 / bond.frequency);

		const result = [];
		while (maturationDate.diff(current, 'days') >= 0){
			const period = current.diff(previousDate, 'days');
			const coupon = bond.coupon * period/bondPeriod;
			result.push({ date: current.toDate(), coupon });
			previousDate = moment(current);
			current.add(bondPeriod, 'days');

		}

		return result;

	}
};