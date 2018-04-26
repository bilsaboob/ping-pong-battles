import {Component, ChangeDetectorRef} from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import {UUID} from "angular2-uuid";
import {PingPongBattlesDb} from "../../services/db";
import PouchDB from 'pouchdb-browser';
import {PlayerBattlePage} from "../player-battle/player-battle";

@Component({
  selector: 'page-ranking',
  templateUrl: 'ranking.html'
})
export class RankingPage {
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public db: PingPongBattlesDb
  ) {
    this.loadPlayers();
    this.loadRankings();
  }

  players: Array<Player> = [];

  rankings: Array<Ranking> = [];

  toggledPlayers: Array<Player> = [];

  newPlayer: Player = null;

  playerOne: Player = null;

  playerTwo: Player = null;

  editPlayersMode: boolean = false;
  inputNewPlayerMode: boolean = false;

  get hasPlayerOne(): boolean {
    return this.playerOne !== null;
  }

  get hasPlayerTwo(): boolean {
    return this.playerTwo !== null;
  }

  get lastRanking() : number {
    return this.rankings.length + 1;
  }

  get showNewPlayerInput() : boolean {
    return this.isInputNewPlayerMode && !this.editPlayersMode;
  }

  get isInputNewPlayerMode() : boolean {
    return this.inputNewPlayerMode;
  }

  get isEditPlayersMode() : boolean {
    return this.editPlayersMode;
  }

  loadPlayers() {
    return this.db.players.getAll().then(allPlayers => {
      this.players = allPlayers.map(p=>new Player("", "").load(p));
    })
  }

  loadRankings() {
    return this.db.rankings.getAll().then(allRankings => {
      this.rankings = allRankings
        .map(r=>new Ranking(null, 0).load(r))
        .sort((r1, r2)=>r1.ranking.toString().localeCompare(r2.ranking.toString()));
      this.updateRankings();
    })
  }

  togglePlayer(id: string) {
    if(this.isPlayerToggled(id)) {
      this.toggledPlayers.forEach( (p, i) => {
        if(p.id === id) this.toggledPlayers.splice(i,1);
      });
    } else {
      let player = this.players.find(r=>r.id === id);
      if(player) {
        this.toggledPlayers = [player, ...this.toggledPlayers]
        while(this.toggledPlayers.length > 2) {
          this.toggledPlayers.pop();
        }
      }
    }

    this.updateBattlingPlayers();
  }

  isPlayerToggled(id: string) : boolean {
    return this.toggledPlayers.some(p=>p.id===id);
  }

  beginAddPlayer() {
    if(this.isInputNewPlayerMode) return;
    this.resetEditPlayersMode();
    this.newPlayer = new Player("", "");
    this.inputNewPlayerMode = true;
  }

  finishAddPlayer(discard = false) {
    if(this.newPlayer == null) return;

    if(!discard && this.newPlayer.firstName.length > 0) {
      this.players.push(this.newPlayer);
      this.db.players.add(this.newPlayer.id, this.newPlayer);

      let newRanking = new Ranking(this.newPlayer, this.lastRanking);
      this.rankings.push(newRanking);
      this.db.rankings.add(newRanking.id, newRanking);
    }

    this.resetInputPlayerMode();
    this.resetEditPlayersMode();
  }

  beginEditPlayers() {
    this.resetInputPlayerMode();

    // set the edit players mode
    this.editPlayersMode = true;
  }

  onNewPlayerNameKeyPress(keyCode: any) {
    if(keyCode == 13) {
      // enter key
      this.finishAddPlayer();
      return;
    }
    else if(keyCode == 27) {
      // esc key
      this.finishAddPlayer(true);
    }
  }

  private resetInputPlayerMode() {
    this.inputNewPlayerMode = false;
    this.newPlayer = null;
  }

  private resetEditPlayersMode() {
    this.editPlayersMode = false;
  }

  removePlayer(id: string) {
    this.toggledPlayers.forEach( (p, i) => {
      if(p.id === id) this.toggledPlayers.splice(i,1);
    });
    this.players.forEach( (p, i) => {
      if(p.id === id) {
        this.players.splice(i,1);
        this.db.players.remove(id);
      }
    });
    this.rankings.forEach( (r, i) => {
      if(r.player.id === id) {
        this.rankings.splice(i,1);
        this.db.rankings.remove(r);
      }
    });
    this.updateRankings();
    this.updateBattlingPlayers();
  }

  toggleOrRemovePlayer(player: Player) {
    if(this.isEditPlayersMode) {
      this.removePlayer(player.id);
    } else {
      this.togglePlayer(player.id);
    }
  }

  private updateRankings() {
    this.rankings.forEach( (r, i) => {
      r.ranking = i + 1;
    });
  }

  private updateBattlingPlayers() {
    if(this.toggledPlayers.length > 0) {
      this.playerOne = this.toggledPlayers[0];
      if(this.toggledPlayers.length > 1) {
        this.playerTwo = this.toggledPlayers[1];
      } else {
        this.playerTwo = null;
      }
    } else {
      this.playerOne = null;
      this.playerTwo = null;
    }
  }

  startBattle() {
    let modal = this.modalCtrl.create(PlayerBattlePage);
    modal.present();
  }
}

class Ranking {

  constructor(player: Player, ranking: number) {
    this.player = player;
    this.ranking = ranking;
    this.id = UUID.UUID();
  }

  id: string;
  ranking: number;
  player: Player;

  load(item: PouchDB.Core.Document<any> & PouchDB.Core.RevisionIdMeta= null) : Ranking {
    if (item != null) {
      Object.assign(this, item);
    }

    return this;
  }
}

class Player {
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatarIconUrl = "assets/imgs/avatar-ninja.png"
    this.id = UUID.UUID();
  }

  load(item: PouchDB.Core.Document<any> & PouchDB.Core.RevisionIdMeta= null) : Player {
    if (item != null) {
      Object.assign(this, item);
    }

    return this;
  }

  id: string;
  firstName: string;
  lastName: string;
  avatarIconUrl: string;
}
