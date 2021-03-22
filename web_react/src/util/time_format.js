import moment from "moment-timezone";

export function formatTimeFromNow(t, translation) {
    if (!t) {
        return translation("No data");//"データなし";
    }
    const now = moment();
    const durationMs = now.diff(t);
    if (durationMs < 60 * 1000) {
        return translation("Few seconds ago");
    }
    if (durationMs < 2 * 60 * 1000) {
        return translation("A minute ago");
    }
    if (durationMs < 10 * 60 * 1000) {
        return translation("Few minutes ago");
    }
    if (durationMs < 60 * 60 * 1000) {
        return translation("Ten minutes ago");
    }
    if (durationMs < 2 * 60 * 60 * 1000) {
        return translation("An ahour ago");
    }
    return translation("A while back");
}
