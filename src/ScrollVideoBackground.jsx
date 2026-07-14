import { useScrollScrubVideo } from './hooks';

function ScrollVideoBackground() {
    const videoRef = useScrollScrubVideo();

    return (
        <div className="scroll-video-bg">
            <video ref={videoRef} muted playsInline preload="auto" poster="/bg/bg-13-nebula-a.jpeg">
                <source src="/video/hero-scroll.mp4" type="video/mp4" />
            </video>
            <div className="scroll-video-bg-overlay"></div>
        </div>
    );
}

export default ScrollVideoBackground;
