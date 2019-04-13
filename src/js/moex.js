import axios from 'axios';
import _ from 'lodash';

const mapValuesAndColumns = (data, columns) => {
	return _.reduce(data, (acc, value, index) => {
		const key = columns[index];
		return {
			...acc,
			[key]: value
		};

	}, {});
};

const getSelectedKeys = (selectedKeys, allKeys, values) => {
	const result = {};
	_.each(allKeys, (key, index) => {
		if (_.indexOf(selectedKeys, key) !== -1){
			result[key] = values[index];
		}
	});
	return result;
};


export default {
	getSecuritiesForMarketAndBoard({ market, board }){
		return axios.get(`https://iss.moex.com/iss/engines/stock/markets/${market}/boards/${board}/securities.json`).then((response) => {

			if (response.status !== 200){
				return Promise.reject(response.statusText);
			}

			const { securities, marketdata } = response.data;

			let mappedSecurities = [];

			_.each(securities.data, (securityValues) => {
				const obj = mapValuesAndColumns(securityValues, securities.columns);
				mappedSecurities.push({ id: obj.SECID, details: _.omit(obj, 'SECID'), marketData: {} });
			});

			_.each(marketdata.data, (marketDataValues) => {

				const obj = mapValuesAndColumns(marketDataValues, marketdata.columns);
				const security = _.find(mappedSecurities, s => s.id === obj.SECID);
				security.marketData = obj;

			});

			return mappedSecurities;

		});
	},
	getBond(secid){

		return Promise.all([
			axios.get(`https://iss.moex.com/iss/securities/${secid}.json`).then((response) => {
				if (response.status !== 200){
					return Promise.reject(response.statusText);
				}

				const { description, boards } = response.data;

				const info = _.reduce(description.data, (acc, el) => {
					return {
						...acc,
						[el[0]]: el[2]
					};
				}, {});

				const boardsData = _.reduce(boards.data, (acc, el) => {
					return {
						...acc,
						[el[1]]: mapValuesAndColumns(el, boards.columns)
					};
				}, {});

				return { info, boards: boardsData }

			}),
			axios.get(`https://iss.moex.com/iss/statistics/engines/stock/markets/bonds/bondization/${secid}.json`, {
				params: {
					start: 0,
					limit: 100,
					'iss.meta': 'off',
					'sort_order': 'asc'
				}
			}).then((response) => {
				if (response.status !== 200){
					return Promise.reject(response.statusText);
				}
				const { amortizations, coupons, offers } = response.data;

				//TODO: check cursors (if we loaded all data)

				const payments = { amortizations: [], coupons: [], offers: [] };

				_.each(amortizations.data, a => {

					const item = getSelectedKeys(
						['amortdate', 'initialfacevalue', 'value', 'data_source'],
						amortizations.columns, a);
					payments.amortizations.push(item);

				});

				_.each(coupons.data, a => {

					const item = getSelectedKeys(['coupondate', 'recorddate', 'startdate', 'facevalue', 'initialfacevalue', 'value', 'data_source'], coupons.columns, a);
					payments.coupons.push(item);

				});

				_.each(offers.data, a => {

					const item = getSelectedKeys(['offerdate', 'offerdatestart', 'offerdateend', 'facevalue', 'price', 'value', 'agent', 'offertype'], offers.columns, a);
					payments.offers.push(item);

				});

				return payments;
			})
		]).then(([{ info, boards}, payments]) => {
			return { id: secid, info, boards, payments };
		});
	},
	getBoardsForMarket(market){
		return axios.get(`https://iss.moex.com/iss/engines/stock/markets/${market}/boards.json`).then((response) => {

			if (response.status !== 200){
				return Promise.reject(response.statusText);
			}

			const { boards } = response.data;

			const mappedBoards = [];

			_.each(boards.data, (boardValues) => {
				mappedBoards.push(mapValuesAndColumns(boardValues, boards.columns));
			});
			return mappedBoards;
		});
	},
	getShare(secid){
		return Promise.all([
			axios.get(`https://iss.moex.com/iss/securities/${secid}.json`).then((response) => {
				if (response.status !== 200){
					return Promise.reject(response.statusText);
				}

				const { description, boards } = response.data;

				const info = _.reduce(description.data, (acc, el) => {
					return {
						...acc,
						[el[0]]: el[2]
					};
				}, {});

				const boardsData = _.reduce(boards.data, (acc, el) => {
					return {
						...acc,
						[el[1]]: mapValuesAndColumns(el, boards.columns)
					};
				}, {});

				return { info, boards: boardsData }

			})
		]).then(([{ info, boards}]) => {
			return { id: secid, info, boards };
		});
	}
};