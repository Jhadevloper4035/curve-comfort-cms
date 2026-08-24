// @refresh reset
import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

// Public Routes
const ShowroomLeadForm = lazy(() => import('@/app/(public)/showroom-lead/page'))
const EventLeadForm = lazy(() => import('@/app/(public)/event-lead/page'))
const DubaiwoodLeadForm = lazy(() => import('@/app/(public)/dubaiwood-lead/page'))
const ThankYou = lazy(() => import('@/app/(public)/thank-you/page'))

// Dashboard Routes
const Dashboard = lazy(() => import('@/app/(admin)/dashboard/analytics/page'))

// Ecommerce Routes
const OrderManagement = lazy(() => import('@/app/(admin)/ecommerce/orders/page'))
const OrderDetails = lazy(() => import('@/app/(admin)/ecommerce/orders/[orderId]/page'))
const CouponManagement = lazy(() => import('@/app/(admin)/ecommerce/coupons/page'))
const EcommerceProductDetails = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/page'))
const EcommerceProductCreate = lazy(() => import('@/app/(admin)/ecommerce/products/create/page'))
const EcommerceProductEdit = lazy(() => import('@/app/(admin)/ecommerce/products/[productId]/edit/page'))
const EcommerceInventory = lazy(() => import('@/app/(admin)/ecommerce/inventory/page'))
const EcommerceCategories = lazy(() => import('@/app/(admin)/ecommerce/categories/page'))

// SEO Meta Routes
const SeoMetaList = lazy(() => import('@/app/(admin)/seo-meta/page'))
const SeoMetaCreate = lazy(() => import('@/app/(admin)/seo-meta/create/page'))
const SeoMetaDetail = lazy(() => import('@/app/(admin)/seo-meta/[seoId]/page'))
const SeoMetaEdit = lazy(() => import('@/app/(admin)/seo-meta/[seoId]/edit/page'))
const LandingPage = lazy(() => import('@/app/(admin)/landing-page/page'))

// Blog Routes
const Blogs = lazy(() => import('@/app/(admin)/blogs/page'))
const BlogCreate = lazy(() => import('@/app/(admin)/blogs/create/page'))
const BlogDetail = lazy(() => import('@/app/(admin)/blogs/[blogId]/page'))
const BlogEdit = lazy(() => import('@/app/(admin)/blogs/[blogId]/edit/page'))
const BlogTaxonomy = lazy(() => import('@/app/(admin)/blogs/taxonomy/page'))

// Leads Routes
const ShowroomLeads = lazy(() => import('@/app/(admin)/showroom-leads/page'))
const AddShowroomLead = lazy(() => import('@/app/(admin)/showroom-leads/add/page'))
const EventLeads = lazy(() => import('@/app/(admin)/pages/event-leads/page'))
const DubaiwoodLeads = lazy(() => import('@/app/(admin)/pages/dubaiwood-leads/page'))
const WebsiteLeads = lazy(() => import('@/app/(admin)/pages/website-leads/page'))
const Newsletters = lazy(() => import('@/app/(admin)/pages/newsletters/page'))

// User Management
const UserManagement = lazy(() => import('@/app/(admin)/users/page'))
const UserDetails = lazy(() => import('@/app/(admin)/users/[userId]/page'))
const ChangePassword = lazy(() => import('@/app/(admin)/auth/change-password/page'))

// Auth & Error Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-pass/page'))
const NotFound = lazy(() => import('@/app/(other)/(error-pages)/error-404/page'))

const initialRoutes = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/dashboard" />,
  },
  {
    path: '*',
    name: 'not-found',
    element: <NotFound />,
  },
]

// All valid access types — used to gate entry into the admin layout
export const ALL_ACCESS_TYPES = ['event', 'admin', 'showroom', 'website', 'superadmin', 'sales', 'seo', 'custom']

// superadmin : all routes
// admin      : all routes except user creation
// website    : dashboard + website-related leads
// event      : dashboard + event leads + showroom leads

const generalRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: <Dashboard />,
    roles: ['admin', 'superadmin', 'event', 'showroom', 'website', 'sales', 'custom'],
    permissions: ['dashboard.view'],
  },
  {
    path: '/dashboard/analytics',
    name: 'Dashboard Redirect',
    element: <Navigate to="/dashboard" />,
  },
]

const appsRoutes = [
  {
    name: 'Order Details',
    path: '/ecommerce/orders/:orderId',
    element: <OrderDetails />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Order Management',
    path: '/ecommerce/orders',
    element: <OrderManagement />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Confirmed Paid Orders',
    path: '/ecommerce/orders/confirmed',
    element: <OrderManagement pageTitle="Confirmed Paid Orders" fixedFilters={{ status: 'confirmed', paymentStatus: 'paid' }} />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Failed Orders',
    path: '/ecommerce/orders/failed',
    element: <OrderManagement pageTitle="Failed Orders" fixedFilters={{ view: 'failed' }} />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Past Order Lookup',
    path: '/ecommerce/orders/lookup',
    element: <OrderManagement pageTitle="Past Order Lookup" lookupMode />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Coupon Management',
    path: '/ecommerce/coupons',
    element: <CouponManagement />,
    roles: ['admin', 'superadmin'],
    permissions: ['products.manage'],
  },
  {
    name: 'Product Details',
    path: '/ecommerce/products/:productId',
    element: <EcommerceProductDetails />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['products.manage'],
  },
  {
    name: 'Create Product',
    path: '/ecommerce/products/create',
    element: <EcommerceProductCreate />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['products.manage'],
  },
  {
    name: 'Edit Product',
    path: '/ecommerce/products/:productId/edit',
    element: <EcommerceProductEdit />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['products.manage'],
  },
  {
    name: 'Inventory',
    path: '/ecommerce/inventory',
    element: <EcommerceInventory />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['products.manage'],
  },
  {
    name: 'Categories',
    path: '/ecommerce/categories',
    element: <EcommerceCategories />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['products.manage'],
  },
]

