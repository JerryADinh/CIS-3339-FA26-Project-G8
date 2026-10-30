import { createApp, markRaw } from "vue";
import router from "./router";
import App from "./App.vue";
import "./index.css";
import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
//state management library
import { createPinia } from 'pinia'
import { useLoggedInUserStore } from './store/loggedInUser';

const app = createApp(App);

//create a pinia root store
const pinia = createPinia();
//pinia should be able to use router - has to be setup as plugin
pinia.use(({ store }) => {
  store.$router = markRaw(router)
});

//add Pinia to the Vue application
app.use(pinia);

//access the authentication store
const loggedInUserStore = useLoggedInUserStore(pinia);

//restore any saved login session before the app renders
loggedInUserStore.restoreSession();

//register Vue Router
app.use(router);

const options = {
  position: 'bottom-right'
};
app.use(Toast, options);
app.mount("#app");
