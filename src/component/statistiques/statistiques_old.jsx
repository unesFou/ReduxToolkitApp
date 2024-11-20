import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Container from '@mui/material/Container';
//import CircularProgress from '@mui/material/CircularProgress';
import { Spinner } from 'react-bootstrap';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import './statistiques.css';

const ExpandableRow = ({ id, isExpanded, handleExpandClick }) => {
  return (
    <IconButton
      aria-label="expand row"
      size="small"
      onClick={() => handleExpandClick(id)}
    >
      {isExpanded ? <KeyboardArrowUpIcon style={{ color: 'green' }} /> : <KeyboardArrowDownIcon style={{ color: 'red' }} />}
    </IconButton>
  );
};

const Statistiques = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  const handleExpandClick = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Button variant="primary" disabled>
        <Spinner
          as="span"
          animation="grow"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        Loading...
      </Button>
      </div>
    );

  if (error)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div>Error: {error}</div>
      </div>
    );

  const rows = data
    ? data.reduce((acc, item, index) => {
        acc.push({ id: index, name: item.name, isParent: true, level: 0 });
        if (expandedRows.includes(index)) {
          item.childs.forEach((child, childIndex) => {
            acc.push({
              id: `${index}-${childIndex}`,
              name: '',
              company: child.name,
              brigade: '',
              isChild: true,
              level: 1,
            });
            // Add nested children if any
            if (child.childs && expandedRows.includes(`${index}-${childIndex}`)) {
              child.childs.forEach((subChild, subChildIndex) => {
                acc.push({
                  id: `${index}-${childIndex}-${subChildIndex}`,
                  name: '',
                  company: '',
                  brigade: subChild.name,
                  isChild: true,
                  level: 2,
                });
              });
            }
          });
        }
        return acc;
      }, [])
    : [];

  const columns = [
    {
      field: 'expand',
      headerName: '',
      width: 50,
      renderCell: (params) => {
        if (params.row.isParent) {
          return (
            <ExpandableRow
              id={params.row.id}
              isExpanded={expandedRows.includes(params.row.id)}
              handleExpandClick={handleExpandClick}
            />
          );
        }
        return null;
      },
    },
    {
      field: 'name',
      headerName: 'Région',
      width: 150,
      renderCell: (params) => {
        if (params.row.level === 0) return params.value;
        return null;
      },
    },
    {
      field: 'company',
      headerName: 'Companie',
      width: 300,
      renderCell: (params) => {
          if (params.row.level === 1) {
            return (
              <>
                <ExpandableRow
                  id={params.row.id}
                  isExpanded={expandedRows.includes(params.row.id)}
                  handleExpandClick={handleExpandClick}
                />
                {params.value}
              </>
            );
          }
          return params.value;
        },
      },
    {
      field: 'brigade',
      headerName: 'Brigade',
      width: 150,
      renderCell: (params) => {
        if (params.row.level === 2) return params.value;
        return null;
      },
    },
  ];

  return (
    <Container className="content" style={{ flexGrow: 4, paddingLeft: '0%', paddingTop: '9%' }}>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid

          columns={columns}
          getRowId={(row) => row.id}
          pageSize={5}
          getRowClassName={(params) =>
            params.row.isChild ? 'child-row' : ''
          }
          slots={{
            toolbar: GridToolbar,
          }}
        />
      </Box>
    </Container>
  );
};

export default Statistiques;
