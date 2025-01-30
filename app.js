const { checkBotStatus } = require("./botStatusChecker");

console.log("🚀 Starting Bot...");

let countingProcess = null;
let counter = 0;

/**
 * Function to start the number counting process.
 */
const startCounting = () => {
  if (!countingProcess) {
    console.log("🔢 Starting Number Counting...");
    countingProcess = setInterval(() => {
      counter++;
      console.log(`📊 Counter: ${counter}`);
    }, 1000);
  }
};

/**
 * Function to stop the number counting process.
 */
const stopCounting = () => {
  if (countingProcess) {
    console.log("⏹️ Stopping Number Counting...");
    clearInterval(countingProcess);
    countingProcess = null;
    counter = 0;
  }
};

/**
 * Main loop to monitor bot status and control the number counting process.
 */
const monitorBot = async () => {
  try {
    const status = await checkBotStatus();

    if (status.isEnabled) {
      console.log("✅ Bot is running...");
      startCounting(); // Start counting process if bot is enabled
    } else {
      console.warn("⛔ Bot is disabled by controllers.");
      stopCounting(); // Stop counting process if bot is disabled
    }
  } catch (error) {
    console.error("❌ Error in bot execution:", error);
  }
};

// Run bot status check every 5 seconds
setInterval(monitorBot, 5000);

// Prevent the app from exiting
process.stdin.resume();

/**
 * Graceful shutdown handling
 */
const handleExit = async () => {
  console.log("⚠️ Attempting to shut down...");

  const status = await checkBotStatus();
  if (status.isEnabled) {
    console.warn("⛔ Cannot shut down while bot is enabled!");
    return;
  }

  console.log("✅ Bot is disabled. Exiting...");
  stopCounting();
  process.exit(0);
};

// Catch process termination signals
process.on("SIGINT", handleExit);  // CTRL+C
process.on("SIGTERM", handleExit); // System Termination

console.log("📡 Monitoring bot status...");
