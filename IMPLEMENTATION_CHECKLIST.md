# Implementation Checklist - Supabase Integration

Use this checklist to track your progress through the Supabase integration.

---

## 📋 Pre-Implementation (Review Phase)

- [ ] Read **DATABASE_INTEGRATION_SUMMARY.md** (10 min overview)
- [ ] Review **ARCHITECTURE_DIAGRAM.md** (understand system design)
- [ ] Read **SUPABASE_SOLUTION_VALIDATION.md** (architecture validation)
- [ ] Skim **SUPABASE_INTEGRATION_PLAN.md** (detailed specs)
- [ ] Discuss with team/stakeholders if needed
- [ ] Approve budget ($0-$600/month depending on scale)
- [ ] Set timeline (6-8 weeks recommended)

---

## 🚀 Phase 1: Foundation (Week 1)

### Day 1: Setup Supabase
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (name: `petamalaysia-prod`, region: Singapore)
- [ ] Save database password securely
- [ ] Copy project URL and anon key
- [ ] Create `.env.local` with Supabase credentials
- [ ] Add `.env.local` to `.gitignore` (verify!)
- [ ] Install dependencies: `npm install @supabase/supabase-js`

### Day 2: Create Database Schema (Part 1)
- [ ] Go to Supabase SQL Editor
- [ ] Run: Create `states` table
- [ ] Run: Populate `states` with 16 Malaysian states
- [ ] Run: Create `users` table with indexes
- [ ] Verify tables exist in Table Editor

### Day 3: Create Database Schema (Part 2)
- [ ] Run: Create `polls` table with indexes
- [ ] Run: Create `poll_options` table with indexes
- [ ] Run: Create `votes` table with indexes
- [ ] Run: Create `vote_state_breakdown` table
- [ ] Run: Create `user_transactions` table
- [ ] Verify all tables and relationships

### Day 4: Database Functions & Triggers
- [ ] Run: Create `get_or_create_user()` function
- [ ] Run: Create `update_vote_state_breakdown` trigger
- [ ] Test functions work in SQL Editor
- [ ] Document any issues

### Day 5: Enable Row Level Security
- [ ] Enable RLS on all tables
- [ ] Create basic policies (public read for now)
- [ ] Test that tables are accessible
- [ ] Review RLS policies for security

---

## 🔌 Phase 2: Core Integration (Week 2)

### Day 1: Supabase Client
- [ ] Create `lib/supabase.ts`
- [ ] Add TypeScript types for database
- [ ] Create test page `pages/test-supabase.tsx`
- [ ] Visit `/test-supabase` and verify connection works
- [ ] Fix any connection issues

### Day 2-3: Update UserProfileContext
- [ ] Add `internalUserId` state
- [ ] Implement `loadUserData()` function using `get_or_create_user`
- [ ] Update `setSelectedState()` to use Supabase
- [ ] Test login flow end-to-end
- [ ] Verify user created in database
- [ ] Test state selection works

### Day 4-5: Real-time User Stats
- [ ] Subscribe to user data changes
- [ ] Test that stats update in real-time
- [ ] Test points/exp display on UI
- [ ] Test level calculation
- [ ] Fix any issues with context

---

## 🗳️ Phase 3: Polls Migration (Week 3)

### Day 1: Migrate Default Polls
- [ ] Create `scripts/migrate-polls.ts`
- [ ] Run migration script for 20 default polls
- [ ] Verify all polls in database
- [ ] Verify all poll options created
- [ ] Check data integrity

### Day 2-3: Load Polls from Database
- [ ] Update polls page to load from Supabase
- [ ] Load poll options for each poll
- [ ] Display polls on UI
- [ ] Test filtering by category
- [ ] Test poll end date display

### Day 4-5: Implement Vote Function
- [ ] Create `cast_vote()` database function
- [ ] Update `handleVote()` in polls page
- [ ] Test voting flow
- [ ] Verify points/exp awarded
- [ ] Verify vote recorded in database
- [ ] Test double-voting prevention
- [ ] Test level up notifications

---

## 🎨 Phase 4: Poll Creation (Week 4)

### Day 1-2: Create Poll Function
- [ ] Create `create_poll()` database function
- [ ] Update `handleCreatePoll()` in polls page
- [ ] Test poll creation flow
- [ ] Verify 200 points deducted
- [ ] Verify 200 EXP awarded
- [ ] Test insufficient points prevention
- [ ] Verify poll appears immediately

### Day 3-5: Vote Results & Analytics
- [ ] Load poll results from database
- [ ] Load state breakdown data
- [ ] Update charts to use Supabase data
- [ ] Test vote percentages display correctly
- [ ] Test state-by-state breakdown charts

---

## 🔄 Phase 5: Data Migration (Week 5)

### Day 1: Create Migration Scripts
- [ ] Create script to migrate user stats from localStorage
- [ ] Create script to migrate votes from localStorage
- [ ] Create script to migrate custom polls
- [ ] Test scripts with sample data

### Day 2-3: Dual-Write Implementation
- [ ] Implement writing to both localStorage AND Supabase
- [ ] Implement reading from Supabase with localStorage fallback
- [ ] Monitor for data discrepancies
- [ ] Fix any sync issues

### Day 4-5: Full Migration
- [ ] Run migration for existing users
- [ ] Validate migrated data
- [ ] Switch to Supabase-only reads
- [ ] Keep localStorage as cache only
- [ ] Monitor for errors

---

## ⚡ Phase 6: Real-time Features (Week 6)

