export function Video() {
    return (
      <video 
        className="w-full h-full object-cover"
        controls 
        preload="none"
      >
        <source src="/intelli.mov" type="video/mp4" />
        <track
          src="/path/to/captions.vtt"
          kind="subtitles"
          srcLang="en"
          label="English"
        />
        Your browser does not support the video tag.
      </video>
    );
  }