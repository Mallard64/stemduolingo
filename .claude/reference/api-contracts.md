# API Contracts

Locked. All routes return JSON. Errors as `{ error: string }` with appropriate HTTP status.

## Routes

### `GET /api/topics`

Returns all topics with lock status for the authenticated user.

**Response:**
```ts
{
  topics: {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    unlock_requires: string[];
    locked: boolean;        // true if unlock_requires not all completed
    completed: boolean;     // true if user has completed this topic
  }[];
}
```

### `GET /api/topics/[id]/lesson`

Returns 5 questions for the topic. Does NOT include `correct_answer` field (validated server-side on submit).

**Response:**
```ts
{
  topic_id: string;
  questions: {
    id: string;
    question_text: string;
    question_type: 'mcq' | 'multi' | 'order' | 'fill';
    options: unknown;       // shape depends on question_type, see data-shapes.md
    explanation: string | null;  // sent only AFTER answer submitted, or hide in client until then
  }[];
}
```

### `POST /api/lessons/complete`

Records lesson completion, updates XP and streak.

**Body:**
```ts
{
  topic_id: string;
  hearts_remaining: number;   // 0-5
  time_seconds: number;
}
```

**Response:**
```ts
{
  xp_earned: number;
  new_total_xp: number;
  new_streak: number;
  streak_extended: boolean;   // true if this completion extended the streak
}
```

XP formula: `base 50 + (hearts_remaining * 10)`. Streak extends if user has any completion today and didn't yesterday's completion was within 1 day prior. (Simple version: any completion increments daily.)

### `GET /api/daily-puzzle`

Returns today's Element Match puzzle for the user. Same content globally for the UTC date.

**Response:**
```ts
{
  date: string;              // ISO date 'YYYY-MM-DD'
  items: string[];           // 9 items, shuffled
  already_completed: boolean;
}
```

Server does NOT send groups or categories — only revealed on submit.

### `POST /api/daily-puzzle/submit`

Submits a solve attempt.

**Body:**
```ts
{
  groupings: string[][];     // 3 arrays of 3 items each
  time_seconds: number;
  mistakes: number;
}
```

**Response:**
```ts
{
  correct: boolean;
  groups: string[][];        // reveal correct groups
  categories: string[];      // reveal labels
  rank_percentile: number;   // 0-100, lower is better (top 5% = 5)
  share_text: string;        // pre-formatted copyable string
}
```

### `GET /api/leaderboard`

Returns top 30 users by XP (mix of real and seeded fake users).

**Response:**
```ts
{
  users: {
    username: string;
    total_xp: number;
    current_streak: number;
    rank: number;            // 1-based
    is_current_user: boolean;
  }[];
  current_user_rank: number | null;  // if user is not in top 30
}
```

## Auth

All routes except `GET /api/topics` (publicly viewable) require Supabase auth session. Use server-side Supabase client to verify.

Return 401 `{ error: 'unauthenticated' }` for missing/invalid session.
