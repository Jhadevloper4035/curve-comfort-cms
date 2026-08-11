import { MENU_ITEMS } from '@/assets/data/menu-items';
import { hasAnyPermission } from '@/constants/access';

const isAllowed = (item, accessType) =>
  !item.roles || item.roles.includes(accessType);

const filterMenuItem = (item, user, inheritedPermissions = []) => {
  const effectivePermissions = item.permissions || inheritedPermissions;
  const children = (item.children || [])
    .map((child) => filterMenuItem(child, user, effectivePermissions))
    .filter(Boolean);
  const hasPermissionRule = effectivePermissions.length > 0;
  const roleAllowed = item.strictRoles
    ? item.strictRoles.includes(user.accessType)
    : hasPermissionRule || isAllowed(item, user.accessType);
  const permissionAllowed = hasAnyPermission(user, effectivePermissions);

  if (children.length > 0) return { ...item, children };
  if (roleAllowed && permissionAllowed) return { ...item, children: undefined };
  return null;
};

export const getMenuItems = (userOrAccessType) => {
  const user = typeof userOrAccessType === 'string' ? { accessType: userOrAccessType } : userOrAccessType;
  const menuItems = MENU_ITEMS;
  if (!user?.accessType) return menuItems;

  return menuItems.map((item) => filterMenuItem(item, user)).filter(Boolean);
};
export const findAllParent = (menuItems, menuItem) => {
  let parents = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};
export const getMenuItemFromURL = (items, url) => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        const foundItem = getMenuItemFromURL(item, url);
        if (foundItem) return foundItem;
      }
    }
  }
};
export const findMenuItem = (menuItems, menuItemKey) => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};
