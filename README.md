# RepQuest Squat Arena

A browser game that uses your phone camera to count squats, with solo stage mode and online 2-player battles.

## What it does

- `Single Player`: starts at 10 squats for Stage 1, then increases by 5 every stage
- `2 Players`: two phones can join the same room from different locations and race live for 60 seconds
- Uses the device camera plus pose tracking to estimate squat reps in real time
- Speaks each rep count out loud and shows the live count and target on the camera overlay

## Project structure

- `index.html` - app layout
- `styles.css` - mobile-friendly visual design
- `app.js` - camera, pose tracking, solo mode, and online mode client logic
- `api/create-room.js` - create a multiplayer room
- `api/join-room.js` - join a multiplayer room
- `api/start-match.js` - start the 60-second online match
- `api/update-score.js` - sync live score updates
- `api/reset-match.js` - reset a room back to lobby
- `api/finalize-match.js` - close a finished match
- `supabase/schema.sql` - database table and realtime setup

## Local use

### Single-player only

You can still run the front end locally for camera testing:

```powershell
cd "D:\project exercise"
node .\server.js
```

Then open:

- `http://localhost:8080`

Single-player mode will work locally.

### Online 2-player mode

The online room system now expects:

1. Vercel to host the static app and API routes
2. Supabase to store room state and broadcast realtime updates

That is what allows 2 phones in different locations to stay in sync.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Copy these values from Supabase:
   - Project URL
   - anon public key
   - service role key

## Vercel setup

Import the GitHub repo into Vercel, then add these environment variables:

- `REPQUEST_SUPABASE_URL`
- `REPQUEST_SUPABASE_ANON_KEY`
- `REPQUEST_SUPABASE_SERVICE_ROLE_KEY`

After that, redeploy the Vercel project.

## How online mode works

1. Player 1 opens the deployed app and taps `Create Room`
2. Player 1 shares the room code
3. Player 2 opens the same deployed app on another phone and taps `Join`
4. Either player starts the match
5. Both phones count squats locally and sync scores through Supabase Realtime

## Notes

- If the Vercel or Supabase env vars are missing, the app still works in single-player mode
- The room data is shared, so this version is suitable for phones in different locations
- This is still a lightweight first implementation, so we can add player names, rematches, anti-cheat checks, or room cleanup next
