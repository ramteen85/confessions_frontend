import Vue from 'vue';
import App from './App.vue';
import Card from './components/layout/Card.vue';
import Vuelidate from 'vuelidate';
import VueRouter from 'vue-router';
import { routes } from './routes';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faEnvelopeOpen, faBars, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faBookMedical } from '@fortawesome/free-solid-svg-icons';
import { faHandMiddleFinger } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueGeolocation from 'vue-browser-geolocation';
import Autoscroll from 'vue-autoscroll';
import VueWebsocket from "vue-websocket";

export const eventBus = new Vue();

// geolocation
Vue.use(VueGeolocation);

// websockets
Vue.use(VueWebsocket, `${process.env.VUE_APP_WEBSOCKET_LOCAL}`, {
    reconnection: false
});

// auto scroll
Vue.use(Autoscroll);

library.add(faEnvelope, faHeart, faHandMiddleFinger, faBars, faGlobeAmericas, faBookMedical, faEnvelopeOpen);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('card', Card);

Vue.use(Vuelidate);

// Vue.config.productionTip = false

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'hash'
});

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
