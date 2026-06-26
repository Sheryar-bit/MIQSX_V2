// Dev helper: set a user's workspace (organization) plan directly in Mongo.
// Usage:  node --env-file=.env scripts/set-plan.cjs <email> <free|pro|agency>
const mongoose = require("mongoose");

(async () => {
  const [email, plan] = process.argv.slice(2);
  if (!email || !["free", "pro", "agency"].includes(plan)) {
    console.error("usage: node --env-file=.env scripts/set-plan.cjs <email> <free|pro|agency>");
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set (run with --env-file=.env)");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }

  const res = await db.collection("organizations").updateOne(
    { ownerId: user._id },
    {
      $set: {
        plan,
        planActivatedAt: new Date(),
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }
  );

  console.log(
    res.matchedCount
      ? `✓ Set ${email}'s workspace to "${plan}"`
      : `✗ No organization found for ${email} — run /api/admin/migrate-orgs first`
  );

  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
