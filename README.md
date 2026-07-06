# RepQuest Squat Arena

A lightweight browser app that uses your phone camera to count squats and turn them into a small game.

## What it does

- `Single Player`: starts at 10 squats for Stage 1, then increases by 5 every stage
- `2 Players`: two phones can join the same room and race live for 60 seconds
- Uses the device camera plus pose tracking to estimate squat reps in real time
- Includes a lightweight built-in room backend for realtime online matches

## How to run

Because mobile browsers only allow camera access on `https://` or `localhost`, serve the files with a local web server.

### Option 1: Node.js

```powershell
cd "D:\project exercise"
node .\server.js
```

Then open:

- On this computer: `http://localhost:8080`
- On your phone: `http://YOUR-PC-IP:8080`

### Option 2: Python

```powershell
cd "D:\project exercise"
python -m http.server 8080
```

Then open:

- On this computer: `http://localhost:8080`
- On your phone: `http://YOUR-PC-IP:8080`

Your phone and computer need to be on the same Wi-Fi network.

## Online 2-player mode

- For testing on one local network, run `node .\server.js` on one machine and open that machine's IP from both phones
- For real different-location play, deploy this same app and `server.js` to a public server so both phones can reach the same URL
- Flow:
  - Player 1 creates a room
  - Player 2 joins with the room code
  - Either player starts the online match
  - Both phones count locally and sync scores to the shared room in realtime

## Tips for better rep counting

- Put the phone on the side, not directly in front of you
- Keep your hips, knees, and ankles visible
- Use a bright room with clear contrast
- The counter is a practical first version, so you may want to tune thresholds after testing with your actual squat depth

## Files

- `index.html` - app layout
- `styles.css` - mobile-friendly visual design
- `app.js` - camera, pose tracking, rep logic, and game state
