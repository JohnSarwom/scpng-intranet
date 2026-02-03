# Market News Integration - Implementation Checklist

## 📋 Backend Setup (SharePoint)

### Phase 1: Create List (15 min)
- [ ] Navigate to SharePoint site: `https://scpng1.sharepoint.com/sites/scpngintranet`
- [ ] Go to Settings → Site contents
- [ ] Create new list named `MarketNews`
- [ ] Add description: "PNGX and Capital Market news articles"

### Phase 2: Add Columns (20 min)
- [ ] **Title** (Already exists - Single line text)
- [ ] **PublishDate** (Date and time - Required)
- [ ] **Category** (Choice - Required)
  - [ ] Add choices: Market Activity, Company Announcement, Regulatory, Mining Sector, Financial Sector, Energy Sector, Agriculture Sector, General Market
  - [ ] Set default: General Market
- [ ] **RelatedCompany** (Multiple choice - Optional)
  - [ ] Add choices: BSP, CCP, CGA, CPL, KAM, KSL, NEM, NGP, NIU, SST, STO, PNGX, Other
  - [ ] Enable multiple selections
- [ ] **Priority** (Choice - Required)
  - [ ] Add choices: High, Normal, Low
  - [ ] Set default: Normal
- [ ] **IsActive** (Yes/No - Required)
  - [ ] Set default: Yes
- [ ] **ExpiryDate** (Date - Optional)
- [ ] **LinkURL** (Hyperlink - Optional)
- [ ] **Source** (Single line text - Optional)
- [ ] **Summary** (Multiple lines text - Optional)

### Phase 3: Configure Views (5 min)
- [ ] Create "Active News" view
- [ ] Filter: IsActive = Yes
- [ ] Sort: PublishDate descending
- [ ] Make it default view

### Phase 4: Add Test Data (10 min)
- [ ] Add at least 5 sample news items
- [ ] Vary categories and priorities
- [ ] Include some with High priority
- [ ] Include LinkURL on some items
- [ ] Test different time periods (today, yesterday, last week)

### Phase 5: Permissions (5 min)
- [ ] Verify all authenticated users can read
- [ ] Set up content editor permissions
- [ ] Test access with regular user account

---

## 🔐 Azure AD Configuration (10 min)

- [ ] Open Azure Portal: `https://portal.azure.com`
- [ ] Navigate to Azure Active Directory
- [ ] Find your app registration
- [ ] Check API Permissions:
  - [ ] `Sites.Read.All` (Delegated) - Present and granted
  - [ ] Admin consent granted
- [ ] Note: If missing, add and grant consent

---

## 💻 Frontend Verification (5 min)

### Files Created (Already done ✅)
- [x] `src/services/marketNewsSharePointService.ts`
- [x] `src/hooks/useMarketNews.ts`
- [x] `docs/MARKET_NEWS_SHAREPOINT_SETUP.md`
- [x] `docs/MARKET_NEWS_IMPLEMENTATION_GUIDE.md`
- [x] `docs/MARKET_NEWS_QUICK_START.md`
- [x] `docs/MARKET_NEWS_ARCHITECTURE.md`
- [x] `docs/MARKET_NEWS_SUMMARY.md`

### Files Modified (Already done ✅)
- [x] `src/pages/MarketData.tsx`

---

## 🧪 Testing Phase (15 min)

