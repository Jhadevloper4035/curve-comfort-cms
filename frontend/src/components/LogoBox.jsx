import { Link } from 'react-router-dom';
import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light-full.png';

const LogoBox = ({
  containerClassName,
  textLogo
}) => {
  return <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">

        <img src={logoDark} className={textLogo?.className} style={{ width: 180, height: 'auto' }} alt="Curve Comfort" />
      </Link>
      <Link to="/" className="logo-light">
        <img src={logoLight} className={textLogo?.className} style={{ width: 180, height: 'auto' }} alt="Curve Comfort" />
      </Link>
    </div>;
};
export default LogoBox;
