import React from 'react';
import { AppBar, Toolbar, Button, Menu, MenuItem, Box, Grow } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link } from 'react-router-dom';

const TopBar = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [menuType, setMenuType] = React.useState(null);

    const handleMenuOpen = (event, type) => {
        setAnchorEl(event.currentTarget);
        setMenuType(type);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuType(null);
    };

    return (
        <AppBar position="fixed" sx={{ backgroundColor: '#003366', zIndex: 1201 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                {/* Dashboard Button */}
                <Button
                    component={Link}
                    to="/dashboard"
                    color="inherit"
                    startIcon={<HomeIcon />}
                    sx={{ color: '#fff', textTransform: 'none' }}
                >
                    Dashboard
                </Button>

                {/* Employees Dropdown */}
                <Box
                    onMouseEnter={(e) => handleMenuOpen(e, 'employees')}
                    onMouseLeave={handleMenuClose}
                >
                    <Button
                        color="inherit"
                        startIcon={<PersonIcon />}
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Employees
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuType === 'employees'}
                        onClose={handleMenuClose}
                        TransitionComponent={Grow} // Smooth transition
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem component={Link} to="/employees" onClick={handleMenuClose}>
                            View Employees
                        </MenuItem>
                        <MenuItem component={Link} to="/employees/register" onClick={handleMenuClose}>
                            Add Employee
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Jobs Dropdown */}
                <Box
                    onMouseEnter={(e) => handleMenuOpen(e, 'jobs')}
                    onMouseLeave={handleMenuClose}
                >
                    <Button
                        color="inherit"
                        startIcon={<AssignmentIcon />}
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Jobs
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuType === 'jobs'}
                        onClose={handleMenuClose}
                        TransitionComponent={Grow} // Smooth transition
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem component={Link} to="/customerAndJob/register" onClick={handleMenuClose}>
                            Register Job
                        </MenuItem>
                        <MenuItem component={Link} to="/jobs/view" onClick={handleMenuClose}>
                            View Jobs
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Customer Dropdown */}
                <Box
                    onMouseEnter={(e) => handleMenuOpen(e, 'customers')}
                    onMouseLeave={handleMenuClose}
                >
                    <Button
                        color="inherit"
                        startIcon={<PersonIcon />}
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Customer Details
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuType === 'customers'}
                        onClose={handleMenuClose}
                        TransitionComponent={Grow} // Smooth transition
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem component={Link} to="/customer/view" onClick={handleMenuClose}>
                            View Customers
                        </MenuItem>
                        <MenuItem component={Link} to="/customerAndJob/register" onClick={handleMenuClose}>
                            Add Customer And Job
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Inventory Dropdown */}
                <Box
                    onMouseEnter={(e) => handleMenuOpen(e, 'inventory')}
                    onMouseLeave={handleMenuClose}
                >
                    <Button
                        color="inherit"
                        startIcon={<PersonIcon />}
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Inventory
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuType === 'inventory'}
                        onClose={handleMenuClose}
                        TransitionComponent={Grow} // Smooth transition
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem component={Link} to="/inventory/view" onClick={handleMenuClose}>
                            View Inventory
                        </MenuItem>
                        <MenuItem component={Link} to="/inventoryItem/add" onClick={handleMenuClose}>
                            Add New Inventory Item
                        </MenuItem>
                        <MenuItem component={Link} to="/inventoryItemBatch/add" onClick={handleMenuClose}>
                            Add New Batch
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Supplier Dropdown */}
                <Box
                    onMouseEnter={(e) => handleMenuOpen(e, 'suppliers')}
                    onMouseLeave={handleMenuClose}
                >
                    <Button
                        color="inherit"
                        startIcon={<PersonIcon />}
                        sx={{ color: '#fff', textTransform: 'none' }}
                    >
                        Supplier Details
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuType === 'suppliers'}
                        onClose={handleMenuClose}
                        TransitionComponent={Grow} // Smooth transition
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem component={Link} to="/supplier/view" onClick={handleMenuClose}>
                            View Suppliers
                        </MenuItem>
                        <MenuItem component={Link} to="/supplier/register" onClick={handleMenuClose}>
                            Add Supplier
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default TopBar;