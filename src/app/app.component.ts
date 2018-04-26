import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {RankingPage} from "../pages/ranking/ranking";
import {PingPongBattlesDb} from "../services/db";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = RankingPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private db: PingPongBattlesDb) {
    // init the common db
    db.init();

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

