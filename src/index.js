import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VModal from 'vue-js-modal';
import 'vuetify/dist/vuetify.min.css';

import App from './App.vue';
import FeaturedPage from './components/FeaturedPage.vue';
import MetricsPage from './components/MetricsPage.vue';

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VModal);

const routes = [
  { path: '/featured', component: FeaturedPage },
  { path: '/metrics', component: MetricsPage }
];
const router = new VueRouter({ routes });

const app = new Vue({
  el: '#app',
  render: h => h(App),
  router: router
});