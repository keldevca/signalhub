'use client';
import { useEffect, useState } from 'react';

export default function InteractiveFace() {
    const [isClosed, setIsClosed] = useState(true);
    const [pupilTransform, setPupilTransform] = useState('translate(0px, 0px)');

    useEffect(() => {
        let callAllowed = true;

        function handleMouseMove(e: MouseEvent) {
            if (!callAllowed) return;

            const x = e.clientX;
            const y = e.clientY;
            const height = window.innerHeight;
            const width = window.innerWidth;

            if (y > height / 2) {
                setIsClosed(false);
            } else {
                setIsClosed(true);
            }

            const deltaX = (x - width / 2) / width;
            const deltaY = (y - height / 2) / height;

            setPupilTransform(`translate(${deltaX * 25}px, ${deltaY * 25}px)`);

            callAllowed = false;
            setTimeout(() => {
                callAllowed = true;
            }, 50); // slight debounce
        }

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="face-block scale-75 mt-4 mb-2">
            <div className="eyes-wrapper">
                <div className="eye">
                    <div className="pupil" style={{ transform: pupilTransform }}></div>
                </div>
                <div className="eye">
                    <div className="pupil" style={{ transform: pupilTransform }}></div>
                </div>
            </div>
            <div className="mouth-wrapper">
                <div className={`mouth ${isClosed ? '-closed' : ''}`}></div>
            </div>
        </div>
    );
}
