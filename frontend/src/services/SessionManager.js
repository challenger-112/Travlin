import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import API from "./api";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const TOKEN_CHECK_INTERVAL_MS = 30 * 1000;
const TOKEN_REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000;

function getTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64)).exp * 1000;
  } catch {
    return null;
  }
}

function SessionManager() {
  const navigate = useNavigate();

  const endSession = useCallback((message) => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      API.post("logout/", { refresh }).catch((error) => {
        console.error("Unable to delete expired server session:", error);
      });
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    window.dispatchEvent(new Event("auth-session-updated"));
    window.alert(message);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    let lastActivityAt = 0;
    let lastHeartbeatAt = 0;
    let idleTimer;
    let checking = false;
    let sessionStarted = false;
    let disposed = false;

    const tokensExist = () => Boolean(
      localStorage.getItem("access_token") &&
      localStorage.getItem("refresh_token")
    );

    const sendHeartbeat = async () => {
      try {
        await API.post("session/activity/");
        lastHeartbeatAt = Date.now();
      } catch (error) {
        if (!disposed && error.response?.status === 401) {
          endSession("Your session expired. Please log in again.");
        } else if (!disposed) {
          console.error("Unable to update session activity:", error);
        }
      }
    };

    const refreshAccessToken = async () => {
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        endSession("Your session expired. Please log in again.");
        return;
      }

      try {
        const { data } = await API.post("token/refresh/", { refresh });
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      } catch (error) {
        if (!disposed && error.response?.status === 401) {
          endSession("Your session expired. Please log in again.");
        } else if (!disposed) {
          console.error("Unable to refresh access token:", error);
        }
      }
    };

    const startSession = async () => {
      if (!tokensExist() || sessionStarted) {
        return;
      }

      sessionStarted = true;
      lastActivityAt = Date.now();
      const accessToken = localStorage.getItem("access_token");
      const expiresAt = getTokenExpiry(accessToken);
      if (expiresAt && expiresAt <= Date.now()) {
        await refreshAccessToken();
      }
      if (disposed) {
        return;
      }
      if (tokensExist()) {
        await sendHeartbeat();
      }
      if (!disposed && tokensExist()) {
        idleTimer = window.setTimeout(
          () => endSession("You were signed out after 5 minutes of inactivity."),
          IDLE_TIMEOUT_MS
        );
      }
    };

    const handleActivity = () => {
      if (!tokensExist()) {
        return;
      }

      const now = Date.now();
      if (lastActivityAt && now - lastActivityAt >= IDLE_TIMEOUT_MS) {
        endSession("You were signed out after 5 minutes of inactivity.");
        return;
      }

      lastActivityAt = now;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(
        () => endSession("You were signed out after 5 minutes of inactivity."),
        IDLE_TIMEOUT_MS
      );

      if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
        sendHeartbeat();
      }
    };

    const checkSession = async () => {
      if (checking || !tokensExist()) {
        return;
      }
      checking = true;

      try {
        if (disposed) {
          return;
        }
        if (Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS) {
          endSession("You were signed out after 5 minutes of inactivity.");
          return;
        }

        const accessToken = localStorage.getItem("access_token");
        const expiresAt = getTokenExpiry(accessToken);
        if (expiresAt && expiresAt - Date.now() <= TOKEN_REFRESH_BEFORE_EXPIRY_MS) {
          await refreshAccessToken();
        }
      } finally {
        checking = false;
      }
    };

    const handleLogin = () => {
      sessionStarted = false;
      startSession();
    };

    const handleStorageChange = (event) => {
      if (event.key === "access_token" && event.newValue) {
        handleLogin();
      } else if (event.key === "access_token" && !event.newValue) {
        sessionStarted = false;
        window.clearTimeout(idleTimer);
      }
    };

    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    window.addEventListener("auth-token-updated", handleLogin);
    window.addEventListener("storage", handleStorageChange);

    startSession();
    const checkInterval = window.setInterval(checkSession, TOKEN_CHECK_INTERVAL_MS);

    return () => {
      disposed = true;
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      window.removeEventListener("auth-token-updated", handleLogin);
      window.removeEventListener("storage", handleStorageChange);
      window.clearTimeout(idleTimer);
      window.clearInterval(checkInterval);
    };
  }, [endSession]);

  return null;
}

export default SessionManager;
