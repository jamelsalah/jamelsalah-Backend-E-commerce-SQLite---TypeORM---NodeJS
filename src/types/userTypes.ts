export interface CreateUser {
    username: string
    password: string
    name: string
    cpf: string
    rg: string
    email: string
    birthday: Date
    tel1: string
    tel2?: string
    sellerId?: number
}

export interface Auth {
    username: string
    password: string
}