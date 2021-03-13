import moment from "moment-timezone";

export function formatTimeFromNow(t) {
    if (!t) {
        return "データなし";
    }
    const now = moment();
    const durationMs = now.diff(t);
    if (durationMs < 60 * 1000) {
        return "数秒前";
    }
    if (durationMs < 2 * 60 * 1000) {
        return "一分前";
    }
    if (durationMs < 10 * 60 * 1000) {
        return "数分前";
    }
    if (durationMs < 60 * 60 * 1000) {
        return "十数分前";
    }
    if (durationMs < 2 * 60 * 60 * 1000) {
        return "一時間前";
    }
    return "ずっと前";
}