const customRoutes = [
  {
    name: 'Blogs',
    path: '/blogs',
    element: <Blogs />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'Blog Create',
    path: '/blogs/create',
    element: <BlogCreate />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'Blog Categories',
    path: '/blogs/categories',
    element: <BlogTaxonomy type="category" />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'Blog Tags',
    path: '/blogs/tags',
    element: <BlogTaxonomy type="tag" />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'Blog Detail',
    path: '/blogs/:blogId',
    element: <BlogDetail />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'Blog Edit',
    path: '/blogs/:blogId/edit',
    element: <BlogEdit />,
    roles: ['admin', 'superadmin', 'custom'],
    permissions: ['blogs.manage'],
  },
  {
    name: 'SEO Meta List',
    path: '/seo-meta',
    element: <SeoMetaList />,
    roles: ['admin', 'superadmin'],
    permissions: ['seoMeta.manage'],
  },
  {
    name: 'SEO Meta Create',
    path: '/seo-meta/create',
    element: <SeoMetaCreate />,
    roles: ['admin', 'superadmin'],
    permissions: ['seoMeta.manage'],
  },
  {
    name: 'SEO Meta Detail',
    path: '/seo-meta/:seoId',
    element: <SeoMetaDetail />,
    roles: ['admin', 'superadmin'],
    permissions: ['seoMeta.manage'],
  },
  {
    name: 'SEO Meta Edit',
    path: '/seo-meta/:seoId/edit',
    element: <SeoMetaEdit />,
    roles: ['admin', 'superadmin'],
    permissions: ['seoMeta.manage'],
  },
  {
    name: 'Landing Page',
    path: '/landing-page',
    element: <Navigate to="/landing-page/hero-slides" replace />,
    roles: ['admin', 'superadmin', 'website'],
    permissions: ['landingPage.manage'],
  },
  {
    name: 'Landing Page Section',
    path: '/landing-page/:sectionSlug',
    element: <LandingPage />,
    roles: ['admin', 'superadmin', 'website'],
    permissions: ['landingPage.manage'],
  },
  {
    name: 'Leads',
    path: '/showroom-leads',
    element: <ShowroomLeads />,
    roles: ['admin', 'superadmin', 'event'],
    permissions: ['showroomLeads.manage'],
  },
  {
    name: 'Add Showroom Enquiry',
    path: '/showroom-leads/add',
    element: <AddShowroomLead />,
    roles: ['admin', 'superadmin', 'event'],
    permissions: ['showroomLeads.manage'],
  },
  {
    name: 'Website Leads',
    path: '/pages/website-leads',
    element: <WebsiteLeads />,
    roles: ['admin', 'superadmin', 'website', 'sales'],
    permissions: ['websiteLeads.manage'],
  },
  {
    name: 'Newsletters',
    path: '/pages/newsletters',
    element: <Newsletters />,
    roles: ['admin', 'superadmin', 'website', 'sales'],
    permissions: ['newsletterSubscribers.view'],
  },
  {
    name: 'Events Enquiry',
    path: '/pages/event-leads/:eventSlug',
    element: <EventLeads />,
    roles: ['admin', 'superadmin', 'event'],
    permissions: ['eventLeads.view'],
  },
  {
    name: 'Dubaiwood Show Enquiry',
    path: '/pages/dubaiwood-leads',
    element: <DubaiwoodLeads />,
    roles: ['admin', 'superadmin', 'event', 'custom'],
    permissions: ['dubaiwoodLeads.view'],
  },
]

export const authRoutes = [
  {
    path: '/auth/setup-admin',
    name: 'Setup Admin',
    element: <AuthSignUp />,
  },
  {
    path: '/auth/sign-in',
    name: 'Sign In',
    element: <AuthSignIn />,
  },
  {
    name: 'Reset Password',
    path: '/auth/reset-pass',
    element: <ResetPassword />,
  },
  {
    name: '404 Error',
    path: '/error-404',
    element: <NotFound />,
  },
]

export const appRoutes = [
  ...initialRoutes,
  ...generalRoutes,
  ...appsRoutes,
  ...customRoutes,
  // User management — admin users only
  {
    name: 'User Management',
    path: '/users',
    element: <UserManagement />,
    roles: ['admin', 'superadmin'],
    permissions: ['users.manage'],
  },
  {
    name: 'User Details',
    path: '/users/:userId',
    element: <UserDetails />,
    roles: ['admin', 'superadmin'],
    permissions: ['users.manage'],
  },
  {
    name: 'Create User',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
    roles: ['admin', 'superadmin'],
    permissions: ['users.manage'],
  },
  {
    name: 'Change Password',
    path: '/auth/change-password',
    element: <ChangePassword />,
    roles: ALL_ACCESS_TYPES,
  },
  ...authRoutes,
]

// Public routes — no auth, no admin layout
export const publicRoutes = [
  {
    name: 'Showroom Lead Form',
    path: '/showroom-lead',
    element: <ShowroomLeadForm />,
  },
  {
    name: 'Event Lead Form',
    path: '/event-lead/:eventSlug',
    element: <EventLeadForm />,
  },
  {
    name: 'Dubaiwood Lead Form',
    path: '/dubaiwood-lead',
    element: <DubaiwoodLeadForm />,
  },
  {
    name: 'Thank You',
    path: '/thank-you',
    element: <ThankYou />,
  },
]
