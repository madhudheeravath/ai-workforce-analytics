// Role definitions and permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR: 'hr',
  MANAGER: 'manager',
  LND: 'lnd',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role display names
export const ROLE_NAMES: Record<Role, string> = {
  super_admin: 'Super Admin',
  hr: 'HR Manager',
  manager: 'Department Manager',
  lnd: 'L&D Specialist',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: 'Full system access with user management and system configuration',
  hr: 'View sentiment, training, and workforce analytics',
  manager: 'View team metrics, performance, and reports',
  lnd: 'Manage training programs and view learning analytics',
};

// Permissions by role
export const ROLE_PERMISSIONS = {
  super_admin: {
    // Admin-only permissions
    manageUsers: true,
    manageRoles: true,
    uploadData: true,
    viewLogs: true,
    systemConfig: true,
    databaseHealth: true,
    // All user permissions
    viewDashboard: true,
    viewSentiment: true,
    viewTraining: true,
    viewOrgMaturity: true,
    viewReports: true,
    exportData: true,
  },
  hr: {
    // HR permissions
    viewDashboard: true,
    viewSentiment: true,
    viewTraining: true,
    viewOrgMaturity: true,
    viewReports: true,
    exportData: true,
    viewAllDepartments: true,
  },
  manager: {
    // Manager permissions
    viewDashboard: true,
    viewSentiment: true,
    viewTraining: true,
    viewReports: true,
    viewTeamMetrics: true,
    viewDepartmentOnly: true,
    exportData: true,
    notifyHR: true,
    flagEmployees: true,
  },
  lnd: {
    // L&D permissions
    viewDashboard: true,
    viewTraining: true,
    viewReports: true,
    manageTraining: true,
    viewTrainingAnalytics: true,
    exportData: true,
    viewSkillReadiness: true,
    viewTrainingImpact: true,
    identifyTrainingNeeds: true,
    sendRecommendations: true,
    generateReports: true,
    createLearningPaths: true,
  },
};

// Check if user has permission
export function hasPermission(role: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || {};
  return permissions[permission as keyof typeof permissions] || false;
}

// Get accessible routes for a role
export function getAccessibleRoutes(role: Role): string[] {
  const permissions = ROLE_PERMISSIONS[role];
  const routes: string[] = [];

  if (permissions.viewDashboard) routes.push('/dashboard');
  if ('viewSentiment' in permissions && permissions.viewSentiment) routes.push('/dashboard/sentiment');
  if ('viewTraining' in permissions && permissions.viewTraining) routes.push('/dashboard/training');
  if ('viewOrgMaturity' in permissions && permissions.viewOrgMaturity) routes.push('/dashboard/org');
  if (permissions.viewReports) routes.push('/dashboard/reports');
  
  // Manager-specific routes
  if (role === ROLES.MANAGER) {
    routes.push('/dashboard/team');
    routes.push('/dashboard/team/sentiment');
    routes.push('/dashboard/team/productivity');
    routes.push('/dashboard/team/training');
  }
  
  // L&D-specific routes
  if (role === ROLES.LND) {
    routes.push('/dashboard/lnd');
    routes.push('/dashboard/lnd/skill-readiness');
    routes.push('/dashboard/lnd/training-impact');
    routes.push('/dashboard/lnd/training-needs');
    routes.push('/dashboard/lnd/recommendations');
  }
  
  // Admin routes
  if (role === ROLES.SUPER_ADMIN) {
    routes.push('/admin');
    routes.push('/admin/users');
    routes.push('/admin/data');
    routes.push('/admin/logs');
    routes.push('/admin/settings');
  }

  return routes;
}

// Get default route for a role
export function getDefaultRoute(role: Role): string {
  if (role === ROLES.SUPER_ADMIN) return '/admin';
  return '/dashboard';
}

// Role-based dashboard customization
export const ROLE_DASHBOARD_CONFIG = {
  super_admin: {
    title: 'System Administration',
    subtitle: 'Manage users, data, and system configuration',
    primaryColor: 'red',
  },
  hr: {
    title: 'HR Analytics Dashboard',
    subtitle: 'Workforce sentiment and training insights',
    primaryColor: 'blue',
  },
  manager: {
    title: 'Team Performance Dashboard',
    subtitle: 'Track your team\'s productivity and adoption',
    primaryColor: 'green',
  },
  lnd: {
    title: 'Learning & Development Dashboard',
    subtitle: 'Training effectiveness and skill development',
    primaryColor: 'purple',
  },
};
