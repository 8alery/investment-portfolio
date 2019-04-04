import Vue from 'vue';
import Router from 'vue-router';

//import Bonds from './views/Bonds/Bonds.vue';
import BondsAlternate from '@/views/Bonds/BondsAlternate';
import ViewBond from '@/views/Bonds/ViewBond';

import Shares from '@/views/Shares/Shares';
import ViewShare from '@/views/Shares/ViewShare';

import views from './views';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/bonds',
			name: 'bonds',
			component: BondsAlternate
		},
		{
			path: '/bonds/:secid/:board',
			name: 'viewBond',
			component: ViewBond
		},
		{
			path: '/portfolio', name: 'portfolio', component: views.Portfolio.IndexPage,
			children: [
				{ path: 'orders', name: 'portfolioOrders', component: views.Portfolio.OrdersPage },
				{ path: 'orders/:id', name: 'editPortfolioOrder', component: views.Portfolio.EditOrderPage },
				{ path: 'securities', name: 'portfolioSecurities', component: views.Portfolio.SecuritiesPage },
				{ path: 'securities/:id', name: 'viewPortfolioSecurity', component: views.Portfolio.ViewSecurityPage },
				{ path: 'fees', name: 'portfolioFees', component: views.Portfolio.FeesPage },
				{ path: 'fees/new', name: 'newPortfolioFee', component: views.Portfolio.EditFeePage },
				{ path: 'fees/:id', name: 'editPortfolioFee', component: views.Portfolio.EditFeePage }
			]
		},
		// {
		// 	path: '/portfolio/:id',
		// 	name: 'editPortfolio',
		// 	component: EditPortfolioItem
		// },
		{
			path: '/shares',
			name: 'shares',
			component: Shares
		},
		{
			path: '/shares/:secid',
			name: 'viewShare',
			component: ViewShare
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
