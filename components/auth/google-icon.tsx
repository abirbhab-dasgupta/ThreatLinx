                                                                                    
export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="auth-google-icon"
    >
      <path fill="#4285F4" d="M21.35 12.24c0-.72-.06-1.44-.19-2.14H12v4.05h5.24a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.91-4.19 2.91-7.27Z" />
      <path fill="#34A853" d="M12 21.7c2.62 0 4.82-.87 6.43-2.19l-3.14-2.43a5.84 5.84 0 0 1-8.69-3.07H3.36v2.5A9.7 9.7 0 0 0 12 21.7Z" />
      <path fill="#FBBC05" d="M6.6 14.01a5.82 5.82 0 0 1 0-4.01V7.5H3.36a9.7 9.7 0 0 0 0 9.01l3.24-2.5Z" />
      <path fill="#EA4335" d="M12 6.14c1.42 0 2.69.49 3.7 1.45l2.77-2.77A9.35 9.35 0 0 0 12 2.3 9.7 9.7 0 0 0 3.36 7.5L6.6 10A5.78 5.78 0 0 1 12 6.14Z" />
    </svg>
  );
}
