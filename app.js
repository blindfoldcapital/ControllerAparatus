const { checkBotStatus } = require("./botStatusChecker");

console.log("🚀 Starting Bot...");

/**
 * Main loop to keep the bot running unless disabled.
 */
const runBot = async () => {
  try {
    const status = await checkBotStatus();

    if (status.isEnabled) {
      console.log("✅ Bot is running...");
    } else {
      console.warn("⛔ Bot is disabled by controllers. Exiting...");
      process.exit(1); // Force exit if bot is disabled
    }
  } catch (error) {
    console.error("❌ Error in bot execution:", error);
  }
};

// Run bot status check in an interval
setInterval(runBot, 5000);

// Prevent the app from exiting
process.stdin.resume(); // Keeps Node.js process alive

// Graceful shutdown handling
const handleExit = async () => {
  console.log("⚠️ Attempting to shut down...");
  
  // Ensure bot is disabled before exiting
  const status = await checkBotStatus();
  if (status.isEnabled) {
    console.warn("⛔ Cannot shut down while bot is enabled!");
    return;
  }

  console.log("✅ Bot is disabled. Exiting...");
  process.exit(0);
};

// Catch process termination signals
process.on("SIGINT", handleExit);  // CTRL+C
process.on("SIGTERM", handleExit); // System Termination

console.log("📡 Monitoring bot status...");