### Build & Run
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build`
- [ ] Check for TypeScript errors
- [ ] Run `npm run dev`
- [ ] Application starts successfully

### Functional Testing
- [ ] Navigate to Market Data page
- [ ] News section visible in right sidebar
- [ ] Loading spinner appears initially
- [ ] News items load successfully
- [ ] Count matches SharePoint list (active items only)

### News Display Testing
- [ ] Time ago displays correctly
- [ ] "Breaking" badge shows for High priority news
- [ ] Category badges display
- [ ] News titles are readable
- [ ] Summary text shows (if available)
- [ ] Source attribution displays (if available)

### Interaction Testing
- [ ] Click news item with LinkURL → Opens in new tab
- [ ] Click refresh button → Reloads news
- [ ] Loading spinner shows during refresh
- [ ] News updates after refresh

### Error Testing
- [ ] Disable network → Shows error message
- [ ] Error message is user-friendly
- [ ] Retry button appears
- [ ] Click retry → Attempts to reload

### Empty State Testing
- [ ] Set all news IsActive = No in SharePoint
- [ ] Refresh page
- [ ] "No news available" message shows
- [ ] Set items back to IsActive = Yes

---

## 📱 Cross-Browser Testing (10 min)

- [ ] Chrome - News displays correctly
- [ ] Edge - News displays correctly
- [ ] Firefox - News displays correctly
- [ ] Safari (if available) - News displays correctly
- [ ] Mobile view - News readable and scrollable

---

## 👥 User Acceptance Testing (15 min)

### Content Editor Training
- [ ] Show how to add news in SharePoint
- [ ] Demonstrate all fields
- [ ] Explain IsActive toggle
- [ ] Show ExpiryDate usage
- [ ] Practice adding test news item

### End User Testing
- [ ] Have user navigate to page
- [ ] User can read news
- [ ] User can click links
- [ ] User can refresh news
- [ ] Get feedback on usability

---

## 📚 Documentation Review (10 min)

- [ ] Read [Quick Start Guide](MARKET_NEWS_QUICK_START.md)
- [ ] Verify setup steps match actual process
- [ ] Read [Implementation Guide](MARKET_NEWS_IMPLEMENTATION_GUIDE.md)
- [ ] Check troubleshooting section
- [ ] Bookmark documentation for reference

---

## 🚀 Pre-Production Checklist (10 min)

### Code Quality
- [ ] No console errors in browser
- [ ] No TypeScript compilation errors
- [ ] Code follows project conventions
- [ ] All files properly formatted

### Performance
- [ ] Page loads in < 3 seconds
- [ ] News fetches in < 2 seconds
- [ ] Refresh is responsive
- [ ] No memory leaks (check DevTools)

### Security
- [ ] Authentication working
- [ ] Only authorized users can access
- [ ] No sensitive data in console
- [ ] HTTPS only in production

### Documentation
- [ ] All docs up to date
- [ ] Comments in code are accurate
- [ ] README mentions new feature
- [ ] Change log updated

---

## 📊 Production Deployment (20 min)

### Pre-Deploy
- [ ] All tests passing
- [ ] Staging environment tested
- [ ] Backup current production
- [ ] Notify users of upcoming changes

### Deploy
- [ ] Build production bundle
- [ ] Deploy to production environment
- [ ] Verify deployment successful
- [ ] Check production logs

### Post-Deploy
- [ ] Test production environment
- [ ] Verify news loading
- [ ] Monitor for errors
- [ ] Confirm with stakeholders

---

## 📈 Post-Launch Monitoring (First Week)

### Daily Checks
- [ ] Day 1: Monitor error logs
- [ ] Day 2: Check performance metrics
- [ ] Day 3: Review user feedback
- [ ] Day 4: Verify news updates working
- [ ] Day 5: Check content editor usage
- [ ] Day 6: Review analytics
- [ ] Day 7: Assess overall success

### Metrics to Track
- [ ] Number of news views
- [ ] Load time average
- [ ] Error rate
- [ ] User engagement
- [ ] Content update frequency

---

## ✅ Sign-Off

### Technical Lead
- [ ] Code reviewed
- [ ] Architecture approved
- [ ] Documentation complete
- [ ] Signed off: _________________ Date: _______

### Product Owner
- [ ] Requirements met
- [ ] User stories complete
- [ ] Acceptance criteria satisfied
- [ ] Signed off: _________________ Date: _______

### IT Manager
- [ ] Security approved
- [ ] Performance acceptable
- [ ] Support plan in place
- [ ] Signed off: _________________ Date: _______

---

## 🎉 Completion

**Status**: ⬜ Not Started | ⏳ In Progress | ✅ Complete

**Overall Progress**: _____% Complete

**Notes**: 
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

**Completed By**: _________________ Date: _______

---

## 📞 Support Contacts

| Role | Name | Contact |
|------|------|---------|
| Developer | ________ | _________ |
| Content Admin | ________ | _________ |
| IT Support | ________ | _________ |
| Project Lead | ________ | _________ |

---

**Document Version**: 1.0
**Last Updated**: December 2025
**Next Review**: After deployment
