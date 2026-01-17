// Decorative SVG elements for nature-inspired UI

export function LeafDecoration({ className = "", color = "#2D5F4F" }) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 20C60 20 35 30 30 55C25 80 40 100 60 100C60 100 60 60 60 20Z"
        fill={color}
        opacity="0.1"
      />
      <path
        d="M60 20C60 20 85 30 90 55C95 80 80 100 60 100C60 100 60 60 60 20Z"
        fill={color}
        opacity="0.15"
      />
    </svg>
  );
}

export function FlowerDecoration({ className = "", color = "#F4A896" }) {
  return (
    <svg
      className={className}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Petals */}
      <circle cx="50" cy="30" r="12" fill={color} opacity="0.3" />
      <circle cx="70" cy="50" r="12" fill={color} opacity="0.3" />
      <circle cx="50" cy="70" r="12" fill={color} opacity="0.3" />
      <circle cx="30" cy="50" r="12" fill={color} opacity="0.3" />
      <circle cx="64" cy="36" r="10" fill={color} opacity="0.25" />
      <circle cx="64" cy="64" r="10" fill={color} opacity="0.25" />
      <circle cx="36" cy="64" r="10" fill={color} opacity="0.25" />
      <circle cx="36" cy="36" r="10" fill={color} opacity="0.25" />
      {/* Center */}
      <circle cx="50" cy="50" r="8" fill="#E8A87C" opacity="0.4" />
    </svg>
  );
}

export function CirclePattern({ className = "" }) {
  return (
    <svg
      className={className}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="80" stroke="#2D5F4F" strokeWidth="1" opacity="0.1" />
      <circle cx="100" cy="100" r="60" stroke="#2D5F4F" strokeWidth="1" opacity="0.15" />
      <circle cx="100" cy="100" r="40" stroke="#E8A87C" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

export function WavePattern({ className = "" }) {
  return (
    <svg
      className={className}
      width="300"
      height="100"
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 50 Q75 20, 150 50 T300 50"
        stroke="#B8D8D8"
        strokeWidth="2"
        opacity="0.3"
        fill="none"
      />
      <path
        d="M0 60 Q75 30, 150 60 T300 60"
        stroke="#F4A896"
        strokeWidth="2"
        opacity="0.2"
        fill="none"
      />
    </svg>
  );
}

export function BlobDecoration({ className = "", color = "#E8D4BC" }) {
  return (
    <svg
      className={className}
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 20C130 20 160 35 175 60C190 85 190 115 175 140C160 165 130 180 100 180C70 180 40 165 25 140C10 115 10 85 25 60C40 35 70 20 100 20Z"
        fill={color}
        opacity="0.4"
      />
    </svg>
  );
}
