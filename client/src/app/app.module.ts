import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SplashComponent } from './splash/splash.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ConnectedComponent } from './connected/connected.component';

import { TwitchService } from './services/twitch.service';

import { ROUTES } from './app.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PermissionsComponent } from './dashboard/permissions/permissions.component';
import { ChatSettingsComponent } from './dashboard/chat-settings/chat-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    NavbarComponent,
    ConnectedComponent,
    DashboardComponent,
    PermissionsComponent,
    ChatSettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    TwitchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
