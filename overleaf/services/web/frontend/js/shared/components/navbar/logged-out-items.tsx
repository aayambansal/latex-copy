import { useTranslation } from 'react-i18next'
import NavLinkItem from '@/shared/components/navbar/nav-link-item'
import { useSendProjectListMB } from '@/features/project-list/components/project-list-events'

export default function LoggedOutItems({
  showSignUpLink,
}: {
  showSignUpLink: boolean
}) {
  // Login and signup removed - public access enabled
  // Return empty fragment to hide login/signup links
  return <></>
}
