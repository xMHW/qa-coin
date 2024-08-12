import React, {useState} from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

const classes = [
  { id: 1, name: 'Web3 KAIST', image: '/image/class1.png'}
]

const styles = {
  sidebar: {
    width: '80px',
    height: '100%',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 5px',
  },
  class: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    marginBottom: '10px',
    cursor: 'pointer',
    objectFit: 'cover',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  }
}

const Sidebar = () => {
  const theme = useTheme();
  const [selectedClass, setSelectedClass] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<number | 'add' | null>(null);

  return (
    <Box sx={{...styles.sidebar, boxShadow: theme.shadows[4]}}>
      {classes.map((classItem) => (
        <Tooltip key={classItem.id} title={hoveredItem === classItem.id ? classItem.name : ''} placement="right">
          <Box 
            component="img" 
            src={classItem.image} 
            alt={classItem.name} 
            sx={{...styles.class, border: selectedClass === classItem.id ? '3px solid #1976d2' : '3px solid transparent'}} 
            onClick={() => setSelectedClass(classItem.id)} 
            onMouseEnter={() => setHoveredItem(classItem.id)} 
            onMouseLeave={() => setHoveredItem(null)} 
          />
        </Tooltip>
      ))}
      <Tooltip title={hoveredItem === 'add' ? 'Add Class' : ''} placement="right">
        <IconButton 
          aria-label="Add new class"
          sx={{width: '60px', height: '60px', backgroundColor: '#e0e0e0', '&:hover': { backgroundColor: '#d0d0d0' }}} 
          onMouseEnter={() => setHoveredItem('add')} 
          onMouseLeave={() => setHoveredItem(null)}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default React.memo(Sidebar);