import { EVENT_LEADS } from '@/constants/eventLeads';

export const ACCESS_TYPES = ['superadmin', 'admin', 'custom', 'website', 'event', 'showroom', 'sales', 'jobs', 'seo'];

export const SERVICE_PERMISSIONS = [
  { value: 'dashboard.view', label: 'Dashboard' },
  { value: 'users.manage', label: 'User Management' },
  { value: 'products.manage', label: 'Products' },
  { value: 'blogs.manage', label: 'Blogs' },
  { value: 'seoMeta.manage', label: 'SEO Meta' },
  { value: 'landingPage.manage', label: 'Landing Page' },
  { value: 'websiteLeads.manage', label: 'Website Leads' },
  { value: 'newsletterSubscribers.view', label: 'Newsletters' },
  { value: 'productEnquiries.view', label: 'Product Enquiries' },
  { value: 'jobs.manage', label: 'Job Posts' },
  { value: 'eventLeads.view', label: 'Events Enquiry' },
  { value: 'dubaiwoodLeads.view', label: 'Dubaiwood Show Enquiry' },
  { value: 'showroomLeads.manage', label: 'Showroom Enquiry' },
];

const ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: ['*'],
  website: ['dashboard.view', 'websiteLeads.manage', 'newsletterSubscribers.view', 'productEnquiries.view', 'landingPage.manage'],
  sales: ['dashboard.view', 'websiteLeads.manage', 'newsletterSubscribers.view', 'productEnquiries.view'],
  event: ['dashboard.view', 'eventLeads.view', 'dubaiwoodLeads.view', 'showroomLeads.manage'],
  showroom: ['dashboard.view', 'showroomLeads.manage'],
  jobs: ['jobs.manage'],
  seo: ['seoMeta.manage'],
  custom: [],
};

export const hasPermission = (user, permission) => {
  if (!permission) return true;
  const rolePermissions = ROLE_PERMISSIONS[user?.accessType] || [];
  const explicitPermissions = user?.permissions || [];

  return rolePermissions.includes('*') || rolePermissions.includes(permission) || explicitPermissions.includes(permission);
};

export const hasAnyPermission = (user, permissions = []) =>
  permissions.length === 0 || permissions.some((permission) => hasPermission(user, permission));

export const getDefaultPathForUser = (user) => {
  if (hasPermission(user, 'dashboard.view')) return '/dashboard';
  if (hasPermission(user, 'jobs.manage')) return '/jobs';
  if (hasPermission(user, 'websiteLeads.manage')) return '/pages/website-leads';
  if (hasPermission(user, 'newsletterSubscribers.view')) return '/pages/newsletters';
  if (hasPermission(user, 'productEnquiries.view')) return '/pages/product-enquiries';
  if (hasPermission(user, 'eventLeads.view')) return `/pages/event-leads/${encodeURIComponent(EVENT_LEADS[0].value)}`;
  if (hasPermission(user, 'dubaiwoodLeads.view')) return '/pages/dubaiwood-leads';
  if (hasPermission(user, 'showroomLeads.manage')) return '/showroom-leads';
  if (hasPermission(user, 'products.manage')) return '/ecommerce/inventory';
  if (hasPermission(user, 'blogs.manage')) return '/blogs';
  if (hasPermission(user, 'seoMeta.manage')) return '/seo-meta';
  if (hasPermission(user, 'landingPage.manage')) return '/landing-page';
  if (hasPermission(user, 'users.manage')) return '/users';
  return '/error-404';
};
