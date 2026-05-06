import { supabase } from "./supabase.js";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 1 * 60 * 1000; // Warn 1 minute before logout

let inactivityTimer = null;
let fixedTimer = null;
let warningTimer = null;
let isWarningShown = false;
let isSessionActive = false;
let activityHandler = null;

const activityEvents = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export const startSessionManagement = (onWarning, onTimeout) => {
  // Clear any existing timers and listeners
  clearSessionTimers();
  removeActivityListeners();

  isSessionActive = true;
  isWarningShown = false;

  // Set fixed duration timeout
  fixedTimer = setTimeout(() => {
    if (isSessionActive) {
      handleSessionTimeout(onTimeout);
    }
  }, SESSION_TIMEOUT);

  // Show warning before fixed timeout
  warningTimer = setTimeout(() => {
    if (isSessionActive && !isWarningShown) {
      isWarningShown = true;
      onWarning("fixed");
    }
  }, SESSION_TIMEOUT - WARNING_TIME);

  // Set inactivity timeout
  resetInactivityTimer(onWarning, onTimeout);

  // Add activity listeners
  activityHandler = () => {
    if (isSessionActive) {
      resetInactivityTimer(onWarning, onTimeout);
    }
  };

  activityEvents.forEach((event) => {
    document.addEventListener(event, activityHandler);
  });
};

const resetInactivityTimer = (onWarning, onTimeout) => {
  if (!isSessionActive) return;

  // Clear existing inactivity timer
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Reset warning flag only if user is being active
  isWarningShown = false;

  // Set new inactivity timeout
  inactivityTimer = setTimeout(() => {
    if (isSessionActive) {
      handleSessionTimeout(onTimeout);
    }
  }, SESSION_TIMEOUT);

  // Show warning before inactivity timeout
  if (warningTimer) {
    clearTimeout(warningTimer);
  }

  warningTimer = setTimeout(() => {
    if (isSessionActive && !isWarningShown) {
      isWarningShown = true;
      onWarning("inactivity");
    }
  }, SESSION_TIMEOUT - WARNING_TIME);
};

export const extendSession = (onWarning, onTimeout) => {
  if (!isSessionActive) return;

  isWarningShown = false;
  resetInactivityTimer(onWarning, onTimeout);

  // Reset fixed timer as well
  if (fixedTimer) {
    clearTimeout(fixedTimer);
  }
  fixedTimer = setTimeout(() => {
    if (isSessionActive) {
      handleSessionTimeout(onTimeout);
    }
  }, SESSION_TIMEOUT);

  if (warningTimer) {
    clearTimeout(warningTimer);
  }
  warningTimer = setTimeout(() => {
    if (isSessionActive && !isWarningShown) {
      isWarningShown = true;
      onWarning("fixed");
    }
  }, SESSION_TIMEOUT - WARNING_TIME);
};

export const handleSessionTimeout = async (onTimeout) => {
  isSessionActive = false;
  clearSessionTimers();
  removeActivityListeners();
  await supabase.auth.signOut();
  onTimeout();
};

export const clearSessionTimers = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (fixedTimer) clearTimeout(fixedTimer);
  if (warningTimer) clearTimeout(warningTimer);
  inactivityTimer = null;
  fixedTimer = null;
  warningTimer = null;
  isWarningShown = false;
};

const removeActivityListeners = () => {
  if (activityHandler) {
    activityEvents.forEach((event) => {
      document.removeEventListener(event, activityHandler);
    });
    activityHandler = null;
  }
};

export const logoutUser = async () => {
  isSessionActive = false;
  clearSessionTimers();
  removeActivityListeners();
  await supabase.auth.signOut();
};
