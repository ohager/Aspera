// external module
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// our lib
import {SharedModule} from './lib/shared.module';
import {DashboardModule} from './pages/dashboard/dashboard.module';
import {LoginModule} from './pages/login/login.module';
import {TranslateModule} from '@ngx-translate/core';
import {NotifierModule} from 'angular-notifier';
// Main App
import {App} from './app.component';
// Main Routes
import {routing} from './app.routing';
// Classes and interfaces
// Configs
import {appConfigFactory, StoreConfig} from "./lib/config/store.config";

let modules = [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule.forRoot(),
    TranslateModule,
    DashboardModule,
    LoginModule,
    NotifierModule
];


@NgModule({
    bootstrap: [App],
    declarations: [
        App,
    ],
    imports: [
        ...modules,
        routing
    ],
    providers: [
        {provide: StoreConfig, useFactory: appConfigFactory}
    ]
})

export class AppModule {
}
