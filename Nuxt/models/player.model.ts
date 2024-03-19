import type {Competition} from "~/models/competition.model";
import type {Image} from "~/models/strapi.model";
import type {Meta} from "zhead";

export interface Player {
  id: number
  name: string
  ranking: number
  first_name: string
  last_name: string
  created_at: Date
  updated_at: Date
  competitions: Array<Competition>,
  image: Image
}

export interface PlayerResponse {
    data: Player
}

export interface PlayersResponse {
    data: Player[]
    meta: Meta
}