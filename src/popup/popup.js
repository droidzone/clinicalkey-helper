import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Popup from './Popup.vue';

// Create Pinia instance
const pinia = createPinia();

// Create and mount app with Pinia
const app = createApp(Popup);
app.use(pinia);
app.mount('#app');
