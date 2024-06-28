import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from './../../features/dashboardSlice/dashboardSlice';
import { Container, Row, Spinner } from 'react-bootstrap';
import  Card  from 'react-bootstrap/Card';
import  Button  from 'react-bootstrap/Button';
import Placeholder from 'react-bootstrap/Placeholder';
 import './Dashboard.css';
const Dashboard = ({ startDate, endDate }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                                <Spinner animation="grow" />
                              </div>;
  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div>Error: {error}</div></div>;

  return (
    <Container className='content'>
     <Row style={{ display: 'flex', flexWrap: 'wrap' }}>
        {data && data.map((item, index) => (
          <div key={index} className="col-6 col-sm-3 col-md-3 col-lg-3 col-xl-2" style={{ marginBottom: '20px' }}>
            <Card style={{ width: 'auto', padding: '10px' }}>
              <Card.Img variant="top" src="https://www.h24info.ma/wp-content/uploads/2022/09/gendarmerie2022.jpg" />
              <Card.Body>
                <Card.Title>{item.name || 'Card Title'}</Card.Title>
                <Placeholder as="p" animation="glow">
                  {item.description || 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'}
                </Placeholder>
                <Card.Text>
                  {item.description || 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'}
                </Card.Text>
                <Button variant="primary">Go somewhere</Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Row>

    </Container>
  );
};

export default Dashboard;
