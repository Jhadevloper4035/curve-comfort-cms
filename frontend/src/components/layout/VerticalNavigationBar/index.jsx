import { lazy, Suspense } from 'react'
import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { getMenuItems } from '@/helpers/menu'
import HoverMenuToggle from './components/HoverMenuToggle'
import { useAuthContext } from '@/context/useAuthContext'
const AppMenu = lazy(() => import('./components/AppMenu'))
const VerticalNavigationBar = () => {
  const { user } = useAuthContext()
  const menuItems = getMenuItems(user)

  return (
    <div className="main-nav" id="leftside-menu-container">
      <LogoBox
        containerClassName="logo-box"
        squareLogo={{
          className: 'logo-sm',
        }}
        textLogo={{
          className: 'logo-lg',
        }}
      />

      <HoverMenuToggle />

      <SimplebarReactClient className="scrollbar">
        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />
        </Suspense>
      </SimplebarReactClient>
    </div>
  )
}
export default VerticalNavigationBar
