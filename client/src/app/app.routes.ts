import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { ConnectedComponent } from './connected/connected.component';

export const ROUTES: Routes = [
	{
		path: "",
		component: SplashComponent
	},
	{
		path: "connected",
		component: ConnectedComponent
	}
];