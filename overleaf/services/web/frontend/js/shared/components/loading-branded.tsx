type LoadingBrandedTypes = {
  loadProgress: number // Percentage
  label?: string
  hasError?: boolean
}

export default function LoadingBranded({
  loadProgress,
  label,
  hasError = false,
}: LoadingBrandedTypes) {
  return (
    <div className="loading-screen">
      <div className="loading-screen-brand-container">
        <div
          className="loading-screen-brand"
          style={{ opacity: Math.max(0.5, loadProgress / 100) }}
        />
        
        <div className="loading-screen-brand-text">InkVell</div>

        {!hasError && (
          <div className="h3 loading-screen-label" aria-live="polite">
            {label}
            <span className="loading-screen-ellip" aria-hidden="true">
              .
            </span>
            <span className="loading-screen-ellip" aria-hidden="true">
              .
            </span>
            <span className="loading-screen-ellip" aria-hidden="true">
              .
            </span>
          </div>
        )}

        {loadProgress > 0 && loadProgress < 100 && (
          <div className="loading-screen-progress">
            <div 
              className="loading-screen-progress-bar" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
