┌─────────────────────────────────────────────────────────────────────────────┐
│                           SCHÉMA DE BASE DE DONNÉES                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     User        │         │    Profile      │         │    Author       │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id              │────────►│ id              │         │ id              │
│ username        │         │ user (1:1)      │         │ first_name      │
│ email           │         │ avatar          │         │ last_name       │
│ password        │         │ bio             │         │ biography       │
│ first_name      │         │ created_at      │         │ birth_date      │
│ last_name       │         └─────────────────┘         └────────┬────────┘
└────────┬────────┘                                              │
         │                                                       │
         │                  ┌─────────────────┐                  │
         │                  │      Book       │◄─────────────────┘
         │                  ├─────────────────┤         (ManyToMany)
         │                  │ id              │
         │                  │ title           │
         │                  │ total_pages     │
         │                  │ isbn            │
         │                  │ description     │
         │                  │ cover_image     │
         │                  │ publication_date│
         │                  │ authors (M2M)   │
         │                  └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────────────┐
│                    UserBook                          │
├─────────────────────────────────────────────────────┤
│ id                                                   │
│ user (FK)                                            │
│ book (FK)                                            │
│ status (non_lu, en_cours, lu)                       │
│ pages_read                                           │
│ rating (1-5)                                         │
│ comment                                              │
│ is_favorite                                          │
│ date_added                                           │
│ date_started                                         │
│ date_finished                                        │
└───────────────────────┬─────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ReadingSession  │ │  ReadingList    │ │  ReadingGoal    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ id              │ │ id              │ │ id              │
│ user_book (FK)  │ │ user (FK)       │ │ user (FK)       │
│ date            │ │ name            │ │ goal_type       │
│ pages_read      │ │ description     │ │ period          │
│ duration_mins   │ │ books (M2M)     │ │ target_value    │
│ notes           │ │ is_public       │ │ current_value   │
└─────────────────┘ │ created_at      │ │ start_date      │
                    └─────────────────┘ │ end_date        │
                                        │ is_active       │
                                        └─────────────────┘