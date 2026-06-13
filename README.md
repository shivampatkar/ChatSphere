<p align="center">
  <img src="./chatsphere-frontend/assets/images/logo.png" width="80" alt="ChatSphere logo" />
</p>

<h1 align="center">ChatSphere</h1>

<p align="center">
  A real-time chat application built with <strong>React Native (Expo)</strong> and a <strong>Node.js / Socket.io</strong> backend.<br/>
  Users register, log in, and exchange messages instantly — with full chat history preserved via <strong>MongoDB Atlas</strong>.
</p>

<p align="center">
  <a href="https://chatsphere-16nw.onrender.com">Live Backend</a> &nbsp;·&nbsp;
  <a href="https://github.com/shivampatkar/ChatSphere">GitHub Repo</a> &nbsp;·&nbsp;
  <a href="https://github.com/shivampatkar/ChatSphere/releases/tag/v1.0.0">Download APK</a> &nbsp;·&nbsp;
  <a href="https://www.loom.com/share/88541efad01445cca4178d9230b4e543">Screen Recording</a>
</p>

---

## Live Backend

```
https://chatsphere-16nw.onrender.com
```

Health check: `GET https://chatsphere-16nw.onrender.com/` → `{ "status": "ChatSphere backend running" }`

> **Note:** Hosted on Render's free tier. The first request after inactivity may take 30–60 seconds to cold-start. Subsequent requests are fast.

---

## Tech Stack

### Mobile App

| Concern | Library |
|---|---|
| Framework | React Native with Expo (SDK 54) |
| Routing | Expo Router — file-based Stack navigator |
| Real-time | `socket.io-client` v4 |
| Auth state | Zustand + AsyncStorage (persisted across app restarts) |
| Chat history | REST API call to backend on mount — Option B |
| HTTP client | Axios with JWT interceptor |
| UI | StyleSheet · Custom theme tokens · Lucide icons · LinearGradient |
| Language | JavaScript (JSX) |

### Backend

| Concern | Library |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| WebSocket | Socket.io v4 |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Database | MongoDB Atlas via Mongoose |
| Hosting | Render (free tier) |

---

## Project Structure

```
ChatSphere/
├── chatsphere-backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.controller.js   # register + login handlers
│   │   │   ├── auth.repository.js   # DB queries for User model
│   │   │   └── auth.routes.js       # POST /auth/register, /auth/login
│   │   └── messages/
│   │       ├── message.controller.js
│   │       ├── message.repository.js
│   │       └── message.routes.js    # GET /messages (protected)
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT verification for REST routes
│   ├── models/
│   │   ├── User.js                  # username, email, passwordHash
│   │   └── Message.js               # senderId, senderName, text, timestamps
│   ├── index.js                     # Express + Socket.io entry point
│   └── package.json
│
└── chatsphere-frontend/
    ├── app/
    │   ├── _layout.jsx              # Root layout — ToastProvider + hydration gate
    │   ├── index.jsx                # Auth redirect → (app)/chat or (auth)/login
    │   ├── (auth)/
    │   │   ├── _layout.jsx
    │   │   ├── login.jsx            # Login screen
    │   │   └── register.jsx         # Registration screen
    │   └── (app)/
    │       ├── _layout.jsx
    │       └── chat.jsx             # Main chat screen
    ├── components/
    │   ├── ChatInput.jsx            # Message input bar + send button
    │   ├── ConnectionBanner.jsx     # Connecting / reconnecting banner
    │   ├── MessageBubble.jsx        # Per-message bubble (own vs others)
    │   └── Toast.jsx                # Custom toast system
    ├── constants/
    │   └── theme.js                 # Colors, fonts, spacing, radius, shadows
    ├── hooks/
    │   └── useChat.js               # All chat logic — history + socket events
    ├── lib/
    │   └── axiosInstance.js         # Axios with base URL + auth interceptor
    ├── services/
    │   ├── api.js                   # messagesAPI.getHistory()
    │   └── socket.js                # socketService singleton
    ├── store/
    │   └── useAuthStore.js          # Zustand store — token, user, logout
    ├── utils/
    │   └── formatTime.js            # Timestamp formatter
    ├── assets/images/
    ├── eas.json
    └── app.config.js
```

---

## Features

### Authentication

- ✅ Register with username, email, and password (min 6 chars — validated on backend)
- ✅ Login with username and password
- ✅ JWT stored in AsyncStorage via Zustand `persist` — survives app restarts
- ✅ User stays logged in after closing and reopening the app — no re-login needed
- ✅ Logout clears AsyncStorage, disconnects the socket, and navigates back to Login

### Real-time Chat

- ✅ Socket.io connection established immediately after login with JWT in `socket.handshake.auth`
- ✅ Unauthenticated connections are rejected server-side before the `connection` event fires
- ✅ Messages emitted via `send_message` are saved to MongoDB and broadcast to all connected clients via `io.emit`
- ✅ Own messages on the right (blue bubble) — others on the left (white bubble + avatar initial)
- ✅ Sender name and timestamp displayed on every message
- ✅ FlatList auto-scrolls to the latest message on arrival
- ✅ Keyboard never overlaps the input bar (`softwareKeyboardLayoutMode: resize` on Android + `KeyboardAvoidingView` on iOS)
- ✅ Status pill in header: green dot + `@username` when connected, amber dot + "Connecting…" when not
- ✅ Full-width banner below header: yellow = connecting, red = reconnecting
- ✅ Send button disabled while socket is not connected

### Chat History

- ✅ On screen mount, `GET /messages` fetches the last 100 messages from MongoDB before the socket connects
- ✅ Shimmer skeleton UI shown while history is loading
- ✅ History persists across app close and reopen — server-side storage (Option B)
- ✅ "Own" vs "other" is always computed from the logged-in user's ID

