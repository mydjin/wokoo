import Vue from 'vue'
import App from './app.vue'
import ElementUI from 'element-ui';
import * as ExcelJS from 'exceljs'
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.use(ExcelJS)

console.log('2024年1月5日00:37:17')

const wokooApp = document.createElement('div')
wokooApp.id = 'wokooApp-my-app-05389'
document.body.appendChild(wokooApp)
const vm = new Vue({
  el: wokooApp,
  render: (h) => h(App),
})
