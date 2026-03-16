import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  alpha,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Stack,
  Button,
  Tooltip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuthStore } from '../stores'
import { useUiStore } from '../stores'

const DRAWER_WIDTH = 260
const DRAWER_WIDTH_MINI = 72

const navItems = [
  { to: '/admin', label: 'Admin', icon: <AdminPanelSettingsIcon />, role: 'admin' as const },
  { to: '/officer', label: 'Officer', icon: <PersonIcon />, role: 'officer' as const },
]

export function MainLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const { name, role, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  const open = !sidebarCollapsed && !isMobile

  const filteredNav = navItems.filter((item) => item.role === role)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: 2,
          minHeight: 64,
        }}
      >
        {open && (
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>
              EduQueue
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Queue Management
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={toggleSidebar}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {filteredNav.map(({ to, label, icon }) => {
          const isActive =
            location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Tooltip key={to} title={!open ? label : ''} placement="right" arrow>
              <ListItemButton
                component={NavLink}
                to={to}
                sx={{
                  justifyContent: open ? 'flex-start' : 'center',
                  px: open ? 2 : 1.5,
                  py: 1.5,
                  mb: 0.5,
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 0,
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        {open ? (
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                }}
              >
                {name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                  {role}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              fullWidth
              sx={{ color: 'text.secondary', borderColor: 'divider' }}
            >
              Logout
            </Button>
          </Stack>
        ) : (
          <Tooltip title="Logout" placement="right" arrow>
            <IconButton onClick={handleLogout} size="small" sx={{ mx: 'auto', display: 'flex' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  )

  // Mobile bottom nav
  if (isMobile) {
    const currentNavIndex = filteredNav.findIndex(
      (item) =>
        location.pathname === item.to ||
        (item.to !== '/' && location.pathname.startsWith(item.to))
    )

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            pb: 7,
          }}
        >
          <Outlet />
        </Box>
        <BottomNavigation
          value={currentNavIndex >= 0 ? currentNavIndex : false}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: theme.zIndex.appBar,
            height: 64,
          }}
        >
          {filteredNav.map(({ to, label, icon }) => (
            <BottomNavigationAction
              key={to}
              label={label}
              icon={icon}
              onClick={() => navigate(to)}
              sx={{ '&.Mui-selected': { color: 'primary.main' } }}
            />
          ))}
          <BottomNavigationAction
            label="Logout"
            icon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ color: 'text.secondary' }}
          />
        </BottomNavigation>
      </Box>
    )
  }

  // Desktop sidebar
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_MINI,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : DRAWER_WIDTH_MINI,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shorter,
            }),
            overflowX: 'hidden',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
