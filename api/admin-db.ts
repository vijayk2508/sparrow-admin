// Self-contained Vercel serverless handler (NO cross-file deps).
// Mirrors the sparrow-training-club success pattern: fetch-only Supabase REST.
import { createSign } from "crypto";
function cors(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
}
function sb() {
  var base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
  var key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
  if (!base) throw new Error("Supabase URL is not configured");
  if (!key) throw new Error("Supabase key is not configured (SERVICE_ROLE_KEY / ANON_KEY missing)");
  return { base: base, key: key };
}
function pk() {
  var raw = process.env.FIREBASE_PRIVATE_KEY || "";
  if (raw.indexOf("\\n") !== -1) raw = raw.split("\\n").join("\n");
  return raw;
}
function b64url(input: string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function signJwt(payload: any, privateKeyPem: string) {
  var header = { alg: "RS256", typ: "JWT" };
  var h = b64url(JSON.stringify(header));
  var p = b64url(JSON.stringify(payload));
  var signer = createSign("RSA-SHA256");
  signer.update(h + "." + p);
  var sig = signer.sign(privateKeyPem, "base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return h + "." + p + "." + sig;
}
var _googleToken: { token: string; exp: number } | null = null;
async function googleAccessToken() {
  if (_googleToken && _googleToken.exp > Date.now() + 60000) return _googleToken.token;
  var email = (process.env.FIREBASE_CLIENT_EMAIL || "").trim();
  var key = pk();
  if (!email || !key) throw new Error("Firebase Admin not configured (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY missing)");
  var now = Math.floor(Date.now() / 1000);
  var jwt = signJwt({ iss: email, scope: "https://www.googleapis.com/auth/identitytoolkit", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }, key);
  var r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }).toString() });
  var j = await r.json().catch(function () { return {}; });
  if (!r.ok || !j.access_token) throw new Error("Google OAuth failed: " + (j.error_description || j.error || r.status));
  _googleToken = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return _googleToken.token;
}
async function verifyFirebaseToken(req: any): Promise<{ uid: string; email: string | null; name: string | null; picture: string | null } | null> {
  var header = (req.headers && req.headers.authorization) || "";
  var token = header.indexOf("Bearer ") === 0 ? header.slice(7).trim() : "";
  if (!token) return null;
  var projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "").trim();
  if (!projectId) return null;
  try {
    var accessToken = await googleAccessToken();
    var url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=";
    var r = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken }, body: JSON.stringify({ idToken: token }) });
    var j = await r.json().catch(function () { return {}; });
    void url;
    if (!r.ok || !j.users || !j.users[0]) return null;
    var u = j.users[0];
    return { uid: u.localId, email: (u.email || null), name: (u.displayName || null), picture: (u.photoUrl || null) };
  } catch (e) { return null; }
}
async function sbRest(path: string, opts?: { method?: string; prefer?: string; body?: any }): Promise<any> {
  var c = sb();
  var o: { method?: string; prefer?: string; body?: any } = opts || {};
  var url = c.base + "/rest/v1/" + path;
  var headers: Record<string, string> = { apikey: c.key, Authorization: "Bearer " + c.key, "Content-Type": "application/json" };
  if (o.prefer) headers.Prefer = o.prefer;
  var r = await fetch(url, { method: o.method || "GET", headers: headers, body: o.body ? JSON.stringify(o.body) : undefined });
  var text = await r.text().catch(function () { return ""; });
  var json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
  if (!r.ok) throw new Error("Supabase error " + r.status + ": " + String(text).slice(0, 300));
  return json;
}