### UI Polish

- ✅ Custom app icon and splash screen
- ✅ Animated shimmer skeleton loading state
- ✅ Empty state with icon when no messages exist
- ✅ LinearGradient header with custom StyleSheet styling throughout
- ✅ Custom toast notifications built with React Context + Animated API — no third-party library. Supports 5 types: `success`, `error`, `info`, `login`, `logout` — each with a distinct accent color and icon, spring-animated slide-in from the top

---

## Chat History Approach

**Option B — Server-side storage (MongoDB Atlas)**

Every message sent through the socket is saved to MongoDB by the backend before being broadcast. When the chat screen mounts, the app calls `GET /messages` (protected by JWT) to fetch the last 100 messages. There is no local SQLite database — history lives entirely on the server.

| Benefit | Detail |
|---|---|
| Survives reinstalls | History is on the server, not the device |
| No logout-clearing needed | Each user's "own" messages are determined by ID at render time |
| Single source of truth | Backend owns all message state |

---

## Running Locally

**Prerequisites:** Node.js >= 18, npm or yarn, Expo CLI (`npm install -g expo`), and a MongoDB Atlas cluster (free M0) — or skip backend setup and use the live deployed backend directly.

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/shivampatkar/ChatSphere.git
cd ChatSphere/chatsphere-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/chatdb?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
```

> **Getting a free MongoDB Atlas URI:**
> 1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
> 2. Create a free M0 cluster
> 3. Add a DB user under Database Access
> 4. Whitelist `0.0.0.0/0` under Network Access
> 5. Click Connect → Connect your application and copy the URI

```bash
# 4. Start the server
npm run dev    # development — nodemon, auto-restarts on changes
npm start      # production
```

Backend will be live at `http://localhost:5000`.

### Frontend Setup

```bash
# From the repo root
cd chatsphere-frontend

# 1. Install dependencies
npm install

# 2. Start Expo
npx expo start
```

| Key | Action |
|---|---|
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| Scan QR | Open in Expo Go on physical device |

> The app points to the live backend by default. To use a local backend, update `BASE_URL` in `lib/axiosInstance.js`. For physical devices replace `localhost` with your machine's LAN IP. Android emulators use `http://10.0.2.2:5000`.

---

## Test Accounts

Two accounts are pre-seeded on the live backend. Open the app on two devices, log in with a different account on each, and watch messages arrive in real time on both screens.

| Username | Password |
|---|---|
| `shivam` | `123456` |
| `pratham` | `123456` |

---

## Screen Recording

Loom demo (two phones in real time): https://www.loom.com/share/88541efad01445cca4178d9230b4e543

---

## APK Download

Android APK: https://github.com/shivampatkar/ChatSphere/releases/tag/v1.0.0

**To install:**
1. Download the APK to your Android device
2. Go to Settings → Security and enable Install from unknown sources
3. Open the APK and tap Install
4. The app connects to the live backend at `https://chatsphere-16nw.onrender.com`

**Or build it yourself:**
```bash
cd chatsphere-frontend
npm install -g eas-cli
eas build --platform android --profile preview
```

Requires a free [Expo account](https://expo.dev).

---

## Assignment Checklist

### App & Setup
- ✅ Custom app icon — not the default Expo icon
- ✅ Custom splash screen
- ✅ Expo Router configured with Stack navigator (`(auth)` and `(app)` route groups)

### Authentication
- ✅ Login screen with username + password fields and validation
- ✅ User credentials stored in MongoDB Atlas — not in memory or a flat file
- ✅ JWT returned on login and stored in AsyncStorage via Zustand `persist`
- ✅ User stays logged in after closing and reopening the app
- ✅ Logout clears AsyncStorage, disconnects the socket, and returns to Login

### Real-time Chat
- ✅ Socket.io connection established after login
- ✅ JWT passed to server on socket connect — unauthenticated connections rejected
- ✅ Messages emitted over socket and broadcast to all connected clients
- ✅ Messages received from socket displayed in real time
- ✅ Own messages right (blue); others left (white + avatar initial) — visually distinct
- ✅ Sender name and timestamp on every message
- ✅ FlatList auto-scrolls to latest message
- ✅ Keyboard does not overlap the message input bar (iOS + Android both handled)
- ✅ Visible indicator when socket is connecting or reconnecting (status pill + full-width banner)

### Chat History
- ✅ Every sent and received message persisted to MongoDB Atlas
- ✅ Chat history loads correctly when app is closed and reopened
- ✅ Option B — server-side storage; history separation handled naturally per session

### Code Quality
- ✅ Clear folder structure: `app/` · `components/` · `hooks/` · `utils/` · `services/` · `store/`
- ✅ `app/index.jsx` handles auth redirect — no logic in layout files
- ✅ No business logic inside screen files — all chat logic isolated in `useChat.js`
- ✅ Custom toast system built from scratch with React Context + Animated — no third-party toast library
- ✅ Meaningful variable and function names throughout
- ✅ No unused imports, commented-out blocks, or stray `console.log` statements

---

## API Reference

### REST Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a new user. Body: `{ username, email, password }` |
| `POST` | `/auth/login` | None | Login. Body: `{ username, password }`. Returns `{ token, user }` |
| `GET` | `/messages` | Bearer JWT | Fetch last 100 messages, sorted oldest to newest |

### Socket Events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `send_message` | `{ text: string }` | Send a new message |
| Server → Client | `new_message` | `{ _id, senderId, senderName, text, createdAt }` | Broadcast to all connected clients |

> Socket connection requires a valid JWT in `socket.handshake.auth.token`. Missing or invalid token → connection rejected with `connect_error`.

---
