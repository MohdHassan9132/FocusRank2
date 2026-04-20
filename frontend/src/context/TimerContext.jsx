import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const TimerContext = createContext();
const DEFAULT_TOTAL_SECONDS = 25 * 60;
const STORAGE_KEYS = {
  start: "timerStart",
  duration: "timerDuration",
  total: "timerTotal",
  running: "timerRunning",
  pausedRemaining: "pausedRemaining",
  paused: "timerPaused",
  productive: "productiveSeconds",
  pendingCompletion: "timerPendingCompletion",
};

const getStoredNumber = (key) => {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const clearTimerStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.start);
  localStorage.removeItem(STORAGE_KEYS.duration);
  localStorage.removeItem(STORAGE_KEYS.total);
  localStorage.removeItem(STORAGE_KEYS.running);
  localStorage.removeItem(STORAGE_KEYS.pausedRemaining);
  localStorage.removeItem(STORAGE_KEYS.paused);
};

const persistRunningTimer = (start, duration, total) => {
  localStorage.setItem(STORAGE_KEYS.start, String(start));
  localStorage.setItem(STORAGE_KEYS.duration, String(duration));
  localStorage.setItem(STORAGE_KEYS.total, String(total));
  localStorage.setItem(STORAGE_KEYS.running, "true");
  localStorage.setItem(STORAGE_KEYS.paused, "false");
  localStorage.removeItem(STORAGE_KEYS.pausedRemaining);
};

const persistPausedTimer = (remaining, total) => {
  localStorage.setItem(STORAGE_KEYS.duration, String(remaining));
  localStorage.setItem(STORAGE_KEYS.total, String(total));
  localStorage.setItem(STORAGE_KEYS.pausedRemaining, String(remaining));
  localStorage.setItem(STORAGE_KEYS.paused, "true");
  localStorage.setItem(STORAGE_KEYS.running, "false");
  localStorage.removeItem(STORAGE_KEYS.start);
};

const computeRemainingTime = (start, duration) => {
  const elapsed = Math.floor((Date.now() - start) / 1000);
  return Math.max(duration - elapsed, 0);
};

