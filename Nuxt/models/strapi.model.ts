export interface Image {
    id: number
    name: string
    width: number
    height: number
    url: string
    alternativeText: string
}

export interface Meta {
    pagination: {
        page: number
        pageSize: number
        pageCount: number
        total: number
    }
}