import type {Meta} from "zhead";

export interface Competition {
    id: number
    name: string
}

export interface CompetitionsResponse {
    data: Competition[]
    meta: Meta
}