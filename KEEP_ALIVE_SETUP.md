# Keep-Alive Setup Guide for Vercel

This document explains the keep-alive mechanism set up for your LearnGround application on Vercel.

## Overview

The keep-alive setup prevents Vercel serverless functions from going cold (cold starts), ensuring faster response times for users and backend API calls. It works through two mechanisms:

### 1. **Vercel Cron Job** (Server-Side)
- **File**: `vercel.json`
- **Endpoint**: `/api/keep-alive`
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Function**: Automatically pings the keep-alive endpoint to keep serverless functions warm

### 2. **Client-Side Keep-Alive Service** (Browser)
- **File**: `src/app/services/keep-alive.service.ts`
- **Integration**: Injected in `src/app/app.ts`
- **Behavior**:
  - Pings the keep-alive endpoint on app initialization
  - Pings periodically every 5 minutes while the app is active
  - Pings when user returns to the tab (visibility change detection)

## Files Modified/Created

### New Files:
1. **`api/keep-alive.ts`** - Keep-alive API endpoint handler
2. **`src/app/services/keep-alive.service.ts`** - Angular service for client-side pings

### Modified Files:
1. **`vercel.json`** - Added cron job and keep-alive function config
2. **`src/app/app.ts`** - Added KeepAliveService injection

## How It Works

### Server-Side (Vercel Cron):
```
Vercel Scheduler → GET /api/keep-alive (every 5 minutes)
                 → Response: { status: "alive", timestamp, message }
```

### Client-Side (Browser):
```
App Start → Ping /api/keep-alive
         → Every 5 minutes → Ping /api/keep-alive
         ↓
         Tab Visibility Change → If tab becomes visible → Ping /api/keep-alive
```

## Configuration Details

### Cron Schedule Format (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule breakdown**: `*/5 * * * *`
- `*/5` - Every 5 minutes
- `*` - Every hour
- `*` - Every day
- `*` - Every month
- `*` - Every day of week

To adjust frequency:
- `*/3 * * * *` → Every 3 minutes
- `*/10 * * * *` → Every 10 minutes
- `0 * * * *` → Every hour

### Keep-Alive Service Configuration

In `KeepAliveService`:
```typescript
private readonly KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

To adjust client-side ping interval, change the milliseconds value.

## Environment Variables (Optional)

For future scalability, you can add keep-alive configuration to your environment files:

```typescript
// environment.ts
export const environment = {
  production: false,
  googleClientId: '...',
  apiUrl: "https://quizplay-backend.onrender.com",
  keepAlive: {
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes
    endpoint: '/api/keep-alive'
  }
};
```

## Monitoring

### Logs to Check:
1. **Vercel Logs**: Check Vercel dashboard for cron execution logs
2. **Browser Console**: Look for `[Keep-Alive] Ping successful:` messages
3. **Server Logs**: Monitor the `api/keep-alive.ts` endpoint

### Expected Output:
- Successful ping: `{ status: "alive", timestamp: "2026-04-15T...", message: "..." }`
- Ping errors are logged but don't break the application

## Performance Impact

- **Server**: Minimal - simple GET request returning JSON
- **Client**: Minimal - silent background HTTP request
- **Bandwidth**: ~200-300 bytes per ping
- **Cost**: Included in free Vercel plan (crons are included)

## Troubleshooting

### Cron job not running?
1. Verify `vercel.json` syntax is correct
2. Check Vercel dashboard > Project Settings > Crons
3. Ensure the keep-alive endpoint path is correct: `/api/keep-alive`

### Keep-alive service not working?
1. Check browser console for errors
2. Verify HttpClient is properly provided (already done in `main.ts`)
3. Ensure KeepAliveService is injected in App component

### Cold starts still occurring?
1. Reduce the interval from 5 to 3 minutes
2. Add more client-side pings by adjusting `KEEP_ALIVE_INTERVAL`
3. Monitor actual Vercel function duration to understand the pattern

## Future Enhancements

1. **Smart Scheduling**: Adjust ping frequency based on user activity
2. **Multiple Endpoints**: Keep multiple functions warm (backend API, assets, etc.)
3. **Analytics**: Track keep-alive effectiveness and cold start reduction
4. **User Activity**: Make pings conditional on user engagement

## References

- [Vercel Crons Documentation](https://vercel.com/docs/crons)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Angular HttpClient](https://angular.io/guide/http)
