import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import {RankingPage} from "../pages/ranking/ranking";
import {Autofocus} from "../directives/autofocus";
import {PingPongBattlesDb} from "../services/db";
import {PlayerBattlePage} from "../pages/player-battle/player-battle";

@NgModule({
  declarations: [
    MyApp,
    RankingPage,
    PlayerBattlePage,
    Autofocus
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    RankingPage,
    PlayerBattlePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    PingPongBattlesDb,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
