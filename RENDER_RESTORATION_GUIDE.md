# 🚀 RENDER SERVICE RESTORATION GUIDE

**Date:** August 12, 2026  
**Service:** nia-evo-3  
**Service ID:** srv-d9squq0n74is7398u900  
**Issue:** Latest deployment failed - Need to rollback to last known-good deploy

---

## ⚠️ CURRENT STATUS

| Item | Status |
|------|--------|
| **Current Live Deploy** | `9757258` ✅ |
| **Latest Deploy** | FAILED ❌ |
| **Auto-deploy** | ENABLED |
| **Blueprint** | Managed ✅ |
| **GitHub Link** | jazzu72/Nia-EVO (main) |

---

## 🛑 CRITICAL: DO NOT DO YET

❌ **DO NOT** press "Manual Deploy"  
❌ **DO NOT** modify `render.yaml`  
❌ **DO NOT** modify `server-watson.js`  
❌ **DO NOT** push any changes to GitHub

We need to restore the last known-good deployment first.

---

## ✅ RESTORATION STEPS (Do These in Order)

### STEP 1: Access Render Dashboard
1. Go to: https://dashboard.render.com/
2. Sign in with your account
3. Click on service: **nia-evo-3**

### STEP 2: Navigate to Deployments
1. From the service page, click the **"Deploys"** tab
2. You should see deployment history with statuses

### STEP 3: Identify the Last Live Deployment
**Look for:**
- Deployment ID: `9757258`
- Status: Should show as **LIVE** (not "Failed")
- This is the last known-good deployment

### STEP 4: Rollback to Last Known-Good Deploy
1. Find deployment `9757258` in the list
2. Click the **three-dot menu** (⋯) on that deployment
3. Select **"Rollback to this deploy"** (or similar option)
4. Confirm the rollback when prompted
5. Wait for the rollback to complete (~2-3 minutes)

### STEP 5: Verify Restoration
Once rollback completes:
1. Check the **Events** tab for confirmation
2. Service should show status: **LIVE** ✅
3. Try accessing: https://nia-evo-3.onrender.com/api/watson/health
4. Should return: `{"status":"Watson Online",...}`

---

## 📊 EXPECTED TIMELINE

| Step | Time | Status |
|------|------|--------|
| Navigate to Deploys | 30 sec | Quick |
| Find Deployment 9757258 | 1 min | Quick |
| Click Rollback | 30 sec | Instant |
| Rollback Processing | 2-3 min | Wait |
| Verification | 1 min | Confirm |
| **Total** | **~5 min** | 🎯 |

---

## ✔️ VERIFICATION CHECKLIST

After rollback completes, verify:

- [ ] Deployment status changed to **LIVE**
- [ ] Service shows **"Live"** badge (green)
- [ ] No error messages in Events tab
- [ ] Uptime counter restarted

### Test the Service
```bash
# Try this in terminal
curl https://nia-evo-3.onrender.com/api/watson/health

# Should return something like:
# {"status":"Watson Online","timestamp":"2026-08-12T...","uptime":123.45,...}
```

---

## 🚨 If Rollback Fails

If you see errors during rollback:

1. **Check Render Status:** https://status.render.com/
2. **Review Events Log:** Look for error messages
3. **Common Issues:**
   - Database connection timeout → Try again in 5 minutes
   - Build environment issue → May need full redeploy
   - GitHub authentication → Check GitHub token in Render settings

**DO NOT** attempt "Manual Deploy" if rollback fails.  
Contact Render support or return to this guide.

---

## 📝 NEXT STEPS (AFTER RESTORATION)

Once the service is restored and verified as LIVE:

1. ✅ Confirm uptime on dashboard
2. ✅ Test API endpoints work
3. ✅ Document what caused the failure
4. ✅ Return here for diagnosis phase

**DO NOT** touch code or configs until service is confirmed stable.

---

## 🔗 USEFUL LINKS

- **Render Dashboard:** https://dashboard.render.com/
- **Service Page:** https://dashboard.render.com/services/srv-d9squq0n74is7398u900
- **Service URL:** https://nia-evo-3.onrender.com/
- **Render Docs:** https://render.com/docs/deploys

---

## ⏱️ TIME ESTIMATE

**Total time to restore:** 5-10 minutes

1. Access dashboard: 1 min
2. Find deployment: 1-2 min
3. Rollback: 30 sec
4. Process: 2-3 min
5. Verify: 1-2 min

**After restoration, we'll diagnose what caused the failure.**

---

**Next:** Complete these steps, then report back with:
- ✅ Rollback successful? (Yes/No)
- 📊 Service status now? (Live/Failed/Building)
- 🔗 API health check result? (working/error)