var TABLES: Record<string, string> = { membershipPlans: "membership_plans", contactQueries: "contact_queries", siteSettings: "site_settings" };
var ALLOWED_TABLES = ["coaches","programs","schedule","membershipPlans","testimonials","gallery","events","siteSettings","bookings","payments","memberships","contactQueries"];
function tableFor(path: string): string {
  if (ALLOWED_TABLES.indexOf(path) === -1) throw new Error("Table not allowed: " + path);
  return TABLES[path] || path;
}
function rowToDoc(row: any): any {
  if (row && Object.prototype.hasOwnProperty.call(row, "sort_order")) {
    var r = Object.assign({}, row); var s = r.sort_order; delete r.sort_order; delete r.created_at;
    r.order = (s === null || s === undefined) ? undefined : s; return r;
  }
  return row;
}
function docToRow(doc: any): any {
  var d = Object.assign({}, (doc || {})); var order = d.order; delete d.order;
  var row = Object.assign({}, d);
  if (order !== undefined && order !== null) row.sort_order = order;
  for (var k of Object.keys(row)) { if (row[k] === undefined) delete row[k]; }
  return row;
}
async function syncUser(identity: { uid: string; email: string | null; name: string | null; picture: string | null }): Promise<{ id: string; firebaseUid: string; email: string; fullName: string | null; avatarUrl: string | null; role: string }> {
  var uid = identity.uid;
  var email = identity.email;
  var name = identity.name;
  var picture = identity.picture;
  var safeEmail = email || (uid + "@users.noreply.sparrow.local");
  var role = "user";
  if (email) {
    var a = await sbRest("admins?" + new URLSearchParams({ select: "email", email: "ilike." + email }).toString());
    if (a && a[0]) role = "admin";
  }
  var ex = await sbRest("users?" + new URLSearchParams({ select: "*", firebase_uid: "eq." + uid }).toString());
  var existing = (ex && ex[0]) || null;
  if (!existing) {
    var created = await sbRest("users", { method: "POST", prefer: "return=representation", body: { firebase_uid: uid, email: safeEmail, full_name: name, avatar_url: picture, role: role } });
    var row = (created && created[0]) || null;
    if (!row) {
      var f = await sbRest("users?" + new URLSearchParams({ select: "*", firebase_uid: "eq." + uid }).toString());
      row = (f && f[0]) || null;
    }
    return { id: row.id, firebaseUid: row.firebase_uid, email: row.email, fullName: (row.full_name === undefined ? null : row.full_name), avatarUrl: (row.avatar_url === undefined ? null : row.avatar_url), role: (row.role === "admin" ? "admin" : "user") };
  }
  var patch: { role: string; updated_at: string; full_name?: string; avatar_url?: string; email?: string } = { role: role, updated_at: new Date().toISOString() };
  if (name && name !== existing.full_name) patch.full_name = name;
  if (picture && picture !== existing.avatar_url) patch.avatar_url = picture;
  if (email && email !== existing.email) patch.email = email;
  var up = await sbRest("users?" + new URLSearchParams({ firebase_uid: "eq." + uid }).toString(), { method: "PATCH", prefer: "return=representation", body: patch });
  var fin = (up && up[0]) || Object.assign({}, existing, patch);
  return { id: fin.id, firebaseUid: fin.firebase_uid, email: fin.email, fullName: (fin.full_name === undefined ? null : fin.full_name), avatarUrl: (fin.avatar_url === undefined ? null : fin.avatar_url), role: (fin.role === "admin" ? "admin" : "user") };
}
var SEED: Record<string, any> = {"siteSettings":{"id":"settings","name":"Sparrow Training Club","tagline":"Boxing & Training Club","subtext":"Train hard. Fight smart. Become unstoppable.","city":"KOTDWARA, INDIA","address":"Near Mathura Wedding Point, Devi Mandir, Kotdwara, Uttarakhand, India 246149","phone":"+917668318457","email":"sparrowclubkotdwar@gmail.com","establishedYear":"2018","heroImage":"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=1920","sessionFee":25,"currency":"₹","heroSubtext":"Train hard. Fight smart. Become unstoppable. Premium Boxing, Hyrox Race Preparation, Strength & Conditioning for champion-level results.","socials":{"instagram":"https://www.instagram.com/sparrowclub_kotdwar/","facebook":"https://www.facebook.com/people/Sparrow-Training-Club/61592879485548/"},"hours":{"weekdays":"6:00 AM – 9:00 PM","saturday":"8:00 AM – 6:00 PM","sunday":"9:00 AM – 3:00 PM"},"heroStats":[{"id":"stat-members","label":"ACTIVE MEMBERS","value":500,"suffix":"+"},{"id":"stat-coaches","label":"ELITE COACHES","value":12},{"id":"stat-titles","label":"CHAMPIONSHIPS","value":47},{"id":"stat-exp","label":"EXPERIENCE","value":15,"prefix":"","suffix":"yrs"}],"whyChooseUs":[{"id":"why-1","num":"01","icon":"Award","title":"CERTIFIED COACHES","desc":"All trainers hold USA Boxing, NSCA, and Hyrox Certified credentials with authentic championship combat experience."},{"id":"why-2","num":"02","icon":"ShieldAlert","title":"COMPETITION TRAINING","desc":"Structured fight camps, supervised sparring rounds, and official Hyrox race prep for amateur and pro athletes."},{"id":"why-3","num":"03","icon":"Zap","title":"STRENGTH & CONDITIONING","desc":"Fight & endurance specific S&C programming to maximize kinetic explosive power, VO2 max, and resilience."},{"id":"why-4","num":"04","icon":"Apple","title":"NUTRITION GUIDANCE","desc":"Customized weight management protocols, fight-week cuts, hydration pacing, and performance fueling."},{"id":"why-5","num":"05","icon":"UserCheck","title":"PERSONAL COACHING","desc":"Dedicated 1-on-1 mittwork, camera technical analysis, footwork refinement, and tailored fight plans."},{"id":"why-6","num":"06","icon":"Dumbbell","title":"MODERN EQUIPMENT","desc":"Full-size competition ring, 30+ heavy bags, double-end bags, Hyrox SkiErg, Sleds, and full weight floor."}]},"coaches":[{"id":"coach-1","name":"MARCUS 'THE BULL' RIVERA","role":"HEAD BOXING COACH","recordBadge":"22-1 (18 KOs)","bio":"Former WBC Continental Americas Champion. 18 years coaching amateur and professional fighters to national titles.","image":"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800","specialties":["Offensive Combinations","Ring IQ","Fight Strategy"],"socials":{"instagram":"#","twitter":"#","youtube":"#"}},{"id":"coach-2","name":"DIANA 'THE DUCHESS' CHEN","role":"WOMEN'S BOXING & HYROX HEAD","recordBadge":"3× Golden Gloves","bio":"3× National Golden Gloves Champion & Elite Hyrox Pro Finisher. Specialist in tactical defense and athletic power development.","image":"https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800","specialties":["Defense & Counters","Footwork","Hyrox Pacing"],"socials":{"instagram":"#","twitter":"#"}},{"id":"coach-3","name":"TYSON 'IRON HANDS' BROOKS","role":"STRENGTH & CONDITIONING HEAD","recordBadge":"Former Pro Athlete","bio":"Combat sports S&C specialist. Developed elite conditioning programs for 12 title contenders and Hyrox World finalists.","image":"https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=800","specialties":["Power Development","Energy Systems","Injury Prevention"],"socials":{"instagram":"#","youtube":"#"}},{"id":"coach-4","name":"RAFAEL 'EL MAESTRO' VEGA","role":"TECHNICAL BOXING COACH","recordBadge":"41-0 (27 KOs)","bio":"International amateur boxing coach with Olympic-level experience in Cuba and Mexico. Unmatched mittwork mastery.","image":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800","specialties":["Cuban Style Boxing","Jab Mastery","Amateur Competition"],"socials":{"instagram":"#","twitter":"#"}}],"programs":[{"id":"prog-boxing-fund","title":"BOXING FUNDAMENTALS","category":"Boxing","level":"BEGINNER","duration":"12 Weeks","price":7999,"period":"/month","description":"Master the foundations of boxing — stance, footwork, combination punching, defense, and heavy bag drills.","image":"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800","features":["3 group classes per week","Basic technique coaching","Shadowboxing & heavy bag work","Jump rope & conditioning","Gloves & hand wraps provided","Beginner sparring intro"]},{"id":"prog-hyrox-challenge","title":"HYROX RACE PREP & FITNESS","category":"Hyrox","level":"INTERMEDIATE","badge":"MOST POPULAR","popular":true,"duration":"Ongoing","price":12999,"period":"/month","description":"Official Hyrox simulation training combining functional endurance, SkiErg, Sled Push, Wall Balls, and running.","image":"https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800","features":["Dedicated Hyrox race simulation floor","Sled push/pull, SkiErg & Rowers","Station pacing & VO2 max building","Weekly timed benchmark tests","Hydration & race strategy guidance","Official Hyrox partner gym entry"]},{"id":"prog-fighter-pro","title":"FIGHTER PROGRAM","category":"Boxing","level":"ADVANCED","badge":"ELITE","duration":"Ongoing","price":14999,"period":"/month","description":"Competition-focused training for dedicated athletes looking to step into the ring and compete.","image":"https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800","features":["Unlimited group sessions","Weekly sparring rounds","Fight strategy coaching","Strength & conditioning","Nutrition consultation","Amateur fight placement"]},{"id":"prog-strength-cond","title":"STRENGTH & POWER ATHLETICS","category":"Strength","level":"ALL LEVELS","duration":"Ongoing","price":10999,"period":"/month","description":"Build explosive kinetic power, core stability, and muscular endurance designed specifically for combat & endurance athletes.","image":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800","features":["Barbell compound lifts & Olympic movements","Kettlebell & plyometric power circuits","Injury prevention & mobility mobility work","Body composition tracking","Custom weight progression logs"]},{"id":"prog-cardio-burn","title":"HIIT CARDIO BURN","category":"Cardio","level":"ALL LEVELS","duration":"Ongoing","price":7999,"period":"/month","description":"High-intensity metabolic conditioning fusing heavy bag strikes, speed rope, and sprint intervals to scorch 800+ calories.","image":"https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800","features":["Heart-rate targeted interval zones","Heavy bag rhythm work","Agility ladder & battle ropes","Core isolation workouts","Motivational rhythm playlists"]},{"id":"prog-fight-camp","title":"INTENSIVE FIGHT CAMP","category":"Boxing","level":"ELITE","duration":"8-Week Camp","price":34999,"period":"/camp","description":"Full-time immersive fight-camp preparation. Professional coaching, personal fight analysis, and custom sparring partners.","image":"https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800","features":["2x daily training sessions","Personal head coach assigned","Dedicated sparring partners","Video analysis & review","Full nutrition program","Corner team for fights"]}],"schedule":[{"id":"sched-1","title":"Boxing Fundamentals","serviceType":"Boxing","coachName":"Rivera","day":"MON","time":"6:00 AM","duration":"60 min","level":"Beginner","colorTag":"bg-emerald-950 text-emerald-400 border-emerald-700","description":"Stance, jab-cross technique, and light bag work for morning starters.","capacity":20,"spotsLeft":4,"price":25},{"id":"sched-2","title":"Women's Boxing","serviceType":"Boxing","coachName":"Chen","day":"MON","time":"9:00 AM","duration":"60 min","level":"Intermediate","colorTag":"bg-purple-950 text-purple-400 border-purple-700","description":"Empowering technical session focused on combination punching & speed.","capacity":18,"spotsLeft":2,"price":25},{"id":"sched-3","title":"Lunchtime Boxing","serviceType":"Boxing","coachName":"Vega","day":"MON","time":"12:00 PM","duration":"45 min","level":"All Levels","colorTag":"bg-blue-950 text-blue-400 border-blue-700","description":"Express midday workout to release stress and sharpen combinations.","capacity":25,"spotsLeft":7,"price":20},{"id":"sched-4","title":"Advanced Boxing","serviceType":"Boxing","coachName":"Rivera","day":"MON","time":"5:30 PM","duration":"75 min","level":"Advanced","colorTag":"bg-rose-950 text-rose-400 border-rose-700","description":"High-level counter-punching, ring generalship, and tactical drills.","capacity":15,"spotsLeft":3,"price":30},{"id":"sched-5","title":"Hyrox Race Conditioning","serviceType":"Hyrox","coachName":"Brooks","day":"MON","time":"7:00 PM","duration":"60 min","level":"Intermediate","colorTag":"bg-amber-950 text-amber-400 border-amber-700","description":"Sled push, SkiErg, and lunges circuit simulation for Hyrox racers.","capacity":16,"spotsLeft":5,"price":30},{"id":"sched-6","title":"Hyrox Fitness & Sleds","serviceType":"Hyrox","coachName":"Chen","day":"TUE","time":"6:00 AM","duration":"60 min","level":"All Levels","colorTag":"bg-amber-950 text-amber-400 border-amber-700","description":"Full-body functional power, SkiErg intervals, and heavy sled pushes.","capacity":18,"spotsLeft":6,"price":30},{"id":"sched-7","title":"Strength & Conditioning","serviceType":"Strength","coachName":"Brooks","day":"TUE","time":"9:00 AM","duration":"60 min","level":"Intermediate","colorTag":"bg-cyan-950 text-cyan-400 border-cyan-700","description":"Compound lifts, kettlebell power, and core stability for combat power.","capacity":15,"spotsLeft":3,"price":25},{"id":"sched-8","title":"Sparring Class","serviceType":"Boxing","coachName":"Rivera","day":"TUE","time":"5:30 PM","duration":"90 min","level":"Advanced","colorTag":"bg-rose-950 text-rose-400 border-rose-700","description":"Supervised technical sparring with full mouthguard and 16oz gloves.","capacity":12,"spotsLeft":2,"price":35},{"id":"sched-9","title":"HIIT Cardio Burn","serviceType":"Cardio","coachName":"Chen","day":"TUE","time":"7:00 PM","duration":"50 min","level":"Beginner","colorTag":"bg-orange-950 text-orange-400 border-orange-700","description":"Non-stop heavy bag intervals and jump rope calorie torching.","capacity":22,"spotsLeft":8,"price":20},{"id":"sched-10","title":"Boxing Fundamentals","serviceType":"Boxing","coachName":"Rivera","day":"WED","time":"6:00 AM","duration":"60 min","level":"Beginner","colorTag":"bg-emerald-950 text-emerald-400 border-emerald-700","description":"Slip drills, counter jabs, and heavy bag rhythm work.","capacity":20,"spotsLeft":5,"price":25},{"id":"sched-11","title":"Hyrox Station Masterclass","serviceType":"Hyrox","coachName":"Brooks","day":"WED","time":"12:00 PM","duration":"60 min","level":"All Levels","colorTag":"bg-amber-950 text-amber-400 border-amber-700","description":"Technical mastery on Wall Balls, Burpee Broad Jumps, and Farmers Carry.","capacity":16,"spotsLeft":4,"price":30},{"id":"sched-12","title":"Advanced Boxing","serviceType":"Boxing","coachName":"Vega","day":"WED","time":"5:30 PM","duration":"75 min","level":"Advanced","colorTag":"bg-rose-950 text-rose-400 border-rose-700","description":"Cuban shoulder roll, defense counters, and high speed mitts.","capacity":14,"spotsLeft":1,"price":30},{"id":"sched-13","title":"Strength & Power Lifts","serviceType":"Strength","coachName":"Brooks","day":"THU","time":"6:00 AM","duration":"60 min","level":"Intermediate","colorTag":"bg-cyan-950 text-cyan-400 border-cyan-700","description":"Trap bar deadlifts, overhead presses, and kinetic kinetic chain work.","capacity":15,"spotsLeft":4,"price":25},{"id":"sched-14","title":"Cuban Style Boxing","serviceType":"Boxing","coachName":"Vega","day":"THU","time":"7:00 PM","duration":"60 min","level":"Intermediate","colorTag":"bg-purple-950 text-purple-400 border-purple-700","description":"Rhythmic angles, lateral pivot footwork, and counter boxing.","capacity":18,"spotsLeft":3,"price":28},{"id":"sched-15","title":"Fight Club Sparring","serviceType":"Boxing","coachName":"Rivera","day":"FRI","time":"5:30 PM","duration":"90 min","level":"Advanced","colorTag":"bg-rose-950 text-rose-400 border-rose-700","description":"Full ring controlled sparring session with coaches cornering.","capacity":12,"spotsLeft":2,"price":35},{"id":"sched-16","title":"Saturday Open Sparring & Ring","serviceType":"Boxing","coachName":"Rivera","day":"SAT","time":"10:00 AM","duration":"120 min","level":"Advanced","colorTag":"bg-rose-950 text-rose-400 border-rose-700","description":"Open ring sparring, timer rounds, and heavy bag conditioning.","capacity":25,"spotsLeft":8,"price":30},{"id":"sched-17","title":"Hyrox Weekend Race Simulation","serviceType":"Hyrox","coachName":"Chen","day":"SUN","time":"10:00 AM","duration":"90 min","level":"All Levels","colorTag":"bg-amber-950 text-amber-400 border-amber-700","description":"Full 8-station Hyrox course walkthrough with live timing.","capacity":20,"spotsLeft":5,"price":35}],"membershipPlans":[{"id":"plan-monthly","name":"Monthly","tagline":"Perfect for newcomers and flexible training","price":6999,"currency":"₹","period":"/month","features":["3 group classes per week","Basic equipment access","Locker room & shower access","Online class booking system","Cancel anytime, no contract"]},{"id":"plan-two-month","name":"Two Months","tagline":"For the dedicated fighter and fitness athlete","price":12999,"currency":"₹","period":"/2 months","badge":"BEST VALUE","popular":true,"features":["Unlimited group classes (Boxing, Hyrox, Strength)","Full gym & open heavy bag floor access","Sparring privileges (3x/week)","Monthly nutrition consultation","2 Personal training sessions per month","Competition prep support","Guest pass (2x/month)"]},{"id":"plan-three-month","name":"Three Months","tagline":"The professional fight & athletic experience","price":17999,"currency":"₹","period":"/3 months","features":["Unlimited everything (Classes + Sparring + Hyrox)","Daily sparring & ring access","4 Personal training sessions per month","Full customized nutrition program","Video fight analysis sessions","Fight camp access","VIP events & fight night seminars"]}],"testimonials":[{"id":"test-1","name":"CARLOS MENDEZ, 28","age":28,"memberDuration":"Member for 8 months","quote":"Sparrow Fitness changed my life. I came in overweight with zero fight experience. 8 months later I won my first amateur bout. They train your mind as much as your body.","resultBadge":"AMATEUR CHAMPION","resultText":"Lost 42 lbs. Won first amateur bout.","avatar":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300","rating":5},{"id":"test-2","name":"SARAH KIM, 34","age":34,"memberDuration":"Member for 2 years","quote":"Coach Chen and Coach Brooks are world class. The Hyrox and Boxing combination here is unmatched. I qualified for nationals twice because of Sparrow Fitness.","resultBadge":"NATIONAL QUALIFIER","resultText":"3× City champion. Hyrox Top 10.","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300","rating":5},{"id":"test-3","name":"DEVON PRICE, 22","age":22,"memberDuration":"Member for 18 months","quote":"I came in as a total beginner. Rivera saw something in me and built me from the ground up. I just signed my first pro contract at 22. None of that happens without Sparrow.","resultBadge":"PRO SIGNED","resultText":"Signed pro contract after 18 months.","avatar":"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300","rating":5},{"id":"test-4","name":"MARIA SANTOS, 41","age":41,"memberDuration":"Member for 6 months","quote":"I never thought boxing and functional strength would be for me at 41. The community here is demanding but incredibly welcoming. Best shape of my life!","resultBadge":"TRANSFORMATION","resultText":"Lost 28 lbs. Best shape of my life.","avatar":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300","rating":5}],"gallery":[{"id":"g-1","order":1,"category":"Training","image":"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800","title":"Heavy Bag Drills"},{"id":"g-2","order":2,"category":"Sparring","image":"https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800","title":"Technical Ring Sparring"},{"id":"g-3","order":3,"category":"Hyrox","image":"https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800","title":"Hyrox Sled Push Station"},{"id":"g-4","order":4,"category":"Competition","image":"https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800","title":"Brooklyn Fight Night VII"},{"id":"g-5","order":5,"category":"Coaches","image":"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800","title":"Coach Mittwork Session"},{"id":"g-6","order":6,"category":"Gym","image":"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800","title":"Full Size Competition Ring"}],"events":[{"id":"evt-1","type":"FIGHT NIGHT","title":"SPARROW FIGHT NIGHT VII","dateMonth":"JUL","dateDay":"12","time":"7:00 PM","price":2999,"priceLabel":"₹2,999 / ticket","location":"Sparrow Fitness Arena, Kotdwara","description":"12 bouts. Our best fighters take the stage in what promises to be the most electric fight night in Sparrow history.","capacityText":"Limited to 200 spectators","image":"https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800"},{"id":"evt-2","type":"WORKSHOP","title":"BOXING TECHNIQUE & HYROX MASTERCLASS","dateMonth":"JUL","dateDay":"26","time":"10:00 AM","price":4999,"priceLabel":"₹4,999 / person","location":"Sparrow Training Club Main Floor","description":"3-hour intensive with Head Coach Rivera & Coach Chen. Counter-punching, defense, and Hyrox race pacing.","capacityText":"Max 25 participants","image":"https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=800"},{"id":"evt-3","type":"TOURNAMENT","title":"KOTDWARA GOLDEN GLOVES QUALIFIER","dateMonth":"AUG","dateDay":"09","time":"2:00 PM","price":0,"priceLabel":"Free for spectators","location":"Sparrow Training Club, Kotdwara","description":"Official Golden Gloves qualifier. Sparrow athletes compete for spots in the city-wide tournament.","capacityText":"Open registration","image":"https://images.unsplash.com/photo-1509563839001-b5420716ab35?auto=format&fit=crop&q=80&w=800"}]};
function toSeedRow(d: any, i: number, coll: string): Record<string, any> {
  var row: Record<string, any> = Object.assign({}, d);
  row.sort_order = (row.order === undefined || row.order === null) ? (i + 1) : row.order;
  delete row.order;
  if (!row.id) row.id = "seed-" + coll + "-" + i;
  return row;
}
async function runSeed(force: boolean): Promise<{ ok: boolean; counts: Record<string, number>; message: string }> {
  var counts: Record<string, number> = {}; var seeded: string[] = []; var skipped: string[] = [];
  var ex = await sbRest("site_settings?" + new URLSearchParams({ select: "id", id: "eq.settings" }).toString());
  if (force || !(ex && ex[0])) {
    await sbRest("site_settings", { method: "POST", prefer: "resolution=merge-duplicates", body: Object.assign({ id: "settings" }, SEED.siteSettings) });
    counts.siteSettings = 1; seeded.push("siteSettings");
  } else { skipped.push("siteSettings"); counts.siteSettings = 0; }
  var cols: Array<[string, any[]]> = [["coaches", SEED.coaches], ["programs", SEED.programs], ["schedule", SEED.schedule], ["membershipPlans", SEED.membershipPlans], ["testimonials", SEED.testimonials], ["gallery", SEED.gallery], ["events", SEED.events]];
  for (var ci = 0; ci < cols.length; ci++) {
    var path: string = cols[ci][0]; var docs: any[] = cols[ci][1];
    var table = tableFor(path);
    var cnt = await sbRest(table + "?" + new URLSearchParams({ select: "id" }).toString(), { prefer: "count=exact" });
    var n = Array.isArray(cnt) ? cnt.length : 0;
    if (!force && n > 0) { skipped.push(path); counts[path] = 0; continue; }
    var rows = docs.map(function (d: any, i: number) { return toSeedRow(d, i, path); });
    var CH = 200;
    for (var s = 0; s < rows.length; s += CH) {
      await sbRest(table, { method: "POST", prefer: "resolution=merge-duplicates", body: rows.slice(s, s + CH) });
    }
    counts[path] = rows.length; seeded.push(path);
  }
  return { ok: true, counts: counts, message: seeded.length > 0 ? ("Seeded: " + seeded.join(", ") + (skipped.length ? (" | Skipped (already has data): " + skipped.join(", ")) : "")) : "Nothing seeded — all tables already have data. Use the Force toggle to overwrite." };
}
export default async function handler(req: any, res: any) {
  cors(req, res);
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ success: false, message: "Method not allowed" }); return; }
  var identity = await verifyFirebaseToken(req);
  if (!identity) { res.status(401).json({ success: false, message: "Authentication required" }); return; }
  var user: any;
  try {
    user = await syncUser(identity);
    if (user.role !== "admin") { res.status(403).json({ success: false, message: "Admin access required" }); return; }
  } catch (e: any) { res.status(500).json({ success: false, message: (e && e.message) || "Authentication check failed" }); return; }
  void user;
  try {
    var body = req.body || {};
    var action = body.action;
    if (action === "list") {
      var table = tableFor(body.path);
      var tryOrder: any = null; var err1: any = null;
      try { tryOrder = await sbRest(table + "?" + new URLSearchParams({ select: "*", order: "sort_order.asc.nullslast" }).toString()); }
      catch (e) { err1 = e; }
      if (!err1) { res.status(200).json({ success: true, data: (tryOrder || []).map(rowToDoc) }); return; }
      var tryCreated: any = null; var err2: any = null;
      try { tryCreated = await sbRest(table + "?" + new URLSearchParams({ select: "*", order: "created_at.asc" }).toString()); }
      catch (e) { err2 = e; }
      if (!err2) { res.status(200).json({ success: true, data: (tryCreated || []).map(rowToDoc) }); return; }
      var plain = await sbRest(table + "?" + new URLSearchParams({ select: "*" }).toString());
      res.status(200).json({ success: true, data: (plain || []).map(rowToDoc) }); return;
    }
    if (action === "save") {
      var t1 = tableFor(body.path); var data = body.data || {};
      var id = data.id || ("doc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8));
      await sbRest(t1, { method: "POST", prefer: "resolution=merge-duplicates", body: Object.assign({}, docToRow(data), { id: id }) });
      res.status(200).json({ success: true, data: { id: id } }); return;
    }
    if (action === "update") {
      var t2 = tableFor(body.path);
      await sbRest(t2 + "?" + new URLSearchParams({ id: "eq." + body.id }).toString(), { method: "PATCH", body: docToRow(body.data || {}) });
      res.status(200).json({ success: true }); return;
    }
    if (action === "delete") {
      var t3 = tableFor(body.path);
      await sbRest(t3 + "?" + new URLSearchParams({ id: "eq." + body.id }).toString(), { method: "DELETE" });
      res.status(200).json({ success: true }); return;
    }
    if (action === "seed") {
      var result = await runSeed(body.force === true);
      res.status(200).json({ success: result.ok, data: result.counts, message: result.message }); return;
    }
    res.status(400).json({ success: false, message: "Unknown action: " + action }); return;
  } catch (e: any) {
    res.status(500).json({ success: false, message: (e && e.message) || "Server error" }); return;
  }
}
