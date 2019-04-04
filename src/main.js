import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faFileExcel, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faPlus, faFileExcel, faBriefcase);

Vue.component('fa-icon', FontAwesomeIcon);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);

Vue.filter('roundFloat', (value, decimals) => {
	const multiplier = Math.pow(10, decimals);
	return Math.round(value * multiplier) / multiplier;
});


Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
