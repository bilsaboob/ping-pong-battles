import {Injectable} from "@angular/core";
import {PlayersRepository} from "./repos/players";
import {RankingsRepository} from "./repos/rankings";

const remotePingPongBattlesDbUrl : string = "";

@Injectable()
export class PingPongBattlesDb {
  private playersRepo : PlayersRepository;
  private rankingsRepo : RankingsRepository;

  get rankings() { return this.rankingsRepo; }
  get players() { return this.playersRepo; }

  // initializes local
  init() : Promise<any> {
    this.rankingsRepo = new RankingsRepository(remotePingPongBattlesDbUrl);
    this.playersRepo = new PlayersRepository(remotePingPongBattlesDbUrl);

    return Promise.all([
      this.playersRepo.init(false),
      this.rankingsRepo.init(false)
    ]);
  }
}
