import Vue from 'vue';
import Router from 'vue-router';

import Bonds from './views/Bonds/Bonds.vue';
import AddBond from './views/Bonds/AddBond.vue';

import Portfolio from './views/Portfolio/Portfolio.vue';
import EditPortfolioItem from './views/Portfolio/EditPortfolioItem.vue';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/bonds',
			component: Bonds
		},
		{
			path: '/bonds/new',
			component: AddBond
		},
		{
			path: '/bonds/:bond_id',
			component: AddBond
		},
		{
			path: '/portfolio',
			component: Portfolio
		},
		{
			path: '/portfolio/:item_id',
			component: EditPortfolioItem
		},
		// {
		// 	path: '/about',
		// 	name: 'about',
		// 	// route level code-splitting
		// 	// this generates a separate chunk (about.[hash].js) for this route
		// 	// which is lazy-loaded when the route is visited.
		// 	component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
		// },
		{
			path: '/',
			redirect: '/bonds'
		}
	]
});