export function TimerProvider({ children }) {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TOTAL_SECONDS);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionIntent, setSessionIntent] = useState("");
  const [reflection, setReflection] = useState(null);
  const [currentElapsedSeconds, setCurrentElapsedSeconds] = useState(0);
  const [productiveSeconds, setProductiveSeconds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.productive);
    return saved ? Number(saved) : 0;
  });

  const totalSecondsRef = useRef(totalSeconds);
  const secondsLeftRef = useRef(secondsLeft);
  const timerStartRef = useRef(null);
  const runDurationRef = useRef(totalSeconds);
  const saveCallbackRef = useRef(null);
  const pendingCompletionRef = useRef(
    getStoredNumber(STORAGE_KEYS.pendingCompletion) || 0
  );
  const completionHandledRef = useRef(false);

  const queuePendingCompletion = useCallback((elapsed) => {
    pendingCompletionRef.current = elapsed;
    localStorage.setItem(STORAGE_KEYS.pendingCompletion, String(elapsed));
  }, []);

  const clearPendingCompletion = useCallback(() => {
    pendingCompletionRef.current = 0;
    localStorage.removeItem(STORAGE_KEYS.pendingCompletion);
  }, []);

  const flushPendingCompletion = useCallback(() => {
    if (!saveCallbackRef.current || !pendingCompletionRef.current) {
      return;
    }

    const pendingElapsed = pendingCompletionRef.current;
    clearPendingCompletion();
    saveCallbackRef.current(pendingElapsed);
  }, [clearPendingCompletion]);

  const addProductiveSeconds = useCallback((seconds) => {
    setProductiveSeconds((prev) => prev + seconds);
  }, []);

  const finalizeTimerState = useCallback(
    (elapsed) => {
      clearTimerStorage();
      timerStartRef.current = null;
      completionHandledRef.current = true;

      setIsRunning(false);
      setIsPaused(false);
      setSecondsLeft(totalSecondsRef.current);
      setCurrentElapsedSeconds(elapsed);
      setReflection(null);
      setSessionIntent("");
      addProductiveSeconds(elapsed);

      if (saveCallbackRef.current) {
        saveCallbackRef.current(elapsed);
      } else {
        queuePendingCompletion(elapsed);
      }
    },
    [addProductiveSeconds, queuePendingCompletion]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.productive, String(productiveSeconds));
  }, [productiveSeconds]);

  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
  }, [totalSeconds]);

  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    const storedDuration = getStoredNumber(STORAGE_KEYS.duration);
    const storedTotal = getStoredNumber(STORAGE_KEYS.total);
    const storedStart = getStoredNumber(STORAGE_KEYS.start);
    const storedPausedRemaining = getStoredNumber(STORAGE_KEYS.pausedRemaining);
    const storedRunning = localStorage.getItem(STORAGE_KEYS.running) === "true";
    const storedPaused = localStorage.getItem(STORAGE_KEYS.paused) === "true";
    const restoredTotal = storedTotal || storedDuration || DEFAULT_TOTAL_SECONDS;

    if (restoredTotal) {
      setTotalSeconds(restoredTotal);
    }

    if (storedRunning && storedStart && storedDuration) {
      const remaining = computeRemainingTime(storedStart, storedDuration);
      timerStartRef.current = storedStart;
      runDurationRef.current = storedDuration;
      setTotalSeconds(restoredTotal);
      setSecondsLeft(remaining);
      setCurrentElapsedSeconds(restoredTotal - remaining);

      if (remaining === 0) {
        finalizeTimerState(restoredTotal);
      } else {
        completionHandledRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
      }
      return;
    }

    if (storedPaused && storedDuration && storedPausedRemaining !== null) {
      timerStartRef.current = null;
      runDurationRef.current = storedDuration;
      completionHandledRef.current = false;
      setTotalSeconds(restoredTotal);
      setSecondsLeft(storedPausedRemaining);
      setCurrentElapsedSeconds(restoredTotal - storedPausedRemaining);
      setIsRunning(false);
      setIsPaused(true);
      return;
    }

    clearTimerStorage();
  }, [finalizeTimerState]);

  useEffect(() => {
    if (!isRunning || !timerStartRef.current) {
      return undefined;
    }

    completionHandledRef.current = false;

    const syncTimer = () => {
      const duration = runDurationRef.current;
      const remaining = computeRemainingTime(timerStartRef.current, duration);

      setSecondsLeft(remaining);
      setCurrentElapsedSeconds(totalSecondsRef.current - remaining);

      if (remaining === 0 && !completionHandledRef.current) {
        finalizeTimerState(totalSecondsRef.current);
      }
    };

    syncTimer();
    const intervalId = setInterval(syncTimer, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, finalizeTimerState]);

  const startTimer = useCallback(() => {
    const duration = totalSecondsRef.current;
    const start = Date.now();

    completionHandledRef.current = false;
    timerStartRef.current = start;
    runDurationRef.current = duration;
    setSecondsLeft(duration);
    setCurrentElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
    persistRunningTimer(start, duration, duration);
  }, []);

  const pauseTimer = useCallback(() => {
    if (!isRunning || !timerStartRef.current) return;

    const duration = totalSecondsRef.current;
    const remaining = computeRemainingTime(
      timerStartRef.current,
      runDurationRef.current
    );

    timerStartRef.current = null;
    runDurationRef.current = remaining;
    setSecondsLeft(remaining);
    setCurrentElapsedSeconds(duration - remaining);
    setIsRunning(false);
    setIsPaused(true);
    persistPausedTimer(remaining, duration);
  }, [isRunning]);

  const resumeTimer = useCallback(() => {
    if (!isPaused) return;

    const remaining = secondsLeftRef.current;
    const start = Date.now();

    completionHandledRef.current = false;
    timerStartRef.current = start;
    runDurationRef.current = remaining;
    setIsRunning(true);
    setIsPaused(false);
    persistRunningTimer(start, remaining, totalSecondsRef.current);
  }, [isPaused]);

  const resetTimer = useCallback((newTotalSeconds = totalSecondsRef.current) => {
    clearTimerStorage();
    timerStartRef.current = null;
    completionHandledRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(newTotalSeconds);
    setSecondsLeft(newTotalSeconds);
    setCurrentElapsedSeconds(0);
    setReflection(null);
    setSessionIntent("");
    runDurationRef.current = newTotalSeconds;
  }, []);

  const setDuration = useCallback(
    (minutes) => {
      if (isRunning || isPaused) return;
      const duration = minutes * 60;
      resetTimer(duration);
    },
    [isPaused, isRunning, resetTimer]
  );

  const addStudiedTime = useCallback(() => {
    const elapsed = totalSecondsRef.current - secondsLeftRef.current;

    if (elapsed > 0) {
      if (saveCallbackRef.current) {
        saveCallbackRef.current(elapsed);
      } else {
        queuePendingCompletion(elapsed);
      }
      addProductiveSeconds(elapsed);
    }

    resetTimer(totalSecondsRef.current);
  }, [addProductiveSeconds, queuePendingCompletion, resetTimer]);

  const setSaveCallback = useCallback(
    (callback) => {
      saveCallbackRef.current = callback || null;
      flushPendingCompletion();
    },
    [flushPendingCompletion]
  );

  const elapsedSeconds = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  return (
    <TimerContext.Provider
      value={{
        totalSeconds,
        secondsLeft,
        isRunning,
        isPaused,
        sessionIntent,
        reflection,
        elapsedSeconds,
        progress,
        currentElapsedSeconds,
        productiveSeconds,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        setDuration,
        addStudiedTime,
        setSessionIntent,
        setReflection,
        setSaveCallback,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
