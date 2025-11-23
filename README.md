Over the past few weeks, I’ve been building a learning platform (LMS) aimed at helping people learn programming and web development effectively.

To be honest, I’ve struggled to learn things online — most tutorials and videos are not well organized, jump around topics, or just feel overwhelming. It made me realize how hard self-learning can be. That’s when I decided: why not build my own app for learning?

The app allows users to:

Sign up and log in (including Google One-Tap login)

Enroll in video courses and track progress

Access curated learning resources all in one place, properly structured

Sounds simple, right? Well, building it taught me more than I expected.

Here are some of the biggest challenges I faced:

Google login issues: It worked on localhost but failed in production due to missing client_id and environment variable misconfigurations. Debugging this taught me the importance of correctly setting env vars in production.

Database struggles: At first, new users weren’t being created in the right MongoDB database — a simple URL misconfiguration caused hours of confusion.

Frontend-backend integration: Sending tokens from the frontend to the backend and verifying them securely with JWT reinforced my understanding of authentication flows.

Deployment surprises: Differences between local and production environments, especially with Vercel, reminded me that deployment is its own challenge.

💡 Key Takeaways:

Real-world apps almost never work perfectly on the first try — debugging is part of the learning.

Every problem you solve strengthens your skills. Environment issues, auth flows, database connections — they all teach you something.

Persistence and patience are everything. Frustration is temporary, growth is permanent.

Today, I finally have Google One-Tap login working in production, automatic user creation, and a fully functional learning platform ready to help people learn programming the practical way.

Building this app reminded me why I love hands-on learning: the struggles are tough, but the growth, understanding, and confidence you gain are worth every single hour.

If you’re learning, building, or debugging — keep going. Every error is a lesson. Every bug fixed is progress. 💪
