import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import { useAuthContext } from '@/context/useAuthContext';
const ProfileDropdown = () => {
  const { user, removeSession } = useAuthContext();
  return <Dropdown className="topbar-item" align={'end'}>
      <DropdownToggle as="button" type="button" className="topbar-button content-none" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span className="d-flex align-items-center">
          <img className="rounded-circle" width={32} height={32} src={avatar1} alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownHeader as="div" className="px-3 py-2">
          <p className="mb-0 fw-semibold">{user?.name ?? 'User'}</p>
          <small className="text-muted text-capitalize">{user?.accessType ?? ''}</small>
        </DropdownHeader>
        <DropdownDivider className="dropdown-divider my-1" />
        <DropdownItem as={Link} to="/auth/change-password">
          <IconifyIcon icon="bx:lock-alt" className="fs-18 align-middle me-1" />
          <span className="align-middle">Change Password</span>
        </DropdownItem>
        <DropdownItem as="button" className="text-danger" onClick={removeSession}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>;
};
export default ProfileDropdown;
