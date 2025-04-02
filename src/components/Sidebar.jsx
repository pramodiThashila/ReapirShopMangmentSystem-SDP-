import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Collapse, Toolbar, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [open, setOpen] = React.useState({ employees: false, jobs: false });

    const handleToggle = (section) => {
        setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    backgroundColor: '#003366',
                    color: '#fff',
                },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {/* Dashboard Link */}
                    <ListItem button component={Link} to="/dashboard">
                        <ListItemIcon>
                            <HomeIcon sx={{ color: '#fff' }} />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" sx={{ color: '#fff' }} />
                    </ListItem>

                    {/* Employees Section with Subtopics */}
                    <ListItem button onClick={() => handleToggle('employees')}>
                        <ListItemIcon>
                            <PersonIcon sx={{ color: '#fff' }} />
                        </ListItemIcon>
                        <ListItemText primary="Employees" sx={{ color: '#fff' }} />
                        {open.employees ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
                    </ListItem>
                    <Collapse in={open.employees} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem button component={Link} to="/employees/view" sx={{ pl: 4 }}>
                                <ListItemText primary="View Employees" sx={{ color: '#fff' }} />
                            </ListItem>
                            <ListItem button component={Link} to="/employees/add" sx={{ pl: 4 }}>
                                <ListItemText primary="Add Employee" sx={{ color: '#fff' }} />
                            </ListItem>
                        </List>
                    </Collapse>

                    {/* Jobs Section with Subtopics */}
                    <ListItem button onClick={() => handleToggle('jobs')}>
                        <ListItemIcon>
                            <AssignmentIcon sx={{ color: '#fff' }} />
                        </ListItemIcon>
                        <ListItemText primary="Jobs" sx={{ color: '#fff' }} />
                        {open.jobs ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore sx={{ color: '#fff' }} />}
                    </ListItem>
                    <Collapse in={open.jobs} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem button component={Link} to="/jobs/register" sx={{ pl: 4 }}>
                                <ListItemText primary="Register Job" sx={{ color: '#fff' }} />
                            </ListItem>
                            <ListItem button component={Link} to="/jobs/view" sx={{ pl: 4 }}>
                                <ListItemText primary="View Jobs" sx={{ color: '#fff' }} />
                            </ListItem>
                        </List>
                    </Collapse>
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;