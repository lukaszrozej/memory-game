function initializeTimer(element) {
  let startTime = 0;
  let elapsedTime = 0;
  let intervalId;
  let running = false;
  let paused = false;
  let pauseStart;
  let totalPausedTime = 0;

  function display() {
    if (paused) return;
    element.textContent = Math.round((Date.now() - startTime - totalPausedTime) / 1000).toString();
  }

  return {
    isRunning() {
      return running;
    },

    start() {
      startTime = Date.now();
      intervalId = setInterval(display, 1000);
      running = true;
    },

    pause() {
      paused = true;
      pauseStart = Date.now();
    },

    resume() {
      if (!running || !paused) return;
      totalPausedTime += Date.now() - pauseStart;
      paused = false;
    },

    stop() {
      clearInterval(intervalId);
      running = false;
      elapsedTime = Math.round((Date.now() - startTime - totalPausedTime) / 1000);
      element.textContent = elapsedTime.toString();
    },

    reset() {
      clearInterval(intervalId);
      running = false;
      paused = false;
      totalPausedTime = 0;
      element.textContent = '0';
    },

    value() {
      return elapsedTime;
    }
  };
}