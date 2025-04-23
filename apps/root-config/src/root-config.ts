import * as singleSpa from 'single-spa';
import { constructApplications, constructLayoutEngine, constructRoutes } from 'single-spa-layout';
import microfrontendLayout from './microfrontend-layout.html';

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    // @ts-ignore
    return System.import(name);
  },
});
constructLayoutEngine({ routes, applications });

applications.forEach(singleSpa.registerApplication);
singleSpa.start({
  urlRerouteOnly: false,
});

window.addEventListener('single-spa:app-change', () => {
  // TODO
});

window.addEventListener('single-spa:before-app-change', evt => {
  // TODO
  console.log(evt);
});
