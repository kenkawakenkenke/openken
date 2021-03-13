import { useEffect, useState, useCallback } from "react";

export function usePollingUpdate(updateEveryMs,
    callback = () => { },
    dependencies = []) {
    const [tPoll, setTPoll] = useState(new Date());

    useEffect(() => {
        // console.log("register", updateEveryMs);
        callback();
        const timer = setInterval(() => {
            // console.log("poll", updateEveryMs);
            callback();
            setTPoll(new Date());
        }, updateEveryMs);
        return () => {
            // console.log("deregster", updateEveryMs);
            clearInterval(timer);
        }
    }, dependencies);
    return tPoll;
}
