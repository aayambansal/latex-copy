import type { DefaultNavbarMetadata } from '@/shared/components/types/default-navbar-metadata'
import getMeta from '@/utils/meta'

export default function HeaderLogoOrTitle({
  overleafLogo,
  customLogo,
  title,
}: Pick<DefaultNavbarMetadata, 'customLogo' | 'title'> & {
  overleafLogo?: string
}) {
  const { appName } = getMeta('ol-ExposedSettings')
  return (
    <a href="/" aria-label={appName || 'InkVell'} className="navbar-brand">
      <img 
        src="/img/brand/inkvell-logo.png" 
        alt="InkVell" 
        className="inkvell-logo"
        style={{ 
          height: '28px', 
          width: 'auto', 
          marginRight: '10px',
          filter: 'invert(1)'
        }} 
      />
      <span className="navbar-title">{title || 'InkVell'}</span>
    </a>
  )
}
