const StarBackground = () => {
  const particleLayers = [
    { count: 40, minSize: 4, maxSize: 6, speed: 25, opacity: 0.1 },
    { count: 25, minSize: 5, maxSize: 8, speed: 35, opacity: 0.1 },
    { count: 15, minSize: 6, maxSize: 10, speed: 50, opacity: 0.1 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">

      {/* Background Animation Video */}
      <video
        src="/Animation.mp4"       // <-- replace with your file location
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-fill opacity-30 blur-sm"
      />

      {/* Floating particles */}
      {particleLayers.map((layer, layerIndex) => (
        <div key={layerIndex} className="absolute inset-0">
          {Array.from({ length: layer.count }).map((_, i) => {
            const size = layer.minSize + Math.random() * (layer.maxSize - layer.minSize);
            const duration = layer.speed + Math.random() * 20;
            const delay = Math.random() * -20;
            const xOffset = (Math.random() - 0.5) * 100;

            return (
              <div
                key={i}
                className="absolute rounded-full bg-black animate-float"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: layer.opacity,
                  boxShadow: `0 0 ${size * 3}px hsl(var(--primary) / 0.3)`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  '--float-x': `${xOffset}px`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      ))}

    </div>
  );
};

export default StarBackground;
