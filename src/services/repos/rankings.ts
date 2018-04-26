import {Repository} from "../repository";

export class RankingsRepository extends Repository {
  constructor(remoteUrl: string) {
    super('rankings', remoteUrl)
  }
}
