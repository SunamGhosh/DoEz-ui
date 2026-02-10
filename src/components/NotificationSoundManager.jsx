import React, { useEffect, useState, useRef } from "react";
import { getUnreadCount } from "../apiservice/notification";
import { useSelector } from "react-redux";

const NotificationSoundManager = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [lastCount, setLastCount] = useState(0);
    const isFirstRun = useRef(true);

    // High quality notification sound
    const audioUrl = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    const audio = useRef(new Audio(audioUrl));

    const checkNotifications = async () => {
        if (!isAuthenticated) return;

        try {
            const res = await getUnreadCount();
            const newCount = res.data.data;

            if (!isFirstRun.current && newCount > lastCount) {
                // Play sound if count increased
                audio.current.play().catch(e => console.log("Audio play failed:", e));
            }

            setLastCount(newCount);
            isFirstRun.current = false;
        } catch (err) {
            console.error("Failed to check notifications:", err);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            // Initial check
            checkNotifications();

            // Poll every 15 seconds
            const interval = setInterval(checkNotifications, 15000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, lastCount]);

    return null; // This component doesn't render anything
};

export default NotificationSoundManager;