### Day 1-2: Real-time Vote Updates
- [ ] Subscribe to vote changes per poll
- [ ] Update UI when new votes come in
- [ ] Test with multiple browser windows
- [ ] Optimize subscriptions (prevent duplicates)

### Day 3: Real-time User Stats
- [ ] Already done in Phase 2!
- [ ] Verify still working after all changes

### Day 4-5: Polish & Testing
- [ ] Test all features end-to-end
- [ ] Test error handling
- [ ] Test offline behavior
- [ ] Test performance
- [ ] Fix any bugs

---

## 🎯 Phase 7: Optimization & Launch (Week 7)

### Day 1-2: Implement Caching
- [ ] Create `lib/cache.ts`
- [ ] Implement client-side cache (60s TTL)
- [ ] Add cache invalidation on updates
- [ ] Test cache performance

### Day 3: Performance Testing
- [ ] Test with 100 concurrent users (simulate)
- [ ] Measure query response times
- [ ] Verify all operations < target times
- [ ] Optimize slow queries

### Day 4: Security Audit
- [ ] Review RLS policies
- [ ] Test that users can't manipulate points
- [ ] Test double-voting prevention
- [ ] Test unauthorized access prevention
- [ ] Fix any security issues

### Day 5: Production Launch
- [ ] Final testing on production database
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Announce to users
- [ ] Monitor user feedback

---

## 🔮 Future Enhancements (Week 8+)

### High Priority
- [ ] Implement leaderboard (use `user_leaderboard` view)
- [ ] Add user profile pages
- [ ] Implement notifications system
- [ ] Add poll comments

### Medium Priority
- [ ] Poll reactions (like, fire, etc.)
- [ ] User badges & achievements
- [ ] Advanced analytics dashboard
- [ ] Admin moderation tools

### Nice to Have
- [ ] Social following system
- [ ] Scheduled polls
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Test vote function prevents double voting
- [ ] Test poll creation requires 200 points
- [ ] Test points/exp calculations
- [ ] Test level progression

### Integration Tests
- [ ] Test full voting flow (login → select state → vote → rewards)
- [ ] Test full poll creation flow
- [ ] Test migration from localStorage
- [ ] Test real-time updates

### Performance Tests
- [ ] Test 100 concurrent votes
- [ ] Test poll loading time < 200ms
- [ ] Test vote casting time < 300ms
- [ ] Test with 1000+ polls

### Security Tests
- [ ] Test RLS prevents unauthorized access
- [ ] Test can't manipulate points directly
- [ ] Test can't vote twice
- [ ] Test can't view others' votes

---

## 📊 Monitoring Checklist

### Daily (First Week)
- [ ] Check Supabase dashboard for errors
- [ ] Monitor query performance
- [ ] Check RLS policy execution
- [ ] Review user feedback

### Weekly (Ongoing)
- [ ] Review performance metrics
- [ ] Check database size growth
- [ ] Verify backups are running
- [ ] Review cost (stay within budget)

### Monthly
- [ ] Performance optimization review
- [ ] Security audit
- [ ] User engagement analysis
- [ ] Plan next features

---

## 🆘 Troubleshooting Guide

### Issue: Can't connect to Supabase
**Solution:**
1. Check internet connection
2. Verify `.env.local` has correct values
3. Restart dev server
4. Check Supabase project status

### Issue: RLS policy prevents access
**Solution:**
1. Check SQL Editor logs
2. Review RLS policies in dashboard
3. Temporarily disable RLS for testing (re-enable before production!)

### Issue: Vote not recording
**Solution:**
1. Check browser console for errors
2. Verify user is authenticated
3. Check user has selected state
4. Verify poll is active
5. Check database logs in Supabase

### Issue: Points not updating
**Solution:**
1. Check `cast_vote()` function executed successfully
2. Verify `user_transactions` table has new entry
3. Check real-time subscription is active
4. Manually refresh user data

---

## ✅ Definition of Done

The Supabase integration is complete when:

1. **All Features Working**
   - Users can sign in and select state
   - Users can vote on polls
   - Users can create polls (with 200 points)
   - Points and EXP are awarded correctly
   - Level system works
   - Real-time updates work

2. **All Data Migrated**
   - Default polls in database
   - Existing user data migrated
   - No data loss
   - localStorage cleaned up

3. **Performance Targets Met**
   - Polls load < 200ms
   - Votes cast < 300ms
   - Real-time updates < 500ms

4. **Security Verified**
   - RLS policies working
   - No unauthorized access possible
   - Audit trail complete

5. **Documentation Complete**
   - Code commented
   - README updated
   - Deployment guide created

6. **Team Onboarded**
   - Team knows how to use Supabase dashboard
   - Team knows how to write queries
   - Team knows how to deploy changes

---

## 🎉 Celebration Milestones

- [ ] ✨ First successful database connection
- [ ] 🎯 First user created in database
- [ ] 🗳️ First vote recorded via Supabase
- [ ] 💰 First poll created with points
- [ ] 🔄 Real-time update working
- [ ] 📊 All 20 default polls migrated
- [ ] 🚀 First user data migrated
- [ ] 🎊 Production launch!

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Next.js + Supabase:** https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

---

## 📝 Notes & Learnings

Use this section to document:
- Issues encountered and solutions
- Performance optimizations made
- Things you'd do differently next time
- Tips for other developers

---

**Good luck with your implementation! 🚀**

Remember: Start with **SUPABASE_QUICKSTART.md** for immediate setup, then follow this checklist phase by phase.

