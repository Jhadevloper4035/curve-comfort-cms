export const MENU_ITEMS = [
  // ── General ────────────────────────────────────────────────────────────────
  {
    key: 'general',
    label: 'General',
    isTitle: true,
    roles: ['admin', 'superadmin', 'event', 'showroom', 'website', 'sales'],
    permissions: ['dashboard.view'],
  },
  {
    key: 'dashboard',
    icon: 'iconamoon:home-duotone',
    label: 'Dashboard',
    url: '/dashboard',
    roles: ['admin', 'superadmin', 'event', 'showroom', 'website', 'sales'],
    permissions: ['dashboard.view'],
  },
  // ── Website Apps ──────────────────────────────────────────────────────────
  {
    key: 'website-apps',
    label: 'Website Apps',
    isTitle: true,
    roles: ['admin', 'superadmin', 'website', 'sales', 'jobs'],
    permissions: ['websiteLeads.manage', 'newsletterSubscribers.view', 'productEnquiries.view'],
  },
  {
    key: 'website-leads',
    icon: 'iconamoon:email-thin',
    label: 'Website Leads',
    url: '/pages/website-leads',
    roles: ['admin', 'superadmin', 'website', 'sales'],
    permissions: ['websiteLeads.manage'],
  },
  {
    key: 'newsletters',
    icon: 'iconamoon:email-thin',
    label: 'Newsletters',
    url: '/pages/newsletters',
    roles: ['admin', 'superadmin', 'website', 'sales'],
    permissions: ['newsletterSubscribers.view'],
  },
  {
    key: 'product-enquiries',
    icon: 'iconamoon:shopping-bag-duotone',
    label: 'Product Enquiries',
    url: '/pages/product-enquiries',
    roles: ['admin', 'superadmin', 'website', 'sales'],
    permissions: ['productEnquiries.view'],
  },
  // ── Website Utilities ─────────────────────────────────────────────────────
  {
    key: 'website-utilities',
    label: 'Website Utilities',
    isTitle: true,
    roles: ['admin', 'superadmin', 'jobs'],
    permissions: ['products.manage', 'blogs.manage', 'jobs.manage', 'seoMeta.manage', 'landingPage.manage'],
  },
  {
    key: 'products',
    icon: 'iconamoon:shopping-bag-duotone',
    label: 'Products',
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
    children: [
      {
        key: 'products-list',
        label: 'All Products',
        url: '/ecommerce/inventory',
        parentKey: 'products',
      },
      {
        key: 'products-create',
        label: 'Create Product',
        url: '/ecommerce/products/create',
        parentKey: 'products',
      },
      {
        key: 'products-categories',
        label: 'Categories',
        url: '/ecommerce/categories',
        parentKey: 'products',
      },
    ],
  },
  {
    key: 'blogs',
    icon: 'iconamoon:edit-duotone',
    label: 'Blogs',
    roles: ['admin', 'superadmin'],
    permissions: ['blogs.manage'],
    children: [
      {
        key: 'blogs-list',
        label: 'All Blogs',
        url: '/blogs',
        parentKey: 'blogs',
      },
      {
        key: 'blogs-create',
        label: 'Create Blog',
        url: '/blogs/create',
        parentKey: 'blogs',
      },
    ],
  },
  {
    key: 'jobs',
    icon: 'iconamoon:profile-circle-duotone',
    label: 'Jobs Post',
    roles: ['admin', 'superadmin', 'jobs'],
    permissions: ['jobs.manage'],
    children: [
      {
        key: 'jobs-list',
        label: 'All Jobs',
        url: '/jobs',
        parentKey: 'jobs',
      },
      {
        key: 'jobs-create',
        label: 'Create Job',
        url: '/jobs/create',
        parentKey: 'jobs',
      },
    ],
  },
  {
    key: 'seo-meta',
    icon: 'iconamoon:trend-up-duotone',
    label: 'SEO Meta',
    roles: ['admin', 'superadmin'],
    permissions: ['seoMeta.manage'],
    children: [
      {
        key: 'seo-meta-list',
        label: 'All Pages',
        url: '/seo-meta',
        parentKey: 'seo-meta',
      },
      {
        key: 'seo-meta-create',
        label: 'Create SEO Meta',
        url: '/seo-meta/create',
        parentKey: 'seo-meta',
      },
    ],
  },
  {
    key: 'landing-page',
    icon: 'iconamoon:edit-duotone',
    label: 'Landing Page',
    roles: ['admin', 'superadmin', 'website'],
    permissions: ['landingPage.manage'],
    children: [
      { key: 'landing-page-hero-slides', label: 'Hero Slides', url: '/landing-page/hero-slides', parentKey: 'landing-page' },
      { key: 'landing-page-about-section', label: 'About Section', url: '/landing-page/about-section', parentKey: 'landing-page' },
      { key: 'landing-page-layout-cards', label: 'Layout Cards', url: '/landing-page/layout-cards', parentKey: 'landing-page' },
      { key: 'landing-page-why-choose-items', label: 'Why Choose Items', url: '/landing-page/why-choose-items', parentKey: 'landing-page' },
      { key: 'landing-page-process-steps', label: 'Process Steps', url: '/landing-page/process-steps', parentKey: 'landing-page' },
      { key: 'landing-page-parallax-cta', label: 'Parallax CTA', url: '/landing-page/parallax-cta', parentKey: 'landing-page' },
      { key: 'landing-page-consultation-cta', label: 'Consultation CTA', url: '/landing-page/consultation-cta', parentKey: 'landing-page' },
      { key: 'landing-page-faq-items', label: 'FAQ Items', url: '/landing-page/faq-items', parentKey: 'landing-page' },
      { key: 'landing-page-page-meta', label: 'Page Meta', url: '/landing-page/page-meta', parentKey: 'landing-page' },
    ],
  },

  // ── Administration (admin + superadmin) ──────────────────────────────────
  {
    key: 'admin-section',
    label: 'Administration',
    isTitle: true,
    roles: ['admin', 'superadmin'],
    permissions: ['users.manage'],
  },
  {
    key: 'user-management',
    icon: 'iconamoon:profile-circle-duotone',
    label: 'User Management',
    roles: ['admin', 'superadmin'],
    permissions: ['users.manage'],
    children: [
      {
        key: 'users-list',
        label: 'All Users',
        url: '/users',
        parentKey: 'user-management',
      },
      {
        key: 'users-create',
        label: 'Create User',
        url: '/auth/sign-up',
        parentKey: 'user-management',
      },
    ],
  },

  // ── Authentication ────────────────────────────────────────────────────────
  {
    key: 'auth-section',
    label: 'Authentication',
    isTitle: true,
  },
  {
    key: 'auth',
    icon: 'iconamoon:lock-off-light',
    label: 'Authentication',
    children: [
      {
        key: 'auth-change-password',
        label: 'Change Password',
        url: '/auth/change-password',
        parentKey: 'auth',
      },
      {
        key: 'auth-logout',
        label: 'Logout',
        url: '/auth/sign-in',
        parentKey: 'auth',
      },
    ],
  },
]
