import {Repository} from "../repository";

export class PlayersRepository extends Repository {
  constructor(remoteUrl: string) {
    super('players', remoteUrl)
  }
}
