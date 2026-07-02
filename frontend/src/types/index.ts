export interface User {
    id: number
    name: string
    email: string
    roles: Role[]
}

export type Role = string[] | {
    id: number
    name: string
}[]

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory =
    | 'technical_issue'
    | 'billing'
    | 'account_access'
    | 'product_question'
    | 'feature_request'
    | 'other'
export type ContactPreference = 'email' | 'phone'

export interface Ticket {
    id: number
    ticket_number: string
    title: string
    description: string
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    customer_id: number
    customer?: User
    booked_at: string | null
    contact_preference: ContactPreference | null
    created_at: string
    updated_at: string
    comments?: TicketComment[]
}

export interface TicketComment {
    id: number
    ticket_id: number
    user_id: number
    user?: User
    description: string
    created_at: string
}

export interface PaginatedData<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface ApiError {
    message: string
    errors?: Record<string, string[]>
}