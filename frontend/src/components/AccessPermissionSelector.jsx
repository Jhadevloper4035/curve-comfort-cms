import ReactSelect from 'react-select'
import { SERVICE_PERMISSIONS } from '@/constants/access'

const AccessPermissionSelector = ({ value = [], onChange, disabled = false }) => {
  const selectedOptions = SERVICE_PERMISSIONS.filter((permission) => value.includes(permission.value))

  return (
    <ReactSelect
      isMulti
      isDisabled={disabled}
      closeMenuOnSelect={false}
      classNamePrefix="react-select"
      options={SERVICE_PERMISSIONS}
      value={selectedOptions}
      placeholder="Select page access"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 1060 }) }}
      onChange={(selected) => onChange((selected || []).map((permission) => permission.value))}
    />
  )
}

export default AccessPermissionSelector
