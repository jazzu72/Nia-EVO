# 🔧 DEPLOYMENT FIX GUIDE

**Status:** After rollback, we'll fix the deployment issues  
**Target:** Get nia-evo-3 running cleanly on Render

---

## 🔍 PROBLEMS IDENTIFIED

### Problem 1: server-watson.js Has Errors
**File:** `server-watson.js` (Lines 365-412)

**Issues Found:**
```javascript
// Line 365-368: Empty try/catch blocks
try {
} catch(e) {
  console.log("⚠️ grants route:", e.message);
}

// Line 370-373: More empty try/catch blocks
try {
} catch(e) {
  console.log("⚠️ funding route:", e.message);
}

// Line 377-388: Duplicate grant/funding mount
try {
 console.log("✅ grants mounted");
} catch(e) {
 console.log("❌ grants failed:", e.message);
}

// Line 412: Incomplete/abandoned code
// FINAL FALLBACK
```

**Why this fails:**
- Empty try/catch blocks indicate incomplete code
- Lines 332-336 already mount grants/funding
- The empty blocks create noise and confusion
- Render logs become hard to debug

### Problem 2: render.yaml Points to server-watson.js
**File:** `render.yaml` (Line 7)

```yaml
startCommand: node server-watson.js
```

**Issue:** `server-watson.js` is messy legacy code. We have a cleaner version in `src/api/server.js`

**Better approach:** Use clean `src/api/server.js` which:
- Has proper error handling
- Uses modular app.js
- Follows better structure
- Easier to maintain

### Problem 3: Duplicate Module Mounting
**In server-watson.js:**
- Lines 29-33: Mounts `/api/grants` and `/api/funding`
- Lines 332-336: Mounts same routes AGAIN
- This causes conflicts

---

## ✅ SOLUTION (AFTER ROLLBACK)

### Step 1: Create a Clean Server File
Replace `server-watson.js` with simplified version:

```javascript
// server-watson.js - SIMPLIFIED
const app = require("./src/api/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Nia Capital OS running on port ${PORT}`);
});
```

This is just a wrapper around the clean `src/api/app.js`

### Step 2: Update render.yaml
Keep the `startCommand` the same but ensure dependencies are correct:

```yaml
services:
  - type: web
    name: nia-evo-3
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: node server-watson.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: nia-evo-db
          property: connectionString
```

### Step 3: Verify src/api/app.js Works
The modular approach in `src/api/app.js`:
- ✅ Loads modules properly
- ✅ Has error handling for missing modules
- ✅ Returns proper JSON responses
- ✅ Has 404 handler
- ✅ Has error handler

---

## 📋 ACTION PLAN (After Rollback)

### Phase 1: AFTER SERVICE IS RESTORED (Today)

✅ Service should be LIVE with deployment `9757258`

### Phase 2: FIX THE SERVER (Tomorrow)

**DO THIS IN ORDER:**

#### 2.1: Create new clean server-watson.js
```bash
# Copy this into server-watson.js
const app = require("./src/api/app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Nia Capital OS running on port ${PORT}`);
});
```

#### 2.2: Verify src/api/app.js
Check that `src/api/app.js`:
- Has `module.exports = app;` at the end ✅ (Already has it)
- Handles missing modules gracefully ✅ (Already does)
- Has proper error handlers ✅ (Already has them)

#### 2.3: Commit & Push
```bash
git add server-watson.js
git commit -m "🔧 Clean up server-watson.js - remove duplicate code and empty blocks"
git push origin main
```

#### 2.4: Test Render Deploy
- Render will auto-deploy
- Monitor the Deploys tab
- Check service status

#### 2.5: Verify New Deployment
```bash
# Test the health endpoint
curl https://nia-evo-3.onrender.com/api/health

# Should return:
# {
#   "system": "Nia Capital OS",
#   "status": "ONLINE",
#   "timestamp": "2026-08-12T...",
#   "node": "v18.x.x"
# }
```

---

## 🚀 DEPLOYMENT TIMELINE

| Phase | Action | Time | Status |
|-------|--------|------|--------|
| **NOW** | Rollback service to 9757258 | 5 min | In Progress |
| **Now +5** | Verify service LIVE | 2 min | Verify |
| **Tomorrow** | Create clean server-watson.js | 5 min | Code |
| **Tomorrow** | Commit & push | 2 min | Push |
| **Tomorrow** | Render auto-deploys | 2-3 min | Deploy |
| **Tomorrow** | Verify new deployment works | 2 min | Test |
| **Done** | ✅ Clean deployment running | 18 min | Success |

---

## 📝 FILES TO CHANGE

### File 1: server-watson.js
**Current:** ~412 lines with empty blocks and duplicates  
**New:** ~7 lines, clean and simple  
**Changes:** Remove everything except wrapper that loads `src/api/app`

### File 2: render.yaml
**Current:** Pointing to server-watson.js  
**New:** Keep same (but now it's clean)  
**Changes:** None needed if server-watson.js is fixed

---

## 🎯 EXPECTED RESULTS

**Before Fix:**
- ❌ Latest deployment fails
- ❌ server-watson.js has duplicate code
- ❌ Empty try/catch blocks
- ❌ Messy router loading

**After Fix:**
- ✅ Clean deployment
- ✅ Proper error handling
- ✅ Modular architecture
- ✅ Easy to maintain
- ✅ Render auto-deploys work

---

## 🔍 TROUBLESHOOTING

### If Deploy Still Fails After Fix

**Check these:**

1. **Module loading errors in logs:**
   - Missing routes directory?
   - Check `src/api/app.js` module paths
   - Verify all required modules exist

2. **Port issues:**
   - render.yaml sets DATABASE_URL
   - server-watson.js doesn't use DATABASE_URL yet
   - That's OK - just PORT for now

3. **Database connection:**
   - DATABASE_URL is optional for this phase
   - Service can run without it
   - Health check doesn't require DB

### If Health Check Fails

```bash
# Debug locally
npm install
node server-watson.js

# Should see:
# 🚀 Nia Capital OS running on port 3000

# Test locally
curl http://localhost:3000/api/health
```

---

## ✔️ VERIFICATION CHECKLIST

After new deployment goes live:

- [ ] Service shows LIVE status
- [ ] Uptime counter running
- [ ] No errors in Events tab
- [ ] `/api/health` returns 200
- [ ] `/api/status` returns 200
- [ ] All modules loading (check logs)

---

## 📞 NEXT STEPS

1. **Complete rollback** (this step)
2. **Wait for service to stabilize** (monitor for 5-10 min)
3. **Return here tomorrow** with status
4. **Execute Phase 2** (clean up server-watson.js)
5. **Verify new deployment**

---

**This guide is ready to execute AFTER rollback is complete.**

Report back when:
- ✅ Rollback successful?
- 📊 Service LIVE and stable?
- ✅ Health check working?

