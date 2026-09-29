import * as React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { supabase } from "../lib/supabase_api";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState(''); 
  const open = Boolean(anchorEl);


    useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Option A: if you store the name in auth metadata
        setUsername(user.user_metadata?.full_name ||"guest");

        // Option B: if you have a separate 'profiles' table
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data) setUsername(data.full_name || "guest");
      }
    };

    getUser();
  }, []);
  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || "no email"); // 👈 email is directly on user, not metadata

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (data) {
        setUsername(data.full_name || user.user_metadata?.full_name || "guest");
        setEmail(data.email || user.email || "no email");
      }
    }
  };

  getUser();
}, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <Avatar sx={{ width: 32, height: 32 }} >
              {username ? username[0].toUpperCase() : '?'}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Avatar /> 
          <Link to="/profile" className="flex flex-col gap-1">
             {username ? username : '?'}
             {email ? <div style={{ fontSize: '0.8em', color: 'gray' }}>{email}</div> : 'no email'}
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          <Link to="/auth/signup"> Login with another account</Link>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <Link to="/settings">Settings</Link>
        </MenuItem>
       <MenuItem 
  onClick={handleClose} 
  sx={{ 
    backgroundColor: '#fca5a5',
    color:"red",
    '&:hover': { backgroundColor: '#f87171' ,color:"white"}  // 👈 fix
  }}
>
          <ListItemIcon sx={{ 
    color:"red",
    '&:hover': { color:"white"}  // 👈 fix
  }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <button onClick={() => supabase.auth.signOut()}><Link to="/auth/singin" >Logout</Link></button>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
