import type { DefaultNavbarMetadata } from '@/shared/components/types/default-navbar-metadata'
import getMeta from '@/utils/meta'

export default function HeaderLogoOrTitle({
  customLogo,
  title,
}: Pick<DefaultNavbarMetadata, 'customLogo' | 'title'> & {
  overleafLogo?: string
}) {
  const { appName } = getMeta('ol-ExposedSettings')
  const brandName = appName || 'InkVell'
  
  // Use custom logo if provided, otherwise use InkVell logo
  if (customLogo) {
    return (
      <a href="/" aria-label={brandName} className="navbar-brand">
        <img 
          src={customLogo} 
          alt={brandName} 
          className="inkvell-logo"
        />
        <span className="navbar-title">{title || brandName}</span>
      </a>
    )
  }
  
  return (
    <a href="/" aria-label={brandName} className="navbar-brand">
      <img 
        src="/img/brand/inkvell-feather.svg"
        alt="InkVell" 
        className="inkvell-logo"
      />
      <span className="navbar-title">{title || 'InkVell'}</span>
    </a>
  )
}
