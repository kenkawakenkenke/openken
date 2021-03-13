import { useEffect, useState } from "react";

export function usePollingUpdate(updateEveryMs) {
    const [tPoll, setTPoll] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setTPoll(new Date());
        }, updateEveryMs);
        return () => {
            clearInterval(timer);
        }
    }, []);
    return tPoll;
}
