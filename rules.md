# rules.md — DASTAAN Restaurant App MVP

Ye rules har coding session mein follow honge (tum ya koi AI tool). Kaam shuru karne se pehle `memory.md` aur `phases.md` padho.

## A0. Language aur brand
- App aur server **JavaScript** mein (.js), React Native + Expo Go.
- Restaurant ka naam **DASTAAN** (`src/data/brand.js` se), kahin hard-code nahi.
- Required: register, login, manager/admin panel, sab bina error ke chalna chahiye.

## A. Hard constraints (assignment ke)
1. App mein koi state management library nahi (Redux, Zustand, MobX nahi). Sirf useState, useEffect, useRef, useContext, useReducer, useMemo, useCallback, custom hooks.
2. A2 mein backend = Node + Express + MongoDB (Mongoose). Firebase nahi.
3. `.env` kabhi git mein nahi. Sirf `.env.example`. Real MONGO_URI mila to marks kat'te hain.
4. Folder names fix: `components, screens, context, reducers, hooks, data, navigation` (+ `api`).
5. Har question ke liye kam az kam 1 meaningful commit, main branch par.
6. Server price/total khud calculate kare, app ka total kabhi trust nahi.

## B. React Native rules
- Har screen colours `useTheme()` se le. Hard-coded colour nahi.
- Custom hook ka naam `use...`, sirf top level par call, JSX return nahi.
- Screen mein business logic nahi (reservation logic `useReservation` mein).
- FlatList mein `keyExtractor` zaroor. List items par `React.memo` + `useCallback` handlers.
- Derived data (filter/sort/totals) state mein nahi, `useMemo` mein.
- Reducer pure: previous state mutate nahi, spread/map/filter use karo.
- Har `setTimeout`/`setInterval` ka cleanup return karo.
- Har network screen mein 3 states: loading, error (+Retry), empty.
- SafeAreaView / `useSafeAreaInsets` har screen par.
- Network call sirf `src/api/client.js` ke through. `BASE_URL` sirf wahin.

## B2. Theme rules (Burgundy, Gold, Cream)
- Palette sirf `src/theme/colors.js` mein. Screens mein raw hex nahi.
- Burgundy = primary actions/headers/active tabs. Gold = chhote accents. Gold par white text nahi, espresso text.
- Status aur errors sirf colour se nahi, text/icon bhi.
- Redesign mein koi feature, route, provider, API call ya data remove/hardcode nahi. Koi nayi dependency nahi.
- Dark mode palette bhi maintain karo (A1 Q6).

## C. Backend rules
- Route file sirf URL map kare, DB code controller mein.
- Har controller `try/catch`. Status codes: 200, 201, 400, 401, 403, 404, 409, 500.
- Invalid ObjectId par 400 (crash nahi): `mongoose.isValidObjectId(id)`.
- `app.use(cors())` aur `app.use(express.json())` routes se pehle. 404 handler "Route not found" aur 500 error handler sab se last mein.
- Password hamesha bcrypt hash, kisi response mein nahi.
- Order status sirf forward: Pending > Preparing > Ready > Served. Cancel sirf Pending se.
- Reservation: same table + date + slot par 409; seats >= partySize.
- Manager-only endpoints par `protect` + `managerOnly`.

## D. "Error ke bina chale" checklist (har phase ke baad)
- [ ] Server `npm run dev` bina crash, "MongoDB connected" dikhe
- [ ] `/api/health` Postman aur phone browser dono mein chale
- [ ] Expo app `npx expo start -c` se bina red screen khule
- [ ] Naya code add karne ke baad purana flow (login, menu, cart) abhi bhi chale
- [ ] Koi `console.error` / yellow warning (key prop, hook rules) nahi
- [ ] Do devices par test (ya phone + emulator)

## E. Common errors, pehle yahan dekho
| Error | Check |
|---|---|
| Network request failed | localhost nahi, laptop IP; same Wi-Fi; server on; firewall |
| MongoServerSelectionError | Atlas Network Access mein current IP; MONGO_URI user/password |
| req.body undefined | `express.json()` routes se pehle |
| 401 har request par | `Authorization: Bearer <token>` (Bearer ke baad ek space) |
| Kal chala aj nahi | IP badal gaya, BASE_URL update |

## F. Git rules
- Commit message: `Q3: login screen with useState validation`
- `.gitignore`: `node_modules`, `.env`, `.expo`
- Push se pehle `git status` mein `.env` check.

## G. Working style
- Pehle chota kaam chalao, test karo, phir agla. Ek time par ek phase.
- Naya feature likhne se pehle batao kaun si file change hogi.
- Jo code samajh nahi aya wo viva mein poochha ja sakta ha, isliye har file ka kaam khud explain kar sako.

## H. AI tool rules (AI Studio / koi bhi AI jo code likhe)
Ye section AI ko pehle message mein dena ha.
1. Project **Expo React Native (Expo Go)** ha. Web app (Vite, react-dom, Next.js) nahi banani.
2. Database **MongoDB Atlas via Express + Mongoose**. Firebase, Supabase, Redux, Zustand bilkul nahi.
3. Naya project mat banao. Existing `restaurant-app-mvp` ke andar kaam karo, purana working code (login, orders, server) mat todo.
4. Har file ka **full path + poora code** do. "baqi same", "...", ya adhoora code nahi.
5. Naya package chahiye to pehle batao aur exact `npm install` command do. Zaroorat ke baghair dependency nahi.
6. Ek waqt mein sirf ek phase (phases.md). Phase khatam hone par batao kaun si files bani/badli.
7. Existing file badalni ho to mujhse uska current code maango, andaze se mat likho.
8. Colours sirf `src/theme/colors.js` se (design.md). Raw hex nahi.
9. A1/A2 PDF ke constraints follow karo (hooks list, folder names, no state library).
10. Zip ya download ho to usme `package.json` mein `expo` aur `react-native` hon.
