# 🎤 JimatBite Presentation Script

---

## 🔍 PROBLEM STATEMENTS (60 seconds)

**"JimatBite addresses three critical challenges in Malaysia's food ecosystem.**

**First — affordability.** Rising inflation hit food prices at 2.1% in 2025, with outside food jumping 4.7%. What cost RM30 in 1980 now costs RM100. B40 households spend over 70% of income on necessities, making quality meals increasingly out of reach for students, part-time workers, and low-income families.

**Second — safety and trust.** Current surplus platforms lack transparency. Consumers worry about near-expiry food, poor storage practices, and unclear hygiene standards. Without structured safety checks, adoption remains limited.

**Third — sustainability costs.** Eco-friendly packaging is expensive, forcing small F&B outlets to choose between affordability and environmental responsibility. This creates a barrier to sustainable operations."

---

## 🎯 OBJECTIVES (45 seconds)

**"Our solution delivers three targeted objectives.**

**One:** Build a mobile redistribution platform with blind box mechanics, real-time inventory tracking, and transparent metadata — ensuring freshness visibility and dynamic pricing based on demand and spoilage risk.

**Two:** Implement merchant verification workflows using QR-based traceability, timestamp logging, storage condition monitoring, and hygiene certifications to establish consumer trust and food safety.

**Three:** Gamify eco-packaging adoption through tracking modules, merchant rewards, and API integration with local sustainable suppliers — making green operations affordable and visible."

---

## 🏗️ ARCHITECTURE DIAGRAM (60 seconds)

**"Let's walk through the technical architecture.**

**Frontend:** We use **React Native with Expo** for cross-platform mobile deployment — one codebase runs on iOS and Android, reducing development time while maintaining native performance.

**Backend:** The app leverages **Firebase** as a Backend-as-a-Service. This includes **Cloud Firestore** for real-time NoSQL data storage, **Firebase Authentication** for secure user management, and **Firebase Storage** for merchant images and menu photos.

**Payment Integration:** We're integrating **PayPal** for secure, trusted transactions familiar to Malaysian users.

**Development Tools:** We use **GitHub** for version control, **VS Code** as our IDE, and **CI/CD pipelines** for automated deployment to ensure code quality and rapid iteration.

**Data Flow:** Users authenticate via Firebase Auth, query real-time data from Firestore, and interact through the React Native UI. All backend services are serverless, meaning automatic scaling without infrastructure management.

**Security:** Role-based access control ensures customers, merchants, and admins have appropriate permissions. All data transmission uses HTTPS encryption."

---

## ❓ Q&A PREPARATION — Technology Comparisons

### **Why Firebase over MongoDB/Supabase?**
- **Real-time sync:** Firestore provides instant updates — critical for live inventory and order tracking
- **Zero server management:** Serverless architecture reduces operational overhead for our team
- **Integrated ecosystem:** Auth, Storage, Functions, and Hosting in one platform
- **Free tier:** Generous limits for early-stage development
- **Trade-off:** Less query flexibility than SQL, but our data model fits NoSQL well

### **Why React Native over Flutter/Native?**
- **JavaScript ecosystem:** Our team already knows React and JS
- **Expo tooling:** Simplifies deployment, OTA updates, and library integration
- **Community:** Massive library ecosystem (maps, QR codes, notifications)
- **Faster development:** Shared codebase means one team builds both platforms
- **Trade-off:** Slightly lower performance than native, but sufficient for our use case

### **Why PayPal over Stripe/iPay88?**
- **Trust factor:** Widely recognized by Malaysian users
- **International ready:** Easier merchant onboarding if we expand
- **Lower integration complexity:** Straightforward SDK for React Native
- **Trade-off:** Higher fees than local gateways, but better initial user adoption

### **Why Firebase Functions over Node.js server?**
- **Serverless scaling:** Automatically handles traffic spikes during meal times
- **Cost efficiency:** Pay per execution, not for idle servers
- **Easy integration:** Native Firebase SDK compatibility
- **Trade-off:** Cold start delays, but caching mitigates this

### **Why GitHub over GitLab/Bitbucket?**
- **Industry standard:** Best for collaboration and CI/CD actions
- **Free private repos:** Supports our academic project needs
- **GitHub Actions:** Built-in CI/CD without third-party tools

---

## 💡 KEY TALKING POINTS

### **Emphasize:**
1. **Real-time is critical** — users need live inventory to avoid disappointment
2. **Rapid development** — our tech stack lets a small team build fast
3. **Scalability** — serverless means we grow without infrastructure redesign
4. **Cost-effective** — Firebase free tier supports 10K+ users initially

### **If asked about limitations:**
- "Firebase query flexibility is limited compared to SQL, but we've structured our data model to work within those constraints"
- "React Native has slight performance overhead vs native, but our UI is smooth and responsive for food ordering workflows"

### **If asked about future plans:**
- "We're exploring Firebase Cloud Functions for backend automation"
- "Considering ML integration for demand prediction and dynamic pricing"
- "Blockchain for enhanced traceability is in our roadmap"

---

## 📊 SLIDE TRANSITION TIPS

**Problem → Objectives:**
*"These problems aren't just statistics — they represent real barriers. Our objectives directly respond to each one."*

**Objectives → Architecture:**
*"To deliver these solutions, we need robust, scalable technology. Here's how we built it."*

**Architecture → Close:**
*"This architecture balances speed, cost, and scalability — perfect for launching and growing JimatBite."*

---

## ⏱️ TIME MANAGEMENT
- **Problem Statements:** 60s
- **Objectives:** 45s
- **Architecture:** 60s
- **Buffer for transitions:** 15s
- **Total:** ~3 minutes

**Practice tip:** Record yourself and trim any filler words. Speak clearly, not fast.
